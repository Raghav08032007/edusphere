'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

type TimerMode = 'focus' | 'sprint' | 'shortBreak' | 'longBreak';
type AmbientSound = 'none' | 'rain' | 'alpha' | 'whitenoise';

const CUSTOM_DURATIONS: Record<TimerMode, number> = {
  focus: 25,
  sprint: 50,
  shortBreak: 5,
  longBreak: 15,
};

interface PomodoroTimerProps {
  onSessionComplete?: (minutes: number) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(3);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [volume, setVolume] = useState(0.5);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<{ stop: () => void; gainNode: GainNode } | null>(null);

  const totalSeconds = CUSTOM_DURATIONS[mode] * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(CUSTOM_DURATIONS[newMode] * 60);
  };

  const startAmbientSound = useCallback((sound: AmbientSound, vol: number) => {
    if (soundNodeRef.current) {
      soundNodeRef.current.stop();
      soundNodeRef.current = null;
    }

    if (sound === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (sound === 'alpha') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.frequency.setValueAtTime(442, ctx.currentTime);
        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start();
        osc2.start();

        soundNodeRef.current = {
          stop: () => {
            try {
              osc1.stop();
              osc2.stop();
            } catch {}
          },
          gainNode: masterGain,
        };
      } else if (sound === 'rain' || sound === 'whitenoise') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (sound === 'rain') {
            lastOut = (lastOut * 0.95) + (white * 0.05);
            data[i] = lastOut * 3;
          } else {
            data[i] = white * 0.3;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(masterGain);
        noise.start();

        soundNodeRef.current = {
          stop: () => {
            try {
              noise.stop();
            } catch {}
          },
          gainNode: masterGain,
        };
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      startAmbientSound(ambientSound, volume);
    } else {
      if (soundNodeRef.current) {
        soundNodeRef.current.stop();
        soundNodeRef.current = null;
      }
    }
  }, [isRunning, ambientSound, volume, startAmbientSound]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          const minutesCompleted = CUSTOM_DURATIONS[mode];
          if (mode === 'focus' || mode === 'sprint') {
            setCompletedSessions((s) => s + 1);
            if (onSessionComplete) {
              onSessionComplete(minutesCompleted);
            }
          }
          return CUSTOM_DURATIONS[mode] * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, onSessionComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden border border-slate-200 shadow-xs">
      {/* Mode Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mb-6 z-10">
        <button
          onClick={() => handleModeChange('focus')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            mode === 'focus'
              ? 'bg-[#ff6200] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🎯 25m Focus
        </button>
        <button
          onClick={() => handleModeChange('sprint')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            mode === 'sprint'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚡ 50m Deep Sprint
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            mode === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ☕ 5m Short Break
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            mode === 'longBreak'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🌴 15m Recharge
        </button>
      </div>

      {/* Circular Progress Ring */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-sm" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="vedantuTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6200" />
              <stop offset="50%" stopColor="#ffbe1a" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="43"
            className="stroke-slate-100"
            strokeWidth="5"
            fill="transparent"
          />

          {/* Active progress with gradient */}
          <circle
            cx="50"
            cy="50"
            r="43"
            stroke="url(#vedantuTimerGradient)"
            strokeWidth="5.5"
            strokeDasharray={270.17}
            strokeDashoffset={270.17 - (270.17 * progressPercent) / 100}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500"
          />
        </svg>

        {/* Center Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl sm:text-6xl font-black font-mono-code tracking-tighter text-slate-900">
            {formattedTime}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
            {mode === 'focus' ? 'Deep Study Session' : mode === 'sprint' ? 'Intensive Problem Sprint' : 'Rest & Recharge'}
          </span>
          <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs text-orange-800 font-bold">
            <span>🍅</span>
            <span>{completedSessions} Sessions • +{completedSessions * 50} XP</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mt-6 z-10">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3.5 rounded-2xl font-heading font-black text-sm text-white shadow-md transition-all duration-200 transform active:scale-95 flex items-center gap-2.5 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
              : 'bg-[#ff6200] hover:bg-[#ea580c] shadow-orange-500/25 hover:scale-105'
          }`}
        >
          {isRunning ? (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Start Session (+50 XP)</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(CUSTOM_DURATIONS[mode] * 60);
          }}
          className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          title="Reset Timer"
          aria-label="Reset Timer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Ambient Soundscapes Selector */}
      <div className="w-full mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">🎧 Ambient Audio:</span>
          <div className="flex gap-1">
            {[
              { id: 'none', label: 'Off' },
              { id: 'rain', label: '🌧️ Rain' },
              { id: 'whitenoise', label: '📻 White Noise' },
              { id: 'alpha', label: '🧘 432Hz Waves' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => setAmbientSound(snd.id as AmbientSound)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  ambientSound === snd.id
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {ambientSound !== 'none' && (
          <div className="flex items-center gap-2">
            <span>Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-orange-600 h-1 rounded bg-slate-300"
            />
          </div>
        )}
      </div>
    </div>
  );
};
