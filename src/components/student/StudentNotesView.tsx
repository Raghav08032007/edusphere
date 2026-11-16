'use client';

import React, { useState } from 'react';
import { AcademicClass, ClassNote } from '../../types/supabase';
import { MathMarkdownRenderer } from '../ui/MathMarkdownRenderer';

interface StudentNotesViewProps {
  classes: AcademicClass[];
  notes: ClassNote[];
  onOpenCooperWithTopic?: (topic: string) => void;
}

export const StudentNotesView: React.FC<StudentNotesViewProps> = ({
  classes,
  notes,
  onOpenCooperWithTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [activeNoteModal, setActiveNoteModal] = useState<ClassNote | null>(null);

  const subjects = ['all', ...Array.from(new Set(notes.map((n) => n.subject)))];

  const filteredNotes = notes.filter((note) => {
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    const matchesClass = selectedClassId === 'all' || note.classId === selectedClassId;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-yellow-50/60 via-amber-50/30 to-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 font-mono-code">
                🎓 Student Portal • Study Notes
              </span>
              <span className="text-xs text-slate-500 font-bold">Enrolled Curriculum Modules</span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Class Lecture Notes &amp; Derivations
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Access official course materials, derivations, and slides uploaded by your professors. Click any note to read or ask Cooper AI for conceptual clarification.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-yellow-200 shadow-xs text-center min-w-[120px]">
            <span className="text-xs text-slate-500 font-bold uppercase block">Available Notes</span>
            <span className="font-adorn text-3xl font-black text-amber-600 mt-0.5 block">
              {filteredNotes.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">✓ Verified Content</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-yellow-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, Maxwell equations, attention mechanisms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-yellow-200 bg-yellow-50/20 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-400"
          />
        </div>

        {/* Class Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-2xl border border-yellow-200 bg-yellow-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Enrolled Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer whitespace-nowrap ${
                selectedSubject === subj
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'bg-yellow-50/70 text-slate-600 hover:bg-yellow-100 hover:text-slate-900'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-yellow-300 text-center space-y-3">
          <span className="text-4xl">📚</span>
          <h3 className="font-adorn text-xl font-bold text-slate-900">No Matching Notes Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords or subject filters. You can also ask Cooper AI to explain this topic on demand.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteModal(note)}
              className="bg-white rounded-3xl p-6 border-2 border-yellow-100 hover:border-yellow-400 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-mono-code">
                    {note.subject}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono-code">
                    {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-adorn text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {note.content.replace(/[#*`$]/g, '')}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-yellow-100">
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-50 text-amber-900 font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] font-bold text-slate-500">
                    👨‍🏫 {note.staffName || 'Faculty'}
                  </span>

                  {note.attachmentName ? (
                    <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                      📎 Handout
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-500">
                      Read Note →
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Reader Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setActiveNoteModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-yellow-50 transition-colors"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="space-y-2 border-b border-yellow-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 font-mono-code">
                  {activeNoteModal.subject}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {activeNoteModal.className}
                </span>
              </div>
              <h2 className="font-adorn text-2xl sm:text-3xl font-black text-slate-900">
                {activeNoteModal.title}
              </h2>
              <p className="text-xs text-slate-400">
                Published by <strong>{activeNoteModal.staffName}</strong> • {new Date(activeNoteModal.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Note Content with KaTeX Math and Multi-Source View */}
            <div className="pt-2">
              <MathMarkdownRenderer
                content={activeNoteModal.content}
                title={activeNoteModal.title}
                author={activeNoteModal.staffName}
                publishedDate={new Date(activeNoteModal.createdAt).toLocaleDateString()}
              />
            </div>

            {/* Attachment Box */}
            {activeNoteModal.attachmentName && (
              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <span className="block font-bold text-xs text-slate-900 font-mono-code">
                      {activeNoteModal.attachmentName}
                    </span>
                    <span className="text-[10px] text-slate-500">Official Handout Material</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (activeNoteModal.attachmentUrl && !activeNoteModal.attachmentUrl.includes('example.com')) {
                      window.open(activeNoteModal.attachmentUrl, '_blank');
                    } else {
                      // Generate and download lecture note handout directly
                      const blob = new Blob(
                        [`# ${activeNoteModal.title}\n\nFaculty: ${activeNoteModal.staffName} (${activeNoteModal.className})\nSubject: ${activeNoteModal.subject}\n\n${activeNoteModal.content}`],
                        { type: 'text/markdown;charset=utf-8' }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(activeNoteModal.attachmentName || activeNoteModal.title).replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 border border-yellow-300 text-xs font-bold hover:bg-yellow-100 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Download Handout</span>
                  <span>📥</span>
                </button>
              </div>
            )}

            {/* Cooper Bridge Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-yellow-100">
              <span className="text-xs text-slate-500 font-medium">
                Confused by anything in this note?
              </span>

              <button
                onClick={() => {
                  const topic = activeNoteModal.title;
                  setActiveNoteModal(null);
                  onOpenCooperWithTopic?.(topic);
                }}
                className="w-full sm:w-auto yellow-gradient-btn px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🤖</span>
                <span>Ask Cooper to Explain This Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
