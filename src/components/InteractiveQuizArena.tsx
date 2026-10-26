'use client';

import React, { useState } from 'react';

export interface QuizQuestion {
  id: string;
  subject: string;
  subjectColor: string;
  topic: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    subject: 'Antigravity AI & Deep Learning',
    subjectColor: '#ff6200',
    topic: 'Attention Mechanisms',
    question: 'Why are dot-product attention logits scaled by 1 / sqrt(d_k) in Transformer architectures?',
    options: [
      'To prevent softmax gradients from vanishing due to large magnitude dot products in high dimensions',
      'To reduce the computational time complexity from O(N^2) to O(N log N)',
      'To enforce causal masking during autoregressive token generation',
      'To ensure that the sum of attention weights across all tokens strictly equals 1.0',
    ],
    correctIndex: 0,
    explanation: 'When d_k is large, dot products grow substantially in magnitude, pushing the softmax activation function into regions with extremely small gradients. Dividing by sqrt(d_k) preserves stable variance and gradient flow.',
    xpReward: 35,
  },
  {
    id: 'q2',
    subject: 'Distributed Systems',
    subjectColor: '#0284c7',
    topic: 'Raft Consensus Protocol',
    question: 'In the Raft consensus algorithm, how are split-vote deadlocks during leader elections efficiently resolved?',
    options: [
      'By selecting the node with the lowest numeric IP address',
      'By employing randomized election timeouts (150ms–300ms) for each follower node',
      'By executing a Paxos synod preparation phase before each term transition',
      'By delegating the leader appointment to a centralized ZooKeeper coordinator node',
    ],
    correctIndex: 1,
    explanation: 'Randomized election timeouts spread out candidate state transitions, making it highly likely that a single candidate node times out first, requests votes, and gathers a majority before rival candidates split the term.',
    xpReward: 35,
  },
  {
    id: 'q3',
    subject: 'Computational Bio-Science',
    subjectColor: '#059669',
    topic: 'AlphaFold & Biomolecular Modeling',
    question: 'In AlphaFold predicted structures, what does a per-residue confidence metric (pLDDT) greater than 90 signify?',
    options: [
      'The residue is located in an intrinsically disordered or flexible loop region',
      'Very high confidence with highly accurate backbone and reliable side-chain rotamers',
      'The residue has low confidence and requires experimental Cryo-EM refinement',
      'The residue has an ambiguous alignment score in the multiple sequence alignment (MSA)',
    ],
    correctIndex: 1,
    explanation: 'AlphaFold pLDDT > 90 indicates very high model confidence, where backbone and side-chain conformations can be utilized reliably for molecular docking and drug discovery analyses.',
    xpReward: 40,
  },
  {
    id: 'q4',
    subject: 'High-Performance Algorithms',
    subjectColor: '#7c3aed',
    topic: 'Numerical Linear Algebra',
    question: 'Which fundamental property is unconditionally guaranteed for any real symmetric matrix A by the Spectral Theorem?',
    options: [
      'It has complex eigenvalues with unitary modulus',
      'It cannot be diagonalized unless its determinant is non-zero',
      'It is always orthogonally diagonalizable with strictly real eigenvalues',
      'Its rank is always strictly lower than its diagonal trace sum',
    ],
    correctIndex: 2,
    explanation: 'According to the Spectral Theorem for symmetric matrices, any real symmetric matrix can be decomposed as Q * Lambda * Q^T, where Q is an orthogonal matrix of real eigenvectors and Lambda is a diagonal matrix of real eigenvalues.',
    xpReward: 30,
  },
];

interface InteractiveQuizArenaProps {
  onEarnXP: (xp: number) => void;
}

