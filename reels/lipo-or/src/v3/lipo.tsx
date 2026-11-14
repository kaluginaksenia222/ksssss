import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS} from '../design/tokens';

// Анимации ролика «Липосакция в операционной» — новые: шторка-открытие кадра и зачёркнутое «похудение»,
// силуэт фигуры, у которого подтягивается контур и уходят жировые зоны, три карточки видов липосакции
// с живыми иконками и меткой «сегодня». Всё по центру кадра (x 540), в рабочей зоне Reels.
// Халат светлый — элементы тёмно-синие стеклянные, чтобы читались.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const metal: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.6))',
};
const darkGlass: React.CSSProperties = {
  backgroundColor: 'rgba(8, 32, 82, 0.62)',
  border: '1.5px solid rgba(255,255,255,0.28)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 26px rgba(0,0,0,0.28)',
};
const mono: React.CSSProperties = {fontFamily: FONTS.mono, fontSize: 20, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.9)'};

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};
const ramp = (frame: number, fps: number, a: number, b: number, easing = EASE.out) =>
  interpolate(frame, [a * fps, b * fps], [0, 1], {...clamp, easing});

// Центр кадра и ширина под «зелёную» часть маски: справа ниже 1067 не дальше 866 → симметрично 214…866
const CX = 540;
const HALF = 326;

// ── ХУК: шторка открывает кадр ─────────────────────────────────────────────
export const Shutter: React.FC = () => {
  const {frame, fps} = useT();
  // кадр уже приоткрыт с первого кадра (он же обложка в ленте), шторки быстро разъезжаются
  const p = 0.45 + 0.55 * ramp(frame, fps, 0, 0.35, EASE.inOut);
  if (p >= 1) {
    return null;
  }
  const h = 960 * (1 - p);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, backgroundColor: '#0A0F1E'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h, backgroundColor: '#0A0F1E'}} />
    </AbsoluteFill>
  );
};

export const StrikeHook: React.FC<{until: number; top: number; strikeAt: number}> = ({until, top, strikeAt}) => {
  const {frame, fps} = useT();
  const out = 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut);
  const a = spring({frame: frame - 0.25 * fps, fps, config: {damping: 13, stiffness: 160}});
  const b = ramp(frame, fps, 0.9, 1.25);
  const strike = ramp(frame, fps, strikeAt, strikeAt + 0.3, EASE.inOut);
  const ne = ramp(frame, fps, 0.55, 0.85);
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out}}>
      <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 76, lineHeight: '84px', textTransform: 'uppercase', ...metal, scale: String(0.6 + a * 0.4), opacity: Math.min(1, a * 2)}}>
        липосакция
      </div>
      <div style={{...darkGlass, borderRadius: 999, padding: '6px 18px', fontFamily: FONTS.mono, fontSize: 26, letterSpacing: '0.24em', color: COLORS.white, marginTop: 8, opacity: ne, scale: String(0.8 + ne * 0.2)}}>НЕ МЕТОД</div>
      <div style={{position: 'relative', marginTop: 6, opacity: b, translate: `0px ${(1 - b) * 16}px`}}>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, lineHeight: '72px', textTransform: 'uppercase', color: COLORS.white, textShadow: '0 3px 14px rgba(0,0,0,0.65)'}}>похудения</div>
        <svg width={420} height={72} viewBox="0 0 420 72" style={{position: 'absolute', left: '50%', top: 0, translate: '-50% 0px', overflow: 'visible'}}>
          <path d="M6 44 C90 30 200 46 300 30 C350 24 390 30 414 26" fill="none" stroke="#FF6B5E" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
        </svg>
      </div>
    </div>
  );
};

