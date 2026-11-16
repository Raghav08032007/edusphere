'use client';

import React, { useState } from 'react';
import { Course, CourseModule, CourseTopic } from '../../types/curriculum';
import { useCard3DTilt } from '../../hooks/useCard3DTilt';

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
  onOpenTopic: (topicId: string, mode: 'note' | 'questions') => void;
  onStartQuiz: (quizId: string) => void;
  onToggleTopicComplete?: (topicId: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  onBack,
  onOpenTopic,
  onStartQuiz,
  onToggleTopicComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'overview'>('syllabus');
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>(
    course.modules.map((m) => m.id)
  );

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModuleIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const totalTopics = course.modules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = course.modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.isCompleted).length,
    0
  );
  const calculatedProgress =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Find next topic to study
  let nextTopic: CourseTopic | null = null;
  for (const mod of course.modules) {
    const uncompleted = mod.topics.find((t) => !t.isCompleted);
    if (uncompleted) {
      nextTopic = uncompleted;
      break;
    }
  }
  if (!nextTopic && course.modules.length > 0 && course.modules[0].topics.length > 0) {
    nextTopic = course.modules[0].topics[0];
  }

  // 3D Tilt for Hero Card
  const { ref: heroRef, style: heroStyle, onMouseMove, onMouseLeave } = useCard3DTilt<HTMLDivElement>({
    maxTilt: 4,
    scale: 1.01,
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-yellow-200 hover:border-yellow-400 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
        >
          <span>←</span>
          <span>Back to Course Catalogue</span>
        </button>
        <span>/</span>
        <span className="text-slate-800">{course.code}</span>
        <span>/</span>
        <span className="text-amber-800 truncate max-w-xs">{course.title}</span>
      </div>

      {/* Course Hero Banner */}
      <div
        ref={heroRef}
        style={heroStyle}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="bg-gradient-to-br from-white via-yellow-50/40 to-amber-50/30 rounded-3xl p-6 sm:p-8 border-2 border-yellow-300/80 shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-yellow-200/40 via-amber-100/10 to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-slate-950 font-mono-code shadow-xs">
              {course.code}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-yellow-200 font-mono-code">
              {course.subject}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 font-mono-code">
              {course.difficulty} Level
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-yellow-200 flex items-center gap-1">
              <span className="text-amber-500">★</span>
              <strong className="font-mono-code text-slate-900">{course.rating.toFixed(2)}</strong>
              <span className="text-slate-400">({course.enrolledCount.toLocaleString()} enrolled)</span>
            </span>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="font-adorn text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-amber-900 leading-relaxed">
              {course.subtitle}
            </p>
          </div>

          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {course.description}
          </p>

          {/* Instructor & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-yellow-200/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-2xl flex items-center justify-center border-2 border-white shadow-xs">
                👨‍🏫
              </div>
              <div>
                <span className="block text-xs font-extrabold text-slate-900">
                  {course.instructorName}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {course.instructorTitle}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-wider font-mono-code text-slate-400 font-bold">
                  Curriculum Depth
                </span>
                <span className="block text-xs font-bold text-slate-800 font-mono-code">
                  {course.modules.length} Modules • {totalTopics} Topics • {course.estimatedHours}h
                </span>
              </div>

              {nextTopic && (
                <button
                  onClick={() => onOpenTopic(nextTopic!.id, 'note')}
                  className="yellow-gradient-btn px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>🚀</span>
                  <span>Continue: {nextTopic.title.slice(0, 24)}...</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600">
                Your Progress: {completedTopics} of {totalTopics} topics completed
              </span>
              <span className="text-amber-900 font-mono-code font-black text-sm">
                {calculatedProgress}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white border border-yellow-200 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${calculatedProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b-2 border-yellow-200 pb-2">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'syllabus'
              ? 'bg-yellow-400 text-slate-950 shadow-sm border border-yellow-500'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
        >
          <span>📑</span>
          <span>Course Syllabus &amp; Modules ({course.modules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-yellow-400 text-slate-950 shadow-sm border border-yellow-500'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
        >
          <span>🎯</span>
          <span>Learning Objectives &amp; Skills</span>
        </button>
      </div>

      {/* SYLLABUS TAB */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          {course.modules.map((mod: CourseModule) => {
            const isExpanded = expandedModuleIds.includes(mod.id);
            const modCompletedCount = mod.topics.filter((t) => t.isCompleted).length;
            const modTotalCount = mod.topics.length;
            const isModComplete = modTotalCount > 0 && modCompletedCount === modTotalCount;

            return (
              <div
                key={mod.id}
                className="bg-white rounded-3xl border-2 border-yellow-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleModuleExpand(mod.id)}
                  className="p-5 sm:p-6 bg-gradient-to-r from-yellow-50/70 via-white to-white flex items-center justify-between gap-4 cursor-pointer select-none border-b border-yellow-100"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border-2 shrink-0 ${
                        isModComplete
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-yellow-300 text-slate-900 border-white shadow-2xs'
                      }`}
                    >
                      {isModComplete ? '✓' : `M${mod.moduleNumber}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 font-mono-code">
                          Module {mod.moduleNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-mono-code">
                          {mod.estimatedMinutes} mins total
                        </span>
                      </div>
                      <h3 className="font-adorn text-lg sm:text-xl font-bold text-slate-900 mt-1">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-2xl">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-xs font-mono-code font-bold text-slate-500">
                      {modCompletedCount}/{modTotalCount} completed
                    </span>
                    <button
                      className="w-8 h-8 rounded-xl bg-white border border-yellow-200 text-slate-600 flex items-center justify-center text-sm font-bold shadow-2xs"
                      aria-label="Toggle module accordion"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Topics List & Module Quiz */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-3 bg-[#fffefb]">
                    {mod.topics.map((topic: CourseTopic, idx: number) => {
                      return (
                        <div
                          key={topic.id}
                          className="bg-white rounded-2xl p-4 border border-yellow-200/70 hover:border-yellow-400 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Checkmark or Topic Index */}
                            <button
                              onClick={() => onToggleTopicComplete?.(topic.id)}
                              title={topic.isCompleted ? 'Marked complete' : 'Click to toggle status'}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border transition-all cursor-pointer ${
                                topic.isCompleted
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-yellow-50 text-slate-500 border-yellow-300 hover:border-yellow-500'
                              }`}
                            >
                              {topic.isCompleted ? '✓' : `${idx + 1}`}
                            </button>

                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                  {topic.title}
                                </h4>
                                {topic.videoUrl && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-mono-code flex items-center gap-1">
                                    <span>🎬</span>
                                    <span>Video ({topic.videoDurationMinutes || 18}m)</span>
                                  </span>
                                )}
                                {topic.videoCheckpoints && topic.videoCheckpoints.length > 0 && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-300 text-yellow-950 font-mono-code flex items-center gap-1">
                                    <span>⚡</span>
                                    <span>{topic.videoCheckpoints.length} Checkpoints</span>
                                  </span>
                                )}
                                {topic.note.handoutName && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono-code flex items-center gap-1">
                                    <span>📎</span>
                                    <span className="truncate max-w-[120px]">{topic.note.handoutName}</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono-code">
                                <span>⏱️ {topic.estimatedMinutes} mins study</span>
                                <span>•</span>
                                <span>❓ {topic.questions.length} practice questions</span>
                                {topic.note.keyTakeaways && topic.note.keyTakeaways.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-700 font-semibold">
                                      {topic.note.keyTakeaways.length} key takeaways
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => onOpenTopic(topic.id, 'note')}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                topic.videoUrl
                                  ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 shadow-2xs font-black'
                                  : 'bg-yellow-50 hover:bg-yellow-100 text-slate-900 border border-yellow-300'
                              }`}
                            >
                              <span>{topic.videoUrl ? '🎬' : '📖'}</span>
                              <span>{topic.videoUrl ? 'Watch & Read Notes' : 'Read Notes'}</span>
                            </button>

                            <button
                              onClick={() => onOpenTopic(topic.id, 'questions')}
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <span>✏️</span>
                              <span>Practice ({topic.questions.length})</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Module Assessment Card if exists */}
                    {mod.quiz && (
                      <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-amber-100/70 via-yellow-100/60 to-amber-50 border-2 border-yellow-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏆</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-mono-code">
                              End-of-Module Assessment
                            </span>
                          </div>
                          <h4 className="font-adorn text-base font-bold text-slate-950">
                            {mod.quiz.title}
                          </h4>
                          <p className="text-xs text-slate-600">
                            {mod.quiz.questions.length} Questions • {mod.quiz.timeLimitMinutes} Mins • Passing Score: {mod.quiz.passingScore}%
                          </p>
                        </div>

                        <button
                          onClick={() => onStartQuiz(mod.quiz!.id)}
                          className="yellow-gradient-btn px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 transition-all self-end sm:self-center shrink-0 flex items-center gap-2"
                        >
                          <span>🎯</span>
                          <span>Launch Assessment</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Objectives */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎯</span>
              <h3 className="font-adorn text-xl font-bold text-slate-900">
                What You Will Master
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Academic outcomes rigorously verified across engineering standards and university syllabi.
            </p>
            <ul className="space-y-3 pt-2">
              {course.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-yellow-200 text-yellow-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructor & Faculty Credentials */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎓</span>
              <h3 className="font-adorn text-xl font-bold text-slate-900">
                Course Faculty &amp; Academic Rigor
              </h3>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-yellow-50/50 border border-yellow-200">
              <div className="w-14 h-14 rounded-2xl bg-yellow-300 text-3xl flex items-center justify-center border-2 border-white shadow-xs">
                👨‍🏫
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {course.instructorName}
                </h4>
                <p className="text-xs text-amber-900 font-medium">
                  {course.instructorTitle}
                </p>
                <p className="text-[11px] text-slate-500 font-mono-code">
                  Edusphere Verified Senior Fellow
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed pt-2">
              <p>
                This curriculum combines lecture notes, mathematical proofs, and hands-on algorithmic problem banks designed to transition students into industry-grade system architects and research scholars.
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] font-semibold flex items-center gap-2">
                <span>💡</span>
                <span>All topics include integrated Cooper AI query triggers for step-by-step mathematical doubt clearance.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
