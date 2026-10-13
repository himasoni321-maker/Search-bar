import React, { useEffect, useState } from 'react';
import { OCRDetectedWordBox, scanElementForWordBoxes } from '../services/ocr';
import { X, Sparkles, ScanText } from 'lucide-react';

interface FullScreenScanOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelectWord: (word: string, boxRect?: { x: number; y: number }) => void;
}

export const FullScreenScanOverlay: React.FC<FullScreenScanOverlayProps> = ({
  isOpen,
  onClose,
  containerRef,
  onSelectWord,
}) => {
  const [boxes, setBoxes] = useState<OCRDetectedWordBox[]>([]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const detected = scanElementForWordBoxes(containerRef.current);
      setBoxes(detected);
    } else {
      setBoxes([]);
    }
  }, [isOpen, containerRef]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
      {/* Semi-transparent scan tint backdrop */}
      <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-[0.5px]" />

      {/* Top Banner Status */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 border border-cyan-500/60 shadow-xl text-xs text-white">
        <ScanText className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-medium text-slate-200">
          Google ML Kit OCR: <strong className="text-cyan-300">{boxes.length} words</strong> indexed
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-[11px] text-slate-400">Tap any box to inspect</span>
        <button
          onClick={onClose}
          className="ml-1 p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clickable Word Bounding Boxes */}
      {boxes.map((box) => (
        <button
          key={box.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelectWord(box.word, { x: box.x, y: box.y });
            onClose();
          }}
          style={{
            left: `${box.x}px`,
            top: `${box.y}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
          }}
          className="absolute pointer-events-auto border border-cyan-400/60 bg-cyan-400/10 hover:bg-cyan-400/30 hover:border-cyan-300 rounded-[2px] transition-colors cursor-pointer group"
          title={`Lookup: "${box.word}"`}
        >
          {/* Subtle hover pulse */}
          <span className="absolute -top-4 left-0 hidden group-hover:block whitespace-nowrap bg-slate-900 text-cyan-300 border border-cyan-500 text-[9px] px-1 rounded z-50">
            {box.word}
          </span>
        </button>
      ))}
    </div>
  );
};
