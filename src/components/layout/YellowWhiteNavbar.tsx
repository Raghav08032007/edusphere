'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile, UserRole } from '../../types/supabase';

interface YellowWhiteNavbarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenCooper: () => void;
  onOpenAuth: () => void;
  unresolvedDoubtsCount: number;
}

export const YellowWhiteNavbar: React.FC<YellowWhiteNavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchRole,
  onOpenCooper,
  onOpenAuth,
  unresolvedDoubtsCount,
}) => {
  const isStaff = currentUser.role === 'staff';

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'courses', label: 'Courses', icon: '🎓' },
    { id: 'notes', label: 'Notes', icon: '📚' },
    { id: 'question-bank', label: 'Questions', icon: '✏️' },
    { id: 'quizzes', label: 'Quizzes', icon: '🏆' },
    { id: 'arena', label: 'Arena 🎮', icon: '⚔️' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'doubts', label: 'Doubts', icon: '❓', badge: unresolvedDoubtsCount > 0 ? unresolvedDoubtsCount : undefined },
    { id: 'cooper', label: 'Cooper AI', icon: '🤖' },
  ];

  const staffNavItems = [
    { id: 'staff-videos', label: 'Upload Videos & Notes', icon: '📹' },
    { id: 'staff-notes', label: 'Publish Notes', icon: '📝' },
    { id: 'staff-attendance', label: 'Mark Attendance', icon: '📅' },
    { id: 'staff-doubts', label: 'Student Doubts', icon: '❓', badge: unresolvedDoubtsCount > 0 ? unresolvedDoubtsCount : undefined },
    { id: 'cooper', label: 'Cooper Assistant', icon: '🤖' },
  ];

  const navItems = isStaff ? staffNavItems : studentNavItems;

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'google':
        return (
          <span
            className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center font-bold text-[9px] text-[#4285F4] border border-slate-200 shadow-2xs"
            title="Authenticated via Google OAuth"
          >
            G
          </span>
        );
      case 'github':
        return (
          <span
            className="w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center font-bold text-[8px] text-white shadow-2xs"
            title="Authenticated via GitHub OAuth"
          >
            🐙
          </span>
        );
      case 'apple':
        return (
          <span
            className="w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center font-bold text-[8px] text-white shadow-2xs"
            title="Authenticated via Apple ID / iOS"
          >
            
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-yellow-200/90 shadow-2xs">
      {/* Top Banner Alert Strip */}
      <div className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 text-slate-900 text-xs font-semibold px-4 py-1 text-center border-b border-yellow-300/80 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-ping" />
        <span>
          Active Academic Session • Role:{' '}
          <strong className="underline decoration-slate-900/40">
            {isStaff ? 'Faculty & Staff (Dean Console)' : 'Student Scholar Cockpit'}
          </strong>
        </span>
        {!isStaff && (
          <Link
            href="/mentor-login"
            className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-950 text-yellow-300 text-[10px] font-black uppercase font-mono-code hover:bg-slate-800 transition-all shadow-2xs"
          >
            Mentor Studio Login 👨‍🏫 →
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Name with Adorn Typography */}
          <div
            onClick={() => setActiveTab(isStaff ? 'staff-notes' : 'dashboard')}
            className="flex items-center gap-3.5 cursor-pointer select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-400 to-yellow-200 flex items-center justify-center text-xl shadow-md shadow-yellow-500/25 border-2 border-white">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-adorn text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Edusphere
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 font-mono-code">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Study, Analyze &amp; Clear Doubts
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-yellow-50/70 p-1.5 rounded-2xl border border-yellow-200/90">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-xs border border-yellow-300 font-extrabold scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-amber-500 text-white font-mono-code">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Auth Login, Role Switcher & Cooper Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Account & OAuth Login Trigger */}
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1.5 rounded-2xl bg-white border border-yellow-300 hover:border-yellow-500 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer text-left"
              title="Account & Login (Google, GitHub, Apple iOS)"
            >
              <div className="relative">
                {currentUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-xl object-cover border border-yellow-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-yellow-200 text-slate-800 flex items-center justify-center text-xs font-bold font-mono-code">
                    {currentUser.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {currentUser.authProvider && (
                  <div className="absolute -bottom-1 -right-1">
                    {getProviderIcon(currentUser.authProvider)}
                  </div>
                )}
              </div>

              <div className="hidden xl:block">
                <span className="block text-xs font-extrabold text-slate-900 truncate max-w-[95px] leading-tight">
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <span className="text-[9px] text-amber-800 font-mono-code font-bold block leading-tight">
                  {currentUser.authProvider
                    ? currentUser.authProvider.toUpperCase()
                    : 'Sign In'}
                </span>
              </div>
            </button>

            {/* Quick Cooper Launcher Button */}
            <button
              onClick={onOpenCooper}
              className="yellow-gradient-btn px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-yellow-400 cursor-pointer shadow-2xs"
              title="Launch Cooper AI Assistant"
            >
              <span className="w-2 h-2 rounded-full bg-amber-950/70 animate-pulse" />
              <span className="font-extrabold">Cooper</span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded-md bg-white/40 text-[9px] font-mono-code">
                MCP
              </span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-white border border-yellow-200 rounded-2xl p-1 shadow-2xs">
              <button
                onClick={() => onSwitchRole('student')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isStaff
                    ? 'bg-yellow-400 text-slate-950 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-yellow-50'
                }`}
              >
                <span>🎓</span>
                <span className="hidden sm:inline">Student</span>
              </button>

              <button
                onClick={() => onSwitchRole('staff')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isStaff
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-yellow-50'
                }`}
              >
                <span>👨‍🏫</span>
                <span className="hidden sm:inline">Staff</span>
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Subnav with smooth horizontal scrolling */}
        <div className="flex lg:hidden items-center py-2.5 border-t border-yellow-100 gap-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 border border-yellow-500 shadow-2xs'
                    : 'bg-yellow-50/70 text-slate-600 hover:bg-white border border-yellow-200/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-amber-500 text-white font-mono-code">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
