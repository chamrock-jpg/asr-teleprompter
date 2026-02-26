/** A single token parsed from the script */
export interface WordToken {
  id: number;
  raw: string;
  normalized: string;
  paragraphIndex: number;
  charOffset: number;
}

/** Result from the ASR backend */
export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  words?: TranscribedWord[];
}

export interface TranscribedWord {
  word: string;
  start: number;
  end: number;
  probability: number;
}

/** Match result from the text matching algorithm */
export interface MatchResult {
  wordIndex: number;
  confidence: number;
  matchedTokens: string[];
}

/** WebSocket message types (frontend -> backend) */
export type WSClientMessage =
  | { type: 'audio_chunk'; data: string }
  | { type: 'config'; model: string; language: string }
  | { type: 'stop' };

/** WebSocket message types (backend -> frontend) */
export type WSServerMessage =
  | { type: 'transcription'; segment: TranscriptionSegment; is_partial: boolean }
  | { type: 'status'; status: 'ready' | 'processing' | 'error'; message?: string }
  | { type: 'model_loaded'; model: string; device: string };

/** Display settings */
export interface DisplaySettings {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  highlightColor: string;
  isMirrored: boolean;
  marginPercent: number;
  lineHeight: number;
  scrollSpeed: number;
}

/** Matcher configuration */
export interface MatcherConfig {
  windowBehind: number;
  windowAhead: number;
  minNgram: number;
  maxNgram: number;
  confidenceThreshold: number;
  jumpThreshold: number;
}
