'use client';

import React, { useState, useRef, useEffect } from 'react';

type ToolType = 'pen' | 'line' | 'rect' | 'circle' | 'eraser';

export const AcademicWhiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [brushColor, setBrushColor] = useState<string>('#0f172a');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);

  const colors = [
    { label: 'Obsidian', hex: '#0f172a' },
    { label: 'Amber Gold', hex: '#d97706' },
    { label: 'Crimson', hex: '#dc2626' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Royal Blue', hex: '#2563eb' },
    { label: 'Violet', hex: '#7c3aed' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Save initial state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  }, []);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    startPos.current = coords;

    // Snapshot before previewing shapes
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
    ctx.fillStyle = brushColor;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      // For shapes, restore snapshot to preview
      if (snapshot.current) {
        ctx.putImageData(snapshot.current, 0, 0);
      }
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = brushColor;

      if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (currentTool === 'rect') {
        const width = coords.x - startPos.current.x;
        const height = coords.y - startPos.current.y;
        ctx.beginPath();
        ctx.strokeRect(startPos.current.x, startPos.current.y, width, height);
      } else if (currentTool === 'circle') {
        const radius = Math.hypot(coords.x - startPos.current.x, coords.y - startPos.current.y);
        ctx.beginPath();
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), currentImg]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const cleared = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, cleared]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `edusphere-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-yellow-50 via-amber-50 to-white border-2 border-yellow-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 font-mono-code shadow-2xs">
              🎨 Academic Whiteboard
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Derivations, Vectors &amp; Freehand Sketching
            </span>
          </div>
          <h2 className="font-adorn text-2xl sm:text-3xl font-black text-slate-900">
            STEM Virtual Collaborative Whiteboard
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Sketch diagrams, write formulas with a mouse or stylus, plot geometric figures, and export high-resolution notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-yellow-100 border border-yellow-300 text-slate-800 text-xs font-bold transition-all shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            ↩ Undo
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            🗑️ Clear
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-yellow-300 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥</span> Export PNG
          </button>
        </div>
      </div>

      {/* Toolbar & Canvas Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-yellow-300 shadow-lg space-y-4">
        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-yellow-50/70 rounded-2xl border border-yellow-200">
          {/* Tool Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-yellow-300 shadow-2xs">
            {[
              { id: 'pen', label: '✏️ Pen' },
              { id: 'line', label: '📏 Line' },
              { id: 'rect', label: '▢ Rect' },
              { id: 'circle', label: '◯ Circle' },
              { id: 'eraser', label: '🧹 Eraser' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setCurrentTool(t.id as ToolType)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentTool === t.id
                    ? 'bg-yellow-400 text-yellow-950 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:bg-yellow-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 font-mono-code">Size:</span>
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                  brushSize === size
                    ? 'bg-yellow-400 border-yellow-500 text-slate-950 font-black'
                    : 'bg-white border-yellow-200 text-slate-600 hover:bg-yellow-100'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>

          {/* Palette Colors */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 font-mono-code mr-1">Ink:</span>
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setBrushColor(c.hex);
                  if (currentTool === 'eraser') setCurrentTool('pen');
                }}
                style={{ backgroundColor: c.hex }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                  brushColor === c.hex && currentTool !== 'eraser'
                    ? 'ring-3 ring-yellow-400 scale-125'
                    : 'hover:scale-110'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Drawing Surface */}
        <div className="relative w-full h-[540px] rounded-2xl border-2 border-dashed border-yellow-300 bg-white overflow-hidden shadow-inner cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            className="w-full h-full block touch-none"
          />
        </div>
      </div>
    </div>
  );
};
