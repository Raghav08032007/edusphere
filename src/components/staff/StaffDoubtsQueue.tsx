'use client';

import React, { useState } from 'react';
import { DoubtAnswer, StudentDoubt, UserProfile } from '../../types/supabase';

interface StaffDoubtsQueueProps {
  currentUser: UserProfile;
  doubts: StudentDoubt[];
  onAnswerDoubt: (doubtId: string, answer: Omit<DoubtAnswer, 'id' | 'createdAt'>, markResolved?: boolean) => void;
}

export const StaffDoubtsQueue: React.FC<StaffDoubtsQueueProps> = ({
  currentUser,
  doubts,
  onAnswerDoubt,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'answered' | 'resolved'>('all');
  const [activeDoubtId, setActiveDoubtId] = useState<string | null>(doubts[0]?.id || null);
  const [answerText, setAnswerText] = useState('');
  const [markResolved, setMarkResolved] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredDoubts = doubts.filter((d) => {
    if (filterStatus === 'all') return true;
    return d.status === filterStatus;
  });

  const activeDoubt = doubts.find((d) => d.id === activeDoubtId) || filteredDoubts[0] || null;

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoubt || !answerText.trim()) return;

    onAnswerDoubt(
      activeDoubt.id,
      {
        doubtId: activeDoubt.id,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorRole: 'staff',
        answerText: answerText.trim(),
        isOfficialStaffAnswer: true,
      },
      markResolved
    );

    setAnswerText('');
    setMarkResolved(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const unresolvedCount = doubts.filter((d) => d.status === 'unresolved').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-yellow-50/60 via-amber-50/30 to-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 font-mono-code">
                👨‍🏫 Faculty Portal • Doubts Clearance Queue
              </span>
              <span className="text-xs text-slate-500 font-bold">Faculty Advisory Desk</span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Student Doubts &amp; Conceptual Clearances
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Inspect submitted student questions, formulate authoritative solutions, and resolve academic blocks. Answers appear immediately in student portals.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-yellow-200 shadow-xs text-center min-w-[110px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Pending Doubts</span>
              <span className="font-adorn text-3xl font-black text-amber-600 mt-0.5 block">
                {unresolvedCount}
              </span>
              <span className="text-[10px] text-rose-600 font-bold block">Action Needed</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-yellow-200 shadow-xs text-center min-w-[110px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Queries</span>
              <span className="font-adorn text-3xl font-black text-slate-800 mt-0.5 block">
                {doubts.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">Class Enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Doubts List on Left, Answering Desk on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Doubts Feed */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-yellow-50/70 border border-yellow-200 rounded-2xl">
            {(['all', 'unresolved', 'answered', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-slate-950 shadow-xs border border-yellow-300'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Doubts List */}
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredDoubts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-dashed border-yellow-300 text-center space-y-2">
                <span className="text-3xl">🎉</span>
                <p className="text-slate-700 font-bold text-sm">No doubts matching this filter.</p>
                <p className="text-xs text-slate-400">All student queries in this category have been processed.</p>
              </div>
            ) : (
              filteredDoubts.map((d) => {
                const isSelected = activeDoubt?.id === d.id;

                return (
                  <div
                    key={d.id}
                    onClick={() => setActiveDoubtId(d.id)}
                    className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-50/40 shadow-sm'
                        : 'border-yellow-100 bg-white hover:border-yellow-300 hover:bg-yellow-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-mono-code">
                          {d.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {d.studentName || 'Student'}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          d.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'answered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <h4 className="font-adorn text-base font-bold text-slate-900 line-clamp-1">
                      {d.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {d.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-yellow-100">
                      <span>{d.className || 'Class'}</span>
                      <span className="font-mono-code font-bold text-slate-600">
                        {d.answers.length} answer{d.answers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Doubt Detail & Answering Desk */}
        <div className="lg:col-span-7">
          {activeDoubt ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm space-y-6">
              {/* Doubt Header */}
              <div className="space-y-3 border-b border-yellow-100 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono-code">
                      {activeDoubt.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {activeDoubt.className}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black uppercase px-3 py-1 rounded-full font-mono-code ${
                      activeDoubt.priority === 'urgent'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : activeDoubt.priority === 'high'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Priority: {activeDoubt.priority}
                  </span>
                </div>

                <h2 className="font-adorn text-2xl font-bold text-slate-900">
                  {activeDoubt.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Asked by: <strong>{activeDoubt.studentName}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="uppercase">{activeDoubt.status}</strong></span>
                </div>
              </div>

              {/* Student Question Box */}
              <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                  Question Description
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {activeDoubt.description}
                </p>
              </div>

              {/* Existing Answers Thread */}
              <div className="space-y-3">
                <h4 className="font-adorn text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>💬</span>
                  <span>Discussion &amp; Solutions Thread ({activeDoubt.answers.length})</span>
                </h4>

                {activeDoubt.answers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                    No solutions posted yet. Formulate the official faculty answer below.
                  </p>
                ) : (
                  activeDoubt.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-2xl text-xs space-y-1.5 border ${
                        ans.isOfficialStaffAnswer
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold">
                          <span>{ans.authorRole === 'staff' ? '👨‍🏫' : '🎓'}</span>
                          <span>{ans.authorName}</span>
                          {ans.isOfficialStaffAnswer && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono-code">
                              Official Faculty Solution
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ans.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed font-medium pl-6">
                        {ans.answerText}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Formulate Faculty Answer */}
              <form onSubmit={handleSendAnswer} className="space-y-4 pt-4 border-t border-yellow-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Official Faculty Response
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markResolved}
                      onChange={(e) => setMarkResolved(e.target.checked)}
                      className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-400 border-yellow-300"
                    />
                    <span>Mark ticket as Resolved</span>
                  </label>
                </div>

                <textarea
                  rows={4}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Provide a clear, detailed mathematical or conceptual solution with step-by-step guidance..."
                  className="w-full p-4 rounded-2xl border border-yellow-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-400"
                  required
                />

                {isSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    ✓ Official answer published and student notified!
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="yellow-gradient-btn px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    ✉️ Post Official Faculty Answer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-yellow-200 text-center space-y-2">
              <span className="text-4xl">❓</span>
              <h3 className="font-adorn text-xl font-bold text-slate-900">Select a Doubt</h3>
              <p className="text-xs text-slate-400">Click on any question on the left to review the query and submit an answer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
