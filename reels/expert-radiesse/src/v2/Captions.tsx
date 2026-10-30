import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, DUR, EASE, FONTS, LAYOUT, PANEL_HEIGHT, SPRING} from '../design/tokens';
import {PAGES, Word} from './transcript';
import {useSplit} from './timeline';

// Пословные субтитры в духе референса: слова появляются по речи, ключевое слово — в плашке.
// На видео — бежевые, чуть ниже середины; на панели — синие, под окном-вставкой.

const TOP_ON_VIDEO = 1170;
const TOP_ON_PANEL = PANEL_HEIGHT - 175;
const PAGE_TAIL = 0.6;

const WordView: React.FC<{word: Word; onPanel: boolean}> = ({word, onPanel}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(word.start * fps);
  const hl = spring({frame: frame - start, fps, config: SPRING.pop, durationInFrames: DUR.highlight});
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const text = onPanel ? COLORS.navy : COLORS.beige;
  const pillBg = onPanel ? COLORS.navy : COLORS.beige;
  const pillText = onPanel ? COLORS.beige : COLORS.navy;
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        margin: '0 0.14em',
        opacity: interpolate(frame, [start, start + DUR.word], [0, 1], {...clamp, easing: EASE.out}),
        translate: interpolate(frame, [start, start + DUR.word], ['0px 8px', '0px 0px'], {...clamp, easing: EASE.out}),
        filter: `blur(${interpolate(frame, [start, start + DUR.word], [4, 0], clamp)}px)`,
      }}
    >
      {word.hl ? (
        <span
          style={{
            position: 'absolute',
            inset: '-2px -10px',
            borderRadius: 8,
            backgroundColor: pillBg,
            transformOrigin: 'left center',
            scale: `${hl} 1`,
          }}
        />
      ) : null}
      <span style={{position: 'relative', color: word.hl && hl > 0.5 ? pillText : text}}>{word.text}</span>
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
  const onPanel = split >= 0.5;
  return (
    <div
      style={{
        position: 'absolute',
        top: onPanel ? TOP_ON_PANEL : TOP_ON_VIDEO,
        left: LAYOUT.sidePadding,
        right: LAYOUT.sidePadding,
        textAlign: 'center',
        fontFamily: FONTS.body,
        fontWeight: 700,
        fontSize: 46,
        lineHeight: 1.3,
        textShadow: onPanel ? 'none' : '0 2px 14px rgba(0, 0, 0, 0.45)',
        opacity: Math.min(
          Math.abs(split * 2 - 1),
          interpolate(frame, [durationInFrames - 10, durationInFrames - 2], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        ),
      }}
    >
      {PAGES[index].words.map((word) => (
        <WordView key={`${index}-${word.start}`} word={word} onPanel={onPanel} />
      ))}
    </div>
  );
};
