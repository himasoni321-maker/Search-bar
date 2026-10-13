export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface PhoneticInfo {
  text?: string;
  audio?: string;
}

export interface DefinitionItem {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface MeaningItem {
  partOfSpeech: string;
  definitions: DefinitionItem[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: PhoneticInfo[];
  meanings: MeaningItem[];
  origin?: string;
}

export interface WikipediaSummary {
  title: string;
  displaytitle?: string;
  type?: string;
  extract: string;
  description?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop?: {
      page: string;
    };
    mobile?: {
      page: string;
    };
  };
  timestamp?: string;
}

export interface LookupResult {
  word: string;
  sentenceContext?: string;
  targetLanguage: string;
  translation: string;
  dictionary?: DictionaryEntry;
  wikipedia?: WikipediaSummary;
  timestamp: number;
  coordinates?: { x: number; y: number };
}

export interface SavedVocabularyItem {
  id: string;
  word: string;
  translation: string;
  targetLang: string;
  definition?: string;
  phonetic?: string;
  partOfSpeech?: string;
  contextSentence?: string;
  timestamp: number;
  mastered?: boolean;
}

export interface ReaderDocument {
  id: string;
  title: string;
  type: 'pdf' | 'news' | 'wiki' | 'book' | 'custom';
  category: string;
  readTime: string;
  source: string;
  content: string;
  author?: string;
  date?: string;
}

export interface AppSettings {
  hasSystemAlertPermission: boolean;
  isServiceRunning: boolean;
  targetLanguage: string;
  autoLookupOnDrop: boolean;
  reticleSize: 'compact' | 'normal' | 'magnifier';
  vibrateFeedback: boolean;
  speechSpeed: number;
  autoPronounce: boolean;
  highContrastReticle: boolean;
}
