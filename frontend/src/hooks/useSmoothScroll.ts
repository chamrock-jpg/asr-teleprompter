import { useEffect, useRef } from 'react';

/** Smoothly scroll a word element into view when the current index changes. */
export function useSmoothScroll(currentWordIndex: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolledIndex = useRef(-1);

  useEffect(() => {
    if (currentWordIndex === lastScrolledIndex.current) return;
    lastScrolledIndex.current = currentWordIndex;

    const container = containerRef.current;
    if (!container) return;

    const wordEl = container.querySelector(`[data-word-id="${currentWordIndex}"]`);
    if (wordEl) {
      wordEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex]);

  return containerRef;
}
