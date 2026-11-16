// ==============================================================================
// COOPER AI ASSISTANT RUNTIME ENGINE
// Dispatches to Supabase Edge Function or executes scoped MCP tools locally
// ==============================================================================

import { UserProfile, ClassNote, AttendanceRecord, StudentDoubt } from '../types/supabase';
import { isLiveSupabaseConfigured } from './supabaseClient';
import { chatWithFlaskCooper } from './flaskClient';

export interface CooperAgentContext {
  currentUser: UserProfile;
  notes: ClassNote[];
  attendance: AttendanceRecord[];
  doubts: StudentDoubt[];
  onPostDoubt?: (doubt: Omit<StudentDoubt, 'id' | 'createdAt' | 'answers'>) => void;
}

export async function askCooper(
  userMessage: string,
  context: CooperAgentContext
): Promise<{
  reply: string;
  toolCalls?: Array<{ tool: string; summary: string; data?: unknown }>;
}> {
  const { currentUser, notes, attendance, doubts } = context;
  const lower = userMessage.toLowerCase();

  // If live Supabase Edge Function is configured and online, attempt call
  if (isLiveSupabaseConfigured && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cooper-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
          },
          body: JSON.stringify({ message: userMessage }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        return {
          reply: data.reply,
          toolCalls: data.executedTools?.map((t: { tool: string; result: unknown }) => ({
            tool: t.tool,
            summary: `Executed ${t.tool} via Supabase Edge Function`,
            data: t.result,
          })),
        };
      }
    } catch {
      // Fallback to local scoped MCP engine
    }
  }

  // Local Scoped MCP Tool Execution Engine (mirroring Edge Function)
  const toolCalls: Array<{ tool: string; summary: string; data?: unknown }> = [];

  // TOOL 1: get_user_attendance
  if (
    lower.includes('attendance') ||
    lower.includes('absent') ||
    lower.includes('present') ||
    lower.includes('percentage') ||
    lower.includes('bunk') ||
    lower.includes('missed')
  ) {
    const userAttendance = attendance.filter((a) => a.studentId === currentUser.id);
    const total = userAttendance.length;
    const present = userAttendance.filter((a) => a.status === 'present').length;
    const late = userAttendance.filter((a) => a.status === 'late').length;
    const absent = userAttendance.filter((a) => a.status === 'absent').length;
    const pct = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

    toolCalls.push({
      tool: 'get_user_attendance',
      summary: `Queried public.attendance for student_id="${currentUser.id}" (${pct}%)`,
      data: { total, present, late, absent, percentage: `${pct}%` },
    });

    return {
      toolCalls,
      reply: `Hi **${currentUser.fullName}**! I pulled your official attendance records using the **\`get_user_attendance\`** MCP tool:\n\n` +
        `📊 **Overall Attendance Rate:** **${pct}%**\n` +
        `• **Total Sessions Recorded:** ${total}\n` +
        `• **Present Days:** ${present} sessions\n` +
        `• **Late Sessions:** ${late} sessions (counted as 0.5)\n` +
        `• **Absent Days:** ${absent} sessions\n\n` +
        (pct >= 85
          ? `🏆 **Academic Standing: Safe & Distinction Zone.** You comfortably surpass the 75% institutional requirement.`
          : pct >= 75
          ? `⚠️ **Academic Standing: Satisfactory.** Maintain attendance in your next 3 classes to stay safely above 80%.`
          : `🚨 **Warning: Low Attendance.** Please schedule a consultation with Dr. K. Rajan or submit medical leaves.`),
    };
  }

  // TOOL 2: get_user_notes
  if (
    lower.includes('note') ||
    lower.includes('lecture') ||
    lower.includes('summary') ||
    lower.includes('material') ||
    lower.includes('syllabus') ||
    lower.includes('maxwell') ||
    lower.includes('attention') ||
    lower.includes('spectral')
  ) {
    let matchedNotes = notes;
    let filterSubject = 'All Subjects';

    if (lower.includes('physics') || lower.includes('maxwell') || lower.includes('em wave')) {
      matchedNotes = notes.filter((n) => n.subject.toLowerCase().includes('physics'));
      filterSubject = 'Physics';
    } else if (lower.includes('cs') || lower.includes('computer') || lower.includes('attention') || lower.includes('ai')) {
      matchedNotes = notes.filter((n) => n.subject.toLowerCase().includes('computer'));
      filterSubject = 'Computer Science';
    } else if (lower.includes('math') || lower.includes('calculus') || lower.includes('spectral')) {
      matchedNotes = notes.filter((n) => n.subject.toLowerCase().includes('math'));
      filterSubject = 'Mathematics';
    }

    toolCalls.push({
      tool: 'get_user_notes',
      summary: `Retrieved ${matchedNotes.length} notes scoped to student enrollment [Filter: ${filterSubject}]`,
      data: matchedNotes.map((n) => ({ id: n.id, title: n.title, subject: n.subject })),
    });

    if (matchedNotes.length === 0) {
      return {
        toolCalls,
        reply: `I searched the repository via **\`get_user_notes\`** but found no notes matching "${filterSubject}". Would you like me to explain the core concepts of this topic directly?`,
      };
    }

    const notesList = matchedNotes
      .map(
        (n, i) =>
          `**${i + 1}. ${n.title}**\n` +
          `   • *Subject:* ${n.subject} | *Faculty:* ${n.staffName || 'Faculty'}\n` +
          `   • *Preview:* ${n.content.slice(0, 160).replace(/[#*`$]/g, '')}...\n` +
          (n.attachmentName ? `   • 📎 *Attachment:* \`${n.attachmentName}\`\n` : '')
      )
      .join('\n');

    return {
      toolCalls,
      reply: `Here are the latest study notes retrieved from your classes:\n\n${notesList}\n` +
        `💡 *Tip: You can ask me to "Explain note #1" or solve any equation from these notes!*`,
    };
  }

  // TOOL 3: get_user_doubts
  if (lower.includes('doubt') || lower.includes('question') || lower.includes('ticket')) {
    const userDoubts = doubts.filter((d) => d.studentId === currentUser.id);

    toolCalls.push({
      tool: 'get_user_doubts',
      summary: `Retrieved ${userDoubts.length} doubts for student_id="${currentUser.id}"`,
      data: userDoubts.map((d) => ({ id: d.id, title: d.title, status: d.status })),
    });

    if (userDoubts.length === 0) {
      return {
        toolCalls,
        reply: `You currently have **0 active doubts** on file! If you are confused by any formula, lecture, or problem set, tell me what you need help with and I can explain it or submit a doubt ticket to your teacher.`,
      };
    }

    const doubtsList = userDoubts
      .map(
        (d, i) =>
          `**${i + 1}. ${d.title}** [${d.subject}]\n` +
          `   • *Status:* **${d.status.toUpperCase()}** (${d.answers.length} faculty answers)\n` +
          (d.answers[0]
            ? `   • *Latest Answer from ${d.answers[0].authorName}:* "${d.answers[0].answerText.slice(0, 120)}..."\n`
            : '   • *Awaiting faculty response*\n')
      )
      .join('\n');

    return {
      toolCalls,
      reply: `Here are your registered doubts from the **Doubts Hub**:\n\n${doubtsList}\n` +
        `Would you like me to clarify any of these answers or help you draft a new question?`,
    };
  }

  // Attempt Gemini-powered Academic Tutoring via Flask Backend
  try {
    const flaskCooperRes = await chatWithFlaskCooper(userMessage, currentUser.id, currentUser.fullName);
    if (flaskCooperRes?.success && flaskCooperRes.response) {
      toolCalls.push({
        tool: 'cooper_gemini_academic_tutor',
        summary: `Synthesized pedagogical derivation via Google Gemini API${flaskCooperRes.topic ? ` [${flaskCooperRes.topic}]` : ''}`,
      });
      return {
        reply: flaskCooperRes.response,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    }
  } catch {
    // Continue to offline fallback
  }

  // CONCEPTUAL EXPLANATIONS & ACADEMIC HELP
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('how does') || lower.includes('why')) {
    return {
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      reply: `### Academic Concept Breakdown from Cooper\n\n` +
        `You asked: *"${userMessage}"*\n\n` +
        `Here is a concise, exam-ready explanation:\n\n` +
        `1. **Core Principle**: In advanced STEM disciplines, complex phenomena are broken down into foundational boundary conditions and conservation laws.\n` +
        `2. **Mathematical Formulation**: Ensure you state the governing equations explicitly before substituting numerical coordinates.\n` +
        `3. **Key Intuition**: Always check limiting cases (e.g. $t \\to 0$, $r \\to \\infty$, or $d_k \\to 1$) to verify dimensional consistency.\n\n` +
        `Would you like me to pull the relevant lecture note or post this as an official doubt to your faculty?`,
    };
  }

  // DEFAULT CONVERSATIONAL GREETING & CAPABILITIES
  return {
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    reply: `Hi **${currentUser.fullName}**! I'm **Cooper**, your AI Academic Tutor on Edusphere.\n\n` +
      `Here is what I can do for you right now using live **Academic MCP tools**:\n` +
      `• 📊 **Check Attendance**: Ask *"What is my attendance percentage?"*\n` +
      `• 📚 **Retrieve Class Notes**: Ask *"Show me notes for Physics or AI"*\n` +
      `• ❓ **Review Doubts**: Ask *"Show my doubts and teacher answers"*\n` +
      `• 💡 **Deep Explanations**: Ask me to explain any equation, algorithm, or concept!\n\n` +
      `What would you like to explore today?`,
  };
}
