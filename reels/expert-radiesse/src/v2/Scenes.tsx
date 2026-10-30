import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, PANEL_HEIGHT, SPRING} from '../design/tokens';
import {Check, MonoLabel, Pill, Pop, Window, usePop} from './ui';

// Вставки на бежевой панели. Время — секунды от начала своего <Sequence>.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Обёртка вставки: плашка темы, метка раздела, окно по центру панели; вход и выход
export const PanelScene: React.FC<{label: string; until: number; children: React.ReactNode}> = ({
  label,
  until,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const inn = interpolate(frame, [4, 14], [0, 1], {...clamp, easing: EASE.out});
  const out = interpolate(frame, [end - 8, end], [1, 0], {...clamp, easing: EASE.in});
  const v = Math.min(inn, out);
  return (
    <div style={{position: 'absolute', inset: 0, height: PANEL_HEIGHT}}>
      <div style={{position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Pill>пластическая хирургия</Pill>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 0,
          right: 0,
          bottom: 190,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          opacity: v,
          filter: `blur(${(1 - v) * 8}px)`,
        }}
      >
        <MonoLabel>{label}</MonoLabel>
        <div style={{scale: String(interpolate(v, [0, 1], [0.96, 1])), translate: `0px ${(1 - inn) * 20}px`}}>
          {children}
        </div>
      </div>
    </div>
  );
};

// «Живой» телефон: настоящий кадр из видео врача в рамке
const Phone: React.FC<{src: string; at: number; rotate: number; dx: number}> = ({src, at, rotate, dx}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: SPRING.pop});
  return (
    <div
      style={{
        position: 'absolute',
        left: dx,
        top: 0,
        width: 150,
        height: 300,
        borderRadius: 26,
        border: `6px solid #111`,
        overflow: 'hidden',
        backgroundColor: '#111',
        boxShadow: '0 12px 28px rgba(8, 32, 82, 0.25)',
        translate: `${(1 - p) * -260}px 0px`,
        rotate: `${interpolate(p, [0, 1], [rotate - 14, rotate])}deg`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      }}
    >
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  );
};

const PhoneStack: React.FC<{at: number}> = ({at}) => (
  <div style={{position: 'relative', width: 250, height: 310, flexShrink: 0}}>
    <Phone src="v2/thumb_52.5.jpg" at={at} rotate={-10} dx={0} />
    <Phone src="v2/thumb_37.jpg" at={at + 0.1} rotate={-4} dx={45} />
    <Phone src="v2/thumb_20.jpg" at={at + 0.2} rotate={3} dx={90} />
  </div>
);

// Строка списка: название, справа тег; галочка выскакивает в момент checkAt
const Option: React.FC<{at: number; title: string; tag?: string; tagAt?: number; strong?: boolean}> = ({
  at,
  title,
  tag,
  tagAt = 1e6,
  strong,
}) => {
  const t = usePop(tagAt);
  return (
    <Pop
      at={at}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        borderRadius: 16,
        backgroundColor: COLORS.card,
        border: `1.5px solid ${strong && t > 0.5 ? COLORS.navy : COLORS.beigeDark}`,
        boxShadow: `0 4px 14px ${COLORS.shadow}`,
      }}
    >
      <div style={{flex: 1, fontFamily: FONTS.body, fontWeight: 700, fontSize: 28, color: COLORS.navy}}>{title}</div>
      {tag ? (
        <div
          style={{
            padding: '4px 12px',
            borderRadius: 999,
            fontFamily: FONTS.mono,
            fontWeight: 500,
            fontSize: 18,
            color: strong ? COLORS.beige : COLORS.navy80,
            backgroundColor: strong ? COLORS.navy : COLORS.beigeDark,
            scale: String(t),
          }}
        >
          {tag}
        </div>
      ) : null}
      {strong ? <Check at={tagAt + 0.1} size={30} /> : null}
    </Pop>
  );
};

// 01 — чего боятся пациенты и что на самом деле мешает хирургу
export const Fears: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="01 · Страхи пациентов" until={until}>
    <Window title="Что мешает хирургу">
      <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
        <PhoneStack at={0.86} />
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <Option at={2.32} title="Филлеры" tag="редко" tagAt={4.52} />
          <Option at={3.44} title="Нити" tag="редко" tagAt={4.62} />
          <Option at={7.92} title="Аппаратные методики" tag="мешают" tagAt={8.3} strong />
        </div>
      </div>
    </Window>
  </PanelScene>
);

// Моменты появлений (секунды от начала сцены) — под них тихий «поп»
export const FEARS_POPS = [0.86, 2.32, 3.44, 7.92];
