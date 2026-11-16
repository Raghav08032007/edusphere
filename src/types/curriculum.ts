// ==============================================================================
// EDUSPHERE CURRICULUM, COURSE, QUESTION BANK & ASSESSMENT TYPES
// Inspired by Coursera course structure and Vedantu interactive learning
// ==============================================================================

export type QuestionType = 'mcq_single' | 'mcq_multi' | 'true_false';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TopicNote {
  id: string;
  title: string;
  readingMinutes: number;
  content: string; // Structured Markdown with formulas and code
  keyTakeaways: string[];
  handoutName?: string;
  handoutUrl?: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  courseId: string;
  courseName?: string;
  moduleId: string;
  moduleTitle?: string;
  topicId: string;
  topicTitle: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctIndices: number[]; // Array to support both single and multi-select
  explanation: string;
  isBookmarked?: boolean;
  userAttempt?: {
    selectedIndices: number[];
    isCorrect: boolean;
    attemptedAt: string;
  };
}

export interface VideoCheckpoint {
  id: string;
  timestamp: string; // e.g. "0:15"
  seconds: number;
  question: string;
  options: string[];
  correctIdx: number;
}

export interface CourseTopic {
  id: string;
  moduleId: string;
  courseId: string;
  topicNumber: number;
  title: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  isBookmarked: boolean;
  note: TopicNote;
  questions: Question[];
  videoUrl?: string;
  videoDurationMinutes?: number;
  videoThumbnail?: string;
  videoChapters?: { time: string; seconds: number; title: string }[];
  videoTranscript?: { time: string; text: string }[];
  videoCheckpoints?: VideoCheckpoint[];
  referenceNotes?: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  moduleNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  topics: CourseTopic[];
  quiz?: CourseQuiz;
}

export interface CourseQuiz {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScore: number; // e.g. 75
  questions: Question[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  subject: string;
  category: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  rating: number;
  enrolledCount: number;
  estimatedHours: number;
  difficulty: DifficultyLevel;
  description: string;
  learningObjectives: string[];
  modules: CourseModule[];
  isEnrolled: boolean;
  progressPercentage: number;
  lastAccessedTopicId?: string;
}

export interface QuizAttemptResult {
  quizId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  userAnswers: Record<string, number[]>; // questionId -> selectedIndices
}
