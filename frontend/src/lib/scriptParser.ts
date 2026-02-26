import type { WordToken } from '@/types';
import { normalizeWord, isCJK } from './textNormalizer';

/** Parse a script into word tokens, handling both Chinese and English text. */
export function parseScript(rawText: string): WordToken[] {
  const tokens: WordToken[] = [];
  const paragraphs = rawText.split(/\n\s*\n/);
  let globalIndex = 0;
  let charOffset = 0;

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    if (!para.trim()) {
      charOffset += para.length + 2; // +2 for \n\n
      continue;
    }

    // Process character by character to handle mixed Chinese/English
    let currentWord = '';
    let wordStart = charOffset;

    for (let i = 0; i < para.length; i++) {
      const char = para[i];

      if (isCJK(char)) {
        // Flush accumulated English word
        if (currentWord.trim()) {
          tokens.push({
            id: globalIndex++,
            raw: currentWord.trim(),
            normalized: normalizeWord(currentWord.trim()),
            paragraphIndex: pIdx,
            charOffset: wordStart,
          });
          currentWord = '';
        }

        // Each CJK character is its own token
        tokens.push({
          id: globalIndex++,
          raw: char,
          normalized: char.toLowerCase(),
          paragraphIndex: pIdx,
          charOffset: charOffset + i,
        });

        wordStart = charOffset + i + 1;
      } else if (/\s/.test(char)) {
        if (currentWord.trim()) {
          tokens.push({
            id: globalIndex++,
            raw: currentWord.trim(),
            normalized: normalizeWord(currentWord.trim()),
            paragraphIndex: pIdx,
            charOffset: wordStart,
          });
          currentWord = '';
        }
        wordStart = charOffset + i + 1;
      } else {
        if (!currentWord) {
          wordStart = charOffset + i;
        }
        currentWord += char;
      }
    }

    // Flush remaining word
    if (currentWord.trim()) {
      tokens.push({
        id: globalIndex++,
        raw: currentWord.trim(),
        normalized: normalizeWord(currentWord.trim()),
        paragraphIndex: pIdx,
        charOffset: wordStart,
      });
    }

    charOffset += para.length + 2; // +2 for paragraph separator
  }

  return tokens;
}
