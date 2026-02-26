/** Normalize a word for matching: lowercase, strip punctuation. */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();
}

/** Check if a character is CJK (Chinese/Japanese/Korean). */
export function isCJK(char: string): boolean {
  const code = char.codePointAt(0);
  if (code === undefined) return false;
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||   // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) ||   // CJK Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0xf900 && code <= 0xfaff) ||   // CJK Compatibility
    (code >= 0x3000 && code <= 0x303f) ||   // CJK Symbols
    (code >= 0x3040 && code <= 0x309f) ||   // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) ||   // Katakana
    (code >= 0xac00 && code <= 0xd7af)      // Hangul
  );
}

/** Tokenize text into matchable units.
 *  - Chinese: split into individual characters
 *  - English: split by whitespace into words
 *  - Mixed: handle each segment by its language
 */
export function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim();

  if (!normalized) return [];

  const tokens: string[] = [];
  let currentWord = '';

  for (const char of normalized) {
    if (isCJK(char)) {
      // Flush any accumulated English word
      if (currentWord.trim()) {
        tokens.push(currentWord.trim());
        currentWord = '';
      }
      // Each CJK character is its own token
      tokens.push(char);
    } else if (/\s/.test(char)) {
      if (currentWord.trim()) {
        tokens.push(currentWord.trim());
        currentWord = '';
      }
    } else {
      currentWord += char;
    }
  }

  if (currentWord.trim()) {
    tokens.push(currentWord.trim());
  }

  return tokens;
}
