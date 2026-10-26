'use client';

import React from 'react';
import { AttendanceRecord, UserProfile } from '../../types/supabase';

interface StudentAttendanceViewProps {
  currentUser: UserProfile;
  attendanceRecords: AttendanceRecord[];
  onAskCooper: () => void;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  currentUser,
  attendanceRecords,
  onAskCooper,
}) => {
  // Scoped strictly to logged-in student (enforcing RLS behavior)
  const myRecords = attendanceRecords
    .filter((a) => a.studentId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalClasses = myRecords.length;
  const presentCount = myRecords.filter((a) => a.status === 'present').length;
  const lateCount = myRecords.filter((a) => a.status === 'late').length;
  const absentCount = myRecords.filter((a) => a.status === 'absent').length;
  const excusedCount = myRecords.filter((a) => a.status === 'excused').length;

  const percentage =
    totalClasses > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalClasses) * 100) : 100;

  const isDistinction = percentage >= 85;
  const isSafe = percentage >= 75 && percentage < 85;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-yellow-50/60 via-amber-50/30 to-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 font-mono-code">
                🎓 Personal Attendance Dossier
              </span>
              <span className="text-xs text-slate-500 font-bold">Verified Student Record</span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              My Academic Attendance &amp; Standing
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every lecture attended is recorded in the immutable attendance ledger. Maintain above 75% for exam eligibility and above 85% for Dean&apos;s Merit recognition.
            </p>
          </div>

          <button
            onClick={onAskCooper}
            className="yellow-gradient-btn px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-md"
          >
            <span>🤖</span>
            <span>Analyze with Cooper MCP</span>
          </button>
        </div>
      </div>

      {/* Metrics Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Percentage Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-yellow-300 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Attendance Rate
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isDistinction
                  ? 'bg-emerald-100 text-emerald-800'
                  : isSafe
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isDistinction ? 'Distinction' : isSafe ? 'Good' : 'Warning'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-adorn text-4xl font-black text-slate-950">
              {percentage}%
            </span>
            <span className="text-xs text-slate-400 font-medium">overall rate</span>
          </div>

          <div className="w-full bg-yellow-100 h-2.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDistinction ? 'bg-amber-500' : isSafe ? 'bg-yellow-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Present Days */}
        <div className="bg-white p-6 rounded-3xl border border-yellow-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Present Sessions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-adorn text-4xl font-black text-emerald-600">
              {presentCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">of {totalClasses} classes</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-3">
            ✓ Full attendance awarded
          </span>
        </div>

        {/* Late Days */}
        <div className="bg-white p-6 rounded-3xl border border-yellow-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Late Sessions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-adorn text-4xl font-black text-amber-500">
              {lateCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">recorded sessions</span>
          </div>
          <span className="text-[11px] text-amber-700 font-semibold block mt-3">
            Weighted at 0.5 credits
          </span>
        </div>

        {/* Absent Days */}
        <div className="bg-white p-6 rounded-3xl border border-yellow-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Absences
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-adorn text-4xl font-black text-rose-500">
              {absentCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {excusedCount > 0 ? `(${excusedCount} excused)` : 'unexcused'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-3">
            {absentCount === 0 ? 'Flawless attendance record!' : 'Review missed class notes'}
          </span>
        </div>
      </div>

      {/* Detailed Attendance History Log */}
      <div className="bg-white rounded-3xl border border-yellow-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-yellow-100 pb-3">
          <h3 className="font-adorn text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span>
            <span>Recorded Attendance Ledger</span>
          </h3>

          <span className="text-xs font-mono-code font-bold text-amber-800 bg-yellow-100 px-3 py-1 rounded-full">
            {myRecords.length} records retrieved
          </span>
        </div>

        {myRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            No attendance records found for your student profile.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-yellow-50/60 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-yellow-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Class / Module</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-100 font-medium text-slate-800">
                {myRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-yellow-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono-code text-[11px] font-bold text-slate-600">
                        {rec.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {rec.className || 'Academic Session'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase font-mono-code ${
                            rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : rec.status === 'late'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : rec.status === 'absent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {rec.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
