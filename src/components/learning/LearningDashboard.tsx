'use client';

import React from 'react';
import { Course, CourseTopic } from '../../types/curriculum';
import { UserProfile, AttendanceRecord, StudentDoubt } from '../../types/supabase';
import { useCard3DTilt } from '../../hooks/useCard3DTilt';

interface LearningDashboardProps {
  currentUser: UserProfile;
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
  doubts: StudentDoubt[];
  onOpenCourse: (courseId: string) => void;
  onResumeTopic: (courseId: string, topicId: string) => void;
  onOpenCatalogue: () => void;
  onOpenQuestionBank: (courseId?: string) => void;
  onOpenAttendance: () => void;
  onOpenDoubts: () => void;
  onOpenCooperWithQuery: (query: string) => void;
  onOpenArena?: () => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  currentUser,
  courses,
  attendanceRecords,
  doubts,
  onOpenCourse,
  onResumeTopic,
  onOpenCatalogue,
  onOpenQuestionBank,
  onOpenAttendance,
  onOpenDoubts,
  onOpenCooperWithQuery,
  onOpenArena,
}) => {
  // Compute student-specific attendance stats
  const myAttendance = attendanceRecords.filter((r) => r.studentId === currentUser.id);
  const totalAttendanceDays = myAttendance.length;
  const presentDays = myAttendance.filter((r) => r.status === 'present').length;
  const attendanceRate =
    totalAttendanceDays > 0 ? Math.round((presentDays / totalAttendanceDays) * 100) : 88;

  // Compute student-specific doubts stats
  const myDoubts = doubts.filter((d) => d.studentId === currentUser.id);
  const resolvedDoubts = myDoubts.filter((d) => d.status === 'resolved' || d.status === 'answered');

  // Find active course with incomplete topic for Continue Learning
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const primaryCourse = enrolledCourses[0] || courses[0];

  let nextTopic: CourseTopic | null = null;
  if (primaryCourse) {
    for (const mod of primaryCourse.modules) {
      const uncompleted = mod.topics.find((t) => !t.isCompleted);
      if (uncompleted) {
        nextTopic = uncompleted;
        break;
      }
    }
    if (!nextTopic && primaryCourse.modules.length > 0 && primaryCourse.modules[0].topics.length > 0) {
      nextTopic = primaryCourse.modules[0].topics[0];
    }
  }

  // 3D Tilt for Hero Card
  const { ref: heroRef, style: heroStyle, onMouseMove, onMouseLeave } = useCard3DTilt<HTMLDivElement>({
    maxTilt: 4,
    scale: 1.01,
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900 text-yellow-300 font-mono-code">
              Student Scholar Cockpit
            </span>
          </div>
          <h1 className="font-adorn text-3xl sm:text-4xl font-extrabold text-slate-950">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            Term II • Computer Science &amp; Structural AI Specialization • Roll #{currentUser.regNumber || 'CS-2026-042'}
          </p>
        </div>

        <button
          onClick={() =>
            onOpenCooperWithQuery(
              'What should I prioritize studying today based on my enrolled courses and attendance?'
            )
          }
          className="yellow-gradient-btn px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2 border border-yellow-500 shrink-0 self-start md:self-center"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-950 animate-ping" />
          <span>Ask Cooper AI for Study Plan</span>
        </button>
      </div>

      {/* HERO: Continue Learning Action Card */}
      {primaryCourse && nextTopic && (
        <div
          ref={heroRef}
          style={heroStyle}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300/90 shadow-md relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-mono-code">
                  Continue Learning
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono-code">
                  {primaryCourse.code} • {primaryCourse.title}
                </span>
              </div>

              <h2 className="font-adorn text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                {nextTopic.title}
              </h2>

              <p className="text-xs text-slate-600 line-clamp-2">
                {nextTopic.note.content.replace(/^#+.*$/gm, '').trim().slice(0, 160)}...
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono-code text-slate-500 pt-1">
                <span>⏱️ {nextTopic.estimatedMinutes} min study</span>
                <span>•</span>
                <span>❓ {nextTopic.questions.length} practice problems</span>
                <span>•</span>
                <span className="text-amber-800 font-bold">
                  {primaryCourse.progressPercentage}% course completed
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => onResumeTopic(primaryCourse.id, nextTopic!.id)}
                className="yellow-gradient-btn px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                <span>Resume Topic Notes</span>
              </button>

              <button
                onClick={() => onOpenCourse(primaryCourse.id)}
                className="px-5 py-2.5 rounded-2xl bg-white border border-yellow-300 hover:bg-yellow-50 text-xs font-bold text-slate-800 transition-all cursor-pointer text-center"
              >
                View Full Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Academic Operations, Gamification & Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance Snapshot Card */}
        <div
          onClick={onOpenAttendance}
          className="bg-white rounded-3xl p-6 border-2 border-yellow-200/90 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📅</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 font-mono-code">
                Daily Attendance
              </span>
            </div>
            <div>
              <h3 className="font-adorn text-xl font-bold text-slate-900">
                My Attendance
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Faculty-verified presence records
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 font-mono-code">
                {attendanceRate}%
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono-code">
                ({presentDays}/{totalAttendanceDays} days present)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {attendanceRate >= 75
                ? '✓ Eligible for university semester examinations.'
                : '⚠️ Attendance below 75% threshold. Consult faculty.'}
            </p>
          </div>

          <div className="pt-3 border-t border-yellow-100 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>View Full Calendar</span>
            <span>→</span>
          </div>
        </div>

        {/* Doubts Hub Snapshot Card */}
        <div
          onClick={onOpenDoubts}
          className="bg-white rounded-3xl p-6 border-2 border-yellow-200/90 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">❓</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 font-mono-code">
                Academic Doubts
              </span>
            </div>
            <div>
              <h3 className="font-adorn text-xl font-bold text-slate-900">
                Doubts &amp; Mentorship
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Faculty queue &amp; peer threads
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 font-mono-code">
                {myDoubts.length}
              </span>
              <span className="text-xs font-bold text-amber-700 font-mono-code">
                ({resolvedDoubts.length} resolved with faculty answers)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Get answers verified directly by faculty professors and Cooper AI.
            </p>
          </div>

          <div className="pt-3 border-t border-yellow-100 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Open Doubts Hub</span>
            <span>→</span>
          </div>
        </div>

        {/* Question Bank Snapshot Card */}
        <div
          onClick={() => onOpenQuestionBank()}
          className="bg-white rounded-3xl p-6 border-2 border-yellow-200/90 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">✏️</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 font-mono-code">
                Question Bank
              </span>
            </div>
            <div>
              <h3 className="font-adorn text-xl font-bold text-slate-900">
                Topic Problem Sets
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                MCQs, Multi-Select &amp; True/False
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 font-mono-code">
                25+
              </span>
              <span className="text-xs font-bold text-slate-600 font-mono-code">
                Curated items with faculty solutions
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Practice questions categorized by course module and difficulty.
            </p>
          </div>

          <div className="pt-3 border-t border-yellow-100 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Practice Problems</span>
            <span>→</span>
          </div>
        </div>

        {/* TrigQuest Boss Arena Gamification Card */}
        <div
          onClick={onOpenArena}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border-2 border-amber-400 hover:border-amber-300 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl animate-pulse">⚔️</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono-code font-bold">
                Gamified Arena
              </span>
            </div>
            <div>
              <h3 className="font-adorn text-xl font-bold text-amber-300">
                TrigQuest Battle
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Pick a champion, land the hit!
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400 font-mono-code">
                Bosses
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono-code">
                Earn +150 XP
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              🎮 Solve trigonometry under pressure & defeat boss monsters in the retro arcade!
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Enter the Arena</span>
            <span>⚔️ →</span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📚</span>
            <h3 className="font-adorn text-xl font-bold text-slate-950">
              Active Enrolled Courses ({enrolledCourses.length})
            </h3>
          </div>
          <button
            onClick={onOpenCatalogue}
            className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
          >
            Browse Course Catalogue →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => {
            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl p-5 border-2 border-yellow-200 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono-code">
                    <span className="font-black px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900">
                      {course.code}
                    </span>
                    <span className="font-bold text-amber-700">★ {course.rating.toFixed(2)}</span>
                  </div>
                  <h4
                    onClick={() => onOpenCourse(course.id)}
                    className="font-adorn text-base font-bold text-slate-950 hover:text-amber-800 cursor-pointer line-clamp-1"
                  >
                    {course.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {course.subtitle}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-yellow-100">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold font-mono-code text-slate-500">
                      <span>Progress</span>
                      <span className="text-amber-800">{course.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-yellow-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCourse(course.id)}
                    className="w-full py-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-xs font-bold text-slate-900 transition-all cursor-pointer"
                  >
                    Open Syllabus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cooper AI Quick Academic Prompts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-adorn text-lg font-bold text-slate-950">
              Cooper AI Quick Study Prompts
            </h3>
            <p className="text-xs text-slate-500">
              Instant academic synthesis powered by Edusphere MCP tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() =>
              onOpenCooperWithQuery(
                'Explain the Raft leader election mechanism and how split votes are resolved using randomized timeouts.'
              )
            }
            className="p-3.5 rounded-2xl bg-yellow-50/70 hover:bg-yellow-100/80 border border-yellow-300/80 text-left transition-all cursor-pointer space-y-1 text-xs"
          >
            <span className="block font-bold text-slate-900">Raft Consensus Proof</span>
            <span className="block text-slate-500 text-[11px]">Leader election &amp; split vote resolution</span>
          </button>

          <button
            onClick={() =>
              onOpenCooperWithQuery(
                'Show me the mathematical proof of the Attention scaled dot-product division by sqrt(d_k).'
              )
            }
            className="p-3.5 rounded-2xl bg-yellow-50/70 hover:bg-yellow-100/80 border border-yellow-300/80 text-left transition-all cursor-pointer space-y-1 text-xs"
          >
            <span className="block font-bold text-slate-900">Transformer Math</span>
            <span className="block text-slate-500 text-[11px]">Why divide attention by sqrt(d_k)?</span>
          </button>

          <button
            onClick={() =>
              onOpenCooperWithQuery(
                'Derive Maxwell displacement current in Ampere-Maxwell law from charge conservation.'
              )
            }
            className="p-3.5 rounded-2xl bg-yellow-50/70 hover:bg-yellow-100/80 border border-yellow-300/80 text-left transition-all cursor-pointer space-y-1 text-xs"
          >
            <span className="block font-bold text-slate-900">Maxwell Equations</span>
            <span className="block text-slate-500 text-[11px]">Displacement current derivation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