export const InteractiveQuizArena: React.FC<InteractiveQuizArenaProps> = ({ onEarnXP }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQ = SAMPLE_QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered) return;

    setIsAnswered(true);
    const isCorrect = selectedOption === currentQ.correctIndex;

    if (isCorrect) {
      const bonusXP = currentQ.xpReward + combo * 5;
      setScore((prev) => prev + 1);
      setCombo((prev) => prev + 1);
      setEarnedXP((prev) => prev + bonusXP);
      onEarnXP(bonusXP);
    } else {
      setCombo(0);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < SAMPLE_QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCombo(0);
    setIsComplete(false);
  };

  const progressPercent = ((currentIdx + 1) / SAMPLE_QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Quiz Header Bar (MVSAT Live Arena Header) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 text-lg font-bold shadow-xs">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg text-slate-900">
                MVSAT 2026 Scholarship Arena
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                LIVE COMPETITION
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Antigravity STEM &amp; Advanced Aptitude Examination</p>
          </div>
        </div>

        {/* Combo & XP Badges */}
        <div className="flex items-center gap-2.5">
          {combo > 1 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-black animate-bounce">
              <span>🔥</span>
              <span>{combo}x Streak!</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-black font-mono-code">
            <span>💎</span>
            <span>+{earnedXP} XP</span>
          </div>
        </div>
      </div>

      {isComplete ? (
        /* Completion Screen */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 animate-fadeIn shadow-lg">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-orange-500/30 animate-pulse text-white">
            🏆
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-orange-600">
              MVSAT 2026 Examination Complete
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              Outstanding Performance!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              You correctly solved {score} out of {SAMPLE_QUIZ_QUESTIONS.length} challenging problems and earned{' '}
              <strong className="text-orange-600">+{earnedXP} XP</strong>. You qualify for the 100% Scholarship Tier!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-xl font-black text-slate-900 font-heading">
                {score}/{SAMPLE_QUIZ_QUESTIONS.length}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">
                Accuracy
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="block text-xl font-black text-emerald-700 font-heading font-mono-code">
                {Math.round((score / SAMPLE_QUIZ_QUESTIONS.length) * 100)}%
              </span>
              <span className="text-[10px] text-emerald-600 uppercase font-bold">
                Score
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="block text-xl font-black text-purple-700 font-heading font-mono-code">
                +{earnedXP}
              </span>
              <span className="text-[10px] text-purple-600 uppercase font-bold">
                Total XP
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-[#ff6200] hover:bg-[#ea580c] text-white font-heading font-black text-sm shadow-md shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Retake Examination ↺
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentQ.subjectColor }}
                />
                <span>
                  {currentQ.subject} • {currentQ.topic}
                </span>
              </span>
              <span className="text-orange-600 font-mono-code font-black">
                Question {currentIdx + 1} of {SAMPLE_QUIZ_QUESTIONS.length}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 leading-relaxed">
              {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono-code overflow-x-auto border border-slate-800">
                {currentQ.codeSnippet}
              </pre>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let optionStyle = 'border-slate-200 hover:border-orange-400 bg-white hover:bg-orange-50/20';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold';
                } else if (isSelected) {
                  optionStyle = 'border-rose-500 bg-rose-50/70 text-rose-900 line-through';
                } else {
                  optionStyle = 'border-slate-200 opacity-50 bg-slate-50';
                }
              } else if (isSelected) {
                optionStyle = 'border-orange-500 bg-orange-50/50 shadow-sm';
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs sm:text-sm ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-black font-mono-code shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium text-slate-800">{option}</span>
                  </div>

                  {isAnswered && idx === currentQ.correctIndex && (
                    <span className="text-emerald-600 font-black text-sm">✓ Correct</span>
                  )}
                  {isAnswered && isSelected && idx !== currentQ.correctIndex && (
                    <span className="text-rose-600 font-black text-sm">✕ Incorrect</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                <span>💡</span>
                <span>Academic Explanation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-bold">
              Reward: <strong className="text-purple-600 font-mono-code">+{currentQ.xpReward} XP</strong>
            </span>

            {!isAnswered ? (
              <button
                disabled={selectedOption === null}
                onClick={handleCheckAnswer}
                className="px-6 py-2.5 rounded-xl bg-[#ff6200] disabled:bg-slate-200 disabled:text-slate-400 text-white font-heading font-black text-xs transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-500/20 disabled:shadow-none"
              >
                Submit Answer →
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-black text-xs transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                {currentIdx + 1 < SAMPLE_QUIZ_QUESTIONS.length ? 'Next Question →' : 'View Results 🏆'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
