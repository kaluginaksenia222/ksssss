import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, continueRender, delayRender, Freeze, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE} from '../design/tokens';
import {InstagramHandle} from './ui';

// «До / после»: абдоминопластика и подтяжка груди без имплантов. Видео без речи.
// Сверху по центру плашка «ДО» → «ПОСЛЕ». В начале «после» — стоп-кадр анфас со стрелками и подписями.
// Шрифт Stolzl, лёгкая музыка, звуков на анимациях нет. Всё по центру кадра и в рабочей зоне Reels.

const stolzlLoaded = loadFont({family: 'Stolzl', url: staticFile('stolzl/Stolzl-Bold.ttf'), weight: '700'});
const STOLZL = 'Stolzl, InterTightCyr, InterTightLat, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const SWITCH = 7.6; // в исходнике «до» → «после» (наплыв 7,54–7,71)
const FREEZE_SRC = 7.75; // кадр анфас «после» для стрелок
const HOLD = 3.2; // длина стоп-кадра
const SRC_LEN = 18.875;
export const BA_SECONDS = SRC_LEN + HOLD + 0.4;

const glass: React.CSSProperties = {
  backgroundColor: 'rgba(10, 14, 30, 0.62)',
  border: '1.5px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 26px rgba(0,0,0,0.3)',
};
const metal: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

// Видео: до стоп-кадра — как есть; стоп-кадр; потом «после» продолжается
const Footage: React.FC = () => {
  const {fps} = useVideoConfig();
  const holdFrom = Math.round(FREEZE_SRC * fps);
  const holdLen = Math.round(HOLD * fps);
  return (
    <>
      <Sequence durationInFrames={holdFrom}>
        <Video src={staticFile('source.mp4')} muted style={{width: 1080, height: 1920}} />
      </Sequence>
      <Sequence from={holdFrom} durationInFrames={holdLen}>
        <HoldFrame />
      </Sequence>
      <Sequence from={holdFrom + holdLen}>
        <Video src={staticFile('source.mp4')} muted trimBefore={holdFrom} style={{width: 1080, height: 1920}} />
      </Sequence>
    </>
  );
};

const HoldFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const push = interpolate(frame, [0, HOLD * fps], [1, 1.03], clamp);
  return (
    <AbsoluteFill style={{scale: String(push), transformOrigin: '50% 45%'}}>
      <Freeze frame={Math.round(FREEZE_SRC * fps)}>
        <Video src={staticFile('source.mp4')} muted style={{width: 1080, height: 1920}} />
      </Freeze>
    </AbsoluteFill>
  );
};

// Плашка «ДО» / «ПОСЛЕ»: на смене переворачивается
const TopTag: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const inn = interpolate(frame, [0, 0.4 * fps], [0, 1], {...clamp, easing: EASE.out});
  const flip = interpolate(t, [SWITCH - 0.15, SWITCH + 0.15], [0, 1], clamp);
  const isAfter = flip >= 0.5;
  const sx = Math.abs(Math.cos(flip * Math.PI));
  return (
    <div style={{position: 'absolute', top: 345, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: inn}}>
      <div style={{...glass, borderRadius: 999, padding: '10px 34px', scale: `${Math.max(0.05, sx)} 1`, borderColor: isAfter ? COLORS.beige : glass.borderColor}}>
        <span style={{fontFamily: STOLZL, fontWeight: 700, fontSize: 40, letterSpacing: '0.16em', ...(isAfter ? metal : {color: COLORS.white})}}>{isAfter ? 'ПОСЛЕ' : 'ДО'}</span>
      </div>
    </div>
  );
};

// Стрелка: кривая прорисовывается от подписи к точке, на конце — острие и кольцо
const Arrow: React.FC<{from: [number, number]; to: [number, number]; at: number; bend?: number}> = ({from, to, at, bend = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + 0.5) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const ring = interpolate(frame, [(at + 0.45) * fps, (at + 1.1) * fps], [0, 1], {...clamp, easing: EASE.out});
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 + bend;
  const my = (y1 + y2) / 2;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const h = 16;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.55))'}}>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke={COLORS.white} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={`M${x2 - h * Math.cos(ang - 0.5)} ${y2 - h * Math.sin(ang - 0.5)} L${x2} ${y2} L${x2 - h * Math.cos(ang + 0.5)} ${y2 - h * Math.sin(ang + 0.5)}`} fill="none" stroke={COLORS.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={p > 0.95 ? 1 : 0} />
      <circle cx={x2} cy={y2} r={8 + ring * 26} fill="none" stroke={COLORS.beige} strokeWidth={2.5} opacity={(1 - ring) * 0.9} />
    </svg>
  );
};

const Label: React.FC<{top: number; at: number; lines: string[]}> = ({top, at, lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = spring({frame: frame - at * fps, fps, config: {damping: 14, stiffness: 160}});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{...glass, borderRadius: 22, padding: '10px 26px', textAlign: 'center', opacity: Math.min(1, v * 2), scale: String(0.8 + v * 0.2)}}>
        {lines.map((l, i) => (
          <div key={i} style={{fontFamily: STOLZL, fontWeight: 700, fontSize: i === 0 ? 34 : 26, lineHeight: 1.2, letterSpacing: '0.04em', color: i === 0 ? COLORS.white : COLORS.beige}}>{l}</div>
        ))}
      </div>
    </div>
  );
};

// Стрелки на стоп-кадре (время — от начала стоп-кадра). Координаты по кадру «после» анфас.
const Marks: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [(HOLD - 0.3) * fps, HOLD * fps], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Label top={420} at={0.15} lines={['ПОДТЯЖКА ГРУДИ', 'без имплантов']} />
      <Arrow from={[430, 520]} to={[318, 610]} at={0.45} bend={-30} />
      <Arrow from={[650, 520]} to={[748, 610]} at={0.55} bend={30} />
      <Label top={1265} at={1.1} lines={['АБДОМИНОПЛАСТИКА']} />
      <Arrow from={[540, 1260]} to={[520, 1070]} at={1.35} bend={40} />
    </AbsoluteFill>
  );
};

export const BeforeAfter: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    Promise.all([fontsLoaded, stolzlLoaded]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Footage />
      <Sequence from={Math.round(FREEZE_SRC * fps)} durationInFrames={Math.round(HOLD * fps)}>
        <Marks />
      </Sequence>
      <TopTag />
      <AbsoluteFill style={{top: 1440, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <Audio
        src={staticFile('music/warm_keys_90.wav')}
        volume={(f) => 0.6 * interpolate(f, [0, 0.5 * fps], [0, 1], clamp) * interpolate(f, [durationInFrames - 1.5 * fps, durationInFrames - 1], [1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
