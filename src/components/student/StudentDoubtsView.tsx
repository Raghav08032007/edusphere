'use client';

import React, { useState } from 'react';
import { AcademicClass, DoubtPriority, StudentDoubt, UserProfile } from '../../types/supabase';

interface StudentDoubtsViewProps {
  currentUser: UserProfile;
  classes: AcademicClass[];
  doubts: StudentDoubt[];
  onPostDoubt: (doubt: Omit<StudentDoubt, 'id' | 'createdAt' | 'answers'>) => void;
  onAskCooper: (question: string) => void;
}

export const StudentDoubtsView: React.FC<StudentDoubtsViewProps> = ({
  currentUser,
  classes,
  doubts,
  onPostDoubt,
  onAskCooper,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'answered' | 'resolved'>('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // New doubt form state
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [subject, setSubject] = useState(classes[0]?.subject || 'Physics');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<DoubtPriority>('medium');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter doubts for this student or class
  const myDoubts = doubts.filter((d) => {
    const isMine = d.studentId === currentUser.id;
    if (filterStatus === 'all') return isMine;
    return isMine && d.status === filterStatus;
  });

  const handleClassSelect = (cid: string) => {
    setSelectedClassId(cid);
    const cls = classes.find((c) => c.id === cid);
    if (cls) setSubject(cls.subject);
  };

  const handleSubmitDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

    onPostDoubt({
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      classId: currentClass.id,
      className: currentClass.name,
      subject,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'unresolved',
      tags: [subject, priority],
    });

    setTitle('');
    setDescription('');
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsPostModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-yellow-50/60 via-amber-50/30 to-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 font-mono-code">
                🎓 Doubts Clearance Hub
              </span>
              <span className="text-xs text-slate-500 font-bold">Ask Teachers &amp; Cooper AI</span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Post Doubts &amp; Clear Concept Blocks
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never stay stuck on an equation or theory. Submit questions directly to Dr. K. Rajan and faculty, or consult Cooper AI for instant step-by-step mathematical reasoning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="yellow-gradient-btn px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
            >
              <span>✍️</span>
              <span>Ask a New Doubt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Doubts Management Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-yellow-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-yellow-50/70 border border-yellow-200 rounded-2xl">
          {(['all', 'unresolved', 'answered', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
                filterStatus === st
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-bold">
          Showing <span className="text-amber-700 font-mono-code font-black">{myDoubts.length}</span> question{myDoubts.length !== 1 ? 's' : ''} on record
        </div>
      </div>

      {/* Doubts Feed */}
      {myDoubts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-yellow-300 text-center space-y-3">
          <span className="text-4xl">💡</span>
          <h3 className="font-adorn text-xl font-bold text-slate-900">No Doubts Registered</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You currently have no questions under this category. Click &ldquo;Ask a New Doubt&rdquo; to send a query to your faculty.
          </p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="yellow-gradient-btn px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer mt-2"
          >
            Post Question Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {myDoubts.map((doubt) => {
            const isAnswered = doubt.status === 'answered';
            const isResolved = doubt.status === 'resolved';

            return (
              <div
                key={doubt.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-100 shadow-xs hover:border-yellow-300 transition-all space-y-5"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 font-mono-code">
                      {doubt.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {doubt.className}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono-code ${
                        doubt.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : doubt.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Priority: {doubt.priority}
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono-code ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isAnswered
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-200 text-amber-900 animate-pulse'
                      }`}
                    >
                      {doubt.status}
                    </span>
                  </div>
                </div>

                {/* Question Info */}
                <div className="space-y-2">
                  <h3 className="font-adorn text-xl font-bold text-slate-900">
                    {doubt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-yellow-50/40 p-4 rounded-2xl border border-yellow-100">
                    {doubt.description}
                  </p>
                </div>

                {/* Answers Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-adorn text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>💬</span>
                      <span>Faculty &amp; Peer Answers ({doubt.answers.length})</span>
                    </h4>

                    {/* Ask Cooper shortcut */}
                    <button
                      onClick={() => onAskCooper(`Explain and help me solve my doubt: "${doubt.title}"`)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>🤖 Ask Cooper to Explain</span>
                    </button>
                  </div>

                  {doubt.answers.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-yellow-50/40 border border-dashed border-yellow-200 text-xs text-slate-500 italic flex items-center justify-between">
                      <span>Awaiting review from your class faculty. Cooper AI can provide immediate guidance.</span>
                      <button
                        onClick={() => onAskCooper(`How do I solve: ${doubt.description}`)}
                        className="px-3 py-1 rounded-xl bg-yellow-400 text-slate-950 font-black text-[11px] shadow-xs cursor-pointer ml-2"
                      >
                        Ask Cooper Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {doubt.answers.map((ans) => (
                        <div
                          key={ans.id}
                          className={`p-4 sm:p-5 rounded-2xl text-xs space-y-2 border ${
                            ans.isOfficialStaffAnswer
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <div className="flex items-center gap-2">
                              <span>{ans.authorRole === 'staff' ? '👨‍🏫' : '🎓'}</span>
                              <span className="text-sm font-bold">{ans.authorName}</span>
                              {ans.isOfficialStaffAnswer && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono-code">
                                  Official Faculty Solution
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono-code">
                              {new Date(ans.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <p className="leading-relaxed font-medium pl-6 text-slate-800 text-xs sm:text-sm">
                            {ans.answerText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Doubt Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-yellow-50 transition-colors"
            >
              ✕
            </button>

            <div className="border-b border-yellow-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 font-mono-code block">
                Direct Faculty Advisory Channel
              </span>
              <h2 className="font-adorn text-2xl font-black text-slate-900">
                Submit Academic Doubt
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your question will be routed to your course professor and stored in your profile.
              </p>
            </div>

            {isSubmitted && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <span>✓</span>
                <span>Doubt successfully registered and dispatched to faculty!</span>
              </div>
            )}

            <form onSubmit={handleSubmitDoubt} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Academic Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-yellow-50/30 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Urgency Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as DoubtPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="low">Low — General inquiry</option>
                    <option value="medium">Medium — Upcoming assignment</option>
                    <option value="high">High — Exam preparation</option>
                    <option value="urgent">Urgent — Immediate blockage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Doubt Title / Core Question</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Poynting Vector Direction in Cylindrical Capacitor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Detailed Explanation of Confusion</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly where you are stuck, what step you reached, and which formula seems inconsistent..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="yellow-gradient-btn px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  🚀 Dispatch to Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
