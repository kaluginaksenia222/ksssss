import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, LAYOUT, PANEL_HEIGHT} from '../design/tokens';
import {Reveal, Title} from '../components/ui';

// Все времена — секунды от начала своего <Sequence>.

// Лёгкое затемнение сверху, чтобы белый заголовок читался на видео
const TopShade: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      height: 520,
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0))',
    }}
  />
);

// Хук: сначала идёт чистое видео, затем строки заголовка выезжают из-под маски
const HookLine: React.FC<{at: number; size: number; children: React.ReactNode}> = ({at, size, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6}}>
      <div
        style={{
          translate: interpolate(frame, [s, s + 12], ['0px 110%', '0px 0%'], {...clamp, easing: EASE.out}),
          filter: `blur(${interpolate(frame, [s, s + 10], [8, 0], clamp)}px)`,
        }}
      >
        <Title size={size}>{children}</Title>
      </div>
    </div>
  );
};

export const Hook: React.FC<{until: number}> = ({until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const shade = interpolate(frame, [12, 24], [0, 1], clamp);
  const out = interpolate(frame, [end - 8, end], [1, 0], {...clamp, easing: EASE.in});
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out, filter: `blur(${(1 - out) * 10}px)`}}>
      <div style={{position: 'absolute', inset: 0, opacity: shade}}>
        <TopShade />
      </div>
      <div style={{position: 'absolute', top: 120, left: LAYOUT.sidePadding, right: LAYOUT.sidePadding}}>
        <HookLine at={0.5} size={104}>
          Рекомендации
        </HookLine>
        <HookLine at={0.68} size={64}>
          после блефаропластики
        </HookLine>
      </div>
    </div>
  );
};

// Белый заголовок поверх видео, над головой
export const VideoTitle: React.FC<{until: number; size?: number; children: React.ReactNode}> = ({
  until,
  size = 84,
  children,
}) => (
  <Reveal at={0} until={until} style={{position: 'absolute', inset: 0}}>
    <TopShade />
    <div style={{position: 'absolute', top: 120, left: LAYOUT.sidePadding, right: LAYOUT.sidePadding}}>
      <Title size={size}>{children}</Title>
    </div>
  </Reveal>
);

// Синий заголовок на белой панели, по центру панели
export const PanelTitle: React.FC<{at: number; until: number; children: React.ReactNode}> = ({
  at,
  until,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: LAYOUT.sidePadding,
      right: LAYOUT.sidePadding,
      height: PANEL_HEIGHT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    <Reveal at={at} until={until}>
      <Title size={84} color={COLORS.navy}>
        {children}
      </Title>
    </Reveal>
  </div>
);
