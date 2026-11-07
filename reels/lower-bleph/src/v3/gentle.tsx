import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS} from '../design/tokens';

// Мягкие анимации ролика про нижнюю блефаропластику. Каждая используется в ролике один раз.
// Время — секунды от начала своего <Sequence>.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SOFT = {damping: 200, stiffness: 90};

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};

// Появление и уход (until — секунды от начала Sequence)
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

const glass: React.CSSProperties = {
  borderRadius: 28,
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  border: '1.5px solid rgba(255, 255, 255, 0.28)',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
};

const shadow = '0 2px 16px rgba(0,0,0,0.5)';

// Линия, которая прорисовывается
const Stroke: React.FC<{d: string; at: number; dur?: number; w?: number; color?: string; dash?: string; opacity?: number}> = ({
  d,
  at,
  dur = 0.9,
  w = 4,
  color = COLORS.white,
  dash,
  opacity = 1,
}) => {
  const {t} = useT();
  const p = interpolate(t, [at, at + dur], [0, 1], {...clamp, easing: EASE.inOut});
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      pathLength={1}
      strokeDasharray={dash ? undefined : 1}
      strokeDashoffset={dash ? undefined : 1 - p}
      style={dash ? {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, strokeDasharray: dash} : undefined}
    />
  );
};

// ——— 1. Хук: глаз рисуется тонкой линией, под ресницами — пунктир разреза, который тает ———
export const EyeHook: React.FC<{until: number; top: number}> = ({until, top}) => {
  const {t} = useT();
  const v = useFade(0, until, 0.4);
  const erase = interpolate(t, [1.25, 1.85], [1, 0], {...clamp, easing: EASE.inOut});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: v}}>
      <svg width={520} height={220} viewBox="0 0 520 220" style={{filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.45))'}}>
        <Stroke d="M30 110 C130 20 390 20 490 110" at={0.05} dur={0.7} w={5} />
        <Stroke d="M30 110 C130 190 390 190 490 110" at={0.25} dur={0.7} w={5} />
        <circle cx={260} cy={106} r={interpolate(t, [0.5, 0.9], [0, 46], {...clamp, easing: EASE.out})} fill="none" stroke={COLORS.white} strokeWidth={5} />
        <circle cx={260} cy={106} r={interpolate(t, [0.6, 1.0], [0, 18], {...clamp, easing: EASE.out})} fill={COLORS.beige} />
        <g opacity={erase}>
          <Stroke d="M70 170 C170 212 350 212 450 170" at={0.75} dur={0.5} w={4} color={COLORS.beige} dash="10 12" />
        </g>
      </svg>
    </div>
  );
};

// Заголовок хука: строки проявляются из лёгкой дымки, расстояние между буквами плавно сходится
export const MistTitle: React.FC<{at: number; until: number; lines: string[]; size: number; top: number}> = ({at, until, lines, size, top}) => {
  const {t} = useT();
  const v = useFade(at, until, 0.5);
  return (
    <div style={{position: 'absolute', top, left: 30, right: 30, textAlign: 'center', opacity: v}}>
      {lines.map((line, i) => {
        const p = interpolate(t, [at + i * 0.15, at + i * 0.15 + 0.9], [0, 1], {...clamp, easing: EASE.out});
        return (
          <div
            key={i}
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.04,
              textTransform: 'uppercase',
              letterSpacing: `${interpolate(p, [0, 1], [0.12, -0.01])}em`,
              ...metal,
              opacity: p,
              filter: `blur(${(1 - p) * 10}px) drop-shadow(${shadow})`,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

// ——— 2. Название методики: стеклянная карточка мягко поднимается, термин проявляется ———
export const TermCard: React.FC<{at: number; until: number; label: string; term: string; top: number}> = ({at, until, label, term, top}) => {
  const {frame, fps} = useT();
  const v = useFade(at, until);
  const p = spring({frame: frame - Math.round(at * fps), fps, config: SOFT});
  return (
    <div style={{position: 'absolute', top, left: 70, right: 70, opacity: v, translate: `0px ${(1 - p) * 40}px`}}>
      <div style={{...glass, padding: '20px 28px', textAlign: 'center'}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 20, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.75)'}}>{label}</div>
        <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 36, color: COLORS.white, marginTop: 8}}>{term}</div>
      </div>
    </div>
  );
};

// ——— 3. Переход в синюю сцену «дымкой»: синий проявляется с сильным размытием видео ———
export const HazeReveal: React.FC<{until: number; children: React.ReactNode}> = ({until, children}) => {
  const {t} = useT();
  const v = Math.min(interpolate(t, [0, 0.55], [0, 1], {...clamp, easing: EASE.inOut}), interpolate(t, [until - 0.55, until], [1, 0], {...clamp, easing: EASE.inOut}));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v, backdropFilter: `blur(${v * 24}px)`, backgroundColor: `rgba(8, 32, 82, ${0.94 * v})`}}>
      {children}
    </div>
  );
};

// Синяя сцена 1: веко в разрезе, разрез — с внутренней стороны века
export const InnerLid: React.FC<{until: number}> = ({until}) => {
  const {t} = useT();
  const glow = 0.5 + 0.5 * Math.sin(t * 3);
  const label = useFade(1.5, until, 0.4);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.7)'}}>
        КАК ЭТО УСТРОЕНО
      </div>
      <svg width={1080} height={700} viewBox="0 0 1080 700" style={{position: 'absolute', top: 420, left: 0}}>
        {/* глаз */}
        <Stroke d="M190 250 C350 110 730 110 890 250" at={0.3} dur={0.8} w={5} />
        <Stroke d="M190 250 C350 370 730 370 890 250" at={0.45} dur={0.8} w={5} />
        <circle cx={540} cy={245} r={interpolate(t, [0.7, 1.1], [0, 72], {...clamp, easing: EASE.out})} fill="none" stroke={COLORS.white} strokeWidth={5} />
        {/* нижнее веко — толщина */}
        <Stroke d="M220 300 C380 430 700 430 860 300" at={0.8} dur={0.8} w={3} opacity={0.5} />
        {/* разрез изнутри века — светится */}
        <Stroke d="M360 340 C470 378 610 378 720 340" at={1.3} dur={0.7} w={6} color={COLORS.beige} opacity={0.6 + 0.4 * glow} />
      </svg>
      <div style={{position: 'absolute', top: 870, left: 0, right: 0, textAlign: 'center', opacity: label}}>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 56, textTransform: 'uppercase', ...metal, filter: `drop-shadow(${shadow})`}}>Разрез изнутри века</div>
        <div style={{fontFamily: FONTS.body, fontWeight: 400, fontSize: 30, color: 'rgba(255,255,255,0.8)', marginTop: 10}}>снаружи его не видно</div>
      </div>
    </div>
  );
};

