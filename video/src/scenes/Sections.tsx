import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, LAYOUT, PANEL_HEIGHT, SPRING} from '../design/tokens';
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
const HookLine: React.FC<{at: number; size: number; color?: string; children: React.ReactNode}> = ({
  at,
  size,
  color,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6, flexShrink: 0}}>
      <div
        style={{
          translate: interpolate(frame, [s, s + 12], ['0px 110%', '0px 0%'], {...clamp, easing: EASE.out}),
          filter: `blur(${interpolate(frame, [s, s + 10], [8, 0], clamp)}px)`,
        }}
      >
        <Title size={size} color={color}>
          {children}
        </Title>
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

// Синий заголовок на белой панели: слова выезжают по очереди из-под маски
const PanelTitle: React.FC<{at: number; text: string}> = ({at, text}) => (
  <div
    style={{
      position: 'absolute',
      top: 150,
      left: LAYOUT.sidePadding,
      right: LAYOUT.sidePadding,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: 22,
    }}
  >
    {text.split(' ').map((word, i) => (
      <HookLine key={word} at={at + i * 0.12} size={76} color={COLORS.navy}>
        {word}
      </HookLine>
    ))}
  </div>
);

// Вставка на белой панели: сама уходит в размытие к моменту until
const PanelInsert: React.FC<{until: number; children: React.ReactNode}> = ({until, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const out = interpolate(frame, [end - 8, end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.in,
  });
  return (
    <div style={{position: 'absolute', inset: 0, height: PANEL_HEIGHT, opacity: out, filter: `blur(${(1 - out) * 8}px)`}}>
      {children}
    </div>
  );
};

// Линия, которая прорисовывается за dur секунд начиная с at
const useDraw = (at: number, dur: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  return interpolate(frame, [s, s + Math.round(dur * fps)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.out,
  });
};

const DrawPath: React.FC<{d: string; at: number; dur?: number; width?: number}> = ({d, at, dur = 0.5, width = 4}) => (
  <path
    d={d}
    stroke={COLORS.navy}
    strokeWidth={width}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={useDraw(at, dur)}
  />
);

// Снежинка прорисовывается луч за лучом и медленно вращается
const Snowflake: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const arms = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={330} height={330} viewBox="-60 -60 120 120" style={{rotate: `${frame * 0.25}deg`}}>
      {arms.map((deg, i) => (
        <g key={deg} transform={`rotate(${deg})`}>
          <DrawPath d="M0 0 V-50" at={at + i * 0.08} />
          <DrawPath d="M-12 -38 L0 -28 L12 -38" at={at + 0.3 + i * 0.08} />
          <DrawPath d="M-8 -50 L0 -44 L8 -50" at={at + 0.4 + i * 0.08} width={3} />
        </g>
      ))}
      <circle cx={0} cy={0} r={6} fill={COLORS.navy} style={{scale: String(1 - useDraw(at, 0.4))}} />
    </svg>
  );
};

// Пять отметок «раз в день» — заполняются по очереди
const DayDoses: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: 22, justifyContent: 'center'}}>
      {[0, 1, 2, 3, 4].map((i) => {
        const p = spring({frame: frame - Math.round((at + i * 0.1) * fps), fps, config: SPRING.pop});
        return (
          <div
            key={i}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              border: `3px solid ${COLORS.navy}`,
              backgroundColor: p > 0.5 ? COLORS.navy : COLORS.white,
              scale: String(interpolate(p, [0, 1], [0.6, 1])),
              opacity: interpolate(p, [0, 0.4], [0.25, 1], {extrapolateRight: 'clamp'}),
            }}
          />
        );
      })}
    </div>
  );
};

export const CompressInsert: React.FC<{until: number}> = ({until}) => (
  <PanelInsert until={until}>
    <PanelTitle at={0.3} text="Холодные компрессы" />
    <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <Snowflake at={0.7} />
    </div>
    <div style={{position: 'absolute', top: 740, left: 0, right: 0}}>
      <DayDoses at={5.4} />
    </div>
  </PanelInsert>
);

// Лампа: лучи прорисовываются и вращаются, от центра расходятся волны света
const Light: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - Math.round(at * fps);
  const rays = new Array(12).fill(0).map((_, i) => i * 30);
  const core = spring({frame: local, fps, config: SPRING.pop});
  return (
    <svg width={420} height={420} viewBox="-100 -100 200 200">
      {[0, 1, 2].map((k) => {
        const cycle = ((local / fps + k * 0.6) % 1.8) / 1.8;
        return local < 0 ? null : (
          <circle
            key={k}
            cx={0}
            cy={0}
            r={26 + cycle * 70}
            fill="none"
            stroke={COLORS.navy}
            strokeWidth={2.5}
            opacity={(1 - cycle) * 0.7}
          />
        );
      })}
      <g transform={`rotate(${frame * 0.4})`}>
        {rays.map((deg, i) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <DrawPath d="M0 -40 V-62" at={at + 0.2 + i * 0.04} width={5} />
          </g>
        ))}
      </g>
      <circle cx={0} cy={0} r={26} fill={COLORS.navy} style={{scale: String(core)}} />
    </svg>
  );
};

export const TherapyInsert: React.FC<{until: number}> = ({until}) => (
  <PanelInsert until={until}>
    <PanelTitle at={0.3} text="Фотодинамическая терапия" />
    <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <Light at={0.8} />
    </div>
  </PanelInsert>
);
