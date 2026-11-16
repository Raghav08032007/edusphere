'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Course, CourseTopic, VideoCheckpoint } from '../../types/curriculum';
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

// Helper to format seconds to M:SS
export const formatSecondsToTimestamp = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

interface CourseVideoLecturesViewProps {
  courses: Course[];
  onOpenTopicNotes: (courseId: string, topicId: string) => void;
  onAskCooper: (prompt: string) => void;
}

export const CourseVideoLecturesView: React.FC<CourseVideoLecturesViewProps> = ({
  courses,
  onOpenTopicNotes,
  onAskCooper,
}) => {
  // Collect all topics with video lectures
  const allVideoTopics = React.useMemo(() => {
    const list: { course: Course; topic: CourseTopic; moduleTitle: string }[] = [];
    courses.forEach((c) => {
      c.modules.forEach((m) => {
        m.topics.forEach((t) => {
          if (t.videoUrl) {
            list.push({ course: c, topic: t, moduleTitle: m.title });
          }
        });
      });
    });
    return list;
  }, [courses]);

  const [selectedVideoItem, setSelectedVideoItem] = useState<{
    course: Course;
    topic: CourseTopic;
    moduleTitle: string;
  } | null>(allVideoTopics[0] || null);

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [transcriptSearch, setTranscriptSearch] = useState<string>('');
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'theater' | 'cards'>('theater');

  // Checkpoint & Mandatory Gate States
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState<number | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [gateFeedback, setGateFeedback] = useState<string | null>(null);
  const [passedCheckpointIds, setPassedCheckpointIds] = useState<string[]>([]);
  const [rewindToast, setRewindToast] = useState<string | null>(null);
  const [notesActiveTab, setNotesActiveTab] = useState<
    'formatted' | 'breakdown' | 'latex' | 'papers'
  >('formatted');

  // Player references
  const ytPlayerRef = useRef<any>(null);
  const directVideoRef = useRef<HTMLVideoElement | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const topic = selectedVideoItem?.topic;
  const course = selectedVideoItem?.course;

  // Extract YouTube ID or direct URL
  const videoSource = React.useMemo(() => {
    if (!topic?.videoUrl) return { isYouTube: false, isDirect: false, embedUrl: '', videoId: '' };
    const raw = topic.videoUrl.trim();

    // YouTube regex
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

    if (raw.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
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
    // Default fallback checkpoints for 3Blue1Brown Attention or other STEM videos
    return [
      {
        id: 'cp-def-1',
        timestamp: '0:15',
        seconds: 15,
        question: 'In Scaled Dot-Product Attention, what is the mathematical purpose of dividing $Q K^T$ by $\\sqrt{d_k}$?',
        options: [
          'To normalize variance to 1.0 and prevent vanishing softmax gradients in high dimensions',
          'To reduce sequence token length from N down to 1',
          'To compress 64-bit tensors to 8-bit integers',
          'To discard negative eigenvalues in the covariance matrix',
        ],
        correctIdx: 0,
      },
      {
        id: 'cp-def-2',
        timestamp: '0:35',
        seconds: 35,
        question: 'How are the Query ($Q$), Key ($K$), and Value ($V$) representations generated from an input token matrix $X$?',
        options: [
          'By linear projections with learned parameter weight matrices $W^Q, W^K, W^V$',
          'By non-linear clustering using fixed Gaussian Radial Basis kernels',
          'By applying non-trainable Fourier transform filters to raw text strings',
          'By averaging adjacent words in the vocabulary lookup table',
        ],
        correctIdx: 0,
      },
      {
        id: 'cp-def-3',
        timestamp: '1:10',
        seconds: 70,
        question: 'What is the primary role of the Value matrix ($V$) in computing self-attention outputs?',
        options: [
          'It contains the actual information/representations to be weighted and aggregated by the attention coefficients',
          'It computes the pairwise compatibility score between query and key tokens',
          'It acts as the positional encoding layer to order sequential tokens',
          'It normalizes the hidden layer activations to zero mean and unit variance',
        ],
        correctIdx: 0,
      },
    ];
  }, [topic]);

  // Initialize YouTube Player API
  useEffect(() => {
    if (!videoSource.isYouTube) return;

    const setupPlayer = () => {
      if (typeof window !== 'undefined' && (window as any).YT && (window as any).YT.Player) {
        try {
          const iframeEl = document.getElementById('academic-course-player');
          if (iframeEl) {
            ytPlayerRef.current = new (window as any).YT.Player('academic-course-player', {
              events: {
                onReady: () => {
                  console.log('YouTube Course Player initialized');
                },
              },
            });
          }
        } catch (e) {
          console.warn('YT Player init:', e);
        }
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = setupPlayer;
    } else {
      setupPlayer();
    }
  }, [videoSource]);

  // Polling loop to inspect video playback time for checkpoints
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

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
      }, 1100);
    } else {
      // Incorrect -> Adaptive Rewind
      const prevCp = activeCheckpointIndex > 0 ? checkpoints[activeCheckpointIndex - 1] : null;
      const rewindSecs = prevCp ? prevCp.seconds || parseTimestampToSeconds(prevCp.timestamp) : 0;
      const rewindTimeLabel = prevCp ? prevCp.timestamp : '0:00';

      setGateFeedback(`❌ Incorrect. Rewinding back to ${rewindTimeLabel} so you can review the lecture segment thoroughly before retrying.`);

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
        setRewindToast(`🔄 Rewound to ${rewindTimeLabel}: Please review the lecture carefully to master this checkpoint!`);
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

  // Render LaTeX math string with KaTeX
  const renderMathContent = (text: string) => {
    try {
      // Replace inline math $...$
      const inlineReplaced = text.replace(/\$([^\$]+)\$/g, (_, math) => {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      });
      return inlineReplaced;
    } catch (e) {
      return text;
    }
  };

  // Reference notes content (from topic or default high-yield notes)
  const referenceNotesMarkdown =
    topic?.referenceNotes ||
    `# Mathematical Reference & Derivations: Scaled Dot-Product Attention

### 1. Canonical Attention Formulation
Given token representations $X \\in \\mathbb{R}^{N \\times d_{\\text{model}}}$, we compute linear projections with learned parameter weight matrices $W^Q, W^K, W^V$:
$$Q = X W^Q, \\quad K = X W^K, \\quad V = X W^V$$

The Scaled Dot-Product Attention operator is formulated as:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

### 2. Variance Normalization Proof
Assume components of $q_i$ and $k_i$ are independent identically distributed random variables with mean $0$ and unit variance $\\sigma^2 = 1$:
$$\\mathbb{E}[q_i k_i] = 0, \\quad \\text{Var}(q_i k_i) = \\text{Var}(q_i) \\text{Var}(k_i) = 1$$

For the inner product $q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$:
$$\\text{Var}(q \\cdot k) = \\sum_{i=1}^{d_k} \\text{Var}(q_i k_i) = d_k$$

Thus the standard deviation is $\\sqrt{d_k}$. Dividing by $\\sqrt{d_k}$ yields variance $1.0$, preventing softmax saturation and vanishing gradients during backpropagation.`;

  // Download reference notes as text/markdown
  const handleDownloadNotes = () => {
    const blob = new Blob([referenceNotesMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${topic?.title.replace(/[^a-zA-Z0-9]/g, '_')}_Reference_Notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!selectedVideoItem || !topic || !course) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-yellow-200">
        <p className="text-slate-600 font-bold">No video lectures available currently.</p>
      </div>
    );
  }

  const filteredTranscript = (topic.videoTranscript || []).filter((line) =>
    line.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Rewind Toast Notification Banner */}
      {rewindToast && (
        <div className="p-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs border-2 border-yellow-200 shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{rewindToast}</span>
          </div>
          <button
            onClick={() => setRewindToast(null)}
            className="px-2 py-0.5 rounded bg-slate-950 text-white font-mono-code text-[10px]"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-md relative overflow-hidden bg-gradient-to-r from-yellow-50/80 via-amber-50/40 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 border border-yellow-500 font-mono-code shadow-2xs">
                🎬 Academic Video Studio
              </span>
              <span className="text-xs text-slate-500 font-bold">
                Instructor: {course.instructorName || 'Dr. K. Rajan'} · Mandatory Gate &amp; Checkpoints
              </span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Interactive Course Video Lectures
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Watch university lectures with <strong>mandatory in-video checkpoints</strong>. The video auto-pauses at exact timestamps and rewinds you if an answer is incorrect to guarantee concept mastery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle: Theater vs Cards Grid */}
            <div className="flex items-center gap-1 bg-yellow-100 p-1 rounded-2xl border border-yellow-300">
              <button
                type="button"
                onClick={() => setViewMode('theater')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'theater'
                    ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>🎭</span>
                <span>Theater Player</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>🎴</span>
                <span>Browse Cards ({allVideoTopics.length})</span>
              </button>
            </div>

            <button
              onClick={() => onOpenTopicNotes(course.id, topic.id)}
              className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>📖</span>
              <span>Open Syllabus Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: ALL LECTURE CARDS GRID */}
      {viewMode === 'cards' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-yellow-200 pb-3">
            <div>
              <h2 className="font-adorn text-2xl font-black text-slate-900">
                Course Video Lecture Cards ({allVideoTopics.length})
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Each card features interactive pause checkpoints, derivations, and downloadable notes.
              </p>
            </div>
            <button
              onClick={() => setViewMode('theater')}
              className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-all shadow-2xs cursor-pointer"
            >
              Resume Player 🎭 →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allVideoTopics.map((item, idx) => {
              const isSelected = item.topic.id === topic.id;
              const cpCount = item.topic.videoCheckpoints?.length || 3;
              const handoutName = item.topic.note?.handoutName;
              const handoutUrl = item.topic.note?.handoutUrl;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl p-6 border-2 transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1 shadow-sm hover:shadow-xl ${
                    isSelected ? 'border-yellow-400 bg-yellow-50/20' : 'border-yellow-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-mono-code">
                        {item.course.code}
                      </span>
                      <span className="text-xs font-mono-code font-bold text-slate-500">
                        ⏱️ {item.topic.videoDurationMinutes || 20}m
                      </span>
                    </div>

                    <h3 className="font-adorn text-lg font-black text-slate-900 line-clamp-2 leading-snug">
                      {item.topic.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.topic.note?.keyTakeaways?.[0] ||
                        'Interactive video lecture with mandatory concept checkpoint assessment.'}
                    </p>

                    {/* In-video checkpoints & handouts badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-950 text-[10px] font-mono-code font-bold flex items-center gap-1">
                        <span>⚡</span>
                        <span>{cpCount} Checkpoints</span>
                      </span>

                      {handoutName ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-mono-code font-bold flex items-center gap-1">
                          <span>
                            {handoutName.endsWith('.pdf')
                              ? '📕'
                              : handoutName.endsWith('.doc') || handoutName.endsWith('.docx')
                              ? '📘'
                              : '📎'}
                          </span>
                          <span className="truncate max-w-[120px]">{handoutName}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-yellow-50 text-slate-600 text-[10px] font-mono-code">
                          📝 KaTeX Formulas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-yellow-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedVideoItem(item);
                        setViewMode('theater');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>▶️</span>
                      <span>Watch Interactive Lecture</span>
                    </button>

                    {handoutUrl && (
                      <a
                        href={handoutUrl}
                        download={handoutName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-950 text-xs font-bold transition-all shadow-2xs"
                        title="Download attached notes"
                      >
                        📥
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: THEATER PLAYER LAYOUT */}
      {viewMode === 'theater' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Player, Mandatory Gate, Timeline & Reference Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-slate-950 p-4 sm:p-6 border-2 border-yellow-400 shadow-2xl relative overflow-hidden group">
            {/* Player Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              {videoSource.isDirect ? (
                <video
                  ref={directVideoRef}
                  src={videoSource.embedUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  id="academic-course-player"
                  src={videoSource.embedUrl}
                  title={topic.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}

              {/* MANDATORY CHECKPOINT OVERLAY GATE */}
              {activeCheckpointIndex !== null && checkpoints[activeCheckpointIndex] && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-40">
                  <div className="max-w-lg w-full space-y-4 bg-slate-900 p-6 rounded-3xl border-2 border-yellow-400 shadow-2xl">
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-mono-code font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                        <span>🛑</span>
                        <span>
                          Mandatory Checkpoint Gate @ {checkpoints[activeCheckpointIndex].timestamp}
                        </span>
                      </span>
                    </div>

                    <p className="text-[11px] text-amber-200/90 font-medium leading-relaxed">
                      The video is paused. You <strong>must answer correctly</strong> to proceed. If answered incorrectly, you will be automatically rewound to{' '}
                      <strong>
                        {activeCheckpointIndex > 0
                          ? checkpoints[activeCheckpointIndex - 1].timestamp
                          : '0:00'}
                      </strong>{' '}
                      to watch the lecture segment fully.
                    </p>

                    <h4
                      className="font-adorn font-bold text-base sm:text-lg text-white leading-snug"
                      dangerouslySetInnerHTML={{
                        __html: renderMathContent(checkpoints[activeCheckpointIndex].question),
                      }}
                    />

                    <div className="space-y-2 text-left">
                      {checkpoints[activeCheckpointIndex].options.map((opt, optIdx) => {
                        const isSelected = selectedOptionIdx === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setSelectedOptionIdx(optIdx)}
                            className={`w-full p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'bg-yellow-400 text-slate-950 border-yellow-500 font-black shadow-md'
                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono-code font-black ${
                                isSelected
                                  ? 'bg-slate-950 text-yellow-300'
                                  : 'bg-white/20 text-white'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: renderMathContent(opt),
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleCheckpointSubmit}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>🔒</span>
                        <span>Submit Mandatory Answer</span>
                      </button>
                    </div>

                    {gateFeedback && (
                      <p
                        className={`text-xs font-bold font-mono-code p-2.5 rounded-xl animate-fadeIn ${
                          gateFeedback.startsWith('✓')
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500'
                            : 'bg-red-950/80 text-red-300 border border-red-500'
                        }`}
                      >
                        {gateFeedback}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Checkpoint Markers Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono-code font-bold text-yellow-300">
                  Interactive Checkpoints:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {checkpoints.map((cp, idx) => {
                    const isPassed = passedCheckpointIds.includes(cp.id);
                    const isCurrent = activeCheckpointIndex === idx;
                    return (
                      <button
                        key={cp.id}
                        onClick={() => handleJumpToMarker(cp, idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono-code font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                          isPassed
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : isCurrent
                            ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black animate-pulse'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{isPassed ? '✓' : '⚡'}</span>
                        <span>@ {cp.timestamp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono-code px-1.5 font-bold">
                  Speed:
                </span>
                {[1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setPlaybackSpeed(spd);
                      if (directVideoRef.current) directVideoRef.current.playbackRate = spd;
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono-code font-bold transition-all ${
                      playbackSpeed === spd
                        ? 'bg-yellow-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEM FORMULA STUDIO & MENTOR REFERENCE NOTES (MATCHING IMAGE 2) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-sm space-y-5">
            {/* Header Pill & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-mono-code font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <span>📐</span>
                  <span>STEM FORMULA STUDIO</span>
                </span>
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                  Multi-Source Perspective
                </span>
              </div>

              {/* 4 Multi-Source Perspective Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-yellow-50 p-1 rounded-2xl border border-yellow-200">
                <button
                  onClick={() => setNotesActiveTab('formatted')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    notesActiveTab === 'formatted'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs font-black'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <span>✨</span> Formatted (KaTeX)
                </button>
                <button
                  onClick={() => setNotesActiveTab('breakdown')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    notesActiveTab === 'breakdown'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs font-black'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <span>💡</span> Plain English Breakdown
                </button>
                <button
                  onClick={() => setNotesActiveTab('latex')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    notesActiveTab === 'latex'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs font-black'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <span>📄</span> LaTeX Source
                </button>
                <button
                  onClick={() => setNotesActiveTab('papers')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    notesActiveTab === 'papers'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs font-black'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <span>🔗</span> Verified Papers &amp; Links
                </button>
              </div>
            </div>

            {/* Note Author & Title Banner */}
            <div>
              <h2 className="font-adorn text-2xl font-black text-slate-900 leading-snug">
                {topic.title} &amp; Derivations
              </h2>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mt-1">
                <span>
                  Published by {course.instructorName || 'Dr. K. Rajan'} · Academic Faculty
                </span>
                <button
                  onClick={handleDownloadNotes}
                  className="px-3 py-1 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📥</span> Download Notes (.md)
                </button>
              </div>

              {topic.note?.handoutName && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {topic.note.handoutName.endsWith('.pdf')
                        ? '📕'
                        : topic.note.handoutName.endsWith('.doc') || topic.note.handoutName.endsWith('.docx')
                        ? '📘'
                        : '📎'}
                    </span>
                    <div>
                      <span className="text-slate-900 block font-black">{topic.note.handoutName}</span>
                      <span className="text-[10px] text-slate-500 font-mono-code">Faculty Attachment Handout</span>
                    </div>
                  </div>
                  {topic.note.handoutUrl && (
                    <a
                      href={topic.note.handoutUrl}
                      download={topic.note.handoutName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300 font-black text-xs transition-all shadow-2xs"
                    >
                      Download Document 📥
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Tab 1: Formatted (KaTeX) */}
            {notesActiveTab === 'formatted' && (
              <div className="space-y-4 pt-2">
                <div
                  className="p-5 rounded-2xl bg-amber-50/40 border border-yellow-200 text-slate-800 text-sm leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{
                    __html: referenceNotesMarkdown
                      .split('\n\n')
                      .map((para) => {
                        if (para.startsWith('$$') && para.endsWith('$$')) {
                          const math = para.slice(2, -2).trim();
                          try {
                            return `<div class="my-3 p-4 rounded-xl bg-white border border-yellow-300 text-center overflow-x-auto">${katex.renderToString(
                              math,
                              { displayMode: true, throwOnError: false }
                            )}</div>`;
                          } catch (e) {
                            return `<pre class="my-3 p-4 bg-white font-mono-code">${math}</pre>`;
                          }
                        }
                        if (para.startsWith('# ')) {
                          return `<h3 class="font-adorn text-xl font-black text-slate-900 mt-2">${para.replace(
                            '# ',
                            ''
                          )}</h3>`;
                        }
                        if (para.startsWith('### ')) {
                          return `<h4 class="font-adorn text-base font-bold text-amber-900 mt-2">${para.replace(
                            '### ',
                            ''
                          )}</h4>`;
                        }
                        return `<p>${renderMathContent(para)}</p>`;
                      })
                      .join(''),
                  }}
                />
              </div>
            )}

            {/* Tab 2: Plain English Breakdown */}
            {notesActiveTab === 'breakdown' && (
              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700 leading-relaxed bg-yellow-50/30 p-5 rounded-2xl border border-yellow-200">
                <h4 className="font-adorn font-bold text-base text-slate-900">
                  Intuitive Conceptual Breakdown
                </h4>
                <ul className="space-y-2 list-disc pl-5">
                  <li>
                    <strong>Matrix Projections:</strong> Instead of fixed token representations, learned weight matrices allow each word to dynamically route attention based on context.
                  </li>
                  <li>
                    <strong>Softmax Gradient Protection:</strong> Multiplying high-dimensional vectors creates huge variance. The square root denominator prevents extreme exponential values that destroy learning gradients.
                  </li>
                  <li>
                    <strong>Parallel Processing:</strong> Because scaled dot products are matrix multiplications, hundreds of tokens are computed simultaneously on GPUs rather than one by one.
                  </li>
                </ul>
              </div>
            )}

            {/* Tab 3: LaTeX Source */}
            {notesActiveTab === 'latex' && (
              <div className="pt-2">
                <pre className="p-4 rounded-2xl bg-slate-950 text-yellow-300 font-mono-code text-xs leading-relaxed overflow-x-auto">
                  {referenceNotesMarkdown}
                </pre>
              </div>
            )}

            {/* Tab 4: Verified Papers & Links */}
            {notesActiveTab === 'papers' && (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl border border-yellow-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Attention Is All You Need (Vaswani et al., 2017)
                    </span>
                    <span className="text-[10px] font-mono-code bg-yellow-200 text-yellow-950 px-2 py-0.5 rounded font-bold">
                      arXiv:1706.03762
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    The foundational Transformer paper establishing multi-head scaled dot-product attention as the replacement for recurrent neural networks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Course Playlist & Transcript */}
        <div className="space-y-6">
          {/* Lecture Playlist */}
          <div className="bg-white rounded-3xl p-5 border-2 border-yellow-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-100 pb-3">
              <h3 className="font-adorn text-lg font-bold text-slate-900">
                Course Playlist ({allVideoTopics.length})
              </h3>
              <span className="text-[11px] font-bold text-slate-500 font-mono-code">
                {allVideoTopics.length} Lectures
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allVideoTopics.map((item, idx) => {
                const isSelected = item.topic.id === topic.id;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedVideoItem(item);
                      setActiveCheckpointIndex(null);
                      setPassedCheckpointIds([]);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-400 text-yellow-950 border-yellow-500 shadow-xs'
                        : 'bg-yellow-50/50 hover:bg-yellow-100/60 border-yellow-200 text-slate-900'
                    }`}
                  >
                    <span className="text-lg">▶️</span>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] uppercase font-extrabold tracking-wider opacity-75 font-mono-code">
                        {item.course.code} • {item.topic.videoDurationMinutes || 18}m
                      </span>
                      <span className="block text-xs font-bold truncate">
                        {item.topic.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Transcript */}
          <div className="bg-white rounded-3xl p-5 border-2 border-yellow-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-100 pb-3">
              <h3 className="font-adorn text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <span>📝</span> Synchronized Transcript
              </h3>
              <span className="text-[10px] font-bold text-amber-800 bg-yellow-200 px-2 py-0.5 rounded-full font-mono-code">
                Searchable
              </span>
            </div>

            <input
              type="text"
              placeholder="Search transcript keyword..."
              value={transcriptSearch}
              onChange={(e) => setTranscriptSearch(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-yellow-50/50 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
            />

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {filteredTranscript.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-yellow-50/40 hover:bg-yellow-100/60 transition-colors border border-yellow-100 flex items-start gap-2.5 cursor-pointer"
                  onClick={() =>
                    onAskCooper(
                      `Explain what the professor means at timestamp ${t.time} when discussing: "${t.text}"`
                    )
                  }
                >
                  <span className="px-1.5 py-0.5 rounded bg-yellow-300 text-yellow-950 text-[10px] font-mono-code font-bold shrink-0">
                    {t.time}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>

            {/* Cooper Bridge */}
            <button
              onClick={() =>
                onAskCooper(`Give me a conceptual summary of the video lecture: ${topic.title}`)
              }
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🤖</span> Ask Cooper AI About This Video
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
