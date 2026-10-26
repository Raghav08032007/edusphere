'use client';

import React from 'react';
import { DailyStudyLog, StudyTask, FlashcardDeck } from '../types';

interface AnalyticsViewProps {
  logs: DailyStudyLog[];
  tasks: StudyTask[];
  decks: FlashcardDeck[];
  userXP: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs, tasks, decks, userXP }) => {
  const totalWeeklyHours = logs.reduce((acc, log) => acc + log.hours, 0);
  const totalWeeklyTasks = logs.reduce((acc, log) => acc + log.tasksCompleted, 0);
  const maxHours = Math.max(...logs.map((l) => l.hours), 6);

  // Subject allocation
  const subjectHoursMap: Record<string, { color: string; count: number }> = {};
  tasks.forEach((t) => {
    if (!subjectHoursMap[t.subject]) {
      subjectHoursMap[t.subject] = { color: t.subjectColor, count: 0 };
    }
    subjectHoursMap[t.subject].count += t.estimatedMinutes / 60;
  });

  const totalSubjectHours = Object.values(subjectHoursMap).reduce((a, b) => a + b.count, 0) || 1;

  // Flashcards mastery
  let totalCards = 0;
  let masteredCards = 0;
  decks.forEach((d) => {
    totalCards += d.cards.length;
    masteredCards += d.cards.filter((c) => c.masteryLevel === 'mastered').length;
  });
  const overallMastery = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const currentLevel = Math.floor(userXP / 250) + 1;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black mb-2">
            <span>📈 Learning Telemetry &amp; Velocity</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span>Study Analytics &amp; Performance Metrics</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Track weekly focus hours, task velocity, recall retention rates, and MVSAT scholarship readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
          <span>⚡ Level {currentLevel} Scholar Standing</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Weekly Study Hours</span>
            <span>⏱️</span>
          </div>
          <p className="font-heading text-3xl sm:text-4xl font-black text-slate-900 mt-2 font-mono-code">
            {totalWeeklyHours.toFixed(1)} <span className="text-sm font-semibold text-slate-500">hrs</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-bold">
            <span>↑ 18%</span>
            <span className="text-slate-500 font-normal">increase compared to last week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Tasks Completed</span>
            <span>✅</span>
          </div>
          <p className="font-heading text-3xl sm:text-4xl font-black text-orange-600 mt-2 font-mono-code">
            {totalWeeklyTasks} <span className="text-sm font-semibold text-slate-500">tasks</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-bold">
            <span>94%</span>
            <span className="text-slate-500 font-normal">completion velocity</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Recall Retention Rate</span>
            <span>🧠</span>
          </div>
          <p className="font-heading text-3xl sm:text-4xl font-black text-indigo-600 mt-2 font-mono-code">
            {overallMastery}% <span className="text-sm font-semibold text-slate-500">mastery</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-indigo-600 mt-2 font-bold">
            <span>{masteredCards}/{totalCards} Flashcards Mastered</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Total Experience</span>
            <span>💎</span>
          </div>
          <p className="font-heading text-3xl sm:text-4xl font-black text-amber-500 mt-2 font-mono-code">
            {userXP} <span className="text-sm font-semibold text-slate-500">XP</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-amber-700 mt-2 font-bold">
            <span>Level {currentLevel} • Next tier at {(currentLevel) * 250} XP</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Focus Time Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
              <span>📊</span>
              <span>Weekly Daily Focus Distribution</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">Last 7 Days</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {logs.map((log) => {
              const heightPercent = Math.round((log.hours / maxHours) * 100);
              return (
                <div key={log.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono-code text-slate-400 group-hover:text-slate-800 transition-colors font-bold">
                    {log.hours}h
                  </span>

                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden p-1">
                    <div
                      className="w-full bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-600">{log.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Allocation Radar / Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
              <span>🎯</span>
              <span>Curriculum Subject Distribution</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">{tasks.length} Tasks Total</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(subjectHoursMap).map(([subject, data]) => {
              const pct = Math.round((data.count / totalSubjectHours) * 100);
              return (
                <div key={subject} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      {subject}
                    </span>
                    <span className="font-mono-code text-slate-500 font-bold">
                      {data.count.toFixed(1)}h ({pct}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: data.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
