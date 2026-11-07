import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS} from '../design/tokens';

// Мягкие анимации ролика «Естественный результат». Каждая — один раз и только в этом ролике.
// Время — секунды от начала своего <Sequence>.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SOFT = {damping: 200, stiffness: 90};

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};

const useFade = (at: number, until: number, len = 0.45) => {
  const {t} = useT();
  return Math.min(
    interpolate(t, [at, at + len], [0, 1], {...clamp, easing: EASE.out}),
    interpolate(t, [until - len, until], [1, 0], {...clamp, easing: EASE.in}),
  );
};

const metal = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
};
const shadow = 'drop-shadow(0 3px 16px rgba(0,0,0,0.55))';
const glass: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  border: '1.5px solid rgba(255, 255, 255, 0.28)',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
};

// ——— 1. Хук: заголовок открывается полосой мягкого света слева направо ———
export const LightSweepTitle: React.FC<{at: number; until: number; label: string; lines: string[]; size: number; top: number}> = ({
  at,
  until,
  label,
  lines,
  size,
  top,
}) => {
  const {t} = useT();
  const v = useFade(at, until, 0.4);
  const sweep = interpolate(t, [at, at + 1.1], [-20, 120], {...clamp, easing: EASE.inOut});
  const labelIn = interpolate(t, [at, at + 0.5], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top, left: 30, right: 30, textAlign: 'center', opacity: v}}>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.2em', color: COLORS.white, textShadow: '0 2px 12px rgba(0,0,0,0.6)', opacity: labelIn, marginBottom: 14}}>
        {label}
      </div>
      <div style={{position: 'relative', filter: shadow}}>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1.04,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            ...metal,
            maskImage: `linear-gradient(90deg, #000 ${sweep - 12}%, rgba(0,0,0,0) ${sweep + 6}%)`,
            WebkitMaskImage: `linear-gradient(90deg, #000 ${sweep - 12}%, rgba(0,0,0,0) ${sweep + 6}%)`,
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        {/* сама полоса света */}
        <div
          style={{
            position: 'absolute',
            top: -10,
            bottom: -10,
            left: `${sweep - 6}%`,
            width: '10%',
            background: 'linear-gradient(90deg, rgba(255,250,240,0), rgba(255,250,240,0.55), rgba(255,250,240,0))',
            mixBlendMode: 'screen',
            opacity: sweep < 110 ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};

// ——— 2. Переход «вуаль»: синий наплывает по диагонали мягким краем, уходит растворением ———
export const DiagonalVeil: React.FC<{until: number; children: React.ReactNode}> = ({until, children}) => {
  const {t} = useT();
  const inn = interpolate(t, [0, 0.7], [0, 1], {...clamp, easing: EASE.inOut});
  const out = interpolate(t, [until - 0.6, until], [1, 0], {...clamp, easing: EASE.inOut});
  // вход: край идёт из левого верхнего угла вниз-вправо; выход: мягкое растворение
  const edge = inn * 135;
  const mask = `linear-gradient(135deg, #000 ${edge - 25}%, rgba(0,0,0,0) ${edge}%)`;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out, backgroundColor: COLORS.navy, maskImage: mask, WebkitMaskImage: mask}}>
      <div style={{position: 'absolute', inset: 0, opacity: interpolate(inn, [0.85, 1], [0, 1], clamp)}}>{children}</div>
    </div>
  );
};

