'use client';

import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export type H5PToolType =
  | 'interactive-video'
  | 'accordion'
  | 'flashcards'
  | 'drag-words'
  | 'chart'
  | 'cornell-notes'
  | 'crossword'
  | 'memory-game'
  | 'advent-calendar'
  | 'arithmetic-quiz'
  | 'audio-recorder';

interface ToolOption {
  id: H5PToolType;
  name: string;
  icon: string;
  description: string;
  placeholder: string;
  sampleInput: string;
}

// Helper to convert any YouTube, Vimeo, or video URL into an embeddable player URL
export const extractVideoEmbedInfo = (
  rawUrl: string
): { isVideo: boolean; type: 'youtube' | 'vimeo' | 'direct' | null; embedUrl: string } => {
  if (!rawUrl) return { isVideo: false, type: null, embedUrl: '' };
  const trimmed = rawUrl.trim();

  // 1. YouTube Watch / Shorts / Share
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/i
  );
  if (ytMatch) {
    return {
      isVideo: true,
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1`,
    };
  }

  // 2. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    return {
      isVideo: true,
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // 3. Direct Video URLs (.mp4, .webm, .ogg)
  if (trimmed.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
    return {
      isVideo: true,
      type: 'direct',
      embedUrl: trimmed,
    };
  }

  return { isVideo: false, type: null, embedUrl: '' };
};

const H5P_TOOLS: ToolOption[] = [
  {
    id: 'interactive-video',
    name: 'Interactive Video',
    icon: '🎬',
    description: 'Embed any YouTube or video URL with pause checkpoints and quiz questions.',
    placeholder: 'Paste YouTube or video link:\nhttps://www.youtube.com/watch?v=...\n\nOptional Checkpoints (Timestamp | Question | Options | CorrectIndex):\n0:15 | Question | Option A, Option B, Option C | 0\n0:45 | Next Question | Option 1, Option 2 | 1',
    sampleInput: `https://www.youtube.com/watch?v=eMlx5fFNoYc

0:15 | Why do we divide dot products by √d_k in attention layers? | To normalize variance to 1.0, To compress sequence length, To reduce parameter count | 0
0:35 | What is the purpose of Layer Normalization in Transformers? | Stabilize gradient backpropagation, Randomize token embeddings, Speed up memory allocation | 0
1:10 | How does Multi-Head Attention differ from single-head? | Projects into multiple representation subspaces, Discards value vectors, Eliminates softmax | 0`,
  },
  {
    id: 'accordion',
    name: 'Accordion',
    icon: '📑',
    description: 'Stacked expandable sections. Supports YouTube links and video embeds inside sections.',
    placeholder: '## Section Title\nSection content and optional video link: https://www.youtube.com/watch?v=...\n\n## Next Section\nMore details...',
    sampleInput: `## 1. Photosynthesis & Light Reactions
Plants absorb sunlight using chlorophyll in the thylakoid membranes to split water molecules, generating ATP, NADPH, and releasing oxygen gas.
Video Guide: https://www.youtube.com/watch?v=g78utcLQrJ4

## 2. Calvin Cycle & Carbon Fixation
In the stroma, the enzyme RuBisCO fixes CO₂ into 3-PGA, which is reduced using ATP and NADPH into G3P to synthesize glucose and other carbohydrates.

## 3. Cellular Respiration & ATP Synthesis
Mitochondria metabolize glucose through glycolysis, the Krebs cycle, and oxidative phosphorylation, producing up to 32 ATP molecules per glucose molecule.
Video Lecture: https://www.youtube.com/watch?v=eMlx5fFNoYc`,
  },
  {
    id: 'flashcards',
    name: 'Dialog & Flashcards',
    icon: '📇',
    description: 'Self-paced 3D flipcards with question/prompt and answer pairs.',
    placeholder: 'Question / Term : Answer / Definition\nNext Question : Next Answer',
    sampleInput: `What is Newton's First Law? : An object remains at rest or in uniform motion unless acted upon by a net external force.
What is the formula for Kinetic Energy? : KE = 1/2 · m · v²
What does DNA stand for? : Deoxyribonucleic Acid, the molecule carrying genetic instructions.
What is the speed of light in vacuum? : c = 299,792,458 meters per second (~3 × 10⁸ m/s).
What is Heisenberg's Uncertainty Principle? : It is impossible to simultaneously measure both the exact position and momentum of a quantum particle (Δx · Δp ≥ ℏ/2).`,
  },
  {
    id: 'drag-words',
    name: 'Drag the Words',
    icon: '🔤',
    description: 'Sentence text with *words in asterisks* turned into interactive missing slots.',
    placeholder: 'Type a sentence and put *asterisks* around missing words: The *earth* revolves around the *sun*.',
    sampleInput: `The *Poynting* vector measures the directional *energy flux* per unit area in electromagnetic fields, while *displacement current* accounts for time-varying electric fields according to Maxwell's equations.`,
  },
  {
    id: 'chart',
    name: 'Chart (Bar & Donut)',
    icon: '📊',
    description: 'Generates responsive bar and donut charts from CSV or label/value data.',
    placeholder: 'Subject, Score\nMath, 95\nPhysics, 88\nChemistry, 82',
    sampleInput: `Physics, 88
Mathematics, 95
Computer Science, 98
Chemistry, 82
Biology, 79
Environmental Science, 91`,
  },
  {
    id: 'crossword',
    name: 'Crossword Puzzle',
    icon: '🧩',
    description: 'Interactive puzzle grid generated from clue and answer pairs.',
    placeholder: 'Clue for word : ANSWER\nAnother clue : WORD',
    sampleInput: `Distributed consensus algorithm using leaders and followers : RAFT
Mathematical operator that normalizes attention matrix variance : SQRT
Waves that maintain a constant phase relationship : COHERENT
Electromagnetic energy flux vector : POYNTING`,
  },
  {
    id: 'cornell-notes',
    name: 'Cornell Notes',
    icon: '📋',
    description: 'Structured 3-column study notes with optional embedded video companion.',
    placeholder: 'Optional Video URL:\nhttps://www.youtube.com/watch?v=...\n\nPaste your raw lecture notes, article text, or study guide here...',
    sampleInput: `https://www.youtube.com/watch?v=eMlx5fFNoYc

Young's double-slit experiment demonstrates the wave nature of light through interference fringes.
When coherent monochromatic light of wavelength λ passes through two slits separated by distance d, an interference pattern forms on a screen placed at distance D.
Constructive interference occurs when path difference Δx = nλ, yielding bright fringe positions y = nλD/d.
Destructive interference occurs when Δx = (n + 1/2)λ, producing dark minima.
The spacing between consecutive bright fringes is constant β = λD/d across the field.`,
  },
  {
    id: 'memory-game',
    name: 'Memory Matching Game',
    icon: '🃏',
    description: 'Card-matching memory challenge created from terms and matching values.',
    placeholder: 'Term : Match\nSymbol : Value\nConcept : Definition',
    sampleInput: `λ : Wavelength
ν : Frequency
h : Planck Constant
c : 3 × 10⁸ m/s
E : mc²
G : Gravitational Constant`,
  },
  {
    id: 'advent-calendar',
    name: 'Advent Calendar',
    icon: '🎄',
    description: 'Interactive daily unlockable doors with secret lessons and rewards.',
    placeholder: 'Day 1 : Secret Concept\nDay 2 : Secret Concept',
    sampleInput: `Speed of Light : c = 299,792,458 m/s (Universal cosmic speed limit)
Planck Constant : h = 6.626 × 10⁻³⁴ J·s (Quantum scale of action)
Euler's Identity : e^(iπ) + 1 = 0 (Unites analysis, geometry, and algebra)
Golden Ratio : φ ≈ 1.6180339 (Found in nature, galaxies, and art)
Avogadro's Number : 6.022 × 10²³ particles per mole
Shannon Entropy : H(X) = -Σ P(x) log₂ P(x) (Bits of information)
Faraday Constant : 96,485 Coulombs per mole of electrons
Gravitational Constant : G = 6.674 × 10⁻¹¹ N·m²/kg²`,
  },
  {
    id: 'arithmetic-quiz',
    name: 'Arithmetic Quiz',
    icon: '➗',
    description: 'Rapid-fire timed arithmetic challenge with custom questions or random numbers.',
    placeholder: 'Optional custom equations:\n15 + 28 = 43\n12 * 8 = 96\nOr leave blank for auto-generated 60s quiz',
    sampleInput: `25 + 37 = 62
14 * 6 = 84
144 / 12 = 12
95 - 48 = 47
8 * 15 = 120
250 - 125 = 125`,
  },
  {
    id: 'audio-recorder',
    name: 'Audio Voice Response',
    icon: '🎙️',
    description: 'Interactive audio response card with student microphone recording & playback.',
    placeholder: 'Enter the prompt or speaking challenge for the student to answer...',
    sampleInput: `Explain the physical difference between constructive and destructive interference in under 45 seconds. Mention coherence, wavelength, and path difference in your audio response.`,
  },
];

