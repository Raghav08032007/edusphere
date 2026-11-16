'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_STAFF_USERS } from '@/lib/supabaseClient';
import { UserProfile } from '@/types/supabase';

export default function MentorLoginPage() {
  const router = useRouter();

  const [selectedStaffIndex, setSelectedStaffIndex] = useState(0);
  const selectedMentor = DEMO_STAFF_USERS[selectedStaffIndex] || DEMO_STAFF_USERS[0];

  const [email, setEmail] = useState(selectedMentor.email);
  const [password, setPassword] = useState('faculty@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSelectMentor = (index: number) => {
    setSelectedStaffIndex(index);
    const m = DEMO_STAFF_USERS[index];
    if (m) {
      setEmail(m.email);
      setPassword('faculty@2026');
    }
  };

  const handleMentorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('Authenticating mentor credentials & loading Video Studio...');

    const mentorProfile: UserProfile = {
      ...selectedMentor,
      email: email.trim() || selectedMentor.email,
      role: 'staff',
      authProvider: 'email',
    };

    try {
      localStorage.setItem('studypilot_active_user', JSON.stringify(mentorProfile));
      localStorage.setItem('studypilot_role', 'staff');
    } catch {}

    setTimeout(() => {
      setIsLoading(false);
      // Redirect straight into the Mentor Video Studio tab
      router.push('/?tab=staff-videos&role=staff');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] flex flex-col justify-between selection:bg-yellow-300 selection:text-slate-950 font-sans">
      {/* Top Header */}
      <header className="border-b border-yellow-200/90 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md border border-yellow-300 text-lg">
            👨‍🏫
          </div>
          <div>
            <span className="font-adorn text-2xl font-black tracking-tight text-slate-950 block leading-tight">
              Edusphere
            </span>
            <span className="text-[10px] uppercase font-mono-code text-amber-900 font-extrabold tracking-wider block">
              Faculty &amp; Mentor Gateway
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-yellow-200 bg-yellow-50/60 px-3.5 py-2 rounded-xl hover:bg-yellow-100 transition-all flex items-center gap-1.5"
          >
            <span>← Student Cockpit</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row items-center gap-12 justify-center">
        {/* Left Side: Value Proposition & Studio Features */}
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-100 text-yellow-950 border border-yellow-300 text-xs font-black uppercase font-mono-code shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Dedicated Faculty &amp; Mentor Login</span>
          </div>

          <h1 className="font-adorn text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Author Interactive Video Lectures &amp; Notes
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
            Welcome to the instructor portal. Seamlessly publish university lectures with <strong>mandatory in-video checkpoints</strong>, and upload course notes in <strong>any format</strong> (PDF, Word, PowerPoint, Markdown).
          </p>

          {/* 3 Value Pillars */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border-2 border-yellow-200 shadow-2xs flex items-start gap-3.5">
              <span className="text-2xl p-2 rounded-xl bg-yellow-100 shrink-0">🎬</span>
              <div>
                <h3 className="font-adorn text-sm font-black text-slate-900">
                  Interactive Video Player with Auto-Rewind
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Embed YouTube, Vimeo, or MP4 files. Videos auto-pause at timestamps and rewind students who answer incorrectly to guarantee mastery.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-yellow-200 shadow-2xs flex items-start gap-3.5">
              <span className="text-2xl p-2 rounded-xl bg-yellow-100 shrink-0">📚</span>
              <div>
                <h3 className="font-adorn text-sm font-black text-slate-900">
                  Universal Document Upload (Any Format)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Attach PDFs, Word documents (<code>.docx</code>), PowerPoint slides (<code>.pptx</code>), or Markdown notes with live KaTeX formula rendering.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-yellow-200 shadow-2xs flex items-start gap-3.5">
              <span className="text-2xl p-2 rounded-xl bg-yellow-100 shrink-0">✨</span>
              <div>
                <h3 className="font-adorn text-sm font-black text-slate-900">
                  1-Click AI Subtitle Question Generation
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Paste any YouTube link to auto-extract transcript speech and generate verified multiple-choice checkpoints instantly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Mentor Login Card */}
        <div className="lg:w-1/2 max-w-md w-full bg-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-6 relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase font-mono-code px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950">
                Staff Authentication
              </span>
              <span className="text-[11px] text-slate-500 font-mono-code font-bold">
                Dean &amp; Faculty Console
              </span>
            </div>
            <h2 className="font-adorn text-2xl font-black text-slate-900">
              Sign In as Mentor
            </h2>
            <p className="text-xs text-slate-500">
              Select an official instructor profile below or enter your institutional credentials:
            </p>
          </div>

          {/* Quick Mentor Profile Selectors */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase font-mono-code text-slate-700">
              Select Mentor Profile:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_STAFF_USERS.map((mentor, idx) => {
                const isSelected = selectedStaffIndex === idx;
                return (
                  <button
                    key={mentor.id}
                    type="button"
                    onClick={() => handleSelectMentor(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-100/90 border-yellow-500 shadow-xs'
                        : 'bg-yellow-50/40 hover:bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-yellow-300 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 font-mono-code">
                      {mentor.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 block truncate">
                          {mentor.fullName}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono-code font-bold text-amber-800 bg-yellow-200 px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono-code block truncate">
                        {mentor.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleMentorLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-[11px] font-black uppercase font-mono-code text-slate-700 mb-1">
                Faculty Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="k.rajan@vedantu.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/30 text-xs font-mono-code text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase font-mono-code text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/30 text-xs font-mono-code text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <span className="text-[10px] text-slate-500 font-mono-code mt-1 block">
                Default Faculty Password: <code>faculty@2026</code>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-slate-700 font-bold text-xs">Stay signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{isLoading ? '⏳' : '🚀'}</span>
              <span>
                {isLoading
                  ? 'Entering Studio...'
                  : `Sign In as ${selectedMentor.fullName.split(' ')[0]} & Open Studio`}
              </span>
            </button>

            {statusMessage && (
              <p className="text-xs text-center font-mono-code font-bold text-amber-900 bg-yellow-100 p-2.5 rounded-xl animate-fadeIn">
                {statusMessage}
              </p>
            )}
          </form>

          <div className="pt-2 border-t border-yellow-100 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
            >
              Looking for student login instead? Click here &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-200/90 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Edusphere Multi-Modal Academic System • Authorized Faculty &amp; Instructor Access
      </footer>
    </div>
  );
}
