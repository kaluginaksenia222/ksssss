import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PAGES, Word} from '../data/transcript';
import {useSplit} from '../timeline';
import {COLORS, DUR, EASE, FONTS, LAYOUT, PANEL_HEIGHT, SPRING, TYPE} from '../design/tokens';

// Пословные субтитры. Две подачи:
//  onVideo — по центру поверх видео (режим A), выделение: плашка beige / текст navy;
//  onPanel — слева на бежевой панели (режим B), выделение: плашка navy / текст beige.
// Подача следует за режимом кадра (см. timeline.ts), к концу ролика блок гаснет.

const PAGE_TAIL = 0.6; // сколько держим страницу после последнего слова, если дальше пауза

const WordView: React.FC<{word: Word; onVideo: boolean}> = ({word, onVideo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(word.start * fps);
  const hl = spring({frame: frame - start, fps, config: SPRING.pop, durationInFrames: DUR.highlight});

  const textColor = onVideo ? COLORS.white : COLORS.navy;
  const hlBg = onVideo ? COLORS.beige : COLORS.navy;
  const hlText = onVideo ? COLORS.navy : COLORS.beige;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        marginRight: '0.28em',
        opacity: interpolate(frame, [start, start + DUR.word], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.out,
        }),
        translate: interpolate(frame, [start, start + DUR.word], ['0px 8px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.out,
        }),
        filter: `blur(${interpolate(frame, [start, start + DUR.word], [4, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}px)`,
        ...(word.accent
          ? {
              fontFamily: FONTS.accent,
              fontWeight: 400,
              fontSize: '2em',
              lineHeight: 0.8,
              textTransform: 'none',
              color: onVideo ? COLORS.beige : COLORS.navy,
            }
          : {}),
      }}
    >
      {word.hl && !word.accent ? (
        <span
          style={{
            position: 'absolute',
            inset: '-2px -10px',
            borderRadius: 8,
            backgroundColor: hlBg,
            transformOrigin: 'left center',
            scale: `${hl} 1`,
          }}
        />
      ) : null}
      <span
        style={{
          position: 'relative',
          color: word.hl && !word.accent && hl > 0.5 ? hlText : word.accent ? undefined : textColor,
        }}
      >
        {word.text}
      </span>
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
  const onVideo = split < 0.5;

  // Во время смены режима блок гаснет и проявляется уже в новом месте; в конце ролика — гаснет
  const out = Math.min(
    Math.abs(split * 2 - 1),
    interpolate(frame, [durationInFrames - 10, durationInFrames - 2], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: LAYOUT.sidePadding,
        right: LAYOUT.sidePadding,
        ...(onVideo ? {top: 1290, textAlign: 'center'} : {top: PANEL_HEIGHT - 190, textAlign: 'left'}),
        fontFamily: FONTS.body,
        fontWeight: 700,
        fontSize: onVideo ? 44 : TYPE.caption,
        lineHeight: 1.25,
        textShadow: onVideo ? '0 2px 16px rgba(0, 0, 0, 0.35)' : 'none',
        opacity: out,
        filter: `blur(${(1 - out) * 6}px)`,
      }}
    >
      {page.words.map((word) => (
        <WordView key={`${index}-${word.start}`} word={word} onVideo={onVideo} />
      ))}
    </div>
  );
};