// ── Силуэт: «коррекция фигуры», жировые зоны проступают и уходят ─────────────
export const Silhouette: React.FC<{at: number; zonesAt: number; goneAt: number; until: number; top: number}> = ({at, zonesAt, goneAt, until, top}) => {
  const {frame, fps, t} = useT();
  const show = Math.min(ramp(frame, fps, at, at + 0.4), 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut));
  const draw = ramp(frame, fps, at, at + 0.9, EASE.inOut);
  // контур талии подтягивается после появления
  const tight = ramp(frame, fps, at + 1.0, at + 2.2, EASE.inOut);
  const zones = ramp(frame, fps, zonesAt, zonesAt + 0.5);
  const gone = ramp(frame, fps, goneAt, goneAt + 0.9, EASE.inOut);
  const pulse = 1 + 0.06 * Math.sin(t * 6);
  const w = 26 * tight; // насколько сужается талия
  // торс спереди: плечи → талия (сужается) → бёдра → ноги
  const body = `M96 14 C104 26 136 26 144 14
                M96 14 C78 18 58 22 50 34 C44 60 56 84 ${68 + w} 120 C${76 + w} 140 ${78 + w} 152 ${72 + w * 0.6} 166 C54 196 44 226 50 258 C54 280 66 296 82 306
                M144 14 C162 18 182 22 190 34 C196 60 184 84 ${172 - w} 120 C${164 - w} 140 ${162 - w} 152 ${168 - w * 0.6} 166 C186 196 196 226 190 258 C186 280 174 296 158 306
                M120 216 V306`;
  const zone = (cx: number, cy: number) => (
    <ellipse cx={cx} cy={cy} rx={20 * pulse * (1 - gone)} ry={28 * pulse * (1 - gone)} fill="rgba(255,190,140,0.75)" opacity={zones} />
  );
  const lbl = ramp(frame, fps, at + 0.5, at + 0.9);
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: show}}>
      <div style={{...darkGlass, borderRadius: 28, padding: '14px 24px'}}>
        <svg width={240} height={310} viewBox="0 0 240 310">
          {zone(64, 200)}
          {zone(176, 200)}
          {zone(120, 168)}
          <path d={body} fill="none" stroke={COLORS.white} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <circle cx={120} cy={-4} r={0} />
        </svg>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12, opacity: lbl}}>
        <div style={{...darkGlass, borderRadius: 999, padding: '10px 20px', fontFamily: FONTS.body, fontWeight: 500, fontSize: 28, color: COLORS.white}}>коррекция фигуры</div>
        <div style={{...darkGlass, borderRadius: 999, padding: '10px 20px', fontFamily: FONTS.body, fontWeight: 500, fontSize: 28, color: COLORS.white, opacity: zones, translate: `0px ${(1 - zones) * 10}px`}}>
          {gone > 0.5 ? 'избыток ушёл' : 'локальный избыток'}
        </div>
      </div>
    </div>
  );
};

