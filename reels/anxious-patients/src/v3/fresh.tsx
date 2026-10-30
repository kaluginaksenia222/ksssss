import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, SPRING} from '../design/tokens';

// Новые движения для этого ролика (стиль общий, анимация своя):
// впечатывание букв, табло с цифрами, шторки-переход, линия-«пульс».
// Время — секунды от начала своего <Sequence>.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const metal = (shine: number) => ({
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF ${shine}%, #C9CFDA ${shine + 18}%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
});

// Буквы впечатываются по одной: падают из крупного размера с отскоком, металлический блик
export const StampTitle: React.FC<{at: number; until: number; text: string; size: number; top: number}> = ({
  at,
  until,
  text,
  size,
  top,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [until * fps - 7, until * fps], [1, 0], {...clamp, easing: EASE.in});
  const shine = interpolate(frame, [(at + 0.4) * fps, (at + 1.4) * fps], [-60, 160], clamp);
  if (frame < at * fps - 1 || out <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 30,
        right: 30,
        display: 'flex',
        justifyContent: 'center',
        opacity: out,
        filter: `blur(${(1 - out) * 10}px) drop-shadow(0 4px 18px rgba(0,0,0,0.5))`,
      }}
    >
      {text.split('').map((ch, i) => {
        const p = spring({frame: frame - Math.round(at * fps) - i, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              fontFamily: FONTS.heading,
              fontWeight: 900,
              fontSize: size,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              ...metal(shine),
              opacity: interpolate(p, [0, 0.15], [0, 1], clamp),
              scale: String(interpolate(p, [0, 1], [2.4, 1])),
              translate: `0px ${(1 - p) * -40}px`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// Табло: цифры прокручиваются барабаном и встают на место; справа — подпись
export const NumberRoll: React.FC<{
  at: number;
  until: number;
  top: number;
  digits: string;
  tail: string;
  size: number;
}> = ({at, until, top, digits, tail, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [until * fps - 7, until * fps], [1, 0], {...clamp, easing: EASE.in});
  const tailIn = spring({frame: frame - Math.round((at + 0.55) * fps), fps, config: SPRING.pop});
  if (frame < at * fps || out <= 0) {
    return null;
  }
  const cell = size * 1.05;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 30,
        right: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 18,
        opacity: out,
        filter: `drop-shadow(0 4px 18px rgba(0,0,0,0.5))`,
      }}
    >
      <div style={{display: 'flex'}}>
        {digits.split('').map((ch, i) => {
          const isDigit = /\d/.test(ch);
          const target = isDigit ? Number(ch) : 0;
          // каждая цифра крутится свой отрезок времени и останавливается
          const stopAt = Math.round((at + 0.25 + i * 0.06) * fps);
          const roll = interpolate(frame, [at * fps, stopAt], [target + 20, target], {...clamp, easing: EASE.out});
          return (
            <div key={i} style={{height: cell, overflow: 'hidden', fontFamily: FONTS.heading, fontWeight: 900, fontSize: size, lineHeight: `${cell}px`}}>
              {isDigit ? (
                <div style={{translate: `0px ${-(roll % 10) * cell}px`}}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
                    <div key={j} style={{height: cell, ...metal(120)}}>
                      {d}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{...metal(120)}}>{ch}</div>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 900,
          fontSize: size * 0.5,
          lineHeight: 1,
          textTransform: 'uppercase',
          ...metal(120),
          opacity: tailIn,
          translate: `${(1 - tailIn) * 40}px 0px`,
        }}
      >
        {tail}
      </div>
    </div>
  );
};

// Шторки: синие вертикальные полосы по очереди закрывают кадр и потом открывают его
export const SlatsReveal: React.FC<{until: number; slats?: number; children: React.ReactNode}> = ({
  until,
  slats = 8,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const w = 1080 / slats;
  const inP = (i: number) => interpolate(frame, [i * 1.5, i * 1.5 + 9], [0, 1], {...clamp, easing: EASE.inOut});
  const outP = (i: number) => interpolate(frame, [end - 12 + i * 1.2, end - 3 + i * 1.2], [0, 1], {...clamp, easing: EASE.inOut});
  // содержимое показываем, когда шторки сомкнулись
  const content = Math.min(
    interpolate(frame, [slats * 1.5 + 2, slats * 1.5 + 8], [0, 1], clamp),
    interpolate(frame, [end - 14, end - 9], [1, 0], clamp),
  );
  return (
    <>
      {new Array(slats).fill(0).map((_, i) => {
        const from = i % 2 === 0 ? -1 : 1;
        const y = (1 - inP(i)) * from * 100 + outP(i) * -from * 100;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: i * w - 0.5,
              width: w + 1,
              height: 1920,
              backgroundColor: COLORS.navy,
              translate: `0px ${y}%`,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', inset: 0, opacity: content}}>{children}</div>
    </>
  );
};

// Линия-«пульс» через весь экран: рисуется слева направо, по ней бежит светящаяся точка.
// calm — плавная волна (спокойствие), anxious — рваная дёрганая линия (тревога).
export const PulseLine: React.FC<{mood: 'calm' | 'anxious'; top: number; at?: number}> = ({mood, top, at = 0.3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pts: [number, number][] = [];
  for (let x = 0; x <= 1080; x += 6) {
    let y: number;
    if (mood === 'calm') {
      y = Math.sin(x / 90 + frame / 25) * 26;
    } else {
      const spike = Math.sin(x * 0.37) * Math.sin(x * 0.051 + frame / 6);
      y = spike * 70 + Math.sin(x / 13 + frame / 3) * 14;
    }
    pts.push([x, y]);
  }
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`).join(' ');
  const draw = interpolate(frame, [at * fps, (at + 1.1) * fps], [1, 0], {...clamp, easing: EASE.out});
  const head = Math.round((1 - draw) * (pts.length - 1));
  const [hx, hy] = pts[head];
  return (
    <svg width={1080} height={300} viewBox="0 -150 1080 300" style={{position: 'absolute', left: 0, top: top - 150}}>
      <path
        d={d}
        fill="none"
        stroke={COLORS.beige}
        strokeWidth={mood === 'calm' ? 4 : 3}
        strokeLinejoin="round"
        opacity={0.85}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw}
      />
      <circle cx={hx} cy={hy} r={12} fill={COLORS.white} opacity={draw > 0 ? 1 : 0.85} />
      <circle cx={hx} cy={hy} r={26} fill={COLORS.white} opacity={0.18} />
    </svg>
  );
};
