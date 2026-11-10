import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS} from '../design/tokens';

// Анимации этого ролика (новые, в прошлых не было):
// счётчик-барабан дней, список с прорисовкой галочек, шов со снимающимися стежками,
// «сдувающийся» пузырь отёка, заголовок «контур → заливка», синяя сцена со шторками-жалюзи
// и схемой рубца ниже линии белья, рубец, который бледнеет.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const metal: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.45))',
};

const glass: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.14)',
  border: '1.5px solid rgba(255,255,255,0.35)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
};

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};

// Мягкое появление/исчезновение блока
const useInOut = (at: number, until: number, inDur = 0.4, outDur = 0.35) => {
  const {frame, fps} = useT();
  const i = interpolate(frame, [at * fps, (at + inDur) * fps], [0, 1], {...clamp, easing: EASE.out});
  const o = interpolate(frame, [(until - outDur) * fps, until * fps], [1, 0], {...clamp, easing: EASE.inOut});
  return Math.min(i, o);
};

// ── Хук: барабан дней 01 → 16 и подпись ─────────────────────────────────────
const DIGIT_H = 92;
const Drum: React.FC<{value: number; size: number}> = ({value, size}) => (
  <div style={{height: DIGIT_H, overflow: 'hidden', width: size * 0.62}}>
    <div style={{translate: `0px ${-value * DIGIT_H}px`}}>
      {Array.from({length: 11}, (_, d) => (
        <div key={d} style={{height: DIGIT_H, lineHeight: `${DIGIT_H}px`, textAlign: 'center', fontFamily: FONTS.heading, fontWeight: 900, fontSize: size, ...metal}}>
          {d % 10}
        </div>
      ))}
    </div>
  </div>
);

export const DayCounter: React.FC<{at: number; until: number; top: number}> = ({at, until, top}) => {
  const {frame, fps} = useT();
  const v = interpolate(frame, [at * fps, (at + 1.1) * fps], [1, 16], {...clamp, easing: EASE.out});
  // единицы катятся 1 → 9 → 0 → 6, десятки перекатываются 0 → 1 вместе с переходом 9 → 10
  const units = v < 10 ? v : v - 10;
  const tens = Math.min(1, Math.max(0, v - 9));
  const show = useInOut(at, until, 0.25, 0.4);
  const label = interpolate(frame, [(at + 0.7) * fps, (at + 1.2) * fps], [0, 1], {...clamp, easing: EASE.out});
  const lineW = interpolate(frame, [(at + 0.9) * fps, (at + 1.5) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: show}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
        <div style={{display: 'flex'}}>
          <Drum value={tens} size={80} />
          <Drum value={units} size={80} />
        </div>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, textTransform: 'uppercase', ...metal, opacity: label}}>сутки</div>
      </div>
      <div style={{height: 2, width: 420 * lineW, marginTop: 8, background: `linear-gradient(90deg, rgba(248,240,229,0), ${COLORS.beige}, rgba(248,240,229,0))`}} />
      <div
        style={{
          marginTop: 14,
          fontFamily: FONTS.body,
          fontWeight: 400,
          fontSize: 36,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: COLORS.white,
          textShadow: '0 2px 14px rgba(0,0,0,0.55)',
          opacity: label,
          translate: `0px ${(1 - label) * 12}px`,
        }}
      >
        после абдоминопластики
      </div>
    </div>
  );
};

