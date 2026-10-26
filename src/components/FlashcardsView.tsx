'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardDeck, Flashcard } from '../types';

interface FlashcardsViewProps {
  decks: FlashcardDeck[];
  onUpdateDeck: (updatedDeck: FlashcardDeck) => void;
  onAddDeck: (newDeck: FlashcardDeck) => void;
  onEarnXP?: (xp: number) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  decks,
  onUpdateDeck,
  onAddDeck,
  onEarnXP,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddDeckOpen, setIsAddDeckOpen] = useState(false);

  // New deck form
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');

  // New card form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');

  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];
  const cards = currentDeck ? currentDeck.cards : [];
  const currentCard: Flashcard | undefined = cards[currentCardIndex];

  const handleNextCard = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handlePrevCard = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const handleRateCard = useCallback(
    (level: 'new' | 'learning' | 'mastered') => {
      if (!currentCard || !currentDeck) return;

      const updatedCards = [...currentDeck.cards];
      updatedCards[currentCardIndex] = {
        ...currentCard,
        masteryLevel: level,
        lastReviewed: new Date().toISOString(),
      };

      onUpdateDeck({
        ...currentDeck,
        cards: updatedCards,
      });

      if (level === 'mastered' && onEarnXP) {
        onEarnXP(20);
      } else if (level === 'learning' && onEarnXP) {
        onEarnXP(10);
      }

      setTimeout(() => {
        handleNextCard();
      }, 220);
    },
    [currentCard, currentDeck, currentCardIndex, onUpdateDeck, onEarnXP, handleNextCard]
  );

  // Keyboard Shortcuts Support (Space, 1, 2, 3, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleRateCard('new');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRateCard('learning');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRateCard('mastered');
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRateCard, handleNextCard, handlePrevCard]);

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim() || !newDeckSubject.trim()) return;

    const newDeck: FlashcardDeck = {
      id: `deck-${Date.now()}`,
      title: newDeckTitle.trim(),
      subject: newDeckSubject.trim(),
      subjectColor: '#ff6200',
      description: newDeckDesc.trim() || 'Custom flashcard deck created for active recall study.',
      cards: [],
    };

    onAddDeck(newDeck);
    setSelectedDeckId(newDeck.id);
    setCurrentCardIndex(0);
    setNewDeckTitle('');
    setNewDeckSubject('');
    setNewDeckDesc('');
    setIsAddDeckOpen(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim() || !currentDeck) return;

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      masteryLevel: 'new',
    };

    onUpdateDeck({
      ...currentDeck,
      cards: [...currentDeck.cards, newCard],
    });

    setNewFront('');
    setNewBack('');
    setNewHint('');
    setIsAddCardOpen(false);
  };

  const masteredCount = cards.filter((c) => c.masteryLevel === 'mastered').length;
  const learningCount = cards.filter((c) => c.masteryLevel === 'learning').length;
  const newCount = cards.filter((c) => c.masteryLevel === 'new').length;
  const masteryPercentage = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner: 3D Flashcards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black mb-2">
            <span>🗂️ Spaced Repetition Engine</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span>3D Interactive Recall Flashcards</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Test active recall with tactile 3D flipping, Leitner-spaced intervals, and keyboard shortcuts.
          </p>
        </div>

        {/* Deck Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeckId(deck.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setShowHint(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedDeckId === deck.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {deck.title} ({deck.cards.length})
            </button>
          ))}

          <button
            onClick={() => setIsAddDeckOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors"
          >
            + New Deck
          </button>
        </div>
      </div>

      {currentDeck && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Deck Info & Mastery Sidebar (4 cols) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 lg:col-span-4">
            <div>
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${currentDeck.subjectColor}15`,
                  color: currentDeck.subjectColor,
                }}
              >
                {currentDeck.subject}
              </span>
              <h3 className="font-heading text-xl font-black text-slate-900 mt-2">
                {currentDeck.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{currentDeck.description}</p>
            </div>

            {/* Mastery Progress Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">Deck Mastery</span>
                <span className="text-emerald-600 font-mono-code font-black">
                  {masteryPercentage}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex">
                <div
                  style={{
                    width: `${cards.length > 0 ? (masteredCount / cards.length) * 100 : 0}%`,
                  }}
                  className="bg-emerald-500 h-full transition-all duration-300"
                  title="Mastered"
                />
                <div
                  style={{
                    width: `${cards.length > 0 ? (learningCount / cards.length) * 100 : 0}%`,
                  }}
                  className="bg-amber-400 h-full transition-all duration-300"
                  title="Learning"
                />
                <div
                  style={{
                    width: `${cards.length > 0 ? (newCount / cards.length) * 100 : 0}%`,
                  }}
                  className="bg-slate-300 h-full transition-all duration-300"
                  title="New"
                />
              </div>

              {/* Legend Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px]">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                  <span className="block font-black text-emerald-700 font-mono-code">
                    {masteredCount}
                  </span>
                  <span className="text-emerald-600 text-[10px] font-bold">Mastered</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                  <span className="block font-black text-amber-700 font-mono-code">
                    {learningCount}
                  </span>
                  <span className="text-amber-600 text-[10px] font-bold">Learning</span>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-2">
                  <span className="block font-black text-slate-700 font-mono-code">{newCount}</span>
                  <span className="text-slate-500 text-[10px] font-bold">New</span>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Cheatsheet */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <span className="font-black text-slate-800 block mb-1">⌨️ Hotkeys:</span>
              <div className="flex justify-between">
                <span>Flip Card</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-800 font-mono-code text-[10px]">
                  Space
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Rate Level</span>
                <span className="font-mono-code text-slate-700">[1] Hard [2] Good [3] Easy</span>
              </div>
              <div className="flex justify-between">
                <span>Navigate</span>
                <span className="font-mono-code text-slate-700">← Prev / Next →</span>
              </div>
            </div>

            {/* Add Card to Deck */}
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-black text-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>+</span>
              <span>Add Flashcard</span>
            </button>
          </div>

          {/* Center 3D Interactive Card Display (8 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4">
            {cards.length === 0 ? (
              <div className="bg-white w-full h-80 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-slate-200 shadow-xs">
                <span className="text-4xl">📭</span>
                <p className="text-slate-500 mt-2 font-medium">
                  This deck is currently empty.
                </p>
                <button
                  onClick={() => setIsAddCardOpen(true)}
                  className="mt-4 px-5 py-2.5 rounded-2xl bg-[#ff6200] text-xs font-black text-white shadow-md shadow-orange-500/20"
                >
                  Create First Flashcard
                </button>
              </div>
            ) : currentCard ? (
              <>
                {/* Card index & status badge */}
                <div className="w-full flex justify-between items-center text-xs text-slate-500 px-2">
                  <span className="font-black text-slate-700">
                    Card {currentCardIndex + 1} of {cards.length}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black ${
                      currentCard.masteryLevel === 'mastered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : currentCard.masteryLevel === 'learning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    Level: {currentCard.masteryLevel}
                  </span>
                </div>

                {/* 3D Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-80 sm:h-96 perspective-1200 cursor-pointer select-none group"
                >
                  <div
                    className={`relative w-full h-full duration-500 preserve-3d transition-transform rounded-3xl shadow-lg shadow-slate-200/80 ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* FRONT SIDE (Prompt) */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-orange-200 group-hover:border-orange-400 transition-all bg-gradient-to-br from-white via-white to-orange-50/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-orange-700 uppercase tracking-widest flex items-center gap-1.5">
                          <span>💡</span> Prompt &amp; Concept
                        </span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 font-mono-code">
                          Click to Flip 🔄
                        </span>
                      </div>

                      <div className="my-auto text-center px-4">
                        <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 leading-relaxed">
                          {currentCard.front}
                        </p>
                      </div>

                      {/* Hint Reveal */}
                      {currentCard.hint && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(!showHint);
                          }}
                          className="pt-2 border-t border-slate-100 text-center"
                        >
                          {showHint ? (
                            <p className="text-xs text-amber-700 font-semibold">
                              Hint: {currentCard.hint}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400 hover:text-amber-600 transition-colors">
                              🔍 Click to reveal memory hint
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* BACK SIDE (Answer) */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-emerald-300 bg-gradient-to-br from-white via-white to-emerald-50/40 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                          <span>🎯</span> Key Solution &amp; Derivation
                        </span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 font-mono-code">
                          Flip Back 🔄
                        </span>
                      </div>

                      <div className="my-auto overflow-y-auto max-h-56 px-2 text-left">
                        <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
                          {currentCard.back}
                        </p>
                      </div>

                      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                        Rate your recall difficulty below to schedule next review
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spaced Repetition Rating Buttons */}
                <div className="w-full flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handlePrevCard}
                    className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs text-xs font-bold"
                    title="Previous Card (Left Arrow)"
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRateCard('new')}
                      className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black transition-all active:scale-95"
                      title="Rate as Hard (Press 1)"
                    >
                      Hard 🔴 [1]
                    </button>
                    <button
                      onClick={() => handleRateCard('learning')}
                      className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-black transition-all active:scale-95"
                      title="Rate as Good (Press 2)"
                    >
                      Good 🟡 [2]
                    </button>
                    <button
                      onClick={() => handleRateCard('mastered')}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-black transition-all active:scale-95"
                      title="Rate as Easy (Press 3)"
                    >
                      Easy 🟢 [3]
                    </button>
                  </div>

                  <button
                    onClick={handleNextCard}
                    className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs text-xs font-bold"
                    title="Next Card (Right Arrow)"
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Deck Modal */}
      {isAddDeckOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
                <span>📚</span>
                <span>Create Flashcard Deck</span>
              </h3>
              <button
                onClick={() => setIsAddDeckOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deck Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cognitive Psychology & Synaptic Models"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neuroscience"
                  value={newDeckSubject}
                  onChange={(e) => setNewDeckSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Core theorems and formulas tested in this deck..."
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeckOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
                <span>➕</span>
                <span>{currentDeck?.title} — Add Card</span>
              </h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Front (Prompt / Problem) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. State the difference between synchronous and asynchronous replication in distributed logs."
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Back (Detailed Explanation / Key Formula) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Complete explanation, mathematical proof, or key derivations..."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Memory Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consider trade-offs between write latency and durabilty guarantee"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
