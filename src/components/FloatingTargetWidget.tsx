import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Languages, Move, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { extractTextAtCoordinates, OCRHit } from '../services/ocr';

interface FloatingTargetWidgetProps {
  onWordCaptured: (word: string, contextSentence?: string, coords?: { x: number; y: number }) => void;
  targetLanguageName: string;
  isScanning: boolean;
  reticleSize: 'compact' | 'normal' | 'magnifier';
  vibrateFeedback: boolean;
  isVisible: boolean;
}

export const FloatingTargetWidget: React.FC<FloatingTargetWidgetProps> = ({
  onWordCaptured,
  targetLanguageName,
  isScanning,
  reticleSize,
  vibrateFeedback,
  isVisible,
}) => {
  // Widget screen coordinates (center point)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return { x: Math.min(window.innerWidth - 60, 320), y: Math.min(window.innerHeight - 180, 260) };
    }
    return { x: 260, y: 220 };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isReticleMode, setIsReticleMode] = useState<boolean>(true);
  const [hoveredHit, setHoveredHit] = useState<OCRHit | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const throttleTimeoutRef = useRef<number | null>(null);

  // Vibration feedback helper
  const triggerHaptic = useCallback(() => {
    if (vibrateFeedback && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // Ignored
      }
    }
  }, [vibrateFeedback]);

  // Size specifications
  const getDimensions = () => {
    if (!isReticleMode) return { diameter: 48, radius: 24 };
    switch (reticleSize) {
      case 'compact':
        return { diameter: 64, radius: 32 };
      case 'magnifier':
        return { diameter: 96, radius: 48 };
      case 'normal':
      default:
        return { diameter: 80, radius: 40 };
    }
  };

  const { diameter, radius } = getDimensions();

  // Handle pointer down (mouse or touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary pointer button
    if (e.button !== 0) return;
    e.stopPropagation();

    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate offset from center of reticle
      dragOffsetRef.current = {
        x: e.clientX - (rect.left + radius),
        y: e.clientY - (rect.top + radius),
      };
    }
    setIsDragging(true);
    triggerHaptic();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    // Constrain position within viewport
    const newX = Math.max(radius, Math.min(window.innerWidth - radius, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(radius + 40, Math.min(window.innerHeight - radius - 50, e.clientY - dragOffsetRef.current.y));

    setPosition({ x: newX, y: newY });

    // Live OCR peek during drag (throttled for high 60fps performance)
    if (!throttleTimeoutRef.current) {
      throttleTimeoutRef.current = window.setTimeout(() => {
        const hit = extractTextAtCoordinates(newX, newY);
        if (hit && hit.cleanWord.length > 1) {
          setHoveredHit(hit);
        } else {
          setHoveredHit(null);
        }
        throttleTimeoutRef.current = null;
      }, 40);
    }
  };

  // Handle pointer up (Release / Drop target)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    triggerHaptic();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignored
    }

    // Extract word under final drop coordinate
    executeCaptureAtPoint(position.x, position.y);
  };

  // Execute extraction at specific (x, y)
  const executeCaptureAtPoint = (x: number, y: number) => {
    const hit = extractTextAtCoordinates(x, y);
    if (hit && hit.cleanWord) {
      triggerHaptic();
      onWordCaptured(hit.cleanWord, hit.sentence, { x, y });
    }
  };

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.max(radius, Math.min(window.innerWidth - radius, prev.x)),
        y: Math.max(radius + 40, Math.min(window.innerHeight - radius - 50, prev.y)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radius]);

  if (!isVisible) return null;

  return (
    <div
      id="floating-target"
      ref={widgetRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setIsDragging(false)}
      style={{
        left: `${position.x - radius}px`,
        top: `${position.y - radius}px`,
        width: `${diameter}px`,
        height: `${diameter}px`,
        touchAction: 'none',
      }}
      className={`fixed select-none z-40 transition-transform duration-75 cursor-grab active:cursor-grabbing ${
        isDragging ? 'scale-105 shadow-2xl' : ''
      }`}
      title={
        isReticleMode
          ? 'Drag this target over any English word to translate & inspect'
          : 'Floating Translator widget. Tap or drag to aim.'
      }
    >
      {/* 1. RETICLE MODE */}
      {isReticleMode ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Outer Lens Halo */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-colors duration-200 backdrop-blur-[2px] ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/20 shadow-[0_0_24px_rgba(99,102,241,0.5)]'
                : 'border-cyan-400/80 bg-slate-900/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          />

          {/* Concentric Pulse Ring while Scanning */}
          {(isScanning || isDragging) && (
            <div className="absolute -inset-2 rounded-full border border-cyan-400/40 animate-pulse-ring pointer-events-none" />
          )}

          {/* Aim Crosshair Lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Horizontal Line */}
            <div className="w-full h-[1.5px] bg-gradient-to-r from-cyan-400/80 via-transparent to-cyan-400/80" />
            {/* Vertical Line */}
            <div className="absolute h-full w-[1.5px] bg-gradient-to-b from-cyan-400/80 via-transparent to-cyan-400/80" />
            {/* Center Aim Point */}
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-transform ${
                isDragging
                  ? 'border-white bg-indigo-500 scale-125'
                  : 'border-cyan-300 bg-cyan-500 shadow-sm'
              }`}
            />
          </div>

          {/* Laser scanning bar animation during active scan */}
          {isScanning && (
            <div className="absolute inset-x-2 h-0.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee] animate-scan-laser pointer-events-none" />
          )}

          {/* Live Peek Badge: displays word aimed under reticle */}
          {hoveredHit && (
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-cyan-300 border border-cyan-500/50 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-mono">{hoveredHit.cleanWord}</span>
            </div>
          )}

          {/* Coordinate & Mode Control Floater */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="text-[9px] font-mono font-medium text-slate-300 bg-slate-900/90 border border-slate-700/80 px-1.5 py-0.2 rounded shadow">
              {Math.round(position.x)},{Math.round(position.y)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReticleMode(false);
              }}
              className="text-[9px] bg-slate-800 text-slate-300 hover:text-white p-0.5 rounded border border-slate-700 cursor-pointer"
              title="Minimize to floating bubble"
            >
              <Minimize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      ) : (
        /* 2. MINIMIZED FLOATING BUBBLE MODE (Chathead style) */
        <div
          onClick={(e) => {
            if (!isDragging) {
              e.stopPropagation();
              setIsReticleMode(true);
            }
          }}
          className="relative w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-xl flex items-center justify-center cursor-pointer group hover:scale-110 transition-transform"
        >
          <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Languages className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>

          {/* Tooltip hint */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900/95 border border-slate-700 rounded text-[10px] text-slate-200 whitespace-nowrap shadow-md pointer-events-none">
            Tap to open Aim Reticle
          </div>
        </div>
      )}
    </div>
  );
};
