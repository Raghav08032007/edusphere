'use client';

import React, { useState, useMemo } from 'react';
import { Course, Question, DifficultyLevel } from '../../types/curriculum';
import { useCard3DTilt } from '../../hooks/useCard3DTilt';

interface TopicQuestionBankProps {
  courses: Course[];
  initialCourseId?: string;
  initialTopicId?: string;
  onAskCooper: (prompt: string) => void;
  onOpenTopicNote?: (courseId: string, topicId: string) => void;
}

interface AttemptState {
  selectedIndices: number[];
  submitted: boolean;
  isCorrect: boolean;
}

function QuestionCard({
  question,
  attempt,
  isBookmarked,
  onToggleBookmark,
  onAttemptChange,
  onSubmitAttempt,
  onResetAttempt,
  onAskCooper,
  onOpenTopicNote,
}: {
  question: Question;
  attempt?: AttemptState;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAttemptChange: (selected: number[]) => void;
  onSubmitAttempt: () => void;
  onResetAttempt: () => void;
  onAskCooper: () => void;
  onOpenTopicNote?: (courseId: string, topicId: string) => void;
}) {
  const { ref, style, onMouseMove, onMouseLeave } = useCard3DTilt<HTMLDivElement>({
    maxTilt: 3,
    scale: 1.008,
  });

  const selectedIndices = attempt?.selectedIndices || [];
  const isSubmitted = !!attempt?.submitted;
  const isCorrect = !!attempt?.isCorrect;

  const isMulti = question.type === 'mcq_multi';

  const handleOptionClick = (index: number) => {
    if (isSubmitted) return; // Locked once submitted until reset

    if (isMulti) {
      if (selectedIndices.includes(index)) {
        onAttemptChange(selectedIndices.filter((i) => i !== index));
      } else {
        onAttemptChange([...selectedIndices, index].sort());
      }
    } else {
      onAttemptChange([index]);
    }
  };

  const getDifficultyColor = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'Advanced':
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`bg-white rounded-3xl p-6 sm:p-8 border-2 shadow-xs transition-all space-y-6 ${
        isSubmitted
          ? isCorrect
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-rose-300 bg-rose-50/20'
          : 'border-yellow-200 hover:border-yellow-400'
      }`}
    >
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono-code">
            {question.courseName || question.courseId}
          </span>
          <span
            onClick={() => onOpenTopicNote?.(question.courseId, question.topicId)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono-code ${
              onOpenTopicNote ? 'hover:bg-yellow-200 cursor-pointer transition-colors' : ''
            }`}
            title={onOpenTopicNote ? 'Click to open topic notes' : undefined}
          >
            {question.topicTitle}
          </span>
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border font-mono-code ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-500 border border-yellow-200">
            {isMulti ? 'Multi-Select (Select all that apply)' : question.type === 'true_false' ? 'True / False' : 'Single Choice'}
          </span>
        </div>

        <button
          onClick={onToggleBookmark}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
            isBookmarked
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white text-slate-500 border-yellow-200 hover:bg-yellow-50'
          }`}
          title="Save question for later review"
        >
          <span>{isBookmarked ? '★' : '☆'}</span>
          <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </button>
      </div>

      {/* Question Text */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.questionText}
        </h3>

        {question.codeSnippet && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-yellow-300 font-mono-code text-xs leading-relaxed overflow-x-auto border border-slate-700">
            <pre>{question.codeSnippet}</pre>
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {question.options.map((opt, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const isTargetCorrect = question.correctIndices.includes(idx);

          let optionStyle = 'border-yellow-200/90 bg-white hover:border-yellow-400 hover:bg-yellow-50/40 text-slate-800';

          if (isSubmitted) {
            if (isTargetCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs';
            } else if (isSelected && !isTargetCorrect) {
              optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
            } else {
              optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
            }
          } else if (isSelected) {
            optionStyle = 'border-yellow-500 bg-yellow-50/90 text-slate-950 font-semibold shadow-2xs';
          }

          return (
            <div
              key={idx}
              onClick={() => handleOptionClick(idx)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${optionStyle}`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono-code font-bold shrink-0 mt-0.5 border ${
                  isSelected
                    ? isSubmitted
                      ? isTargetCorrect
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-yellow-400 text-slate-950 border-yellow-500'
                    : isSubmitted && isTargetCorrect
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                    : 'bg-white text-slate-500 border-yellow-200'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </div>

              <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                <span>{opt}</span>
              </div>

              {isSubmitted && isTargetCorrect && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 shrink-0 font-mono-code">
                  ✓ Correct Key
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {!isSubmitted ? (
            <button
              onClick={onSubmitAttempt}
              disabled={selectedIndices.length === 0}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-sm ${
                selectedIndices.length > 0
                  ? 'yellow-gradient-btn hover:scale-105'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={onResetAttempt}
              className="px-4 py-2 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 text-xs font-bold text-slate-800 transition-all cursor-pointer"
            >
              🔄 Try Again
            </button>
          )}

          {isSubmitted && (
            <span
              className={`text-xs font-extrabold flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono-code ${
                isCorrect
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {isCorrect ? '✓ Evaluation: Correct!' : '✗ Evaluation: Incorrect'}
            </span>
          )}
        </div>

        <button
          onClick={onAskCooper}
          className="px-3.5 py-1.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
          title="Get AI step-by-step breakdown"
        >
          <span>🤖</span>
          <span>Ask Cooper to Explain</span>
        </button>
      </div>

      {/* Academic Explanation Drawer */}
      {isSubmitted && (
        <div className="mt-4 p-5 rounded-2xl bg-amber-50/70 border-2 border-yellow-300 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base">📖</span>
            <h4 className="font-adorn text-sm font-bold text-amber-950">
              Faculty Academic Explanation
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export const TopicQuestionBank: React.FC<TopicQuestionBankProps> = ({
  courses,
  initialCourseId,
  initialTopicId,
  onAskCooper,
  onOpenTopicNote,
}) => {
  // Aggregate all questions across courses
  const allQuestions = useMemo(() => {
    const list: Question[] = [];
    courses.forEach((c) => {
      c.modules.forEach((m) => {
        m.topics.forEach((t) => {
          t.questions.forEach((q) => {
            list.push({
              ...q,
              courseName: c.code,
              moduleTitle: m.title,
              topicTitle: t.title,
            });
          });
        });
      });
    });
    return list;
  }, [courses]);

  // Filters state
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(
    initialCourseId || 'ALL'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);

  // Attempts state: questionId -> AttemptState
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedCourseFilter !== 'ALL' && q.courseId !== selectedCourseFilter) return false;
      if (initialTopicId && q.topicId !== initialTopicId) return false;
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
      if (selectedType !== 'ALL' && q.type !== selectedType) return false;
      if (bookmarkedOnly && !bookmarks.has(q.id)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inText = q.questionText.toLowerCase().includes(query);
        const inTopic = q.topicTitle.toLowerCase().includes(query);
        const inExp = q.explanation.toLowerCase().includes(query);
        if (!inText && !inTopic && !inExp) return false;
      }
      return true;
    });
  }, [
    allQuestions,
    selectedCourseFilter,
    initialTopicId,
    selectedDifficulty,
    selectedType,
    bookmarkedOnly,
    bookmarks,
    searchQuery,
  ]);

  // Submission handler
  const handleSelectIndices = (questionId: string, indices: number[]) => {
    setAttempts((prev) => ({
      ...prev,
      [questionId]: {
        selectedIndices: indices,
        submitted: false,
        isCorrect: false,
      },
    }));
  };

  const handleSubmitAttempt = (q: Question) => {
    const cur = attempts[q.id];
    if (!cur || cur.selectedIndices.length === 0) return;

    // Rigorous evaluation against correctIndices
    const selectedSorted = [...cur.selectedIndices].sort();
    const correctSorted = [...q.correctIndices].sort();
    const isCorrect =
      selectedSorted.length === correctSorted.length &&
      selectedSorted.every((val, index) => val === correctSorted[index]);

    setAttempts((prev) => ({
      ...prev,
      [q.id]: {
        ...cur,
        submitted: true,
        isCorrect,
      },
    }));
  };

  const handleResetAttempt = (questionId: string) => {
    setAttempts((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const toggleBookmark = (questionId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // Performance stats
  const totalAttempted = Object.values(attempts).filter((a) => a.submitted).length;
  const totalCorrect = Object.values(attempts).filter((a) => a.submitted && a.isCorrect).length;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-yellow-50 via-white to-amber-50/50 rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✏️</span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-mono-code">
              Academic Problem Bank
            </span>
          </div>
          <h1 className="font-adorn text-2xl sm:text-3xl font-extrabold text-slate-950">
            Curated Topic Question Bank
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Rigorously evaluated question sets with verifiable answer keys and deep conceptual faculty explanations.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-yellow-300 shadow-2xs">
          <div className="text-center px-3 border-r border-yellow-200">
            <span className="block text-[10px] font-bold text-slate-400 font-mono-code uppercase">
              Attempted
            </span>
            <span className="text-base font-black text-slate-900 font-mono-code">
              {totalAttempted} / {allQuestions.length}
            </span>
          </div>
          <div className="text-center px-3 border-r border-yellow-200">
            <span className="block text-[10px] font-bold text-slate-400 font-mono-code uppercase">
              Accuracy
            </span>
            <span className="text-base font-black text-amber-700 font-mono-code">
              {accuracy}%
            </span>
          </div>
          <div className="text-center px-3">
            <span className="block text-[10px] font-bold text-slate-400 font-mono-code uppercase">
              Saved
            </span>
            <span className="text-base font-black text-slate-800 font-mono-code">
              {bookmarks.size}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-yellow-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-extrabold uppercase font-mono-code text-slate-500 mb-1">
              Search Question or Concept
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Raft leader, Attention, Maxwell..."
              className="w-full px-3.5 py-2 rounded-xl border border-yellow-300 text-xs focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
          </div>

          {/* Course select */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase font-mono-code text-slate-500 mb-1">
              Course
            </label>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-yellow-300 text-xs bg-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value="ALL">All Enrolled Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.title.slice(0, 24)}...)
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty select */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase font-mono-code text-slate-500 mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-yellow-300 text-xs bg-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase font-mono-code text-slate-500 mb-1">
              Question Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-yellow-300 text-xs bg-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="mcq_single">Single Choice</option>
              <option value="mcq_multi">Multi-Select</option>
              <option value="true_false">True / False</option>
            </select>
          </div>
        </div>

        {/* Bookmarked Filter Pill */}
        <div className="flex items-center justify-between pt-2 border-t border-yellow-100 text-xs">
          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              bookmarkedOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-600 border-yellow-200 hover:bg-yellow-50'
            }`}
          >
            <span>★</span>
            <span>Show Bookmarked Only ({bookmarks.size})</span>
          </button>

          <span className="text-slate-400 font-mono-code text-[11px]">
            Showing {filteredQuestions.length} of {allQuestions.length} questions
          </span>
        </div>
      </div>

      {/* Questions Stack */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-yellow-300 space-y-3">
          <span className="text-4xl">🔍</span>
          <h3 className="font-adorn text-lg font-bold text-slate-800">
            No Questions Match Your Filter
          </h3>
          <p className="text-xs text-slate-500">
            Try resetting filters or searching with a different term.
          </p>
          <button
            onClick={() => {
              setSelectedCourseFilter('ALL');
              setSelectedDifficulty('ALL');
              setSelectedType('ALL');
              setSearchQuery('');
              setBookmarkedOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-yellow-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              attempt={attempts[q.id]}
              isBookmarked={bookmarks.has(q.id)}
              onToggleBookmark={() => toggleBookmark(q.id)}
              onAttemptChange={(indices) => handleSelectIndices(q.id, indices)}
              onSubmitAttempt={() => handleSubmitAttempt(q)}
              onResetAttempt={() => handleResetAttempt(q.id)}
              onOpenTopicNote={onOpenTopicNote}
              onAskCooper={() =>
                onAskCooper(
                  `Help me dissect this question: "${q.questionText}". Options are: ${q.options.join(
                    ' | '
                  )}. Explain why the right answer is correct.`
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
