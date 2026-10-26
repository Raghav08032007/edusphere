'use client';

import React from 'react';

interface FloatingContactDockProps {
  onOpenHelpline: () => void;
  onOpenCentres: () => void;
}

export const FloatingContactDock: React.FC<FloatingContactDockProps> = ({
  onOpenHelpline,
  onOpenCentres,
}) => {
  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col items-center gap-2.5 animate-fadeIn">
      {/* 1. Offline Centres (Purple) */}
      <button
        onClick={onOpenCentres}
        className="w-11 h-11 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all hover:scale-110 active:scale-95 group relative"
        title="Find Offline Learning Centres"
        aria-label="Offline Learning Centres"
      >
        <span className="text-lg">🏛️</span>
        <span className="absolute right-14 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          Offline Centres
        </span>
      </button>

      {/* 2. Call Expert Helpline (Orange) */}
      <button
        onClick={onOpenHelpline}
        className="w-11 h-11 rounded-full bg-[#ff6200] hover:bg-[#ea580c] text-white flex items-center justify-center shadow-lg shadow-orange-600/30 transition-all hover:scale-110 active:scale-95 group relative"
        title="Talk to Academic Expert: 1800-120-456"
        aria-label="Academic Expert Helpline"
      >
        <span className="text-lg">📞</span>
        <span className="absolute right-14 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          Call: 1800-120-456
        </span>
      </button>

      {/* 3. WhatsApp Support (Green) */}
      <a
        href="https://wa.me/?text=Hi%20Eduspheere%20Admissions"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg shadow-green-600/30 transition-all hover:scale-110 active:scale-95 group relative"
        title="Chat on WhatsApp"
        aria-label="WhatsApp Chat"
      >
        <span className="text-lg">💬</span>
        <span className="absolute right-14 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          WhatsApp Instant Doubt Help
        </span>
      </a>
    </div>
  );
};
