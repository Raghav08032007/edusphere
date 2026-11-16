'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthPortalProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const STUDENT_PROFILE: UserProfile = {
  id: 'usr-student-1',
  role: 'student',
  name: 'Param Sahar',
  email: 'param.sahar@vedantu.edu',
  department: 'Computer Science & Antigravity AI',
  avatar: '👨‍🎓',
  xp: 1420,
};

export const STAFF_PROFILE: UserProfile = {
  id: 'usr-staff-1',
  role: 'staff',
  name: 'Dr. K. Rajan',
  email: 'rajan.dean@vedantu.edu',
  department: 'Dean of Faculty, Department of Computer Science & Engineering',
  avatar: '👨‍🏫',
  xp: 3850,
};

export const AuthPortal: React.FC<AuthPortalProps> = ({
  currentUser,
  onSelectUser,
  isOpen,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Vedantu & Antigravity Branding Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black tracking-wide">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>Edusphere Academic Suite • Learning Portal</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dual Academy Portal Login
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Select your account profile to access personalized courses, skill trees, or faculty evaluation tools.
          </p>
        </div>

        {/* Two Portal Cards (Student vs Faculty in English) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {/* Card 1: Student Login */}
          <div
            onClick={() => setSelectedRole('student')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedRole === 'student'
                ? 'border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-500/10 scale-[1.02]'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">👨‍🎓</span>
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'student'
                    ? 'border-orange-500 bg-orange-500 text-white text-xs font-black'
                    : 'border-slate-300'
                }`}
              >
                {selectedRole === 'student' && '✓'}
              </span>
            </div>

            <h3 className="font-heading font-black text-lg text-slate-900">
              Student Scholar Portal
            </h3>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
              Scholar Cockpit
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Access the MVSAT 2026 Test Arena, 3D Flashcards, Antigravity Skill Trees, Focus Timer, and Course Trackers.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center gap-2">
              <span className="text-lg">🧑‍💻</span>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-800">{STUDENT_PROFILE.name}</span>
                <span className="block text-[11px] text-slate-400 truncate max-w-[180px]">
                  {STUDENT_PROFILE.email}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Faculty & Staff Login */}
          <div
            onClick={() => setSelectedRole('staff')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedRole === 'staff'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">👨‍🏫</span>
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'staff'
                    ? 'border-emerald-600 bg-emerald-600 text-white text-xs font-black'
                    : 'border-slate-300'
                }`}
              >
                {selectedRole === 'staff' && '✓'}
              </span>
            </div>

            <h3 className="font-heading font-black text-lg text-slate-900">
              Faculty &amp; Staff Portal
            </h3>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
              Dean &amp; Evaluator
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Student roster assessment, syllabus task assignments, academic announcements, and official Antigravity skill certifications.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center gap-2">
              <span className="text-lg">👨‍🏫</span>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-800">{STAFF_PROFILE.name}</span>
                <span className="block text-[11px] text-slate-400 truncate max-w-[180px]">
                  {STAFF_PROFILE.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span>🔒</span>
            <span>Single Sign-On • Vedantu Academic Directory</span>
          </div>

          <button
            onClick={() => {
              onSelectUser(selectedRole === 'student' ? STUDENT_PROFILE : STAFF_PROFILE);
              onClose();
            }}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-heading font-black text-sm text-white shadow-md transition-all hover:scale-105 active:scale-95 ${
              selectedRole === 'student'
                ? 'bg-[#ff6200] hover:bg-[#ea580c] shadow-orange-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
            }`}
          >
            {selectedRole === 'student' ? (
              <span>Continue as Student Scholar →</span>
            ) : (
              <span>Enter Faculty Portal →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
