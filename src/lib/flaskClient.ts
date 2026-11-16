// ==============================================================================
// EDUSPHERE FLASK BACKEND CLIENT
// Communicates with Python Flask API at http://127.0.0.1:5000 / /api/py
// ==============================================================================

import { ClassNote, AttendanceRecord, StudentDoubt, DoubtAnswer } from '../types/supabase';

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_FLASK_API_URL ||
  (typeof window !== 'undefined' ? '/api/py' : 'http://127.0.0.1:5000/api');

export interface BackendHealth {
  status: string;
  supabaseConnected: boolean;
  supabaseUrl: string;
  port: number;
  services: string[];
}

export interface AttendanceStats {
  studentId: string;
  totalClasses: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
  isEligibleForExams: boolean;
  threshold: number;
  classesNeeded: number;
}

export interface CertificateRecord {
  id: string;
  student_id: string;
  student_name: string;
  course_code: string;
  course_title: string;
  score_percentage: number;
  grade: string;
  issued_by: string;
  issued_at: string;
  verification_hash: string;
  verified: boolean;
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  certificate?: CertificateRecord | null;
}

export interface CooperChatResponse {
  success: boolean;
  response: string;
  topic?: string;
  latexIncluded?: boolean;
  suggestedActions?: string[];
}

/**
 * Check if Python Flask backend is reachable and healthy
 */
export async function checkFlaskHealth(): Promise<BackendHealth | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch notes from Flask backend
 */
export async function fetchFlaskNotes(classId?: string, subject?: string): Promise<ClassNote[]> {
  try {
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId);
    if (subject) params.append('subject', subject);

    const res = await fetch(`${BACKEND_BASE}/notes?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.notes || [];
  } catch {
    return [];
  }
}

/**
 * Post a note through Flask backend
 */
export async function createFlaskNote(note: Omit<ClassNote, 'id' | 'createdAt'>): Promise<ClassNote | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.note;
  } catch {
    return null;
  }
}

/**
 * Upload an attachment file to Supabase Storage via Flask
 */
export async function uploadFlaskAttachment(file: File, classId: string): Promise<{ publicUrl: string; fileName: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('classId', classId);

    const res = await fetch(`${BACKEND_BASE}/notes/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch attendance stats and exam eligibility threshold from Flask backend
 */
export async function fetchFlaskAttendanceStats(studentId: string): Promise<AttendanceStats | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/attendance/stats/${encodeURIComponent(studentId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch doubts from Flask backend
 */
export async function fetchFlaskDoubts(status?: string, subject?: string): Promise<StudentDoubt[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (subject) params.append('subject', subject);

    const res = await fetch(`${BACKEND_BASE}/doubts?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.doubts || [];
  } catch {
    return [];
  }
}

/**
 * Submit assessment to Flask backend, compute score, and issue certificate if passed (>=75%)
 */
export async function submitFlaskQuizAssessment(submission: {
  userId: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  quizId: string;
  score: number;
  total: number;
  passingScore?: number;
}): Promise<QuizSubmissionResult | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/quizzes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * Conversational tutoring with Cooper AI via Flask backend
 */
export async function chatWithFlaskCooper(
  message: string,
  userId = 'student-param',
  userName = 'Param Sahar'
): Promise<CooperChatResponse | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/cooper/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId, userName }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
