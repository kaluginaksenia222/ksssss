import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {VOICE_LEVELS} from '../data/levels';
import {COLORS, DUR, EASE, FONTS, LAYOUT} from '../design/tokens';
import {TopicPill} from './ui';

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');

// Декоративный «монтажный таймлайн» режима A: плашка темы, таймкод,
// сегменты разделов и плейхед, который идёт через весь ролик.
export const TimelineBar: React.FC<{sections: {start: number; end: number}[]}> = ({sections}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;
  const width = LAYOUT.width - 2 * 150;
  const gap = 8;

  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <TopicPill onVideo />
      <div
        style={{
          padding: '6px 18px',
          borderRadius: LAYOUT.pillRadius,
          backgroundColor: 'rgba(8, 32, 82, 0.7)',
          color: COLORS.beige,
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 24,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        00:{pad(t / 60)}:{pad(t % 60)}:{pad(frame % fps)}
      </div>
      <div style={{position: 'relative', width, height: 22, display: 'flex', gap}}>
        {sections.map((s) => {
          const active = t >= s.start && t < s.end;
          return (
            <div
              key={s.start}
              style={{
                flexGrow: s.end - s.start,
                flexBasis: 0,
                height: 22,
                borderRadius: 6,
                backgroundColor: active ? COLORS.beige : 'rgba(248, 240, 229, 0.45)',
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: (t / total) * width,
            width: 4,
            height: 42,
            borderRadius: 2,
            backgroundColor: COLORS.white,
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>
    </div>
  );
};

// Точечная волна голоса над швом: столбики «едут» влево, громкие — navy
export const VoiceWave: React.FC<{top: number}> = ({top}) => {
  const frame = useCurrentFrame();
  const columns = 46;
  const step = 2;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: LAYOUT.sidePadding,
        right: LAYOUT.sidePadding,
        height: 70,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {new Array(columns).fill(0).map((_, i) => {
        const level = VOICE_LEVELS[frame - (columns - 1 - i) * step] ?? 0;
        const dots = 1 + Math.round(level * 6);
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            {new Array(dots).fill(0).map((__, j) => (
              <div
                key={j}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: level > 0.55 ? COLORS.navy : COLORS.navy40,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

// Удар-реверал: вспышка, кольцо, слово собирается из широкой разрядки
export const LogoHit: React.FC<{text: string; holdUntil: number}> = ({text, holdUntil}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const outStart = Math.round(holdUntil * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

  const textIn = interpolate(frame, [0, DUR.logoIn], [0, 1], {...clamp, easing: EASE.out});
  const textOut = interpolate(frame, [outStart, outStart + DUR.logoOut], [1, 0], {...clamp, easing: EASE.in});

  return (
    <>
      {/* Вспышка яркости */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: COLORS.beige,
          opacity: interpolate(frame, [0, 1, 4], [0, 0.35, 0], clamp),
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 1150,
          left: 0,
          right: 0,
          height: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Кольцо расходится из центра */}
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            border: `3px solid ${COLORS.beige}`,
            scale: String(interpolate(frame, [0, 20], [0.5, 1.35], {...clamp, easing: EASE.out})),
            opacity: interpolate(frame, [0, 4, 20], [0, 0.9, 0], clamp),
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            opacity: Math.min(textIn, textOut),
            filter: `blur(${(1 - Math.min(textIn, textOut)) * 10}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 900,
              fontSize: 60,
              color: COLORS.beige,
              textTransform: 'uppercase',
              letterSpacing: `${interpolate(frame, [0, DUR.logoIn + 4], [0.5, 0.01], {...clamp, easing: EASE.out})}em`,
              textShadow: '0 4px 30px rgba(8, 32, 82, 0.5)',
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </>
  );
};
