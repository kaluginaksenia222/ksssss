import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS} from '../design/tokens';

// Анимации ролика «Антидепрессанты и операция» — новые, без синего фона, всё прямо на кадре:
// хук с капсулой и буквами, падающими с отскоком, и «?»-маятником; опрос-стикер «Отказ? Да/Нет»;
// лупа, проверяющая три пункта; петля «назначил сам себе»; дерево решений; бейдж анестезиолога
// на ленте; круги «наркоз ∩ препараты»; капсула, которая уходит с таймлайна до операции и возвращается после.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Рабочая зона Reels (маска заказчика): x 100–980, y 330–1500; ниже 1067 правая граница 866
export const SAFE = {left: 100, right: 980, lowRight: 866, top: 330, bottom: 1500};
const LOW_W = SAFE.lowRight - SAFE.left;

export const metal: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.55))',
};
const glass: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.13)',
  border: '1.5px solid rgba(255,255,255,0.32)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 6px 24px rgba(0,0,0,0.22)',
};
const shadow = '0 2px 12px rgba(0,0,0,0.65)';
const mono: React.CSSProperties = {fontFamily: FONTS.mono, fontSize: 20, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.88)', textShadow: shadow};
const body = (size: number): React.CSSProperties => ({fontFamily: FONTS.body, fontWeight: 500, fontSize: size, color: COLORS.white});

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};
const ramp = (frame: number, fps: number, a: number, b: number, easing = EASE.out) =>
  interpolate(frame, [a * fps, b * fps], [0, 1], {...clamp, easing});
const useInOut = (at: number, until: number, inDur = 0.35, outDur = 0.35) => {
  const {frame, fps} = useT();
  return Math.min(ramp(frame, fps, at, at + inDur), 1 - ramp(frame, fps, until - outDur, until, EASE.inOut));
};

// Капсула (две половинки)
const Capsule: React.FC<{w?: number; style?: React.CSSProperties}> = ({w = 90, style}) => (
  <svg width={w} height={w * 0.42} viewBox="0 0 100 42" style={{overflow: 'visible', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.45))', ...style}}>
    <path d="M21 1 H50 V41 H21 A20 20 0 0 1 21 1 Z" fill={COLORS.beige} />
    <path d="M50 1 H79 A20 20 0 0 1 79 41 H50 Z" fill="#FFFFFF" />
    <path d="M14 10 Q22 5 34 6" stroke="rgba(255,255,255,0.8)" strokeWidth={3} fill="none" strokeLinecap="round" />
  </svg>
);

// ── ХУК ─────────────────────────────────────────────────────────────────────
export const PillHook: React.FC<{until: number; top: number; word: string; dropAt: number; tailAt: number}> = ({until, top, word, dropAt, tailAt}) => {
  const {frame, fps, t} = useT();
  const out = 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut);
  // капсула влетает сверху с вращением и пружинит
  const cap = spring({frame, fps, config: {damping: 11, stiffness: 140, mass: 0.7}});
  const tail = ramp(frame, fps, tailAt, tailAt + 0.3);
  const swing = frame > tailAt * fps ? Math.sin((t - tailAt) * 7) * 18 * Math.exp(-(t - tailAt) * 1.6) : 0;
  return (
    <div style={{position: 'absolute', top, left: SAFE.left, width: LOW_W, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out}}>
      <div style={{translate: `0px ${(1 - cap) * -260}px`, rotate: `${(1 - cap) * 200 - 12}deg`, opacity: Math.min(1, cap * 3)}}>
        <Capsule w={110} />
      </div>
      <div style={{display: 'flex', marginTop: 14}}>
        {word.split('').map((ch, i) => {
          const s = spring({frame: frame - (dropAt + i * 0.035) * fps, fps, config: {damping: 9, stiffness: 170, mass: 0.6}});
          return (
            <span key={i} style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, lineHeight: '74px', textTransform: 'uppercase', ...metal, display: 'inline-block', translate: `0px ${(1 - s) * -120}px`, opacity: s > 0.02 ? 1 : 0}}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6, opacity: tail, translate: `0px ${(1 - tail) * 16}px`}}>
        <span style={{...body(46), fontWeight: 400, letterSpacing: '0.04em', textShadow: shadow}}>и операция</span>
        <span style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 70, color: COLORS.beige, display: 'inline-block', transformOrigin: '50% 0%', rotate: `${swing}deg`, textShadow: shadow}}>?</span>
      </div>
    </div>
  );
};