// ── Три вида липосакции: карточки с живыми иконками, метка «сегодня» ──────────
const Syringe: React.FC<{active: number}> = ({active}) => {
  const {frame} = useT();
  const push = active ? (Math.sin(frame / 6) + 1) * 6 : 0;
  return (
    <svg width={70} height={70} viewBox="0 0 70 70">
      <rect x={8} y={28} width={38} height={14} rx={3} fill="none" stroke={COLORS.white} strokeWidth={4} />
      <path d="M46 35 H62" stroke={COLORS.white} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${2 + push} 35 H${18 + push} M${2 + push} 28 V42`} stroke={COLORS.beige} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};
const Cannula: React.FC<{active: number}> = ({active}) => {
  const {frame} = useT();
  const jig = active ? Math.sin(frame * 2.2) * 3 : 0;
  return (
    <svg width={70} height={70} viewBox="0 0 70 70">
      <g transform={`translate(${jig} 0)`}>
        <rect x={6} y={30} width={22} height={10} rx={3} fill={COLORS.white} />
        <path d="M28 35 H64" stroke={COLORS.white} strokeWidth={4} strokeLinecap="round" />
      </g>
      {active ? [0, 1, 2].map((i) => <path key={i} d={`M${40 + i * 8} ${24 - (i % 2) * 3} l3 -5 M${40 + i * 8} ${46 + (i % 2) * 3} l3 5`} stroke={COLORS.beige} strokeWidth={2.5} strokeLinecap="round" />) : null}
    </svg>
  );
};
const Waves: React.FC<{active: number}> = ({active}) => {
  const {frame} = useT();
  return (
    <svg width={70} height={70} viewBox="0 0 70 70">
      <circle cx={14} cy={35} r={6} fill={COLORS.white} />
      {[0, 1, 2].map((i) => {
        const k = active ? ((frame / 20 + i / 3) % 1) : i / 3 + 0.2;
        return <path key={i} d={`M${20 + k * 40} ${35 - 8 - k * 18} A${10 + k * 26} ${10 + k * 26} 0 0 1 ${20 + k * 40} ${35 + 8 + k * 18}`} fill="none" stroke={COLORS.beige} strokeWidth={3} strokeLinecap="round" opacity={1 - k * 0.8} />;
      })}
    </svg>
  );
};

export const ThreeTypes: React.FC<{slotsAt: number; items: {title: string; at: number}[]; activeUntil: number[]; todayAt: number; until: number; top: number}> = ({slotsAt, items, activeUntil, todayAt, until, top}) => {
  const {frame, fps, t} = useT();
  const show = Math.min(ramp(frame, fps, slotsAt, slotsAt + 0.4), 1 - ramp(frame, fps, until - 0.4, until, EASE.inOut));
  const today = ramp(frame, fps, todayAt, todayAt + 0.5, EASE.inOut);
  const icons = [Syringe, Cannula, Waves];
  const W = 204;
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, opacity: show}}>
      <div style={{...mono, textAlign: 'center', marginBottom: 14, textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>3 ВИДА ЛИПОСАКЦИИ</div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 18}}>
        {items.map((it, i) => {
          const slot = spring({frame: frame - (slotsAt + i * 0.12) * fps, fps, config: {damping: 14, stiffness: 170}});
          const fill = spring({frame: frame - it.at * fps, fps, config: {damping: 13, stiffness: 160}});
          const isNow = t >= it.at && t < activeUntil[i] ? 1 : 0;
          const pick = i === 1 ? today : 0;
          const dim = today * (i === 1 ? 0 : 0.55);
          const Icon = icons[i];
          return (
            <div
              key={i}
              style={{
                ...darkGlass,
                position: 'relative',
                width: W,
                height: 220,
                borderRadius: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                opacity: Math.min(1, slot * 2) * (1 - dim),
                scale: String((0.85 + slot * 0.15) * (1 + pick * 0.08)),
                borderColor: isNow || pick > 0.5 ? COLORS.beige : 'rgba(255,255,255,0.28)',
                boxShadow: isNow || pick > 0.5 ? '0 0 26px rgba(248,240,229,0.45)' : darkGlass.boxShadow,
              }}
            >
              <div style={{position: 'absolute', top: 12, left: 16, fontFamily: FONTS.mono, fontSize: 20, color: 'rgba(255,255,255,0.7)'}}>0{i + 1}</div>
              <div style={{opacity: fill, scale: String(0.6 + fill * 0.4)}}>
                <Icon active={isNow || (i === 1 && pick > 0.5) ? 1 : 0} />
              </div>
              <div style={{fontFamily: FONTS.body, fontWeight: 700, fontSize: 21, color: COLORS.white, opacity: fill, textAlign: 'center', lineHeight: 1.15, whiteSpace: 'nowrap'}}>{it.title}</div>
              {i === 1 ? (
                <div style={{position: 'absolute', top: -18, left: '50%', translate: '-50% 0px', padding: '6px 14px', borderRadius: 999, backgroundColor: COLORS.beige, fontFamily: FONTS.mono, fontSize: 18, letterSpacing: '0.14em', color: COLORS.navy, opacity: today, scale: String(0.6 + today * 0.4)}}>СЕГОДНЯ</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Финал: итоговый заголовок со светлым бликом ─────────────────────────────
export const FinalTitle: React.FC<{at: number; top: number}> = ({at, top}) => {
  const {frame, fps} = useT();
  const a = ramp(frame, fps, at, at + 0.5);
  const b = ramp(frame, fps, at + 0.35, at + 0.85);
  const sweep = interpolate(frame, [(at + 0.5) * fps, (at + 1.4) * fps], [-30, 130], clamp);
  const line: React.CSSProperties = {fontFamily: FONTS.heading, fontWeight: 900, fontSize: 60, lineHeight: '68px', textTransform: 'uppercase', ...metal};
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative', opacity: a, translate: `0px ${(1 - a) * 18}px`, filter: `blur(${(1 - a) * 8}px)`}}>
        <div style={line}>коррекция фигуры</div>
        <div style={{position: 'absolute', inset: 0, ...line, backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,0.95) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%)`, filter: 'none'}}>коррекция фигуры</div>
      </div>
      <div style={{...darkGlass, borderRadius: 999, padding: '8px 22px', marginTop: 12, fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.white, opacity: b, scale: String(0.85 + b * 0.15)}}>а не похудение</div>
    </div>
  );
};
