import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT, TYPE} from '../design/tokens';

// Бежевая панель с медленно дрейфующей точечной сеткой
export const DotGrid: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.beige,
        backgroundImage: `radial-gradient(circle, rgba(154, 164, 188, 0.45) 1.6px, transparent 1.8px)`,
        backgroundSize: `${LAYOUT.gridStep}px ${LAYOUT.gridStep}px`,
        backgroundPosition: `${(frame / 15) % LAYOUT.gridStep}px 0px`,
        ...style,
      }}
    />
  );
};

// Плашка темы сверху кадра
export const TopicPill: React.FC<{onVideo?: boolean}> = ({onVideo}) => (
  <div
    style={{
      padding: '10px 22px',
      borderRadius: LAYOUT.pillRadius,
      backgroundColor: onVideo ? 'rgba(8, 32, 82, 0.6)' : COLORS.beigeDark,
      color: onVideo ? COLORS.beige : COLORS.navy,
      fontFamily: FONTS.body,
      fontWeight: 500,
      fontSize: TYPE.pill,
    }}
  >
    после блефаропластики
  </div>
);

// Метка раздела «01 · ПЕРВЫЕ ДНИ»
export const SectionLabel: React.FC<{num: string; text: string; color?: string}> = ({
  num,
  text,
  color = COLORS.navy40,
}) => (
  <div
    style={{
      fontFamily: FONTS.body,
      fontWeight: 500,
      fontSize: TYPE.label,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color,
    }}
  >
    {num} · {text}
  </div>
);

// Появление снизу из размытия в секунду at; если задан until — уход в размытие.
// Время — секунды от начала сцены.
export const Reveal: React.FC<{
  at: number;
  until?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, until, style, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(at * fps);
  const end = until === undefined ? Infinity : Math.round(until * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const inn = interpolate(frame, [start, start + 9], [0, 1], {...clamp, easing: EASE.out});
  const out = Number.isFinite(end) ? interpolate(frame, [end - 7, end], [1, 0], {...clamp, easing: EASE.in}) : 1;
  const v = Math.min(inn, out);
  if (v <= 0) {
    return null;
  }
  return (
    <div
      style={{
        opacity: v,
        translate: `0px ${(1 - inn) * 28}px`,
        filter: `blur(${(1 - v) * 10}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Крупный заголовок (Coolvetica)
export const Title: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({
  size,
  color = COLORS.navy,
  children,
}) => (
  <div
    style={{
      fontFamily: FONTS.heading,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      color,
    }}
  >
    {children}
  </div>
);

// Подпись под заголовком (Helvetica Neue)
export const Sub: React.FC<{color?: string; children: React.ReactNode}> = ({color = COLORS.navy80, children}) => (
  <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 36, lineHeight: 1.25, color, marginTop: 18}}>
    {children}
  </div>
);

// Акцентное слово (Gloria Script) — прописывается слева направо
export const Accent: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  return (
    <span
      style={{
        fontFamily: FONTS.accent,
        fontWeight: 400,
        fontSize: '2.2em',
        lineHeight: 0.6,
        color: COLORS.navy,
        display: 'inline-block',
        rotate: '-4deg',
        clipPath: `inset(-20% ${interpolate(frame, [s, s + 14], [100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.out,
        })}% -20% 0)`,
      }}
    >
      {children}
    </span>
  );
};
