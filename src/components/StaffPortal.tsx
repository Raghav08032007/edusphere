'use client';

import React, { useState } from 'react';
import { UserProfile, StudentPerformanceRecord, StudyTask, SkillCertification, SkillNode } from '../types';
import { INITIAL_SKILLS } from '../data/initialSkills';

interface StaffPortalProps {
  currentUser: UserProfile;
  onAssignTask: (task: Omit<StudyTask, 'id'>) => void;
  onSwitchToStudentView: () => void;
  onCertifySkill?: (cert: Omit<SkillCertification, 'id'>) => void;
  certifications?: SkillCertification[];
  skills?: SkillNode[];
}

const INITIAL_STUDENT_RECORDS: StudentPerformanceRecord[] = [
  {
    id: 'usr-student-1',
    name: 'Param Sahar',
    regNumber: '2026CSE042',
    batch: 'Antigravity AI & Advanced JEE Track',
    studyHours: 34.5,
    tasksCompleted: 19,
    quizScore: 96,
    attendanceRate: 98,
    status: 'Distinction',
  },
  {
    id: 'stud-2',
    name: 'Kaviyarasu Murugan',
    regNumber: '2026CSE018',
    batch: 'Distributed Systems & Cloud Track',
    studyHours: 29.0,
    tasksCompleted: 15,
    quizScore: 88,
    attendanceRate: 94,
    status: 'Distinction',
  },
  {
    id: 'stud-3',
    name: 'Anitha Selvaraj',
    regNumber: '2026CSE007',
    batch: 'Computational Bio-Science Track',
    studyHours: 22.4,
    tasksCompleted: 12,
    quizScore: 78,
    attendanceRate: 90,
    status: 'Good',
  },
  {
    id: 'stud-4',
    name: 'Dinesh Karthik',
    regNumber: '2026CSE025',
    batch: 'High-Performance Algorithms Track',
    studyHours: 14.2,
    tasksCompleted: 7,
    quizScore: 62,
    attendanceRate: 82,
    status: 'Needs Attention',
  },
  {
    id: 'stud-5',
    name: 'Priya Sundaram',
    regNumber: '2026CSE053',
    batch: 'Antigravity AI & Advanced JEE Track',
    studyHours: 31.8,
    tasksCompleted: 17,
    quizScore: 92,
    attendanceRate: 96,
    status: 'Distinction',
  },
];

