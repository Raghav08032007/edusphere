'use client';

import React, { useState } from 'react';
import { UserProfile } from '../../types/supabase';

interface GamifiedArenaViewProps {
  currentUser: UserProfile;
  onBackToDashboard: () => void;
}

export const GamifiedArenaView: React.FC<GamifiedArenaViewProps> = ({
  currentUser,
  onBackToDashboard,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-yellow-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 font-mono-code">
              🎮 TrigQuest • Academic Boss Arena
            </span>
            <span className="text-xs text-emerald-600 font-bold">✓ Live Gamified Mode</span>
          </div>
          <h1 className="font-adorn text-2xl sm:text-3xl font-black text-slate-950">
            Trigonometry Champion Battle
          </h1>
          <p className="text-xs text-slate-600 max-w-xl mt-1">
            Pick your scholar champion, solve high-stakes trigonometry questions under pressure, and defeat academic bosses to earn mastery XP and stars!
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => window.open('/gamified-arena.html', '_blank')}
            className="px-4 py-2.5 rounded-2xl bg-white border border-yellow-300 text-xs font-bold text-slate-800 hover:bg-yellow-50 cursor-pointer shadow-2xs flex items-center gap-2"
            title="Launch game in dedicated full-screen tab"
          >
            <span>↗</span>
            <span>Pop-out Window</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="yellow-gradient-btn px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <span>{isFullscreen ? '🗗' : '⛶'}</span>
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Arena'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Game Cabinet Container */}
      <div
        className={`relative rounded-3xl overflow-hidden border-2 border-slate-900 shadow-2xl transition-all ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none border-0'
            : 'w-full h-[680px] sm:h-[780px] bg-slate-950'
        }`}
      >
        {isFullscreen && (
          <div className="absolute top-3 right-4 z-50 flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(false)}
              className="bg-slate-900/90 text-white border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 cursor-pointer"
            >
              ✕ Exit Fullscreen
            </button>
          </div>
        )}

        <iframe
          src="/gamified-arena.html"
          title="Edusphere TrigQuest Arena"
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
        />
      </div>

      {/* Gamification Stats Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-yellow-200 shadow-2xs flex items-center gap-3">
          <span className="text-3xl">⚔️</span>
          <div>
            <span className="text-[10px] uppercase font-mono-code text-slate-400 font-bold block">
              Active Scholar
            </span>
            <span className="text-sm font-black text-slate-900 block">
              {currentUser.fullName}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-yellow-200 shadow-2xs flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <span className="text-[10px] uppercase font-mono-code text-slate-400 font-bold block">
              Arena Reward
            </span>
            <span className="text-sm font-black text-amber-700 block">
              +150 XP per Boss Victory
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-yellow-200 shadow-2xs flex items-center gap-3">
          <span className="text-3xl">📐</span>
          <div>
            <span className="text-[10px] uppercase font-mono-code text-slate-400 font-bold block">
              Topic Mastery
            </span>
            <span className="text-sm font-black text-slate-900 block">
              Trigonometric Identities &amp; Waves
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
