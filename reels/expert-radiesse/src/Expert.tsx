import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fontsLoaded} from './design/fonts';
import {COLORS, EASE, FONTS} from './design/tokens';
import {Big, DrawPath, PillWord, Small, Stack, ink} from './kinetic';

// Экспертный рилс: врач в своём кадре на весь экран (без вырезки из фона).
// Ключевые фразы — кинетической типографикой чуть ниже середины, на груди, не на лице.
// Сильный хук: кадр влетает из сильного приближения, «МЕШАЮТ» падает с ударом и дрожью кадра.
// На ключевых словах — резкий наезд. Предмет речи рисуется прямо поверх кадра, без карточек.
// Время — секунды по расшифровке голоса.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Крупность кадра по сценам: резкая смена = эффект склейки
const ZOOMS = [
  {at: 0, scale: 1},
  {at: 3.2, scale: 1.14},
  {at: 5.05, scale: 1},
  {at: 9.05, scale: 1.14},
  {at: 11.7, scale: 1},
];

// Текст на видео стоит отсюда — чуть ниже середины кадра
const TEXT_TOP = 1010;

// Хук: удар «МЕШАЮТ» — дрожь кадра и вспышка
const SLAM_AT = 1.76;

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const z = ZOOMS.reduce((acc, item) => (t >= item.at ? item : acc), ZOOMS[0]);
  const drift = interpolate(t - z.at, [0, 6], [0, 0.03], {extrapolateRight: 'clamp'});
  // Хук: первые 8 кадров кадр влетает из приближения 1.4 с размытием движения
  const slamIn = interpolate(frame, [0, 8], [0.4, 0], {...clamp, easing: EASE.out});
  // Дрожь кадра на ударе «МЕШАЮТ», затухает за 10 кадров
  const k = frame - Math.round(SLAM_AT * fps);
  const shake = k >= 0 && k < 10 ? (1 - k / 10) * 14 : 0;
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{
          width: 1080,
          height: 1920,
          transformOrigin: '50% 28%',
          scale: String(z.scale + drift + slamIn),
          translate: `${Math.sin(k * 2.7) * shake}px ${Math.cos(k * 3.1) * shake}px`,
          filter: `blur(${slamIn * 25}px)`,
        }}
      />
      {/* Затемнение снизу, чтобы бежевый текст читался на груди */}
      <AbsoluteFill
        style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 42%, rgba(8,32,82,0.55) 75%, rgba(8,32,82,0.7) 100%)'}}
      />
    </AbsoluteFill>
  );
};

// Вспышки хука: на первом кадре и на ударе «МЕШАЮТ»
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = frame - Math.round(SLAM_AT * fps);
  const v = Math.max(
    interpolate(frame, [0, 6], [0.7, 0], clamp),
    k >= 0 ? interpolate(k, [0, 5], [0.35, 0], clamp) : 0,
  );
  return <AbsoluteFill style={{backgroundColor: COLORS.beige, opacity: v}} />;
};

// Слово-удар: падает крупной плашкой из масштаба 2.2, под ним прорисовывается линия
const Slam: React.FC<{at: number; children: string}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = frame - Math.round(at * fps);
  const p = interpolate(k, [0, 6], [0, 1], {...clamp, easing: EASE.out});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          padding: '4px 30px 12px',
          borderRadius: 999,
          backgroundColor: COLORS.beige,
          color: COLORS.navy,
          fontFamily: FONTS.heading,
          fontWeight: 900,
          fontSize: 92,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          scale: String(interpolate(p, [0, 1], [2.2, 1])),
          rotate: `${interpolate(p, [0, 1], [-10, -2])}deg`,
          opacity: interpolate(k, [0, 2], [0, 1], clamp),
        }}
      >
        {children}
      </div>
      <svg width={440} height={40} viewBox="0 0 440 40" style={{marginTop: -4}}>
        <DrawPath d="M10 24 C110 8 230 36 330 18 C370 12 405 16 430 22" at={at + 0.25} dur={0.4} color={COLORS.beige} width={6} />
      </svg>
    </div>
  );
};

