'use client';

import React, { useState } from 'react';
import { PythonPlayground } from './PythonPlayground';
import { AcademicWhiteboard } from './AcademicWhiteboard';
import { H5PContentCatalogView } from './H5PContentCatalogView';

export type LabFeatureTab = 'h5p-catalog' | 'python' | 'whiteboard';

interface OpenLabsHubViewProps {
  initialTab?: LabFeatureTab;
}

export const OpenLabsHubView: React.FC<OpenLabsHubViewProps> = ({
  initialTab = 'h5p-catalog',
}) => {
  const [activeTab, setActiveTab] = useState<LabFeatureTab>(initialTab);

  const labFeatures = [
    {
      id: 'h5p-catalog' as LabFeatureTab,
      title: 'H5P Interactive Generator',
      icon: '⚡',
      repo: 'h5p.org/engine',
      badge: 'Input-Driven Engine',
      description: 'Input notes, Q&A, CSV, YouTube links, or Markdown to instantly generate playable H5P activities.',
    },
    {
      id: 'python' as LabFeatureTab,
      title: 'Python Playground',
      icon: '🐍',
      repo: 'pyodide/pyodide',
      badge: 'Wasm Engine',
      description: 'Real client-side Python 3.11 execution for attention proofs and wave optics calculations.',
    },
    {
      id: 'whiteboard' as LabFeatureTab,
      title: 'Academic Whiteboard',
      icon: '🎨',
      repo: 'excalidraw/excalidraw',
      badge: 'Canvas Studio',
      description: 'Vector sketching, geometrical shapes, freehand stylus math, and high-res PNG export.',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Innovation Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-md relative overflow-hidden bg-gradient-to-r from-yellow-50/80 via-amber-50/30 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 border border-yellow-500 font-mono-code shadow-2xs">
                🧪 Open-Source Innovation Hub
              </span>
              <span className="text-xs text-slate-500 font-bold">
                100% Free · Zero API Keys Required
              </span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Interactive STEM Labs &amp; Open Tools
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Curated suite of battle-tested open-source learning technologies running directly in your browser. All tools work out of the box with zero subscriptions or external API requirements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono-code font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All 3 Tools Operational
            </span>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-yellow-200">
          {labFeatures.map((feat) => {
            const isActive = activeTab === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-400 text-slate-950 border-yellow-500 shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-yellow-50/70 border-yellow-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{feat.icon}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono-code ${
                        isActive
                          ? 'bg-slate-950 text-yellow-300'
                          : 'bg-yellow-100 text-yellow-900'
                      }`}
                    >
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-adorn font-bold text-sm leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-mono-code opacity-80 truncate">
                  {feat.repo}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Stage Container */}
      <div className="animate-fadeIn">
        {activeTab === 'h5p-catalog' && <H5PContentCatalogView />}
        {activeTab === 'python' && <PythonPlayground />}
        {activeTab === 'whiteboard' && <AcademicWhiteboard />}
      </div>
    </div>
  );
};
