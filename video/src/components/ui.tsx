import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT} from '../design/tokens';

// Белая панель с медленно дрейфующей точечной сеткой
export const DotGrid: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.white,
        backgroundImage: `radial-gradient(circle, rgba(154, 164, 188, 0.5) 1.6px, transparent 1.8px)`,
        backgroundSize: `${LAYOUT.gridStep}px ${LAYOUT.gridStep}px`,
        backgroundPosition: `${(frame / 15) % LAYOUT.gridStep}px 0px`,
        ...style,
      }}
    />
  );
};

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
  color = COLORS.white,
  children,
}) => (
  <div
    style={{
      fontFamily: FONTS.heading,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.98,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      whiteSpace: 'pre-line',
      color,
      textShadow: color === COLORS.white ? '0 2px 18px rgba(0, 0, 0, 0.35)' : 'none',
    }}
  >
    {children}
  </div>
);
