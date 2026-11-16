'use client';

import React, { useState } from 'react';

interface DocumentNote {
  id: string;
  page: number;
  highlightText: string;
  note: string;
  timestamp: string;
}

const SAMPLE_DOCS = [
  {
    id: 'doc-attention',
    title: 'Attention Is All You Need — Vaswani et al. (2017)',
    pages: 3,
    subject: 'Artificial Intelligence',
    contentByPage: [
      {
        page: 1,
        heading: 'Section 1: Introduction & Scaled Dot-Product Attention',
        body: `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.

The Scaled Dot-Product Attention:
We compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed into matrices K and V.
Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V.`,
      },
      {
        page: 2,
        heading: 'Section 2: Multi-Head Attention Mechanism',
        body: `Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) W^O
where head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V).

Where the projections are parameter matrices:
W_i^Q in R^{d_model x d_k}, W_i^K in R^{d_model x d_k}, W_i^V in R^{d_model x d_v} and W^O in R^{h d_v x d_model}. In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64.`,
      },
      {
        page: 3,
        heading: 'Section 3: Computational Complexity & Positional Encoding',
        body: `To allow the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add "positional encodings" to the input embeddings at the bottoms of the encoder and decoder stacks.

PE_(pos, 2i) = sin(pos / 10000^{2i/d_model})
PE_(pos, 2i+1) = cos(pos / 10000^{2i/d_model})

Complexity per layer:
Self-Attention has per-layer complexity O(n^2 * d) while Recurrent layers require O(n * d^2) sequential operations.`,
      },
    ],
  },
  {
    id: 'doc-optics',
    title: "Young's Double Slit & Wave Interference — Royal Society (1801)",
    pages: 2,
    subject: 'Classical Physics',
    contentByPage: [
      {
        page: 1,
        heading: 'Section 1: Principle of Wave Superposition',
        body: `When two portions of the same light arrive at an eye by different routes, either exactly or nearly in the same direction, the light is at its maximum intensity when the difference of the routes is any multiple of a certain length, and at its minimum intensity in the intermediate state of the half-multiples.

Let d denote the distance separating the two pinhole apertures and D denote the normal distance to the screen. Because D is significantly larger than d, the angular separation theta satisfies:
Delta x = d * sin(theta) approximately equals d * (y / D).`,
      },
      {
        page: 2,
        heading: 'Section 2: Fringe Separation and Wavelength Derivation',
        body: `Consecutive bright bands occur when:
Delta x = n * lambda, yielding y_n = n * lambda * D / d.
The linear distance between successive maxima constitutes the fringe width beta:
beta = y_{n+1} - y_n = lambda * D / d.

Measuring fringe width beta alongside slit separation d and screen distance D allows direct empirical calculation of the wavelength of light.`,
      },
    ],
  },
];