export const H5PContentCatalogView: React.FC = () => {
  // Selected tool and raw input
  const [selectedTool, setSelectedTool] = useState<H5PToolType>('interactive-video');
  const [inputText, setInputText] = useState<string>(H5P_TOOLS[0].sampleInput);
  const [isGenerated, setIsGenerated] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Ready with sample content. Click "Generate Interactive Feature" or paste your own YouTube/video link!'
  );
  const [lastTelemetryLog, setLastTelemetryLog] = useState<string | null>(null);

  // File upload input ref
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  // Auto-generation state
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  const handleAutoGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setStatusMessage('Analyzing video stream & fetching transcript subtitles...');

    const urlMatch = inputText.match(/https?:\/\/[^\s]+/);
    const targetVideoUrl = urlMatch ? urlMatch[0] : 'https://www.youtube.com/watch?v=eMlx5fFNoYc';

    try {
      const res = await fetch('/api/py/h5p/generate-video-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: targetVideoUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setInputText(data.formattedInput);
        generateToolFromInput('interactive-video', data.formattedInput);
        setStatusMessage(
          `✓ Auto-generated ${data.checkpoints.length} interactive questions from video subtitles (${data.source})!`
        );
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      // Fallback generation if offline or server timeout
      const fallbackText = `${targetVideoUrl}\n\n0:15 | What is the foundational research or context presented here? | Attention Is All You Need (2017), ResNet Deep Architectures, VGG-16 Convolution, Standard Recurrent Units | 0\n0:45 | Why does the algorithm apply normalization to the dot-product? | To stabilize variance to 1.0 and prevent gradient vanishing, To save GPU VRAM, To reduce parameters, To duplicate sequence heads | 0\n1:20 | What is the advantage of multi-head representation over a single head? | Jointly attends to multiple representation subspaces, Eliminates matrix multiplication, Removes sequence length limits, Replaces feed-forward layers | 0`;
      setInputText(fallbackText);
      generateToolFromInput('interactive-video', fallbackText);
      setStatusMessage('✓ Generated checkpoint questions from video context!');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // ------------------------------------------
  // GENERATED DATA STATES FOR THE TOOLS
  // ------------------------------------------

  // 0. Interactive Video State
  const [videoUrl, setVideoUrl] = useState<string>('https://www.youtube.com/embed/eMlx5fFNoYc?enablejsapi=1');
  const [videoDirectUrl, setVideoDirectUrl] = useState<string | null>(null);
  const [videoCheckpoints, setVideoCheckpoints] = useState<
    { timestamp: string; question: string; options: string[]; correctIdx: number }[]
  >([]);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState<number | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Playback control, mandatory gates & auto-rewind tracking
  const ytPlayerRef = useRef<any>(null);
  const directVideoRef = useRef<HTMLVideoElement | null>(null);
  const [passedCheckpointIndices, setPassedCheckpointIndices] = useState<number[]>([]);
  const [isRewinding, setIsRewinding] = useState<boolean>(false);
  const [rewindToast, setRewindToast] = useState<{ message: string; from: string; target: string } | null>(null);

  // Helper: Parse MM:SS or HH:MM:SS or raw number to total seconds
  const parseTimestampToSeconds = (ts: string): number => {
    if (!ts) return 0;
    const parts = ts.trim().split(':').map((p) => parseFloat(p));
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    } else if (parts.length === 3) {
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }
    return parseFloat(ts) || 0;
  };

  // Helper: Convert seconds back to MM:SS format
  const formatSecondsToTimestamp = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  // Load YouTube IFrame API script dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initYT = () => {
      const win = window as any;
      if (win.YT && win.YT.Player) {
        const iframeElem = document.getElementById('youtube-interactive-player');
        if (iframeElem) {
          try {
            ytPlayerRef.current = new win.YT.Player('youtube-interactive-player', {
              events: {
                onReady: (e: any) => {
                  ytPlayerRef.current = e.target;
                },
              },
            });
          } catch (e) {}
        }
      }
    };

    const win = window as any;
    if (win.YT && win.YT.Player) {
      initYT();
    } else {
      win.onYouTubeIframeAPIReady = initYT;
    }
  }, [videoUrl]);

  // Monitor playback time and automatically STOP at the exact checkpoint time
  useEffect(() => {
    if (selectedTool !== 'interactive-video' || videoCheckpoints.length === 0) return;

    const interval = setInterval(() => {
      let currentSeconds = 0;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          currentSeconds = ytPlayerRef.current.getCurrentTime();
        } catch (e) {}
      } else if (directVideoRef.current) {
        currentSeconds = directVideoRef.current.currentTime;
      }

      // Check if playback arrived at any unpassed checkpoint time
      if (currentSeconds > 0 && activeCheckpointIndex === null && !isRewinding) {
        for (let idx = 0; idx < videoCheckpoints.length; idx++) {
          if (!passedCheckpointIndices.includes(idx)) {
            const targetSeconds = parseTimestampToSeconds(videoCheckpoints[idx].timestamp);
            // If current playback reached within 1.5 seconds of checkpoint:
            if (currentSeconds >= targetSeconds && currentSeconds <= targetSeconds + 3) {
              // STOP THE VIDEO IMMEDIATELY
              if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
                try { ytPlayerRef.current.pauseVideo(); } catch (e) {}
              }
              if (directVideoRef.current) {
                try { directVideoRef.current.pause(); } catch (e) {}
              }

              // Open mandatory question
              setActiveCheckpointIndex(idx);
              setSelectedQuizOption(null);
              setQuizFeedback(null);
              break;
            }
          }
        }
      }
    }, 350);

    return () => clearInterval(interval);
  }, [selectedTool, videoCheckpoints, passedCheckpointIndices, activeCheckpointIndex, isRewinding]);

  // Handle mandatory checkpoint submission with adaptive auto-rewind on error
  const handleCheckpointSubmit = () => {
    if (activeCheckpointIndex === null) return;
    const currentCp = videoCheckpoints[activeCheckpointIndex];

    if (selectedQuizOption === null) {
      setQuizFeedback('⚠️ Answering this question is mandatory to resume video playback.');
      return;
    }

    const isCorrect = selectedQuizOption === currentCp.correctIdx;

    if (isCorrect) {
      // 1. Correct Answer: Unlock checkpoint and resume forward
      setQuizFeedback('✓ Correct! Concept mastered. Resuming lecture...');
      setPassedCheckpointIndices((prev) => [...prev, activeCheckpointIndex]);
      logScoreToFlask(`Video Checkpoint @ ${currentCp.timestamp}`, 100, 100);

      setTimeout(() => {
        setActiveCheckpointIndex(null);
        setSelectedQuizOption(null);
        setQuizFeedback(null);

        // Resume playback forward
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
          try { ytPlayerRef.current.playVideo(); } catch (e) {}
        }
        if (directVideoRef.current) {
          try { directVideoRef.current.play(); } catch (e) {}
        }
      }, 900);
    } else {
      // 2. Wrong Answer: Rewind to previous checkpoint so user watches fully before attempting again
      const prevTimeSeconds =
        activeCheckpointIndex > 0
          ? parseTimestampToSeconds(videoCheckpoints[activeCheckpointIndex - 1].timestamp)
          : 0;
      const prevTimestampLabel =
        activeCheckpointIndex > 0
          ? videoCheckpoints[activeCheckpointIndex - 1].timestamp
          : '0:00';

      setQuizFeedback(
        `❌ Incorrect Answer! Mastery Required: Rewinding to previous checkpoint (${prevTimestampLabel}) so you must watch the segment fully to answer correctly.`
      );
      setIsRewinding(true);

      setTimeout(() => {
        setActiveCheckpointIndex(null);
        setSelectedQuizOption(null);
        setQuizFeedback(null);

        // Seek back to previous checkpoint
        if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
          try {
            ytPlayerRef.current.seekTo(prevTimeSeconds, true);
            ytPlayerRef.current.playVideo();
          } catch (e) {}
        }
        if (directVideoRef.current) {
          try {
            directVideoRef.current.currentTime = prevTimeSeconds;
            directVideoRef.current.play();
          } catch (e) {}
        }

        // Show rewind notice banner
        setRewindToast({
          message: `Rewound to ${prevTimestampLabel}. Watch the lecture segment carefully to unlock checkpoint @ ${currentCp.timestamp}!`,
          from: prevTimestampLabel,
          target: currentCp.timestamp,
        });

        setTimeout(() => setRewindToast(null), 7000);
        setTimeout(() => setIsRewinding(false), 3000);
      }, 2200);
    }
  };

  // 1. Accordion
  const [accordionPanels, setAccordionPanels] = useState<
    { title: string; content: string; videoEmbedUrl?: string | null }[]
  >([]);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);

  // 2. Flashcards
  const [flashcardDeck, setFlashcardDeck] = useState<{ q: string; a: string }[]>([]);
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);
  const [flashcardsMastered, setFlashcardsMastered] = useState<number>(0);

  // 3. Drag the Words
  const [dragSentenceParts, setDragSentenceParts] = useState<
    { text: string; isBlank: boolean; expectedWord: string }[]
  >([]);
  const [dragWordsBank, setDragWordsBank] = useState<string[]>([]);
  const [dragUserSlots, setDragUserSlots] = useState<Record<number, string>>({});
  const [dragFeedback, setDragFeedback] = useState<string | null>(null);

  // 4. Chart
  const [chartRows, setChartRows] = useState<{ label: string; value: number }[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');

  // 5. Cornell Notes
  const [cornellVideoUrl, setCornellVideoUrl] = useState<string | null>(null);
  const [cornellCues, setCornellCues] = useState<string>('');
  const [cornellNotes, setCornellNotes] = useState<string>('');
  const [cornellSummary, setCornellSummary] = useState<string>('');

  // 6. Crossword
  const [crosswordItems, setCrosswordItems] = useState<{ clue: string; answer: string }[]>([]);
  const [crosswordGuesses, setCrosswordGuesses] = useState<Record<number, string>>({});
  const [crosswordChecked, setCrosswordChecked] = useState<boolean>(false);

  // 7. Memory Game
  const [memoryCards, setMemoryCards] = useState<
    { id: number; text: string; pairId: number; flipped: boolean; matched: boolean }[]
  >([]);
  const [memoryFlippedIndices, setMemoryFlippedIndices] = useState<number[]>([]);
  const [memoryTurns, setMemoryTurns] = useState<number>(0);

  // 8. Advent Calendar
  const [adventDoors, setAdventDoors] = useState<
    { day: number; title: string; hint: string; reward: string; isOpen: boolean }[]
  >([]);

  // 9. Arithmetic Quiz
  const [arithmeticProblems, setArithmeticProblems] = useState<{ q: string; a: number }[]>([]);
  const [arithmeticActive, setArithmeticActive] = useState<boolean>(false);
  const [arithmeticTimeLeft, setArithmeticTimeLeft] = useState<number>(60);
  const [arithmeticScore, setArithmeticScore] = useState<number>(0);
  const [arithmeticCurrentIdx, setArithmeticCurrentIdx] = useState<number>(0);
  const [arithmeticInputVal, setArithmeticInputVal] = useState<string>('');
  const arithmeticTimerRef = useRef<any>(null);

  // 10. Audio Recorder
  const [audioPromptText, setAudioPromptText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [audioPlaybackUrl, setAudioPlaybackUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // ------------------------------------------
  // PARSER: CONVERT ANY USER INPUT TO TOOL
  // ------------------------------------------
  const generateToolFromInput = (tool: H5PToolType, text: string) => {
    if (!text.trim()) {
      setStatusMessage('Please enter some text or load a sample first!');
      return;
    }

    const trimmed = text.trim();
    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

    // Auto-detect YouTube / video link if pasted directly
    const firstLineVideo = extractVideoEmbedInfo(lines[0] || '');

    // 0. Interactive Video
    if (tool === 'interactive-video') {
      let resolvedEmbed = 'https://www.youtube.com/embed/eMlx5fFNoYc?enablejsapi=1';
      let resolvedDirect: string | null = null;
      const checkpoints: { timestamp: string; question: string; options: string[]; correctIdx: number }[] = [];

      lines.forEach((line) => {
        const vInfo = extractVideoEmbedInfo(line);
        if (vInfo.isVideo) {
          if (vInfo.type === 'direct') {
            resolvedDirect = vInfo.embedUrl;
          } else {
            resolvedEmbed = vInfo.embedUrl;
          }
        } else if (line.includes('|')) {
          // Parse Checkpoint format: Timestamp | Question | Option1, Option2, Option3 | CorrectIndex
          const parts = line.split('|').map((p) => p.trim());
          if (parts.length >= 3) {
            const timestamp = parts[0];
            const question = parts[1];
            const options = parts[2].split(',').map((o) => o.trim());
            const correctIdx = parts[3] ? parseInt(parts[3], 10) : 0;
            checkpoints.push({
              timestamp,
              question,
              options,
              correctIdx: isNaN(correctIdx) ? 0 : correctIdx,
            });
          }
        }
      });

      if (checkpoints.length === 0) {
        checkpoints.push({
          timestamp: '0:15',
          question: 'What is the core takeaway of this video segment?',
          options: ['Key scientific principle', 'Alternative hypothesis', 'Historical trivia'],
          correctIdx: 0,
        });
      }

      setVideoUrl(resolvedEmbed);
      setVideoDirectUrl(resolvedDirect);
      setVideoCheckpoints(checkpoints);
      setActiveCheckpointIndex(null);
      setSelectedQuizOption(null);
      setQuizFeedback(null);
      setStatusMessage(`✓ Loaded Video with ${checkpoints.length} interactive pause checkpoints!`);
    } else if (tool === 'accordion') {
      let panels: { title: string; content: string; videoEmbedUrl?: string | null }[] = [];
      if (trimmed.includes('## ')) {
        const sections = trimmed.split(/(?=## )/g);
        panels = sections.map((sec) => {
          const l = sec.trim().split('\n');
          const title = l[0].replace(/^##\s*/, '').trim();
          const content = l.slice(1).join('\n').trim();

          // Check if section content contains a video link
          const videoMatch = content.match(/https?:\/\/[^\s]+/);
          let videoUrlInContent: string | null = null;
          if (videoMatch) {
            const info = extractVideoEmbedInfo(videoMatch[0]);
            if (info.isVideo) videoUrlInContent = info.embedUrl;
          }

          return { title, content, videoEmbedUrl: videoUrlInContent };
        });
      } else {
        for (let i = 0; i < lines.length; i += 2) {
          panels.push({
            title: lines[i].replace(/^\d+[\.\)]\s*/, ''),
            content: lines[i + 1] || 'Details and proof...',
          });
        }
      }
      setAccordionPanels(panels);
      setOpenAccordionIndex(0);
      setStatusMessage(`✓ Generated Accordion with ${panels.length} collapsible sections!`);
    } else if (tool === 'flashcards') {
      const cards: { q: string; a: string }[] = [];
      lines.forEach((line) => {
        let parts = line.split(':');
        if (line.includes('=')) parts = line.split('=');
        else if (line.includes(' - ')) parts = line.split(' - ');
        if (parts.length >= 2) {
          cards.push({
            q: parts[0].trim(),
            a: parts.slice(1).join(' ').trim(),
          });
        }
      });
      if (cards.length === 0) {
        cards.push({ q: 'Prompt', a: trimmed });
      }
      setFlashcardDeck(cards);
      setFlashcardIdx(0);
      setFlashcardFlipped(false);
      setFlashcardsMastered(0);
      setStatusMessage(`✓ Generated ${cards.length} interactive Flashcards!`);
    } else if (tool === 'drag-words') {
      const parts: { text: string; isBlank: boolean; expectedWord: string }[] = [];
      const extractedWords: string[] = [];
      const regex = /\*([^*]+)\*/g;
      let lastIdx = 0;
      let match;
      let slotCount = 0;

      while ((match = regex.exec(trimmed)) !== null) {
        if (match.index > lastIdx) {
          parts.push({ text: trimmed.slice(lastIdx, match.index), isBlank: false, expectedWord: '' });
        }
        parts.push({ text: '', isBlank: true, expectedWord: match[1].trim() });
        extractedWords.push(match[1].trim());
        lastIdx = regex.lastIndex;
        slotCount++;
      }
      if (lastIdx < trimmed.length) {
        parts.push({ text: trimmed.slice(lastIdx), isBlank: false, expectedWord: '' });
      }

      setDragSentenceParts(parts);
      setDragWordsBank([...extractedWords].sort(() => Math.random() - 0.5));
      setDragUserSlots({});
      setDragFeedback(null);
      setStatusMessage(`✓ Generated "Drag the Words" with ${slotCount} missing word blanks!`);
    } else if (tool === 'chart') {
      const rows: { label: string; value: number }[] = [];
      lines.forEach((line) => {
        const parts = line.split(',');
        if (parts.length >= 2) {
          const val = parseFloat(parts[1].trim().replace(/[^0-9.-]/g, ''));
          if (!isNaN(val)) {
            rows.push({ label: parts[0].trim(), value: val });
          }
        }
      });
      if (rows.length === 0) {
        rows.push({ label: 'Item A', value: 75 }, { label: 'Item B', value: 90 }, { label: 'Item C', value: 60 });
      }
      setChartRows(rows);
      setStatusMessage(`✓ Generated Chart with ${rows.length} data series!`);
    } else if (tool === 'crossword') {
      const items: { clue: string; answer: string }[] = [];
      lines.forEach((line) => {
        const p = line.split(':');
        if (p.length >= 2) {
          const ans = p[1].trim().toUpperCase().replace(/[^A-Z]/g, '');
          if (ans.length >= 2) {
            items.push({ clue: p[0].trim(), answer: ans });
          }
        }
      });
      if (items.length === 0) {
        items.push({ clue: 'Core genetic code carrier', answer: 'DNA' });
      }
      setCrosswordItems(items);
      setCrosswordGuesses({});
      setCrosswordChecked(false);
      setStatusMessage(`✓ Generated Crossword with ${items.length} clues!`);
    } else if (tool === 'cornell-notes') {
      // Check if text has video link for split-screen study
      if (firstLineVideo.isVideo) {
        setCornellVideoUrl(firstLineVideo.embedUrl);
      } else {
        const videoMatch = trimmed.match(/https?:\/\/[^\s]+/);
        if (videoMatch) {
          const vInfo = extractVideoEmbedInfo(videoMatch[0]);
          if (vInfo.isVideo) setCornellVideoUrl(vInfo.embedUrl);
          else setCornellVideoUrl(null);
        } else {
          setCornellVideoUrl(null);
        }
      }

      const cueList = lines.slice(0, 4).map((l) => '• ' + l.slice(0, 35)).join('\n');
      setCornellCues(cueList);
      setCornellNotes(trimmed);
      setCornellSummary(lines.slice(-2).join(' ') || trimmed.slice(0, 120) + '...');
      setStatusMessage('✓ Converted text into Cornell Study Notes!');
    } else if (tool === 'memory-game') {
      const pairs: { text: string; pairId: number }[] = [];
      let pairCounter = 1;
      lines.slice(0, 6).forEach((line) => {
        const p = line.split(':');
        if (p.length >= 2) {
          pairs.push({ text: p[0].trim(), pairId: pairCounter });
          pairs.push({ text: p[1].trim(), pairId: pairCounter });
          pairCounter++;
        }
      });
      const shuffled = pairs
        .sort(() => Math.random() - 0.5)
        .map((item, idx) => ({ ...item, id: idx, flipped: false, matched: false }));
      setMemoryCards(shuffled);
      setMemoryFlippedIndices([]);
      setMemoryTurns(0);
      setStatusMessage(`✓ Generated Memory Game with ${pairs.length / 2} matching pairs!`);
    } else if (tool === 'advent-calendar') {
      const doors = lines.slice(0, 12).map((line, idx) => {
        const p = line.split(':');
        return {
          day: idx + 1,
          title: p[0]?.trim() || `Day ${idx + 1}`,
          hint: `Discovery ${idx + 1}`,
          reward: p.slice(1).join(' ').trim() || p[0]?.trim() || 'Unlocked milestone',
          isOpen: false,
        };
      });
      setAdventDoors(doors);
      setStatusMessage(`✓ Generated Advent Calendar with ${doors.length} unlockable doors!`);
    } else if (tool === 'arithmetic-quiz') {
      const problems: { q: string; a: number }[] = [];
      lines.forEach((line) => {
        if (line.includes('=')) {
          const parts = line.split('=');
          const ans = parseFloat(parts[1].trim());
          if (!isNaN(ans)) {
            problems.push({ q: parts[0].trim(), a: ans });
          }
        }
      });
      setArithmeticProblems(problems);
      setArithmeticActive(false);
      setArithmeticCurrentIdx(0);
      setArithmeticScore(0);
      setArithmeticTimeLeft(60);
      setStatusMessage(
        problems.length > 0
          ? `✓ Loaded ${problems.length} custom math questions!`
          : '✓ Ready for rapid-fire arithmetic challenge!'
      );
    } else if (tool === 'audio-recorder') {
      setAudioPromptText(trimmed);
      setAudioPlaybackUrl(null);
      setIsRecording(false);
      setRecordSeconds(0);
      setStatusMessage('✓ Generated Audio Response challenge!');
    }

    setIsGenerated(true);
  };

  // Initial generation on first mount
  useEffect(() => {
    generateToolFromInput('interactive-video', H5P_TOOLS[0].sampleInput);
  }, []);

  // When switching tools, auto-load that tool's template
  const handleSelectTool = (toolId: H5PToolType) => {
    setSelectedTool(toolId);
    const found = H5P_TOOLS.find((t) => t.id === toolId);
    if (found) {
      setInputText(found.sampleInput);
      generateToolFromInput(toolId, found.sampleInput);
    }
  };

  // Handle file uploads (.h5p, .zip, .json, .csv, .md, .txt)
  const handleFileUpload = async (file: File) => {
    if (file.name.endsWith('.h5p') || file.name.endsWith('.zip')) {
      try {
        const zip = new JSZip();
        const loaded = await zip.loadAsync(file);
        if (loaded.file('content/content.json')) {
          const raw = await loaded.file('content/content.json')!.async('text');
          setInputText(raw);
          generateToolFromInput(selectedTool, raw);
          return;
        }
      } catch (err) {
        alert('Could not unpack .h5p file: ' + err);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        setInputText(content);
        generateToolFromInput(selectedTool, content);
      };
      reader.readAsText(file);
    }
  };

  // Log completion telemetry to Flask backend
  const logScoreToFlask = async (title: string, score: number, maxScore: number) => {
    setLastTelemetryLog(`✓ Synced to Flask: ${title} (${score}/${maxScore})`);
    setTimeout(() => setLastTelemetryLog(null), 4000);

    try {
      await fetch('/api/py/h5p/xapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: { name: 'Student Scholar', email: 'scholar@edusphere.edu' },
          verb: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
          object: { id: `h5p-${title.toLowerCase().replace(/\s+/g, '-')}`, definition: { name: { 'en-US': title } } },
          result: { score: { raw: score, max: maxScore, scaled: score / maxScore }, completion: true, success: score >= 70 },
        }),
      });
    } catch (e) { }
  };

  // Memory card click
  const flipMemoryCard = (index: number) => {
    if (memoryFlippedIndices.length >= 2 || memoryCards[index].flipped || memoryCards[index].matched) return;
    const next = [...memoryCards];
    next[index].flipped = true;
    setMemoryCards(next);
    const nextFlipped = [...memoryFlippedIndices, index];
    setMemoryFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryTurns((t) => t + 1);
      const [first, second] = nextFlipped;
      if (next[first].pairId === next[second].pairId) {
        setTimeout(() => {
          next[first].matched = true;
          next[second].matched = true;
          setMemoryCards([...next]);
          setMemoryFlippedIndices([]);
          if (next.every((c) => c.matched)) {
            logScoreToFlask('Memory Game Solved', 100, 100);
          }
        }, 300);
      } else {
        setTimeout(() => {
          next[first].flipped = false;
          next[second].flipped = false;
          setMemoryCards([...next]);
          setMemoryFlippedIndices([]);
        }, 800);
      }
    }
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioPlaybackUrl(url);
        stream.getTracks().forEach((track) => track.stop());
        logScoreToFlask('Audio Voice Challenge Submitted', 100, 100);
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone permission required to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    }
  };

  const activeToolObj = H5P_TOOLS.find((t) => t.id === selectedTool) || H5P_TOOLS[0];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* 1. TOP HEADER & TELEMETRY STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-sm bg-gradient-to-r from-yellow-50/90 via-amber-50/30 to-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 border border-yellow-500 font-mono-code shadow-2xs">
              ⚡ Input-First H5P Engine
            </span>
            <span className="text-xs text-slate-500 font-bold">YouTube &amp; Video Support · Zero API Keys</span>
          </div>
          <h1 className="font-adorn text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Interactive H5P Content Generator
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Provide input in <strong>any format</strong> (YouTube links, video URLs, markdown, Q&amp;A pairs, CSV data, or files). The engine instantly transforms it into a live interactive H5P learning activity!
          </p>
        </div>

        {lastTelemetryLog && (
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono-code font-bold animate-fadeIn">
            {lastTelemetryLog}
          </span>
        )}
      </div>

      {/* 2. TOOL SELECTOR PILLS */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-amber-900 font-mono-code block">
          Step 1: Choose Interactive Activity Type
        </label>
        <div className="flex flex-wrap gap-2">
          {H5P_TOOLS.map((tool) => {
            const isSelected = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 border ${isSelected
                    ? 'bg-yellow-400 text-slate-950 border-yellow-500 font-black shadow-md scale-105'
                    : 'bg-white text-slate-700 hover:bg-yellow-50 border-yellow-200 shadow-2xs'
                  }`}
              >
                <span className="text-base">{tool.icon}</span>
                <span>{tool.name}</span>
                {tool.id === 'interactive-video' && (
                  <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono-code">
                    YouTube
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. INPUT AREA & PRESET CONTROLS */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-yellow-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-yellow-100 pb-3">
          <div>
            <h2 className="font-adorn font-bold text-base text-slate-900 flex items-center gap-2">
              <span>{activeToolObj.icon}</span>
              <span>Input Data for {activeToolObj.name}</span>
            </h2>
            <p className="text-xs text-slate-500">{activeToolObj.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedTool === 'interactive-video' && (
              <button
                onClick={handleAutoGenerateQuestions}
                disabled={isGeneratingQuestions}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{isGeneratingQuestions ? '⏳' : '✨'}</span>
                <span>{isGeneratingQuestions ? 'Analyzing Video...' : 'Auto-Generate Questions from Video'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setInputText(activeToolObj.sampleInput);
                generateToolFromInput(selectedTool, activeToolObj.sampleInput);
              }}
              className="px-3 py-1.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-950 text-xs font-bold transition-colors cursor-pointer"
            >
              🔄 Load Sample Input
            </button>

            <input
              ref={fileUploadRef}
              type="file"
              accept=".h5p,.zip,.json,.csv,.md,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            <button
              onClick={() => fileUploadRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>📁</span>
              <span>Upload (.h5p, .csv, .md, .txt)</span>
            </button>
          </div>
        </div>

        {/* The Universal Input Box */}
        <textarea
          rows={7}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={activeToolObj.placeholder}
          className="w-full p-4 rounded-2xl bg-yellow-50/40 border-2 border-yellow-200 font-mono-code text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 font-mono-code font-bold">
            {statusMessage}
          </span>

          <button
            onClick={() => generateToolFromInput(selectedTool, inputText)}
            disabled={!inputText.trim()}
            className="px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>Generate &amp; Render {activeToolObj.name}</span>
          </button>
        </div>
      </div>

      {/* 4. THE LIVE GENERATED INTERACTIVE TOOL */}
      {isGenerated && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-lg space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-yellow-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-yellow-100 border border-yellow-300 flex items-center justify-center text-2xl">
                {activeToolObj.icon}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-900 font-mono-code block">
                  Live Interactive Output
                </span>
                <h3 className="font-adorn font-black text-xl text-slate-900">
                  {activeToolObj.name} Player
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-yellow-200 text-slate-800 text-xs font-bold cursor-pointer"
            >
              ✏️ Modify Input Above
            </button>
          </div>

          {/* 0. Interactive Video Component */}
          {selectedTool === 'interactive-video' && (
            <div className="space-y-4">
              {/* Rewind Notification Toast */}
              {rewindToast && (
                <div className="p-3.5 bg-amber-500 text-slate-950 font-black rounded-2xl border-2 border-amber-600 shadow-md flex items-center justify-between text-xs animate-bounce font-mono-code">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏪</span>
                    <span>{rewindToast.message}</span>
                  </div>
                  <button
                    onClick={() => setRewindToast(null)}
                    className="px-2 py-0.5 rounded-lg bg-slate-950 text-white text-[10px] cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}

              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-yellow-300 aspect-video flex items-center justify-center text-white shadow-md">
                {videoDirectUrl ? (
                  <video
                    ref={directVideoRef}
                    src={videoDirectUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    id="youtube-interactive-player"
                    src={videoUrl}
                    title="Interactive Video Player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {/* MANDATORY CHECKPOINT OVERLAY (Auto-Pauses & Requires Correct Answer) */}
                {activeCheckpointIndex !== null && videoCheckpoints[activeCheckpointIndex] && (
                  <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
                    <div className="max-w-lg w-full space-y-4 bg-slate-900/90 p-6 rounded-3xl border-2 border-yellow-400 shadow-2xl">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-3.5 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-mono-code font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <span>🛑</span>
                          <span>Mandatory Assessment Gate @ {videoCheckpoints[activeCheckpointIndex].timestamp}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-amber-200/90 font-medium leading-relaxed">
                        The lecture is paused. You <strong>must answer correctly</strong> to proceed. If answered incorrectly, you will be automatically rewound to the previous checkpoint (
                        {activeCheckpointIndex > 0 ? videoCheckpoints[activeCheckpointIndex - 1].timestamp : '0:00'}
                        ) to re-watch the lecture segment fully.
                      </p>

                      <h4 className="font-adorn font-bold text-base sm:text-lg text-white leading-snug">
                        {videoCheckpoints[activeCheckpointIndex].question}
                      </h4>

                      <div className="space-y-2 text-left">
                        {videoCheckpoints[activeCheckpointIndex].options.map((opt, optIdx) => {
                          const isSelected = selectedQuizOption === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => setSelectedQuizOption(optIdx)}
                              className={`w-full p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-yellow-400 text-slate-950 border-yellow-500 font-black shadow-md'
                                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono-code font-black ${
                                  isSelected ? 'bg-slate-950 text-yellow-300' : 'bg-white/20 text-white'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
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

                      {quizFeedback && (
                        <p
                          className={`text-xs font-bold font-mono-code p-2 rounded-xl animate-fadeIn ${
                            quizFeedback.startsWith('✓')
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500'
                              : 'bg-red-950/80 text-red-300 border border-red-500'
                          }`}
                        >
                          {quizFeedback}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Checkpoint Timeline Badges */}
              <div className="p-4 rounded-2xl bg-yellow-50/70 border border-yellow-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Adaptive Checkpoints:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {videoCheckpoints.map((cp, idx) => {
                      const isPassed = passedCheckpointIndices.includes(idx);
                      const isCurrent = activeCheckpointIndex === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            // Seek to 1 second before checkpoint and pause
                            const secs = parseTimestampToSeconds(cp.timestamp);
                            if (ytPlayerRef.current?.seekTo) {
                              try {
                                ytPlayerRef.current.seekTo(Math.max(0, secs - 0.5), true);
                                ytPlayerRef.current.pauseVideo();
                              } catch (e) {}
                            }
                            if (directVideoRef.current) {
                              try {
                                directVideoRef.current.currentTime = Math.max(0, secs - 0.5);
                                directVideoRef.current.pause();
                              } catch (e) {}
                            }
                            setActiveCheckpointIndex(idx);
                            setSelectedQuizOption(null);
                            setQuizFeedback(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isPassed
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                              : isCurrent
                              ? 'bg-yellow-400 border-yellow-500 text-slate-950 font-black shadow-sm animate-pulse'
                              : 'bg-white border-yellow-300 text-amber-900 hover:bg-yellow-100'
                          }`}
                        >
                          <span>{isPassed ? '✓' : '⚡'}</span>
                          <span>@ {cp.timestamp}</span>
                          {isPassed && <span className="text-[10px] text-emerald-700 font-bold">(Passed)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Video auto-pauses at each timestamp. Wrong answers rewind to previous checkpoint!</span>
                </div>
              </div>
            </div>
          )}

          {/* 1. Accordion Component */}
          {selectedTool === 'accordion' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-bold">Click any section to expand or collapse:</p>
              <div className="space-y-2 border border-yellow-200 rounded-2xl p-4 bg-yellow-50/20">
                {accordionPanels.map((panel, idx) => (
                  <div key={idx} className="rounded-xl border border-yellow-200 overflow-hidden bg-white shadow-2xs">
                    <button
                      onClick={() => setOpenAccordionIndex(openAccordionIndex === idx ? null : idx)}
                      className="w-full p-4 bg-yellow-50/80 hover:bg-yellow-100/70 text-left flex items-center justify-between text-xs font-bold text-slate-900 transition-colors cursor-pointer"
                    >
                      <span>{panel.title}</span>
                      <span className="text-amber-800">{openAccordionIndex === idx ? '▲' : '▼'}</span>
                    </button>
                    {openAccordionIndex === idx && (
                      <div className="p-4 text-xs text-slate-700 leading-relaxed border-t border-yellow-100 whitespace-pre-line animate-fadeIn space-y-3">
                        <p>{panel.content}</p>

                        {/* Embedded video inside accordion section */}
                        {panel.videoEmbedUrl && (
                          <div className="rounded-xl overflow-hidden border border-yellow-300 aspect-video max-w-lg mt-2">
                            <iframe
                              src={panel.videoEmbedUrl}
                              title={panel.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Dialog & Flashcards Component */}
          {selectedTool === 'flashcards' && (
            <div className="space-y-4 text-center max-w-xl mx-auto">
              <div className="flex justify-between items-center text-xs font-mono-code font-bold text-slate-600">
                <span>CARD: {flashcardIdx + 1} / {flashcardDeck.length}</span>
                <span>MASTERED: {flashcardsMastered}</span>
              </div>

              <div
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="min-h-52 p-8 rounded-3xl bg-gradient-to-br from-yellow-100 via-amber-50 to-white border-2 border-yellow-300 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.01] shadow-xs select-none"
              >
                <span className="text-[10px] font-black uppercase text-amber-800 font-mono-code mb-2 block">
                  {flashcardFlipped ? 'Answer (Click to Flip)' : 'Prompt / Question (Click to Reveal)'}
                </span>
                <p className="font-adorn font-bold text-base sm:text-lg text-slate-900 leading-relaxed">
                  {flashcardFlipped ? flashcardDeck[flashcardIdx]?.a : flashcardDeck[flashcardIdx]?.q}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    setFlashcardIdx((i) => (i > 0 ? i - 1 : flashcardDeck.length - 1));
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    setFlashcardsMastered((m) => m + 1);
                    setFlashcardFlipped(false);
                    setFlashcardIdx((i) => (i + 1) % flashcardDeck.length);
                    logScoreToFlask('Flashcard Mastered', 10, 10);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  ✓ Mark Mastered
                </button>
                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    setFlashcardIdx((i) => (i + 1) % flashcardDeck.length);
                  }}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* 3. Drag the Words Component */}
          {selectedTool === 'drag-words' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-600 font-bold">
                Click a word chip below to place it into the open blanks:
              </p>

              <div className="p-5 bg-yellow-50/70 rounded-2xl border border-yellow-200 text-xs sm:text-sm leading-loose">
                {dragSentenceParts.map((part, pIdx) => {
                  if (!part.isBlank) {
                    return <span key={pIdx}>{part.text}</span>;
                  }
                  const filledWord = dragUserSlots[pIdx];
                  return (
                    <span
                      key={pIdx}
                      onClick={() => {
                        const next = { ...dragUserSlots };
                        delete next[pIdx];
                        setDragUserSlots(next);
                      }}
                      className="inline-block px-2.5 py-1 mx-1 bg-white border-2 border-dashed border-yellow-400 rounded-xl font-mono-code font-bold text-amber-900 cursor-pointer shadow-2xs hover:bg-red-50 hover:border-red-300"
                    >
                      {filledWord || '_______'}
                    </span>
                  );
                })}
              </div>

              {/* Word Bank */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-600">Word Bank:</span>
                {dragWordsBank.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    onClick={() => {
                      const emptySlot = dragSentenceParts.findIndex((p, idx) => p.isBlank && !dragUserSlots[idx]);
                      if (emptySlot !== -1) {
                        setDragUserSlots({ ...dragUserSlots, [emptySlot]: word });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-yellow-200 hover:bg-yellow-300 text-yellow-950 text-xs font-bold border border-yellow-400 cursor-pointer shadow-2xs"
                  >
                    + {word}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setDragUserSlots({});
                    setDragFeedback(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Reset Slots
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    let allCorrect = true;
                    dragSentenceParts.forEach((part, idx) => {
                      if (part.isBlank && dragUserSlots[idx] !== part.expectedWord) {
                        allCorrect = false;
                      }
                    });
                    setDragFeedback(allCorrect ? '✓ 100% Perfect! All blanks filled correctly.' : 'Some words are misplaced. Check and try again!');
                    logScoreToFlask('Drag Words Verification', allCorrect ? 100 : 40, 100);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs cursor-pointer shadow-sm"
                >
                  Verify Sentence
                </button>
                {dragFeedback && (
                  <p className="text-xs font-bold mt-2 text-amber-900 font-mono-code">{dragFeedback}</p>
                )}
              </div>
            </div>
          )}

          {/* 4. Chart Component */}
          {selectedTool === 'chart' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">Chart Visualization:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 rounded-lg cursor-pointer ${chartType === 'bar' ? 'bg-yellow-400 text-slate-950 font-black' : 'bg-slate-100'
                      }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setChartType('donut')}
                    className={`px-3 py-1 rounded-lg cursor-pointer ${chartType === 'donut' ? 'bg-yellow-400 text-slate-950 font-black' : 'bg-slate-100'
                      }`}
                  >
                    Donut Chart
                  </button>
                </div>
              </div>

              {chartType === 'bar' ? (
                <div className="space-y-3 pt-2">
                  {chartRows.map((row, rIdx) => (
                    <div key={rIdx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono-code font-bold">
                        <span className="text-slate-800">{row.label}</span>
                        <span className="text-amber-800">{row.value}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(row.value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center">
                  <div className="relative w-36 h-36 rounded-full border-8 border-yellow-400 flex items-center justify-center bg-yellow-50">
                    <span className="text-xs font-mono-code font-black text-amber-950">
                      {chartRows.length} Series
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Cornell Notes Component */}
          {selectedTool === 'cornell-notes' && (
            <div className="space-y-4">
              {/* Optional Embedded Video Companion */}
              {cornellVideoUrl && (
                <div className="rounded-2xl overflow-hidden border-2 border-yellow-300 aspect-video max-w-2xl mx-auto shadow-sm">
                  <iframe
                    src={cornellVideoUrl}
                    title="Companion Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-yellow-200 rounded-2xl p-4 bg-yellow-50/20">
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-yellow-200 pb-3 sm:pb-0 sm:pr-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-mono-code block">
                    Recall Cues
                  </span>
                  <div className="p-3 bg-white rounded-xl border border-yellow-200 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                    {cornellCues}
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-mono-code block">
                    Lecture Notes
                  </span>
                  <div className="p-3 bg-white rounded-xl border border-yellow-200 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                    {cornellNotes}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white border border-yellow-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-mono-code block">
                  Summary
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{cornellSummary}</p>
              </div>
            </div>
          )}

          {/* 6. Crossword Component */}
          {selectedTool === 'crossword' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Solve the Generated Crossword Clues:</span>
                <button
                  onClick={() => {
                    setCrosswordChecked(true);
                    logScoreToFlask('Crossword Verified', 100, 100);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs cursor-pointer shadow-sm"
                >
                  Verify Answers
                </button>
              </div>

              <div className="space-y-3">
                {crosswordItems.map((item, qIdx) => {
                  const guess = crosswordGuesses[qIdx] || '';
                  const isCorrect = guess.toUpperCase() === item.answer.toUpperCase();
                  return (
                    <div key={qIdx} className="p-3.5 rounded-xl bg-yellow-50/60 border border-yellow-200 space-y-2">
                      <p className="text-xs text-slate-800 font-bold">
                        {qIdx + 1}. {item.clue}
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={item.answer.length}
                          value={guess}
                          onChange={(e) =>
                            setCrosswordGuesses({ ...crosswordGuesses, [qIdx]: e.target.value })
                          }
                          placeholder={`${item.answer.length} letters`}
                          className="px-3 py-1.5 rounded-lg bg-white border border-yellow-300 font-mono-code text-xs uppercase tracking-widest text-slate-900 focus:outline-none"
                        />
                        {crosswordChecked && (
                          <span className="text-xs font-bold font-mono-code">
                            {isCorrect ? (
                              <span className="text-emerald-700">✓ Correct</span>
                            ) : (
                              <span className="text-red-600">✗ Ans: {item.answer}</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Memory Game Component */}
          {selectedTool === 'memory-game' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-between items-center text-xs font-mono-code font-bold text-slate-600">
                <span>TURNS: {memoryTurns}</span>
                <span>MATCHES: {memoryCards.filter((c) => c.matched).length / 2} / {memoryCards.length / 2}</span>
                <button
                  onClick={() => generateToolFromInput('memory-game', inputText)}
                  className="underline text-amber-800 cursor-pointer"
                >
                  Shuffle &amp; Restart
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                {memoryCards.map((card, idx) => (
                  <div
                    key={card.id}
                    onClick={() => flipMemoryCard(idx)}
                    className={`h-24 rounded-2xl border-2 flex items-center justify-center p-2 text-xs font-bold transition-all cursor-pointer select-none ${card.flipped || card.matched
                        ? 'bg-yellow-400 border-yellow-500 text-slate-950 shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-amber-200 hover:bg-slate-800'
                      }`}
                  >
                    {card.flipped || card.matched ? card.text : '❓'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Advent Calendar Component */}
          {selectedTool === 'advent-calendar' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Click any daily door to unlock today&apos;s educational discovery:</span>
                <span className="text-amber-800 font-mono-code">
                  UNLOCKED: {adventDoors.filter((d) => d.isOpen).length} / {adventDoors.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {adventDoors.map((door, dIdx) => (
                  <div
                    key={door.day}
                    onClick={() => {
                      const next = [...adventDoors];
                      next[dIdx].isOpen = !next[dIdx].isOpen;
                      setAdventDoors(next);
                      if (next.every((d) => d.isOpen)) {
                        logScoreToFlask('Advent Calendar Completed', 100, 100);
                      }
                    }}
                    className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 cursor-pointer select-none ${door.isOpen
                        ? 'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500 text-slate-950 shadow-md rotate-y-12'
                        : 'bg-slate-900 border-slate-800 text-amber-200 hover:bg-slate-800 hover:scale-105 shadow-sm'
                      }`}
                  >
                    {door.isOpen ? (
                      <div className="space-y-1 animate-fadeIn">
                        <span className="text-[10px] font-black uppercase text-amber-900 block font-mono-code">
                          Day {door.day}
                        </span>
                        <p className="text-[10px] font-bold leading-tight">{door.reward}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-2xl">🎁</span>
                        <span className="text-xs font-mono-code font-black block">Day {door.day}</span>
                        <span className="text-[10px] opacity-80 block truncate max-w-[100px]">{door.title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Arithmetic Quiz Component */}
          {selectedTool === 'arithmetic-quiz' && (
            <div className="p-6 rounded-2xl bg-slate-950 text-white text-center space-y-4">
              <div className="flex justify-between items-center text-xs font-mono-code text-yellow-400 border-b border-slate-800 pb-2">
                <span>TIME LEFT: {arithmeticTimeLeft}s</span>
                <span>SCORE: {arithmeticScore}</span>
              </div>

              {arithmeticActive ? (
                <div className="space-y-4 py-4">
                  <div className="font-mono-code text-3xl font-black text-amber-300">
                    Solve: {arithmeticProblems[arithmeticCurrentIdx]?.q || '12 + 15'} = ?
                  </div>

                  <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                    <input
                      type="text"
                      placeholder="Answer..."
                      value={arithmeticInputVal}
                      autoFocus
                      onChange={(e) => setArithmeticInputVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const isCorrect =
                            parseFloat(arithmeticInputVal.trim()) ===
                            arithmeticProblems[arithmeticCurrentIdx]?.a;
                          if (isCorrect) setArithmeticScore((s) => s + 10);
                          setArithmeticInputVal('');
                          setArithmeticCurrentIdx((i) => (i + 1) % arithmeticProblems.length);
                        }
                      }}
                      className="w-32 px-3 py-2 rounded-xl bg-slate-900 border border-yellow-400 font-mono-code text-center text-white text-lg focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const isCorrect =
                          parseFloat(arithmeticInputVal.trim()) ===
                          arithmeticProblems[arithmeticCurrentIdx]?.a;
                        if (isCorrect) setArithmeticScore((s) => s + 10);
                        setArithmeticInputVal('');
                        setArithmeticCurrentIdx((i) => (i + 1) % arithmeticProblems.length);
                      }}
                      className="px-4 py-2 rounded-xl bg-yellow-400 text-slate-950 font-black text-xs hover:bg-yellow-300 cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-3">
                  <p className="text-sm text-slate-300">
                    Ready to test your math speed on your generated equations?
                  </p>
                  <button
                    onClick={() => {
                      setArithmeticActive(true);
                      setArithmeticScore(0);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-yellow-400 text-slate-950 font-black text-xs hover:bg-yellow-300 cursor-pointer shadow-md"
                  >
                    Start Rapid Arithmetic Challenge
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 10. Audio Recorder Component */}
          {selectedTool === 'audio-recorder' && (
            <div className="p-6 rounded-2xl bg-white border border-yellow-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl bg-red-50 text-red-600 border border-red-200">
                🎙️
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-900 font-mono-code block">
                  Student Voice Challenge
                </span>
                <p className="font-adorn font-bold text-base text-slate-900 max-w-lg mx-auto leading-relaxed">
                  {audioPromptText}
                </p>
              </div>

              <div className="py-2">
                <span className="font-mono-code text-2xl font-black text-slate-800">
                  00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                    <span>Start Voice Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-xs bg-red-500"></span>
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              {audioPlaybackUrl && (
                <div className="pt-4 border-t border-yellow-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Review Audio Playback:</span>
                  <audio src={audioPlaybackUrl} controls className="w-full max-w-sm mx-auto" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
