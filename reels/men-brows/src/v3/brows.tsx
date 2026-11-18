import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE} from '../design/tokens';

// Анимации ролика «Мужской взгляд и эндоскопия»: одна схема мужских глаз и бровей по центру,
// которая меняется по ходу рассказа (низкие брови → кожа на ресницах → блефаропластика →
// подъём бровей и уходящая «мужественность» → эндоскопия «редко»). Шрифт Stolzl, без звуков.

export const STOLZL = 'Stolzl, InterTightCyr, InterTightLat, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CX = 540;
const HALF = 326;

export const metal: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.6))',
};
const glass: React.CSSProperties = {
  backgroundColor: 'rgba(10, 14, 30, 0.6)',
  border: '1.5px solid rgba(255,255,255,0.25)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 26px rgba(0,0,0,0.3)',
};
const txt = (size: number): React.CSSProperties => ({fontFamily: STOLZL, fontWeight: 700, fontSize: size, color: COLORS.white});

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};
const ramp = (frame: number, fps: number, a: number, b: number, easing = EASE.out) =>
  interpolate(frame, [a * fps, b * fps], [0, 1], {...clamp, easing});

// ── Хук: строки выезжают из-под линии, линия прорисовывается ──────────────────
export const LineHook: React.FC<{until: number; top: number; lines: string[]}> = ({until, top, lines}) => {
  const {frame, fps} = useT();
  const out = 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut);
  const rule = ramp(frame, fps, 0.15, 0.55, EASE.inOut);
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out}}>
      {lines.map((l, i) => {
        const v = ramp(frame, fps, 0.3 + i * 0.16, 0.7 + i * 0.16);
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: 4}}>
            <div style={{fontFamily: STOLZL, fontWeight: 700, fontSize: i === 0 ? 46 : 64, lineHeight: i === 0 ? '54px' : '70px', ...metal, translate: `0px ${(1 - v) * 100}%`}}>{l}</div>
          </div>
        );
      })}
      <div style={{height: 3, width: 420 * rule, marginTop: 10, background: `linear-gradient(90deg, rgba(248,240,229,0), ${COLORS.beige}, rgba(248,240,229,0))`}} />
    </div>
  );
};

// ── Схема глаз и бровей ──────────────────────────────────────────────────────
type Story = {
  at: number; // появление схемы
  lowAt: number; // «низкое положение бровей»
  skinAt: number; // «кожа лежит на ресницах»
  blephAt: number; // «блефаропластика»
  liftAt: number; // «поднимем брови»
  openAt: number; // «открытый взгляд»
  maleAt: number; // «мужественность»
  until: number;
};

