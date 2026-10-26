'use client';

import React, { useState } from 'react';
import { StudyNote, FlashcardDeck } from '../types';

interface NotesHubProps {
  notes: StudyNote[];
  decks: FlashcardDeck[];
  onAddNote: (note: Omit<StudyNote, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (note: StudyNote) => void;
  onDeleteNote: (id: string) => void;
  onAddCardToDeck: (deckId: string, card: { front: string; back: string }) => void;
  onEarnXP?: (xp: number) => void;
}

export const NotesHub: React.FC<NotesHubProps> = ({
  notes,
  decks,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onAddCardToDeck,
  onEarnXP,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // AI Quiz Generator State
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    { question: string; answer: string; added?: boolean }[]
  >([]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startEdit = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setIsEditing(true);
    }
  };

  const saveEdit = () => {
    if (selectedNote && editTitle.trim()) {
      onUpdateNote({
        ...selectedNote,
        title: editTitle.trim(),
        content: editContent,
        updatedAt: 'Just now',
      });
      setIsEditing(false);
    }
  };

  // AI Instant Quiz Generator
  const handleGenerateQuiz = () => {
    if (!selectedNote) return;
    setIsGeneratingQuiz(true);

    setTimeout(() => {
      const lines = selectedNote.content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 20 && !l.startsWith('#'));

      const quizItems: { question: string; answer: string }[] = [];

      lines.forEach((line) => {
        if (line.includes(':')) {
          const parts = line.split(':');
          quizItems.push({
            question: `What is the core principle behind ${parts[0].replace(/^[-*0-9.]+\s*/, '')}?`,
            answer: parts.slice(1).join(':').trim(),
          });
        } else if (line.length > 40) {
          quizItems.push({
            question: `From the "${selectedNote.title}" notes, explain the following theorem:`,
            answer: line.replace(/^[-*0-9.]+\s*/, ''),
          });
        }
      });

      if (quizItems.length === 0) {
        quizItems.push({
          question: `Summarize the primary significance of ${selectedNote.title}.`,
          answer: selectedNote.content.slice(0, 150) + '...',
        });
      }

      setGeneratedQuestions(quizItems.slice(0, 3));
      setIsGeneratingQuiz(false);
      if (onEarnXP) onEarnXP(15);
    }, 600);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black mb-2">
            <span>✨ AI Academic Synthesis Hub</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span>Study Notes &amp; Free Knowledge Base</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Curate mathematical notes, laboratory research, and auto-synthesize active recall questions.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setEditTitle('');
            setEditContent('');
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <span>+</span>
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notes List Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          {/* Search bar */}
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search notes, formulas, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setIsEditing(false);
                    setGeneratedQuestions([]);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-heading text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                      {note.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{note.updatedAt}</span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {note.content.replace(/[#*`_]/g, '')}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${note.subjectColor}15`,
                        color: note.subjectColor,
                      }}
                    >
                      {note.subject}
                    </span>
                    {note.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono-code"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note Reading & Synthesis Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedNote ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedNote.subjectColor }}
                    />
                    <span className="text-xs font-bold text-slate-500">{selectedNote.subject}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">Updated: {selectedNote.updatedAt}</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xl font-heading font-black text-slate-900 border border-slate-300 rounded-xl px-3 py-1.5 mt-2 w-full focus:outline-none focus:border-orange-500"
                    />
                  ) : (
                    <h3 className="text-2xl font-heading font-black text-slate-900 mt-1">
                      {selectedNote.title}
                    </h3>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={startEdit}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteNote(selectedNote.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Note"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Note Content */}
              {isEditing ? (
                <textarea
                  rows={12}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-800 font-mono-code focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              ) : (
                <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 whitespace-pre-wrap">
                  {selectedNote.content}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-bold">Tags:</span>
                {selectedNote.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono-code font-bold"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* AI Active Recall Synthesizer */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white border border-orange-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">🤖</span>
                      <h4 className="font-heading font-black text-sm text-slate-900">
                        Synthesize 3D Recall Questions
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Auto-generate flashcards from your study notes and export directly to your deck.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="px-4 py-2 rounded-xl bg-[#ff6200] hover:bg-[#ea580c] disabled:bg-slate-300 text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    {isGeneratingQuiz ? 'Analyzing Content...' : 'Generate Questions (+15 XP) ✨'}
                  </button>
                </div>

                {/* Generated Qs */}
                {generatedQuestions.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    {generatedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-900">{q.question}</p>
                          <p className="text-xs text-slate-500 italic">&ldquo;{q.answer}&rdquo;</p>
                        </div>

                        {decks.length > 0 && (
                          <button
                            disabled={q.added}
                            onClick={() => {
                              onAddCardToDeck(decks[0].id, { front: q.question, back: q.answer });
                              setGeneratedQuestions((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, added: true } : item))
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                              q.added
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {q.added ? 'Added ✓' : 'Add to Deck +'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <span className="text-4xl">📝</span>
              <p className="text-slate-500 mt-2 font-medium">Select a note to inspect or edit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
                <span>📝</span>
                <span>Create Study Note</span>
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editTitle.trim()) return;
                onAddNote({
                  title: editTitle.trim(),
                  subject: 'Machine Learning',
                  subjectColor: '#ff6200',
                  content: editContent,
                  tags: ['General', 'Revision'],
                });
                setIsCreating(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KV Caching in Transformers"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Content *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Include formulas, algorithms, textbook excerpts..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 font-mono-code resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