export const StaffPortal: React.FC<StaffPortalProps> = ({
  currentUser,
  onAssignTask,
  onSwitchToStudentView,
  onCertifySkill,
  certifications = [],
  skills = INITIAL_SKILLS,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'certify' | 'assign' | 'announcements'>('overview');
  const [students] = useState<StudentPerformanceRecord[]>(INITIAL_STUDENT_RECORDS);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentPerformanceRecord | null>(null);

  // New assignment form state
  const [assignTitle, setAssignTitle] = useState('');
  const [assignSubject, setAssignSubject] = useState('Machine Learning');
  const [assignDueDate, setAssignDueDate] = useState(() =>
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [assignMinutes, setAssignMinutes] = useState(60);
  const [assignNotes, setAssignNotes] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Skill Certification state
  const [certStudentId, setCertStudentId] = useState(INITIAL_STUDENT_RECORDS[0]?.id || '');
  const [certSkillId, setCertSkillId] = useState(skills[1]?.id || 'skill-aiml-2');
  const [certGrade, setCertGrade] = useState<'A+' | 'A' | 'B+'>('A+');
  const [certFeedback, setCertFeedback] = useState('');
  const [certSuccess, setCertSuccess] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([
    {
      id: 'ann-1',
      title: 'MVSAT 2026 National Scholarship Test Extended to October 25th',
      sub: 'National Examination Notification',
      desc: 'All enrolled cohort scholars are eligible for up to 100% scholarship fee waivers and cash prizes. Ensure all 4 section tests are completed before the deadline.',
      date: 'Today, 10:30 AM',
      badge: 'High Priority',
    },
    {
      id: 'ann-2',
      title: 'Antigravity Distributed Systems & Raft Lab Submissions',
      sub: 'Term Practical Assessment',
      desc: 'Laboratory code evaluations for leader election partitions and state machine log replication must be uploaded to the portal by Monday 5:00 PM.',
      date: 'Yesterday',
      badge: 'Academic Notice',
    },
    {
      id: 'ann-3',
      title: 'AlphaFold 3D Structural Modeling Session by Guest Researcher',
      sub: 'Bio-Science Masterclass',
      desc: 'Interactive workshop on interpreting pLDDT confidence matrices and PAE inter-domain orientations scheduled for this Thursday.',
      date: '3 Days Ago',
      badge: 'Masterclass',
    },
  ]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnDesc, setNewAnnDesc] = useState('');

  const handleIssueCertification = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === certStudentId) || students[0];
    const skill = skills.find((s) => s.id === certSkillId) || skills[0];
    if (!student || !skill || !onCertifySkill) return;

    onCertifySkill({
      studentId: student.id,
      studentName: student.name,
      skillId: skill.id,
      skillTitle: skill.title,
      certifiedBy: currentUser.name,
      designation: currentUser.department || 'Dean of Faculty, Department of Computer Science & AI',
      date: new Date().toISOString().split('T')[0],
      grade: certGrade,
      feedback:
        certFeedback.trim() ||
        'Demonstrated exemplary theoretical derivations and validated practical execution in the laboratory examination.',
    });

    setCertSuccess(true);
    setCertFeedback('');
    setTimeout(() => setCertSuccess(false), 3500);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;

    onAssignTask({
      title: `[Faculty Directive] ${assignTitle.trim()}`,
      subject: assignSubject,
      subjectColor: '#ff6200',
      dueDate: assignDueDate,
      estimatedMinutes: Number(assignMinutes),
      priority: 'high',
      status: 'todo',
      notes: assignNotes.trim() ? `Faculty Remarks: ${assignNotes.trim()}` : 'Mandatory task curated by academic faculty.',
      assignedByStaff: true,
    });

    setAssignSuccess(true);
    setAssignTitle('');
    setAssignNotes('');
    setTimeout(() => setAssignSuccess(false), 3500);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnDesc.trim()) return;

    setAnnouncements((prev) => [
      {
        id: `ann-${Date.now()}`,
        title: newAnnTitle.trim(),
        sub: 'Dean Circular',
        desc: newAnnDesc.trim(),
        date: 'Just Now',
        badge: 'Official',
      },
      ...prev,
    ]);

    setNewAnnTitle('');
    setNewAnnDesc('');
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.batch.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Dean Cockpit Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                👨‍🏫 Academic Dean &amp; Faculty Console
              </span>
              <span className="text-xs text-slate-500 font-bold">Vedantu Antigravity Academy</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentUser.department || 'Dean of Computing & Antigravity Systems'} • Monitor cohort performance, evaluate Antigravity competencies, and sign official academic certifications.
            </p>
          </div>

          {/* Quick Metrics Cluster & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[105px]">
              <span className="text-xs text-slate-500 font-bold uppercase block">Cohort</span>
              <span className="font-heading text-2xl font-black text-slate-900 mt-0.5">
                {students.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-black block mt-0.5">100% Active</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[105px]">
              <span className="text-xs text-slate-500 font-bold uppercase block">Attendance</span>
              <span className="font-heading text-2xl font-black text-blue-600 mt-0.5">94%</span>
              <span className="text-[10px] text-blue-600 font-bold block mt-0.5">Exemplary</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[105px]">
              <span className="text-xs text-slate-500 font-bold uppercase block">Certified</span>
              <span className="font-heading text-2xl font-black text-emerald-600 mt-0.5">
                {certifications.length}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Signed Credentials</span>
            </div>

            <button
              onClick={onSwitchToStudentView}
              className="px-5 py-3 rounded-2xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
            >
              🎓 Switch to Student Cockpit
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: 'Overview & Velocity', icon: '📊' },
          { id: 'students', label: 'Cohort Roster & Dossiers', icon: '👥' },
          { id: 'certify', label: 'Endorse & Certify Skills', icon: '📜' },
          { id: 'assign', label: 'Task Dispatcher', icon: '✍️' },
          { id: 'announcements', label: 'Notice Board', icon: '📢' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'certify' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {certifications.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Top Cohort Scholar</span>
                <span>🏆</span>
              </div>
              <h3 className="text-xl font-heading font-black text-slate-900">Param Sahar</h3>
              <p className="text-xs text-slate-500">
                Score: <strong className="text-emerald-600">96%</strong> • Study Time: <strong>34.5 hrs</strong> • 19 Tasks
              </p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Certified Competencies</span>
                <span>📜</span>
              </div>
              <h3 className="text-xl font-heading font-black text-slate-900">{certifications.length} Signed Credentials</h3>
              <p className="text-xs text-slate-500">
                Official Antigravity competencies verified in theoretical &amp; laboratory tests.
              </p>
              <button
                onClick={() => setActiveTab('certify')}
                className="text-xs font-black text-emerald-600 hover:text-emerald-700"
              >
                Issue New Endorsement →
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>MVSAT 2026 Milestone</span>
                <span>⏰</span>
              </div>
              <h3 className="text-xl font-heading font-black text-slate-900">Phase 1 Extended</h3>
              <p className="text-xs text-slate-500">
                Window closes on <strong>25th October 2026</strong>. 48 Candidates eligible for awards.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">
                <span>⚡ Active Live Window</span>
              </div>
            </div>
          </div>

          {/* Quick Roster Snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Student Cohort Performance Snapshot
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time telemetry across MVSAT scholarship test sections and Antigravity skill milestones
                </p>
              </div>
              <button
                onClick={() => setActiveTab('students')}
                className="text-xs font-black text-emerald-600 hover:text-emerald-700"
              >
                Inspect All Candidates ({students.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Registration ID</th>
                    <th className="pb-3">Curriculum Track</th>
                    <th className="pb-3">Hours</th>
                    <th className="pb-3">Tasks</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.slice(0, 5).map((stud) => (
                    <tr key={stud.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {stud.name[0]}
                        </span>
                        <span>{stud.name}</span>
                      </td>
                      <td className="py-3.5 font-mono-code text-slate-500 font-bold">{stud.regNumber}</td>
                      <td className="py-3.5 text-slate-600 font-medium">{stud.batch}</td>
                      <td className="py-3.5 font-bold text-slate-700">{stud.studyHours}h</td>
                      <td className="py-3.5 font-bold text-slate-700">{stud.tasksCompleted}</td>
                      <td className="py-3.5">
                        <span className="font-black text-emerald-600 font-mono-code text-sm">
                          {stud.quizScore}%
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            stud.status === 'Distinction'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : stud.status === 'Good'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {stud.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students Roster with Dossier View */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-black text-xl text-slate-900">
                  Enrolled Cohort Roster ({students.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Select a candidate to inspect their complete Antigravity competency profile
                </p>
              </div>
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Search candidates by name or reg #..."
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-72"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Registration ID</th>
                    <th className="pb-3">Track</th>
                    <th className="pb-3">Hours</th>
                    <th className="pb-3">Tasks</th>
                    <th className="pb-3">MVSAT Score</th>
                    <th className="pb-3">Attendance</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stud) => (
                    <tr key={stud.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-black text-slate-900 flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {stud.name[0]}
                        </span>
                        <div>
                          <span>{stud.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{stud.status}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono-code text-slate-500 font-bold">{stud.regNumber}</td>
                      <td className="py-3.5 text-slate-600">{stud.batch}</td>
                      <td className="py-3.5 font-bold text-slate-700">{stud.studyHours}h</td>
                      <td className="py-3.5 font-bold text-slate-700">{stud.tasksCompleted}</td>
                      <td className="py-3.5">
                        <span className="font-mono-code font-black text-emerald-600 text-sm">
                          {stud.quizScore}%
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-blue-600">{stud.attendanceRate}%</td>
                      <td className="py-3.5">
                        <button
                          onClick={() => {
                            setSelectedStudentForDetail(stud);
                            setCertStudentId(stud.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          Dossier ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Candidate Dossier Modal/Drawer */}
          {selectedStudentForDetail && (
            <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-lg space-y-5 animate-fadeIn">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-black">
                    {selectedStudentForDetail.name[0]}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-black text-slate-900">
                      {selectedStudentForDetail.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Registration: <strong className="font-mono-code text-slate-800">{selectedStudentForDetail.regNumber}</strong> • {selectedStudentForDetail.batch}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudentForDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-2"
                >
                  ✕
                </button>
              </div>

              {/* Student's Verified Certifications */}
              <div className="space-y-3">
                <h4 className="font-heading font-black text-sm text-slate-800 uppercase tracking-wider">
                  Academic Credentials Awarded to this Candidate
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certifications
                    .filter((c) => c.studentId === selectedStudentForDetail.id || c.studentName === selectedStudentForDetail.name)
                    .map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-900 text-xs">{c.skillTitle}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono-code font-black text-[10px]">
                            {c.grade}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 italic">&ldquo;{c.feedback}&rdquo;</p>
                        <span className="text-[10px] text-slate-400 block pt-1">Date: {c.date}</span>
                      </div>
                    ))}
                  {certifications.filter((c) => c.studentId === selectedStudentForDetail.id || c.studentName === selectedStudentForDetail.name).length === 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      No official certifications issued yet. You can endorse this candidate below.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveTab('certify');
                    setCertStudentId(selectedStudentForDetail.id);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs shadow-md shadow-emerald-600/20"
                >
                  Endorse Competency for {selectedStudentForDetail.name} →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Endorse & Certify Antigravity Skills */}
      {activeTab === 'certify' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form to issue certification */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 h-fit">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase mb-1">
                <span>📜</span> Official Faculty Seal
              </div>
              <h3 className="font-heading font-black text-xl text-slate-900">
                Endorse Antigravity Competency
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Certify theoretical and practical mastery. The candidate receives +100 XP and an official credential.
              </p>
            </div>

            {certSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <span>📜</span>
                <span>Credential issued and logged in the faculty ledger!</span>
              </div>
            )}

            <form onSubmit={handleIssueCertification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Candidate
                </label>
                <select
                  value={certStudentId}
                  onChange={(e) => setCertStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.regNumber}) — {s.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Antigravity Competency Milestone
                </label>
                <select
                  value={certSkillId}
                  onChange={(e) => setCertSkillId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.category.toUpperCase()}] {s.title} (Level {s.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Academic Evaluation Grade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['A+', 'A', 'B+'] as const).map((grade) => (
                    <button
                      type="button"
                      key={grade}
                      onClick={() => setCertGrade(grade)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                        certGrade === grade
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Grade {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dean’s Review Remarks
                </label>
                <textarea
                  rows={3}
                  value={certFeedback}
                  onChange={(e) => setCertFeedback(e.target.value)}
                  placeholder="Commend candidate's mathematical derivations, laboratory experiments, or code performance..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-95"
              >
                Sign &amp; Issue Credential →
              </button>
            </form>
          </div>

          {/* Ledger of issued credentials */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-heading font-black text-xl text-slate-900">
              Verified Credential Ledger ({certifications.length})
            </h3>
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📜</span>
                      <div>
                        <h4 className="font-heading font-black text-base text-slate-900">{cert.skillTitle}</h4>
                        <p className="text-xs text-slate-500">
                          Recipient: <strong className="text-slate-800">{cert.studentName}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono-code font-black text-xs">
                      {cert.grade}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                    &ldquo;{cert.feedback}&rdquo;
                  </p>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <span>Dean: <strong>{cert.certifiedBy}</strong> ({cert.designation})</span>
                    <span>Date: {cert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Task Dispatcher */}
      {activeTab === 'assign' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-heading font-black text-2xl text-slate-900">
              Dispatch Academic Curriculum Task
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dispatched tasks immediately sync to students’ study pipelines with high priority.
            </p>
          </div>

          {assignSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <span>✅</span>
              <span>Task successfully dispatched and assigned to cohort study queues!</span>
            </div>
          )}

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                placeholder="e.g. Derive FlashAttention IO-Aware Memory Bounds"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subject Area
                </label>
                <select
                  value={assignSubject}
                  onChange={(e) => setAssignSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Distributed Systems">Distributed Systems</option>
                  <option value="Algorithms">Algorithms &amp; Complexity</option>
                  <option value="Computational Biology">Computational Biology</option>
                  <option value="Advanced Mathematics">Advanced Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  value={assignMinutes}
                  onChange={(e) => setAssignMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Cohort
                </label>
                <input
                  type="text"
                  disabled
                  value="All Enrolled Cohort Scholars (48 Candidates)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Faculty Remarks &amp; Reference Notes
              </label>
              <textarea
                rows={3}
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                placeholder="Include reference theorems, code repository links, or testing benchmarks..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-95"
            >
              Dispatch Task to Cohort Pipeline →
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: Notice Board */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-heading font-black text-xl text-slate-900">
              Published Circulars ({announcements.length})
            </h3>
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black uppercase">
                    {ann.badge}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">{ann.date}</span>
                </div>
                <h4 className="font-heading font-black text-base text-slate-900">{ann.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.desc}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 h-fit">
            <h3 className="font-heading font-black text-lg text-slate-900">Publish New Circular</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="e.g. Schedule for Olympiad Mock Exam"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Circular Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={newAnnDesc}
                  onChange={(e) => setNewAnnDesc(e.target.value)}
                  placeholder="Enter notice details for students..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-black text-xs transition-all shadow-md"
              >
                Publish Circular
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
