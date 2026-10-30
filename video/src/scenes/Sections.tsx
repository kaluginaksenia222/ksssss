import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, LAYOUT} from '../design/tokens';
import {Accent, Reveal, SectionLabel, Sub, Title} from '../components/ui';

// Минимальная графика: метка раздела + крупный заголовок + одна строка пояснения.
// Все времена внутри сцен — секунды от начала сцены.

const fadeOut = (frame: number, end: number) =>
  interpolate(frame, [end - 8, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.in});

// Сцена на бежевой панели (режим B)
const PanelScene: React.FC<{num: string; label: string; duration: number; children: React.ReactNode}> = ({
  num,
  label,
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = fadeOut(frame, Math.round(duration * fps));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out, filter: `blur(${(1 - out) * 8}px)`}}>
      <div style={{position: 'absolute', top: 168, left: 0, right: 0, textAlign: 'center'}}>
        <SectionLabel num={num} text={label} />
      </div>
      <div style={{position: 'absolute', top: 290, left: LAYOUT.sidePadding, right: LAYOUT.sidePadding}}>
        {children}
      </div>
    </div>
  );
};

// Сцена поверх видео (режим A): заголовок в верхней части кадра, над головой
const VideoScene: React.FC<{num: string; label: string; duration: number; children: React.ReactNode}> = ({
  num,
  label,
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = fadeOut(frame, Math.round(duration * fps));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out, filter: `blur(${(1 - out) * 8}px)`}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          height: 420,
          background: 'linear-gradient(to bottom, rgba(8, 32, 82, 0.55), rgba(8, 32, 82, 0))',
        }}
      />
      <div style={{position: 'absolute', top: 96, left: LAYOUT.sidePadding, right: LAYOUT.sidePadding}}>
        <SectionLabel num={num} text={label} color="rgba(248, 240, 229, 0.75)" />
        <div style={{height: 14}} />
        {children}
      </div>
    </div>
  );
};

// 01 — первые дни (панель)
export const FirstDays: React.FC<{duration: number}> = ({duration}) => (
  <PanelScene num="01" label="Первые дни" duration={duration}>
    <div style={{position: 'absolute', inset: 0}}>
      <Reveal at={0.24} until={4.4}>
        <Title size={104}>Первые 2–3 дня</Title>
        <Reveal at={1.86}>
          <Sub>не наклонять голову и не спать на животе</Sub>
        </Reveal>
      </Reveal>
    </div>
    <div style={{position: 'absolute', inset: 0}}>
      <Reveal at={4.56}>
        <Title size={104}>2 недели</Title>
        <Reveal at={5.28}>
          <Sub>без физических и эмоциональных нагрузок</Sub>
        </Reveal>
      </Reveal>
    </div>
  </PanelScene>
);

// 02 — кофе (видео)
export const Coffee: React.FC<{duration: number}> = ({duration}) => (
  <VideoScene num="02" label="Питание" duration={duration}>
    <Reveal at={0.08}>
      <Title size={72} color={COLORS.beige}>
        Без кофе
      </Title>
    </Reveal>
    <Reveal at={1.34}>
      <Sub color={COLORS.beige}>несколько дней — повышает давление</Sub>
    </Reveal>
  </VideoScene>
);

// 03 — холодные компрессы (панель)
export const Compress: React.FC<{duration: number}> = ({duration}) => (
  <PanelScene num="03" label="Уход" duration={duration}>
    <Reveal at={1.37}>
      <Title size={96}>Холодные компрессы</Title>
    </Reveal>
    <Reveal at={6.45}>
      <Sub>хлоргексидин из холодильника — до 5 раз в день</Sub>
    </Reveal>
  </PanelScene>
);

// 04 — швы (видео)
export const Stitches: React.FC<{duration: number}> = ({duration}) => (
  <VideoScene num="04" label="Швы" duration={duration}>
    <Reveal at={0.26}>
      <Title size={72} color={COLORS.beige}>
        Швы — на 6–7 сутки
      </Title>
    </Reveal>
    <Reveal at={2.62}>
      <Sub color={COLORS.beige}>потом наклейки ещё на неделю</Sub>
    </Reveal>
  </VideoScene>
);

// 05 — фотодинамическая терапия (панель)
export const Therapy: React.FC<{duration: number}> = ({duration}) => (
  <PanelScene num="05" label="Восстановление" duration={duration}>
    <Reveal at={1.96}>
      <Title size={84}>Фотодинамическая терапия</Title>
    </Reveal>
    <Reveal at={6.7}>
      <Sub>
        быстрее уходят отёки и синяки, а рубец становится <Accent at={9.8}>мягче</Accent>
      </Sub>
    </Reveal>
  </PanelScene>
);
