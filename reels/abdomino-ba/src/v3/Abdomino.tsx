import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Freeze,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS} from '../design/tokens';
import {InstagramHandle} from './ui';

// «До / после» абдоминопластики. Исходник без речи: подписи — короткие тексты.
// Начало — стоп-кадр первого кадра, стрелки показывают проблемы. Потом видео целиком.
// Браслет пациентки с фамилией размыт заранее (source_blur.mp4).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const SRC_LEN = 21.5;
const FREEZE_END = 4.8; // стоп-кадр со стрелками
const AFTER_AT = FREEZE_END + 7.55; // в исходнике «после» начинается на 7,55 с
export const ABDOMINO_SECONDS = Math.ceil((FREEZE_END + SRC_LEN) * 10) / 10;

type Mark = {
  at: number;
  lines: string[];
  label: {x: number; y: number; align: 'left' | 'right'};
  from: [number, number];
  to: [number, number];
  bend: number;
};

// Координаты — в кадре 1080×1920 (первый кадр исходника)
const MARKS: Mark[] = [
  {at: 0.4, lines: ['Диастаз'], label: {x: 1016, y: 800, align: 'right'}, from: [800, 862], to: [588, 980], bend: -40},
  {at: 1.2, lines: ['Растянутая', 'кожа'], label: {x: 64, y: 880, align: 'left'}, from: [190, 990], to: [430, 1175], bend: 40},
  {at: 2.0, lines: ['Деформация', 'пупка'], label: {x: 1016, y: 1190, align: 'right'}, from: [770, 1200], to: [584, 1124], bend: 30},
  {at: 2.8, lines: ['Неэстетичный рубец', 'после кесарева'], label: {x: 1016, y: 1545, align: 'right'}, from: [700, 1550], to: [600, 1482], bend: -30},
];

const Footage: React.FC = () => (
  <Video src={staticFile('source_blur.mp4')} muted style={{position: 'absolute', width: 1080, height: 1920}} />
);

// Стрелка: тонкая линия прорисовывается к точке, на точке расходится мягкое кольцо
const Arrow: React.FC<{m: Mark}> = ({m}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = m.at * fps;
  const draw = interpolate(frame, [s + 6, s + 22], [0, 1], {...clamp, easing: EASE.inOut});
  const ring = interpolate(frame, [s + 20, s + 44], [0, 1], {...clamp, easing: EASE.out});
  const dot = interpolate(frame, [s + 18, s + 24], [0, 1], clamp);
  const [x1, y1] = m.from;
  const [x2, y2] = m.to;
  const mx = (x1 + x2) / 2 + m.bend;
  const my = (y1 + y2) / 2 - Math.abs(m.bend) * 0.6;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  // направление острия — по касательной в конце кривой
  const ang = Math.atan2(y2 - my, x2 - mx);
  const head = 16;
  const hx = (a: number) => x2 - head * Math.cos(ang + a);
  const hy = (a: number) => y2 - head * Math.sin(ang + a);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#sh)">
        <path d={d} fill="none" stroke={COLORS.white} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <path
          d={`M ${hx(0.5)} ${hy(0.5)} L ${x2} ${y2} L ${hx(-0.5)} ${hy(-0.5)}`}
          fill="none"
          stroke={COLORS.white}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={dot}
        />
      </g>
      <circle cx={x2} cy={y2} r={10 + ring * 34} fill="none" stroke={COLORS.beige} strokeWidth={2.5} opacity={(1 - ring) * 0.9} />
    </svg>
  );
};

