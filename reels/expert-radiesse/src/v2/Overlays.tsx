import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT} from '../design/tokens';
import {VOICE_LEVELS} from './levels';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');

// Верх видео до сплита: плашка темы, таймкод, сегменты разделов с бегунком
export const TopBar: React.FC<{sections: number[]}> = ({sections}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;
  const width = 780;
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
      <div
        style={{
          padding: '8px 18px',
          borderRadius: 999,
          backgroundColor: 'rgba(8, 32, 82, 0.6)',
          color: COLORS.beige,
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 24,
        }}
      >
        пластическая хирургия
      </div>
      <div
        style={{
          padding: '4px 14px',
          borderRadius: 999,
          backgroundColor: 'rgba(8, 32, 82, 0.7)',
          color: COLORS.beige,
          fontFamily: FONTS.mono,
          fontWeight: 500,
          fontSize: 20,
        }}
      >
        00:{pad(t / 60)}:{pad(t % 60)}:{pad(frame % fps)}
      </div>
      <div style={{position: 'relative', width, height: 16, display: 'flex', gap: 8}}>
        {sections.slice(0, -1).map((start, i) => {
          const stop = sections[i + 1];
          const active = t >= start && t < stop;
          return (
            <div
              key={start}
              style={{
                flexGrow: stop - start,
                flexBasis: 0,
                borderRadius: 5,
                backgroundColor: active ? COLORS.beige : 'rgba(248, 240, 229, 0.35)',
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            top: -9,
            left: (t / total) * width,
            width: 3,
            height: 34,
            borderRadius: 2,
            backgroundColor: COLORS.white,
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.35)',
          }}
        />
      </div>
    </div>
  );
};

// Удар-реверал: вспышка, расходящееся кольцо, слово собирается из широкой разрядки
export const LogoHit: React.FC<{text: string; top: number; holdUntil: number}> = ({text, top, holdUntil}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const outStart = Math.round(holdUntil * fps);
  const textIn = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: EASE.out});
  const textOut = interpolate(frame, [outStart, outStart + 8], [1, 0], {...clamp, easing: EASE.in});
  const v = Math.min(textIn, textOut);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: COLORS.beige,
          opacity: interpolate(frame, [0, 1, 5], [0, 0.3, 0], clamp),
        }}
      />
      <div style={{position: 'absolute', top, left: 0, right: 0, height: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: 60,
            color: COLORS.beige,
            textTransform: 'uppercase',
            letterSpacing: `${interpolate(frame, [0, 16], [0.5, 0.02], {...clamp, easing: EASE.out})}em`,
            textShadow: '0 4px 30px rgba(8, 32, 82, 0.5)',
            opacity: v,
            filter: `blur(${(1 - v) * 10}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
      </div>
    </>
  );
};

// Точечная волна голоса над швом: столбики «едут» влево, громкие — синие
export const VoiceWave: React.FC<{top: number}> = ({top}) => {
  const frame = useCurrentFrame();
  const columns = 46;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: LAYOUT.sidePadding,
        right: LAYOUT.sidePadding,
        height: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {new Array(columns).fill(0).map((_, i) => {
        const level = VOICE_LEVELS[frame - (columns - 1 - i) * 2] ?? 0;
        const dots = 1 + Math.round(level * 5);
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            {new Array(dots).fill(0).map((__, j) => (
              <div
                key={j}
                style={{width: 5, height: 5, borderRadius: 3, backgroundColor: level > 0.55 ? COLORS.navy : COLORS.navy40}}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
