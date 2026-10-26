'use client';

import React, { useState } from 'react';

interface VedantuHeroBannerProps {
  onTakeTest: () => void;
  onExploreCourses: () => void;
}

export const VedantuHeroBanner: React.FC<VedantuHeroBannerProps> = ({
  onTakeTest,
  onExploreCourses,
}) => {
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. Top Announcement Bar (Vedantu MVSAT Dark Banner) */}
      {isAlertVisible && (
        <div className="w-full bg-[#0d1117] text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-md relative z-20">
          <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-heading font-black text-amber-400 tracking-wider text-sm">
                MVSAT 2026
              </span>
              <span className="hidden sm:inline text-slate-500">|</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  LIVE
                </span>
                <span className="font-semibold text-slate-200">
                  Online MVSAT is Now LIVE — Win scholarships, MacBooks, laptops, drones &amp; more
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[11px] hidden md:inline">
                ⏰ Window Ends: <strong className="text-amber-400">25th Oct</strong>
              </span>
              <button
                onClick={onTakeTest}
                className="px-4 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xs"
              >
                Take MVSAT Now
              </button>
              <button
                onClick={() => setIsAlertVisible(false)}
                className="text-slate-400 hover:text-white p-1 text-sm leading-none"
                aria-label="Close Announcement"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Hero Section (Radiant Orange Backdrop matching reference) */}
      <div className="vedantu-hero-bg rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Headlines & Call to Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black uppercase tracking-wider shadow-xs">
              <span>🔥</span>
              <span>On Popular Demand!</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                Online MVSAT <br className="hidden sm:inline" />
                <span className="text-amber-200">Extended Till 25th Oct</span>
              </h1>
              <p className="text-base sm:text-xl font-medium text-orange-100 max-w-xl italic drop-shadow-sm">
                Don&apos;t Miss the National Scholarship Test That Rewards Your Dreams
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onTakeTest}
                className="px-8 py-3.5 rounded-2xl bg-[#ffbe1a] hover:bg-[#ffc83b] text-slate-950 font-heading font-black text-sm sm:text-base shadow-xl shadow-amber-950/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Register Now for Free</span>
                <span className="text-lg">→</span>
              </button>

              <button
                onClick={onExploreCourses}
                className="px-6 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-heading font-bold text-sm transition-all hover:scale-105 active:scale-95"
              >
                Explore Syllabus &amp; Tracks
              </button>
            </div>

            {/* 4 Scholarship Stats Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
              <div className="vedantu-stat-tile p-3 text-center">
                <span className="text-xl block mb-0.5">🎓</span>
                <span className="block font-heading font-black text-base sm:text-lg leading-tight text-white">
                  UP TO 100%
                </span>
                <span className="text-[10px] text-orange-100 font-semibold block uppercase">
                  Scholarship on Courses
                </span>
              </div>

              <div className="vedantu-stat-tile p-3 text-center">
                <span className="text-xl block mb-0.5">🏆</span>
                <span className="block font-heading font-black text-base sm:text-lg leading-tight text-amber-200 font-mono-code">
                  ₹150 CRORE
                </span>
                <span className="text-[10px] text-orange-100 font-semibold block uppercase">
                  Worth of Scholarship
                </span>
              </div>

              <div className="vedantu-stat-tile p-3 text-center">
                <span className="text-xl block mb-0.5">👑</span>
                <span className="block font-heading font-black text-base sm:text-lg leading-tight text-white">
                  GET AIR
                </span>
                <span className="text-[10px] text-orange-100 font-semibold block uppercase">
                  Among 2.5L Test Takers
                </span>
              </div>

              <div className="vedantu-stat-tile p-3 text-center">
                <span className="text-xl block mb-0.5">🎁</span>
                <span className="block font-heading font-black text-base sm:text-lg leading-tight text-amber-200 font-mono-code">
                  ₹2.5 CRORE
                </span>
                <span className="text-[10px] text-orange-100 font-semibold block uppercase">
                  Prizes &amp; Gadgets
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Trophy & Champion Medal (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Golden Sunburst Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/40 via-yellow-200/30 to-transparent blur-2xl animate-pulse" />

              {/* 3D Trophy Card */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center text-6xl shadow-xl shadow-amber-600/40 border-4 border-white/60 mb-3 animate-bounce">
                  🏆
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-mono-code mb-2">
                  <span>AIR 1 • SCHOLAR CHAMPION</span>
                </div>

                <h3 className="font-heading font-black text-xl text-white">
                  Celebrate Your Success
                </h3>
                <p className="text-xs text-orange-100 max-w-xs mt-1">
                  Join 10,000+ Students entering IITs, AIIMS, and Top Engineering Universities
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs font-bold text-amber-200">
                  <span>⭐ 100% Free Registration</span>
                  <span>•</span>
                  <span>⚡ Instant Results</span>
                </div>
              </div>
            </div>

            {/* Carousel navigation indicator dots */}
            <div className="flex items-center gap-2 mt-4">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === idx ? 'w-8 bg-amber-300' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
