'use client';

import React, { useState } from 'react';
import { Course, CourseTopic } from '../../types/curriculum';
import { formatSafeDate } from '../../utils/dateUtils';

interface TopicNoteReaderProps {
  course: Course;
  topic: CourseTopic;
  onBackToCourse: () => void;
  onNavigateTopic: (nextTopicId: string) => void;
  onOpenQuestions: (topicId: string) => void;
  onAskCooper: (prompt: string) => void;
  onToggleComplete: (topicId: string) => void;
  onToggleBookmark: (topicId: string) => void;
}

export const TopicNoteReader: React.FC<TopicNoteReaderProps> = ({
  course,
  topic,
  onBackToCourse,
  onNavigateTopic,
  onOpenQuestions,
  onAskCooper,
  onToggleComplete,
  onToggleBookmark,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // Find module & all topics for prev/next navigation
  const allTopics: CourseTopic[] = [];
  let currentModuleTitle = '';
  course.modules.forEach((mod) => {
    mod.topics.forEach((t) => {
      allTopics.push(t);
      if (t.id === topic.id) {
        currentModuleTitle = `Module ${mod.moduleNumber}: ${mod.title}`;
      }
    });
  });

  const currentIndex = allTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Simple, robust Markdown parser for academic notes (handles headers, code blocks, bold, math, lists)
  const renderStructuredContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, partIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const rawCode = part.slice(3, -3).trim();
        const firstLineBreak = rawCode.indexOf('\n');
        let codeContent = rawCode;
        if (firstLineBreak !== -1 && !rawCode.slice(0, firstLineBreak).includes(' ')) {
          codeContent = rawCode.slice(firstLineBreak + 1);
        }

        return (
          <div
            key={partIdx}
            className="my-5 rounded-2xl bg-slate-900 text-yellow-300 p-4 border border-slate-700 shadow-md font-mono-code text-xs relative overflow-x-auto"
          >
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="uppercase font-bold tracking-wider">Algorithmic Architecture / Trace</span>
              <button
                onClick={() => handleCopy(codeContent)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold transition-all cursor-pointer"
              >
                {copiedCode === codeContent ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="whitespace-pre overflow-x-auto leading-relaxed">{codeContent}</pre>
          </div>
        );
      }

      // Process normal markdown lines
      const lines = part.split('\n');
      return (
        <div key={partIdx} className="space-y-4">
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={lineIdx}
                  className="font-adorn text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-2 border-b border-yellow-200 pb-1"
                >
                  {trimmed.replace('## ', '')}
                </h2>
              );
            }

            if (trimmed.startsWith('### ')) {
              return (
                <h3
                  key={lineIdx}
                  className="font-adorn text-lg font-bold text-amber-900 mt-4 mb-1"
                >
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }

            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <li key={lineIdx} className="ml-5 list-disc text-slate-700 leading-relaxed">
                  {trimmed.replace(/^[-*]\s+/, '')}
                </li>
              );
            }

            if (/^\d+\.\s+/.test(trimmed)) {
              return (
                <div key={lineIdx} className="ml-4 flex items-start gap-2 text-slate-700 leading-relaxed">
                  <span className="font-bold text-amber-700 font-mono-code">{trimmed.slice(0, 2)}</span>
                  <span>{trimmed.replace(/^\d+\.\s+/, '')}</span>
                </div>
              );
            }

            if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
              return (
                <div
                  key={lineIdx}
                  className="my-3 p-4 rounded-xl bg-yellow-50/80 border border-yellow-300/80 text-center font-mono-code text-sm font-bold text-amber-950 overflow-x-auto"
                >
                  {trimmed.slice(2, -2).trim()}
                </div>
              );
            }

            return (
              <p
                key={lineIdx}
                className={`text-slate-700 leading-relaxed ${
                  fontSize === 'large' ? 'text-base' : 'text-sm'
                }`}
              >
                {trimmed}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Breadcrumb & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-yellow-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto">
          <button
            onClick={onBackToCourse}
            className="text-amber-800 hover:underline cursor-pointer shrink-0"
          >
            ← {course.code}
          </button>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[200px]">{currentModuleTitle}</span>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[220px] font-extrabold">{topic.title}</span>
        </div>

        {/* Action cluster */}
        <div className="flex items-center gap-2">
          {/* Font toggle */}
          <button
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            className="px-2.5 py-1.5 rounded-xl bg-yellow-50 text-slate-700 border border-yellow-200 text-xs font-bold hover:bg-yellow-100 transition-all cursor-pointer"
            title="Adjust reading font size"
          >
            {fontSize === 'normal' ? 'A+' : 'A-'}
          </button>

          {/* Bookmark toggle */}
          <button
            onClick={() => onToggleBookmark(topic.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              topic.isBookmarked
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-yellow-200 hover:bg-yellow-50'
            }`}
          >
            <span>{topic.isBookmarked ? '★' : '☆'}</span>
            <span className="hidden sm:inline">
              {topic.isBookmarked ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* Mark Complete Toggle */}
          <button
            onClick={() => onToggleComplete(topic.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              topic.isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-yellow-300 hover:bg-yellow-50'
            }`}
          >
            <span>{topic.isCompleted ? '✓ Completed' : '○ Mark as Read'}</span>
          </button>

          {/* Ask Cooper quick query */}
          <button
            onClick={() =>
              onAskCooper(`Help me understand the core intuition and mathematical proof behind: "${topic.title}" from course ${course.code}.`)
            }
            className="yellow-gradient-btn px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>🤖</span>
            <span className="hidden sm:inline">Ask Cooper</span>
          </button>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-yellow-200 shadow-sm space-y-8">
        {/* Title Header */}
        <header className="space-y-4 border-b border-yellow-200/80 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono-code">
              Topic {topic.topicNumber}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono-code">
              ⏱️ {topic.note.readingMinutes || topic.estimatedMinutes} min reading time
            </span>
            <span className="text-xs text-slate-400 font-mono-code">
              • Updated {formatSafeDate(topic.note.updatedAt, { format: 'medium' })}
            </span>
          </div>

          <h1 className="font-adorn text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {topic.title}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-amber-800 font-mono-code">
            {course.code} • {course.title}
          </p>
        </header>

        {/* Key Takeaways Callout Box */}
        {topic.note.keyTakeaways && topic.note.keyTakeaways.length > 0 && (
          <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-yellow-50 via-amber-50/50 to-yellow-50 border-2 border-yellow-300 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="text-lg">💡</span>
              <h3 className="font-adorn text-base font-bold">
                Key Conceptual Takeaways
              </h3>
            </div>
            <ul className="space-y-2">
              {topic.note.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-yellow-300 text-yellow-950 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Body Structured Content */}
        <div className="prose prose-slate max-w-none">
          {renderStructuredContent(topic.note.content)}
        </div>

        {/* Handout Download Card if available */}
        {topic.note.handoutName && (
          <div className="p-4 rounded-2xl bg-yellow-50/60 border border-yellow-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <span className="block text-xs font-bold text-slate-900">
                  {topic.note.handoutName}
                </span>
                <span className="block text-[10px] text-slate-500 font-mono-code">
                  Official Academic Lecture Slide &amp; Notes
                </span>
              </div>
            </div>
            <a
              href={topic.note.handoutUrl || '#'}
              download={topic.note.handoutName}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-yellow-300 text-xs font-bold text-slate-800 hover:bg-yellow-100 transition-all shadow-2xs"
            >
              Download PDF
            </a>
          </div>
        )}

        {/* Practice Questions CTA Banner */}
        <section className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 border-2 border-yellow-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">✏️</span>
              <h4 className="font-adorn text-lg font-bold text-slate-950">
                Reinforce Your Knowledge
              </h4>
            </div>
            <p className="text-xs text-slate-600">
              There are {topic.questions.length} curated practice questions matching this topic.
            </p>
          </div>

          <button
            onClick={() => onOpenQuestions(topic.id)}
            className="yellow-gradient-btn px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 transition-all shrink-0 flex items-center gap-2"
          >
            <span>🎯</span>
            <span>Practice Questions ({topic.questions.length})</span>
          </button>
        </section>

        {/* Bottom Prev / Next Navigation Footer */}
        <footer className="pt-6 border-t border-yellow-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            {prevTopic ? (
              <button
                onClick={() => onNavigateTopic(prevTopic.id)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-yellow-200 hover:border-yellow-400 text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <span>← Previous</span>
                <span className="text-slate-400 hidden sm:inline truncate max-w-[150px]">
                  {prevTopic.title}
                </span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onToggleComplete(topic.id);
                if (nextTopic) onNavigateTopic(nextTopic.id);
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <span>✓ Mark Complete &amp; Next</span>
            </button>

            {nextTopic && (
              <button
                onClick={() => onNavigateTopic(nextTopic.id)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-yellow-200 hover:border-yellow-400 text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <span className="text-slate-400 hidden sm:inline truncate max-w-[150px]">
                  {nextTopic.title}
                </span>
                <span>Next →</span>
              </button>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
};