// Вспышка на хуке: тёплый свет из центра, гаснет
export const WarmFlash: React.FC<{at: number}> = ({at}) => {
  const {frame, fps} = useT();
  const p = interpolate(frame, [at * fps, (at + 0.55) * fps], [0, 1], clamp);
  if (p >= 1) {
    return null;
  }
  const o = (1 - p) ** 2 * 0.85;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, rgba(255,248,236,${o}), rgba(255,240,220,${o * 0.5}) 50%, rgba(255,240,220,0) 85%)`}} />;
};

// ── Список процедур: галочка прорисовывается, строка проявляется ─────────────
const Tick: React.FC<{p: number}> = ({p}) => (
  <svg width={34} height={34} viewBox="0 0 34 34">
    <circle cx={17} cy={17} r={15} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
    <path d="M10 17.5 L15 22.5 L24.5 12" fill="none" stroke={COLORS.beige} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

export const ProcedureList: React.FC<{items: {text: string; at: number}[]; until: number; top: number}> = ({items, until, top}) => {
  const {frame, fps} = useT();
  const show = useInOut(items[0].at - 0.2, until);
  return (
    <div style={{position: 'absolute', top, right: 64, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, opacity: show}}>
      {items.map((it, i) => {
        const v = interpolate(frame, [it.at * fps, (it.at + 0.35) * fps], [0, 1], {...clamp, easing: EASE.out});
        const tick = interpolate(frame, [(it.at + 0.2) * fps, (it.at + 0.55) * fps], [0, 1], {...clamp, easing: EASE.inOut});
        return (
          <div
            key={i}
            style={{
              ...glass,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 22px 12px 14px',
              borderRadius: 999,
              opacity: v,
              clipPath: `inset(0 0 0 ${(1 - v) * 100}% round 999px)`,
            }}
          >
            <Tick p={tick} />
            <span style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: COLORS.white}}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Шов: стежки по одному «снимаются» и улетают, остаётся ровная линия ─────────
export const StitchesOff: React.FC<{at: number; offAt: number; until: number; top: number}> = ({at, offAt, until, top}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const line = interpolate(frame, [at * fps, (at + 0.5) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const N = 7;
  const W = 360;
  const label = interpolate(frame, [(offAt + 0.5) * fps, (offAt + 0.9) * fps], [0, 1], {...clamp, easing: EASE.out});
  return (
    <div style={{position: 'absolute', top, right: 64, width: W + 40, opacity: show, display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
      <svg width={W + 40} height={110} style={{overflow: 'visible', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))'}}>
        <path d={`M 20 60 Q ${20 + W / 2} 74 ${20 + W} 60`} fill="none" stroke={COLORS.beige} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
        {Array.from({length: N}, (_, i) => {
          const x = 20 + ((i + 0.5) * W) / N;
          const y = 60 + Math.sin(((i + 0.5) / N) * Math.PI) * 7;
          const s = (offAt + i * 0.07) * fps;
          const off = interpolate(frame, [s, s + 9], [0, 1], {...clamp, easing: EASE.in});
          const appear = interpolate(frame, [(at + 0.2 + i * 0.04) * fps, (at + 0.35 + i * 0.04) * fps], [0, 1], clamp);
          return (
            <line
              key={i}
              x1={x - 7}
              y1={y - 14}
              x2={x + 7}
              y2={y + 14}
              stroke={COLORS.white}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={appear * (1 - off)}
              transform={`translate(${off * 18} ${-off * 46}) rotate(${off * 50} ${x} ${y})`}
            />
          );
        })}
      </svg>
      <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: COLORS.white, textShadow: '0 2px 12px rgba(0,0,0,0.55)', opacity: label, marginTop: -4}}>
        Швы сняты
      </div>
    </div>
  );
};

// ── Отёк: стеклянный пузырь «сдувается» и становится ровной точкой ───────────
export const SwellingBubble: React.FC<{at: number; shrinkAt: number; until: number; top: number}> = ({at, shrinkAt, until, top}) => {
  const {frame, fps, t} = useT();
  const show = useInOut(at, until);
  const grow = interpolate(frame, [at * fps, (at + 0.6) * fps], [0.4, 1], {...clamp, easing: EASE.out});
  const shrink = interpolate(frame, [shrinkAt * fps, (shrinkAt + 1.0) * fps], [1, 0.55], {...clamp, easing: EASE.inOut});
  const wobble = 1 + Math.sin(t * 5) * 0.025 * (shrink > 0.6 ? 1 : 0.3);
  const r = 92 * grow * shrink * wobble;
  const word = shrink < 0.8 ? 'уйдёт' : 'отёк';
  const swap = interpolate(frame, [(shrinkAt + 0.35) * fps, (shrinkAt + 0.45) * fps, (shrinkAt + 0.55) * fps], [1, 0, 1], clamp);
  return (
    <div style={{position: 'absolute', top, right: 64, width: 260, height: 260, opacity: show}}>
      <div
        style={{
          ...glass,
          position: 'absolute',
          left: 130 - r,
          top: 130 - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.32), rgba(255,255,255,0.08) 60%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 34,
          color: COLORS.white,
          textShadow: '0 2px 10px rgba(0,0,0,0.45)',
          opacity: swap,
        }}
      >
        {word}
      </div>
    </div>
  );
};

// ── Заголовок: сначала тонкий контур букв, потом заливка металлом ─────────────
export const OutlineFillTitle: React.FC<{at: number; until: number; text: string; top: number; size?: number}> = ({at, until, text, top, size = 64}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until, 0.2, 0.4);
  const stroke = interpolate(frame, [at * fps, (at + 0.45) * fps], [0, 1], {...clamp, easing: EASE.out});
  const fill = interpolate(frame, [(at + 0.35) * fps, (at + 0.85) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const spread = interpolate(frame, [at * fps, (at + 0.8) * fps], [0.16, 0.02], {...clamp, easing: EASE.out});
  const base: React.CSSProperties = {
    fontFamily: FONTS.heading,
    fontWeight: 900,
    fontSize: size,
    textTransform: 'uppercase',
    letterSpacing: `${spread}em`,
    textAlign: 'center',
    lineHeight: 1.05,
  };
  return (
    <div style={{position: 'absolute', top, left: 40, right: 40, opacity: show}}>
      <div style={{...base, color: 'transparent', WebkitTextStroke: `1.5px rgba(255,255,255,${0.9 * stroke * (1 - fill * 0.7)})`, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'}}>{text}</div>
      <div style={{...base, ...metal, position: 'absolute', inset: 0, clipPath: `inset(${(1 - fill) * 100}% 0 0 0)`}}>{text}</div>
    </div>
  );
};

// ── Синяя сцена: шторки-жалюзи открывают и закрывают ─────────────────────────
export const Blinds: React.FC<{until: number; children: React.ReactNode}> = ({until, children}) => {
  const {frame, fps} = useT();
  const open = interpolate(frame, [0, 0.45 * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const close = interpolate(frame, [(until - 0.45) * fps, until * fps], [1, 0], {...clamp, easing: EASE.inOut});
  const k = Math.min(open, close);
  const N = 9;
  const h = 1920 / N;
  // каждая полоса раскрывается от своей середины, с небольшой задержкой сверху вниз
  const clip = Array.from({length: N}, (_, i) => {
    const local = Math.max(0, Math.min(1, k * 1.4 - (i / N) * 0.4));
    const half = (h / 2) * local;
    const c = i * h + h / 2;
    return `M0 ${c - half - 0.5} H1080 V${c + half + 0.5} H0 Z`;
  }).join(' ');
  return (
    <AbsoluteFill style={{clipPath: `path('${clip}')`}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #12306E, ${COLORS.navy} 70%)`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Схема: силуэт низа живота, линия белья пунктиром, рубец ниже неё и пластыри на рубце
