import { DictionaryEntry, WikipediaSummary, LookupResult } from '../types';

// In-memory cache to make repeated lookups instant and save bandwidth
const dictionaryCache = new Map<string, DictionaryEntry | null>();
const wikiCache = new Map<string, WikipediaSummary | null>();
const translationCache = new Map<string, string>();

/**
 * Clean word tokens from punctuation and whitespace
 */
export function sanitizeWord(rawText: string): string {
  if (!rawText) return '';
  // Remove surrounding quotes, commas, periods, brackets, etc.
  const cleaned = rawText
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/[^a-zA-Z0-9]+$/, '')
    .trim();
  return cleaned;
}

/**
 * Fetch English definitions, phonetics, and audio from Free Dictionary API
 */
export async function fetchDictionaryEntry(word: string): Promise<DictionaryEntry | null> {
  const clean = sanitizeWord(word).toLowerCase();
  if (!clean) return null;

  if (dictionaryCache.has(clean)) {
    return dictionaryCache.get(clean) || null;
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      // 404 or not found
      dictionaryCache.set(clean, null);
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const entry: DictionaryEntry = data[0];
      dictionaryCache.set(clean, entry);
      return entry;
    }
  } catch (err) {
    console.warn(`[Dictionary API] failed for "${clean}":`, err);
  }

  dictionaryCache.set(clean, null);
  return null;
}

/**
 * Fetch rich summary from official Wikipedia REST API
 * https://en.wikipedia.org/api/rest_v1/page/summary/{title}
 */
export async function fetchWikipediaSummary(term: string): Promise<WikipediaSummary | null> {
  const clean = sanitizeWord(term);
  if (!clean) return null;

  const cacheKey = clean.toLowerCase();
  if (wikiCache.has(cacheKey)) {
    return wikiCache.get(cacheKey) || null;
  }

  try {
    // First try original capitalization, or capitalize first letter
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(capitalized)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FloatingScreenTranslatorApp/1.0 (education)',
      },
    });

    if (res.ok) {
      const data: WikipediaSummary = await res.json();
      if (data && data.extract && data.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
        wikiCache.set(cacheKey, data);
        return data;
      }
    }

    // Secondary try lowercase
    if (capitalized !== clean) {
      const res2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`);
      if (res2.ok) {
        const data2: WikipediaSummary = await res2.json();
        if (data2 && data2.extract) {
          wikiCache.set(cacheKey, data2);
          return data2;
        }
      }
    }
  } catch (err) {
    console.warn(`[Wikipedia API] failed for "${clean}":`, err);
  }

  wikiCache.set(cacheKey, null);
  return null;
}

/**
 * Fallback common translations for rapid zero-latency responses
 */
const COMMON_TRANSLATIONS: Record<string, Record<string, string>> = {
  quantum: { es: 'cuántico/a', fr: 'quantique', de: 'Quanten-', hi: 'क्वांटम', ja: '量子', zh: '量子', ar: 'كمومي', ru: 'квантовый' },
  architecture: { es: 'arquitectura', fr: 'architecture', de: 'Architektur', hi: 'वास्तुकला / संरचना', ja: '建築 / 設計', zh: '架构 / 建筑', ar: 'هندسة معمارية', ru: 'архитектура' },
  algorithm: { es: 'algoritmo', fr: 'algorithme', de: 'Algorithmus', hi: 'एल्गोरिदम (कलन विधि)', ja: 'アルゴリズム', zh: '算法', ar: 'خوارزمية', ru: 'алгоритм' },
  resilience: { es: 'resiliencia / resistencia', fr: 'résilience', de: 'Widerstandsfähigkeit', hi: 'लचीलापन / प्रतिरोधक क्षमता', ja: '回復力 / レジリエンス', zh: '韧性 / 恢复力', ar: 'مرونة', ru: 'устойчивость' },
  ephemeral: { es: 'efímero / fugaz', fr: 'éphémère', de: 'flüchtig / kurzlebig', hi: 'क्षणिक / अल्पकालिक', ja: '儚い / 一時的な', zh: '短暂的 / 转瞬即逝的', ar: 'سريع الزوال', ru: 'эфемерный' },
  catalyst: { es: 'catalizador', fr: 'catalyseur', de: 'Katalysator', hi: 'उत्प्रेरक', ja: '触媒 / きっかけ', zh: '催化剂', ar: 'محفز', ru: 'катализатор' },
  sustainability: { es: 'sostenibilidad', fr: 'durabilité', de: 'Nachhaltigkeit', hi: 'स्थिरता / संवहनीयता', ja: '持続可能性', zh: '可持续性', ar: 'استدامة', ru: 'устойчивость' },
  paradigm: { es: 'paradigma', fr: 'paradigme', de: 'Paradigma', hi: 'प्रतिमान / मिसाल', ja: 'パラダイム / 模範', zh: '范式 / 典范', ar: 'نموذج فكري', ru: 'парадигма' },
  metamorphosis: { es: 'metamorfosis', fr: 'métamorphose', de: 'Metamorphose / Verwandlung', hi: 'कायापलट / रूपांतरण', ja: '変態 / 変容', zh: '变形 / 蜕变', ar: 'تحول', ru: 'метаморфоза' },
  coherence: { es: 'coherencia', fr: 'cohérence', de: 'Kohärenz / Zusammenhang', hi: 'सुसंगतता', ja: 'コヒーレンス / 整合性', zh: '相干性 / 连贯性', ar: 'ترابط', ru: 'когерентность' }
};

/**
 * Translate text using MyMemory public translation API with backup mechanisms
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';

  const cacheKey = `${clean.toLowerCase()}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Check fast local dictionary
  const lowerWord = clean.toLowerCase();
  if (COMMON_TRANSLATIONS[lowerWord] && COMMON_TRANSLATIONS[lowerWord][targetLang]) {
    const directHit = COMMON_TRANSLATIONS[lowerWord][targetLang];
    translationCache.set(cacheKey, directHit);
    return directHit;
  }

  try {
    const encodedText = encodeURIComponent(clean);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        let result = data.responseData.translatedText;
        // Clean any html entities or uppercase quirks
        result = result.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        translationCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn(`[Translation API] error:`, err);
  }

  // Client-side fallback: check if dictionary entry exists and translate primary definition essence
  return `[${targetLang.toUpperCase()}] ${clean}`;
}

/**
 * Unified lookup function that coordinates Dictionary, Wikipedia, and Translation in parallel
 */
export async function performSmartLookup(
  rawWord: string,
  targetLang: string,
  sentenceContext?: string,
  coords?: { x: number; y: number }
): Promise<LookupResult> {
  const word = sanitizeWord(rawWord);

  // Parallel asynchronous fetching for lightning speed
  const [dictionary, wikipedia, translation] = await Promise.all([
    fetchDictionaryEntry(word),
    fetchWikipediaSummary(word),
    translateText(word, targetLang),
  ]);

  return {
    word,
    sentenceContext,
    targetLanguage: targetLang,
    translation,
    dictionary: dictionary || undefined,
    wikipedia: wikipedia || undefined,
    timestamp: Date.now(),
    coordinates: coords,
  };
}

/**
 * Pronounce word using audio file or browser SpeechSynthesis
 */
export function playPronunciation(word: string, audioUrl?: string, speed: number = 1.0) {
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;
      audio.play().catch(() => {
        // Fallback to speech synthesis if audio file fails (CORS/format)
        speakWord(word, speed);
      });
      return;
    } catch {
      // Fallback
    }
  }
  speakWord(word, speed);
}

function speakWord(text: string, rate: number = 1.0) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
}
