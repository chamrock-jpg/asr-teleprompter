import type { WordToken, MatchResult, MatcherConfig, TranscriptionSegment } from '@/types';
import { tokenize } from './textNormalizer';
import { ngramSimilarity } from './fuzzyMatch';

const DEFAULT_CONFIG: MatcherConfig = {
  windowBehind: 10,
  windowAhead: 50,
  minNgram: 2,
  maxNgram: 5,
  confidenceThreshold: 0.6,
  jumpThreshold: 0.85,
};

export class TextMatcher {
  private scriptWords: WordToken[];
  private currentIndex: number;
  private matchHistory: Array<{ index: number; timestamp: number }>;
  private config: MatcherConfig;

  constructor(scriptWords: WordToken[], config?: Partial<MatcherConfig>) {
    this.scriptWords = scriptWords;
    this.currentIndex = 0;
    this.matchHistory = [];
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Process a new transcription segment from ASR. */
  processTranscription(segment: TranscriptionSegment): MatchResult | null {
    const match = this.findBestMatch(segment.text);

    if (match === null) return null;

    // Don't allow backward jumps unless very confident
    if (match.wordIndex < this.currentIndex && match.confidence < 0.9) {
      return null;
    }

    this.currentIndex = match.wordIndex;
    this.matchHistory.push({ index: this.currentIndex, timestamp: Date.now() });

    // Keep only last 20 matches for velocity estimation
    if (this.matchHistory.length > 20) {
      this.matchHistory.shift();
    }

    return match;
  }

  /** Reset position (e.g. user clicked a word). */
  setPosition(wordIndex: number): void {
    this.currentIndex = Math.max(0, Math.min(wordIndex, this.scriptWords.length - 1));
    this.matchHistory = [];
  }

  /** Get current position index. */
  getPosition(): number {
    return this.currentIndex;
  }

  /** Estimate reading velocity in words per second. */
  getVelocity(): number {
    if (this.matchHistory.length < 2) return 0;

    const recent = this.matchHistory.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDelta = (last.timestamp - first.timestamp) / 1000;

    if (timeDelta <= 0) return 0;

    return (last.index - first.index) / timeDelta;
  }

  /** Core matching algorithm: find the best position in the script for the ASR text. */
  private findBestMatch(asrText: string): MatchResult | null {
    const asrTokens = tokenize(asrText);
    if (asrTokens.length < this.config.minNgram) return null;

    // Define search window
    const searchStart = Math.max(0, this.currentIndex - this.config.windowBehind);
    const searchEnd = Math.min(
      this.scriptWords.length - 1,
      this.currentIndex + this.config.windowAhead,
    );

    let bestMatch = this.searchInWindow(asrTokens, searchStart, searchEnd);

    // If no match in normal window, try rescue search across the full remaining script
    if (bestMatch === null) {
      const rescueStart = searchEnd + 1;
      const rescueEnd = this.scriptWords.length - 1;
      if (rescueStart < rescueEnd) {
        bestMatch = this.searchInWindow(asrTokens, rescueStart, rescueEnd);
        // Rescue search requires higher confidence
        if (bestMatch !== null && bestMatch.confidence < 0.92) {
          bestMatch = null;
        }
      }
    }

    return bestMatch;
  }

  private searchInWindow(
    asrTokens: string[],
    searchStart: number,
    searchEnd: number,
  ): MatchResult | null {
    let bestMatch: MatchResult | null = null;
    let bestScore = 0;

    const maxNgram = Math.min(asrTokens.length, this.config.maxNgram);

    for (let ngramSize = maxNgram; ngramSize >= this.config.minNgram; ngramSize--) {
      // Take n-gram from the END of ASR output (most recent words)
      const asrNgram = asrTokens.slice(asrTokens.length - ngramSize);

      for (let pos = searchStart; pos <= searchEnd - ngramSize + 1; pos++) {
        const scriptNgram = this.scriptWords
          .slice(pos, pos + ngramSize)
          .map((w) => w.normalized);

        const similarity = ngramSimilarity(asrNgram, scriptNgram);

        // Forward bias
        let forwardBonus = 1.0;
        if (pos > this.currentIndex) {
          forwardBonus = 1.0 + 0.1 * Math.min((pos - this.currentIndex) / 10, 1.0);
        } else if (pos < this.currentIndex) {
          forwardBonus = 0.8;
        }

        // Longer matches are more reliable
        const lengthBonus = 1.0 + (ngramSize - this.config.minNgram) * 0.15;

        const finalScore = similarity * forwardBonus * lengthBonus;

        if (finalScore > bestScore) {
          bestScore = finalScore;
          bestMatch = {
            wordIndex: pos + ngramSize - 1, // Point to end of match
            confidence: similarity,
            matchedTokens: asrNgram,
          };
        }
      }
    }

    // Confidence gating
    if (bestMatch === null) return null;

    const jumpDistance = Math.abs(bestMatch.wordIndex - this.currentIndex);
    const requiredConfidence =
      jumpDistance > 20 ? this.config.jumpThreshold : this.config.confidenceThreshold;

    if (bestMatch.confidence < requiredConfidence) {
      return null;
    }

    return bestMatch;
  }
}