// Шприц: прорисовывается, на кончике иглы появляется капля
const Syringe: React.FC<{at: number; color: string}> = ({at, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = interpolate(frame, [(at + 0.6) * fps, (at + 0.8) * fps], [0, 1], clamp);
  return (
    <svg width={520} height={190} viewBox="0 0 520 190">
      <DrawPath d="M30 95 H70 M70 60 V130" at={at} color={color} width={8} />
      <DrawPath d="M70 95 H120" at={at + 0.05} color={color} width={8} />
      <DrawPath d="M120 60 H360 V130 H120 Z" at={at + 0.1} color={color} width={8} />
      <DrawPath d="M170 60 V80 M220 60 V85 M270 60 V80 M320 60 V85" at={at + 0.3} color={color} width={5} />
      <DrawPath d="M360 82 H400 V108 H360" at={at + 0.35} color={color} width={8} />
      <DrawPath d="M400 95 H490" at={at + 0.45} color={color} width={5} />
      <circle cx={500} cy={95 + drop * 18} r={9 * drop} fill={color} />
    </svg>
  );
};

// Игла с волнистой нитью
const Thread: React.FC<{at: number; color: string}> = ({at, color}) => (
  <svg width={520} height={190} viewBox="0 0 520 190">
    <DrawPath d="M300 95 L490 95" at={at} color={color} width={7} />
    <DrawPath d="M318 86 C306 86 306 104 318 104 L340 104 C352 104 352 86 340 86 Z" at={at + 0.15} color={color} width={4} />
    <DrawPath
      d="M318 95 C270 95 260 30 210 40 C150 52 170 160 110 150 C60 142 70 70 30 80"
      at={at + 0.3}
      dur={0.9}
      color={color}
      width={5}
    />
  </svg>
);

// Плашка с ником в Instagram внизу кадра
const InstagramHandle: React.FC<{handle: string}> = ({handle}) => (
  <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 16px 8px 12px',
        borderRadius: 999,
        backgroundColor: 'rgba(8, 32, 82, 0.55)',
        color: COLORS.white,
        fontFamily: FONTS.body,
        fontWeight: 500,
        fontSize: 24,
      }}
    >
      <svg width={24} height={24} viewBox="0 0 24 24">
        <rect x={2} y={2} width={20} height={20} rx={6} fill="none" stroke={COLORS.white} strokeWidth={2} />
        <circle cx={12} cy={12} r={4.5} fill="none" stroke={COLORS.white} strokeWidth={2} />
        <circle cx={17.3} cy={6.7} r={1.3} fill={COLORS.white} />
      </svg>
      @{handle}
    </div>
  </AbsoluteFill>
);

const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  const whooshes = [0];
  const impacts = [0, SLAM_AT];
  const pops = [7.6, 8.7, 10.1];
  return (
    <>
      {whooshes.map((at) => (
        <Sequence key={`w${at}`} name="SFX свуш" from={Math.round(at * fps)} durationInFrames={Math.round(0.6 * fps)}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.2} />
        </Sequence>
      ))}
      {impacts.map((at) => (
        <Sequence key={`i${at}`} name="SFX удар" from={Math.round(at * fps)} durationInFrames={Math.round(0.7 * fps)}>
          <Audio src={staticFile('sfx/impact.wav')} volume={0.35} />
        </Sequence>
      ))}
      {pops.map((at) => (
        <Sequence key={`p${at}`} name="SFX поп" from={Math.round(at * fps)} durationInFrames={Math.round(0.2 * fps)}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.12} />
        </Sequence>
      ))}
    </>
  );
};

export const Expert: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  const seq = (from: number, to: number) => ({from: Math.round(from * fps), durationInFrames: Math.round((to - from) * fps)});

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <Flash />

      <Sequence name="01 Вопрос" {...seq(0, 3.2)}>
        <Stack until={3.2} top={TEXT_TOP}>
          <Small at={0} tone="dark">какие</Small>
          <Big at={0.24} tone="dark" size={72}>
            Косметологические
          </Big>
          <Small at={1.12} tone="dark">процедуры</Small>
          <Slam at={SLAM_AT}>мешают</Slam>
          <Small at={2.08} tone="dark">пластическому хирургу?</Small>
        </Stack>
      </Sequence>

      <Sequence name="02 Их немного" {...seq(3.2, 5.05)}>
        <Stack until={1.85} top={TEXT_TOP}>
          <Small at={0.08} tone="dark">на самом деле</Small>
          <Big at={0.52} tone="dark" size={88}>
            их не так
          </Big>
          <Big at={1.0} tone="dark" size={110}>
            много
          </Big>
        </Stack>
      </Sequence>

      <Sequence name="03 Страх пациентов" {...seq(5.05, 6.95)}>
        <Stack until={1.9} top={TEXT_TOP}>
          <Small at={0.07} tone="dark">чего всегда</Small>
          <Big at={0.71} tone="dark" size={110}>
            боятся
          </Big>
          <Small at={1.23} tone="dark">пациенты</Small>
        </Stack>
      </Sequence>

      <Sequence name="04 Филлеры и нити" {...seq(6.95, 9.05)}>
        <Stack until={2.1} top={TEXT_TOP - 60}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <Syringe at={0.27} color={ink('dark')} />
            <PillWord at={0.65} tone="dark">
              филлеры
            </PillWord>
            <div style={{height: 24}} />
            <Thread at={1.39} color={ink('dark')} />
            <PillWord at={1.75} tone="dark">
              нити
            </PillWord>
          </div>
        </Stack>
      </Sequence>

      <Sequence name="05 Не всегда мешает" {...seq(9.05, 11.7)}>
        <Stack until={2.65} top={TEXT_TOP}>
          <Small at={0.07} tone="dark">это</Small>
          <Big at={0.23} tone="dark" size={100}>
            не всегда
          </Big>
          <PillWord at={1.05} tone="dark">
            мешает
          </PillWord>
          <Small at={1.49} tone="dark">нам, пластическим хирургам</Small>
        </Stack>
      </Sequence>

      <InstagramHandle handle="dr_kudryakov" />
      <Audio src={staticFile('source.mp4')} />
      <SoundEffects />
    </AbsoluteFill>
  );
};