export const LowScar: React.FC<{scarAt: number; lineAt: number; tapeAt: number; titleAt: number}> = ({scarAt, lineAt, tapeAt, titleAt}) => {
  const {frame, fps} = useT();
  const body = interpolate(frame, [0.3 * fps, 1.1 * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const scar = interpolate(frame, [scarAt * fps, (scarAt + 0.7) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const line = interpolate(frame, [lineAt * fps, (lineAt + 0.7) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const lineLabel = interpolate(frame, [(lineAt + 0.5) * fps, (lineAt + 0.9) * fps], [0, 1], clamp);
  const title = interpolate(frame, [titleAt * fps, (titleAt + 0.5) * fps], [0, 1], {...clamp, easing: EASE.out});
  const tapes = [330, 420, 510, 600, 690, 780];
  const mono: React.CSSProperties = {fontFamily: FONTS.mono, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(248,240,229,0.75)'};
  return (
    <AbsoluteFill>
      <div style={{...mono, position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: body}}>РУБЕЦ · ВИД СПЕРЕДИ</div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* силуэт: талия, бёдра, пупок */}
        <path
          d="M 300 420 C 290 600 250 760 230 900 C 215 1010 220 1120 250 1230 M 780 420 C 790 600 830 760 850 900 C 865 1010 860 1120 830 1230"
          fill="none"
          stroke="rgba(248,240,229,0.85)"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - body}
        />
        <ellipse cx={540} cy={700} rx={10} ry={16} fill="none" stroke="rgba(248,240,229,0.7)" strokeWidth={2.5} opacity={body} />
        {/* линия белья — пунктир */}
        <path
          d="M 232 905 Q 540 980 848 905"
          fill="none"
          stroke="rgba(248,240,229,0.6)"
          strokeWidth={2.5}
          strokeDasharray="10 12"
          opacity={line}
          style={{clipPath: `inset(0 ${(1 - line) * 100}% 0 0)`}}
        />
        {/* рубец — ниже линии белья */}
        <path d="M 330 1010 Q 540 1060 750 1010" fill="none" stroke={COLORS.beige} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - scar} />
        {/* пластыри на рубце */}
        {tapes.map((x, i) => {
          const s = (tapeAt + i * 0.08) * fps;
          const v = interpolate(frame, [s, s + 7], [0, 1], {...clamp, easing: EASE.out});
          const y = 1010 + Math.sin(((x - 330) / 420) * Math.PI) * 25;
          return (
            <rect
              key={x}
              x={x - 15}
              y={y - 34 + (1 - v) * -30}
              width={30}
              height={68}
              rx={6}
              fill="rgba(248,240,229,0.88)"
              opacity={v}
              transform={`rotate(-8 ${x} ${y})`}
            />
          );
        })}
      </svg>
      <div style={{...mono, position: 'absolute', top: 860, right: 120, opacity: lineLabel}}>ЛИНИЯ БЕЛЬЯ</div>
      <div style={{position: 'absolute', top: 1230, left: 40, right: 40, textAlign: 'center', opacity: title, translate: `0px ${(1 - title) * 16}px`}}>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, textTransform: 'uppercase', lineHeight: 1.05, ...metal}}>Рубец спрятан</div>
        <div style={{fontFamily: FONTS.body, fontWeight: 400, fontSize: 36, color: COLORS.white, marginTop: 14, letterSpacing: '0.06em'}}>ниже линии белья</div>
      </div>
    </AbsoluteFill>
  );
};

// ── Противорубцовая терапия: рубец на плашке постепенно бледнеет ──────────────
export const FadingScar: React.FC<{at: number; until: number; top: number}> = ({at, until, top}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const draw = interpolate(frame, [(at + 0.1) * fps, (at + 0.6) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const fade = interpolate(frame, [(at + 0.8) * fps, (at + 2.4) * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const r = Math.round(interpolate(fade, [0, 1], [196, 236]));
  const g = Math.round(interpolate(fade, [0, 1], [92, 214]));
  const b = Math.round(interpolate(fade, [0, 1], [92, 196]));
  return (
    <div style={{position: 'absolute', top, right: 64, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, opacity: show}}>
      <div style={{fontFamily: FONTS.mono, fontSize: 20, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 8px rgba(0,0,0,0.5)'}}>ДАЛЬШЕ</div>
      <div style={{...glass, borderRadius: 999, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 20}}>
        <svg width={120} height={30}>
          <path
            d="M 6 15 Q 60 26 114 15"
            fill="none"
            stroke={`rgb(${r},${g},${b})`}
            strokeWidth={interpolate(fade, [0, 1], [6, 2.5])}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - draw}
          />
        </svg>
        <span style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: COLORS.white, lineHeight: 1.15, textAlign: 'right'}}>
          противорубцовая
          <br />
          терапия
        </span>
      </div>
    </div>
  );
};
