// ==============================================================================
// COOPER MCP SERVER: MODEL CONTEXT PROTOCOL SERVER
// Exposes tools for Notes, Attendance, and Doubts scoped to logged-in user
// Compatible with Antigravity IDE, Cursor, Claude Desktop, and LLM Agent tool-calls
// ==============================================================================

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

// Environment Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "your-anon-key";

// MCP JSON-RPC Types
interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// MCP Tools Registry
const TOOLS = [
  {
    name: "get_user_notes",
    description: "Search and retrieve class study notes uploaded by staff for the authenticated student's enrolled classes.",
    inputSchema: {
      type: "object",
      properties: {
        userToken: { type: "string", description: "Supabase JWT Auth Token of logged-in user" },
        subject: { type: "string", description: "Filter by subject name (e.g. 'Physics', 'Mathematics')" },
        searchQuery: { type: "string", description: "Search query across titles and note content" },
        limit: { type: "number", description: "Max results to return (default: 10)" },
      },
      required: ["userToken"],
    },
  },
  {
    name: "get_user_attendance",
    description: "Retrieve comprehensive attendance history and statistics scoped strictly to the authenticated student.",
    inputSchema: {
      type: "object",
      properties: {
        userToken: { type: "string", description: "Supabase JWT Auth Token of logged-in user" },
        startDate: { type: "string", description: "Optional ISO start date filter (YYYY-MM-DD)" },
        limit: { type: "number", description: "Max attendance records to return (default: 30)" },
      },
      required: ["userToken"],
    },
  },
  {
    name: "get_user_doubts",
    description: "Retrieve all doubts posted by the student, along with answers provided by faculty staff and Cooper AI.",
    inputSchema: {
      type: "object",
      properties: {
        userToken: { type: "string", description: "Supabase JWT Auth Token of logged-in user" },
        status: { type: "string", enum: ["all", "unresolved", "answered", "resolved"], description: "Status filter" },
      },
      required: ["userToken"],
    },
  },
  {
    name: "post_new_doubt",
    description: "Create and publish a new academic doubt ticket to the student's class faculty.",
    inputSchema: {
      type: "object",
      properties: {
        userToken: { type: "string", description: "Supabase JWT Auth Token of logged-in user" },
        subject: { type: "string", description: "Subject (e.g. Physics, Chemistry, Mathematics, CS)" },
        title: { type: "string", description: "Concise summary title" },
        description: { type: "string", description: "Detailed description of the confusion or problem" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "Priority level" },
      },
      required: ["userToken", "subject", "title", "description"],
    },
  },
  {
    name: "staff_answer_doubt",
    description: "Staff-only tool to answer an open student doubt ticket and optionally mark it as resolved.",
    inputSchema: {
      type: "object",
      properties: {
        userToken: { type: "string", description: "Supabase JWT Auth Token of logged-in staff member" },
        doubtId: { type: "string", description: "UUID of the doubt to answer" },
        answerText: { type: "string", description: "Comprehensive solution and explanation" },
        markResolved: { type: "boolean", description: "Whether to update status to 'resolved'" },
      },
      required: ["userToken", "doubtId", "answerText"],
    },
  },
];

// Helper to get user-scoped client
function getScopedClient(jwtToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  });
}

