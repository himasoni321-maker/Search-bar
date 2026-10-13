import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Globe2,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  GripHorizontal,
  ChevronDown,
} from 'lucide-react';
import { LookupResult } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../data/languages';
import { playPronunciation } from '../services/api';

interface FloatingResultCardProps {
  result: LookupResult;
  onClose: () => void;
  onSaveWord: (result: LookupResult) => void;
  isSaved: boolean;
  onLanguageChange: (newLangCode: string) => void;
  speechSpeed: number;
}

export const FloatingResultCard: React.FC<FloatingResultCardProps> = ({
  result,
  onClose,
  onSaveWord,
  isSaved,
  onLanguageChange,
  speechSpeed,
}) => {
  const [activeTab, setActiveTab] = useState<'translate' | 'wiki' | 'context'>('translate');
  const [copied, setCopied] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);

  // Position coordinates for card
  const [cardPos, setCardPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const startX = Math.max(16, Math.min(window.innerWidth - 380, 24));
      const startY = Math.max(70, window.innerHeight - 380);
      return { x: startX, y: startY };
    }
    return { x: 24, y: 320 };
  });

  const [isDraggingCard, setIsDraggingCard] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Calculate audio URL if available
  const audioUrl = result.dictionary?.phonetics?.find(p => p.audio && p.audio.length > 0)?.audio;
  const phoneticText = result.dictionary?.phonetic || result.dictionary?.phonetics?.find(p => p.text)?.text;

  // Handle card dragging
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: cardPos.x,
      startY: cardPos.y,
    };
    setIsDraggingCard(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCard) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const newX = Math.max(10, Math.min(window.innerWidth - 340, dragStartRef.current.startX + dx));
    const newY = Math.max(50, Math.min(window.innerHeight - 100, dragStartRef.current.startY + dy));
    setCardPos({ x: newX, y: newY });
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCard) return;
    setIsDraggingCard(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const handleCopyTranslation = () => {
    if (result.translation) {
      navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAudioPlay = () => {
    playPronunciation(result.word, audioUrl, speechSpeed);
  };

  const currentLang = getLanguageByCode(result.targetLanguage);

  return (
    <div
      id="floating-card"
      style={{
        left: `${cardPos.x}px`,
        top: `${cardPos.y}px`,
        touchAction: 'none',
      }}
      className={`fixed z-50 w-[350px] max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 text-slate-100 transition-shadow overflow-hidden ${
        isDraggingCard ? 'ring-2 ring-indigo-500/50 cursor-grabbing' : ''
      }`}
    >
      {/* CARD HEADER & DRAG HANDLE */}
      <div
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-grab select-none active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-500" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-semibold text-slate-200">On-Screen Assistant</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Target Language Dropdown Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-600/30 transition-colors ${
                      lang.code === result.targetLanguage ? 'text-cyan-300 font-semibold bg-indigo-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{lang.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Minimize / Maximize toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 cursor-pointer"
            title={isMinimized ? 'Expand card' : 'Minimize card'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 cursor-pointer"
            title="Dismiss card"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MINIMIZED VIEW */}
      {isMinimized ? (
        <div className="p-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white capitalize">{result.word}</div>
            <div className="text-xs text-cyan-300 font-medium truncate max-w-[220px]">
              {result.translation}
            </div>
          </div>
          <button
            onClick={handleAudioPlay}
            className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* EXPANDED FULL VIEW */
        <div className="p-3.5 max-h-[380px] overflow-y-auto">
          {/* WORD HEADER & TRANSLATION HERO */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight capitalize">{result.word}</h3>
                {phoneticText && (
                  <span className="text-xs font-mono text-slate-400">{phoneticText}</span>
                )}
              </div>

              {/* Translation Badge with Copy */}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                  {result.translation || 'Translating...'}
                </span>
                <button
                  onClick={handleCopyTranslation}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy translation"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleAudioPlay}
                className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors cursor-pointer"
                title="Pronounce word"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSaveWord(result)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
                title={isSaved ? 'Saved to Vocabulary' : 'Save to Vocabulary'}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* TAB BAR (Segmented Control) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg mb-3 border border-slate-800">
            <button
              onClick={() => setActiveTab('translate')}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'translate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Dictionary</span>
            </button>
            <button
              onClick={() => setActiveTab('wiki')}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'wiki'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-3 h-3" />
              <span>Wikipedia</span>
            </button>
            <button
              onClick={() => setActiveTab('context')}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'context'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Context</span>
            </button>
          </div>

          {/* TAB 1: DICTIONARY & DEFINITIONS */}
          {activeTab === 'translate' && (
            <div className="space-y-3">
              {result.dictionary?.meanings && result.dictionary.meanings.length > 0 ? (
                result.dictionary.meanings.slice(0, 2).map((meaning, mIdx) => (
                  <div key={mIdx} className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                      {meaning.partOfSpeech}
                    </div>
                    {meaning.definitions.slice(0, 2).map((def, dIdx) => (
                      <div key={dIdx} className="text-xs text-slate-300 pl-2 border-l-2 border-indigo-500/40 space-y-1">
                        <p className="leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <p className="text-[11px] text-slate-400 italic">"{def.example}"</p>
                        )}
                        {def.synonyms && def.synonyms.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            <span className="text-[10px] text-slate-500">Synonyms:</span>
                            {def.synonyms.slice(0, 4).map((syn, sIdx) => (
                              <span key={sIdx} className="text-[10px] text-slate-400">
                                {syn}{sIdx < 3 && sIdx < (def.synonyms?.length || 0) - 1 ? ',' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="py-2 text-center text-xs text-slate-400 space-y-1">
                  <p>Direct translation loaded: <strong className="text-cyan-300">{result.translation}</strong></p>
                  <p className="text-[11px] text-slate-500">Specialized noun or term. See Wikipedia tab for in-depth encyclopedia entry.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WIKIPEDIA REST API INTEGRATION */}
          {activeTab === 'wiki' && (
            <div className="space-y-2.5">
              {result.wikipedia ? (
                <>
                  <div className="flex items-start gap-2.5">
                    {result.wikipedia.thumbnail && (
                      <img
                        src={result.wikipedia.thumbnail.source}
                        alt={result.wikipedia.title}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">
                        {result.wikipedia.title}
                      </h4>
                      {result.wikipedia.description && (
                        <p className="text-[11px] text-indigo-300 font-medium mt-0.5">
                          {result.wikipedia.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                    {result.wikipedia.extract}
                  </p>

                  {result.wikipedia.content_urls?.desktop?.page && (
                    <a
                      href={result.wikipedia.content_urls.desktop.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:underline pt-1"
                    >
                      <span>Read full entry on Wikipedia</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  <p>No dedicated Wikipedia article found for "{result.word}".</p>
                  <p className="text-[11px] text-slate-500 mt-1">Try querying the base form or root term.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTEXT & GRAMMAR */}
          {activeTab === 'context' && (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sentence in Document
                </span>
                <p className="mt-1 p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 leading-relaxed italic">
                  {result.sentenceContext ? `"...${result.sentenceContext}..."` : 'Word inspected directly via screen OCR target.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                  <span className="text-slate-500 block">Character Length</span>
                  <span className="text-slate-200 font-semibold">{result.word.length} letters</span>
                </div>
                <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
                  <span className="text-slate-500 block">Target Language</span>
                  <span className="text-slate-200 font-semibold">{currentLang.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
