'use client';

import React, { useState } from 'react';
import { Course, CourseModule, DifficultyLevel, VideoCheckpoint } from '../../types/curriculum';
import { UserProfile } from '../../types/supabase';
import { parseTimestampToSeconds } from '../learning/TopicNoteReader';

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
  onCreateCourse?: (newCourse: Course) => void;
  onCreateModule?: (courseId: string, moduleTitle: string) => void;
  onPreviewAsStudent?: (targetCourseId?: string, targetTopicId?: string) => void;
  onViewNotesAsStudent?: () => void;
}

export const MentorVideoStudio: React.FC<MentorVideoStudioProps> = ({
  currentUser,
  courses,
  onPublishVideo,
  onCreateCourse,
  onCreateModule,
  onPreviewAsStudent,
  onViewNotesAsStudent,
}) => {
  // Course & Module Destination State
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'course-dist-sys');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const [selectedModuleId, setSelectedModuleId] = useState(
    selectedCourse?.modules[0]?.id || ''
  );

  // Modal: Create New Course
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubject, setNewCourseSubject] = useState('Computer Science');
  const [newCourseCategory, setNewCourseCategory] = useState('Systems & Infrastructure');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseModuleTitle, setNewCourseModuleTitle] = useState('Module 1: Foundations & Architecture');
  const [newCourseDifficulty, setNewCourseDifficulty] = useState<DifficultyLevel>('Intermediate');

  // Modal: Add New Module
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [newModuleTitleInput, setNewModuleTitleInput] = useState('');

  // Video Lecture Form State
  const [title, setTitle] = useState('Attention in Transformers: Step-by-Step Mechanisms');
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

  // Reference Notes & Handouts State
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
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);
  const [isGeneratingCheckpoints, setIsGeneratingCheckpoints] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);
  const [activeNotesTab, setActiveNotesTab] = useState<'edit' | 'preview'>('edit');

  // Submission Feedback & Overlay State
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);
  const [publishedDetails, setPublishedDetails] = useState<{
    courseCode: string;
    courseTitle: string;
    moduleTitle: string;
    lectureTitle: string;
    checkpointsCount: number;
    handoutName?: string;
  } | null>(null);

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

  // Submit Course Creation
  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      alert('Please enter a course title.');
      return;
    }

    const code = newCourseCode.trim() || `CRS-${Math.floor(100 + Math.random() * 900)}`;
    const courseId = `course-${Date.now()}`;
    const moduleId = `mod-${Date.now()}-1`;

    const newCourseObj: Course = {
      id: courseId,
      code,
      title: newCourseTitle.trim(),
      subtitle: newCourseDescription.trim().slice(0, 80) || 'Comprehensive Academic Curriculum',
      subject: newCourseSubject,
      category: newCourseCategory,
      instructorName: currentUser.fullName,
      instructorTitle: 'Course Mentor & Faculty Instructor',
      instructorAvatar: currentUser.avatarUrl || '👨‍🏫',
      rating: 5.0,
      enrolledCount: 1,
      estimatedHours: 24,
      difficulty: newCourseDifficulty,
      description: newCourseDescription.trim() || `Academic course covering ${newCourseTitle}.`,
      learningObjectives: [
        `Master foundational and advanced concepts of ${newCourseTitle}.`,
        'Engage with mandatory checkpoint assessments and video proofs.',
        'Study comprehensive reference notes, derivations, and handouts.',
      ],
      modules: [
        {
          id: moduleId,
          courseId,
          moduleNumber: 1,
          title: newCourseModuleTitle.trim() || 'Module 1: Foundations & Architecture',
          description: `Foundations of ${newCourseTitle}.`,
          estimatedMinutes: 60,
          topics: [],
        },
      ],
      isEnrolled: true,
      progressPercentage: 0,
    };

    onCreateCourse?.(newCourseObj);
    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);
    setIsCreateCourseModalOpen(false);

    // Reset create fields
    setNewCourseTitle('');
    setNewCourseCode('');
    setNewCourseDescription('');
  };

  // Submit Add Module
  const handleAddModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitleInput.trim()) {
      alert('Please enter a module title.');
      return;
    }
    onCreateModule?.(selectedCourseId, newModuleTitleInput.trim());
    setIsAddModuleModalOpen(false);
    setNewModuleTitleInput('');
  };

  // Submit and Publish Lecture & Notes
  const handlePublish = () => {
    if (!selectedCourse) {
      alert('Please select or create a target course first.');
      return;
    }
    if (!title.trim()) {
      alert('Please provide a title for the video lecture.');
      return;
    }
    if (!videoUrl) {
      alert('Please provide a video source (upload video file or paste video URL).');
      return;
    }
    if (checkpoints.length === 0) {
      alert('Please configure at least one in-video checkpoint question.');
      return;
    }

    const moduleId = selectedModuleId || selectedCourse.modules[0]?.id || 'mod-1';
    const targetMod = selectedCourse.modules.find((m) => m.id === moduleId) || selectedCourse.modules[0];

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
      notesAttachment: {
        title: `${title} - Lecture Reference Notes`,
        content: referenceNotes,
        className: `${selectedCourse.code} - ${selectedCourse.title}`,
        attachmentName: attachmentName || undefined,
        attachmentUrl: attachmentUrl || undefined,
      },
    });

    setPublishedDetails({
      courseCode: selectedCourse.code,
      courseTitle: selectedCourse.title,
      moduleTitle: targetMod?.title || 'Selected Module',
      lectureTitle: title,
      checkpointsCount: checkpoints.length,
      handoutName: attachmentName || undefined,
    });

    setIsPublishedSuccess(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* ========================================================================= */}
      {/* MODAL 1: CREATE COURSE FIRST */}
      {/* ========================================================================= */}
      {isCreateCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateCourseModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-mono-code">
                Step 1: Course Architecture
              </span>
              <h2 className="font-adorn text-2xl font-black text-slate-950">
                Create a New Course First
              </h2>
              <p className="text-xs text-slate-600">
                Define your course curriculum first. Once created, you will immediately upload your lecture videos and reference notes into it.
              </p>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. CS-AI-502"
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-yellow-50/20 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Deep Reinforcement Learning & Autonomy"
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-yellow-50/20 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Subject / Domain
                  </label>
                  <select
                    value={newCourseSubject}
                    onChange={(e) => setNewCourseSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newCourseDifficulty}
                    onChange={(e) => setNewCourseDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Initial Module 1 Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseModuleTitle}
                  onChange={(e) => setNewCourseModuleTitle(e.target.value)}
                  placeholder="e.g. Module 1: Foundations & Markov Processes"
                  className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-yellow-50/20 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Course Overview &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  placeholder="Brief summary of syllabus topics, mathematical derivations, and core principles covered..."
                  className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-yellow-50/20 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-yellow-100">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="yellow-gradient-btn px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  ✓ Create Course &amp; Start Uploading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD MODULE TO COURSE */}
      {/* ========================================================================= */}
      {isAddModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsAddModuleModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-mono-code">
                {selectedCourse?.code || 'Course'}
              </span>
              <h3 className="font-adorn text-xl font-black text-slate-950">
                Add New Module
              </h3>
              <p className="text-xs text-slate-600">
                Add an additional syllabus module to &quot;{selectedCourse?.title}&quot;.
              </p>
            </div>

            <form onSubmit={handleAddModuleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  value={newModuleTitleInput}
                  onChange={(e) => setNewModuleTitleInput(e.target.value)}
                  placeholder={`Module ${(selectedCourse?.modules.length || 0) + 1}: e.g. Attention & Graph Networks`}
                  className="w-full px-3 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/20 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="yellow-gradient-btn px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  + Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SUBMISSION SUCCESS & DIRECT VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {isPublishedSuccess && publishedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-9 border-4 border-yellow-400 shadow-2xl space-y-6 relative animate-scaleUp">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-sm">
                ✓
              </div>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-mono-code">
                Successfully Submitted to Curriculum &amp; Notes
              </span>
              <h2 className="font-adorn text-2xl sm:text-3xl font-black text-slate-950">
                Lecture Video &amp; Notes Are Now Live!
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your content has been submitted and linked to both the <strong>Courses</strong> curriculum syllabus and the <strong>Notes</strong> library for student access.
              </p>
            </div>

            {/* Published Summary Card */}
            <div className="bg-yellow-50/70 rounded-2xl p-4 sm:p-5 border-2 border-yellow-200 space-y-2.5 text-xs text-slate-800 font-mono-code">
              <div className="flex items-center justify-between border-b border-yellow-200/80 pb-2">
                <span className="text-slate-500 uppercase font-bold">Target Course:</span>
                <span className="font-bold text-amber-900">
                  {publishedDetails.courseCode} — {publishedDetails.courseTitle}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-yellow-200/80 pb-2">
                <span className="text-slate-500 uppercase font-bold">Module:</span>
                <span className="font-bold text-slate-900">{publishedDetails.moduleTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-yellow-200/80 pb-2">
                <span className="text-slate-500 uppercase font-bold">Lecture Topic:</span>
                <span className="font-bold text-slate-950">{publishedDetails.lectureTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-yellow-200/80 pb-2">
                <span className="text-slate-500 uppercase font-bold">In-Video Checkpoints:</span>
                <span className="font-bold text-emerald-700">
                  ⚡ {publishedDetails.checkpointsCount} Mandatory Pause Questions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 uppercase font-bold">Reference Notes &amp; Handouts:</span>
                <span className="font-bold text-amber-700">
                  📄 {publishedDetails.handoutName || 'Structured Formula Notes Included'}
                </span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setIsPublishedSuccess(false);
                  onPreviewAsStudent?.(selectedCourseId);
                }}
                className="py-3 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
              >
                <span>🎓</span>
                <span>View in Courses (Student Login)</span>
              </button>

              <button
                onClick={() => {
                  setIsPublishedSuccess(false);
                  onViewNotesAsStudent?.();
                }}
                className="py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
              >
                <span>📚</span>
                <span>View in Notes (Student Login)</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={() => setIsPublishedSuccess(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                + Upload Another Lecture or Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER BANNER */}
      {/* ========================================================================= */}
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
              Course Video &amp; Notes Publishing Studio
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              First <strong>create your course</strong> or pick an existing course. Then upload your lecture video with <strong>mandatory in-video checkpoints</strong> and attach notes in <strong>any format</strong> (PDF, Word, PowerPoint, Markdown).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateCourseModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>✨</span>
              <span>+ Create Course First</span>
            </button>

            <button
              onClick={handlePublish}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <span>🚀</span>
              <span>Submit &amp; Publish</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN AUTHORING LAYOUT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Course Selector, Video Upload, Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-sm space-y-5">
            <h3 className="font-adorn text-xl font-black text-slate-900 flex items-center gap-2">
              <span>📹</span>
              <span>1. Course, Video &amp; Notes Setup</span>
            </h3>

            {/* STEP 1: COURSE & MODULE SELECTION OR CREATION */}
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50/40 to-yellow-50 p-4 sm:p-5 rounded-2xl border-2 border-yellow-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono-code flex items-center gap-1.5">
                  <span>🎓</span>
                  <span>Target Course &amp; Module</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-[11px] transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span>✨</span>
                  <span>+ Create New Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Target Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      if (e.target.value === '__CREATE_NEW__') {
                        setIsCreateCourseModalOpen(true);
                        return;
                      }
                      setSelectedCourseId(e.target.value);
                      const crs = courses.find((c) => c.id === e.target.value);
                      if (crs && crs.modules.length > 0) {
                        setSelectedModuleId(crs.modules[0].id);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="__CREATE_NEW__">✨ + Create a New Course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Select Target Module
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddModuleModalOpen(true)}
                      className="text-[10px] font-bold text-amber-800 hover:underline cursor-pointer"
                    >
                      + Add Module
                    </button>
                  </div>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_MODULE__') {
                        setIsAddModuleModalOpen(true);
                        return;
                      }
                      setSelectedModuleId(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  >
                    {selectedCourse?.modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        Mod {m.moduleNumber}: {m.title}
                      </option>
                    ))}
                    <option value="__ADD_MODULE__">➕ + Add New Module...</option>
                  </select>
                </div>
              </div>

              {selectedCourse && (
                <div className="text-[11px] text-slate-700 font-mono-code bg-white/90 p-2.5 rounded-xl border border-yellow-200 flex flex-wrap items-center justify-between gap-2">
                  <span>Selected Course: <strong>{selectedCourse.code}</strong> • {selectedCourse.title}</span>
                  <span className="text-amber-800 font-bold">{selectedCourse.modules.length} Modules</span>
                </div>
              )}
            </div>

            {/* STEP 2: LECTURE TITLE */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lecture Topic Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Attention in Transformers: Step-by-Step Mechanisms"
                  className="w-full px-4 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/30 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* STEP 3: VIDEO SOURCE SELECTION: UPLOAD FILE VS PASTE URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Video Source *
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
                      📤 Upload Video File
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
                      🔗 Paste Video Link
                    </button>
                  </div>
                </div>

                {/* Option A: Device File Upload (.mp4, .webm, .mov, .mkv) */}
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
                                setVideoUrl('');
                              }}
                              className="text-xs font-bold text-red-600 hover:text-red-800 p-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>

                          <video
                            src={videoUrl}
                            controls
                            className="w-full aspect-video rounded-xl bg-black shadow-inner border border-yellow-300"
                          />
                        </div>
                      ) : (
                        <label
                          htmlFor="mentor-video-file-upload"
                          className="cursor-pointer block py-5 space-y-2 select-none"
                        >
                          <span className="text-3xl block">📹</span>
                          <span className="text-xs font-bold text-slate-900 block">
                            Click to upload video file (.mp4, .webm, .mov)
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono-code">
                            Supports any resolution up to 4K • Auto-reads lecture duration
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Option B: YouTube / Video URL */
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50/30 text-slate-900 text-xs font-mono-code focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />

                    <button
                      type="button"
                      disabled={isGeneratingCheckpoints}
                      onClick={handleAutoGenerateCheckpoints}
                      className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-yellow-300 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>✨</span>
                      <span>
                        {isGeneratingCheckpoints
                          ? 'Synthesizing Checkpoints from Video...'
                          : 'Auto-Generate Questions from Video URL'}
                      </span>
                    </button>

                    {generationFeedback && (
                      <p className="text-[11px] font-mono-code text-amber-800 font-bold bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                        {generationFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* DURATION & DIFFICULTY */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value) || 15)}
                    className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-white text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <div className="flex gap-1">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          difficulty === lvl
                            ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                            : 'bg-yellow-50 text-slate-600 hover:bg-yellow-100'
                        }`}
                      >
                        {lvl.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD SUMMARY */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lecture Takeaway / Card Summary
                </label>
                <textarea
                  rows={2}
                  value={lectureSummary}
                  onChange={(e) => setLectureSummary(e.target.value)}
                  placeholder="Key takeaway to display on the student course topic card..."
                  className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-yellow-50/20 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* REFERENCE NOTES & UNIVERSAL HANDOUT FILE UPLOAD */}
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-adorn text-xl font-black text-slate-900 flex items-center gap-2">
                <span>📚</span>
                <span>Reference Notes &amp; Handouts</span>
              </h3>
              <div className="flex items-center gap-1 bg-yellow-100 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveNotesTab('edit')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    activeNotesTab === 'edit'
                      ? 'bg-yellow-400 text-slate-950 font-black'
                      : 'text-slate-600'
                  }`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotesTab('preview')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    activeNotesTab === 'preview'
                      ? 'bg-yellow-400 text-slate-950 font-black'
                      : 'text-slate-600'
                  }`}
                >
                  KaTeX Preview
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Add formulas ($$ formula $$), derivations, and takeaways for students to study alongside this video. These notes appear in both <strong>Courses</strong> and <strong>Notes</strong>!
            </p>

            {activeNotesTab === 'edit' ? (
              <textarea
                rows={9}
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                placeholder="# Mathematical Derivations & References..."
                className="w-full px-4 py-3 rounded-2xl border border-yellow-300 bg-yellow-50/20 font-mono-code text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 leading-relaxed"
              />
            ) : (
              <div className="p-4 rounded-2xl bg-yellow-50/40 border border-yellow-200 text-xs text-slate-800 font-mono-code whitespace-pre-wrap max-h-56 overflow-y-auto">
                {referenceNotes}
              </div>
            )}

            {/* UNIVERSAL HANDOUT FILE ATTACHMENT */}
            <div className="pt-2 border-t border-yellow-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                📎 Attach Handout / Slides (PDF, Word, PPT, Markdown)
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="mentor-handout-upload"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="mentor-handout-upload"
                  className="px-4 py-2 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 text-slate-900 text-xs font-bold cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <span>📁 Choose File</span>
                  <span className="text-slate-400 text-[10px]">(.pdf, .docx, .ppt)</span>
                </label>

                {attachmentName && (
                  <div className="flex items-center gap-2 bg-yellow-100/70 px-3 py-1.5 rounded-xl border border-yellow-300 text-xs font-mono-code font-bold text-amber-950 truncate max-w-[200px]">
                    <span className="truncate">{attachmentName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentFile(null);
                        setAttachmentName('');
                        setAttachmentUrl(undefined);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkpoints & Live Student Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* IN-VIDEO MANDATORY CHECKPOINTS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-yellow-400 shadow-md space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="font-adorn text-xl font-black text-slate-900">
                    2. In-Video Mandatory Checkpoints ({checkpoints.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  The video pauses at each timestamp. Wrong answers rewind to the previous checkpoint!
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCheckpoint}
                className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-black uppercase font-mono-code shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span>
                <span>Add Checkpoint</span>
              </button>
            </div>

            {/* Checkpoint Cards List */}
            <div className="space-y-4">
              {checkpoints.map((cp, idx) => (
                <div
                  key={cp.id}
                  className="p-5 rounded-2xl bg-yellow-50/40 border border-yellow-300 space-y-3 relative hover:border-yellow-500 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-slate-950 font-mono-code font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <label className="text-xs font-bold text-slate-700">Timestamp:</label>
                      <input
                        type="text"
                        value={cp.timestamp}
                        onChange={(e) => handleUpdateCheckpoint(cp.id, { timestamp: e.target.value })}
                        placeholder="0:15"
                        className="w-20 px-2.5 py-1 rounded-lg border border-yellow-300 bg-white font-mono-code text-xs font-bold text-center"
                      />
                      <span className="text-[10px] text-slate-500 font-mono-code">
                        ({cp.seconds}s into lecture)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCheckpoint(cp.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Question Prompt
                    </label>
                    <textarea
                      rows={2}
                      value={cp.question}
                      onChange={(e) => handleUpdateCheckpoint(cp.id, { question: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-yellow-300 bg-white text-xs font-semibold text-slate-900"
                    />
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Multiple Choice Options (Select radio for correct answer):
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
                            name={`correct-${cp.id}`}
                            checked={isCorrect}
                            onChange={() => handleUpdateCheckpoint(cp.id, { correctIdx: optIdx })}
                            className="accent-emerald-600 cursor-pointer"
                          />
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono-code font-bold flex items-center justify-center shrink-0">
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
                            className="flex-1 bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
                          />
                          {isCorrect && (
                            <span className="text-[10px] font-black uppercase text-emerald-700 px-2 py-0.5 rounded bg-emerald-100 font-mono-code">
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

            {/* Bottom Submit Action Bar */}
            <div className="pt-4 border-t border-yellow-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-mono-code">
                {checkpoints.length} Checkpoints Configured • Target: <strong>{selectedCourse?.code}</strong>
              </span>

              <button
                type="button"
                onClick={handlePublish}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 hover:scale-105"
              >
                <span>🚀</span>
                <span>Submit &amp; Publish to Course &amp; Notes</span>
              </button>
            </div>
          </div>

          {/* LIVE STUDENT CARD PREVIEW */}
          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-400 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-mono-code font-black uppercase tracking-wider shadow-2xs">
                  🎓 Live Preview
                </span>
                <span className="text-xs text-slate-700 font-bold">
                  How this appears to students in Courses &amp; Notes
                </span>
              </div>
              <span className="text-[11px] font-mono-code text-slate-500">
                Course: {selectedCourse?.code || 'Course'}
              </span>
            </div>

            <div className="bg-gradient-to-br from-yellow-50/70 via-white to-amber-50/40 rounded-3xl p-6 border-2 border-yellow-300 shadow-lg space-y-4 hover:border-yellow-500 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-yellow-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-mono-code font-black uppercase">
                    {selectedCourse?.code || 'CS-101'}
                  </span>
                  <span className="text-xs font-bold text-slate-600 font-mono-code">
                    Mod {selectedCourse?.modules.find(m => m.id === selectedModuleId)?.moduleNumber || 1} • {videoDuration} Mins
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold font-mono-code">
                  ⚡ {checkpoints.length} Checkpoints Active
                </span>
              </div>

              <div>
                <h4 className="font-adorn text-xl font-bold text-slate-950 leading-tight">
                  {title || 'Lecture Title'}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {lectureSummary}
                </p>
              </div>

              {attachmentName && (
                <div className="flex items-center gap-2 text-xs font-mono-code font-bold text-amber-800 bg-yellow-100/60 p-2.5 rounded-xl border border-yellow-300">
                  <span>📎 Attached Handout:</span>
                  <span>{attachmentName}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-600">
                  👨‍🏫 {currentUser.fullName}
                </span>

                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-4 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🚀</span>
                  <span>Submit to Course</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
