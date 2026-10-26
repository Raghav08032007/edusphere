'use client';

import React, { useState } from 'react';
import { Course } from '../../types/curriculum';
import { useCard3DTilt } from '../../hooks/useCard3DTilt';

interface CourseCatalogueViewProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onOpenTopic: (courseId: string, topicId: string) => void;
}

function CourseCard({
  course,
  onSelect,
  onContinue,
}: {
  course: Course;
  onSelect: () => void;
  onContinue: (topicId: string) => void;
}) {
  const { ref, style, onMouseMove, onMouseLeave } = useCard3DTilt<HTMLDivElement>({
    maxTilt: 5,
    scale: 1.015,
  });

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="bg-white rounded-3xl p-6 border-2 border-yellow-200/90 hover:border-yellow-400 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono-code">
            {course.code}
          </span>
          <span className="text-xs font-bold text-amber-700 font-mono-code flex items-center gap-1">
            ★ {course.rating.toFixed(2)}
          </span>
        </div>

        <div>
          <h3
            onClick={onSelect}
            className="font-adorn text-xl font-bold text-slate-900 hover:text-amber-800 cursor-pointer transition-colors line-clamp-1"
          >
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
            {course.subtitle}
          </p>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-xs font-bold text-slate-900 border border-yellow-300">
            👨‍🏫
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-800">
              {course.instructorName}
            </span>
            <span className="block text-[10px] text-slate-400">
              {course.subject} • {course.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-yellow-100">
        {course.isEnrolled && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">Course Completion</span>
              <span className="text-amber-700 font-mono-code font-black">
                {course.progressPercentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-yellow-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {course.isEnrolled && course.lastAccessedTopicId ? (
            <button
              onClick={() => onContinue(course.lastAccessedTopicId!)}
              className="flex-1 yellow-gradient-btn py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Continue Learning →
            </button>
          ) : (
            <button
              onClick={onSelect}
              className="flex-1 yellow-gradient-btn py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Start Course →
            </button>
          )}

          <button
            onClick={onSelect}
            className="px-3.5 py-2.5 rounded-xl border border-yellow-300 hover:bg-yellow-50 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            title="Inspect Course Syllabus"
          >
            Syllabus
          </button>
        </div>
      </div>
    </div>
  );
}

export const CourseCatalogueView: React.FC<CourseCatalogueViewProps> = ({
  courses,
  onSelectCourse,
  onOpenTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const subjects = ['all', ...Array.from(new Set(courses.map((c) => c.subject)))];

  const filteredCourses = courses.filter((c) => {
    const matchesSubject = selectedSubject === 'all' || c.subject === selectedSubject;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-yellow-50/70 via-amber-50/40 to-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 font-mono-code">
                🎓 Academic Course Curriculum
              </span>
              <span className="text-xs text-slate-500 font-bold">Coursera &amp; Vedantu Model</span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Explore Enrolled Programs &amp; Modules
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Step into comprehensive academic disciplines. Each course connects structured lecture notes, topic-wise question banks, and module assessments with Cooper AI assistance.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-xs text-center min-w-[120px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Enrolled Courses</span>
              <span className="font-adorn text-3xl font-black text-amber-600 mt-0.5 block">
                {courses.filter((c) => c.isEnrolled).length}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">Active Cohort</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-yellow-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, topic, or code (e.g. Distributed Systems, Raft, AI)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-yellow-200 bg-yellow-50/20 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer whitespace-nowrap ${
                selectedSubject === subj
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'bg-yellow-50/70 text-slate-600 hover:bg-yellow-100 hover:text-slate-900'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onSelect={() => onSelectCourse(course.id)}
            onContinue={(topicId) => onOpenTopic(course.id, topicId)}
          />
        ))}
      </div>
    </div>
  );
};
