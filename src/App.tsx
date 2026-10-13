import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  BookOpen,
  Settings as SettingsIcon,
  ScanText,
  HelpCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  AppSettings,
  LookupResult,
  SavedVocabularyItem,
} from './types';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from './data/languages';
import { performSmartLookup, playPronunciation } from './services/api';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { FloatingTargetWidget } from './components/FloatingTargetWidget';
import { FloatingResultCard } from './components/FloatingResultCard';
import { SystemAlertPermissionModal } from './components/SystemAlertPermissionModal';
import { VocabularyModal } from './components/VocabularyModal';
import { SettingsModal } from './components/SettingsModal';
import { FullScreenScanOverlay } from './components/FullScreenScanOverlay';
import { ReaderView } from './components/ReaderView';

const STORAGE_KEY_SETTINGS = 'floating_translator_settings_v1';
const STORAGE_KEY_VOCABULARY = 'floating_translator_vocab_v1';

const INITIAL_SAVED_WORDS: SavedVocabularyItem[] = [
  {
    id: 'vocab-1',
    word: 'decoherence',
    translation: 'decoherencia (pérdida de coherencia cuántica)',
    targetLang: 'es',
    definition: 'Loss of quantum coherence, a mechanism by which a quantum system loses its quantum behavior.',
    phonetic: '/diːkoʊˈhɪərəns/',
    partOfSpeech: 'noun',
    timestamp: Date.now() - 3600000 * 2,
    mastered: false,
  },
  {
    id: 'vocab-2',
    word: 'ephemeral',
    translation: 'efímero / pasajero',
    targetLang: 'es',
    definition: 'Lasting for a very short time; transitory; fleeting.',
    phonetic: '/ɪˈfɛmərəl/',
    partOfSpeech: 'adjective',
    timestamp: Date.now() - 3600000 * 5,
    mastered: true,
  },
  {
    id: 'vocab-3',
    word: 'perovskite',
    translation: 'perovskita',
    targetLang: 'es',
    definition: 'A calcium titanium oxide mineral species composed of calcium titanate, widely researched for high-efficiency solar cells.',
    phonetic: '/pəˈrɒv.skaɪt/',
    partOfSpeech: 'noun',
    timestamp: Date.now() - 3600000 * 12,
    mastered: false,
  },
];

