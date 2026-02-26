import { useRef, useCallback, useMemo } from 'react';
import { TextMatcher } from '@/lib/textMatcher';
import { useScriptStore } from '@/store/scriptStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { TranscriptionSegment } from '@/types';

export function useTextMatcher() {
  const words = useScriptStore((s) => s.words);
  const setCurrentIndex = useScriptStore((s) => s.setCurrentIndex);
  const matcherConfig = useSettingsStore((s) => s.matcher);
  const isAutoFollow = useSettingsStore((s) => s.isAutoFollow);

  const matcherRef = useRef<TextMatcher | null>(null);

  // Recreate matcher when script or config changes
  useMemo(() => {
    if (words.length > 0) {
      matcherRef.current = new TextMatcher(words, matcherConfig);
    } else {
      matcherRef.current = null;
    }
  }, [words, matcherConfig]);

  const processTranscription = useCallback(
    (segment: TranscriptionSegment) => {
      if (!matcherRef.current || !isAutoFollow) return;

      const match = matcherRef.current.processTranscription(segment);
      if (match) {
        setCurrentIndex(match.wordIndex);
      }
    },
    [isAutoFollow, setCurrentIndex],
  );

  const resetPosition = useCallback(
    (wordIndex: number) => {
      matcherRef.current?.setPosition(wordIndex);
      setCurrentIndex(wordIndex);
    },
    [setCurrentIndex],
  );

  return { processTranscription, resetPosition };
}
