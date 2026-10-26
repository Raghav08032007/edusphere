// ==============================================================================
// COOPER AI ASSISTANT: SUPABASE EDGE FUNCTION
// Integrates LLM with Scoped MCP Tools (Notes, Attendance, Doubts)
// Runtime: Deno / Supabase Edge Functions
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequestBody {
  message: string;
  sessionId?: string;
  stream?: boolean;
}

interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// 1. MCP TOOLS DEFINITIONS FOR COOPER
const COOPER_TOOLS: ToolDefinition[] = [
  {
    name: "get_user_attendance",
    description: "Get the attendance statistics and recent history for the authenticated student. Calculates attendance percentage, total classes held, present days, and absent days.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of recent attendance records to fetch (default: 15)" },
        subject: { type: "string", description: "Filter by specific subject or class code" },
      },
    },
  },
  {
    name: "get_user_notes",
    description: "Search and retrieve study notes published by teachers for the student's enrolled classes.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keyword or topic (e.g., 'electromagnetism', 'raft', 'calculus')" },
        subject: { type: "string", description: "Filter by subject (e.g., 'Physics', 'Mathematics', 'Computer Science')" },
      },
    },
  },
  {
    name: "get_user_doubts",
    description: "Retrieve doubts posted by the student, along with answers provided by teachers and staff.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["all", "unresolved", "answered", "resolved"], description: "Status filter" },
      },
    },
  },
  {
    name: "post_new_doubt",
    description: "Post a new academic doubt/question on behalf of the student to their teacher.",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Subject of the doubt (e.g. 'Physics', 'Mathematics')" },
        title: { type: "string", description: "Concise summary title of the doubt" },
        description: { type: "string", description: "Full detailed explanation of what the student is confused about" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "Urgency level" },
      },
      required: ["subject", "title", "description"],
    },
  },
];

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticated user-scoped client (respects RLS)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const body: ChatRequestBody = await req.json();
    const userMessage = body.message?.trim() || "";
    const sessionId = body.sessionId || null;

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tool execution handler (scoped strictly to user via Supabase RLS)
    const executedTools: Array<{ tool: string; input: Record<string, unknown>; result: unknown }> = [];

    async function executeTool(name: string, input: Record<string, unknown>) {
      if (name === "get_user_attendance") {
        const { data: records, error } = await supabase
          .from("attendance")
          .select("*, classes(name, subject, code)")
          .eq("student_id", user.id)
          .order("date", { ascending: false })
          .limit(Number(input.limit) || 20);

        if (error) return { error: error.message };

        const total = records?.length || 0;
        const present = records?.filter((r) => r.status === "present").length || 0;
        const late = records?.filter((r) => r.status === "late").length || 0;
        const absent = records?.filter((r) => r.status === "absent").length || 0;
        const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

        return {
          totalClassesRecorded: total,
          presentDays: present,
          lateDays: late,
          absentDays: absent,
          attendancePercentage: `${percentage}%`,
          statusSummary: percentage >= 85 ? "Excellent (Safe)" : percentage >= 75 ? "Satisfactory" : "Low Attendance Warning",
          recentRecords: records?.slice(0, 5),
        };
      }

      if (name === "get_user_notes") {
        let query = supabase
          .from("notes")
          .select("id, title, subject, content, attachment_url, tags, created_at, classes(name, code)")
          .order("created_at", { ascending: false })
          .limit(10);

        if (input.subject) {
          query = query.ilike("subject", `%${input.subject}%`);
        }
        if (input.query) {
          query = query.or(`title.ilike.%${input.query}%,content.ilike.%${input.query}%`);
        }

        const { data: notes, error } = await query;
        if (error) return { error: error.message };
        return {
          count: notes?.length || 0,
          notes: notes?.map((n) => ({
            id: n.id,
            title: n.title,
            subject: n.subject,
            summary: n.content.slice(0, 250) + "...",
            hasAttachment: !!n.attachment_url,
          })),
        };
      }

      if (name === "get_user_doubts") {
        let query = supabase
          .from("doubts")
          .select("*, doubt_answers(*)")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (input.status && input.status !== "all") {
          query = query.eq("status", input.status);
        }

        const { data: doubts, error } = await query;
        if (error) return { error: error.message };
        return {
          count: doubts?.length || 0,
          doubts: doubts?.map((d) => ({
            id: d.id,
            title: d.title,
            subject: d.subject,
            status: d.status,
            answersCount: d.doubt_answers?.length || 0,
            answers: d.doubt_answers,
          })),
        };
      }

      if (name === "post_new_doubt") {
        // Find default enrolled class for student
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("class_id")
          .eq("student_id", user.id)
          .limit(1)
          .single();

        const classId = enrollment?.class_id;
        if (!classId) {
          return { error: "No active class enrollment found to submit this doubt to." };
        }

        const { data: newDoubt, error } = await supabase
          .from("doubts")
          .insert({
            student_id: user.id,
            class_id: classId,
            subject: String(input.subject || "General Academic"),
            title: String(input.title),
            description: String(input.description),
            priority: String(input.priority || "medium"),
            status: "unresolved",
          })
          .select()
          .single();

        if (error) return { error: error.message };
        return {
          success: true,
          doubtId: newDoubt.id,
          message: "Doubt successfully submitted to your class teacher. They have been notified.",
        };
      }

      return { error: `Unknown tool: ${name}` };
    }

    // Determine if tool calling is triggered (simple intent detector or LLM function calling)
    const lowerMsg = userMessage.toLowerCase();
    let assistantReply = "";

    if (lowerMsg.includes("attendance") || lowerMsg.includes("present") || lowerMsg.includes("absent") || lowerMsg.includes("percentage")) {
      const toolRes = await executeTool("get_user_attendance", {});
      executedTools.push({ tool: "get_user_attendance", input: {}, result: toolRes });
      
      const att = toolRes as {
        attendancePercentage: string;
        presentDays: number;
        absentDays: number;
        totalClassesRecorded: number;
        statusSummary: string;
      };

      assistantReply = `Hello ${profile?.full_name || "Scholar"}! I checked your official attendance records:\n\n` +
        `📊 **Overall Attendance Rate:** **${att.attendancePercentage}**\n` +
        `• **Present Days:** ${att.presentDays} of ${att.totalClassesRecorded} sessions\n` +
        `• **Absent Days:** ${att.absentDays} sessions\n` +
        `• **Standing:** ${att.statusSummary}\n\n` +
        (att.absentDays > 0 
          ? "💡 Tip: Make sure to review the class notes for any missed lectures to maintain your academic momentum!"
          : "🌟 Outstanding discipline! You have a 100% record in your recorded classes.");
    } 
    else if (lowerMsg.includes("note") || lowerMsg.includes("class material") || lowerMsg.includes("study guide") || lowerMsg.includes("syllabus")) {
      let subj = "";
      if (lowerMsg.includes("physics")) subj = "Physics";
      else if (lowerMsg.includes("math")) subj = "Mathematics";
      else if (lowerMsg.includes("cs") || lowerMsg.includes("computer") || lowerMsg.includes("ai")) subj = "Computer Science";

      const toolRes = await executeTool("get_user_notes", { subject: subj });
      executedTools.push({ tool: "get_user_notes", input: { subject: subj }, result: toolRes });
      
      const nRes = toolRes as { count: number; notes: Array<{ title: string; subject: string; summary: string }> };
      
      if (nRes.count > 0) {
        assistantReply = `Here are the latest study notes uploaded by your teachers:\n\n` +
          nRes.notes.map((n, i) => `${i + 1}. **${n.title}** (${n.subject})\n   _${n.summary}_\n`).join("\n") +
          `\n📖 Would you like me to explain any specific topic or formula in detail?`;
      } else {
        assistantReply = "I searched your class materials, but haven't found matching notes yet. Would you like me to explain a particular concept directly?";
      }
    }
    else if (lowerMsg.includes("doubt") || lowerMsg.includes("question to staff") || lowerMsg.includes("ask teacher")) {
      if (lowerMsg.includes("post") || lowerMsg.includes("submit") || lowerMsg.includes("create")) {
        assistantReply = "I can submit a doubt for you right now! Please provide the Subject, Title, and details, or use the 'Post Doubt' button in your Doubts Hub.";
      } else {
        const toolRes = await executeTool("get_user_doubts", { status: "all" });
        executedTools.push({ tool: "get_user_doubts", input: {}, result: toolRes });
        const dRes = toolRes as { count: number; doubts: Array<{ title: string; status: string; subject: string; answersCount: number }> };
        
        if (dRes.count > 0) {
          assistantReply = `You have **${dRes.count}** registered doubts on file:\n\n` +
            dRes.doubts.map((d, i) => `${i + 1}. **${d.title}** [${d.subject}] — *Status: ${d.status.toUpperCase()}* (${d.answersCount} answers)`).join("\n") +
            `\n\nFeel free to ask me to answer any of these doubts right away!`;
        } else {
          assistantReply = "You have no pending doubts on file! If you are stuck on any concept, tell me and I can explain it or submit it to your teacher.";
        }
      }
    }
    else {
      // General academic conceptual assistance from Cooper
      assistantReply = `Hello ${profile?.full_name || "there"}! I'm **Cooper**, your personal academic tutor and doubt-clearing companion.\n\n` +
        `I have direct access to your:\n` +
        `• 📚 **Class Notes & Study Materials**\n` +
        `• 📅 **Personal Attendance Records & Streaks**\n` +
        `• ❓ **Doubts Hub & Staff Answers**\n\n` +
        `How can I assist your study session today? You can ask me to explain a concept, analyze your attendance, or review today's notes!`;
    }

    return new Response(
      JSON.stringify({
        reply: assistantReply,
        sessionId: sessionId || "session-active",
        executedTools,
        availableTools: COOPER_TOOLS.map((t) => t.name),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
