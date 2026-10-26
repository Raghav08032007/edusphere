'use client';

import React, { useState } from 'react';
import { AcademicClass, AttendanceRecord, AttendanceStatus, UserProfile } from '../../types/supabase';
import { DEMO_STUDENT_USERS } from '../../lib/supabaseClient';

interface StaffAttendanceViewProps {
  currentUser: UserProfile;
  classes: AcademicClass[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export const StaffAttendanceView: React.FC<StaffAttendanceViewProps> = ({
  currentUser,
  classes,
  attendanceRecords,
  onSaveAttendance,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSaved, setIsSaved] = useState(false);

  // Initializing local roster attendance state for selected class and date
  const [rosterStatus, setRosterStatus] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    DEMO_STUDENT_USERS.forEach((s) => {
      const existing = attendanceRecords.find(
        (a) => a.studentId === s.id && a.classId === classes[0]?.id && a.date === new Date().toISOString().split('T')[0]
      );
      initial[s.id] = {
        status: existing?.status || 'present',
        remarks: existing?.remarks || '',
      };
    });
    return initial;
  });

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRosterStatus((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRosterStatus((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setRosterStatus((prev) => {
      const updated = { ...prev };
      DEMO_STUDENT_USERS.forEach((s) => {
        updated[s.id] = { ...updated[s.id], status };
      });
      return updated;
    });
  };

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = DEMO_STUDENT_USERS.map((student) => ({
      id: `att-${selectedClassId}-${student.id}-${selectedDate}`,
      classId: selectedClassId,
      className: selectedClass?.name || 'Academic Class',
      studentId: student.id,
      studentName: student.fullName,
      studentReg: student.regNumber,
      date: selectedDate,
      status: rosterStatus[student.id]?.status || 'present',
      remarks: rosterStatus[student.id]?.remarks || '',
      markedBy: currentUser.id,
    }));

    onSaveAttendance(newRecords);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Metrics for current session
  const totalStudents = DEMO_STUDENT_USERS.length;
  const presentCount = DEMO_STUDENT_USERS.filter((s) => rosterStatus[s.id]?.status === 'present').length;
  const lateCount = DEMO_STUDENT_USERS.filter((s) => rosterStatus[s.id]?.status === 'late').length;
  const absentCount = DEMO_STUDENT_USERS.filter((s) => rosterStatus[s.id]?.status === 'absent').length;
  const dayPercentage = totalStudents > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalStudents) * 100) : 100;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-yellow-50/60 via-amber-50/30 to-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 font-mono-code">
                👨‍🏫 Faculty Portal • Attendance Desk
              </span>
              <span className="text-xs text-slate-500 font-bold">Real-time Session Register</span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Mark Daily Class Attendance
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Record daily presence, absences, and tardiness. Records update in real-time and are scoped strictly so students only view their own attendance records.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-yellow-200 shadow-xs text-center min-w-[110px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Session Rate</span>
              <span className="font-adorn text-2xl font-black text-amber-600 mt-0.5 block">
                {dayPercentage}%
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                {presentCount} Present
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-yellow-200 shadow-xs text-center min-w-[110px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Absent / Late</span>
              <span className="font-adorn text-2xl font-black text-rose-600 mt-0.5 block">
                {absentCount + lateCount}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block">
                {absentCount} Absent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-3xl p-5 border border-yellow-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-yellow-200 bg-yellow-50/40 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-yellow-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Quick Actions:</span>
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
          >
            ✓ Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
          >
            ✕ Mark All Absent
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base">✓</span>
            <span>Attendance records successfully registered for {selectedDate}.</span>
          </div>
          <span className="font-mono-code text-[11px] bg-white px-2 py-0.5 rounded-md border border-emerald-200">
            Saved Successfully
          </span>
        </div>
      )}

      {/* Student Roster Table */}
      <div className="bg-white rounded-3xl border border-yellow-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-yellow-50/70 border-b border-yellow-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Candidate Scholar</th>
                <th className="py-3.5 px-4">Reg Number</th>
                <th className="py-3.5 px-4">Curriculum Track</th>
                <th className="py-3.5 px-6 text-center">Attendance Status</th>
                <th className="py-3.5 px-6">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100 font-medium text-slate-800">
              {DEMO_STUDENT_USERS.map((student) => {
                const currentStatus = rosterStatus[student.id]?.status || 'present';
                const currentRemarks = rosterStatus[student.id]?.remarks || '';

                return (
                  <tr key={student.id} className="hover:bg-yellow-50/40 transition-colors">
                    {/* Student Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-400 text-slate-900 font-black flex items-center justify-center text-xs shadow-xs">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {student.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reg Number */}
                    <td className="py-4 px-4 font-mono-code text-[11px] font-bold text-slate-600">
                      {student.regNumber || '2026-CSE'}
                    </td>

                    {/* Track */}
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      {student.department || 'General Academic'}
                    </td>

                    {/* Status Toggle Buttons */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'excused')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'excused'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-indigo-700'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td className="py-4 px-6">
                      <input
                        type="text"
                        value={currentRemarks}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        placeholder="Optional remarks (e.g. Lab delay, Sick)..."
                        className="w-full px-3 py-1.5 rounded-lg border border-yellow-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Submit Button */}
        <div className="bg-yellow-50/50 p-4 border-t border-yellow-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Marking attendance for <strong>{totalStudents} enrolled students</strong> in {selectedClass?.code}.
          </span>

          <button
            type="button"
            onClick={handleSave}
            className="yellow-gradient-btn px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            💾 Save Attendance Records
          </button>
        </div>
      </div>
    </div>
  );
};
