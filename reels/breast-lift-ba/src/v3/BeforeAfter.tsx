import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS, SPRING} from '../design/tokens';
import {Glass, MetalTitle} from './parts';
import {InstagramHandle} from './ui';

// Рилс «до / после» подтяжки груди, без голоса. Хук на первом кадре — сравнение со слайдером.
// Исходник: 0–9,77 с — «до» (поворот), 9,77–13,1 с — «после». Время ниже — секунды ролика.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Куски исходника (секунды) и как их показываем
const SRC = {beforeFront: 0.3, afterFront: 10.2, beforeFrom: 0, beforeTo: 9.77, afterFrom: 10.15, afterTo: 13.1};
// «До» снято дальше — приближаем, чтобы грудь стояла на том же уровне, что и в «после»
const BEFORE_FIT = {scale: 1.32, origin: '50% 24%'};

// Таймлайн ролика (секунды)
const T = {hookEnd: 2.6, beforeEnd: 9.1, wipe: 0.6, afterEnd: 14.2, end: 17.0};
const BEFORE_RATE = (SRC.beforeTo - SRC.beforeFrom) / (T.beforeEnd - T.hookEnd);
const AFTER_RATE = (SRC.afterTo - SRC.afterFrom) / (T.afterEnd - T.beforeEnd);

// Кадр исходника: «до» или «после», с приближением и медленным наездом
const Clip: React.FC<{side: 'before' | 'after'; from: number; rate?: number; drift?: number}> = ({side, from, rate = 1, drift = 0}) => {
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
        scale: String(fit.scale + (frame / fps) * drift),
      }}
    />
  );
};

// Метка «ДО» / «ПОСЛЕ» — стекло, впрыгивает
const SideLabel: React.FC<{text: string; at: number; x: number; top?: number}> = ({text, at, x, top = 150}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: SPRING.pop});
  return (
    <div style={{position: 'absolute', top, left: x, translate: '-50% 0', scale: String(p), opacity: interpolate(p, [0, 0.3], [0, 1], clamp)}}>
      <Glass style={{padding: '8px 22px', borderRadius: 999}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', color: COLORS.white}}>{text}</div>
      </Glass>
    </div>
  );
};

// Линия-разделитель со стеклянной ручкой
const Divider: React.FC<{x: number}> = ({x}) => (
  <>
    <div style={{position: 'absolute', top: 0, bottom: 0, left: x - 2, width: 4, backgroundColor: COLORS.white, boxShadow: '0 0 18px rgba(0,0,0,0.35)'}} />
    <div
      style={{
        position: 'absolute',
        top: 900,
        left: x - 38,
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: 'rgba(255,255,255,0.25)',
        border: `3px solid ${COLORS.white}`,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.white,
        fontFamily: FONTS.body,
        fontWeight: 700,
        fontSize: 30,
      }}
    >
      ‹ ›
    </div>
  </>
);

// Хук: с первого кадра сравнение «до | после», ползунок ездит туда-обратно
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // ползунок: стартует в центре, уходит влево (больше «после»), вправо (больше «до») и встаёт в центр
  const x = interpolate(t, [0, 0.5, 1.2, 1.9, 2.4], [540, 300, 780, 540, 540], {...clamp, easing: EASE.inOut});
  const zoomIn = interpolate(frame, [0, 10], [1.08, 1], {...clamp, easing: EASE.out});
  return (
    <AbsoluteFill style={{scale: String(zoomIn)}}>
      <Clip side="after" from={SRC.afterFront} drift={0.01} />
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${1080 - x}px 0 0)`}}>
        <Clip side="before" from={SRC.beforeFront} drift={0.01} />
      </div>
      <Divider x={x} />
      <SideLabel text="ДО" at={0} x={Math.min(x / 2, 300)} />
      <SideLabel text="ПОСЛЕ" at={0.05} x={Math.max(x + (1080 - x) / 2, 780)} />
    </AbsoluteFill>
  );
};

// Переход «до» → «после»: линия проходит справа налево и открывает новый кадр
const WipeToAfter: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = interpolate(frame, [0, T.wipe * fps], [1080, 0], {...clamp, easing: EASE.inOut});
  return (
    <>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${x}px)`}}>
        <Clip side="after" from={SRC.afterFrom} rate={AFTER_RATE} />
      </div>
      {x > 0 && x < 1080 ? <Divider x={x} /> : null}
    </>
  );
};

// Финал: «до» и «после» рядом, каждая половина въезжает со своей стороны
const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: SPRING.soft});
  const half = (side: 'before' | 'after', from: number) => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 540,
        left: side === 'before' ? 0 : 540,
        overflow: 'hidden',
        translate: `0px ${(1 - p) * (side === 'before' ? -1920 : 1920)}px`,
      }}
    >
      <div style={{position: 'absolute', left: -270, top: 0, width: 1080, height: 1920}}>
        <Clip side={side} from={from} drift={0.008} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      {half('before', SRC.beforeFront)}
      {half('after', SRC.afterFront + 1)}
      <div style={{position: 'absolute', top: 0, bottom: 0, left: 538, width: 4, backgroundColor: COLORS.white, opacity: p}} />
      <SideLabel text="ДО" at={0.3} x={270} />
      <SideLabel text="ПОСЛЕ" at={0.4} x={810} />
    </AbsoluteFill>
  );
};

// Музыка + звуки переходов
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
        volume={(f) => interpolate(f, [durationInFrames - 1.2 * fps, durationInFrames - 1], [1, 0], clamp)}
      />
      {sfx('impact', 0, 0.35)}
      {sfx('shimmer', 0.25, 0.4, 1.1)}
      {[0.5, 1.2, 1.9].map((at) => sfx('whoosh', at - 0.2, 0.12, 0.6))}
      {sfx('whoosh', T.beforeEnd - 0.1, 0.25, 0.6)}
      {sfx('shimmer', T.beforeEnd + T.wipe, 0.5, 1.1)}
      {sfx('whoosh', T.afterEnd - 0.1, 0.25, 0.6)}
      {sfx('impact', T.afterEnd + 0.15, 0.2)}
    </>
  );
};

export const BeforeAfter: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  const seq = (from: number, to: number) => ({from: Math.round(from * fps), durationInFrames: Math.round((to - from) * fps)});

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Sequence name="Хук: сравнение" {...seq(0, T.hookEnd)}>
        <Hook />
        <MetalTitle at={0.15} until={T.hookEnd - 0.05} lines={['Подтяжка груди']} size={72} top={1180} />
      </Sequence>

      <Sequence name="До: поворот" {...seq(T.hookEnd, T.beforeEnd + T.wipe)}>
        <Clip side="before" from={SRC.beforeFrom} rate={BEFORE_RATE} />
        <SideLabel text="ДО" at={0.1} x={540} />
      </Sequence>

      <Sequence name="Переход и после" {...seq(T.beforeEnd, T.afterEnd)}>
        <WipeToAfter />
        <SideLabel text="ПОСЛЕ" at={T.wipe} x={540} />
      </Sequence>

      <Sequence name="Финал: рядом" {...seq(T.afterEnd, T.end)}>
        <Finale />
        <MetalTitle at={0.5} until={T.end - T.afterEnd + 1} lines={['Результат', 'подтяжки груди']} size={64} top={1180} />
      </Sequence>

      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
