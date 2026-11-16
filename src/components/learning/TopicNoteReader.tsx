'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Course, CourseTopic, VideoCheckpoint } from '../../types/curriculum';
import { formatSafeDate } from '../../utils/dateUtils';
import { MathMarkdownRenderer } from '../ui/MathMarkdownRenderer';
import katex from 'katex';

export const parseTimestampToSeconds = (ts: string): number => {
  if (!ts) return 0;
  const parts = ts.trim().split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return Number(ts) || 0;
};

interface TopicNoteReaderProps {
  course: Course;
  topic: CourseTopic;
  onBackToCourse: () => void;
  onNavigateTopic: (nextTopicId: string) => void;
  onOpenQuestions: (topicId: string) => void;
  onAskCooper: (prompt: string) => void;
  onToggleComplete: (topicId: string) => void;
  onToggleBookmark: (topicId: string) => void;
}

export const TopicNoteReader: React.FC<TopicNoteReaderProps> = ({
  course,
  topic,
  onBackToCourse,
  onNavigateTopic,
  onOpenQuestions,
  onAskCooper,
  onToggleComplete,
  onToggleBookmark,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // Checkpoint & Video Interactive State
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState<number | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [gateFeedback, setGateFeedback] = useState<string | null>(null);
  const [passedCheckpointIds, setPassedCheckpointIds] = useState<string[]>([]);
  const [rewindToast, setRewindToast] = useState<string | null>(null);

  // Player references
  const ytPlayerRef = useRef<any>(null);
  const directVideoRef = useRef<HTMLVideoElement | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Find module & all topics for prev/next navigation
  const allTopics: CourseTopic[] = [];
  let currentModuleTitle = '';
  course.modules.forEach((mod) => {
    mod.topics.forEach((t) => {
      allTopics.push(t);
      if (t.id === topic.id) {
        currentModuleTitle = `Module ${mod.moduleNumber}: ${mod.title}`;
      }
    });
  });

  const currentIndex = allTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  // Video Source Parsing
  const videoSource = React.useMemo(() => {
    if (!topic?.videoUrl) return { isYouTube: false, isDirect: false, embedUrl: '', videoId: '' };
    const raw = topic.videoUrl.trim();

    // YouTube regex match
    const ytMatch = raw.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return {
        isYouTube: true,
        isDirect: false,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0&modestbranding=1`,
        videoId: ytMatch[1],
      };
    }

    if (raw.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || raw.startsWith('blob:')) {
      return {
        isYouTube: false,
        isDirect: true,
        embedUrl: raw,
        videoId: '',
      };
    }

    return {
      isYouTube: false,
      isDirect: false,
      embedUrl: raw,
      videoId: '',
    };
  }, [topic?.videoUrl]);

  // Checkpoints for this topic
  const checkpoints: VideoCheckpoint[] = React.useMemo(() => {
    if (topic?.videoCheckpoints && topic.videoCheckpoints.length > 0) {
      return topic.videoCheckpoints;
    }
    // Fallback checkpoints if topic has video but no explicit checkpoints configured
    if (topic?.videoUrl) {
      return [
        {
          id: `cp-fb-1-${topic.id}`,
          timestamp: '0:15',
          seconds: 15,
          question: `In "${topic.title}", what fundamental principle or intuition is established in the opening segment?`,
          options: [
            'Foundational mathematical definitions and problem framing',
            'Arbitrary heuristic guesswork without formal proofs',
            'Historical biographical details of unrelated contributors',
            'Discarding boundary constraints without validation',
          ],
          correctIdx: 0,
        },
        {
          id: `cp-fb-2-${topic.id}`,
          timestamp: '0:35',
          seconds: 35,
          question: `Which core theoretical mechanism guarantees correctness in this topic's architecture?`,
          options: [
            'Invariant preservation under all transition states',
            'Unbounded memory consumption without garbage collection',
            'Ignoring asynchronous network latency',
            'Permitting non-deterministic race conditions',
          ],
          correctIdx: 0,
        },
      ];
    }
    return [];
  }, [topic]);

  // Initialize YouTube Player API
  useEffect(() => {
    if (!videoSource.isYouTube) return;

    let isSubscribed = true;
    const setupPlayer = () => {
      if (!isSubscribed) return;
      if (typeof window !== 'undefined' && (window as any).YT && (window as any).YT.Player) {
        try {
          const iframeEl = document.getElementById('topic-video-player');
          if (iframeEl) {
            ytPlayerRef.current = new (window as any).YT.Player('topic-video-player', {
              events: {
                onReady: () => {
                  console.log('Topic YouTube Player initialized for topic:', topic.title);
                },
              },
            });
          }
        } catch (e) {
          console.warn('YT Player init in TopicNoteReader:', e);
        }
      }
    };

    if (typeof window !== 'undefined') {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
        (window as any).onYouTubeIframeAPIReady = setupPlayer;
      } else {
        setupPlayer();
      }
    }

    return () => {
      isSubscribed = false;
    };
  }, [videoSource, topic.id]);

  // Checkpoint Polling Loop
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (!videoSource.embedUrl || checkpoints.length === 0) return;

    pollTimerRef.current = setInterval(() => {
      let currentSecs = 0;

      if (videoSource.isYouTube && ytPlayerRef.current?.getCurrentTime) {
        try {
          currentSecs = ytPlayerRef.current.getCurrentTime() || 0;
        } catch (e) {}
      } else if (directVideoRef.current) {
        currentSecs = directVideoRef.current.currentTime || 0;
      }

      if (currentSecs <= 0) return;

      // Check if currentSecs matches any unpassed checkpoint
      for (let i = 0; i < checkpoints.length; i++) {
        const cp = checkpoints[i];
        const cpSecs = cp.seconds || parseTimestampToSeconds(cp.timestamp);
        if (
          !passedCheckpointIds.includes(cp.id) &&
          currentSecs >= cpSecs - 0.4 &&
          currentSecs <= cpSecs + 1.8 &&
          activeCheckpointIndex === null
        ) {
          // Pause video
          if (videoSource.isYouTube && ytPlayerRef.current?.pauseVideo) {
            try {
              ytPlayerRef.current.pauseVideo();
            } catch (e) {}
          } else if (directVideoRef.current) {
            directVideoRef.current.pause();
          }

          // Trigger Mandatory Gate
          setActiveCheckpointIndex(i);
          setSelectedOptionIdx(null);
          setGateFeedback(null);
          break;
        }
      }
    }, 350);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [videoSource, checkpoints, passedCheckpointIds, activeCheckpointIndex]);

  // Handle checkpoint answer submission
  const handleCheckpointSubmit = () => {
    if (activeCheckpointIndex === null || !checkpoints[activeCheckpointIndex]) return;

    const currentCp = checkpoints[activeCheckpointIndex];
    if (selectedOptionIdx === null) {
      setGateFeedback('⚠️ Please select an answer before submitting.');
      return;
    }

    if (selectedOptionIdx === currentCp.correctIdx) {
      // Correct!
      setGateFeedback('✓ Correct! Outstanding comprehension. Resuming lecture playback...');
      setPassedCheckpointIds((prev) => [...prev, currentCp.id]);

      setTimeout(() => {
        setActiveCheckpointIndex(null);
        setSelectedOptionIdx(null);
        setGateFeedback(null);

        // Resume video
        if (videoSource.isYouTube && ytPlayerRef.current?.playVideo) {
          try {
            ytPlayerRef.current.playVideo();
          } catch (e) {}
        } else if (directVideoRef.current) {
          directVideoRef.current.play();
        }
      }, 1000);
    } else {
      // Incorrect -> Adaptive Rewind
      const prevCp = activeCheckpointIndex > 0 ? checkpoints[activeCheckpointIndex - 1] : null;
      const rewindSecs = prevCp ? prevCp.seconds || parseTimestampToSeconds(prevCp.timestamp) : 0;
      const rewindTimeLabel = prevCp ? prevCp.timestamp : '0:00';

      setGateFeedback(
        `❌ Incorrect. Mandatory Rule: Rewinding back to ${rewindTimeLabel} so you can review the lecture segment thoroughly before retrying.`
      );

      setTimeout(() => {
        setActiveCheckpointIndex(null);
        setSelectedOptionIdx(null);
        setGateFeedback(null);

        // Execute rewind
        if (videoSource.isYouTube && ytPlayerRef.current?.seekTo) {
          try {
            ytPlayerRef.current.seekTo(rewindSecs, true);
            ytPlayerRef.current.playVideo();
          } catch (e) {}
        } else if (directVideoRef.current) {
          directVideoRef.current.currentTime = rewindSecs;
          directVideoRef.current.play();
        }

        // Show prominent on-screen rewind notification
        setRewindToast(
          `🔄 Rewound to ${rewindTimeLabel}: Please review the lecture carefully to master this checkpoint!`
        );
        setTimeout(() => setRewindToast(null), 5000);
      }, 1500);
    }
  };

  // Jump to specific checkpoint directly
  const handleJumpToMarker = (cp: VideoCheckpoint, idx: number) => {
    const secs = cp.seconds || parseTimestampToSeconds(cp.timestamp);
    if (videoSource.isYouTube && ytPlayerRef.current?.seekTo) {
      try {
        ytPlayerRef.current.seekTo(Math.max(0, secs - 0.5), true);
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    } else if (directVideoRef.current) {
      directVideoRef.current.currentTime = Math.max(0, secs - 0.5);
      directVideoRef.current.pause();
    }
    setActiveCheckpointIndex(idx);
    setSelectedOptionIdx(null);
    setGateFeedback(null);
  };

  // Helper to render inline math
  const renderMathContent = (text: string) => {
    try {
      return text.replace(/\$([^\$]+)\$/g, (_, math) => {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      });
    } catch (e) {
      return text;
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const allPassed =
    checkpoints.length > 0 &&
    checkpoints.every((cp) => passedCheckpointIds.includes(cp.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Rewind Toast Notice */}
      {rewindToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl bg-amber-950 text-yellow-300 border-2 border-yellow-400 shadow-2xl text-xs font-bold flex items-center gap-3 animate-bounce">
          <span className="text-xl">🔄</span>
          <span>{rewindToast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-yellow-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-mono-code">
          <button
            onClick={onBackToCourse}
            className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>←</span>
            <span>Back to Syllabus</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 truncate max-w-[200px] sm:max-w-xs">{currentModuleTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Toggle */}
          <button
            onClick={() => onToggleBookmark(topic.id)}
            title={topic.isBookmarked ? 'Remove bookmark' : 'Bookmark this note'}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              topic.isBookmarked
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-500 border-yellow-200 hover:bg-yellow-50'
            }`}
          >
            <span>{topic.isBookmarked ? '⭐ Saved' : '☆ Save'}</span>
          </button>

          {/* Mark Complete Toggle */}
          <button
            onClick={() => onToggleComplete(topic.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              topic.isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-yellow-300 hover:bg-yellow-50'
            }`}
          >
            <span>{topic.isCompleted ? '✓ Completed' : '○ Mark as Read'}</span>
          </button>

          {/* Ask Cooper quick query */}
          <button
            onClick={() =>
              onAskCooper(
                `Help me understand the core intuition and mathematical proof behind: "${topic.title}" from course ${course.code}.`
              )
            }
            className="yellow-gradient-btn px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>🤖</span>
            <span className="hidden sm:inline">Ask Cooper</span>
          </button>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-yellow-200 shadow-sm space-y-8">
        {/* Title Header */}
        <header className="space-y-4 border-b border-yellow-200/80 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono-code">
              Topic {topic.topicNumber}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono-code">
              ⏱️ {topic.note.readingMinutes || topic.estimatedMinutes} min reading time
            </span>
            {topic.videoUrl && (
              <span className="text-xs font-bold text-amber-700 font-mono-code bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                🎬 {topic.videoDurationMinutes || 20}m Video Lecture
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono-code">
              • Updated {formatSafeDate(topic.note.updatedAt, { format: 'medium' })}
            </span>
          </div>

          <h1 className="font-adorn text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {topic.title}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-amber-800 font-mono-code">
            {course.code} • {course.title}
          </p>
        </header>

        {/* ========================================================================= */}
        {/* INTERACTIVE VIDEO LECTURE WITH MANDATORY PAUSE CHECKPOINTS & ADAPTIVE REWIND */}
        {/* ========================================================================= */}
        {topic.videoUrl && (
          <section className="rounded-3xl bg-slate-950 p-5 sm:p-7 border-2 border-yellow-400 shadow-2xl text-white space-y-5 animate-fadeIn">
            {/* Video Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono-code font-black uppercase tracking-wider text-yellow-400">
                  Interactive Lecture Video • {topic.videoDurationMinutes || 20} Mins
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-400 text-slate-950 font-black uppercase font-mono-code">
                  Mandatory Checkpoints Active
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono-code">
                  Passed Checkpoints: {passedCheckpointIds.length}/{checkpoints.length}
                </span>
                {allPassed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ✓ All Mastered
                  </span>
                )}
              </div>
            </div>

            {/* Video Player Display Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
              {videoSource.isYouTube ? (
                <iframe
                  id="topic-video-player"
                  src={videoSource.embedUrl}
                  title={topic.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : videoSource.isDirect ? (
                <video
                  ref={directVideoRef}
                  src={videoSource.embedUrl}
                  controls
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src={topic.videoUrl}
                  title={topic.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              )}

              {/* OVERLAY: MANDATORY CHECKPOINT ASSESSMENT GATE */}
              {activeCheckpointIndex !== null && checkpoints[activeCheckpointIndex] && (
                <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-center animate-fadeIn overflow-y-auto">
                  <div className="max-w-2xl mx-auto w-full space-y-5 bg-slate-900 p-6 sm:p-8 rounded-3xl border-2 border-yellow-400 shadow-2xl">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="text-xs font-black uppercase tracking-wider text-yellow-400 font-mono-code">
                          Mandatory Checkpoint #{activeCheckpointIndex + 1} at{' '}
                          {checkpoints[activeCheckpointIndex].timestamp}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono-code">
                        Video Paused • Answer Required
                      </span>
                    </div>

                    {/* Question Prompt */}
                    <div
                      className="text-sm sm:text-base font-bold text-white leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderMathContent(checkpoints[activeCheckpointIndex].question),
                      }}
                    />

                    {/* Multiple Choice Options */}
                    <div className="space-y-2.5">
                      {checkpoints[activeCheckpointIndex].options.map((opt, optIdx) => {
                        const isSelected = selectedOptionIdx === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => setSelectedOptionIdx(optIdx)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isSelected
                                ? 'bg-yellow-400/20 border-yellow-400 text-yellow-200'
                                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`cp-opt-${activeCheckpointIndex}`}
                              checked={isSelected}
                              onChange={() => setSelectedOptionIdx(optIdx)}
                              className="mt-1 accent-yellow-400 cursor-pointer"
                            />
                            <div
                              className="text-xs sm:text-sm font-medium leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: renderMathContent(opt) }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Gate Feedback Alert */}
                    {gateFeedback && (
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-bold leading-relaxed ${
                          gateFeedback.startsWith('✓')
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                            : 'bg-red-950 text-red-300 border border-red-500'
                        }`}
                      >
                        {gateFeedback}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleCheckpointSubmit}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Unlock &amp; Resume Lecture Playback</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Checkpoint Jump Bar & Timeline Badges */}
            {checkpoints.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-mono-code uppercase tracking-wider">
                    ⚡ Checkpoints Timeline (Click to Jump &amp; Test)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-code">
                    Wrong answers automatically rewind to previous checkpoint
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {checkpoints.map((cp, cpIdx) => {
                    const isPassed = passedCheckpointIds.includes(cp.id);
                    return (
                      <button
                        key={cp.id}
                        onClick={() => handleJumpToMarker(cp, cpIdx)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          isPassed
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-slate-900 border-yellow-400/60 text-yellow-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-yellow-400">{cp.timestamp}</span>
                        <span>Checkpoint #{cpIdx + 1}</span>
                        <span>{isPassed ? '✓' : '🔒'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Key Takeaways Callout Box */}
        {topic.note.keyTakeaways && topic.note.keyTakeaways.length > 0 && (
          <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-yellow-50 via-amber-50/50 to-yellow-50 border-2 border-yellow-300 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="text-lg">💡</span>
              <h3 className="font-adorn text-base font-bold">
                Key Conceptual Takeaways
              </h3>
            </div>
            <ul className="space-y-2">
              {topic.note.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-yellow-300 text-yellow-950 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Body Structured Content with KaTeX Math and Multi-Source View */}
        <MathMarkdownRenderer
          content={topic.note.content}
          title={topic.title}
          publishedDate={formatSafeDate(topic.note.updatedAt, { format: 'medium' })}
        />

        {/* Handout / Lecture Notes Download Card */}
        {topic.note.handoutName && (
          <div className="p-5 rounded-3xl bg-yellow-50/80 border-2 border-yellow-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">📄</span>
              <div>
                <span className="block text-sm font-bold text-slate-950">
                  {topic.note.handoutName}
                </span>
                <span className="block text-[11px] text-slate-600 font-mono-code mt-0.5">
                  Official Academic Lecture Notes &amp; Handout
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (
                  topic.note.handoutUrl &&
                  !topic.note.handoutUrl.includes('example.com') &&
                  topic.note.handoutUrl.startsWith('http')
                ) {
                  window.open(topic.note.handoutUrl, '_blank');
                } else {
                  const blob = new Blob([`# ${topic.title}\n\n${topic.note.content}`], {
                    type: 'text/markdown;charset=utf-8',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${(topic.note.handoutName || topic.title).replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="px-4 py-2 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <span>Download Notes</span>
              <span>📥</span>
            </button>
          </div>
        )}

        {/* Practice Questions CTA Banner */}
        <section className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 border-2 border-yellow-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">✏️</span>
              <h4 className="font-adorn text-lg font-bold text-slate-950">
                Reinforce Your Knowledge
              </h4>
            </div>
            <p className="text-xs text-slate-600">
              There are {topic.questions.length} curated practice questions matching this topic.
            </p>
          </div>

          <button
            onClick={() => onOpenQuestions(topic.id)}
            className="yellow-gradient-btn px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 transition-all shrink-0 flex items-center gap-2"
          >
            <span>🎯</span>
            <span>Practice Questions ({topic.questions.length})</span>
          </button>
        </section>

        {/* Bottom Prev / Next Navigation Footer */}
        <footer className="pt-6 border-t border-yellow-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            {prevTopic ? (
              <button
                onClick={() => onNavigateTopic(prevTopic.id)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-yellow-200 hover:border-yellow-400 text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <span>← Previous</span>
                <span className="text-slate-400 hidden sm:inline truncate max-w-[150px]">
                  {prevTopic.title}
                </span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onToggleComplete(topic.id);
                if (nextTopic) onNavigateTopic(nextTopic.id);
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <span>✓ Mark Complete &amp; Next</span>
            </button>

            {nextTopic && (
              <button
                onClick={() => onNavigateTopic(nextTopic.id)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-yellow-200 hover:border-yellow-400 text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <span className="text-slate-400 hidden sm:inline truncate max-w-[150px]">
                  {nextTopic.title}
                </span>
                <span>Next →</span>
              </button>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
};