// Tool Implementation Dispatcher
async function handleCallTool(name: string, args: Record<string, unknown>) {
  const token = String(args.userToken || "");
  if (!token) {
    throw new Error("Missing required 'userToken' parameter for authentication scoping.");
  }

  const supabase = getScopedClient(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error(`Authentication failure: ${authErr?.message || "Invalid or expired userToken"}`);
  }

  switch (name) {
    case "get_user_notes": {
      let query = supabase
        .from("notes")
        .select("id, class_id, title, subject, content, attachment_url, tags, created_at, classes(name, code)")
        .order("created_at", { ascending: false })
        .limit(Number(args.limit) || 10);

      if (args.subject) {
        query = query.ilike("subject", `%${args.subject}%`);
      }
      if (args.searchQuery) {
        query = query.or(`title.ilike.%${args.searchQuery}%,content.ilike.%${args.searchQuery}%`);
      }

      const { data: notes, error } = await query;
      if (error) throw new Error(error.message);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: notes?.length || 0, notes }, null, 2),
          },
        ],
      };
    }

    case "get_user_attendance": {
      let query = supabase
        .from("attendance")
        .select("id, date, status, remarks, classes(name, code, subject)")
        .eq("student_id", user.id)
        .order("date", { ascending: false })
        .limit(Number(args.limit) || 30);

      if (args.startDate) {
        query = query.gte("date", String(args.startDate));
      }

      const { data: records, error } = await query;
      if (error) throw new Error(error.message);

      const total = records?.length || 0;
      const present = records?.filter((r) => r.status === "present").length || 0;
      const late = records?.filter((r) => r.status === "late").length || 0;
      const absent = records?.filter((r) => r.status === "absent").length || 0;
      const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                studentId: user.id,
                metrics: {
                  totalClasses: total,
                  presentDays: present,
                  lateDays: late,
                  absentDays: absent,
                  percentage: `${percentage}%`,
                  statusBadge: percentage >= 85 ? "Excellent Standing" : "Requires Improvement",
                },
                recentRecords: records,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "get_user_doubts": {
      let query = supabase
        .from("doubts")
        .select("*, doubt_answers(*), classes(name, code)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (args.status && args.status !== "all") {
        query = query.eq("status", String(args.status));
      }

      const { data: doubts, error } = await query;
      if (error) throw new Error(error.message);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: doubts?.length || 0, doubts }, null, 2),
          },
        ],
      };
    }

    case "post_new_doubt": {
      // Find class enrollment for this student
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("class_id")
        .eq("student_id", user.id)
        .limit(1)
        .single();

      if (!enrollment?.class_id) {
        throw new Error("Cannot submit doubt: student is not enrolled in any active class.");
      }

      const { data: doubt, error } = await supabase
        .from("doubts")
        .insert({
          student_id: user.id,
          class_id: enrollment.class_id,
          subject: String(args.subject),
          title: String(args.title),
          description: String(args.description),
          priority: String(args.priority || "medium"),
          status: "unresolved",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, message: "Doubt submitted successfully", doubt }, null, 2),
          },
        ],
      };
    }

    case "staff_answer_doubt": {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "staff") {
        throw new Error("Unauthorized: Only verified faculty staff can post official answers.");
      }

      const { data: answer, error: ansError } = await supabase
        .from("doubt_answers")
        .insert({
          doubt_id: String(args.doubtId),
          author_id: user.id,
          author_name: profile.full_name,
          author_role: "staff",
          answer_text: String(args.answerText),
          is_official_staff_answer: true,
        })
        .select()
        .single();

      if (ansError) throw new Error(ansError.message);

      if (args.markResolved) {
        await supabase
          .from("doubts")
          .update({ status: "resolved" })
          .eq("id", String(args.doubtId));
      } else {
        await supabase
          .from("doubts")
          .update({ status: "answered" })
          .eq("id", String(args.doubtId));
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, answer }, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Tool not found: ${name}`);
  }
}

// Stdio JSON-RPC MCP Server Loop
export function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  process.stderr.write("Cooper MCP Server running on stdio...\n");

  rl.on("line", async (line) => {
    if (!line.trim()) return;

    let req: MCPRequest;
    try {
      req = JSON.parse(line);
    } catch {
      const errRes: MCPResponse = {
        jsonrpc: "2.0",
        id: null as unknown as string,
        error: { code: -32700, message: "Parse error" },
      };
      process.stdout.write(JSON.stringify(errRes) + "\n");
      return;
    }

    try {
      if (req.method === "initialize") {
        const res: MCPResponse = {
          jsonrpc: "2.0",
          id: req.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: {
              name: "cooper-academic-mcp-server",
              version: "1.0.0",
            },
          },
        };
        process.stdout.write(JSON.stringify(res) + "\n");
      } else if (req.method === "tools/list") {
        const res: MCPResponse = {
          jsonrpc: "2.0",
          id: req.id,
          result: { tools: TOOLS },
        };
        process.stdout.write(JSON.stringify(res) + "\n");
      } else if (req.method === "tools/call") {
        const params = req.params as { name: string; arguments?: Record<string, unknown> };
        const result = await handleCallTool(params.name, params.arguments || {});
        const res: MCPResponse = {
          jsonrpc: "2.0",
          id: req.id,
          result,
        };
        process.stdout.write(JSON.stringify(res) + "\n");
      } else {
        const res: MCPResponse = {
          jsonrpc: "2.0",
          id: req.id,
          error: { code: -32601, message: `Method not found: ${req.method}` },
        };
        process.stdout.write(JSON.stringify(res) + "\n");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const res: MCPResponse = {
        jsonrpc: "2.0",
        id: req.id,
        error: { code: -32000, message: msg },
      };
      process.stdout.write(JSON.stringify(res) + "\n");
    }
  });
}

// Auto-start when executed directly
if (require.main === module) {
  startMcpServer();
}
