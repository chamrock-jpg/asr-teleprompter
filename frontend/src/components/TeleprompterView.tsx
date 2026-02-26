import { useCallback } from 'react';
import { useScriptStore } from '@/store/scriptStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { WordSpan } from './WordSpan';

interface TeleprompterViewProps {
  onWordClick: (wordIndex: number) => void;
}

export function TeleprompterView({ onWordClick }: TeleprompterViewProps) {
  const words = useScriptStore((s) => s.words);
  const currentWordIndex = useScriptStore((s) => s.currentWordIndex);
  const display = useSettingsStore((s) => s.display);
  const containerRef = useSmoothScroll(currentWordIndex);

  const handleWordClick = useCallback(
    (id: number) => {
      onWordClick(id);
    },
    [onWordClick],
  );

  if (words.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: display.textColor,
          opacity: 0.5,
          fontSize: '24px',
        }}
      >
        Please enter or import a script to begin
      </div>
    );
  }

  // Group words by paragraph
  const paragraphs: Array<{ paragraphIndex: number; wordIds: number[] }> = [];
  let currentParagraph = -1;

  for (const word of words) {
    if (word.paragraphIndex !== currentParagraph) {
      currentParagraph = word.paragraphIndex;
      paragraphs.push({ paragraphIndex: currentParagraph, wordIds: [] });
    }
    paragraphs[paragraphs.length - 1].wordIds.push(word.id);
  }

  // Highlight range: current word + 2 surrounding words
  const highlightStart = currentWordIndex;
  const highlightEnd = currentWordIndex + 2;

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: `40px ${display.marginPercent}%`,
        backgroundColor: display.backgroundColor,
        color: display.textColor,
        fontSize: `${display.fontSize}px`,
        fontFamily: display.fontFamily,
        lineHeight: display.lineHeight,
        transform: display.isMirrored ? 'scaleX(-1)' : undefined,
        scrollBehavior: 'smooth',
      }}
    >
      {paragraphs.map((para) => (
        <p key={para.paragraphIndex} style={{ marginBottom: '0.8em' }}>
          {para.wordIds.map((id) => {
            const word = words[id];
            const isHighlighted = id >= highlightStart && id <= highlightEnd;
            const isPast = id < highlightStart;
            return (
              <WordSpan
                key={id}
                id={id}
                text={word.raw + ' '}
                isHighlighted={isHighlighted}
                isPast={isPast}
                highlightColor={display.highlightColor}
                onClick={handleWordClick}
              />
            );
          })}
        </p>
      ))}
      {/* Bottom padding so last words can scroll to center */}
      <div style={{ height: '50vh' }} />
    </div>
  );
}
