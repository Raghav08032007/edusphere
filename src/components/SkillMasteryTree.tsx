'use client';

import React, { useState } from 'react';
import { SkillNode, SkillCategory, SkillCertification } from '../types';

interface SkillMasteryTreeProps {
  skills: SkillNode[];
  certifications: SkillCertification[];
  userXP: number;
  onPracticeSkill: (skillId: string) => void;
  onEarnXP: (amount: number) => void;
  onUpdateSkillXP: (skillId: string, addedXP: number) => void;
  onRequestCertification?: (skillId: string) => void;
}

export const SkillMasteryTree: React.FC<SkillMasteryTreeProps> = ({
  skills,
  certifications,
  userXP,
  onPracticeSkill,
  onEarnXP,
  onUpdateSkillXP,
  onRequestCertification,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [activeModalSkill, setActiveModalSkill] = useState<SkillNode | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [activeCertificateView, setActiveCertificateView] = useState<SkillCertification | null>(null);

  const categories: {
    id: SkillCategory | 'all';
    label: string;
    icon: string;
    color: string;
    description: string;
  }[] = [
    {
      id: 'all',
      label: 'All Competency Tracks',
      icon: '🌳',
      color: '#ff6200',
      description: 'Unified multidimensional competency graph across computing and bio-science.',
    },
    {
      id: 'ai-ml',
      label: 'Antigravity AI & Deep Learning',
      icon: '🤖',
      color: '#ff6200',
      description: 'Convex optimization, autograd engines, transformers, and agentic LLMs.',
    },
    {
      id: 'systems',
      label: 'Distributed Systems & Cloud',
      icon: '🌐',
      color: '#0284c7',
      description: 'Network RPCs, Raft consensus, 2PC transactions, and geo-replicated CRDTs.',
    },
    {
      id: 'algorithms',
      label: 'High Performance Algorithms',
      icon: '⚡',
      color: '#7c3aed',
      description: 'Segment trees, bitmask dynamic programming, network flows, and SIMD.',
    },
    {
      id: 'bio-science',
      label: 'Computational Bio-Science',
      icon: '🧬',
      color: '#059669',
      description: 'Sequence alignment, AlphaFold 3D modeling, docking, and pathogenicity.',
    },
  ];

  // Stats calculation
  const totalUnlocked = skills.filter((s) => s.isUnlocked).length;
  const certifiedCount = skills.filter((s) => s.certifiedByStaff).length;
  const averageMastery = Math.round(
    skills.reduce((acc, s) => acc + s.masteryPercentage, 0) / (skills.length || 1)
  );

  const getCategoryColor = (cat: SkillCategory) => {
    switch (cat) {
      case 'ai-ml':
        return '#ff6200';
      case 'systems':
        return '#0284c7';
      case 'algorithms':
        return '#7c3aed';
      case 'bio-science':
        return '#059669';
    }
  };

  const handleStudySprint = (skill: SkillNode) => {
    const gained = 35;
    onUpdateSkillXP(skill.id, gained);
    onEarnXP(gained);
    setPracticeFeedback(`🎉 +${gained} XP Earned! Mastery increased for "${skill.title}"!`);
    setTimeout(() => setPracticeFeedback(null), 3000);
  };

  const handleTestDiagnosticAnswer = () => {
    if (!activeModalSkill?.diagnosticQuestion || selectedQuizOption === null) return;
    setIsQuizAnswered(true);

    const isCorrect = selectedQuizOption === activeModalSkill.diagnosticQuestion.correctIndex;
    if (isCorrect) {
      onEarnXP(50);
      onUpdateSkillXP(activeModalSkill.id, 50);
      setPracticeFeedback('🏆 Correct Answer! +50 XP awarded for mastering diagnostic milestone!');
    } else {
      setPracticeFeedback('💡 Review the mathematical explanation below to reinforce core concepts.');
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Banner: Antigravity Competency Matrix Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-slate-50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                🌳 Antigravity Competency Matrix
              </span>
              <span className="text-xs text-slate-500 font-bold">Interactive Dependency Graph</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Antigravity Skill Graph &amp; Faculty Endorsements
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Complete prerequisite engineering milestones to unlock advanced research levels. Every certified milestone receives an official digitally signed endorsement from Dean Dr. K. Rajan.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[110px]">
              <span className="text-xs text-slate-500 font-bold uppercase block">Unlocked</span>
              <span className="font-heading text-2xl font-black text-orange-600 font-mono-code mt-0.5">
                {totalUnlocked}/{skills.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-black block mt-0.5">
                {Math.round((totalUnlocked / skills.length) * 100)}% Complete
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[110px]">
              <span className="text-xs text-slate-500 font-bold uppercase block">Mastery</span>
              <span className="font-heading text-2xl font-black text-indigo-600 font-mono-code mt-0.5">
                {averageMastery}%
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Cohort Average</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[110px]">
              <span className="text-xs text-slate-500 font-bold uppercase block">Endorsed</span>
              <span className="font-heading text-2xl font-black text-emerald-600 font-mono-code mt-0.5">
                {certifiedCount}
              </span>
              <span className="text-[10px] text-emerald-700 font-black block mt-0.5">Faculty Verified</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[110px]">
              <span className="text-xs text-slate-500 font-bold uppercase block">Scholar XP</span>
              <span className="font-heading text-2xl font-black text-amber-500 font-mono-code mt-0.5">
                {userXP ?? 0}
              </span>
              <span className="text-[10px] text-amber-700 font-black block mt-0.5">Total Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Filter Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#ff6200] border-[#ff6200] text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Curriculum Tracks with Dependency Flow */}
      <div className="space-y-10">
        {(['ai-ml', 'systems', 'algorithms', 'bio-science'] as SkillCategory[])
          .filter((cat) => selectedCategory === 'all' || selectedCategory === cat)
          .map((cat) => {
            const trackSkills = skills.filter((s) => s.category === cat).sort((a, b) => a.level - b.level);
            const catColor = getCategoryColor(cat);
            const catName = trackSkills[0]?.categoryName || cat;

            return (
              <div key={cat} className="space-y-4">
                {/* Track Section Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full shadow-xs"
                      style={{ backgroundColor: catColor }}
                    />
                    <h3 className="font-heading text-xl font-black text-slate-900">
                      {catName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-bold">
                      {trackSkills.filter((s) => s.isUnlocked).length} of {trackSkills.length} Unlocked
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono-code font-bold text-slate-700">
                      Level 1 ➔ Level 4 Pathway
                    </span>
                  </div>
                </div>

                {/* 4-Column Progressive Grid with Animated Visual Flow */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                  {trackSkills.map((skill, index) => {
                    const isStaffCertified = !!skill.certifiedByStaff;
                    const isMastered = skill.masteryPercentage === 100;

                    return (
                      <div
                        key={skill.id}
                        onClick={() => {
                          setActiveModalSkill(skill);
                          setSelectedQuizOption(null);
                          setIsQuizAnswered(false);
                        }}
                        className={`bg-white rounded-3xl p-5 border-2 cursor-pointer transition-all relative flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 group ${
                          !skill.isUnlocked
                            ? 'opacity-65 bg-slate-50/80 border-dashed border-slate-300'
                            : isStaffCertified
                            ? 'border-emerald-400 bg-gradient-to-br from-white via-white to-emerald-50/30 shadow-sm'
                            : isMastered
                            ? 'border-orange-400 bg-gradient-to-br from-white via-white to-orange-50/20'
                            : 'border-slate-200 hover:border-orange-400'
                        }`}
                      >
                        {/* Top Level Ribbon & Status Pill */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono-code"
                              style={{
                                backgroundColor: skill.isUnlocked ? `${catColor}15` : '#f1f5f9',
                                color: skill.isUnlocked ? catColor : '#94a3b8',
                              }}
                            >
                              Level {skill.level} Milestone
                            </span>

                            {isStaffCertified ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300"
                                title="Faculty Certified by Dr. K. Rajan"
                              >
                                <span>🏛️</span>
                                <span>Certified</span>
                              </span>
                            ) : !skill.isUnlocked ? (
                              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                <span>🔒</span> Locked
                              </span>
                            ) : isMastered ? (
                              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                                <span>👑</span> Mastered
                              </span>
                            ) : (
                              <span className="text-xs font-mono-code text-slate-400 font-bold">
                                {skill.badgeIcon}
                              </span>
                            )}
                          </div>

                          {/* Skill Icon & Titles */}
                          <div className="flex items-start gap-3 my-2">
                            <div className="text-2xl p-2.5 rounded-2xl bg-slate-50 border border-slate-200 group-hover:scale-110 transition-transform shrink-0">
                              {skill.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-heading text-sm font-black text-slate-900 leading-snug line-clamp-2">
                                {skill.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                                {skill.badgeName}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 my-2 leading-relaxed">
                            {skill.description}
                          </p>
                        </div>

                        {/* Progress and XP Footer */}
                        <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500 font-medium">Competency Mastery</span>
                            <span
                              className="font-mono-code font-black"
                              style={{ color: skill.isUnlocked ? catColor : '#94a3b8' }}
                            >
                              {skill.masteryPercentage}%
                            </span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${skill.masteryPercentage}%`,
                                backgroundColor: skill.isUnlocked ? catColor : '#cbd5e1',
                              }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono-code pt-0.5">
                            <span>{skill.currentXP} / {skill.xpRequired} XP</span>
                            <span className="font-black text-orange-600 group-hover:translate-x-0.5 transition-transform">
                              Inspect Dossier →
                            </span>
                          </div>
                        </div>

                        {/* Next stage connection hint on desktop */}
                        {index < trackSkills.length - 1 && (
                          <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-400 text-[10px] items-center justify-center font-bold pointer-events-none shadow-xs">
                            →
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Faculty Verified Credentials Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <h3 className="font-heading text-xl font-black text-slate-900">
                Official Faculty Endorsement Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified certifications signed by Dean Dr. K. Rajan (Head of Computer Science &amp; Antigravity AI).
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 w-fit">
            {certifications.length} Credentials Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              onClick={() => setActiveCertificateView(cert)}
              className="p-5 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 shadow-xs space-y-3 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Certified Competency
                  </span>
                  <h4 className="font-heading text-base font-black text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                    {cert.skillTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    Candidate: <strong className="text-slate-800">{cert.studentName}</strong>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-600/30 font-mono-code shrink-0">
                  {cert.grade}
                </div>
              </div>

              <p className="text-xs text-slate-700 italic bg-white p-3 rounded-2xl border border-slate-200 leading-relaxed">
                &ldquo;{cert.feedback}&rdquo;
              </p>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Signatory: <strong>{cert.certifiedBy}</strong></span>
                <span>Date: {cert.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Competency Node Dossier & Diagnostic Modal */}
      {activeModalSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setActiveModalSkill(null);
                setSelectedQuizOption(null);
                setIsQuizAnswered(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="text-3xl p-4 rounded-3xl bg-orange-50 border border-orange-200 shrink-0">
                {activeModalSkill.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono-code"
                    style={{
                      backgroundColor: `${getCategoryColor(activeModalSkill.category)}15`,
                      color: getCategoryColor(activeModalSkill.category),
                    }}
                  >
                    {activeModalSkill.categoryName} • Level {activeModalSkill.level}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {activeModalSkill.badgeIcon} {activeModalSkill.badgeName}
                  </span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {activeModalSkill.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Competency Scope &amp; Theoretical Framework
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {activeModalSkill.description}
              </p>
            </div>

            {/* Syllabus Topics */}
            {activeModalSkill.syllabusTopics && activeModalSkill.syllabusTopics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Curriculum Learning Milestones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalSkill.syllabusTopics.map((topic, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic Knowledge Challenge */}
            {activeModalSkill.diagnosticQuestion && (
              <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-800 flex items-center gap-1.5">
                    <span>⚡</span> Diagnostic Knowledge Challenge (+50 XP)
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">Instant Assessment</span>
                </div>

                <p className="text-xs sm:text-sm font-black text-slate-900">
                  {activeModalSkill.diagnosticQuestion.question}
                </p>

                <div className="space-y-2">
                  {activeModalSkill.diagnosticQuestion.options.map((opt, i) => {
                    const isSelected = selectedQuizOption === i;
                    let style = 'bg-white border-slate-200 hover:border-orange-400';
                    if (isQuizAnswered) {
                      if (i === activeModalSkill.diagnosticQuestion?.correctIndex) {
                        style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      } else if (isSelected) {
                        style = 'bg-rose-50 border-rose-500 text-rose-800 line-through';
                      } else {
                        style = 'bg-slate-50 border-slate-200 opacity-60';
                      }
                    } else if (isSelected) {
                      style = 'bg-orange-50 border-orange-500 shadow-xs';
                    }

                    return (
                      <div
                        key={i}
                        onClick={() => !isQuizAnswered && setSelectedQuizOption(i)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${style}`}
                      >
                        <span className="font-mono-code font-bold w-5 shrink-0">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {!isQuizAnswered ? (
                  <button
                    disabled={selectedQuizOption === null}
                    onClick={handleTestDiagnosticAnswer}
                    className="w-full py-2.5 rounded-xl bg-[#ff6200] disabled:bg-slate-200 text-white font-heading font-black text-xs transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-orange-500/20 disabled:shadow-none"
                  >
                    Verify Answer →
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-black text-slate-900 block">Academic Proof:</span>
                    <p className="leading-relaxed">{activeModalSkill.diagnosticQuestion.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Prerequisites */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Prerequisite Milestones
              </h4>
              {activeModalSkill.prerequisiteIds.length === 0 ? (
                <span className="text-xs text-emerald-600 font-bold">
                  ✓ Entry level milestone (No prior prerequisites required)
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeModalSkill.prerequisiteIds.map((pid) => {
                    const prereq = skills.find((s) => s.id === pid);
                    return (
                      <span
                        key={pid}
                        className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium"
                      >
                        {prereq ? prereq.title : pid}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Staff Endorsement if Certified */}
            {activeModalSkill.certifiedByStaff && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <span>🏛️</span>
                  <span>Faculty Endorsement: {activeModalSkill.certifiedByStaff.staffName}</span>
                </div>
                <p className="text-xs text-slate-700 italic">
                  &ldquo;{activeModalSkill.certifiedByStaff.remarks}&rdquo;
                </p>
                <div className="text-[10px] text-emerald-700 font-medium">
                  Certified: {activeModalSkill.certifiedByStaff.certifiedAt} • {activeModalSkill.certifiedByStaff.designation}
                </div>
              </div>
            )}

            {/* Feedback notification */}
            {practiceFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold animate-fadeIn">
                {practiceFeedback}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Mastery: <strong className="text-orange-600 font-mono-code">{activeModalSkill.masteryPercentage}%</strong> •{' '}
                {activeModalSkill.currentXP} / {activeModalSkill.xpRequired} XP
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleStudySprint(activeModalSkill)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-xs"
                >
                  ⚡ Focus Sprint (+35 XP)
                </button>

                {onRequestCertification && !activeModalSkill.certifiedByStaff && activeModalSkill.isUnlocked && (
                  <button
                    onClick={() => {
                      onRequestCertification(activeModalSkill.id);
                      setPracticeFeedback('🎓 Request for Faculty Endorsement dispatched to Dr. K. Rajan!');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                  >
                    📝 Request Faculty Endorsement
                  </button>
                )}

                <button
                  onClick={() => {
                    onPracticeSkill(activeModalSkill.id);
                    setActiveModalSkill(null);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all"
                >
                  MVSAT Arena Practice →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Digital Certificate Modal */}
      {activeCertificateView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl p-8 border-4 border-amber-300 shadow-2xl space-y-6 relative text-center">
            <button
              onClick={() => setActiveCertificateView(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              ✕
            </button>

            {/* Certificate Header with Seal */}
            <div className="space-y-2 pt-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/30">
                🏛️
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                Certificate of Academic Endorsement
              </span>
              <h2 className="font-heading text-2xl font-black text-slate-900">
                Vedantu Antigravity Competency Board
              </h2>
            </div>

            <div className="border-t border-b border-slate-200 py-4 space-y-2">
              <p className="text-xs text-slate-500 uppercase">This is to officially certify that</p>
              <h3 className="text-2xl font-black text-slate-900 font-heading">
                {activeCertificateView.studentName}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                has satisfied all theoretical prerequisites and laboratory examinations with distinction in:
              </p>
              <div className="inline-block px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 font-black text-sm">
                {activeCertificateView.skillTitle}
              </div>
              <div className="pt-2 text-xs font-bold text-slate-700">
                Grade: <span className="font-mono-code font-black text-emerald-700">{activeCertificateView.grade}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic max-w-md mx-auto">
              &ldquo;{activeCertificateView.feedback}&rdquo;
            </p>

            <div className="flex justify-between items-end pt-4 text-left text-xs border-t border-slate-100">
              <div>
                <span className="block font-black text-slate-800">{activeCertificateView.certifiedBy}</span>
                <span className="text-[10px] text-slate-500">{activeCertificateView.designation}</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-slate-700 font-mono-code">Date: {activeCertificateView.date}</span>
                <span className="text-[10px] text-emerald-600 font-black">✓ Digitally Signed &amp; Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
