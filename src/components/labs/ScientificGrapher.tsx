'use client';

import React, { useState, useRef, useEffect } from 'react';

export const ScientificGrapher: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<'ydse' | 'softmax'>('ydse');

  // YDSE Parameters
  const [wavelengthNm, setWavelengthNm] = useState<number>(550); // 550nm green light
  const [slitSeparationMm, setSlitSeparationMm] = useState<number>(0.2); // 0.2 mm
  const [screenDistanceM, setScreenDistanceM] = useState<number>(1.2); // 1.2 meters

  // Softmax Parameters
  const [temperature, setTemperature] = useState<number>(1.0);
  const [logits, setLogits] = useState<number[]>([2.5, 1.2, 0.4, 3.1, -0.8]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Computed Fringe Width: beta = lambda * D / d
  const lambdaMeters = wavelengthNm * 1e-9;
  const dMeters = slitSeparationMm * 1e-3;
  const fringeWidthMm = (lambdaMeters * screenDistanceM / dMeters) * 1e3;

  // Render optical simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (activeSimulation === 'ydse') {
      // Background
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Axis
      const centerY = height * 0.45;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Plot Intensity Curve: I(y) = I_0 * cos^2(pi * d * y / (lambda * D))
      ctx.beginPath();
      ctx.lineWidth = 3;

      // Color mapping according to wavelength
      let waveColor = '#22c55e'; // default green
      if (wavelengthNm < 450) waveColor = '#818cf8'; // violet/blue
      else if (wavelengthNm < 500) waveColor = '#06b6d4'; // cyan
      else if (wavelengthNm < 580) waveColor = '#eab308'; // yellow/green
      else if (wavelengthNm < 620) waveColor = '#f97316'; // orange
      else waveColor = '#ef4444'; // red

      ctx.strokeStyle = waveColor;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 10;

      const scaleY = height * 0.35;
      const physicalRangeMm = 20; // -10mm to +10mm visible range

      for (let px = 0; px < width; px++) {
        const yMm = ((px - width / 2) / (width / 2)) * (physicalRangeMm / 2);
        const yMeters = yMm * 1e-3;
        const phase = (Math.PI * dMeters * yMeters) / (lambdaMeters * screenDistanceM);
        const intensity = Math.pow(Math.cos(phase), 2);

        // Apply single-slit diffraction envelope approximation
        const alpha = (Math.PI * (dMeters / 4) * yMeters) / (lambdaMeters * screenDistanceM);
        const diffraction = alpha === 0 ? 1 : Math.pow(Math.sin(alpha) / alpha, 2);
        const finalIntensity = intensity * diffraction;

        const py = centerY - finalIntensity * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Bottom: Physical Optical Screen Simulated Bar
      const screenBarTop = height * 0.82;
      const screenBarHeight = height * 0.12;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, screenBarTop, width, screenBarHeight);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(0, screenBarTop, width, screenBarHeight);

      for (let px = 0; px < width; px++) {
        const yMm = ((px - width / 2) / (width / 2)) * (physicalRangeMm / 2);
        const yMeters = yMm * 1e-3;
        const phase = (Math.PI * dMeters * yMeters) / (lambdaMeters * screenDistanceM);
        const intensity = Math.pow(Math.cos(phase), 2);

        ctx.fillStyle = waveColor;
        ctx.globalAlpha = Math.max(0.02, Math.min(1.0, intensity));
        ctx.fillRect(px, screenBarTop, 1, screenBarHeight);
      }
      ctx.globalAlpha = 1.0;

      // Annotations
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Central Axis (y=0)', width / 2 - 50, centerY + 20);
      ctx.fillText(`Computed Fringe Width (β): ${fringeWidthMm.toFixed(3)} mm`, 20, 30);
      ctx.fillText('Physical Detector Screen (Fringe Intensity Bands):', 20, screenBarTop - 8);
    } else {
      // Softmax Temperature Simulation
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      const scaledLogits = logits.map((l) => l / Math.max(0.05, temperature));
      const expVals = scaledLogits.map((l) => Math.exp(l));
      const sumExp = expVals.reduce((a, b) => a + b, 0);
      const probabilities = expVals.map((e) => e / sumExp);

      const barWidth = 60;
      const spacing = (width - logits.length * barWidth) / (logits.length + 1);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Softmax Probability Distribution (Temperature τ = ${temperature.toFixed(2)})`, 20, 30);

      probabilities.forEach((prob, idx) => {
        const x = spacing + idx * (barWidth + spacing);
        const barHeight = prob * (height * 0.6);
        const y = height * 0.75 - barHeight;

        // Gradient bar
        const grad = ctx.createLinearGradient(0, y, 0, height * 0.75);
        grad.addColorStop(0, '#fbbf24');
        grad.addColorStop(1, '#d97706');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Labels
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${(prob * 100).toFixed(1)}%`, x + 10, y - 8);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Token ${idx + 1}`, x + 6, height * 0.82);
        ctx.fillText(`z=${logits[idx]}`, x + 8, height * 0.88);
      });
    }
  }, [activeSimulation, wavelengthNm, slitSeparationMm, screenDistanceM, temperature, logits, fringeWidthMm]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-yellow-50 via-amber-50 to-white border-2 border-yellow-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-yellow-950 font-mono-code shadow-2xs">
              📈 STEM Scientific Visualizer
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Real-Time Dynamic Wave &amp; Distribution Engine
            </span>
          </div>
          <h2 className="font-adorn text-2xl sm:text-3xl font-black text-slate-900">
            Interactive Physics &amp; Mathematics Grapher
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Simulate wave interference distributions and softmax entropy scaling with live parameter sliders.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-yellow-100 p-1.5 rounded-2xl border border-yellow-300">
          <button
            onClick={() => setActiveSimulation('ydse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSimulation === 'ydse'
                ? 'bg-yellow-400 text-slate-950 shadow-xs'
                : 'text-slate-700 hover:bg-yellow-200'
            }`}
          >
            🌊 YDSE Wave Optics
          </button>
          <button
            onClick={() => setActiveSimulation('softmax')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSimulation === 'softmax'
                ? 'bg-yellow-400 text-slate-950 shadow-xs'
                : 'text-slate-700 hover:bg-yellow-200'
            }`}
          >
            🧠 Softmax Temperature
          </button>
        </div>
      </div>

      {/* Main Graph & Sliders Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-5 border-2 border-yellow-400 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-yellow-400 font-mono-code uppercase tracking-wider">
              {activeSimulation === 'ydse'
                ? "Young's Double Slit Intensity Profile I(y)"
                : 'Probability Softmax Distribution P(y_i)'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-code">
              60 FPS Real-Time Render
            </span>
          </div>

          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full block"
            />
          </div>
        </div>

        {/* Live Controls Sidebar */}
        <div className="bg-white rounded-3xl p-6 border-2 border-yellow-300 shadow-sm space-y-5">
          <h3 className="font-adorn text-xl font-black text-slate-900 border-b border-yellow-100 pb-2">
            Parameter Controls
          </h3>

          {activeSimulation === 'ydse' ? (
            <div className="space-y-4">
              {/* Wavelength Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono-code font-bold text-slate-700">
                  <span>Wavelength (λ):</span>
                  <span className="text-amber-800">{wavelengthNm} nm</span>
                </div>
                <input
                  type="range"
                  min={380}
                  max={750}
                  step={5}
                  value={wavelengthNm}
                  onChange={(e) => setWavelengthNm(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">
                  380nm (Violet) &rarr; 750nm (Red)
                </span>
              </div>

              {/* Slit Distance d */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono-code font-bold text-slate-700">
                  <span>Slit Separation (d):</span>
                  <span className="text-amber-800">{slitSeparationMm.toFixed(2)} mm</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.8}
                  step={0.02}
                  value={slitSeparationMm}
                  onChange={(e) => setSlitSeparationMm(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Screen Distance D */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono-code font-bold text-slate-700">
                  <span>Screen Distance (D):</span>
                  <span className="text-amber-800">{screenDistanceM.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={3.0}
                  step={0.1}
                  value={screenDistanceM}
                  onChange={(e) => setScreenDistanceM(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Computed Fringe Summary Card */}
              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 space-y-1.5 font-mono-code text-xs">
                <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] block">
                  Derivation Result:
                </span>
                <p className="text-slate-800">
                  <strong>Fringe Spacing (β):</strong> {fringeWidthMm.toFixed(3)} mm
                </p>
                <p className="text-[11px] text-slate-600">
                  Formula: β = (λ · D) / d
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono-code font-bold text-slate-700">
                  <span>Temperature (τ):</span>
                  <span className="text-amber-800">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Lower &rarr; sharp argmax | Higher &rarr; uniform flat
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block font-mono-code uppercase text-[10px]">
                  Theoretical Observation:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  Notice that as temperature τ &rarr; 0, the probability of the highest logit spikes toward 1.0 (deterministic mode). As τ increases, entropy expands and the distribution flattens uniformly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