// ——— 4. «Есть / нет»: две стеклянные половинки съезжаются с боков ———
export const HaveNot: React.FC<{at: number; noAt: number; until: number; top: number; yes: string; no: string}> = ({at, noAt, until, top, yes, no}) => {
  const {frame, fps} = useT();
  const v = useFade(at, until);
  const a = spring({frame: frame - Math.round(at * fps), fps, config: SOFT});
  const b = spring({frame: frame - Math.round(noAt * fps), fps, config: SOFT});
  const half = (title: string, text: string, p: number, from: number, accent: boolean) => (
    <div style={{...glass, flex: 1, padding: '18px 22px', translate: `${(1 - p) * from}px 0px`, opacity: p, backgroundColor: accent ? 'rgba(248,240,229,0.92)' : glass.backgroundColor}}>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 20, letterSpacing: '0.16em', color: accent ? COLORS.navy : 'rgba(255,255,255,0.75)'}}>{title}</div>
      <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: accent ? COLORS.navy : COLORS.white, marginTop: 6}}>{text}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', top, left: 70, right: 70, display: 'flex', gap: 16, opacity: v}}>
      {half('ЕСТЬ', yes, a, -260, true)}
      {half('НЕТ', no, b, 260, false)}
    </div>
  );
};

// ——— 5. Часы: тонкое кольцо, стрелка мягко проходит до 30 минут ———
export const SoftClock: React.FC<{at: number; until: number; top: number}> = ({at, until, top}) => {
  const {t} = useT();
  const v = useFade(at, until);
  const sweep = interpolate(t, [at + 0.2, at + 1.6], [0, 0.5], {...clamp, easing: EASE.inOut});
  const r = 92;
  const ang = sweep * 2 * Math.PI - Math.PI / 2;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: v}}>
      <svg width={220} height={220} viewBox="-110 -110 220 220" style={{filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))'}}>
        <circle r={r} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
        <circle r={r} fill="none" stroke={COLORS.beige} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${sweep} 1`} transform="rotate(-90)" />
        <line x1={0} y1={0} x2={Math.cos(ang) * (r - 26)} y2={Math.sin(ang) * (r - 26)} stroke={COLORS.white} strokeWidth={5} strokeLinecap="round" />
        <circle r={7} fill={COLORS.white} />
      </svg>
      <div>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 72, lineHeight: 1, ...metal, filter: `drop-shadow(${shadow})`}}>20–30</div>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.18em', color: COLORS.white, textShadow: shadow, marginTop: 6}}>МИНУТ</div>
      </div>
    </div>
  );
};

// ——— 6. Выбор анестезии: два варианта, между ними мягко переливается «или» ———
export const ChoicePair: React.FC<{at: number; secondAt: number; until: number; top: number; a: string; b: string}> = ({at, secondAt, until, top, a, b}) => {
  const {t} = useT();
  const v = useFade(at, until);
  const pa = interpolate(t, [at, at + 0.6], [0, 1], {...clamp, easing: EASE.out});
  const pb = interpolate(t, [secondAt, secondAt + 0.6], [0, 1], {...clamp, easing: EASE.out});
  const item = (text: string, p: number) => (
    <div style={{...glass, padding: '14px 26px', borderRadius: 999, opacity: p, filter: `blur(${(1 - p) * 6}px)`}}>
      <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.white}}>{text}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: v}}>
      {item(a, pa)}
      <div style={{fontFamily: FONTS.accent, fontSize: 64, lineHeight: 0.8, color: COLORS.beige, textShadow: shadow, opacity: pb}}>или</div>
      {item(b, pb)}
    </div>
  );
};

// ——— 7. Переход во вторую синюю сцену: синий поднимается снизу мягкой волной-градиентом ———
export const TideReveal: React.FC<{until: number; children: React.ReactNode}> = ({until, children}) => {
  const {t} = useT();
  const up = interpolate(t, [0, 0.8], [0, 1], {...clamp, easing: EASE.inOut});
  const down = interpolate(t, [until - 0.8, until], [0, 1], {...clamp, easing: EASE.inOut});
  const level = up * (1 - down);
  const edge = (1 - level) * 120;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(to top, ${COLORS.navy} ${100 - edge}%, rgba(8,32,82,0) ${Math.min(100, 120 - edge)}%)`,
      }}
    >
      <div style={{position: 'absolute', inset: 0, opacity: interpolate(level, [0.8, 1], [0, 1], clamp)}}>{children}</div>
    </div>
  );
};