export const BrowStory: React.FC<Story & {top: number}> = ({at, lowAt, skinAt, blephAt, liftAt, openAt, maleAt, until, top}) => {
  const {frame, fps} = useT();
  const show = Math.min(ramp(frame, fps, at, at + 0.4), 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut));
  const draw = ramp(frame, fps, at, at + 0.9, EASE.inOut);
  const skin = ramp(frame, fps, skinAt, skinAt + 0.8, EASE.inOut) * (1 - ramp(frame, fps, blephAt + 0.3, blephAt + 1.0, EASE.inOut));
  const cutLine = ramp(frame, fps, blephAt, blephAt + 0.4, EASE.inOut) * (1 - ramp(frame, fps, blephAt + 1.2, blephAt + 1.5));
  const lift = ramp(frame, fps, liftAt, liftAt + 0.9, EASE.inOut);
  const open = ramp(frame, fps, openAt, openAt + 0.6, EASE.inOut);
  const maleV = 1 - ramp(frame, fps, maleAt, maleAt + 1.0, EASE.inOut);
  const maleShow = ramp(frame, fps, liftAt + 0.2, liftAt + 0.6);
  // брови: низкие и прямые → поднятые и изогнутые
  const by = 70 - lift * 26;
  const arch = 4 + lift * 18;
  const brow = (x0: number, x1: number, flip: boolean) => {
    const mx = (x0 + x1) / 2 + (flip ? -10 : 10) * lift;
    return `M${x0} ${by + 4} Q${mx} ${by - arch} ${x1} ${by + (flip ? -2 : 6) * (1 - lift) + 2}`;
  };
  const eye = (cx: number) => {
    const h = 15 + open * 4;
    return (
      <g>
        <path d={`M${cx - 58} 120 Q${cx} ${120 - h * 2.2} ${cx + 58} 120 Q${cx} ${120 + h * 1.6} ${cx - 58} 120 Z`} fill="none" stroke={COLORS.white} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <circle cx={cx} cy={118} r={13} fill={COLORS.white} opacity={draw} />
        {/* кожа века, нависающая на ресницы */}
        <path d={`M${cx - 66} 104 Q${cx} ${96 + skin * 46} ${cx + 66} 104 Q${cx} 72 ${cx - 66} 104 Z`} fill="rgba(226,182,150,0.95)" stroke={COLORS.beige} strokeWidth={3} opacity={Math.min(1, skin * 1.4)} />
        {/* линия иссечения при блефаропластике */}
        <path d={`M${cx - 54} 96 Q${cx} 84 ${cx + 54} 96`} fill="none" stroke="#FF8A7E" strokeWidth={3} strokeDasharray="7 6" opacity={cutLine} />
      </g>
    );
  };
  const lbl = (text: string, v: number, ok?: boolean) => (
    <div style={{...glass, borderRadius: 999, padding: '8px 20px', ...txt(26), opacity: v, scale: String(0.85 + v * 0.15), whiteSpace: 'nowrap', borderColor: ok ? COLORS.beige : glass.borderColor}}>{text}</div>
  );
  const lowV = ramp(frame, fps, lowAt, lowAt + 0.4) * (1 - ramp(frame, fps, skinAt - 0.2, skinAt + 0.1));
  const skinV = ramp(frame, fps, skinAt + 0.3, skinAt + 0.7) * (1 - ramp(frame, fps, blephAt - 0.1, blephAt + 0.2));
  const blV = ramp(frame, fps, blephAt, blephAt + 0.4) * (1 - ramp(frame, fps, liftAt - 0.3, liftAt));
  const openV = ramp(frame, fps, openAt, openAt + 0.4);
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: show}}>
      <div style={{...glass, borderRadius: 30, padding: '10px 18px'}}>
        <svg width={420} height={170} viewBox="0 0 420 170">
          <path d={brow(48, 172, false)} fill="none" stroke={COLORS.white} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={brow(372, 248, true)} fill="none" stroke={COLORS.white} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          {eye(110)}
          {eye(310)}
          {/* стрелки подъёма */}
          {[110, 310].map((x) => (
            <path key={x} d={`M${x} ${60 - lift * 10} l0 -26 M${x - 9} ${44 - lift * 10} l9 -10 l9 10`} fill="none" stroke={COLORS.beige} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={lift * (1 - open * 0.6)} />
          ))}
        </svg>
      </div>
      <div style={{height: 46, position: 'relative', width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'absolute'}}>{lbl('низкие брови — норма у мужчин', lowV)}</div>
        <div style={{position: 'absolute'}}>{lbl('кожа лежит на ресницах', skinV)}</div>
        <div style={{position: 'absolute'}}>{lbl('блефаропластика ✓', blV, true)}</div>
        <div style={{position: 'absolute'}}>{lbl('открытый взгляд', openV)}</div>
      </div>
      {/* шкала «мужественность» уходит при подъёме бровей */}
      <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: maleShow}}>
        <span style={{...txt(22), textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>мужественность</span>
        <div style={{width: 240, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${maleV * 100}%`, borderRadius: 7, background: maleV > 0.4 ? COLORS.beige : '#FF8A7E'}} />
        </div>
      </div>
    </div>
  );
};

// ── Эндоскопия — «редко»: шкала частоты с бегунком у края ───────────────────────
export const Rarely: React.FC<{at: number; rareAt: number; until: number; top: number}> = ({at, rareAt, until, top}) => {
  const {frame, fps} = useT();
  const show = Math.min(ramp(frame, fps, at, at + 0.4), 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut));
  const pos = interpolate(frame, [at * fps, (at + 0.6) * fps, rareAt * fps, (rareAt + 0.7) * fps], [0.5, 0.5, 0.5, 0.08], {...clamp, easing: EASE.inOut});
  const pop = spring({frame: frame - rareAt * fps, fps, config: {damping: 12, stiffness: 160}});
  const W = 520;
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: show}}>
      <div style={{...glass, borderRadius: 24, padding: '14px 24px', ...txt(30), textAlign: 'center'}}>эндоскопическое омоложение</div>
      <div style={{width: W, display: 'flex', justifyContent: 'space-between', ...txt(20), textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>
        <span>редко</span>
        <span>часто</span>
      </div>
      <div style={{position: 'relative', width: W, height: 14, borderRadius: 7, background: 'linear-gradient(90deg, rgba(248,240,229,0.9), rgba(255,255,255,0.25))'}}>
        <div style={{position: 'absolute', top: -9, left: pos * W - 16, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, boxShadow: '0 2px 10px rgba(0,0,0,0.4)'}} />
      </div>
      <div style={{...glass, borderRadius: 999, padding: '6px 18px', ...txt(24), opacity: Math.min(1, pop * 2), scale: String(0.7 + pop * 0.3), borderColor: COLORS.beige}}>мужчинам — редко</div>
    </div>
  );
};

// ── Финал ───────────────────────────────────────────────────────────────────
export const Final: React.FC<{at: number; top: number; line: string; sub: string}> = ({at, top, line, sub}) => {
  const {frame, fps} = useT();
  const a = ramp(frame, fps, at, at + 0.5);
  const b = ramp(frame, fps, at + 0.35, at + 0.85);
  const sweep = interpolate(frame, [(at + 0.5) * fps, (at + 1.4) * fps], [-30, 130], clamp);
  const st: React.CSSProperties = {fontFamily: STOLZL, fontWeight: 700, fontSize: 60, lineHeight: '68px', textAlign: 'center', ...metal};
  return (
    <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative', opacity: a, translate: `0px ${(1 - a) * 18}px`, filter: `blur(${(1 - a) * 8}px)`}}>
        <div style={st}>{line}</div>
        <div style={{position: 'absolute', inset: 0, ...st, backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,0.95) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%)`, filter: 'none'}}>{line}</div>
      </div>
      <div style={{...glass, borderRadius: 999, padding: '8px 22px', marginTop: 12, ...txt(28), opacity: b, scale: String(0.85 + b * 0.15)}}>{sub}</div>
    </div>
  );
};