export default function App() {
  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      hasSystemAlertPermission: true,
      isServiceRunning: true,
      targetLanguage: 'es',
      autoLookupOnDrop: true,
      reticleSize: 'normal',
      vibrateFeedback: true,
      speechSpeed: 1.0,
      autoPronounce: false,
      highContrastReticle: false,
    };
  });

  // Saved Vocabulary Words
  const [savedWords, setSavedWords] = useState<SavedVocabularyItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOCABULARY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SAVED_WORDS;
  });

  // Active Lookup Result
  const [activeResult, setActiveResult] = useState<LookupResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Modals & Overlays
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isFullScreenScanOpen, setIsFullScreenScanOpen] = useState<boolean>(false);

  // View Layout Mode: Mobile Phone Frame vs Fullscreen Workspace
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState<boolean>(false);

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Sync settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Sync vocabulary
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOCABULARY, JSON.stringify(savedWords));
    } catch {
      // ignore
    }
  }, [savedWords]);

  // Execute lookup
  const handleWordCaptured = useCallback(
    async (word: string, contextSentence?: string, coords?: { x: number; y: number }) => {
      if (!word || !settings.isServiceRunning) return;

      setIsScanning(true);
      try {
        const result = await performSmartLookup(
          word,
          settings.targetLanguage,
          contextSentence,
          coords
        );
        setActiveResult(result);

        if (settings.autoPronounce) {
          playPronunciation(word, undefined, settings.speechSpeed);
        }
      } catch (err) {
        console.error('Error during lookup:', err);
      } finally {
        setIsScanning(false);
      }
    },
    [settings.isServiceRunning, settings.targetLanguage, settings.autoPronounce, settings.speechSpeed]
  );

  // Target language updated from inside result card
  const handleLanguageChangeOnCard = async (newLangCode: string) => {
    setSettings((prev) => ({ ...prev, targetLanguage: newLangCode }));
    if (activeResult) {
      const updated = await performSmartLookup(
        activeResult.word,
        newLangCode,
        activeResult.sentenceContext,
        activeResult.coordinates
      );
      setActiveResult(updated);
    }
  };

  // Toggle saving to vocabulary
  const handleToggleSaveWord = (result: LookupResult) => {
    const isAlreadySaved = savedWords.some((w) => w.word.toLowerCase() === result.word.toLowerCase());

    if (isAlreadySaved) {
      setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== result.word.toLowerCase()));
    } else {
      const primaryDef = result.dictionary?.meanings?.[0]?.definitions?.[0]?.definition;
      const partOfSpeech = result.dictionary?.meanings?.[0]?.partOfSpeech;
      const phonetic = result.dictionary?.phonetic || result.dictionary?.phonetics?.[0]?.text;

      const newItem: SavedVocabularyItem = {
        id: `word-${Date.now()}`,
        word: result.word,
        translation: result.translation,
        targetLang: result.targetLanguage,
        definition: primaryDef,
        phonetic,
        partOfSpeech,
        contextSentence: result.sentenceContext,
        timestamp: Date.now(),
        mastered: false,
      };
      setSavedWords((prev) => [newItem, ...prev]);
    }
  };

  const isCurrentResultSaved = activeResult
    ? savedWords.some((w) => w.word.toLowerCase() === activeResult.word.toLowerCase())
    : false;

  const currentLang = getLanguageByCode(settings.targetLanguage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* GLOBAL TOP NAV BAR (Desktop utilities) */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                Floating Screen Translator & Wikipedia
              </h1>
              <span className="text-[10px] text-slate-400">
                On-Screen Drag & Drop Reading Assistant • Google ML Kit OCR Engine
              </span>
            </div>
          </div>
        </div>

        {/* Top Control Cluster */}
        <div className="flex items-center gap-2">
          {/* Quick Target Language Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
            <span className="text-slate-400 text-[11px]">Translate to:</span>
            <select
              value={settings.targetLanguage}
              onChange={(e) => handleLanguageChangeOnCard(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold text-xs focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* System Alert Permission Quick Badge */}
          <button
            onClick={() => setIsPermissionModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              settings.hasSystemAlertPermission
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/60'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-950/60'
            }`}
            title="Configure Android System Alert Window Permission"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              Overlay: {settings.hasSystemAlertPermission ? 'Granted' : 'Off'}
            </span>
          </button>

          {/* Toggle Phone Frame vs Fullscreen Workspace */}
          <button
            onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title={isPhoneFrameMode ? 'Expand to Fullscreen Workspace' : 'Switch to Android Phone Mockup'}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isPhoneFrameMode ? 'Full View' : 'Phone Frame'}</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <main className="flex-1 flex items-center justify-center p-0 md:p-3 bg-slate-950 overflow-hidden relative">
        {/* CONTAINER: EITHER PHONE FRAME OR FULL WORKSPACE */}
        <div
          className={`relative flex flex-col overflow-hidden transition-all duration-200 ${
            isPhoneFrameMode
              ? 'w-full max-w-[430px] h-[calc(100vh-80px)] max-h-[880px] rounded-3xl border-4 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-slate-900'
              : 'w-full h-full flex-1 rounded-none md:rounded-2xl border-0 md:border md:border-slate-800/80 bg-slate-900 shadow-xl'
          }`}
        >
          {/* ANDROID TOP STATUS BAR */}
          <AndroidStatusBar
            isServiceRunning={settings.isServiceRunning && settings.hasSystemAlertPermission}
            onOpenPermissionModal={() => setIsPermissionModalOpen(true)}
            targetLanguageName={currentLang.name}
          />

          {/* MAIN DOCUMENT READING CANVAS */}
          <ReaderView
            containerRef={readerContainerRef}
            onWordClick={(word, context, coords) => handleWordCaptured(word, context, coords)}
          />

          {/* FULL SCREEN ML KIT OCR DETECTION OVERLAY */}
          <FullScreenScanOverlay
            isOpen={isFullScreenScanOpen}
            onClose={() => setIsFullScreenScanOpen(false)}
            containerRef={readerContainerRef}
            onSelectWord={(word, boxRect) => handleWordCaptured(word, undefined, boxRect)}
          />

          {/* 1: FLOATING DRAG-AND-DROP TARGET WIDGET */}
          <FloatingTargetWidget
            isVisible={settings.isServiceRunning && settings.hasSystemAlertPermission}
            onWordCaptured={handleWordCaptured}
            targetLanguageName={currentLang.name}
            isScanning={isScanning}
            reticleSize={settings.reticleSize}
            vibrateFeedback={settings.vibrateFeedback}
          />

          {/* 3: NON-INTRUSIVE FLOATING RESULT CARD */}
          {activeResult && (
            <FloatingResultCard
              result={activeResult}
              onClose={() => setActiveResult(null)}
              onSaveWord={handleToggleSaveWord}
              isSaved={isCurrentResultSaved}
              onLanguageChange={handleLanguageChangeOnCard}
              speechSpeed={settings.speechSpeed}
            />
          )}

          {/* ANDROID BOTTOM NAVIGATION BAR */}
          <AndroidNavBar
            onScanScreen={() => setIsFullScreenScanOpen(true)}
            onOpenVocabulary={() => setIsVocabularyModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            savedWordsCount={savedWords.length}
          />
        </div>
      </main>

      {/* SYSTEM ALERT WINDOW PERMISSION MODAL */}
      <SystemAlertPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
      />

      {/* SAVED VOCABULARY NOTEBOOK & FLASHCARDS MODAL */}
      <VocabularyModal
        isOpen={isVocabularyModalOpen}
        onClose={() => setIsVocabularyModalOpen(false)}
        savedWords={savedWords}
        onRemoveWord={(id) => setSavedWords((prev) => prev.filter((w) => w.id !== id))}
        onToggleMastered={(id) =>
          setSavedWords((prev) =>
            prev.map((w) => (w.id === id ? { ...w, mastered: !w.mastered } : w))
          )
        }
        onSelectWord={(word) => handleWordCaptured(word)}
        speechSpeed={settings.speechSpeed}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
        onOpenPermissionModal={() => setIsPermissionModalOpen(true)}
      />
    </div>
  );
}
