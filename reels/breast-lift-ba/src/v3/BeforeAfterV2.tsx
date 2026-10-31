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
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS} from '../design/tokens';
import {InstagramHandle} from './ui';

// «До / после» подтяжки груди, версия 2: спокойная, «дорогая» подача.
// Без ползунков, линий и металла: растворения со световым бликом, смена кадров в ритм бита,
// тонкий текст и рукописный акцент. Время — секунды ролика.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Исходник: 0–9,77 с — «до» (поворот), 10,15–13,1 с — «после» (без затемнения в начале)
const SRC = {beforeFront: 0.3, afterFront: 10.6, beforeFrom: 0.3, beforeTo: 9.6, afterFrom: 10.15, afterTo: 13.1};
const BEFORE_FIT = {scale: 1.32, origin: '50% 24%'};
const BEAT = 0.6; // 100 BPM — как у музыки

const T = {hookEnd: 2.4, flickerEnd: 3.6, beforeEnd: 9.0, afterEnd: 13.4, end: 17.4};
const BEFORE_RATE = (SRC.beforeTo - SRC.beforeFrom) / (T.beforeEnd - T.flickerEnd);
const AFTER_RATE = (SRC.afterTo - SRC.afterFrom) / (T.afterEnd - T.beforeEnd);

// Кадр исходника с подгонкой «до» по уровню и медленным наездом
const Clip: React.FC<{side: 'before' | 'after'; from: number; rate?: number; push?: number; style?: React.CSSProperties}> = ({
  side,
  from,
  rate = 1,
  push = 0.012,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fit = side === 'before' ? BEFORE_FIT : {scale: 1, origin: '50% 30%'};
  return (
    <Video
      src={staticFile('source.mp4')}
      muted
      trimBefore={Math.round(from * fps)}
      playbackRate={rate}
      style={{
        position: 'absolute',
        width: 1080,
        height: 1920,
        transformOrigin: fit.origin,
        scale: String(fit.scale + (frame / fps) * push),
        ...style,
      }}
    />
  );
};

// Световой блик: тёплое пятно проходит по кадру и гаснет
const LightLeak: React.FC<{at: number; dur?: number; strength?: number}> = ({at, dur = 0.7, strength = 0.75}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + dur) * fps], [0, 1], clamp);
  if (p <= 0 || p >= 1) {
    return null;
  }
  const o = Math.sin(p * Math.PI) * strength;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(ellipse 70% 55% at ${20 + p * 60}% ${35 + p * 20}%, rgba(255,243,226,${o}), rgba(255,236,214,${o * 0.35}) 45%, rgba(255,236,214,0) 75%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

// Тонкий текст: слова проявляются по очереди из лёгкого размытия
const ThinLine: React.FC<{at: number; until: number; text: string; top: number; size?: number; spacing?: string}> = ({
  at,
  until,
  text,
  top,
  size = 40,
  spacing = '0.18em',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [until * fps - 9, until * fps], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 50,
        right: 50,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        columnGap: '0.5em',
        opacity: out,
      }}
    >
      {text.split(' ').map((w, i) => {
        const s = (at + i * 0.18) * fps;
        const v = interpolate(frame, [s, s + 10], [0, 1], {...clamp, easing: EASE.out});
        return (
          <span
            key={i}
            style={{
              fontFamily: FONTS.body,
              fontWeight: 400,
              fontSize: size,
              letterSpacing: spacing,
              textTransform: 'uppercase',
              color: COLORS.white,
              textShadow: '0 2px 16px rgba(0,0,0,0.45)',
              opacity: v,
              filter: `blur(${(1 - v) * 6}px)`,
              translate: `0px ${(1 - v) * 10}px`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Рукописный акцент: проявляется слева направо
const Script: React.FC<{at: number; until: number; text: string; top: number; size?: number}> = ({at, until, text, top, size = 110}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = interpolate(frame, [at * fps, (at + 0.9) * fps], [100, 0], {...clamp, easing: EASE.out});
  const out = interpolate(frame, [until * fps - 9, until * fps], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONTS.accent,
        fontSize: size,
        lineHeight: 1,
        color: COLORS.beige,
        textShadow: '0 2px 18px rgba(0,0,0,0.4)',
        clipPath: `inset(-30% ${reveal}% -30% 0)`,
        opacity: out,
      }}
    >
      {text}
    </div>
  );
};

// Метка в углу: тонкий текст и короткая черта, которая прорисовывается
const CornerTag: React.FC<{at: number; text: string}> = ({at, text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = interpolate(frame, [at * fps, (at + 0.5) * fps], [0, 1], {...clamp, easing: EASE.out});
  return (
    <div style={{position: 'absolute', top: 150, left: 64, opacity: v}}>
      <div style={{fontFamily: FONTS.body, fontWeight: 400, fontSize: 34, letterSpacing: '0.3em', color: COLORS.white, textShadow: '0 2px 12px rgba(0,0,0,0.45)'}}>
        {text}
      </div>
      <div style={{height: 2, width: 90 * v, backgroundColor: COLORS.beige, marginTop: 10}} />
    </div>
  );
};

// Смена кадров в ритм: «до» и «после» чередуются каждую восьмую долю
const Flicker: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const step = Math.floor(frame / ((BEAT / 2) * fps));
  const showBefore = step % 2 === 0;
  return (
    <>
      <Clip side="after" from={SRC.afterFront + 0.6} push={0} />
      {showBefore ? <Clip side="before" from={SRC.beforeFront} push={0} /> : null}
      <CornerTag at={0} text={showBefore ? 'до' : 'после'} />
    </>
  );
};

// Финал: «до» медленно растворяется в «после»
const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mix = interpolate(frame, [0.8 * fps, 2.2 * fps], [1, 0], {...clamp, easing: EASE.inOut});
  return (
    <>
      <Clip side="after" from={SRC.afterFront} push={0.008} />
      {/* «до» почти стоит на месте, чтобы не успело повернуться боком */}
      <Clip side="before" from={SRC.beforeFront} rate={0.25} push={0.008} style={{opacity: mix}} />
      <CornerTag at={0} text={mix > 0.5 ? 'до' : 'после'} />
    </>
  );
};

const SoundTrack: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const sfx = (name: string, at: number, volume: number, dur = 0.8) => (
    <Sequence key={`${name}${at}`} name={`SFX ${name}`} from={Math.round(at * fps)} durationInFrames={Math.round(dur * fps)}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
  return (
    <>
      <Audio
        src={staticFile('music/soft_beat.wav')}
        volume={(f) => interpolate(f, [durationInFrames - 1.4 * fps, durationInFrames - 1], [1, 0], clamp)}
      />
      {[1.5, T.beforeEnd, T.afterEnd + 0.8].map((at) => sfx('shimmer', at, 0.4, 1.1))}
      {[T.flickerEnd - 0.1, T.beforeEnd - 0.15].map((at) => sfx('whoosh', at, 0.14, 0.6))}
    </>
  );
};

export const BeforeAfterV2: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  const seq = (from: number, to: number) => ({from: Math.round(from * fps), durationInFrames: Math.round((to - from) * fps)});

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* Хук: сразу результат, крупно, и вопрос-интрига */}
      <Sequence name="Хук: после" {...seq(0, T.hookEnd)}>
        <Clip side="after" from={SRC.afterFront} push={0.03} />
        <ThinLine at={0.1} until={T.hookEnd} text="Это одна и та же грудь" top={1120} size={42} />
      </Sequence>
      <Sequence name="Сравнение в ритм" {...seq(T.hookEnd, T.flickerEnd)}>
        <Flicker />
      </Sequence>
      <Sequence name="До: поворот" {...seq(T.flickerEnd, T.beforeEnd + 0.5)}>
        <Clip side="before" from={SRC.beforeFrom} rate={BEFORE_RATE} push={0.006} />
        <CornerTag at={0.1} text="до" />
      </Sequence>
      <Sequence name="После" {...seq(T.beforeEnd, T.afterEnd + 0.5)}>
        <AfterIn />
      </Sequence>
      <Sequence name="Финал" {...seq(T.afterEnd, T.end)}>
        <FinaleIn />
        <ThinLine at={1.6} until={T.end - T.afterEnd + 1} text="Подтяжка груди" top={1060} size={44} spacing="0.22em" />
        <Script at={2.1} until={T.end - T.afterEnd + 1} text="результат" top={1120} />
      </Sequence>

      {/* Блики света на смене частей */}
      <LightLeak at={1.4} dur={0.9} strength={0.8} />
      <LightLeak at={T.flickerEnd - 0.25} dur={0.6} strength={0.55} />
      <LightLeak at={T.beforeEnd - 0.3} dur={0.9} strength={0.85} />
      <LightLeak at={T.afterEnd - 0.25} dur={0.8} strength={0.7} />

      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};

// «После» проявляется поверх уходящего «до» (растворение 0,5 с)
const AfterIn: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = interpolate(frame, [0, 0.5 * fps], [0, 1], {...clamp, easing: EASE.inOut});
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Clip side="after" from={SRC.afterFrom} rate={AFTER_RATE} push={0.01} />
      <CornerTag at={0.3} text="после" />
    </AbsoluteFill>
  );
};

const FinaleIn: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = interpolate(frame, [0, 0.5 * fps], [0, 1], {...clamp, easing: EASE.inOut});
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Finale />
    </AbsoluteFill>
  );
};