export const PdfAnnotationStudio: React.FC = () => {
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [annotations, setAnnotations] = useState<DocumentNote[]>([
    {
      id: 'ann-1',
      page: 1,
      highlightText: 'Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V',
      note: 'Crucial equation for Transformer quiz question #2.',
      timestamp: 'Today, 10:14 AM',
    },
  ]);
  const [newNoteInput, setNewNoteInput] = useState<string>('');

  const currentDoc = SAMPLE_DOCS[selectedDocIndex];
  const pageData = currentDoc.contentByPage.find((p) => p.page === currentPage) || currentDoc.contentByPage[0];

  const handleAddAnnotation = () => {
    if (!newNoteInput.trim()) return;
    const newNote: DocumentNote = {
      id: `ann-${Date.now()}`,
      page: currentPage,
      highlightText: `Page ${currentPage}: Note on ${pageData.heading.slice(0, 30)}...`,
      note: newNoteInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAnnotations((prev) => [newNote, ...prev]);
    setNewNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-yellow-50 via-amber-50 to-white border-2 border-yellow-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 font-mono-code shadow-2xs">
              📄 Research Document &amp; PDF Studio
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Multi-Page Handout Viewer &amp; Annotation Drawer
            </span>
          </div>
          <h2 className="font-adorn text-2xl sm:text-3xl font-black text-slate-900">
            Document Reader &amp; Annotator
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Browse course lecture notes, flip through multi-page papers, highlight passages, and keep private study annotations.
          </p>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2 bg-yellow-100 p-1.5 rounded-2xl border border-yellow-300">
          {SAMPLE_DOCS.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDocIndex(idx);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDocIndex === idx
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'text-slate-700 hover:bg-yellow-200'
              }`}
            >
              {idx === 0 ? '🤖 Vaswani 2017' : '🌊 Young 1801'}
            </button>
          ))}
        </div>
      </div>

      {/* Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer Frame */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-md space-y-4 flex flex-col justify-between min-h-[580px]">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-yellow-200 text-yellow-900 font-mono-code">
                {currentDoc.subject}
              </span>
              <span className="text-xs font-bold text-slate-700 truncate max-w-xs">
                {currentDoc.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-xl border border-yellow-200 text-xs font-mono-code font-bold">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(80, z - 15))}
                  className="px-1 text-slate-700 hover:text-black cursor-pointer"
                >
                  -
                </button>
                <span>{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(140, z + 15))}
                  className="px-1 text-slate-700 hover:text-black cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Page Navigator */}
              <div className="flex items-center gap-1 text-xs font-mono-code font-bold">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-200 disabled:opacity-40 cursor-pointer"
                >
                  ←
                </button>
                <span>
                  {currentPage} / {currentDoc.pages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(currentDoc.pages, p + 1))}
                  disabled={currentPage >= currentDoc.pages}
                  className="px-2.5 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-200 disabled:opacity-40 cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Document Content Sheet */}
          <div
            style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
            className="flex-1 p-6 rounded-2xl bg-amber-50/20 border border-yellow-200/80 space-y-4 shadow-inner overflow-y-auto leading-relaxed text-slate-800"
          >
            <h3 className="font-adorn font-black text-xl text-slate-900 border-b border-yellow-200/60 pb-2">
              {pageData.heading}
            </h3>
            <p className="whitespace-pre-line font-serif leading-loose">
              {pageData.body}
            </p>
          </div>

          {/* Page Footer */}
          <div className="pt-3 border-t border-yellow-100 flex items-center justify-between text-[11px] text-slate-500 font-mono-code">
            <span>Official University Digital Library Asset</span>
            <span>Page {currentPage} of {currentDoc.pages}</span>
          </div>
        </div>

        {/* Right 1 Col: Notes & Annotations Drawer */}
        <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-md space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-100 pb-3">
              <h3 className="font-adorn text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <span>📝</span> Study Annotations
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-950 text-[10px] font-bold font-mono-code">
                {annotations.length} Notes
              </span>
            </div>

            {/* Add note input */}
            <div className="space-y-2">
              <textarea
                placeholder={`Add a study note for Page ${currentPage}...`}
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-yellow-50/60 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xs text-slate-900 leading-relaxed"
              />
              <button
                onClick={handleAddAnnotation}
                disabled={!newNoteInput.trim()}
                className="w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-all shadow-xs disabled:opacity-40 cursor-pointer"
              >
                + Pin Note to Page {currentPage}
              </button>
            </div>

            {/* List of saved notes */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setCurrentPage(ann.page)}
                  className="p-3 rounded-xl bg-yellow-50/70 hover:bg-yellow-100/70 border border-yellow-200 transition-colors cursor-pointer space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono-code">
                    <span className="font-bold text-amber-900">Page {ann.page}</span>
                    <span>{ann.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{ann.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-yellow-100 text-[10px] text-slate-400 font-mono-code">
            Auto-saved locally in browser session
          </div>
        </div>
      </div>
    </div>
  );
};
