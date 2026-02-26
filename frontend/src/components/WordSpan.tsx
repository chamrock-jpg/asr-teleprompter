import { memo } from 'react';

interface WordSpanProps {
  id: number;
  text: string;
  isHighlighted: boolean;
  isPast: boolean;
  highlightColor: string;
  onClick: (id: number) => void;
}

export const WordSpan = memo(function WordSpan({
  id,
  text,
  isHighlighted,
  isPast,
  highlightColor,
  onClick,
}: WordSpanProps) {
  return (
    <span
      data-word-id={id}
      onClick={() => onClick(id)}
      style={{
        cursor: 'pointer',
        padding: '2px 1px',
        borderRadius: '3px',
        transition: 'background-color 0.3s, opacity 0.3s',
        backgroundColor: isHighlighted ? highlightColor : 'transparent',
        color: isHighlighted ? '#000' : undefined,
        opacity: isPast ? 0.5 : 1,
      }}
    >
      {text}
    </span>
  );
});
