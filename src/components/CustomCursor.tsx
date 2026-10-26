'use client';

import React, { useEffect, useState } from 'react';

interface CustomCursorProps {
  enabled: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ enabled }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('interactive-hover'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, isVisible]);

  if (!enabled || !isVisible) return null;

  return (
    <>
      {/* Outer Follower Aura Ring */}
      <div
        className="custom-cursor-follower hidden sm:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isClicking ? '26px' : isHovered ? '48px' : '32px',
          height: isClicking ? '26px' : isHovered ? '48px' : '32px',
          borderColor: isHovered ? 'rgba(6, 182, 212, 0.8)' : 'rgba(168, 85, 247, 0.6)',
          backgroundColor: isHovered ? 'rgba(6, 182, 212, 0.12)' : 'rgba(168, 85, 247, 0.08)',
          boxShadow: isHovered
            ? '0 0 20px rgba(6, 182, 212, 0.5)'
            : '0 0 12px rgba(168, 85, 247, 0.3)',
        }}
      />

      {/* Center High-Precision Dot */}
      <div
        className="custom-cursor-dot hidden sm:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          backgroundColor: isHovered ? '#06b6d4' : '#a855f7',
          boxShadow: isHovered ? '0 0 10px #22d3ee' : '0 0 8px #c084fc',
          transform: isClicking ? 'translate(-50%, -50%) scale(0.7)' : 'translate(-50%, -50%)',
        }}
      />
    </>
  );
};
