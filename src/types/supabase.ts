// ==============================================================================
// TYPES FOR STUDYPILOT SUPABASE & COOPER PLATFORM
// ==============================================================================

export type UserRole = 'staff' | 'student';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type DoubtStatus = 'unresolved' | 'answered' | 'resolved';
export type DoubtPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  regNumber?: string;
  department?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
}

export interface AcademicClass {
  id: string;
  code: string;
  name: string;
  subject: string;
  description?: string;
  staffId: string;
  staffName?: string;
  studentCount?: number;
  academicYear?: string;
}

export interface ClassNote {
  id: string;
  classId: string;
  className?: string;
  staffId: string;
  staffName?: string;
  title: string;
  subject: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className?: string;
  studentId: string;
  studentName?: string;
  studentReg?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  totalClasses: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  percentage: number;
  statusStanding: 'distinction' | 'safe' | 'warning' | 'critical';
}

export interface DoubtAnswer {
  id: string;
  doubtId: string;
  authorId: string;
  authorName: string;
  authorRole: 'staff' | 'student' | 'cooper_ai';
  answerText: string;
  isOfficialStaffAnswer: boolean;
  createdAt: string;
}

export interface StudentDoubt {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  subject: string;
  title: string;
  description: string;
  priority: DoubtPriority;
  status: DoubtStatus;
  tags: string[];
  answers: DoubtAnswer[];
  createdAt: string;
  updatedAt?: string;
}

export interface CooperChatMessage {
  id: string;
  sender: 'user' | 'cooper' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: Array<{
    tool: string;
    summary: string;
    data?: unknown;
  }>;
}