// Подпись к стрелке: строки проявляются из размытия, со сдвигом от стрелки
const Label: React.FC<{m: Mark}> = ({m}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = m.at * fps;
  const right = m.label.align === 'right';
  return (
    <div
      style={{
        position: 'absolute',
        top: m.label.y - 52 * m.lines.length,
        ...(right ? {right: 1080 - m.label.x} : {left: m.label.x}),
        textAlign: m.label.align,
      }}
    >
      {m.lines.map((line, i) => {
        const v = interpolate(frame, [s + i * 4, s + i * 4 + 12], [0, 1], {...clamp, easing: EASE.out});
        return (
          <div
            key={i}
            style={{
              fontFamily: FONTS.body,
              fontWeight: 500,
              fontSize: 42,
              lineHeight: 1.18,
              color: COLORS.white,
              textShadow: '0 2px 14px rgba(0,0,0,0.6)',
              opacity: v,
              filter: `blur(${(1 - v) * 6}px)`,
              translate: `${(right ? 1 : -1) * (1 - v) * 18}px 0px`,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

// Стоп-кадр: первый кадр медленно приближается, стрелки появляются по очереди
const FreezeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const push = interpolate(frame, [0, FREEZE_END * fps], [1, 1.035], clamp);
  const marksOut = interpolate(frame, [(FREEZE_END - 0.45) * fps, FREEZE_END * fps], [1, 0], {...clamp, easing: EASE.inOut});
  return (
    <AbsoluteFill style={{scale: String(push), transformOrigin: '52% 60%'}}>
      <Freeze frame={0}>
        <Footage />
      </Freeze>
      <AbsoluteFill style={{opacity: marksOut}}>
        {MARKS.map((m, i) => (
          <React.Fragment key={i}>
            <Arrow m={m} />
            <Label m={m} />
          </React.Fragment>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Подписи: по два слова, белые, тонкие; буквы сходятся из разреженного набора
const CAPTIONS: {at: number; until: number; text: string}[] = [
  {at: FREEZE_END + 0.3, until: FREEZE_END + 3.4, text: 'Живот после родов'},
  {at: FREEZE_END + 3.6, until: AFTER_AT - 0.4, text: 'и кесарева сечения'},
  {at: AFTER_AT + 0.4, until: AFTER_AT + 3.2, text: 'После абдоминопластики'},
  {at: AFTER_AT + 3.4, until: AFTER_AT + 6.0, text: 'Подтянутая кожа'},
  {at: AFTER_AT + 6.2, until: AFTER_AT + 8.8, text: 'Аккуратный пупок'},
  {at: AFTER_AT + 9.0, until: AFTER_AT + 11.6, text: 'Рубец под бельём'},
];

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const c = CAPTIONS.find((x) => t >= x.at && t < x.until);
  if (!c) {
    return null;
  }
  const v = interpolate(frame, [c.at * fps, c.at * fps + 14], [0, 1], {...clamp, easing: EASE.out});
  const out = interpolate(frame, [c.until * fps - 8, c.until * fps], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: 300,
        left: 64,
        right: 64,
        textAlign: 'center',
        fontFamily: FONTS.body,
        fontWeight: 400,
        fontSize: 46,
        letterSpacing: `${(1 - v) * 0.35}em`,
        color: COLORS.white,
        textShadow: '0 2px 14px rgba(0,0,0,0.55)',
        opacity: v * out,
        filter: `blur(${(1 - v) * 4}px)`,
      }}
    >
      {c.text}
    </div>
  );
};

// Смена «до» → «после»: короткая мягкая вспышка света
const SoftFlash: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [(at - 0.25) * fps, (at + 0.45) * fps], [0, 1], clamp);
  if (p <= 0 || p >= 1) {
    return null;
  }
  return <AbsoluteFill style={{backgroundColor: COLORS.beige, opacity: Math.sin(p * Math.PI) * 0.35, mixBlendMode: 'screen'}} />;
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
        src={staticFile('music/calm_pad.wav')}
        volume={(f) =>
          interpolate(f, [0, 0.6 * fps], [0, 1], clamp) * interpolate(f, [durationInFrames - 1.6 * fps, durationInFrames - 1], [1, 0], clamp)
        }
      />
      {MARKS.map((m) => sfx('pop', m.at + 0.6, 0.12, 0.25))}
      {sfx('whoosh', FREEZE_END - 0.3, 0.12, 0.6)}
      {sfx('shimmer', AFTER_AT - 0.2, 0.3, 1.1)}
    </>
  );
};

export const Abdomino: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence name="Стоп-кадр со стрелками" durationInFrames={Math.round(FREEZE_END * fps)}>
        <FreezeIntro />
      </Sequence>
      <Sequence name="Видео: до и после" from={Math.round(FREEZE_END * fps)}>
        <AbsoluteFill style={{scale: '1.035', transformOrigin: '52% 60%'}}>
          <Footage />
        </AbsoluteFill>
      </Sequence>
      <SoftFlash at={AFTER_AT} />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