// Синяя сцена 2: два мягких круга «грыжи» и «избытки кожи» сходятся — у возрастных пациентов есть оба
export const MergeCircles: React.FC<{mergeAt: number; until: number}> = ({mergeAt, until}) => {
  const {frame, fps, t} = useT();
  const inn = useFade(0.5, until, 0.5);
  const m = spring({frame: frame - Math.round(mergeAt * fps), fps, config: SOFT});
  const dx = interpolate(m, [0, 1], [230, 110]);
  const both = useFade(mergeAt + 0.6, until, 0.5);
  const breathe = 1 + Math.sin(t * 2) * 0.015;
  const circle = (x: number, label: string) => (
    <div
      style={{
        position: 'absolute',
        left: 540 + x - 190,
        top: 560,
        width: 380,
        height: 380,
        borderRadius: '50%',
        border: '2.5px solid rgba(255,255,255,0.55)',
        backgroundColor: 'rgba(248,240,229,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: x < 0 ? 'flex-start' : 'flex-end',
        padding: '0 52px',
        scale: String(breathe),
      }}
    >
      <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.white}}>{label}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inn}}>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.7)'}}>
        ВОЗРАСТНЫЕ ПАЦИЕНТЫ
      </div>
      {circle(-dx, 'грыжи')}
      {circle(dx, 'кожа')}
      <div style={{position: 'absolute', top: 1000, left: 0, right: 0, textAlign: 'center', opacity: both}}>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 56, textTransform: 'uppercase', ...metal, filter: `drop-shadow(${shadow})`}}>Грыжи + избыток кожи</div>
      </div>
    </div>
  );
};

// ——— 8. Финал: глаз с ресницами, вдоль края ресниц прорисовывается пунктир разреза ———
export const LashLine: React.FC<{at: number; until: number; top: number}> = ({at, until, top}) => {
  const {t} = useT();
  const v = useFade(at, until, 0.5);
  const lashes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: v}}>
      <svg width={560} height={230} viewBox="0 0 560 230" style={{filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.45))'}}>
        <Stroke d="M40 100 C150 10 410 10 520 100" at={at} dur={0.7} w={4} />
        <Stroke d="M40 100 C150 180 410 180 520 100" at={at + 0.15} dur={0.7} w={4} />
        <circle cx={280} cy={96} r={interpolate(t, [at + 0.4, at + 0.8], [0, 40], {...clamp, easing: EASE.out})} fill="none" stroke={COLORS.white} strokeWidth={4} />
        {lashes.map((i) => {
          const x = 100 + i * 45;
          const y = 100 + Math.sin(((x - 40) / 480) * Math.PI) * 60;
          return <Stroke key={i} d={`M${x} ${y} l${(i - 4) * 2} 16`} at={at + 0.6 + i * 0.04} dur={0.25} w={3} opacity={0.8} />;
        })}
        <Stroke d="M80 168 C180 212 380 212 480 168" at={at + 1.0} dur={1.0} w={4} color={COLORS.beige} dash="10 12" />
      </svg>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.16em', color: COLORS.white, textShadow: shadow, marginTop: 6, opacity: interpolate(t, [at + 1.4, at + 1.9], [0, 1], clamp)}}>
        РАЗРЕЗ ПО КРАЮ РЕСНИЦ
      </div>
    </div>
  );
};
