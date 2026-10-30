import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, SPRING} from './design/tokens';

// Кинетическая типографика экспертного стиля.
// Все времена — секунды от начала своего <Sequence>.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type Tone = 'light' | 'dark';
// light — бежевый фон, синий текст; dark — синий фон, бежевый текст
export const ink = (tone: Tone) => (tone === 'light' ? COLORS.navy : COLORS.beige);

// Мелкая строка: слова выезжают из-под маски по очереди
export const Small: React.FC<{at: number; tone: Tone; children: string; size?: number}> = ({
  at,
  tone,
  children,
  size = 36,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: '0.28em'}}>
      {children.split(' ').map((word, i) => {
        const s = Math.round((at + i * 0.06) * fps);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 4}}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: FONTS.body,
                fontWeight: 500,
                fontSize: size,
                color: ink(tone),
                opacity: 0.85,
                translate: interpolate(frame, [s, s + 9], ['0px 110%', '0px 0%'], {...clamp, easing: EASE.out}),
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Крупное слово: буквы поднимаются по одной с лёгким перелётом
export const Big: React.FC<{at: number; tone: Tone; children: string; size?: number}> = ({
  at,
  tone,
  children,
  size = 96,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingBottom: 6,
        fontFamily: FONTS.heading,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        color: ink(tone),
        whiteSpace: 'pre',
      }}
    >
      {children.split('').map((ch, i) => {
        const p = spring({frame: frame - Math.round(at * fps) - i, fps, config: SPRING.pop});
        return (
          <span key={i} style={{display: 'inline-block', translate: `0px ${(1 - p) * 105}%`}}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// Ключевое слово в плашке — выскакивает с поворотом
export const PillWord: React.FC<{at: number; tone: Tone; children: string; size?: number}> = ({
  at,
  tone,
  children,
  size = 52,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: SPRING.pop});
  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          padding: '6px 26px 10px',
          borderRadius: 999,
          backgroundColor: tone === 'light' ? COLORS.navy : COLORS.beige,
          color: tone === 'light' ? COLORS.beige : COLORS.navy,
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: size,
          scale: String(p),
          rotate: `${interpolate(p, [0, 1], [-8, 0])}deg`,
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Блок текста сцены: уходит вверх в размытие к моменту until
export const Stack: React.FC<{until: number; top: number; children: React.ReactNode}> = ({until, top, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const out = interpolate(frame, [end - 7, end], [0, 1], {...clamp, easing: EASE.in});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 64,
        right: 64,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        translate: `0px ${-out * 60}px`,
        opacity: 1 - out,
        filter: `blur(${out * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

// Линия, которая прорисовывается за dur секунд начиная с at
export const useDraw = (at: number, dur = 0.6) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return interpolate(frame, [at * fps, (at + dur) * fps], [1, 0], {...clamp, easing: EASE.out});
};

export const DrawPath: React.FC<{d: string; at: number; dur?: number; width?: number; color: string}> = ({
  d,
  at,
  dur,
  width = 5,
  color,
}) => (
  <path
    d={d}
    stroke={color}
    strokeWidth={width}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={useDraw(at, dur)}
  />
);
