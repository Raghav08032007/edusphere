'use client';

import React, { useState } from 'react';
import { AcademicClass, ClassNote, UserProfile } from '../../types/supabase';
import { uploadClassNoteAttachment } from '../../lib/supabaseStorage';

interface StaffNotesManagerProps {
  currentUser: UserProfile;
  classes: AcademicClass[];
  notes: ClassNote[];
  onAddNote: (note: Omit<ClassNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (noteId: string) => void;
}

export const StaffNotesManager: React.FC<StaffNotesManagerProps> = ({
  currentUser,
  classes,
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(classes[0]?.subject || 'Physics');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [filterClass, setFilterClass] = useState('all');

  const handleClassChange = (cid: string) => {
    setSelectedClassId(cid);
    const cls = classes.find((c) => c.id === cid);
    if (cls) setSubject(cls.subject);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setUploadError(null);
    const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let finalAttachmentName = attachmentName.trim() || undefined;
    let finalAttachmentUrl: string | undefined = undefined;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadClassNoteAttachment(selectedFile, currentClass.id);
        if (uploadResult.error) {
          setUploadError(uploadResult.error);
          setIsUploading(false);
          return;
        }
        finalAttachmentName = uploadResult.fileName;
        finalAttachmentUrl = uploadResult.publicUrl;
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (attachmentName.trim()) {
      finalAttachmentUrl = `https://storage.local/class-notes/${encodeURIComponent(attachmentName.trim())}`;
    }

    onAddNote({
      classId: currentClass.id,
      className: currentClass.name,
      staffId: currentUser.id,
      staffName: currentUser.fullName,
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim(),
      tags: tags.length ? tags : [subject],
      attachmentName: finalAttachmentName,
      attachmentUrl: finalAttachmentUrl,
      isPublished: true,
    });

    setTitle('');
    setContent('');
    setTagsInput('');
    setSelectedFile(null);
    setAttachmentName('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  const filteredNotes = notes.filter((n) => filterClass === 'all' || n.classId === filterClass);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-yellow-50/60 via-amber-50/30 to-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 font-mono-code">
                👨‍🏫 Faculty Portal • Notes Engine
              </span>
              <span className="text-xs text-slate-500 font-bold">Verified Course Repository</span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Publish &amp; Manage Class Notes
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Upload rich study materials, mathematical derivations, and reference slides. Notes are instantly scoped to students enrolled in the designated class.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-xs text-center min-w-[140px]">
            <span className="text-xs text-slate-500 font-bold uppercase block">Published Notes</span>
            <span className="font-adorn text-3xl font-black text-amber-600 mt-0.5 block">
              {notes.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">✓ Live &amp; Synchronized</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create Note Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-yellow-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-yellow-100 pb-3">
            <h2 className="font-adorn text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>✍️</span>
              <span>New Class Lecture Note</span>
            </h2>
            <span className="text-xs font-mono-code text-amber-700 bg-yellow-100 px-2.5 py-0.5 rounded-full font-bold">
              Official Material
            </span>
          </div>

          {isSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span>✓</span>
              <span>Class note successfully published and stored in database!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            {/* Class Selector */}
            <div>
              <label className="block text-slate-700 mb-1">Target Academic Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-yellow-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({c.studentCount} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-slate-700 mb-1">Subject / Discipline</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics, Computer Science, Mathematics"
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            {/* Note Title */}
            <div>
              <label className="block text-slate-700 mb-1">Lecture Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Maxwell's Displacement Current & EM Waves"
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            {/* Markdown / Note Content */}
            <div>
              <label className="block text-slate-700 mb-1">Lecture Content / Derivation (Markdown)</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your comprehensive lecture summary, formulas, and homework questions here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono-code text-[11px]"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-slate-700 mb-1">Topics / Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Electrodynamics, JEE Advanced, Derivations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Attachment File / Supabase Storage Upload */}
            <div>
              <label className="block text-slate-700 mb-1 font-semibold text-xs">
                Class Attachment / Slides (Supabase Storage)
              </label>
              
              <div className="border border-dashed border-yellow-300 rounded-xl p-3 bg-yellow-50/40 hover:bg-yellow-50 transition-colors">
                <input
                  type="file"
                  id="note-file-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setAttachmentName(file.name);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">📄</span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-code">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Supabase Storage
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setAttachmentName('');
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="note-file-upload"
                    className="flex flex-col items-center justify-center py-3 cursor-pointer text-center"
                  >
                    <span className="text-2xl mb-1">☁️</span>
                    <span className="text-xs font-bold text-amber-900">
                      Choose PDF, Slides or Document to Upload
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Directly stores in Supabase Storage bucket <code className="font-mono-code text-amber-700 font-bold">class-notes</code> (Max 25MB)
                    </span>
                  </label>
                )}
              </div>

              {uploadError && (
                <div className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className={`w-full yellow-gradient-btn py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer mt-2 flex items-center justify-center gap-2 ${
                isUploading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Uploading to Supabase Storage...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Publish Note to Class</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Published Notes Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-yellow-200">
            <h3 className="font-adorn text-lg font-bold text-slate-900">
              Published Lecture Notes ({filteredNotes.length})
            </h3>

            {/* Filter by class */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-yellow-200 bg-yellow-50/50 text-xs font-semibold text-slate-800"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-dashed border-yellow-300 text-center space-y-2">
                <span className="text-3xl">📭</span>
                <p className="text-slate-600 font-bold text-sm">No notes published for this class yet.</p>
                <p className="text-xs text-slate-400">Use the form on the left to publish your first lecture note.</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-3xl p-5 border border-yellow-200 hover:border-yellow-400 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-mono-code">
                          {note.subject}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {note.className || 'Class'}
                        </span>
                      </div>
                      <h4 className="font-adorn text-lg font-bold text-slate-900">
                        {note.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 text-xs transition-colors"
                      title="Delete Note"
                    >
                      🗑️
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-medium whitespace-pre-line line-clamp-3 bg-yellow-50/30 p-3 rounded-xl border border-yellow-100">
                    {note.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-yellow-100 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {note.attachmentName && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-yellow-100/70 px-2 py-0.5 rounded-lg">
                        📎 {note.attachmentName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
