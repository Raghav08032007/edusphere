'use client';

import React, { useState, useMemo } from 'react';
import katex from 'katex';

interface ReferenceSource {
  title: string;
  source: string;
  url: string;
  description: string;
}

interface MathMarkdownRendererProps {
  content: string;
  title?: string;
  author?: string;
  publishedDate?: string;
  externalSources?: ReferenceSource[];
  className?: string;
}

export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({
  content,
  title,
  author,
  publishedDate,
  externalSources,
  className = '',
}) => {
  const [activeViewSource, setActiveViewSource] = useState<'rendered' | 'breakdown' | 'latex' | 'sources'>('rendered');
  const [copiedMath, setCopiedMath] = useState<string | null>(null);

  // Helper to safely render LaTeX with KaTeX
  const renderMathToHtml = (math: string, displayMode: boolean) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      console.warn('KaTeX render error:', e);
      return `<code class="text-rose-600">${math}</code>`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMath(text);
    setTimeout(() => setCopiedMath(null), 2500);
  };

  // Pre-configured academic reference fallback if none provided
  const sources: ReferenceSource[] = useMemo(() => {
    if (externalSources && externalSources.length > 0) return externalSources;
    if (content.includes('Attention') || content.includes('softmax')) {
      return [
        {
          title: 'Attention Is All You Need (Original Transformer Paper)',
          source: 'arXiv:1706.03762',
          url: 'https://arxiv.org/abs/1706.03762',
          description: 'Vaswani et al. (2017) introducing the Scaled Dot-Product Attention mechanism and Multi-Head projection.',
        },
        {
          title: 'The Illustrated Transformer',
          source: 'Jay Alammar Research',
          url: 'https://jalammar.github.io/illustrated-transformer/',
          description: 'Visual step-by-step mathematical guide to query, key, value matrix multiplication and softmax normalization.',
        },
        {
          title: 'Stanford CS224N: Natural Language Processing with Deep Learning',
          source: 'Stanford University',
          url: 'https://web.stanford.edu/class/cs224n/',
          description: 'Formal derivation of variance explosion in high dimensions when computing dot-products without sqrt(d_k).',
        },
      ];
    }
    if (content.includes('Slit') || content.includes('Interference') || content.includes('Fringe')) {
      return [
        {
          title: 'Feynman Lectures on Physics, Vol. I & III: Interference & Wave Optics',
          source: 'Caltech / Feynman Lectures',
          url: 'https://www.feynmanlectures.caltech.edu/III_01.html',
          description: 'Fundamental mathematical analysis of two-slit wave superposition, path difference, and coherence length.',
        },
        {
          title: 'MIT 8.03SC: Physics III - Vibrations and Waves',
          source: 'MIT OpenCourseWare',
          url: 'https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/',
          description: 'Rigorous derivation of geometric path difference Delta x = d sin(theta) and constructive fringe spacing beta.',
        },
        {
          title: 'PhET Interactive Simulation: Wave Interference & Double Slit',
          source: 'University of Colorado Boulder',
          url: 'https://phet.colorado.edu/en/simulations/wave-interference',
          description: 'Real-time interactive physical simulator allowing adjustment of slit spacing (d) and screen distance (D).',
        },
      ];
    }
    return [
      {
        title: 'MIT OpenCourseWare Open STEM Library',
        source: 'MIT OCW',
        url: 'https://ocw.mit.edu/',
        description: 'Peer-reviewed curriculum lecture notes, problem sets, and mathematical proofs across mathematics and science.',
      },
      {
        title: 'OpenAlex Scholarly Graph',
        source: 'OpenAlex',
        url: 'https://openalex.org/',
        description: 'Comprehensive open index of global scientific research papers, citation networks, and open-access publications.',
      },
    ];
  }, [content, externalSources]);

  // Extract key mathematical equations for the derivation & plain english breakdown
  const extractedEquations = useMemo(() => {
    const list: { formula: string; title: string; explanation: string; variables: { sym: string; meaning: string }[] }[] = [];

    if (content.includes('Attention') || content.includes('d_k')) {
      list.push({
        title: 'Matrix Projection into Query, Key, and Value Spaces',
        formula: 'Q = X W^Q, \\quad K = X W^K, \\quad V = X W^V',
        explanation: 'Input token embedding matrix X is multiplied by three independently learned weight matrices to project tokens into task-specific spaces.',
        variables: [
          { sym: 'X', meaning: 'Input sequence matrix of shape (N x d_model), where N is sequence length' },
          { sym: 'W^Q, W^K', meaning: 'Projection matrices mapping input to query and key dimensions d_k' },
          { sym: 'W^V', meaning: 'Value projection matrix determining the payload vector dimensions d_v' },
        ],
      });
      list.push({
        title: 'Scaled Dot-Product Operator',
        formula: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V',
        explanation: 'Computes compatibility scores between each query and all keys. Scaling by sqrt(d_k) stabilizes the softmax denominator to prevent vanishing gradients.',
        variables: [
          { sym: 'Q K^T', meaning: 'Dot-product affinity matrix measuring pairwise token similarity' },
          { sym: '\\sqrt{d_k}', meaning: 'Scaling factor equal to square-root of key dimensionality, preventing exponential saturation' },
          { sym: '\\text{softmax}(\\cdot)', meaning: 'Normalizes raw dot-product logits into probability distribution summing to 1.0' },
          { sym: 'V', meaning: 'Value matrix blended by the computed attention weight probabilities' },
        ],
      });
      list.push({
        title: 'Variance Stabilization Proof',
        formula: '\\text{Var}(q \\cdot k) = \\sum_{i=1}^{d_k} \\text{Var}(q_i k_i) = d_k',
        explanation: 'When independent components q_i and k_i have unit variance, their inner product has variance d_k. Dividing by sqrt(d_k) restores variance to exactly 1.',
        variables: [
          { sym: 'q_i, k_i', meaning: 'Components of query and key unit vectors with zero mean E[x]=0 and Var(x)=1' },
          { sym: 'd_k', meaning: 'Dimensionality causing variance to scale linearly without normalization' },
        ],
      });
    }

    if (content.includes('Slit') || content.includes('\\Delta x') || content.includes('\\beta')) {
      list.push({
        title: 'Geometric Path Difference in Two-Slit Interference',
        formula: '\\Delta x = d \\sin\\theta \\approx d \\frac{y}{D}',
        explanation: 'Because screen distance D is vastly larger than slit separation d, the angular rays are nearly parallel, creating path difference d*sin(theta).',
        variables: [
          { sym: '\\Delta x', meaning: 'Path difference between light waves arriving at point P from slits S1 and S2' },
          { sym: 'd', meaning: 'Physical separation distance between the two coherent pinhole slits' },
          { sym: 'D', meaning: 'Distance from the double-slit aperture plane to the detection screen (D >> d)' },
          { sym: 'y', meaning: 'Linear displacement on screen measured from the central maximum origin' },
        ],
      });
      list.push({
        title: 'Constructive vs Destructive Condition',
        formula: 'y_n = \\frac{n \\lambda D}{d}, \\quad y\'_n = \\left(n + \\frac{1}{2}\\right)\\frac{\\lambda D}{d}',
        explanation: 'Bright maxima appear when path difference is an integer multiple of wavelength; dark minima occur at half-integer multiples.',
        variables: [
          { sym: 'n', meaning: 'Integer order of interference fringe (0, 1, 2, ...)' },
          { sym: '\\lambda', meaning: 'Wavelength of monochromatic coherent illumination light' },
          { sym: 'y_n', meaning: 'Distance of the n-th bright fringe from the central maximum' },
        ],
      });
      list.push({
        title: 'Fringe Width (Fringe Separation Spacing)',
        formula: '\\beta = y_{n+1} - y_n = \\frac{\\lambda D}{d}',
        explanation: 'The separation between consecutive bright bands is constant across the interference pattern, inversely proportional to slit width d.',
        variables: [
          { sym: '\\beta', meaning: 'Linear fringe width (distance between two consecutive bright or dark fringes)' },
        ],
      });
    }

    return list;
  }, [content]);

  // Main parser for rendered view
  const renderFormattedBlocks = (text: string) => {
    // Split by code blocks first
    const codeSegments = text.split(/(```[\s\S]*?```)/g);

    return codeSegments.map((segment, segIdx) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const rawCode = segment.slice(3, -3).trim();
        const firstLineBreak = rawCode.indexOf('\n');
        let code = rawCode;
        if (firstLineBreak !== -1 && !rawCode.slice(0, firstLineBreak).includes(' ')) {
          code = rawCode.slice(firstLineBreak + 1);
        }
        return (
          <div key={segIdx} className="my-5 rounded-2xl bg-slate-900 border border-slate-700/80 p-4 shadow-lg overflow-x-auto text-xs font-mono-code relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-yellow-300 font-bold">
              <span>ALGORITHMIC / FORMULATION CODE</span>
              <button
                onClick={() => copyToClipboard(code)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-yellow-300 transition-colors"
              >
                {copiedMath === code ? '✓ Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="text-amber-200 leading-relaxed overflow-x-auto">{code}</pre>
          </div>
        );
      }

      // Process display math blocks: $$...$$ or \[...\]
      const displayMathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
      const mathBlocks = segment.split(displayMathRegex);

      return (
        <div key={segIdx} className="space-y-4">
          {mathBlocks.map((block, bIdx) => {
            if ((block.startsWith('$$') && block.endsWith('$$')) || (block.startsWith('\\[') && block.endsWith('\\]'))) {
              const cleanFormula = block.startsWith('$$') ? block.slice(2, -2) : block.slice(2, -2);
              const html = renderMathToHtml(cleanFormula, true);

              return (
                <div
                  key={bIdx}
                  className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-amber-500/10 border-2 border-amber-300/80 shadow-sm relative group overflow-x-auto"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full font-mono-code">
                      Formula Specification
                    </span>
                    <button
                      onClick={() => copyToClipboard(cleanFormula)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-white px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs"
                      title="Copy LaTeX source"
                    >
                      {copiedMath === cleanFormula ? '✓ Copied LaTeX' : 'Copy LaTeX'}
                    </button>
                  </div>
                  <div
                    className="overflow-x-auto py-2 text-center text-slate-900 leading-normal"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              );
            }

            // Normal markdown lines with headings, lists, bold, and inline math
            const lines = block.split('\n');
            return (
              <div key={bIdx} className="space-y-3">
                {lines.map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2 key={lIdx} className="font-adorn text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-2 border-b-2 border-amber-200 pb-2">
                        {trimmed.replace('## ', '')}
                      </h2>
                    );
                  }

                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={lIdx} className="font-adorn text-lg sm:text-xl font-bold text-amber-900 mt-5 mb-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {trimmed.replace('### ', '')}
                      </h3>
                    );
                  }

                  // Check if line itself is a raw LaTeX formula without $$ delimiters
                  const isRawEquationLine =
                    (trimmed.includes(' = ') && (trimmed.includes('\\') || trimmed.includes('^') || trimmed.includes('_'))) ||
                    trimmed.startsWith('Q =') ||
                    trimmed.startsWith('\\text{Attention}') ||
                    trimmed.startsWith('\\mathbb{E}') ||
                    trimmed.startsWith('z = q') ||
                    trimmed.startsWith('\\Delta x =') ||
                    trimmed.startsWith('\\beta =');

                  if (isRawEquationLine) {
                    const html = renderMathToHtml(trimmed, true);
                    return (
                      <div
                        key={lIdx}
                        className="my-3 p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300/80 shadow-xs relative group overflow-x-auto text-center"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono-code">
                            Mathematical Formulation
                          </span>
                          <button
                            onClick={() => copyToClipboard(trimmed)}
                            className="text-[10px] text-amber-800 hover:text-amber-950 px-2 py-0.5 rounded bg-white border border-amber-200"
                          >
                            {copiedMath === trimmed ? '✓ Copied' : 'Copy LaTeX'}
                          </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: html }} className="py-1 text-slate-950" />
                      </div>
                    );
                  }

                  // Bullet points
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const bulletText = trimmed.replace(/^[-*]\s+/, '');
                    return (
                      <div key={lIdx} className="flex items-start gap-3 pl-2 text-slate-800 text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <div className="flex-1">{parseInlineMath(bulletText)}</div>
                      </div>
                    );
                  }

                  // Standard paragraph with inline math
                  return (
                    <p key={lIdx} className="text-slate-800 text-sm sm:text-base leading-relaxed">
                      {parseInlineMath(trimmed)}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    });
  };

  // Parse inline $...$ or bold **...**
  const parseInlineMath = (text: string) => {
    // First tokenize by $...$
    const parts = text.split(/(\$[^\$]+?\$)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1);
        const html = renderMathToHtml(formula, false);
        return (
          <span
            key={idx}
            className="inline-block px-1 py-0.5 mx-0.5 rounded bg-amber-50 border border-amber-200 text-slate-900 font-serif"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      // Handle bold **text**
      const boldParts = part.split(/(\*\*[^\*]+?\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={bIdx} className="font-extrabold text-slate-950">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return <span key={bIdx}>{bPart}</span>;
      });
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Multi-Source Perspective Toolbar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white border-2 border-yellow-300 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 font-black text-xs uppercase tracking-wider font-mono-code shadow-2xs">
            📐 STEM Formula Studio
          </span>
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            Multi-Source Perspective
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-yellow-100/70 p-1 rounded-2xl border border-yellow-200">
          <button
            onClick={() => setActiveViewSource('rendered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewSource === 'rendered'
                ? 'bg-yellow-400 text-yellow-950 shadow-xs'
                : 'text-slate-700 hover:bg-yellow-200/60'
            }`}
          >
            <span>✨</span> Formatted (KaTeX)
          </button>

          <button
            onClick={() => setActiveViewSource('breakdown')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewSource === 'breakdown'
                ? 'bg-yellow-400 text-yellow-950 shadow-xs'
                : 'text-slate-700 hover:bg-yellow-200/60'
            }`}
          >
            <span>💡</span> Plain English Breakdown
          </button>

          <button
            onClick={() => setActiveViewSource('latex')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewSource === 'latex'
                ? 'bg-yellow-400 text-yellow-950 shadow-xs'
                : 'text-slate-700 hover:bg-yellow-200/60'
            }`}
          >
            <span>📄</span> LaTeX Source
          </button>

          <button
            onClick={() => setActiveViewSource('sources')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewSource === 'sources'
                ? 'bg-yellow-400 text-yellow-950 shadow-xs'
                : 'text-slate-700 hover:bg-yellow-200/60'
            }`}
          >
            <span>🔗</span> Verified Papers &amp; Links
          </button>
        </div>
      </div>

      {/* View Source 1: Rendered Formatted Math with KaTeX */}
      {activeViewSource === 'rendered' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-200 shadow-sm space-y-6">
          {title && (
            <div className="border-b border-yellow-100 pb-4">
              <h1 className="font-adorn text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {title}
              </h1>
              {(author || publishedDate) && (
                <p className="text-xs text-slate-500 mt-1 font-mono-code">
                  {author && <>Published by <strong>{author}</strong></>}
                  {publishedDate && <> • {publishedDate}</>}
                </p>
              )}
            </div>
          )}

          <div className="prose prose-slate max-w-none text-slate-800">
            {renderFormattedBlocks(content)}
          </div>
        </div>
      )}

      {/* View Source 2: Plain English Breakdown & Derivation Intuition */}
      {activeViewSource === 'breakdown' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-yellow-100 pb-4">
            <h2 className="font-adorn text-2xl font-black text-slate-900">
              Plain English Mathematical Breakdown
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Deconstructed symbol-by-symbol explanations to understand the physical and theoretical intuition behind each formula.
            </p>
          </div>

          <div className="space-y-6">
            {extractedEquations.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-yellow-50/60 border border-yellow-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-adorn text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    {item.title}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(item.formula)}
                    className="text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-xl border border-yellow-300 shadow-2xs hover:bg-yellow-100 transition-colors"
                  >
                    {copiedMath === item.formula ? '✓ Copied' : 'Copy LaTeX'}
                  </button>
                </div>

                <div
                  className="py-3 text-center bg-white rounded-xl border border-yellow-100 shadow-inner overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: renderMathToHtml(item.formula, true) }}
                />

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  <strong>Concept in plain terms:</strong> {item.explanation}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-yellow-200 rounded-xl overflow-hidden bg-white">
                    <thead className="bg-yellow-100 text-yellow-950 font-mono-code font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 border-b border-yellow-200 w-24">Symbol</th>
                        <th className="p-2.5 border-b border-yellow-200">Plain English Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-100">
                      {item.variables.map((v, vIdx) => (
                        <tr key={vIdx} className="hover:bg-yellow-50/50">
                          <td className="p-2.5 font-serif font-bold text-slate-900" dangerouslySetInnerHTML={{ __html: renderMathToHtml(v.sym, false) }} />
                          <td className="p-2.5 text-slate-700">{v.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Source 3: Raw LaTeX Source Code for Academic Papers */}
      {activeViewSource === 'latex' && (
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-yellow-400 text-xs font-mono-code uppercase tracking-wider font-bold">
                Publication Overleaf / LaTeX Snippet
              </span>
              <h2 className="text-white font-adorn text-xl font-bold mt-1">
                Raw LaTeX Document Markup
              </h2>
            </div>
            <button
              onClick={() => copyToClipboard(content)}
              className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              {copiedMath === content ? '✓ Full Document Copied' : 'Copy All LaTeX'}
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-slate-900 text-amber-200 font-mono-code text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800">
            {content}
          </pre>
        </div>
      )}

      {/* View Source 4: Academic Reference Sources & Citations */}
      {activeViewSource === 'sources' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-300 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-yellow-100 pb-4">
            <h2 className="font-adorn text-2xl font-black text-slate-900">
              Verified Primary Sources &amp; Interactive References
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Explore external university papers, peer-reviewed publications, and interactive web simulators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="group p-5 rounded-2xl bg-yellow-50/50 hover:bg-yellow-100/60 border border-yellow-200 hover:border-yellow-400 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-200 text-yellow-900 font-mono-code">
                      {src.source}
                    </span>
                    <span className="text-slate-400 group-hover:text-amber-600 transition-colors">↗</span>
                  </div>
                  <h3 className="font-adorn text-base font-bold text-slate-900 group-hover:text-amber-900 leading-snug">
                    {src.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {src.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-yellow-200/60 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <span>Open Primary Source</span>
                  <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