// ── 1. Опрос-стикер «Отказ в операции?» ──────────────────────────────────────
export const PollSticker: React.FC<{at: number; answerAt: number; until: number; top: number}> = ({at, answerAt, until, top}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const pop = spring({frame: frame - at * fps, fps, config: {damping: 13, stiffness: 160}});
  const fill = ramp(frame, fps, answerAt, answerAt + 0.6, EASE.inOut);
  const W = 520;
  const row = (label: string, pct: number, win: boolean) => (
    <div style={{position: 'relative', height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', border: win && fill > 0.5 ? `2px solid ${COLORS.beige}` : '2px solid rgba(255,255,255,0.18)'}}>
      <div style={{position: 'absolute', inset: 0, width: `${pct * 100}%`, background: win ? 'linear-gradient(90deg, rgba(248,240,229,0.9), rgba(248,240,229,0.6))' : 'rgba(255,255,255,0.25)'}} />
      <div style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px'}}>
        <span style={{...body(30), fontWeight: 700, color: win && fill > 0.3 ? '#3A1410' : COLORS.white}}>{label}</span>
        <span style={{...body(26), color: win && fill > 0.85 ? '#3A1410' : COLORS.white, opacity: fill}}>{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', top, left: SAFE.left + (LOW_W - W) / 2, width: W, opacity: show, scale: String(0.7 + pop * 0.3), rotate: `${(1 - pop) * -6 - 2}deg`}}>
      <div style={{...glass, borderRadius: 26, padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 12}}>
        <div style={{...body(32), fontWeight: 700, textAlign: 'center', marginBottom: 4, textShadow: shadow}}>Отказ в операции?</div>
        {row('Да', 0, false)}
        {row('Нет', fill, true)}
      </div>
    </div>
  );
};

// ── 2. Лупа проверяет три пункта ────────────────────────────────────────────
export const LensCheck: React.FC<{items: {text: string; at: number}[]; until: number; y: number}> = ({items, until, y}) => {
  const {frame, fps} = useT();
  const show = useInOut(items[0].at - 0.3, until);
  const rowH = 78;
  // лупа переезжает к последнему появившемуся пункту
  const input = items.flatMap((it) => [it.at * fps, it.at * fps + 10]);
  const output = items.flatMap((_, i) => [Math.max(0, i - 1), i]);
  const idx = interpolate(frame, input, output, {...clamp, easing: EASE.inOut});
  return (
    <div style={{position: 'absolute', top: y, right: 1080 - SAFE.right, width: 270, opacity: show}}>
      <div style={{...mono, textAlign: 'right', marginBottom: 14}}>ПРОВЕРЯЕМ</div>
      <div style={{position: 'relative'}}>
        {items.map((it, i) => {
          const v = ramp(frame, fps, it.at, it.at + 0.3);
          const lit = Math.max(0, 1 - Math.abs(idx - i));
          return (
            <div key={i} style={{height: rowH, display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
              <div style={{...glass, borderRadius: 999, padding: '10px 22px', opacity: v, translate: `${(1 - v) * 30}px 0px`, borderColor: `rgba(248,240,229,${0.3 + lit * 0.6})`, boxShadow: `0 0 ${lit * 22}px rgba(248,240,229,0.45)`}}>
                <span style={{...body(30)}}>{it.text}</span>
              </div>
            </div>
          );
        })}
        {/* лупа слева от пункта */}
        <svg width={70} height={70} style={{position: 'absolute', left: -6, top: idx * rowH + 4, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))', opacity: ramp(frame, fps, items[0].at, items[0].at + 0.3)}}>
          <circle cx={28} cy={28} r={18} fill="rgba(255,255,255,0.18)" stroke={COLORS.white} strokeWidth={4} />
          <line x1={41} y1={41} x2={58} y2={58} stroke={COLORS.white} strokeWidth={6} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

// ── 3. «Назначили сами себе»: стрелка-петля возвращается в начало ─────────────
export const SelfLoop: React.FC<{at: number; until: number; x: number; y: number}> = ({at, until, x, y}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const draw = ramp(frame, fps, at + 0.1, at + 1.0, EASE.inOut);
  const blink = frame > (at + 1.0) * fps ? 0.55 + 0.45 * Math.sin(frame / 3) : ramp(frame, fps, at + 0.8, at + 1.0);
  const R = 92;
  const a0 = -Math.PI * 0.4;
  const a1 = a0 + Math.PI * 1.75 * draw;
  const pt = (a: number) => [135 + R * Math.cos(a), 120 + R * Math.sin(a)];
  const [sx, sy] = pt(a0);
  const [ex, ey] = pt(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const tang = a1 + Math.PI / 2;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 270, opacity: show}}>
      <svg width={270} height={240} style={{overflow: 'visible', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'}}>
        {draw > 0.01 ? <path d={`M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`} fill="none" stroke={COLORS.beige} strokeWidth={4} strokeLinecap="round" /> : null}
        {draw > 0.05 ? (
          <path
            d={`M ${ex - 16 * Math.cos(tang - 0.5)} ${ey - 16 * Math.sin(tang - 0.5)} L ${ex} ${ey} L ${ex - 16 * Math.cos(tang + 0.5)} ${ey - 16 * Math.sin(tang + 0.5)}`}
            fill="none"
            stroke={COLORS.beige}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 78, textAlign: 'center'}}>
        <div style={{...body(30), lineHeight: 1.15, textShadow: shadow}}>
          назначил
          <br />
          сам себе
        </div>
      </div>
      <div style={{position: 'absolute', right: 6, top: 6, width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2B35B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.heading, fontWeight: 900, fontSize: 28, color: '#3A1410', opacity: blink}}>!</div>
    </div>
  );
};

// ── 4. Дерево решений: от «решение» растут три ветки ──────────────────────────
export const DecisionTree: React.FC<{rootAt: number; leaves: {text: string; at: number}[]; until: number; top: number}> = ({rootAt, leaves, until, top}) => {
  const {frame, fps} = useT();
  const show = useInOut(rootAt, until);
  const root = spring({frame: frame - rootAt * fps, fps, config: {damping: 14, stiffness: 170}});
  const rx = 70;
  const ry = 150;
  const lx = 250;
  const gap = 104;
  return (
    <div style={{position: 'absolute', top, left: SAFE.left, width: LOW_W, height: 3 * gap + 20, opacity: show}}>
      <svg width={LOW_W} height={3 * gap + 20} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'}}>
        {leaves.map((lf, i) => {
          const y = 40 + i * gap;
          const p = ramp(frame, fps, lf.at - 0.25, lf.at + 0.2, EASE.inOut);
          return (
            <path
              key={i}
              d={`M ${rx + 60} ${ry} C ${rx + 140} ${ry}, ${lx - 90} ${y}, ${lx} ${y}`}
              fill="none"
              stroke="rgba(248,240,229,0.85)"
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: rx - 64, top: ry - 32, ...glass, borderRadius: 999, padding: '12px 22px', scale: String(root), borderColor: COLORS.beige}}>
        <span style={{...body(28), fontWeight: 700}}>решение</span>
      </div>
      {leaves.map((lf, i) => {
        const v = spring({frame: frame - lf.at * fps, fps, config: {damping: 14, stiffness: 170}});
        return (
          <div key={i} style={{position: 'absolute', left: lx, top: 40 + i * gap - 30, ...glass, borderRadius: 999, padding: '10px 22px', opacity: Math.min(1, v * 2), scale: String(0.7 + v * 0.3), transformOrigin: '0% 50%'}}>
            <span style={{...body(28)}}>{lf.text}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── 5. Бейдж анестезиолога на ленте: качается и успокаивается ─────────────────
export const SwingBadge: React.FC<{at: number; until: number; x: number}> = ({at, until, x}) => {
  const {frame, fps, t} = useT();
  const show = useInOut(at, until, 0.2);
  const drop = spring({frame: frame - at * fps, fps, config: {damping: 12, stiffness: 120}});
  const ang = frame > at * fps ? Math.sin((t - at) * 5.5) * 16 * Math.exp(-(t - at) * 1.3) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: SAFE.top, width: 250, height: 330, opacity: show, transformOrigin: '50% 0%', rotate: `${ang}deg`, translate: `0px ${(1 - drop) * -320}px`}}>
      <div style={{position: 'absolute', left: 117, top: 0, width: 16, height: 120, background: `repeating-linear-gradient(180deg, ${COLORS.beige} 0 10px, #E7DCCB 10px 20px)`, borderRadius: 3}} />
      <div style={{position: 'absolute', left: 105, top: 112, width: 40, height: 22, borderRadius: 6, border: '4px solid #C9CFDA'}} />
      <div style={{...glass, position: 'absolute', left: 0, top: 130, width: 250, borderRadius: 22, padding: '18px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.18)'}}>
        <div style={{width: 46, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.35)'}} />
        <div style={{...mono, fontSize: 16, color: 'rgba(255,255,255,0.75)'}}>РЕШАЕТ</div>
        <div style={{...body(28), fontWeight: 700}}>анестезиолог</div>
      </div>
    </div>
  );
};

// ── 6. «Наркоз ∩ препараты»: два круга сходятся, пересечение пульсирует ────────
export const MixCircles: React.FC<{aAt: number; bAt: number; until: number; top: number}> = ({aAt, bAt, until, top}) => {
  const {frame, fps, t} = useT();
  const show = useInOut(aAt - 0.2, until);
  const a = spring({frame: frame - aAt * fps, fps, config: {damping: 14, stiffness: 120}});
  const b = spring({frame: frame - bAt * fps, fps, config: {damping: 14, stiffness: 120}});
  const meet = ramp(frame, fps, bAt + 0.3, bAt + 1.0, EASE.inOut);
  const R = 120;
  const dist = interpolate(meet, [0, 1], [320, 196]);
  const cx = LOW_W / 2;
  const pulse = meet > 0.9 ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
  const q = ramp(frame, fps, bAt + 0.9, bAt + 1.2);
  const circle = (x: number, s: number, label: string, tint: string) => (
    <div style={{position: 'absolute', left: x - R, top: 0, width: R * 2, height: R * 2, borderRadius: '50%', border: `2.5px solid ${tint}`, backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)', scale: String(s), opacity: Math.min(1, s * 2), display: 'flex', alignItems: 'center', justifyContent: label === 'наркоз' ? 'flex-start' : 'flex-end', padding: '0 16px'}}>
      <span style={{...body(26), textShadow: shadow}}>{label}</span>
    </div>
  );
  return (
    <div style={{position: 'absolute', top, left: SAFE.left, width: LOW_W, height: R * 2 + 60, opacity: show}}>
      {circle(cx - dist / 2, a, 'наркоз', 'rgba(255,255,255,0.8)')}
      {circle(cx + dist / 2, b, 'препараты', COLORS.beige)}
      <div style={{position: 'absolute', left: cx - 30, top: R - 40, width: 60, textAlign: 'center', fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, color: COLORS.beige, opacity: q, scale: String(1 + pulse * 0.12), textShadow: `0 0 ${10 + pulse * 16}px rgba(248,240,229,0.7)`}}>?</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: R * 2 + 14, textAlign: 'center', ...mono, opacity: q}}>СОВМЕСТИМОСТЬ</div>
    </div>
  );
};

// ── 7. Таймлайн: капсула уходит перед операцией и возвращается после ──────────
export const PillTimeline: React.FC<{at: number; offAt: number; backAt: number; until: number; top: number}> = ({at, offAt, backAt, until, top}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const line = ramp(frame, fps, at, at + 0.6, EASE.inOut);
  const W = 640;
  const x0 = (LOW_W - W) / 2;
  const pts = [0, 0.5, 1].map((k) => x0 + k * W);
  const off = ramp(frame, fps, offAt, offAt + 0.6, EASE.inOut);
  const back = ramp(frame, fps, backAt, backAt + 0.7, EASE.inOut);
  // капсула: на «до» → вверх и прочь (прозрачная) → возвращается и садится на «после»
  const px = back > 0 ? interpolate(back, [0, 1], [pts[1], pts[2]]) : pts[0];
  const hop = back > 0 ? -Math.sin(back * Math.PI) * 120 - (1 - back) * 90 : -off * 90;
  const op = back > 0 ? 0.35 + back * 0.65 : 1 - off * 0.65;
  const opGlow = ramp(frame, fps, offAt + 0.5, offAt + 0.9);
  const label = (text: string, x: number, active: number) => (
    <div style={{position: 'absolute', left: x - 90, width: 180, top: 46, textAlign: 'center', ...mono, color: active ? COLORS.beige : 'rgba(255,255,255,0.85)'}}>{text}</div>
  );
  return (
    <div style={{position: 'absolute', top, left: SAFE.left, width: LOW_W, height: 240, opacity: show}}>
      <div style={{position: 'absolute', left: x0, top: 120, height: 3, width: W * line, background: 'rgba(255,255,255,0.8)', borderRadius: 2}} />
      {pts.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x - 11, top: 110, width: 22, height: 22, borderRadius: 11, backgroundColor: i === 1 ? COLORS.beige : COLORS.white, opacity: line, boxShadow: i === 1 ? `0 0 ${opGlow * 24}px rgba(248,240,229,0.9)` : undefined}} />
      ))}
      <div style={{position: 'absolute', top: 120, left: 0, right: 0}}>
        {label('ДО', pts[0], 0)}
        {label('ОПЕРАЦИЯ', pts[1], 1)}
        {label('ПОСЛЕ', pts[2], back > 0.9 ? 1 : 0)}
      </div>
      <div style={{position: 'absolute', left: px - 45, top: 64 + hop, opacity: op * line}}>
        <Capsule w={90} />
      </div>
    </div>
  );
};