// ——— 3. Синяя сцена: ряд одинаковых силуэтов, по ним скользит лупа и ничего не находит ———
const Person: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const {frame, fps} = useT();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: SOFT});
  return (
    <g transform={`translate(${x} ${y + (1 - p) * 20})`} opacity={p}>
      <circle cx={0} cy={-34} r={26} fill="none" stroke={COLORS.white} strokeWidth={4} />
      <path d="M-46 40 C-46 0 46 0 46 40" fill="none" stroke={COLORS.white} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

export const CrowdSearch: React.FC<{until: number; titleAt: number}> = ({until, titleAt}) => {
  const {t} = useT();
  const cols = 4;
  const rows = 3;
  const people = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      people.push({x: 240 + c * 200, y: 560 + r * 190, at: 0.5 + r * 0.15 + c * 0.05});
    }
  }
  // лупа плавно обходит силуэты по мягкой кривой
  const s = interpolate(t, [1.1, titleAt + 0.6], [0, 1], {...clamp, easing: EASE.inOut});
  const lx = 300 + Math.sin(s * Math.PI * 1.5) * 260 + s * 160;
  const ly = 620 + Math.sin(s * Math.PI * 2.2) * 150 + s * 120;
  const lens = useFade(1.0, titleAt + 0.9, 0.4);
  const title = useFade(titleAt, until, 0.5);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.7)'}}>
        ХОРОШАЯ ПЛАСТИКА
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        {people.map((p, i) => (
          <Person key={i} {...p} />
        ))}
        <g opacity={lens} transform={`translate(${lx} ${ly})`}>
          <circle r={86} fill="rgba(248,240,229,0.10)" stroke={COLORS.beige} strokeWidth={6} />
          <path d="M62 62 L120 120" stroke={COLORS.beige} strokeWidth={12} strokeLinecap="round" />
        </g>
      </svg>
      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', opacity: title, filter: shadow}}>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 60, textTransform: 'uppercase', ...metal}}>Никто не заметит</div>
      </div>
    </div>
  );
};

// ——— 4. Шкала «естественно — неузнаваемо»: ручка встаёт у «естественно»,
// на «а не изменить» её тянет вправо, и она мягко возвращается ———
export const NaturalSlider: React.FC<{at: number; settleAt: number; tugAt: number; until: number; top: number}> = ({at, settleAt, tugAt, until, top}) => {
  const {frame, fps, t} = useT();
  const v = useFade(at, until, 0.5);
  const settle = spring({frame: frame - Math.round(settleAt * fps), fps, config: SOFT});
  const tug = interpolate(t, [tugAt, tugAt + 0.5, tugAt + 1.2], [0, 1, 0], {...clamp, easing: EASE.inOut});
  const pos = interpolate(settle, [0, 1], [0.5, 0.12]) + tug * 0.3; // 0 — естественно, 1 — неузнаваемо
  const W = 760;
  const leftOn = pos < 0.3;
  return (
    <div style={{position: 'absolute', top, left: (1080 - W) / 2, width: W, opacity: v}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 14}}>
        <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: leftOn ? COLORS.beige : 'rgba(255,255,255,0.7)', textShadow: '0 2px 12px rgba(0,0,0,0.6)'}}>естественно</div>
        <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: !leftOn ? COLORS.beige : 'rgba(255,255,255,0.7)', textShadow: '0 2px 12px rgba(0,0,0,0.6)'}}>неузнаваемо</div>
      </div>
      <div style={{...glass, position: 'relative', height: 18, borderRadius: 9}}>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pos * 100}%`, borderRadius: 9, backgroundColor: 'rgba(248,240,229,0.55)'}} />
        <div
          style={{
            position: 'absolute',
            top: -17,
            left: `calc(${pos * 100}% - 26px)`,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: COLORS.beige,
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          }}
        />
      </div>
    </div>
  );
};

// ——— 5. Финал: заголовок и тонкая линия, которая прорисовывается из центра в стороны ———
export const UnderlineTitle: React.FC<{at: number; until: number; text: string; size: number; top: number}> = ({at, until, text, size, top}) => {
  const {t} = useT();
  const v = useFade(at, until, 0.5);
  const textIn = interpolate(t, [at, at + 0.7], [0, 1], {...clamp, easing: EASE.out});
  const line = interpolate(t, [at + 0.3, at + 1.1], [0, 1], {...clamp, easing: EASE.inOut});
  return (
    <div style={{position: 'absolute', top, left: 30, right: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: v}}>
      <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: size, textTransform: 'uppercase', ...metal, filter: `${shadow} blur(${(1 - textIn) * 6}px)`, translate: `0px ${(1 - textIn) * 14}px`}}>
        {text}
      </div>
      <div style={{height: 3, width: 520 * line, backgroundColor: COLORS.beige, borderRadius: 2, marginTop: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.4)'}} />
    </div>
  );
};
