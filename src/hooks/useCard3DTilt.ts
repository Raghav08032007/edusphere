'use client';

import { useState, useRef, useCallback, useSyncExternalStore } from 'react';

interface TiltOptions {
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  speed?: number;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function useCard3DTilt<T extends HTMLElement = HTMLDivElement>(options: TiltOptions = {}) {
  const { maxTilt = 7, scale = 1.015, perspective = 800 } = options;
  const ref = useRef<T>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
  });

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (prefersReducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: 'transform 0.08s ease-out',
      });
    },
    [maxTilt, scale, perspective, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  }, [perspective]);

  return {
    ref,
    style,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}
