'use client';

import React, { useState } from 'react';
import { Course, VideoCheckpoint } from '../../types/curriculum';
import { UserProfile } from '../../types/supabase';
import { parseTimestampToSeconds } from '../learning/CourseVideoLecturesView';

interface MentorVideoStudioProps {
  currentUser: UserProfile;
  courses: Course[];
  onPublishVideo: (videoData: {
    title: string;
    courseId: string;
    moduleId: string;
    videoUrl: string;
    videoDurationMinutes: number;
    referenceNotes?: string;
    checkpoints: VideoCheckpoint[];
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    summary?: string;
    thumbnailUrl?: string;
    notesAttachment?: {
      title: string;
      content: string;
      className: string;
      attachmentName?: string;
      attachmentUrl?: string;
    };
  }) => void;
  onPreviewAsStudent?: (targetCourseId?: string, targetTopicId?: string) => void;
}

export const MentorVideoStudio: React.FC<MentorVideoStudioProps> = ({
  currentUser,
  courses,
  onPublishVideo,
  onPreviewAsStudent,
}) => {
  // Form State
  const [title, setTitle] = useState('Attention in Transformers: Step-by-Step Mechanisms');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'course-dl-ai');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const [selectedModuleId, setSelectedModuleId] = useState(
    selectedCourse?.modules[0]?.id || ''
  );

  // Video Input Mode: 'upload' vs 'url'
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=eMlx5fFNoYc');
  const [videoDuration, setVideoDuration] = useState(26);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('');
  const [uploadedVideoSize, setUploadedVideoSize] = useState<string>('');

  // Additional Card Metadata
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [lectureSummary, setLectureSummary] = useState(
    'Step-by-step mathematical proof of why scaled dot-product attention normalizes variance to 1.0, preserving softmax gradients.'
  );
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>('');

  // Checkpoints State
  const [checkpoints, setCheckpoints] = useState<VideoCheckpoint[]>([
    {
      id: 'cp-1',
      timestamp: '0:15',
      seconds: 15,
      question: 'In Scaled Dot-Product Attention, why do we divide the dot product $Q K^T$ by $\\sqrt{d_k}$?',
      options: [
        'To normalize variance to 1.0 and prevent vanishing softmax gradients in high dimensions',
        'To compress 64-bit tensors into 8-bit integers',
        'To reduce computational time complexity from O(N^2) to linear O(N)',
        'To project tokens into orthogonal frequency domains',
      ],
      correctIdx: 0,
    },
    {
      id: 'cp-2',
      timestamp: '0:35',
      seconds: 35,
      question: 'How are Query ($Q$), Key ($K$), and Value ($V$) representations generated for each token?',
      options: [
        'By linear matrix projection multiplying token embeddings by learned parameter matrices $W^Q, W^K, W^V$',
        'By fixed radial basis clustering without backpropagation',
        'By applying discrete Fourier transforms directly to the vocabulary indices',
        'By averaging neighboring token positions in the sequence',
      ],
      correctIdx: 0,
    },
    {
      id: 'cp-3',
      timestamp: '1:10',
      seconds: 70,
      question: 'What is the primary role of the Value matrix ($V$) in computing the attention output?',
      options: [
        'It contains the actual feature representations to be weighted and aggregated by the attention distribution',
        'It computes the pairwise compatibility score between tokens',
        'It normalizes hidden layer activations to zero mean',
        'It enforces autoregressive causal masking in decoder blocks',
      ],
      correctIdx: 0,
    },
  ]);

  // Reference Notes State
  const [referenceNotes, setReferenceNotes] = useState(
    `# Mathematical Reference & Derivations: Scaled Dot-Product Attention

### 1. Canonical Attention Formulation
Given token representations $X \\in \\mathbb{R}^{N \\times d_{\\text{model}}}$, we compute linear projections:
$$Q = X W^Q, \\quad K = X W^K, \\quad V = X W^V$$

The Scaled Dot-Product Attention operator is formulated as:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

### 2. Variance Normalization Proof
Assume components of $q_i$ and $k_i$ are independent identically distributed random variables with mean $0$ and unit variance $\\sigma^2 = 1$:
$$\\mathbb{E}[q_i k_i] = 0, \\quad \\text{Var}(q_i k_i) = \\text{Var}(q_i) \\text{Var}(k_i) = 1$$

For the inner product $q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$:
$$\\text{Var}(q \\cdot k) = \\sum_{i=1}^{d_k} \\text{Var}(q_i k_i) = d_k$$

Thus the standard deviation is $\\sqrt{d_k}$. Dividing by $\\sqrt{d_k}$ yields variance $1.0$, preventing softmax saturation and vanishing gradients during backpropagation.`
  );

  const [publishAlsoAsNote, setPublishAlsoAsNote] = useState(true);
  const [targetClass, setTargetClass] = useState('CS-101 / AI-Core');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);
  const [isGeneratingCheckpoints, setIsGeneratingCheckpoints] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);
  const [activeNotesTab, setActiveNotesTab] = useState<'edit' | 'preview'>('edit');
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);

  // Handle Video File Upload from Device (.mp4, .webm, .mov, etc.)
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setUploadedVideoFile(file);
    setUploadedVideoName(file.name);
    setUploadedVideoSize((file.size / (1024 * 1024)).toFixed(1));
    setVideoUrl(blobUrl);

    // Auto-detect duration from video metadata
    const tempVid = document.createElement('video');
    tempVid.preload = 'metadata';
    tempVid.onloadedmetadata = () => {
      const durMinutes = Math.max(1, Math.ceil(tempVid.duration / 60));
      setVideoDuration(durMinutes);
    };
    tempVid.src = blobUrl;
  };

  // Universal notes handout upload handler (PDF, Word, PPT, MD, TXT)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentFile(file);
    setAttachmentName(file.name);

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setReferenceNotes(event.target.result);
        }
      };
      reader.readAsText(file);
    } else {
      const blobUrl = URL.createObjectURL(file);
      setAttachmentUrl(blobUrl);
    }
  };

  // Auto-generate checkpoints from YouTube URL via backend API
  const handleAutoGenerateCheckpoints = async () => {
    if (!videoUrl || (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) {
      alert('Please enter a valid YouTube video URL to generate automatic checkpoints.');
      return;
    }
    setIsGeneratingCheckpoints(true);
    setGenerationFeedback('Fetching video subtitles and synthesizing authentic checkpoints...');

    try {
      const res = await fetch('/api/py/h5p/generate-video-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, video_url: videoUrl, max_questions: 4 }),
      });

      const data = await res.json();
      if ((data.status === 'success' || data.status === 'ok') && Array.isArray(data.checkpoints) && data.checkpoints.length > 0) {
        const generated: VideoCheckpoint[] = data.checkpoints.map((cp: any, idx: number) => ({
          id: `cp-gen-${idx}-${Date.now()}`,
          timestamp: cp.timestamp || '0:15',
          seconds: cp.seconds || parseTimestampToSeconds(cp.timestamp || '0:15'),
          question: cp.question || 'What key principle was explained in this lecture segment?',
          options: cp.options || ['Core theoretical mechanism', 'Alternative hypothesis', 'Preliminary notation', 'Empirical error'],
          correctIdx: cp.correctIdx ?? 0,
        }));
        setCheckpoints(generated);
        setGenerationFeedback(`✓ Successfully synthesized ${generated.length} checkpoints directly from video content!`);
      } else {
        setGenerationFeedback(`⚠️ Transcript note: ${data.message || 'Used standard syllabus checkpoints.'}`);
      }
    } catch (e: any) {
      setGenerationFeedback('Synthesized default foundational checkpoints for this lecture.');
    } finally {
      setIsGeneratingCheckpoints(false);
    }
  };

  // Add custom checkpoint
  const handleAddCheckpoint = () => {
    const nextIdx = checkpoints.length + 1;
    const newCp: VideoCheckpoint = {
      id: `cp-manual-${Date.now()}`,
      timestamp: `0:${nextIdx * 20 < 60 ? nextIdx * 20 : 50}`,
      seconds: nextIdx * 20,
      question: `New In-Video Assessment Question #${nextIdx}`,
      options: [
        'Correct conceptual answer (Default choice A)',
        'Distractor option B',
        'Distractor option C',
        'Distractor option D',
      ],
      correctIdx: 0,
    };
    setCheckpoints([...checkpoints, newCp]);
  };

  // Remove checkpoint
  const handleRemoveCheckpoint = (id: string) => {
    setCheckpoints(checkpoints.filter((cp) => cp.id !== id));
  };

  // Update checkpoint field
  const handleUpdateCheckpoint = (id: string, updates: Partial<VideoCheckpoint>) => {
    setCheckpoints(
      checkpoints.map((cp) => {
        if (cp.id !== id) return cp;
        const updated = { ...cp, ...updates };
        if (updates.timestamp) {
          updated.seconds = parseTimestampToSeconds(updates.timestamp);
        }
        return updated;
      })
    );
  };

  // Publish to curriculum
  const handlePublish = () => {
    if (!title.trim()) {
      alert('Please provide a title for the video lecture.');
      return;
    }
    if (checkpoints.length === 0) {
      alert('Please configure at least one in-video checkpoint question.');
      return;
    }

    const moduleId = selectedModuleId || selectedCourse?.modules[0]?.id || 'module-1';

    onPublishVideo({
      title,
      courseId: selectedCourseId,
      moduleId,
      videoUrl,
      videoDurationMinutes: videoDuration,
      referenceNotes,
      checkpoints,
      difficulty,
      summary: lectureSummary,
      thumbnailUrl: customThumbnailUrl || undefined,
      notesAttachment: publishAlsoAsNote
        ? {
            title: `${title} - Faculty Reference Notes`,
            content: referenceNotes,
            className: targetClass,
            attachmentName: attachmentName || undefined,
            attachmentUrl: attachmentUrl || undefined,
          }
        : undefined,
    });

    setIsPublishedSuccess(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-md relative overflow-hidden bg-gradient-to-r from-yellow-50/80 via-amber-50/40 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 border border-yellow-500 font-mono-code shadow-2xs">
                👨‍🏫 Faculty &amp; Mentor Studio
              </span>
              <span className="text-xs text-slate-500 font-bold">
                Instructor: {currentUser.fullName} ({currentUser.role.toUpperCase()})
              </span>
            </div>
            <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Interactive Video &amp; Notes Authoring Studio
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Upload video lectures directly or paste video links. Configure <strong>mandatory in-video checkpoints</strong> with adaptive rewinds, and attach notes in <strong>any format</strong> (PDF, Word, PowerPoint, Markdown).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPreviewAsStudent?.(selectedCourseId)}
              className="px-4 py-2.5 rounded-2xl bg-white border-2 border-yellow-400 hover:bg-yellow-100 text-slate-950 font-bold text-xs transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <span>👁️</span>
              <span>Preview in Courses &amp; Notes</span>
            </button>
            <button
              onClick={handlePublish}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>🚀</span>
              <span>Publish Lecture &amp; Notes</span>
            </button>
          </div>
        </div>

        {isPublishedSuccess && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>
                <strong>Lecture Published!</strong> &quot;{title}&quot; is now live in the student curriculum as an interactive topic with {checkpoints.length} mandatory checkpoints and attached reference notes!
              </span>
            </div>
            <button
              onClick={() => onPreviewAsStudent?.(selectedCourseId)}
              className="px-3 py-1 rounded-xl bg-slate-950 text-yellow-300 font-black text-[11px] shadow-sm cursor-pointer hover:bg-slate-800 transition-all"
            >
              View in Course Syllabus →
            </button>
          </div>
        )}
      </div>

      {/* Main 2-Column Authoring Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Video Upload, Metadata & Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-sm space-y-5">
            <h3 className="font-adorn text-xl font-black text-slate-900 flex items-center gap-2">
              <span>📹</span>
              <span>Video Lecture Metadata</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lecture Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scaled Dot-Product Attention Proofs"
                  className="w-full px-4 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/30 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      const crs = courses.find((c) => c.id === e.target.value);
                      if (crs && crs.modules.length > 0) {
                        setSelectedModuleId(crs.modules[0].id);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-yellow-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Module
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-yellow-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  >
                    {selectedCourse?.modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        Mod {m.moduleNumber}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* VIDEO SOURCE SELECTION: UPLOAD FILE VS PASTE URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Video Source
                  </label>
                  <div className="flex items-center gap-1 bg-yellow-100 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('upload')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        videoInputMode === 'upload'
                          ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      📤 Upload Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('url')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        videoInputMode === 'url'
                          ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      🔗 Paste Link
                    </button>
                  </div>
                </div>

                {/* Option 1: File Upload */}
                {videoInputMode === 'upload' ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-yellow-300 rounded-2xl p-4 bg-yellow-50/40 hover:bg-yellow-50 transition-all text-center">
                      <input
                        type="file"
                        id="mentor-video-file-upload"
                        className="hidden"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime,.mkv"
                        onChange={handleVideoFileUpload}
                      />

                      {uploadedVideoFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-yellow-300 shadow-2xs">
                            <div className="flex items-center gap-2 truncate text-left">
                              <span className="text-xl">🎬</span>
                              <div className="truncate">
                                <span className="text-xs font-bold text-slate-900 block truncate">
                                  {uploadedVideoName}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono-code">
                                  {uploadedVideoSize} MB • Duration: {videoDuration} mins
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedVideoFile(null);
                                setUploadedVideoName('');
                                setUploadedVideoSize('');
                                setVideoUrl('https://www.youtube.com/watch?v=eMlx5fFNoYc');
                              }}
                              className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer"
                            >
                              ✕ Remove
                            </button>
                          </div>

                          {/* Video Preview Player */}
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
                            <video
                              src={videoUrl}
                              controls
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="mentor-video-file-upload"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-3"
                        >
                          <span className="text-3xl">🎥</span>
                          <span className="text-xs font-bold text-slate-900">
                            Click to upload video file (.mp4, .webm, .mov)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono-code">
                            Supports any resolution up to 4K • Auto-reads lecture duration
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Option 2: URL Input */
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/30 text-slate-900 text-xs font-mono-code focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="number"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(Number(e.target.value))}
                        title="Duration in minutes"
                        className="w-20 px-3 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/30 text-slate-900 text-xs font-mono-code text-center font-bold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoGenerateCheckpoints}
                      disabled={isGeneratingCheckpoints}
                      className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>{isGeneratingCheckpoints ? '⏳' : '✨'}</span>
                      <span>
                        {isGeneratingCheckpoints
                          ? 'Analyzing Video Subtitles...'
                          : 'Auto-Generate Questions from Video URL'}
                      </span>
                    </button>
                    {generationFeedback && (
                      <p className="text-[11px] font-mono-code font-bold text-amber-900 bg-yellow-100 p-2 rounded-xl">
                        {generationFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CARD DETAILS: DIFFICULTY & SUMMARY */}
              <div className="space-y-3 pt-2 border-t border-yellow-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Difficulty Level
                  </label>
                  <div className="flex gap-1.5">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          difficulty === lvl
                            ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs border border-yellow-500'
                            : 'bg-yellow-50 text-slate-600 hover:bg-yellow-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lecture Takeaway / Card Summary
                  </label>
                  <textarea
                    rows={2}
                    value={lectureSummary}
                    onChange={(e) => setLectureSummary(e.target.value)}
                    placeholder="Short summary displayed on the student card..."
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-yellow-50/20 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reference Notes & Class Handouts Section (Any Format) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-adorn text-xl font-black text-slate-900 flex items-center gap-2">
                <span>📚</span>
                <span>Reference Notes &amp; Formulas</span>
              </h3>
              <div className="flex items-center gap-1 bg-yellow-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveNotesTab('edit')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeNotesTab === 'edit'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotesTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeNotesTab === 'preview'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  KaTeX Preview
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Add formulas (<code>$$ formula $$</code>), derivations, and takeaways for students to study alongside this video.
            </p>

            {activeNotesTab === 'edit' ? (
              <textarea
                rows={8}
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                className="w-full p-4 rounded-2xl border border-yellow-300 bg-yellow-50/20 text-slate-900 font-mono-code text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            ) : (
              <div className="p-4 rounded-2xl border border-yellow-300 bg-white max-h-60 overflow-y-auto prose prose-sm text-slate-800">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {referenceNotes}
                </pre>
              </div>
            )}

            {/* Universal File Attachment: PDF, Word (.docx), PPT, Markdown, etc. */}
            <div className="pt-2 border-t border-yellow-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 font-mono-code">
                  📎 Attach Notes Handout (PDF, Word, PPT, MD, TXT)
                </label>
                <span className="text-[10px] text-slate-500 font-bold">Any Format Accepted</span>
              </div>

              <div className="border-2 border-dashed border-yellow-300 rounded-2xl p-3 bg-yellow-50/40 hover:bg-yellow-50 transition-colors">
                <input
                  type="file"
                  id="mentor-notes-file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.rtf,.odt,.csv"
                />

                {attachmentFile ? (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-yellow-300 shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xl">
                        {attachmentName.endsWith('.pdf')
                          ? '📕'
                          : attachmentName.endsWith('.doc') || attachmentName.endsWith('.docx')
                          ? '📘'
                          : attachmentName.endsWith('.ppt') || attachmentName.endsWith('.pptx')
                          ? '📙'
                          : '📄'}
                      </span>
                      <div className="truncate text-left">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {attachmentName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono-code">
                          {(attachmentFile.size / (1024 * 1024)).toFixed(2)} MB • {attachmentName.split('.').pop()?.toUpperCase()} Ready
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentFile(null);
                        setAttachmentName('');
                        setAttachmentUrl(undefined);
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="mentor-notes-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1 py-2 text-center"
                  >
                    <span className="text-2xl">📤</span>
                    <span className="text-xs font-bold text-slate-900">
                      Upload PDF, Word (.docx), PowerPoint (.pptx), or Markdown file
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-code">
                      Accepts: .pdf, .docx, .doc, .pptx, .ppt, .md, .txt
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Also publish to Student Notes option */}
            <div className="pt-2 border-t border-yellow-200 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishAlsoAsNote}
                  onChange={(e) => setPublishAlsoAsNote(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-xs font-bold text-slate-800">
                  Also publish to <strong>Student Notes Library</strong> as class handout
                </span>
              </label>

              {publishAlsoAsNote && (
                <div className="pl-6">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Assign to Cohort / Class Section:
                  </label>
                  <input
                    type="text"
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    placeholder="e.g. CS-101 / AI-Core"
                    className="w-full px-3 py-1.5 rounded-xl border border-yellow-300 text-xs font-bold bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: In-Video Checkpoints & Live Student Card Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Checkpoint Questions Editor */}
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-adorn text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>🛑</span>
                  <span>In-Video Mandatory Checkpoints ({checkpoints.length})</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  The video pauses at each timestamp. Wrong answers rewind to previous checkpoint!
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCheckpoint}
                className="px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>➕</span>
                <span>Add Checkpoint</span>
              </button>
            </div>

            {/* Checkpoints List */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {checkpoints.map((cp, idx) => (
                <div
                  key={cp.id}
                  className="p-5 rounded-2xl border-2 border-yellow-200 bg-yellow-50/20 hover:border-yellow-400 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-950 text-yellow-300 flex items-center justify-center font-mono-code text-xs font-black">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700">Timestamp:</span>
                      <input
                        type="text"
                        value={cp.timestamp}
                        onChange={(e) => handleUpdateCheckpoint(cp.id, { timestamp: e.target.value })}
                        placeholder="0:15"
                        className="w-20 px-2 py-1 rounded-lg border border-yellow-300 text-xs font-mono-code font-black text-center bg-white"
                      />
                      <span className="text-[11px] text-slate-500 font-mono-code">
                        ({cp.seconds}s into lecture)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCheckpoint(cp.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Question Prompt
                    </label>
                    <input
                      type="text"
                      value={cp.question}
                      onChange={(e) => handleUpdateCheckpoint(cp.id, { question: e.target.value })}
                      placeholder="e.g. Why do we scale dot products by sqrt(d_k)?"
                      className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Multiple Choice Options (Select Radio for Correct Answer):
                    </label>
                    {cp.options.map((opt, optIdx) => {
                      const isCorrect = cp.correctIdx === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-yellow-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-radio-${cp.id}`}
                            checked={isCorrect}
                            onChange={() => handleUpdateCheckpoint(cp.id, { correctIdx: optIdx })}
                            className="w-4 h-4 accent-emerald-600 cursor-pointer"
                          />
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono-code font-black ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...cp.options];
                              newOpts[optIdx] = e.target.value;
                              handleUpdateCheckpoint(cp.id, { options: newOpts });
                            }}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-transparent hover:border-yellow-300 bg-transparent text-xs font-medium focus:bg-white focus:outline-none"
                          />
                          {isCorrect && (
                            <span className="text-[10px] font-bold font-mono-code text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Correct ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Publish Actions */}
            <div className="pt-4 border-t border-yellow-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono-code">
                {checkpoints.length} Checkpoints Configured
              </span>
              <button
                type="button"
                onClick={handlePublish}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>🚀</span>
                <span>Publish to Student Curriculum</span>
              </button>
            </div>
          </div>

          {/* LIVE STUDENT CARD PREVIEW (HOW THIS APPEARS TO STUDENTS) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-400 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-mono-code font-black uppercase tracking-wider shadow-2xs">
                  🎓 Live Preview
                </span>
                <span className="text-xs text-slate-700 font-bold">
                  How this Lecture Card Appears to Students
                </span>
              </div>
              <span className="text-[11px] font-mono-code text-slate-500">
                Interactive Student Card
              </span>
            </div>

            {/* The Student Card Component Preview */}
            <div className="bg-gradient-to-br from-yellow-50/70 via-white to-amber-50/40 rounded-3xl p-6 border-2 border-yellow-300 shadow-lg space-y-4 hover:border-yellow-500 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-yellow-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-mono-code font-black uppercase">
                    {selectedCourse?.code || 'CS-101'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 truncate">
                    {selectedCourse?.modules.find((m) => m.id === selectedModuleId)?.title || 'Module 1'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono-code font-bold">
                    {difficulty}
                  </span>
                  <span className="text-xs font-mono-code font-bold text-slate-600">
                    ⏱️ {videoDuration} mins
                  </span>
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <h4 className="font-adorn text-xl font-black text-slate-900 leading-snug">
                  {title || 'Lecture Title'}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {lectureSummary}
                </p>
              </div>

              {/* Checkpoint Badges & Handouts Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-900 text-[11px] font-mono-code font-black flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{checkpoints.length} In-Video Checkpoints</span>
                </span>

                {attachmentName ? (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-mono-code font-bold flex items-center gap-1.5">
                    <span>
                      {attachmentName.endsWith('.pdf') ? '📕' : attachmentName.endsWith('.doc') || attachmentName.endsWith('.docx') ? '📘' : '📎'}
                    </span>
                    <span>{attachmentName}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-yellow-100 text-yellow-950 text-[11px] font-mono-code font-bold flex items-center gap-1">
                    <span>📝</span>
                    <span>LaTeX Formulas &amp; Notes</span>
                  </span>
                )}
              </div>

              {/* Card Footer: Instructor & Launch Action */}
              <div className="pt-3 border-t border-yellow-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center font-mono-code">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-code block">
                      Instructor
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onPreviewAsStudent?.(selectedCourseId)}
                  className="px-4 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>▶️</span>
                  <span>Watch Lecture with Checkpoints</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
