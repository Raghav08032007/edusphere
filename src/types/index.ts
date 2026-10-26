export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type UserRole = 'student' | 'staff';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  department?: string;
  avatar: string;
  xp?: number;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  dueDate: string;
  estimatedMinutes: number;
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
  assignedByStaff?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  lastReviewed?: string;
  masteryLevel: 'new' | 'learning' | 'mastered';
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  description: string;
  cards: Flashcard[];
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface DailyStudyLog {
  day: string;
  hours: number;
  tasksCompleted: number;
}

export interface StudentPerformanceRecord {
  id: string;
  name: string;
  regNumber: string;
  batch: string;
  studyHours: number;
  tasksCompleted: number;
  quizScore: number;
  attendanceRate: number;
  status: 'Distinction' | 'Good' | 'Needs Attention';
}

export interface StaffAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'High' | 'Important' | 'General';
}

export type SkillCategory = 'ai-ml' | 'systems' | 'algorithms' | 'bio-science';

export interface SkillNode {
  id: string;
  title: string;
  category: SkillCategory;
  categoryName: string;
  level: number;
  icon: string;
  description: string;
  prerequisiteIds: string[];
  xpRequired: number;
  currentXP: number;
  isUnlocked: boolean;
  masteryPercentage: number;
  badgeName: string;
  badgeIcon: string;
  syllabusTopics?: string[];
  diagnosticQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  certifiedByStaff?: {
    staffName: string;
    designation: string;
    certifiedAt: string;
    remarks: string;
  };
}

export interface SkillCertification {
  id: string;
  studentId: string;
  studentName: string;
  skillId: string;
  skillTitle: string;
  certifiedBy: string;
  designation: string;
  date: string;
  grade: 'A+' | 'A' | 'B+';
  feedback: string;
}
