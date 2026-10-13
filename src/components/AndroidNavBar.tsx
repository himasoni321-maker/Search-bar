import React from 'react';
import { Square, Circle, Triangle, ScanText, BookOpen, Settings } from 'lucide-react';

interface AndroidNavBarProps {
  onScanScreen: () => void;
  onOpenVocabulary: () => void;
  onOpenSettings: () => void;
  savedWordsCount: number;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  onScanScreen,
  onOpenVocabulary,
  onOpenSettings,
  savedWordsCount,
}) => {
  return (
    <div id="android-nav" className="w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 flex items-center justify-between z-30 select-none">
      {/* Quick Utility Shortcuts */}
      <div className="flex items-center gap-1">
        <button
          onClick={onScanScreen}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium border border-indigo-500/30 transition-all cursor-pointer"
          title="Scan entire screen for recognized words with ML Kit OCR"
        >
          <ScanText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scan Screen</span>
        </button>

        <button
          onClick={onOpenVocabulary}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          title="View saved vocabulary words & flashcards"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Vocabulary</span>
          {savedWordsCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-500 text-white leading-tight">
              {savedWordsCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Assistant Settings & System Permissions"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Android System Soft Navigation Keys */}
      <div className="flex items-center gap-8 pr-2">
        {/* Recents Button (Square) */}
        <button
          onClick={onOpenSettings}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          title="App Settings / Tasks"
        >
          <Square className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Home Button (Circle) */}
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          title="Home / Scroll Top"
        >
          <Circle className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Back Button (Triangle pointing left) */}
        <button
          onClick={() => {
            window.history.back();
          }}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 -rotate-90"
          title="Back"
        >
          <Triangle className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
