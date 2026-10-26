'use client';

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  AuthProvider,
  AcademicClass,
  ClassNote,
  AttendanceRecord,
  StudentDoubt,
  DoubtAnswer,
} from '../types/supabase';
import { Course, CourseTopic, CourseQuiz, QuizAttemptResult } from '../types/curriculum';
import {
  DEMO_STAFF_USERS,
  DEMO_STUDENT_USERS,
  INITIAL_CLASSES,
  INITIAL_NOTES,
  INITIAL_ATTENDANCE,
  INITIAL_DOUBTS,
} from '../lib/supabaseClient';
import { INITIAL_COURSES } from '../data/coursesData';
import { YellowWhiteNavbar } from './layout/YellowWhiteNavbar';
import { AuthModal } from './auth/AuthModal';
import { StaffNotesManager } from './staff/StaffNotesManager';
import { StaffAttendanceView } from './staff/StaffAttendanceView';
import { StaffDoubtsQueue } from './staff/StaffDoubtsQueue';
import { StudentNotesView } from './student/StudentNotesView';
import { StudentAttendanceView } from './student/StudentAttendanceView';
import { StudentDoubtsView } from './student/StudentDoubtsView';
import { CooperChatModal } from './cooper/CooperChatModal';

// Learning Components
import { LearningDashboard } from './learning/LearningDashboard';
import { CourseCatalogueView } from './learning/CourseCatalogueView';
import { CourseDetailView } from './learning/CourseDetailView';
import { TopicNoteReader } from './learning/TopicNoteReader';
import { TopicQuestionBank } from './learning/TopicQuestionBank';
import { QuizAssessmentView } from './learning/QuizAssessmentView';

