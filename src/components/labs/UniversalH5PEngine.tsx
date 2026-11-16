'use client';

import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export interface IngestedContent {
  contentType:
    | 'accordion'
    | 'arithmetic'
    | 'chart'
    | 'cornell'
    | 'crossword'
    | 'agamotto'
    | 'audio'
    | 'flashcard'
    | 'interactive-video'
    | 'branching'
    | 'drag-text'
    | 'memory';
  title: string;
  sourceFormat: 'h5p_zip' | 'json' | 'markdown' | 'csv' | 'qa_pairs' | 'media_url';
  data: any;
}

interface UniversalH5PEngineProps {
  onContentReady?: (content: IngestedContent) => void;
}

export const UniversalH5PEngine: React.FC<UniversalH5PEngineProps> = ({ onContentReady }) => {
  const [activeImportTab, setActiveImportTab] = useState<'upload' | 'text' | 'csv' | 'media'>('upload');
  const [rawText, setRawText] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('https://www.youtube.com/watch?v=eMlx5fFNoYc');
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Parse .h5p ZIP archive using JSZip
  const processH5PZipFile = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage('Reading .h5p ZIP package...');

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Extract h5p.json metadata
      let h5pMeta: any = { title: file.name.replace('.h5p', ''), mainLibrary: 'H5P.Accordion' };
      if (zipContent.file('h5p.json')) {
        const metaText = await zipContent.file('h5p.json')!.async('text');
        try {
          h5pMeta = JSON.parse(metaText);
        } catch (e) {}
      }

      // Extract content/content.json
      let contentData: any = {};
      if (zipContent.file('content/content.json')) {
        const contentText = await zipContent.file('content/content.json')!.async('text');
        try {
          contentData = JSON.parse(contentText);
        } catch (e) {}
      }

      // Determine content type from library name
      const lib = (h5pMeta.mainLibrary || '').toLowerCase();
      let type: IngestedContent['contentType'] = 'accordion';

      if (lib.includes('video')) type = 'interactive-video';
      else if (lib.includes('arithmetic')) type = 'arithmetic';
      else if (lib.includes('chart')) type = 'chart';
      else if (lib.includes('cornell')) type = 'cornell';
      else if (lib.includes('crossword')) type = 'crossword';
      else if (lib.includes('agamotto')) type = 'agamotto';
      else if (lib.includes('audio')) type = 'audio';
      else if (lib.includes('flashcard') || lib.includes('dialog')) type = 'flashcard';
      else if (lib.includes('branching')) type = 'branching';
      else if (lib.includes('drag')) type = 'drag-text';
      else if (lib.includes('memory')) type = 'memory';

      const result: IngestedContent = {
        contentType: type,
        title: h5pMeta.title || file.name.replace('.h5p', ''),
        sourceFormat: 'h5p_zip',
        data: contentData,
      };

      setStatusMessage(`✓ Successfully unpacked .h5p package: ${h5pMeta.title} (${h5pMeta.mainLibrary})`);
      if (onContentReady) onContentReady(result);
    } catch (err: any) {
      setStatusMessage(`✗ Error unpacking .h5p file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Parse Raw Uploaded Files (.json, .csv, .md, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.h5p') || file.name.endsWith('.zip')) {
      processH5PZipFile(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        parseJsonContent(content, file.name);
      } else if (file.name.endsWith('.csv')) {
        parseCsvContent(content, file.name);
      } else {
        parseTextContent(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  // 3. Parse JSON Format
  const parseJsonContent = (jsonText: string, titleHint = 'Imported JSON') => {
    try {
      const parsed = JSON.parse(jsonText);
      let type: IngestedContent['contentType'] = 'accordion';

      if (parsed.panels) type = 'accordion';
      else if (parsed.cards || parsed.dialogs) type = 'flashcard';
      else if (parsed.words) type = 'crossword';
      else if (parsed.data && Array.isArray(parsed.data)) type = 'chart';
      else if (parsed.videoUrl) type = 'interactive-video';
      else if (parsed.sentence) type = 'drag-text';

      const result: IngestedContent = {
        contentType: type,
        title: parsed.title || titleHint,
        sourceFormat: 'json',
        data: parsed,
      };

      setStatusMessage(`✓ Valid JSON detected and mapped to ${type.toUpperCase()}`);
      if (onContentReady) onContentReady(result);
    } catch (err: any) {
      setStatusMessage(`✗ Invalid JSON: ${err.message}`);
    }
  };

  // 4. Parse CSV Format (Auto-maps to Chart, Flashcards, or Crosswords)
  const parseCsvContent = (csvText: string, titleHint = 'Imported CSV Table') => {
    const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setStatusMessage('✗ CSV requires at least a header row and 1 data row');
      return;
    }

    const rows = lines.map((line) => line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')));
    const isNumericColumn = rows.slice(1).every((r) => !isNaN(Number(r[1])));

    if (isNumericColumn) {
      // Auto-generates Chart
      const chartData = rows.slice(1).map((r) => ({
        label: r[0],
        value: Number(r[1]) || 0,
      }));

      const result: IngestedContent = {
        contentType: 'chart',
        title: titleHint,
        sourceFormat: 'csv',
        data: { chartType: 'bar', data: chartData },
      };

      setStatusMessage(`✓ CSV with numeric values converted to Interactive Chart (${chartData.length} data points)`);
      if (onContentReady) onContentReady(result);
    } else {
      // Auto-generates Flashcards
      const cards = rows.slice(1).map((r) => ({
        q: r[0],
        a: r[1] || 'Answer definition',
      }));

      const result: IngestedContent = {
        contentType: 'flashcard',
        title: titleHint,
        sourceFormat: 'csv',
        data: { cards },
      };

      setStatusMessage(`✓ CSV converted to ${cards.length} Interactive Flashcards`);
      if (onContentReady) onContentReady(result);
    }
  };

  // 5. Parse Markdown or Plain Text (Auto-detects format)
  const parseTextContent = (text: string, titleHint = 'Imported Document') => {
    const trimmed = text.trim();

    // Check for fill-in asterisks: "The *Poynting* vector"
    if (trimmed.includes('*') && trimmed.split('*').length >= 3) {
      const result: IngestedContent = {
        contentType: 'drag-text',
        title: titleHint,
        sourceFormat: 'markdown',
        data: { sentence: trimmed },
      };
      setStatusMessage('✓ Text with *gap markers* converted to "Drag the Words" exercise');
      if (onContentReady) onContentReady(result);
      return;
    }

    // Check for Q&A pairs (e.g. "Q: ... A: ..." or "Term = Definition" or "Term - Definition")
    const lines = trimmed.split('\n').filter(Boolean);
    const isPairFormat = lines.every((l) => l.includes(':') || l.includes('=') || l.includes(' - '));

    if (isPairFormat && lines.length >= 2) {
      const cards = lines.map((l) => {
        let parts: string[] = [];
        if (l.includes(':')) parts = l.split(':');
        else if (l.includes('=')) parts = l.split('=');
        else parts = l.split(' - ');
        return {
          q: parts[0]?.trim() || '',
          a: parts.slice(1).join(' ').trim() || '',
        };
      });

      const result: IngestedContent = {
        contentType: 'flashcard',
        title: titleHint,
        sourceFormat: 'qa_pairs',
        data: { cards },
      };
      setStatusMessage(`✓ Structured pairs converted to ${cards.length} Interactive Flashcards`);
      if (onContentReady) onContentReady(result);
      return;
    }

    // Check for Markdown Headings ## -> Accordion
    if (trimmed.includes('## ')) {
      const sections = trimmed.split(/(?=## )/g);
      const panels = sections.map((sec) => {
        const lines = sec.trim().split('\n');
        const header = lines[0].replace(/^##\s*/, '');
        const body = lines.slice(1).join('\n').trim();
        return { title: header, content: body };
      });

      const result: IngestedContent = {
        contentType: 'accordion',
        title: titleHint,
        sourceFormat: 'markdown',
        data: { panels },
      };
      setStatusMessage(`✓ Markdown headings converted to Accordion with ${panels.length} collapsible sections`);
      if (onContentReady) onContentReady(result);
      return;
    }

    // Fallback: Cornell Notes
    const result: IngestedContent = {
      contentType: 'cornell',
      title: titleHint,
      sourceFormat: 'markdown',
      data: {
        cueTitle: 'Key Concepts',
        notesTitle: 'Lecture Notes',
        summaryTitle: 'Takeaway Summary',
      },
    };
    setStatusMessage('✓ Text converted into structured Cornell Notes layout');
    if (onContentReady) onContentReady(result);
  };

  // 6. Parse Media URL (YouTube / Video / Audio)
  const handleMediaSubmit = () => {
    if (!mediaUrl.trim()) return;

    const result: IngestedContent = {
      contentType: 'interactive-video',
      title: 'Interactive Video with Checkpoints',
      sourceFormat: 'media_url',
      data: {
        videoUrl: mediaUrl.replace('watch?v=', 'embed/'),
        checkpoints: [
          { time: '00:15', q: 'What is the physical significance of the wavelength parameter?' },
          { time: '01:30', q: 'Explain why the variance normalizes to 1.0.' },
        ],
      },
    };
    setStatusMessage('✓ Video stream loaded with interactive checkpoint overlays');
    if (onContentReady) onContentReady(result);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-yellow-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 font-mono-code shadow-2xs">
              📥 Universal Content Ingestion Engine
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Accepts Content in ANY Format
            </span>
          </div>
          <h2 className="font-adorn text-2xl font-black text-slate-900">
            Import &amp; Auto-Convert Curriculum Content
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Upload official <code>.h5p</code> zip files, paste JSON, Markdown, CSV tables, Q&amp;A pairs, or video links. The engine automatically parses and mounts the matching interactive player.
          </p>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-yellow-100/70 p-1.5 rounded-2xl border border-yellow-200">
          <button
            onClick={() => setActiveImportTab('upload')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeImportTab === 'upload'
                ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-700 hover:bg-yellow-200'
            }`}
          >
            📦 Upload File (.h5p, .json, .csv)
          </button>
          <button
            onClick={() => setActiveImportTab('text')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeImportTab === 'text'
                ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-700 hover:bg-yellow-200'
            }`}
          >
            ✍️ Paste Text / Markdown
          </button>
          <button
            onClick={() => setActiveImportTab('csv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeImportTab === 'csv'
                ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-700 hover:bg-yellow-200'
            }`}
          >
            📊 Paste CSV Table
          </button>
          <button
            onClick={() => setActiveImportTab('media')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeImportTab === 'media'
                ? 'bg-yellow-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-700 hover:bg-yellow-200'
            }`}
          >
            🎬 Video / Media Link
          </button>
        </div>
      </div>

      {/* Tab 1: Upload File (.h5p, .json, .csv, .md) */}
      {activeImportTab === 'upload' && (
        <div className="p-8 border-2 border-dashed border-yellow-300 rounded-3xl bg-yellow-50/40 text-center space-y-4 hover:bg-yellow-50/70 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".h5p,.zip,.json,.csv,.md,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-300 text-yellow-950 flex items-center justify-center text-3xl shadow-xs">
            📤
          </div>

          <div>
            <h3 className="font-adorn font-bold text-base text-slate-900">
              Drag &amp; Drop or Choose File
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Supports official <code>.h5p</code> packages, raw <code>content.json</code>, tabular <code>.csv</code>, or markdown <code>.md</code> lecture files.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? 'Unpacking Package...' : 'Select File from Computer'}
          </button>
        </div>
      )}

      {/* Tab 2: Paste Raw Text / Markdown */}
      {activeImportTab === 'text' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
            <span>Paste Markdown, Bullet Notes, or Q&amp;A Pairs:</span>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setRawText(
                    `## Introduction to Maxwell-Ampère Law\nDisplacement current accounts for changing electric flux.\n\n## Wave Equation Derivation\nElectromagnetic waves travel at speed c = 1 / sqrt(mu_0 * epsilon_0).\n\n## Fringe Width Formula\nLinear separation between maxima is beta = lambda * D / d.`
                  )
                }
                className="text-[11px] text-amber-800 underline cursor-pointer"
              >
                Sample Markdown
              </button>
              <button
                onClick={() =>
                  setRawText(
                    `Query: Search token representations\nKey: Feature database tokens\nValue: Output payload vectors\nSoftmax: Probability normalization to 1.0`
                  )
                }
                className="text-[11px] text-amber-800 underline cursor-pointer"
              >
                Sample Q&amp;A Pairs
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw curriculum content here... Format will be automatically detected!"
            className="w-full p-4 rounded-2xl bg-yellow-50/50 border border-yellow-300 text-xs text-slate-900 font-mono-code focus:outline-none focus:ring-2 focus:ring-yellow-400 leading-relaxed"
          />

          <button
            onClick={() => parseTextContent(rawText)}
            disabled={!rawText.trim()}
            className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            Auto-Detect &amp; Mount Interactive Player
          </button>
        </div>
      )}

      {/* Tab 3: Paste CSV Table */}
      {activeImportTab === 'csv' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
            <span>Paste CSV Data (e.g. Label, Value or Term, Definition):</span>
            <button
              onClick={() =>
                setRawText(
                  `Component,Parameters\nQuery Weights W_q,25\nKey Weights W_k,25\nValue Weights W_v,25\nFeedForward Linear 1,80\nFeedForward Linear 2,80`
                )
              }
              className="text-[11px] text-amber-800 underline cursor-pointer"
            >
              Insert Sample CSV
            </button>
          </div>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Label, Value\nItem 1, 10\nItem 2, 25..."
            className="w-full p-4 rounded-2xl bg-yellow-50/50 border border-yellow-300 text-xs text-slate-900 font-mono-code focus:outline-none focus:ring-2 focus:ring-yellow-400 leading-relaxed"
          />

          <button
            onClick={() => parseCsvContent(rawText)}
            disabled={!rawText.trim()}
            className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            Convert CSV to Interactive Chart or Flashcards
          </button>
        </div>
      )}

      {/* Tab 4: Video Link */}
      {activeImportTab === 'media' && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">
            Enter Video or Audio Stream URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-yellow-50/50 border border-yellow-300 text-xs text-slate-900 font-mono-code focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={handleMediaSubmit}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer shrink-0"
            >
              Mount Interactive Video
            </button>
          </div>
        </div>
      )}

      {/* Engine Status Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono-code font-bold flex items-center justify-between ${
            statusMessage.startsWith('✓')
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage('')}
            className="text-[10px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
