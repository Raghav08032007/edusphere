'use client';

import React from 'react';

export interface CourseTrack {
  id: string;
  title: string;
  category: string;
  icon: string;
  colorBg: string;
  borderColor: string;
  textColor: string;
  badge?: string;
  studentsCount: string;
}

interface PopularCoursesShelfProps {
  onSelectTrack: (trackId: string) => void;
}

export const POPULAR_TRACKS: CourseTrack[] = [
  {
    id: 'jee',
    title: '2-Year JEE (Main & Adv)',
    category: 'Engineering & Physics',
    icon: '⏱️',
    colorBg: 'bg-[#eeebfc]',
    borderColor: 'border-[#d8d2fb]',
    textColor: 'text-[#5a36db]',
    badge: 'Popular',
    studentsCount: '45,000+ Enrolled',
  },
  {
    id: 'neet',
    title: '2-Year NEET (Medical)',
    category: 'Biology & Chemistry',
    icon: '▶️',
    colorBg: 'bg-[#fff5e9]',
    borderColor: 'border-[#fedec0]',
    textColor: 'text-[#d97706]',
    badge: 'High Impact',
    studentsCount: '38,000+ Enrolled',
  },
  {
    id: 'offline',
    title: 'Offline Centres & Labs',
    category: 'Hybrid Classroom Learning',
    icon: '🎓',
    colorBg: 'bg-[#e7f8f2]',
    borderColor: 'border-[#b6edd9]',
    textColor: 'text-[#059669]',
    badge: 'New Centres',
    studentsCount: '60+ Indian Cities',
  },
  {
    id: 'olympiad',
    title: 'Olympiad & Antigravity AI',
    category: 'Advanced STEM & Coding',
    icon: '📖',
    colorBg: 'bg-[#fcebf2]',
    borderColor: 'border-[#f8c5d8]',
    textColor: 'text-[#db2777]',
    badge: 'Global Rank',
    studentsCount: '12,000+ Competitors',
  },
  {
    id: 'early-learning',
    title: 'Early Learning (Class 6 - 10)',
    category: 'Foundations & Math Olympiad',
    icon: '📱',
    colorBg: 'bg-[#ffedea]',
    borderColor: 'border-[#ffd4cc]',
    textColor: 'text-[#ea580c]',
    studentsCount: '50,000+ Active',
  },
  {
    id: 'one-on-one',
    title: 'One to One LIVE Classes',
    category: 'Personalized Expert Mentorship',
    icon: '👥',
    colorBg: 'bg-[#eaf2ff]',
    borderColor: 'border-[#cce0ff]',
    textColor: 'text-[#2563eb]',
    badge: '1-on-1 Dedicated',
    studentsCount: '100% Personal Care',
  },
];

export const PopularCoursesShelf: React.FC<PopularCoursesShelfProps> = ({ onSelectTrack }) => {
  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg relative -mt-4 z-20 space-y-5">
      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Yellow Badge matching reference screenshot */}
          <span className="px-4 py-1.5 rounded-full bg-[#ffea79] text-slate-950 font-heading font-black text-sm tracking-wide shadow-xs">
            Popular Courses
          </span>
          <p className="text-xs text-slate-500 font-medium hidden md:inline">
            Comprehensive Learning Programs Designed by Master Teachers
          </p>
        </div>

        <span className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer">
          View All Programs (120+) →
        </span>
      </div>

      {/* 6 Category Cards Grid matching reference layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {POPULAR_TRACKS.map((track) => (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track.id)}
            className={`${track.colorBg} border ${track.borderColor} rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group min-h-[120px]`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{track.icon}</span>
                <span className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all text-sm font-black">
                  ›
                </span>
              </div>

              <div>
                <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 leading-snug">
                  {track.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">
                  {track.category}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px]">
              <span className={`font-bold ${track.textColor}`}>{track.studentsCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
