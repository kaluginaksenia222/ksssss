import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PAGES, Word} from '../data/transcript';
import {COLORS, DUR, EASE, FONTS, LAYOUT, PANEL_HEIGHT, TYPE} from '../design/tokens';
import {useSplit} from '../timeline';

// Пословные субтитры: белые, тонкие, без плашек и фона, не больше двух слов.
// На обычном кадре — белые, чуть ниже середины; при сплите — синие, на бежевой панели под окном.

const CAPTION_TOP = 1090;
const CAPTION_TOP_SPLIT = PANEL_HEIGHT - 130;
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
  const split = useSplit();
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
  const onPanel = split >= 0.5;

  return (
    <div
      style={{
        position: 'absolute',
        top: split < 0.5 ? CAPTION_TOP : CAPTION_TOP_SPLIT,
        left: LAYOUT.sidePadding,
        right: LAYOUT.sidePadding,
        textAlign: 'center',
        fontFamily: FONTS.body,
        fontWeight: 400,
        fontSize: TYPE.caption,
        lineHeight: 1.2,
        color: onPanel ? COLORS.navy : COLORS.white,
        textShadow: onPanel ? 'none' : '0 2px 14px rgba(0, 0, 0, 0.45)',
        // При смене кадра гаснут и проявляются уже на новом месте; в конце ролика — гаснут
        opacity: Math.min(
          Math.abs(split * 2 - 1),
          interpolate(frame, [durationInFrames - 10, durationInFrames - 2], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        ),
      }}
    >
      {page.words.map((word) => (
        <WordView key={`${index}-${word.start}`} word={word} />
      ))}
    </div>
  );
};
