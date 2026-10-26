'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CourseQuiz, QuizAttemptResult } from '../../types/curriculum';

interface QuizAssessmentViewProps {
  quiz: CourseQuiz;
  courseTitle?: string;
  onCompleteQuiz: (result: QuizAttemptResult) => void;
  onExitQuiz: () => void;
  onAskCooper: (prompt: string) => void;
}

export const QuizAssessmentView: React.FC<QuizAssessmentViewProps> = ({
  quiz,
  courseTitle,
  onCompleteQuiz,
  onExitQuiz,
  onAskCooper,
}) => {
  // Phase: 'intro' | 'active' | 'review_results'
  const [phase, setPhase] = useState<'intro' | 'active' | 'review_results'>('intro');

  // Active question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User answers map: questionId -> array of selected option indices
  const [userAnswers, setUserAnswers] = useState<Record<string, number[]>>({});

  // Marked for review set
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  // Confirm submission modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Timer: seconds remaining
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    quiz.timeLimitMinutes * 60
  );
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Final result record
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(null);

  // Question Navigator drawer visibility on mobile
  const [showNavDrawer, setShowNavDrawer] = useState<boolean>(false);

  // Time spent tracking
  const startTimeRef = useRef<number>(0);

  const handleFinalSubmitRef = useRef<() => void>(() => {});

  // Evaluation logic
  const handleFinalSubmit = useCallback(() => {
    setIsTimerRunning(false);
    setShowConfirmModal(false);

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      const selected = (userAnswers[q.id] || []).sort();
      const correct = [...q.correctIndices].sort();
      const isCorrect =
        selected.length === correct.length &&
        selected.every((val, idx) => val === correct[idx]);

      if (isCorrect) correctCount++;
    });

    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = percentage >= quiz.passingScore;
    const timeSpentSeconds = Math.max(
      1,
      Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000)
    );

    const result: QuizAttemptResult = {
      quizId: quiz.id,
      courseId: quiz.courseId,
      score: correctCount,
      totalQuestions: total,
      correctCount,
      percentage,
      passed,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      userAnswers,
    };

    setAttemptResult(result);
    setPhase('review_results');
    onCompleteQuiz(result);
  }, [quiz, userAnswers, onCompleteQuiz]);

  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Auto submit when time runs out!
            handleFinalSubmitRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining]);

  const handleStartQuiz = () => {
    setSecondsRemaining(quiz.timeLimitMinutes * 60);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    setPhase('active');
  };

  const handleToggleOption = (questionId: string, optionIdx: number, isMultiChoice: boolean) => {
    setUserAnswers((prev) => {
      const existing = prev[questionId] || [];
      if (isMultiChoice) {
        if (existing.includes(optionIdx)) {
          return { ...prev, [questionId]: existing.filter((i) => i !== optionIdx) };
        } else {
          return { ...prev, [questionId]: [...existing, optionIdx].sort() };
        }
      } else {
        return { ...prev, [questionId]: [optionIdx] };
      }
    });
  };

  const handleClearAnswer = (questionId: string) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleToggleReviewFlag = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // Format mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQ = quiz.questions[currentIndex];
  const isMulti = currentQ?.type === 'mcq_multi';
  const selectedForCurrent = (currentQ && userAnswers[currentQ.id]) || [];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. INTRO / INSTRUCTIONS SCREEN */}
      {phase === 'intro' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-yellow-200 shadow-md space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-yellow-200 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono-code">
                Formal Academic Assessment
              </span>
              <h1 className="font-adorn text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1">
                {quiz.title}
              </h1>
              {courseTitle && (
                <p className="text-xs font-semibold text-amber-800 font-mono-code">
                  Course: {courseTitle}
                </p>
              )}
            </div>

            <button
              onClick={onExitQuiz}
              className="px-4 py-2 rounded-xl bg-white border border-yellow-200 hover:border-yellow-400 text-xs font-bold text-slate-600 transition-all cursor-pointer"
            >
              ← Back to Syllabus
            </button>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {quiz.description ||
              'This assessment evaluates your conceptual synthesis, algorithmic proofs, and practical engineering trade-offs. Ensure you have dedicated time and a reliable connection before beginning.'}
          </p>

          {/* Assessment Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-yellow-50/70 border border-yellow-300 space-y-1">
              <span className="text-xl">⏱️</span>
              <span className="block text-[10px] uppercase font-mono-code text-slate-500 font-bold">
                Time Limit
              </span>
              <span className="block text-xl font-black text-slate-900 font-mono-code">
                {quiz.timeLimitMinutes} Minutes
              </span>
              <span className="text-[11px] text-slate-500">
                Auto-submits on expiration
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-yellow-50/70 border border-yellow-300 space-y-1">
              <span className="text-xl">❓</span>
              <span className="block text-[10px] uppercase font-mono-code text-slate-500 font-bold">
                Total Questions
              </span>
              <span className="block text-xl font-black text-slate-900 font-mono-code">
                {quiz.questions.length} Items
              </span>
              <span className="text-[11px] text-slate-500">
                Single and multi-select items
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-yellow-50/70 border border-yellow-300 space-y-1">
              <span className="text-xl">🎯</span>
              <span className="block text-[10px] uppercase font-mono-code text-slate-500 font-bold">
                Passing Threshold
              </span>
              <span className="block text-xl font-black text-amber-800 font-mono-code">
                {quiz.passingScore}% Correct
              </span>
              <span className="text-[11px] text-slate-500">
                Minimum for verified certificate
              </span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span>📋</span>
              <span>Assessment Rules &amp; Protocols</span>
            </h4>
            <ul className="space-y-1.5 list-disc ml-5 text-slate-600">
              <li>You may navigate back and forth between questions before submitting.</li>
              <li>Questions marked for review are flagged for your attention in the navigator.</li>
              <li>Multi-select items require all correct choices to be selected for full credit.</li>
              <li>Detailed faculty explanations and correct answer keys will be revealed after submission.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartQuiz}
              className="yellow-gradient-btn px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🚀</span>
              <span>Start Assessment Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE QUIZ SESSION */}
      {phase === 'active' && currentQ && (
        <div className="space-y-6">
          {/* Top Control Sticky Header */}
          <header className="sticky top-20 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-yellow-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 font-mono-code">
                {quiz.title}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>
                  Question {currentIndex + 1} of {quiz.questions.length}
                </span>
                <span>•</span>
                <span className="text-amber-800">
                  {answeredCount} Answered
                </span>
              </div>
            </div>

            {/* Countdown Clock */}
            <div
              className={`px-4 py-2 rounded-xl border-2 font-mono-code text-sm font-black flex items-center gap-2 shadow-xs ${
                secondsRemaining < 120
                  ? 'bg-rose-100 text-rose-800 border-rose-400 animate-pulse'
                  : 'bg-yellow-50 text-slate-900 border-yellow-300'
              }`}
            >
              <span>⏱️</span>
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNavDrawer(!showNavDrawer)}
                className="px-3.5 py-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📑</span>
                <span className="hidden sm:inline">Grid Navigator</span>
              </button>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="yellow-gradient-btn px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Submit Quiz
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Navigator Drawer/Sidebar */}
            <div
              className={`lg:block ${
                showNavDrawer ? 'block' : 'hidden'
              } lg:col-span-1 bg-white p-5 rounded-3xl border-2 border-yellow-200 shadow-2xs space-y-4`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-adorn text-sm font-bold text-slate-900">
                  Question Map
                </h4>
                <span className="text-[10px] text-slate-500 font-mono-code font-bold">
                  {answeredCount}/{quiz.questions.length} done
                </span>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2">
                {quiz.questions.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id]?.length;
                  const isCurrent = idx === currentIndex;
                  const isFlagged = markedForReview.has(q.id);

                  let btnStyle = 'bg-slate-50 text-slate-600 border-slate-200';
                  if (isAnswered) {
                    btnStyle = 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
                  }
                  if (isFlagged) {
                    btnStyle = 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
                  }
                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-yellow-500 ring-offset-1';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowNavDrawer(false);
                      }}
                      className={`h-9 rounded-xl border text-xs font-mono-code transition-all cursor-pointer flex items-center justify-center relative ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-yellow-100 space-y-1.5 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-300" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-50 border border-slate-200" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>

            {/* Current Question View */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-sm space-y-6">
              {/* Question metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-mono-code">
                    Item {currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500 font-mono-code">
                    {currentQ.topicTitle}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono-code">
                    {currentQ.difficulty}
                  </span>
                </div>

                {/* Mark for review toggle */}
                <button
                  onClick={() => handleToggleReviewFlag(currentQ.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    markedForReview.has(currentQ.id)
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'bg-white text-slate-500 border-yellow-200 hover:bg-yellow-50'
                  }`}
                >
                  <span>🚩</span>
                  <span>{markedForReview.has(currentQ.id) ? 'Flagged for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Prompt */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.questionText}
                </h3>
                {isMulti && (
                  <p className="text-xs text-amber-800 font-semibold font-mono-code">
                    ℹ️ Multi-select question. Select all options that apply.
                  </p>
                )}
                {currentQ.codeSnippet && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-yellow-300 font-mono-code text-xs leading-relaxed overflow-x-auto border border-slate-700">
                    <pre>{currentQ.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = selectedForCurrent.includes(optIdx);

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleToggleOption(currentQ.id, optIdx, isMulti)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-50/90 text-slate-950 font-semibold shadow-2xs'
                          : 'border-yellow-200/90 bg-white hover:border-yellow-400 hover:bg-yellow-50/40 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono-code font-bold shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-yellow-400 text-slate-950 border-yellow-500'
                            : 'bg-white text-slate-500 border-yellow-200'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                        {optionText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-yellow-100">
                <button
                  onClick={() => handleClearAnswer(currentQ.id)}
                  disabled={selectedForCurrent.length === 0}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer"
                >
                  Clear Selection
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 disabled:opacity-40 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                  >
                    ← Previous
                  </button>

                  {currentIndex < quiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="yellow-gradient-btn px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                    >
                      Review &amp; Finish
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMIT MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-yellow-400 shadow-2xl space-y-6">
            <div className="space-y-2">
              <span className="text-3xl">📝</span>
              <h3 className="font-adorn text-xl font-bold text-slate-950">
                Confirm Assessment Submission
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have answered <strong>{answeredCount}</strong> out of{' '}
                <strong>{quiz.questions.length}</strong> questions.
                {answeredCount < quiz.questions.length && (
                  <span className="block mt-1 text-rose-600 font-semibold">
                    Warning: You have {quiz.questions.length - answeredCount} unanswered questions!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-yellow-300 text-xs font-bold text-slate-700 hover:bg-yellow-50 cursor-pointer"
              >
                Back to Questions
              </button>
              <button
                onClick={handleFinalSubmit}
                className="yellow-gradient-btn px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
              >
                Confirm &amp; Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-QUIZ RESULTS & REVIEW SCREEN */}
      {phase === 'review_results' && attemptResult && (
        <div className="space-y-8">
          {/* Results Hero Card */}
          <div
            className={`rounded-3xl p-8 sm:p-10 border-2 shadow-md space-y-6 ${
              attemptResult.passed
                ? 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50 border-emerald-400'
                : 'bg-gradient-to-br from-amber-50 via-white to-rose-50 border-amber-400'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono-code ${
                    attemptResult.passed
                      ? 'bg-emerald-200 text-emerald-950'
                      : 'bg-amber-200 text-amber-950'
                  }`}
                >
                  {attemptResult.passed ? '✓ Assessment Passed' : 'Needs Review'}
                </span>
                <h1 className="font-adorn text-3xl sm:text-4xl font-extrabold text-slate-950">
                  {quiz.title} Results
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartQuiz}
                  className="px-4 py-2.5 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                >
                  🔄 Retake Assessment
                </button>
                <button
                  onClick={onExitQuiz}
                  className="yellow-gradient-btn px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Return to Syllabus
                </button>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono-code text-slate-400 font-bold">
                  Final Score
                </span>
                <span className="block text-2xl font-black text-slate-900 font-mono-code">
                  {attemptResult.percentage}%
                </span>
                <span className="text-[10px] text-slate-500">
                  Passing mark: {quiz.passingScore}%
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono-code text-slate-400 font-bold">
                  Correct Items
                </span>
                <span className="block text-2xl font-black text-emerald-700 font-mono-code">
                  {attemptResult.correctCount} / {attemptResult.totalQuestions}
                </span>
                <span className="text-[10px] text-slate-500">
                  Evaluated against key
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono-code text-slate-400 font-bold">
                  Time Spent
                </span>
                <span className="block text-2xl font-black text-slate-900 font-mono-code">
                  {Math.floor(attemptResult.timeSpentSeconds / 60)}m {attemptResult.timeSpentSeconds % 60}s
                </span>
                <span className="text-[10px] text-slate-500">
                  Limit: {quiz.timeLimitMinutes} mins
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono-code text-slate-400 font-bold">
                  Status
                </span>
                <span
                  className={`block text-xl font-black font-mono-code ${
                    attemptResult.passed ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {attemptResult.passed ? 'PASSED' : 'RETAKE'}
                </span>
                <span className="text-[10px] text-slate-500">
                  Academic record logged
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Question by Question Review */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-adorn text-xl font-bold text-slate-950 flex items-center gap-2">
                <span>📖</span>
                <span>Question-by-Question Solution Breakdown</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono-code">
                {quiz.questions.length} Items Evaluated
              </span>
            </div>

            {quiz.questions.map((q, idx) => {
              const selected = (userAnswers[q.id] || []).sort();
              const correct = [...q.correctIndices].sort();
              const isItemCorrect =
                selected.length === correct.length &&
                selected.every((val, i) => val === correct[i]);

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border-2 shadow-2xs space-y-5 ${
                    isItemCorrect ? 'border-emerald-300' : 'border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 font-mono-code">
                        Question {idx + 1}
                      </span>
                      <span
                        className={`text-xs font-bold font-mono-code ${
                          isItemCorrect ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isItemCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        onAskCooper(
                          `Explain question ${idx + 1} from ${quiz.title}: "${q.questionText}". The correct answer is option(s) ${q.correctIndices
                            .map((i) => String.fromCharCode(65 + i))
                            .join(', ')}.`
                        )
                      }
                      className="px-3 py-1 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🤖</span>
                      <span>Ask Cooper</span>
                    </button>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.questionText}
                  </h4>

                  {q.codeSnippet && (
                    <div className="p-3.5 rounded-2xl bg-slate-900 text-yellow-300 font-mono-code text-xs leading-relaxed overflow-x-auto">
                      <pre>{q.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Options with grading */}
                  <div className="space-y-2">
                    {q.options.map((optText, optIdx) => {
                      const wasSelected = selected.includes(optIdx);
                      const isKey = q.correctIndices.includes(optIdx);

                      let style = 'border-slate-200 bg-white text-slate-600';
                      if (isKey) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      } else if (wasSelected && !isKey) {
                        style = 'border-rose-400 bg-rose-50 text-rose-950';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-2xl border-2 flex items-start justify-between gap-3 text-xs leading-relaxed ${style}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono-code font-bold">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{optText}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {wasSelected && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono-code font-bold">
                                Your Choice
                              </span>
                            )}
                            {isKey && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono-code font-bold">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Faculty Explanation */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-yellow-300 space-y-1 text-xs text-slate-700 leading-relaxed">
                    <span className="block font-adorn font-bold text-amber-950">
                      Faculty Explanation:
                    </span>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
