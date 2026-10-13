import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  Search,
  Sparkles,
  Download,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SavedVocabularyItem } from '../types';
import { playPronunciation } from '../services/api';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedVocabularyItem[];
  onRemoveWord: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onSelectWord: (word: string) => void;
  speechSpeed: number;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  isOpen,
  onClose,
  savedWords,
  onRemoveWord,
  onToggleMastered,
  onSelectWord,
  speechSpeed,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [studyMode, setStudyMode] = useState<boolean>(false);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  if (!isOpen) return null;

  const filtered = savedWords.filter(
    item =>
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportVocabulary = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedWords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'floating_translator_vocabulary.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentFlashcard = filtered[flashcardIndex] || filtered[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Vocabulary Notebook</h3>
              <p className="text-[11px] text-slate-400">{savedWords.length} words saved from screen reader</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedWords.length > 0 && (
              <button
                onClick={() => {
                  setStudyMode(!studyMode);
                  setIsFlipped(false);
                  setFlashcardIndex(0);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  studyMode
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-indigo-300 border-indigo-500/30 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{studyMode ? 'List View' : 'Study Cards'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STUDY FLASHCARDS MODE */}
        {studyMode && filtered.length > 0 ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="text-xs text-slate-400">
              Card {flashcardIndex + 1} of {filtered.length}
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-sm h-56 bg-slate-950/90 border-2 border-indigo-500/40 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl transition-all relative select-none"
            >
              <div className="absolute top-3 right-3 text-[10px] text-slate-500 flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                <span>Tap to flip</span>
              </div>

              {!isFlipped ? (
                /* Front: English Word */
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold">
                    Original Word
                  </span>
                  <h4 className="text-2xl font-bold text-white capitalize">{currentFlashcard.word}</h4>
                  {currentFlashcard.phonetic && (
                    <p className="text-xs font-mono text-slate-400">{currentFlashcard.phonetic}</p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(currentFlashcard.word, undefined, speechSpeed);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs mt-2"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Pronounce</span>
                  </button>
                </div>
              ) : (
                /* Back: Translation & Definition */
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                    Translation ({currentFlashcard.targetLang.toUpperCase()})
                  </span>
                  <h4 className="text-2xl font-bold text-emerald-300">{currentFlashcard.translation}</h4>
                  {currentFlashcard.definition && (
                    <p className="text-xs text-slate-300 line-clamp-3 italic">
                      "{currentFlashcard.definition}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Flashcard Navigation */}
            <div className="flex items-center gap-4 pt-2">
              <button
                disabled={flashcardIndex === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex(prev => Math.max(0, prev - 1));
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => onToggleMastered(currentFlashcard.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                  currentFlashcard.mastered
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentFlashcard.mastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
              <button
                disabled={flashcardIndex === filtered.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex(prev => Math.min(filtered.length - 1, prev + 1));
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <>
            {/* Search Bar */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search saved vocabulary words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {savedWords.length > 0 && (
                <button
                  onClick={exportVocabulary}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  title="Export vocabulary JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Word List */}
            <div className="p-3.5 overflow-y-auto flex-1 space-y-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  {savedWords.length === 0
                    ? 'No words saved yet. Drag the floating target over any word and click the bookmark star to save!'
                    : 'No vocabulary matches your search.'}
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div
                      onClick={() => {
                        onSelectWord(item.word);
                        onClose();
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white capitalize">{item.word}</span>
                        {item.phonetic && (
                          <span className="text-[11px] font-mono text-slate-400">{item.phonetic}</span>
                        )}
                        <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
                          {item.targetLang.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300 font-medium mt-0.5">{item.translation}</p>
                      {item.definition && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.definition}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => playPronunciation(item.word, undefined, speechSpeed)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Pronounce word"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleMastered(item.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          item.mastered ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={item.mastered ? 'Mastered' : 'Mark mastered'}
                      >
                        {item.mastered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onRemoveWord(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            Tip: Tap any saved word to instantly inspect with floating card
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
