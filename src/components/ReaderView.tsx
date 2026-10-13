import React, { useState, useRef } from 'react';
import {
  FileText,
  Newspaper,
  BookOpen,
  Globe2,
  Edit3,
  MonitorPlay,
  Upload,
  Sparkles,
  Info,
  Maximize,
  Minimize,
  Type,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ReaderDocument } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleArticles';

interface ReaderViewProps {
  onWordClick: (word: string, context?: string, clientCoords?: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ReaderView: React.FC<ReaderViewProps> = ({ onWordClick, containerRef }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('pdf-quantum');
  const [customText, setCustomText] = useState<string>(
    'The gravitational wave detector captured an extraordinary astrophysical event, verifying general relativity in an unprecedented cosmological regime.'
  );
  const [fontSize, setFontSize] = useState<number>(15);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentDoc = SAMPLE_DOCUMENTS.find((d) => d.id === selectedDocId) || SAMPLE_DOCUMENTS[0];

  // Direct word click handler
  const handleWordClick = (e: React.MouseEvent<HTMLElement>) => {
    // If text was selected or clicked
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      onWordClick(selectedText, undefined, { x: e.clientX, y: e.clientY });
      return;
    }

    // Otherwise determine word under click target
    const target = e.target as HTMLElement;
    if (target.textContent) {
      // Split into clean words or find clicked text
      const cleanWord = target.textContent.trim().split(/\s+/)[0];
      if (cleanWord) {
        onWordClick(cleanWord, target.textContent, { x: e.clientX, y: e.clientY });
      }
    }
  };

  // Screen Capture (Live Display Media) handler
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsScreenSharing(true);
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      }
    } catch (err) {
      console.warn('Screen share cancelled or not permitted:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* READING TOOLBAR & DOCUMENT PICKER */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 z-10 select-none">
        {/* Document Format Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {SAMPLE_DOCUMENTS.map((doc) => {
            const Icon =
              doc.type === 'pdf'
                ? FileText
                : doc.type === 'news'
                ? Newspaper
                : doc.type === 'book'
                ? BookOpen
                : Globe2;
            const isSelected = selectedDocId === doc.id && !isScreenSharing;

            return (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  if (isScreenSharing) handleToggleScreenShare();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{doc.type.toUpperCase()}: {doc.title.split(':')[0].slice(0, 16)}...</span>
              </button>
            );
          })}

          {/* Custom Reader Tab */}
          <button
            onClick={() => {
              setSelectedDocId('custom');
              if (isScreenSharing) handleToggleScreenShare();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedDocId === 'custom' && !isScreenSharing
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Custom Text</span>
          </button>
        </div>

        {/* Reader Controls: Font Size & Screen Share */}
        <div className="flex items-center gap-2">
          {/* Live External Screen Share Toggle */}
          <button
            onClick={handleToggleScreenShare}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isScreenSharing
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Mirror real screen/browser window for live floating OCR lookup"
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isScreenSharing ? 'Stop Screen' : 'Live Screen Share'}</span>
          </button>

          {/* Font Controls */}
          <div className="flex items-center gap-0.5 bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={() => setFontSize((f) => Math.max(12, f - 1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Decrease text size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(22, f + 1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Increase text size"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK INSTRUCTION HINT BANNER */}
      <div className="px-4 py-1.5 bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-indigo-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] text-slate-300">
            <strong>How to use:</strong> Drag the circular reticle 🎯 over any English word to automatically translate & pull Wikipedia info.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 hidden md:inline">
          Or double-click any word directly
        </span>
      </div>

      {/* MAIN CONTENT READER CANVAS */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl w-full mx-auto relative select-text"
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* LIVE EXTERNAL SCREEN STREAM MODE */}
        {isScreenSharing ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Live Screen Mirror Active — Drag the floating target anywhere on the video!</span>
              </div>
              <button
                onClick={handleToggleScreenShare}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px]"
              >
                End Share
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            </div>
          </div>
        ) : selectedDocId === 'custom' ? (
          /* CUSTOM TEXT EDITOR READER */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Type or Paste English Text / Article to Test Floating Assistant</span>
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                placeholder="Paste any academic abstract, news paragraph, or e-book passage..."
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-lg">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Rendered Screen Reader Preview (Target Draggable)
              </span>
              <p
                onClick={handleWordClick}
                className="leading-relaxed text-slate-200 whitespace-pre-wrap cursor-pointer"
              >
                {customText}
              </p>
            </div>
          </div>
        ) : selectedDocId === 'pdf-quantum' ? (
          /* PDF ACADEMIC PAPER PRESENTATION */
          <div className="space-y-6">
            {/* Paper Header Banner */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-2">
                <span>{currentDoc.category}</span>
                <span>•</span>
                <span>{currentDoc.source}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {currentDoc.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
                <span>Authors: <strong className="text-slate-200">{currentDoc.author}</strong></span>
                <span>•</span>
                <span>Date: <strong className="text-slate-200">{currentDoc.date}</strong></span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  {currentDoc.readTime}
                </span>
              </div>
            </div>

            {/* Document Body */}
            <div className="space-y-4 text-slate-200 leading-relaxed font-serif">
              {currentDoc.content.split('\n\n').map((para, idx) => (
                <p
                  key={idx}
                  onClick={handleWordClick}
                  className={`cursor-pointer ${
                    para.startsWith('Abstract:')
                      ? 'p-4 rounded-xl bg-slate-950/80 border-l-4 border-indigo-500 text-slate-300 text-sm font-sans italic'
                      : para.startsWith('1.') || para.startsWith('2.') || para.startsWith('3.')
                      ? 'text-lg font-bold text-white font-sans mt-4 border-b border-slate-800/80 pb-1'
                      : 'text-slate-300'
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        ) : selectedDocId === 'news-energy' ? (
          /* NEWS ARTICLE PRESENTATION */
          <div className="space-y-5">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {currentDoc.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {currentDoc.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span>By {currentDoc.author}</span>
                <span>•</span>
                <span>Published {currentDoc.date}</span>
              </div>
            </div>

            <div className="space-y-4 text-slate-200 leading-relaxed">
              {currentDoc.content.split('\n\n').map((para, idx) => (
                <p
                  key={idx}
                  onClick={handleWordClick}
                  className={`cursor-pointer ${
                    idx === 0
                      ? 'text-base font-medium text-slate-100 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-emerald-400'
                      : para.startsWith('"')
                      ? 'p-3.5 rounded-xl bg-slate-950/60 border-l-4 border-emerald-500 text-emerald-200 italic'
                      : 'text-slate-300'
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        ) : selectedDocId === 'book-literature' ? (
          /* CLASSIC LITERATURE READER */
          <div className="space-y-5">
            <div className="text-center border-b border-slate-800 pb-4">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-serif">
                Classic Victorian Prose
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tracking-wide mt-1">
                {currentDoc.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1 italic">Explore rich historic vocabulary</p>
            </div>

            <div className="space-y-4 text-amber-50/90 font-serif leading-loose tracking-wide">
              {currentDoc.content.split('\n\n').map((para, idx) => (
                <p key={idx} onClick={handleWordClick} className="cursor-pointer">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ) : (
          /* WIKIPEDIA KNOWLEDGE ARTICLE */
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
                <span>{currentDoc.source}</span>
                <span>•</span>
                <span>{currentDoc.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentDoc.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">From Wikipedia, the free encyclopedia</p>
            </div>

            <div className="space-y-4 text-slate-200 leading-relaxed font-sans">
              {currentDoc.content.split('\n\n').map((para, idx) => (
                <p key={idx} onClick={handleWordClick} className="cursor-pointer text-slate-300">
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
