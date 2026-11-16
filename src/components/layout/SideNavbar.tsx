'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserProfile, UserRole } from '../../types/supabase';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
  isNew?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SideNavbarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenCooper: () => void;
  onOpenAuth: () => void;
  unresolvedDoubtsCount: number;
  flaskOnline?: boolean;
}

export const SideNavbar: React.FC<SideNavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchRole,
  onOpenCooper,
  onOpenAuth,
  unresolvedDoubtsCount,
  flaskOnline = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isStaff = currentUser.role === 'staff';

  const studentSections: NavSection[] = [
    {
      title: 'ACADEMIC SUITE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'courses', label: 'Courses & Modules', icon: '🎓' },
        { id: 'notes', label: 'Notes & Formulas', icon: '📚' },
        { id: 'question-bank', label: 'Question Bank', icon: '✏️' },
      ],
    },
    {
      title: 'INNOVATION & LABS',
      items: [
        { id: 'labs', label: 'Open Labs & Tools', icon: '🧪', isNew: true },
        { id: 'arena', label: 'Trig Arena 🎮', icon: '⚔️' },
        { id: 'quizzes', label: 'Course Quizzes', icon: '🏆' },
      ],
    },
    {
      title: 'CAMPUS & ASSISTANT',
      items: [
        { id: 'attendance', label: 'Attendance', icon: '📅' },
        {
          id: 'doubts',
          label: 'Doubt Clearing',
          icon: '❓',
          badge: unresolvedDoubtsCount > 0 ? unresolvedDoubtsCount : undefined,
        },
        { id: 'cooper', label: 'Cooper AI Copilot', icon: '🤖' },
      ],
    },
  ];

  const staffSections: NavSection[] = [
    {
      title: 'FACULTY & MENTOR SUITE',
      items: [
        { id: 'staff-videos', label: 'Upload Videos & Notes', icon: '📹', isNew: true },
        { id: 'staff-notes', label: 'Publish Notes', icon: '📝' },
        { id: 'staff-attendance', label: 'Mark Attendance', icon: '📅' },
        {
          id: 'staff-doubts',
          label: 'Student Doubts',
          icon: '❓',
          badge: unresolvedDoubtsCount > 0 ? unresolvedDoubtsCount : undefined,
        },
        { id: 'cooper', label: 'Cooper Assistant', icon: '🤖' },
      ],
    },
    {
      title: 'COURSE PREVIEWS & LABS',
      items: [
        { id: 'courses', label: 'View Curriculum', icon: '🎓' },
        { id: 'labs', label: 'STEM Labs & Tools', icon: '🧪' },
        { id: 'arena', label: 'Trig Arena Preview', icon: '⚔️' },
      ],
    },
  ];

  const sections = isStaff ? staffSections : studentSections;

  const handleSelectTab = (tabId: string) => {
    if (tabId === 'cooper') {
      onOpenCooper();
    } else {
      setActiveTab(tabId);
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-yellow-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-950 font-bold transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-xs text-sm">
              ⚡
            </div>
            <span className="font-adorn font-black text-lg tracking-tight text-slate-950">
              Edusphere
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-bold text-emerald-800 font-mono-code">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Flask :5000
          </span>
          <Link
            href="/login"
            className="px-3 py-1 rounded-xl bg-yellow-400 text-slate-950 text-xs font-bold shadow-2xs"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#fffdfa] border-r-2 border-yellow-300 shadow-xl flex flex-col justify-between transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-68'} w-72`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="p-4 sm:p-5 border-b border-yellow-200 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* 3D Animated Logo Emblem */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 p-0.5 shadow-md flex items-center justify-center shrink-0 transform hover:rotate-6 transition-transform cursor-pointer">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-yellow-400 font-black text-lg">
                  ⚡
                </div>
              </div>

              {!isCollapsed && (
                <div className="transition-opacity duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-adorn font-black text-xl tracking-tight text-slate-950">
                      Edusphere
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-yellow-300 text-yellow-950 text-[9px] font-black uppercase font-mono-code">
                      SAAS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wide">
                    Study · Analyze · Master
                  </p>
                </div>
              )}
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-7 h-7 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-slate-700 items-center justify-center text-xs font-bold transition-all cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>

          {/* Backend Status indicator banner */}
          {!isCollapsed && (
            <div className="mx-4 mt-3 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] font-mono-code">
              <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Flask API :5000
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                Online
              </span>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-250px)]">
            {sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!isCollapsed && (
                  <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono-code block">
                    {sec.title}
                  </span>
                )}

                <div className="space-y-1 pt-1">
                  {sec.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 text-left relative cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                            : 'text-slate-700 hover:bg-yellow-100/70 hover:text-slate-950'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {/* Active Left Glow Accent */}
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-slate-950" />
                        )}

                        <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>

                        {!isCollapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}

                        {!isCollapsed && item.isNew && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white font-mono-code shadow-2xs">
                            NEW
                          </span>
                        )}

                        {!isCollapsed && item.badge !== undefined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white font-mono-code shadow-2xs">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Cockpit Footer */}
        <div className="p-3 border-t border-yellow-200 bg-yellow-50/50 space-y-3">
          {/* Role Switcher Pill */}
          {!isCollapsed ? (
            <div className="p-1 rounded-2xl bg-white border border-yellow-200 flex items-center justify-between text-xs font-bold shadow-2xs">
              <button
                onClick={() => onSwitchRole('student')}
                className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
                  !isStaff
                    ? 'bg-yellow-400 text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🎓 Student
              </button>
              <button
                onClick={() => onSwitchRole('staff')}
                className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
                  isStaff
                    ? 'bg-yellow-400 text-slate-950 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                👨‍🏫 Faculty
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSwitchRole(isStaff ? 'student' : 'staff')}
              className="w-full py-2 rounded-xl bg-yellow-200 hover:bg-yellow-300 text-slate-900 text-xs font-bold text-center"
              title={`Switch to ${isStaff ? 'Student' : 'Faculty'}`}
            >
              {isStaff ? '👨‍🏫' : '🎓'}
            </button>
          )}

          {/* User Profile Card */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-2xs">
                {(currentUser.fullName || 'User').charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    {currentUser.fullName}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono-code truncate">
                    {currentUser.email}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <Link
                  href="/mentor-login"
                  className="px-2 py-1 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-[10px] font-black transition-all shadow-2xs border border-yellow-500 whitespace-nowrap"
                  title="Dedicated Mentor & Faculty Studio Login"
                >
                  Mentor Login 👨‍🏫
                </Link>
                <Link
                  href="/login"
                  className="px-2 py-1 rounded-xl bg-white hover:bg-yellow-100 border border-yellow-300 text-slate-900 text-[10px] font-bold transition-all shadow-2xs whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
