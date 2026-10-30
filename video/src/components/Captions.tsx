import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PAGES, Word} from '../data/transcript';
import {COLORS, DUR, EASE, FONTS, LAYOUT, TYPE} from '../design/tokens';

// Пословные субтитры: белые, тонкие, без плашек и фона, не больше двух слов.
// Всегда стоят на видео в нижней трети (и в полноэкранном режиме, и под панелью).

const CAPTION_TOP = 1400;
const PAGE_TAIL = 0.6; // сколько держим страницу после последнего слова, если дальше пауза

const WordView: React.FC<{word: Word}> = ({word}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(word.start * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

  return (
    <span
      style={{
        display: 'inline-block',
        margin: '0 0.14em',
        opacity: interpolate(frame, [start, start + DUR.word], [0, 1], {...clamp, easing: EASE.out}),
        translate: interpolate(frame, [start, start + DUR.word], ['0px 10px', '0px 0px'], {...clamp, easing: EASE.out}),
        filter: `blur(${interpolate(frame, [start, start + DUR.word], [4, 0], clamp)}px)`,
        ...(word.accent ? {fontFamily: FONTS.accent, fontSize: '1.9em', lineHeight: 0.8} : {}),
      }}
    >
      {word.text}
    </span>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;

  const index = PAGES.findIndex((page, i) => {
    const next = PAGES[i + 1];
    const from = page.words[0].start - 0.05;
    const lastEnd = page.words[page.words.length - 1].end;
    const to = next ? Math.min(next.words[0].start - 0.05, lastEnd + PAGE_TAIL) : Infinity;
    return t >= from && t < to;
  });
  if (index === -1) {
    return null;
  }
  const page = PAGES[index];

  return (
    <div
      style={{
        position: 'absolute',
        top: CAPTION_TOP,
        left: LAYOUT.sidePadding,
        right: LAYOUT.sidePadding,
        textAlign: 'center',
        fontFamily: FONTS.body,
        fontWeight: 400,
        fontSize: TYPE.caption,
        lineHeight: 1.2,
        color: COLORS.white,
        textShadow: '0 2px 14px rgba(0, 0, 0, 0.45)',
        opacity: interpolate(frame, [durationInFrames - 10, durationInFrames - 2], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {page.words.map((word) => (
        <WordView key={`${index}-${word.start}`} word={word} />
      ))}
    </div>
  );
};
