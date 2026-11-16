'use client';

import React, { useState } from 'react';
import { UserProfile } from '../types';

export type ActiveTab = 'dashboard' | 'skills' | 'planner' | 'flashcards' | 'quiz' | 'notes' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onOpenAuthPortal: () => void;
  streakDays: number;
  completedTasksCount: number;
  totalStudyMinutes: number;
  userXP: number;
  cursorFX: boolean;
  setCursorFX: (fx: boolean) => void;
  onOpenTimer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthPortal,
  streakDays,
  completedTasksCount,
  totalStudyMinutes,
  userXP,
  cursorFX,
  setCursorFX,
  onOpenTimer,
}) => {
  const hours = (totalStudyMinutes / 60).toFixed(1);
  const userLevel = Math.floor(userXP / 250) + 1;
  const isStaff = currentUser.role === 'staff';
  const [coursesMenuOpen, setCoursesMenuOpen] = useState(false);

  const studentTabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'skills', label: 'Antigravity Skills', icon: '🌳' },
    { id: 'planner', label: 'Study Planner', icon: '📋' },
    { id: 'flashcards', label: '3D Flashcards', icon: '🗂️' },
    { id: 'quiz', label: 'MVSAT Quiz Arena', icon: '⚡' },
    { id: 'notes', label: 'Notes & AI Hub', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 1. Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Reference EdTech Dropdowns */}
        <div className="flex items-center gap-6">
          {/* Logo (Vedantu-inspired orange brandmark) */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff5e00] to-[#ff8400] flex items-center justify-center text-white text-2xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-2xl tracking-tight text-[#ff6200] leading-none">
                  Vedantu
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  Edusphere
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                LIVE Online Learning
              </p>
            </div>
          </div>

          {/* Vedantu-style Top Menu Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700">
            <div className="relative">
              <button
                onClick={() => setCoursesMenuOpen(!coursesMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors text-orange-600 font-extrabold"
              >
                <span>Courses</span>
                <span className="text-[10px]">▼</span>
              </button>

              {coursesMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                  <div
                    onClick={() => {
                      setActiveTab('skills');
                      setCoursesMenuOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600 cursor-pointer font-bold flex items-center gap-2"
                  >
                    <span>⏱️</span>
                    <span>2-Year JEE Program</span>
                  </div>
                  <div
                    onClick={() => {
                      setActiveTab('skills');
                      setCoursesMenuOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600 cursor-pointer font-bold flex items-center gap-2"
                  >
                    <span>▶️</span>
                    <span>2-Year NEET Program</span>
                  </div>
                  <div
                    onClick={() => {
                      setActiveTab('skills');
                      setCoursesMenuOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600 cursor-pointer font-bold flex items-center gap-2"
                  >
                    <span>🌳</span>
                    <span>Antigravity AI &amp; CS Tree</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('skills')}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Antigravity Skills
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Free Study Material
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 text-amber-700"
            >
              <span>⚡</span>
              <span>MVSAT 2026</span>
            </button>
          </nav>
        </div>

        {/* Right: Expert Helpline + Dual Sign-in Portal + XP */}
        <div className="flex items-center gap-3">
          {/* Vedantu Helpline Pill (from screenshot) */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
              📞
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-slate-500 font-bold uppercase leading-none">
                Talk to our experts
              </span>
              <span className="block text-xs font-mono-code font-black text-slate-900 leading-tight">
                1800-120-456-456
              </span>
            </div>
          </div>

          {/* Dual Login Role Switcher Pill */}
          <button
            onClick={onOpenAuthPortal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all shadow-xs ${
              isStaff
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-white border-slate-300 text-slate-900 hover:border-orange-500 hover:text-orange-600'
            }`}
            title="Switch between Student & Faculty Portal"
          >
            <span className="text-base">{currentUser.avatar}</span>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-black leading-none">
                {currentUser.name}
              </span>
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">
                {isStaff ? 'Faculty Portal' : 'Student Scholar'} • Switch
              </span>
            </div>
            <span className="text-slate-400 text-[10px]">▼</span>
          </button>

          {/* Student Badges */}
          {!isStaff && (
            <>
              {/* XP Badge */}
              <div
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold"
                title="Level and Total XP"
              >
                <span>💎</span>
                <span>Lvl {userLevel}</span>
                <span className="text-[10px] text-purple-500 font-mono-code">{userXP} XP</span>
              </div>

              {/* Study Hours */}
              <div
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold"
                title="Total Focus Hours"
              >
                <span>⏱️</span>
                <span>{hours}h</span>
              </div>

              {/* Tasks Completed */}
              <div
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold"
                title="Completed Study Tasks"
              >
                <span>✅</span>
                <span>{completedTasksCount}</span>
              </div>

              {/* Streak */}
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold"
                title="Daily Study Streak"
              >
                <span>🔥</span>
                <span>{streakDays}d</span>
              </div>
            </>
          )}

          {/* Cursor FX Toggle */}
          <button
            onClick={() => setCursorFX(!cursorFX)}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              cursorFX
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle Cursor Effect"
          >
            <span>🖱️</span>
            <span className="text-[11px]">Cursor FX</span>
          </button>

          {/* Quick Focus Button */}
          {!isStaff && onOpenTimer && (
            <button
              onClick={onOpenTimer}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>🎯</span>
              <span>Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Secondary Student Navigation Tabs Strip */}
      {!isStaff && (
        <div className="bg-slate-50/80 border-t border-slate-200 px-4 py-1.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5">
            {studentTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'quiz' && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold uppercase animate-pulse">
                      Live
                    </span>
                  )}
                  {tab.id === 'skills' && (
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 text-[9px] font-extrabold uppercase">
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
