import { sanitizeWord } from './api';

export interface OCRHit {
  word: string;
  cleanWord: string;
  sentence?: string;
  boundingRect?: DOMRect;
  element?: Element;
  confidence: number;
}

export interface OCRDetectedWordBox {
  id: string;
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lineIndex?: number;
}

/**
 * Extracts text and word under specific screen coordinates (x, y)
 * Emulates Android Google ML Kit Screen coordinate OCR
 */
export function extractTextAtCoordinates(
  x: number,
  y: number,
  ignoreElementIds: string[] = ['floating-target', 'floating-card', 'android-nav']
): OCRHit | null {
  if (typeof document === 'undefined') return null;

  // Temporarily find element, bypassing any floating overlays
  let targetElement: Element | null = null;
  const elements = document.elementsFromPoint(x, y);

  for (const el of elements) {
    const isIgnored = ignoreElementIds.some(
      id => el.id === id || el.closest(`#${id}`) || el.getAttribute('data-overlay') === 'true'
    );
    if (!isIgnored) {
      targetElement = el;
      break;
    }
  }

  if (!targetElement) return null;

  // 1. Try standard caretPositionFromPoint / caretRangeFromPoint
  let textNode: Node | null = null;
  let offset = 0;

  const docAny = document as unknown as {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };

  if (typeof docAny.caretPositionFromPoint === 'function') {
    const pos = docAny.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode) {
      textNode = pos.offsetNode;
      offset = pos.offset;
    }
  } else if (typeof docAny.caretRangeFromPoint === 'function') {
    const range = docAny.caretRangeFromPoint(x, y);
    if (range && range.startContainer) {
      textNode = range.startContainer;
      offset = range.startOffset;
    }
  }

  // If text node was located
  if (textNode && textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
    const text = textNode.textContent;
    const wordInfo = getWordAtOffset(text, offset);
    if (wordInfo && sanitizeWord(wordInfo.word).length > 0) {
      const sentence = getSentenceAroundOffset(text, offset);
      return {
        word: wordInfo.word,
        cleanWord: sanitizeWord(wordInfo.word),
        sentence,
        element: targetElement,
        confidence: 0.98,
      };
    }
  }

  // 2. Fallback: inspect target element's direct text or child text nodes
  const rawText = targetElement.textContent?.trim();
  if (rawText && rawText.length > 0) {
    // Split into words and find the closest word
    const words = rawText.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return {
        word: words[0],
        cleanWord: sanitizeWord(words[0]),
        sentence: rawText,
        element: targetElement,
        confidence: 0.85,
      };
    }

    // Try finding word by element bounding rect estimation
    const rect = targetElement.getBoundingClientRect();
    if (rect.width > 0) {
      const relX = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      const wordIdx = Math.min(words.length - 1, Math.floor(relX * words.length));
      const pickedWord = words[wordIdx];
      if (pickedWord) {
        return {
          word: pickedWord,
          cleanWord: sanitizeWord(pickedWord),
          sentence: rawText.slice(0, 160),
          element: targetElement,
          confidence: 0.88,
        };
      }
    }
  }

  return null;
}

/**
 * Given a string and a character index, extracts the boundary of the current word
 */
function getWordAtOffset(text: string, offset: number): { word: string; start: number; end: number } | null {
  if (!text || offset < 0) return null;

  const len = text.length;
  let start = Math.min(offset, len - 1);
  let end = start;

  const isWordChar = (char: string) => /[a-zA-Z0-9'’\-]/.test(char);

  // If current char is whitespace, look one char back
  if (start > 0 && !isWordChar(text[start]) && isWordChar(text[start - 1])) {
    start--;
    end = start;
  }

  if (!isWordChar(text[start])) {
    // Check next char
    if (start + 1 < len && isWordChar(text[start + 1])) {
      start++;
      end = start;
    } else {
      return null;
    }
  }

  // Move backwards
  while (start > 0 && isWordChar(text[start - 1])) {
    start--;
  }

  // Move forwards
  while (end < len - 1 && isWordChar(text[end + 1])) {
    end++;
  }

  const word = text.slice(start, end + 1).trim();
  return { word, start, end };
}

/**
 * Extracts surrounding sentence around an offset
 */
function getSentenceAroundOffset(text: string, offset: number): string {
  const punctuation = /[.!?\n]/;
  let start = offset;
  let end = offset;

  while (start > 0 && !punctuation.test(text[start - 1])) {
    start--;
  }
  while (end < text.length && !punctuation.test(text[end])) {
    end++;
  }

  const sentence = text.slice(start, end).trim();
  return sentence.length > 200 ? sentence.slice(0, 200) + '...' : sentence;
}

/**
 * ML Kit style screen-wide OCR text detection scanner
 * Inspects all text nodes in the reading area and generates bounding boxes
 */
export function scanElementForWordBoxes(container: HTMLElement): OCRDetectedWordBox[] {
  const boxes: OCRDetectedWordBox[] = [];
  const containerRect = container.getBoundingClientRect();

  const treeWalker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!node.textContent || node.textContent.trim().length === 0) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = node.parentElement;
        if (!parent || parent.closest('#floating-target') || parent.closest('#floating-card')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let textNode = treeWalker.nextNode();
  let count = 0;

  while (textNode && count < 250) {
    const text = textNode.textContent || '';
    const regex = /\b[a-zA-Z]{3,}\b/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null && count < 250) {
      try {
        const range = document.createRange();
        range.setStart(textNode, match.index);
        range.setEnd(textNode, match.index + match[0].length);

        const rects = range.getClientRects();
        if (rects.length > 0) {
          const rect = rects[0];
          // Check if within container bounds and visible
          if (
            rect.width > 5 &&
            rect.height > 5 &&
            rect.bottom >= containerRect.top &&
            rect.top <= containerRect.bottom
          ) {
            boxes.push({
              id: `ocr-${count++}`,
              word: match[0],
              x: rect.left - containerRect.left,
              y: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height,
            });
          }
        }
      } catch {
        // Range error ignored
      }
    }

    textNode = treeWalker.nextNode();
  }

  return boxes;
}
