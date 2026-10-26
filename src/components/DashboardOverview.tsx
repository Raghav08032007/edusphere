'use client';

import React from 'react';
import { StudyTask, FlashcardDeck, StudyNote } from '../types';
import { PomodoroTimer } from './PomodoroTimer';
import { ActiveTab } from './Navbar';

interface DashboardOverviewProps {
  tasks: StudyTask[];
  decks: FlashcardDeck[];
  notes: StudyNote[];
  streakDays: number;
  totalStudyMinutes: number;
  userXP: number;
  onToggleStatus: (id: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onSessionComplete: (minutes: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  decks,
  notes,
  streakDays,
  totalStudyMinutes,
  userXP,
  onToggleStatus,
  onNavigateTab,
  onSessionComplete,
}) => {
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high');
  const completedTodayCount = tasks.filter((t) => t.status === 'completed').length;

  const dailyGoalMinutes = 60;
  const todayMinutes = Math.min(totalStudyMinutes, 120);
  const goalProgress = Math.min(Math.round((todayMinutes / dailyGoalMinutes) * 100), 100);

  const achievements = [
    { id: 'a1', title: 'Deep Diver', icon: '🌊', desc: 'Completed 50m focus sprint', unlocked: true },
    { id: 'a2', title: 'Neural Pioneer', icon: '🧠', desc: 'Mastered 10+ AI & Transformer cards', unlocked: true },
    { id: 'a3', title: 'Streak Flame', icon: '🔥', desc: '7 days consistent learning', unlocked: true },
    { id: 'a4', title: 'MVSAT Glider', icon: '⚡', desc: '3x streak in Scholarship Arena', unlocked: userXP > 800 },
  ];

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-slate-50">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                ✨ Vedantu Adaptive Learning
              </span>
              <span className="text-xs text-slate-500 font-semibold">Scholar Cockpit &amp; MVSAT Hub</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Excel in Your Learning Journey
            </h1>
            <p className="text-sm text-slate-600 italic pt-1 border-l-2 border-orange-500 pl-3">
              &ldquo;Learning is the treasure that accompanies its owner everywhere.&rdquo;
              <span className="text-xs not-italic text-slate-500 block mt-0.5">— Academic Motto • Vedantu Scholar</span>
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Daily Goal Meter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[105px]">
              <div className="text-sm font-black text-orange-600 font-mono-code">{goalProgress}%</div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden my-1">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Daily Goal</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[100px]">
              <span className="text-xl">✅</span>
              <span className="block text-xl font-black text-slate-900 mt-1 font-heading">{completedTodayCount}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Completed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[100px]">
              <span className="text-xl">🔥</span>
              <span className="block text-xl font-black text-amber-500 mt-1 font-heading">{streakDays}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Day Streak</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[100px]">
              <span className="text-xl">💎</span>
              <span className="block text-xl font-black text-purple-600 mt-1 font-heading">{userXP}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Achievements Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎖️</span>
          <div>
            <h4 className="font-heading font-black text-sm text-slate-900">Scholar Honor Badges</h4>
            <p className="text-[11px] text-slate-500">Milestones unlocked through continuous study sprints</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                ach.unlocked
                  ? 'bg-orange-50 border-orange-200 text-orange-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
              title={ach.desc}
            >
              <span>{ach.icon}</span>
              <span>{ach.title}</span>
              {ach.unlocked && <span className="text-[10px] text-emerald-600 font-black">✓</span>}
            </div>
          ))}

          <button
            onClick={() => onNavigateTab('skills')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <span>🌳</span>
            <span>Skill Trees</span>
          </button>

          <button
            onClick={() => onNavigateTab('quiz')}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <span>⚡</span>
            <span>MVSAT Arena</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Focus Cockpit & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Focus Cockpit & Tasks (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
              <span>🎯</span>
              <span>Focus Cockpit &amp; Timer</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">Pomodoro + Ambient Soundwaves</span>
          </div>

          <PomodoroTimer onSessionComplete={onSessionComplete} />

          {/* High Priority Tasks Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
                <span>⚡</span>
                <span>Immediate Priority Tasks</span>
              </h3>
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-xs font-black text-orange-600 hover:underline"
              >
                View Pipeline ({tasks.length}) →
              </button>
            </div>

            <div className="space-y-2.5">
              {highPriorityTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  🎉 No urgent tasks pending! Great job staying ahead of schedule.
                </div>
              ) : (
                highPriorityTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleStatus(task.id)}
                        className="w-5 h-5 rounded-lg border border-slate-300 hover:border-emerald-500 flex items-center justify-center transition-colors bg-white shrink-0"
                        title="Mark as completed"
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span style={{ color: task.subjectColor }} className="font-bold">● {task.subject}</span>
                          <span>•</span>
                          <span>📅 Due: {task.dueDate}</span>
                          <span>•</span>
                          <span>⏱️ {task.estimatedMinutes} mins</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleStatus(task.id)}
                      className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all shrink-0"
                    >
                      Complete ✓
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Recall & Quick Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Recall Deck Highlights */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
                <span>🗂️</span>
                <span>Active Recall Decks</span>
              </h3>
              <button
                onClick={() => onNavigateTab('flashcards')}
                className="text-xs font-black text-orange-600 hover:underline"
              >
                Practice 3D Cards →
              </button>
            </div>

            <div className="space-y-3">
              {decks.slice(0, 3).map((deck) => {
                const total = deck.cards.length;
                const mastered = deck.cards.filter((c) => c.masteryLevel === 'mastered').length;
                const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

                return (
                  <div
                    key={deck.id}
                    onClick={() => onNavigateTab('flashcards')}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-heading text-xs font-black text-slate-900">{deck.title}</span>
                      <span className="text-xs font-black text-emerald-600 font-mono-code">{pct}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span style={{ color: deck.subjectColor }} className="font-bold">{deck.subject}</span>
                      <span>{mastered}/{total} Mastered</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Notes Snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
                <span>📝</span>
                <span>Recent Study Notes</span>
              </h3>
              <button
                onClick={() => onNavigateTab('notes')}
                className="text-xs font-black text-orange-600 hover:underline"
              >
                Open Notes Hub →
              </button>
            </div>

            <div className="space-y-2.5">
              {notes.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  onClick={() => onNavigateTab('notes')}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-900 truncate">{note.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{note.updatedAt}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {note.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono-code font-bold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