export const StudyPilotApp: React.FC = () => {
  // Current logged in profile: starts as Student (Param Sahar), switchable to Staff (Dr. K. Rajan)
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_STUDENT_USERS[0]);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active navigation tab: starts on 'dashboard' for comprehensive Coursera/Vedantu experience
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data Collections (initialized identically on server & client to avoid hydration mismatch)
  const [classes] = useState<AcademicClass[]>(INITIAL_CLASSES);
  const [notes, setNotes] = useState<ClassNote[]>(INITIAL_NOTES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [doubts, setDoubts] = useState<StudentDoubt[]>(INITIAL_DOUBTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptResult[]>([]);

  // Navigation state within Course hierarchy
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [topicViewMode, setTopicViewMode] = useState<'note' | 'questions'>('note');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Cooper AI Modal & Prompt state
  const [isCooperModalOpen, setIsCooperModalOpen] = useState(false);
  const [cooperPrompt, setCooperPrompt] = useState<string | undefined>(undefined);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Safe client-side hydration synchronization with localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const cachedUser = localStorage.getItem('studypilot_active_user');
        if (cachedUser) setCurrentUser(JSON.parse(cachedUser));

        const cachedNotes = localStorage.getItem('studypilot_notes');
        if (cachedNotes) {
          const parsed: ClassNote[] = JSON.parse(cachedNotes);
          const cachedIds = new Set(parsed.map((n) => n.id));
          const freshNotes = INITIAL_NOTES.filter((n) => !cachedIds.has(n.id));
          setNotes([...parsed, ...freshNotes]);
        } else {
          setNotes(INITIAL_NOTES);
        }

        const cachedAttendance = localStorage.getItem('studypilot_attendance');
        if (cachedAttendance) setAttendance(JSON.parse(cachedAttendance));

        const cachedDoubts = localStorage.getItem('studypilot_doubts');
        if (cachedDoubts) setDoubts(JSON.parse(cachedDoubts));

        const cachedCourses = localStorage.getItem('eduspheere_courses');
        if (cachedCourses) setCourses(JSON.parse(cachedCourses));

        const cachedHistory = localStorage.getItem('eduspheere_quiz_history');
        if (cachedHistory) setQuizHistory(JSON.parse(cachedHistory));
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Sync state to localStorage on mutation
  useEffect(() => {
    try {
      localStorage.setItem('studypilot_active_user', JSON.stringify(currentUser));
      localStorage.setItem('studypilot_notes', JSON.stringify(notes));
      localStorage.setItem('studypilot_attendance', JSON.stringify(attendance));
      localStorage.setItem('studypilot_doubts', JSON.stringify(doubts));
      localStorage.setItem('eduspheere_courses', JSON.stringify(courses));
      localStorage.setItem('eduspheere_quiz_history', JSON.stringify(quizHistory));
    } catch {}
  }, [currentUser, notes, attendance, doubts, courses, quizHistory]);

  // Role Switcher Handler
  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'staff') {
      setCurrentUser(DEMO_STAFF_USERS[0]); // Dr. K. Rajan
      setActiveTab('staff-notes');
      showToast('👨‍🏫 Switched to Faculty Portal: Dr. K. Rajan (Dean & Professor)');
    } else {
      setCurrentUser(DEMO_STUDENT_USERS[0]); // Param Sahar
      setActiveTab('dashboard');
      showToast('🎓 Switched to Student Scholar Portal: Param Sahar');
    }
  };

  // OAuth Login Success Handler (Google, GitHub, Apple iOS)
  const handleLoginSuccess = (user: UserProfile, provider: AuthProvider) => {
    setCurrentUser(user);
    if (user.role === 'staff') {
      setActiveTab('staff-notes');
    } else {
      setActiveTab('dashboard');
    }

    const providerNames: Record<AuthProvider, string> = {
      google: 'Google Account',
      github: 'GitHub SSO',
      apple: 'Apple ID (iOS)',
      email: 'Institutional Email',
    };

    showToast(`✓ Welcome, ${user.fullName}! Signed in via ${providerNames[provider]}.`);
  };

  // Staff: Add Note
  const handleAddNote = (newNoteData: Omit<ClassNote, 'id' | 'createdAt'>) => {
    const newNote: ClassNote = {
      ...newNoteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    showToast(`📝 Note "${newNote.title}" successfully published to ${newNote.className}!`);
  };

  // Staff: Delete Note
  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    showToast('🗑️ Note removed from class materials.');
  };

  // Staff: Save Attendance
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const idsToReplace = new Set(records.map((r) => `${r.classId}-${r.studentId}-${r.date}`));
      const filtered = prev.filter((r) => !idsToReplace.has(`${r.classId}-${r.studentId}-${r.date}`));
      return [...records, ...filtered];
    });
    showToast(`📅 Daily attendance recorded for ${records.length} students!`);
  };

  // Student: Post Doubt
  const handlePostDoubt = (newDoubtData: Omit<StudentDoubt, 'id' | 'createdAt' | 'answers'>) => {
    const newDoubt: StudentDoubt = {
      ...newDoubtData,
      id: `doubt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      answers: [],
    };
    setDoubts((prev) => [newDoubt, ...prev]);
    showToast(`❓ Doubt "${newDoubt.title}" submitted to faculty queue.`);
  };

  // Staff: Answer Doubt
  const handleAnswerDoubt = (
    doubtId: string,
    answerData: Omit<DoubtAnswer, 'id' | 'createdAt'>,
    markResolved = false
  ) => {
    const newAns: DoubtAnswer = {
      ...answerData,
      id: `ans-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        return {
          ...d,
          status: markResolved ? 'resolved' : 'answered',
          answers: [...d.answers, newAns],
        };
      })
    );
    showToast('✉️ Official faculty solution posted to student thread!');
  };

  // Open Cooper with prompt
  const handleLaunchCooperWithQuery = (query: string) => {
    setCooperPrompt(query);
    setIsCooperModalOpen(true);
  };

  // Toggle Topic Completion Status
  const handleToggleTopicComplete = (topicId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        let hasTopic = false;
        let totalTopics = 0;
        let completedTopics = 0;

        const updatedModules = c.modules.map((m) => {
          const updatedTopics = m.topics.map((t) => {
            totalTopics++;
            if (t.id === topicId) {
              hasTopic = true;
              const nextVal = !t.isCompleted;
              if (nextVal) completedTopics++;
              return { ...t, isCompleted: nextVal };
            }
            if (t.isCompleted) completedTopics++;
            return t;
          });
          return { ...m, topics: updatedTopics };
        });

        if (!hasTopic) return c;

        const newPercentage =
          totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        showToast(
          completedTopics > 0
            ? `✓ Progress updated: ${c.code} is now ${newPercentage}% complete!`
            : `Topic status updated`
        );

        return {
          ...c,
          modules: updatedModules,
          progressPercentage: newPercentage,
        };
      })
    );
  };

  // Toggle Topic Bookmark
  const handleToggleTopicBookmark = (topicId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => ({
        ...c,
        modules: c.modules.map((m) => ({
          ...m,
          topics: m.topics.map((t) =>
            t.id === topicId ? { ...t, isBookmarked: !t.isBookmarked } : t
          ),
        })),
      }))
    );
    showToast('⭐ Topic bookmark toggled');
  };

  // Complete Quiz handler
  const handleCompleteQuiz = (result: QuizAttemptResult) => {
    setQuizHistory((prev) => [result, ...prev]);
    if (result.passed) {
      showToast(`🏆 Congratulations! Passed assessment with ${result.percentage}%!`);
    } else {
      showToast(`📚 Assessment finished: ${result.percentage}%. Review answers & retry.`);
    }
  };

  // Find active course / topic / quiz objects
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || null;

  let activeTopic: CourseTopic | null = null;
  if (activeCourse && selectedTopicId) {
    for (const m of activeCourse.modules) {
      const found = m.topics.find((t) => t.id === selectedTopicId);
      if (found) {
        activeTopic = found;
        break;
      }
    }
  }

  // Find active quiz
  let activeQuiz: CourseQuiz | null = null;
  if (selectedQuizId) {
    for (const c of courses) {
      for (const m of c.modules) {
        if (m.quiz && m.quiz.id === selectedQuizId) {
          activeQuiz = m.quiz;
          break;
        }
      }
      if (activeQuiz) break;
    }
  }

  // Gather all quizzes for the Quizzes Arena tab
  const allQuizzes: { quiz: CourseQuiz; course: Course }[] = [];
  courses.forEach((c) => {
    c.modules.forEach((m) => {
      if (m.quiz) {
        allQuizzes.push({ quiz: m.quiz, course: c });
      }
    });
  });

  const isStaff = currentUser.role === 'staff';
  const unresolvedDoubtsCount = doubts.filter((d) => d.status === 'unresolved').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#fefdf9] text-slate-900 selection:bg-yellow-300 selection:text-slate-950 font-body">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-yellow-300 border-2 border-yellow-400 shadow-xl text-xs font-bold flex items-center gap-3 animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <YellowWhiteNavbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Reset nested course/topic/quiz states when switching main tabs
          if (tab !== 'courses') {
            setSelectedCourseId(null);
            setSelectedTopicId(null);
            setSelectedQuizId(null);
          }
        }}
        onSwitchRole={handleSwitchRole}
        onOpenCooper={() => {
          setCooperPrompt(undefined);
          setIsCooperModalOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        unresolvedDoubtsCount={unresolvedDoubtsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* STAFF VIEWS */}
        {isStaff && (
          <>
            {activeTab === 'staff-notes' && (
              <StaffNotesManager
                currentUser={currentUser}
                classes={classes}
                notes={notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {activeTab === 'staff-attendance' && (
              <StaffAttendanceView
                currentUser={currentUser}
                classes={classes}
                attendanceRecords={attendance}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeTab === 'staff-doubts' && (
              <StaffDoubtsQueue
                currentUser={currentUser}
                doubts={doubts}
                onAnswerDoubt={handleAnswerDoubt}
              />
            )}
          </>
        )}

        {/* STUDENT VIEWS */}
        {!isStaff && (
          <>
            {/* 1. LEARNING DASHBOARD */}
            {activeTab === 'dashboard' && (
              <LearningDashboard
                currentUser={currentUser}
                courses={courses}
                attendanceRecords={attendance}
                doubts={doubts}
                onOpenCourse={(courseId) => {
                  setSelectedCourseId(courseId);
                  setSelectedTopicId(null);
                  setSelectedQuizId(null);
                  setActiveTab('courses');
                }}
                onResumeTopic={(courseId, topicId) => {
                  setSelectedCourseId(courseId);
                  setSelectedTopicId(topicId);
                  setTopicViewMode('note');
                  setActiveTab('courses');
                }}
                onOpenCatalogue={() => {
                  setSelectedCourseId(null);
                  setActiveTab('courses');
                }}
                onOpenQuestionBank={(courseId) => {
                  setSelectedCourseId(courseId || null);
                  setActiveTab('question-bank');
                }}
                onOpenAttendance={() => setActiveTab('attendance')}
                onOpenDoubts={() => setActiveTab('doubts')}
                onOpenCooperWithQuery={handleLaunchCooperWithQuery}
              />
            )}

            {/* 2. COURSES / SYLLABUS / TOPIC NOTES HIERARCHY */}
            {activeTab === 'courses' && (
              <>
                {/* A. If a Quiz is actively opened inside Course */}
                {selectedQuizId && activeQuiz ? (
                  <QuizAssessmentView
                    quiz={activeQuiz}
                    courseTitle={activeCourse?.title}
                    onCompleteQuiz={handleCompleteQuiz}
                    onExitQuiz={() => setSelectedQuizId(null)}
                    onAskCooper={handleLaunchCooperWithQuery}
                  />
                ) : /* B. If a Topic is actively opened inside Course */
                selectedTopicId && activeCourse && activeTopic ? (
                  topicViewMode === 'note' ? (
                    <TopicNoteReader
                      course={activeCourse}
                      topic={activeTopic}
                      onBackToCourse={() => setSelectedTopicId(null)}
                      onNavigateTopic={(nextTopicId) => setSelectedTopicId(nextTopicId)}
                      onOpenQuestions={() => setTopicViewMode('questions')}
                      onAskCooper={handleLaunchCooperWithQuery}
                      onToggleComplete={handleToggleTopicComplete}
                      onToggleBookmark={handleToggleTopicBookmark}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setTopicViewMode('note')}
                          className="px-3 py-1.5 rounded-xl bg-white border border-yellow-300 text-xs font-bold text-slate-800 hover:bg-yellow-50 cursor-pointer shadow-2xs"
                        >
                          ← Back to Topic Note
                        </button>
                        <span className="text-xs text-slate-500 font-mono-code">
                          Practicing questions for: {activeTopic.title}
                        </span>
                      </div>
                      <TopicQuestionBank
                        courses={[activeCourse]}
                        initialCourseId={activeCourse.id}
                        initialTopicId={activeTopic.id}
                        onAskCooper={handleLaunchCooperWithQuery}
                        onOpenTopicNote={() => setTopicViewMode('note')}
                      />
                    </div>
                  )
                ) : /* C. If a Course is selected, show Course Detail */
                selectedCourseId && activeCourse ? (
                  <CourseDetailView
                    course={activeCourse}
                    onBack={() => setSelectedCourseId(null)}
                    onOpenTopic={(topicId, mode) => {
                      setSelectedTopicId(topicId);
                      setTopicViewMode(mode);
                    }}
                    onStartQuiz={(quizId) => setSelectedQuizId(quizId)}
                    onToggleTopicComplete={handleToggleTopicComplete}
                  />
                ) : (
                  /* D. Show Course Catalogue */
                  <CourseCatalogueView
                    courses={courses}
                    onSelectCourse={(courseId) => {
                      setSelectedCourseId(courseId);
                      setSelectedTopicId(null);
                      setSelectedQuizId(null);
                    }}
                    onOpenTopic={(courseId, topicId) => {
                      setSelectedCourseId(courseId);
                      setSelectedTopicId(topicId);
                      setTopicViewMode('note');
                    }}
                  />
                )}
              </>
            )}

            {/* 3. QUESTION BANK TAB */}
            {activeTab === 'question-bank' && (
              <TopicQuestionBank
                courses={courses}
                initialCourseId={selectedCourseId || undefined}
                onAskCooper={handleLaunchCooperWithQuery}
              />
            )}

            {/* 4. QUIZ ARENA TAB */}
            {activeTab === 'quizzes' && (
              <>
                {selectedQuizId && activeQuiz ? (
                  <QuizAssessmentView
                    quiz={activeQuiz}
                    courseTitle={activeCourse?.title}
                    onCompleteQuiz={handleCompleteQuiz}
                    onExitQuiz={() => setSelectedQuizId(null)}
                    onAskCooper={handleLaunchCooperWithQuery}
                  />
                ) : (
                  <div className="space-y-8 animate-fadeIn">
                    {/* Quiz Arena Header */}
                    <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-50 rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏆</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900 text-yellow-300 font-mono-code">
                            Assessment Arena
                          </span>
                        </div>
                        <h1 className="font-adorn text-2xl sm:text-3xl font-extrabold text-slate-950">
                          Module Quizzes &amp; Formal Exams
                        </h1>
                        <p className="text-xs text-slate-600 max-w-xl">
                          Timed university-grade assessments. Track scores, review step-by-step solutions, and certify mastery.
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-yellow-300 shadow-2xs">
                        <div className="text-center px-2">
                          <span className="block text-[10px] uppercase font-mono-code text-slate-400 font-bold">
                            Attempts
                          </span>
                          <span className="text-xl font-black text-slate-900 font-mono-code">
                            {quizHistory.length}
                          </span>
                        </div>
                        <div className="text-center px-2 border-l border-yellow-200">
                          <span className="block text-[10px] uppercase font-mono-code text-slate-400 font-bold">
                            Pass Rate
                          </span>
                          <span className="text-xl font-black text-amber-700 font-mono-code">
                            {quizHistory.length > 0
                              ? Math.round(
                                  (quizHistory.filter((q) => q.passed).length /
                                    quizHistory.length) *
                                    100
                                )
                              : 100}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quizzes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {allQuizzes.map(({ quiz, course }) => {
                        const pastAttempts = quizHistory.filter((h) => h.quizId === quiz.id);
                        const bestScore = pastAttempts.length > 0
                          ? Math.max(...pastAttempts.map((h) => h.percentage))
                          : null;

                        return (
                          <div
                            key={quiz.id}
                            className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-yellow-200 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono-code">
                                  {course.code}
                                </span>
                                {bestScore !== null && (
                                  <span
                                    className={`text-xs font-mono-code font-extrabold px-2 py-0.5 rounded-md ${
                                      bestScore >= quiz.passingScore
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    Best: {bestScore}%
                                  </span>
                                )}
                              </div>

                              <div>
                                <h3 className="font-adorn text-lg sm:text-xl font-bold text-slate-950">
                                  {quiz.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                  {quiz.description}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs font-mono-code text-slate-600 pt-1">
                                <span>⏱️ {quiz.timeLimitMinutes} Mins</span>
                                <span>•</span>
                                <span>❓ {quiz.questions.length} Items</span>
                                <span>•</span>
                                <span className="text-amber-800 font-bold">
                                  Pass: {quiz.passingScore}%
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedCourseId(course.id);
                                setSelectedQuizId(quiz.id);
                              }}
                              className="yellow-gradient-btn w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                              <span>🚀</span>
                              <span>Launch Assessment</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 5. NOTES REPOSITORY TAB */}
            {activeTab === 'notes' && (
              <StudentNotesView
                classes={classes}
                notes={notes}
                onOpenCooperWithTopic={(topic) =>
                  handleLaunchCooperWithQuery(`Explain the key formulas and concepts of: "${topic}"`)
                }
              />
            )}

            {/* 6. ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <StudentAttendanceView
                currentUser={currentUser}
                attendanceRecords={attendance}
                onAskCooper={() =>
                  handleLaunchCooperWithQuery('Analyze my attendance history and give me recommendations')
                }
              />
            )}

            {/* 7. DOUBTS TAB */}
            {activeTab === 'doubts' && (
              <StudentDoubtsView
                currentUser={currentUser}
                classes={classes}
                doubts={doubts}
                onPostDoubt={handlePostDoubt}
                onAskCooper={handleLaunchCooperWithQuery}
              />
            )}
          </>
        )}

        {/* DEDICATED COOPER AI TAB */}
        {activeTab === 'cooper' && (
          <CooperChatModal
            currentUser={currentUser}
            notes={notes}
            attendance={attendance}
            doubts={doubts}
            isOpen={true}
            onClose={() => setActiveTab(isStaff ? 'staff-notes' : 'dashboard')}
            isEmbedded={true}
            initialPrompt={cooperPrompt}
            onPostDoubt={handlePostDoubt}
          />
        )}
      </main>

      {/* Floating Cooper AI Launcher Button (Visible across all tabs except full Cooper tab) */}
      {activeTab !== 'cooper' && (
        <button
          onClick={() => {
            setCooperPrompt(undefined);
            setIsCooperModalOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 yellow-gradient-btn px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white cooper-glow hover:scale-105 transition-all cursor-pointer"
          title="Open Cooper AI Assistant"
        >
          <span className="text-xl">🤖</span>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-black text-slate-950 leading-tight">
              Chat with Cooper
            </span>
            <span className="block text-[10px] text-slate-800 font-mono-code font-bold leading-tight">
              AI Academic Tutor
            </span>
          </div>
        </button>
      )}

      {/* Floating Cooper Chat Modal */}
      {isCooperModalOpen && activeTab !== 'cooper' && (
        <CooperChatModal
          currentUser={currentUser}
          notes={notes}
          attendance={attendance}
          doubts={doubts}
          isOpen={isCooperModalOpen}
          onClose={() => setIsCooperModalOpen(false)}
          isEmbedded={false}
          initialPrompt={cooperPrompt}
          onPostDoubt={handlePostDoubt}
        />
      )}

      {/* Social OAuth & Academic Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-yellow-200 bg-white py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="font-adorn font-bold text-slate-800 text-sm">Eduspheere Platform</span>
          <span>•</span>
          <span>Academic Study, Analysis &amp; Doubt-Clearing System</span>
        </div>
        <p className="text-[11px] text-slate-400">
          White &amp; Yellow Theme with Adorn Font Headings • Cooper AI Assistant • Coursera &amp; Vedantu Inspired
        </p>
      </footer>
    </div>
  );
};
