import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE} from '../design/tokens';

// Анимации ролика «Робот da Vinci в операционной» — новые, все по центру кадра (x 540), шрифт Stolzl,
// тёмно-синее стекло (светлый халат). Звуков у анимаций нет.

export const STOLZL = 'Stolzl, InterTightCyr, InterTightLat, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CX = 540;
const HALF = 326; // симметрично 214…866 — правая граница рабочей зоны ниже 1067

export const metal: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.6))',
};
const glass: React.CSSProperties = {
  backgroundColor: 'rgba(8, 32, 82, 0.64)',
  border: '1.5px solid rgba(255,255,255,0.28)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 26px rgba(0,0,0,0.28)',
};
const txt = (size: number): React.CSSProperties => ({fontFamily: STOLZL, fontWeight: 700, fontSize: size, color: COLORS.white});
const label: React.CSSProperties = {...txt(18), letterSpacing: '0.2em', opacity: 0.85};

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};
const ramp = (frame: number, fps: number, a: number, b: number, easing = EASE.out) =>
  interpolate(frame, [a * fps, b * fps], [0, 1], {...clamp, easing});
const useShow = (at: number, until: number) => {
  const {frame, fps} = useT();
  return Math.min(ramp(frame, fps, at, at + 0.35), 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut));
};
const Box: React.FC<{top: number; show: number; children: React.ReactNode}> = ({top, show, children}) => (
  <div style={{position: 'absolute', top, left: CX - HALF, width: HALF * 2, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: show, translate: `0px ${(1 - show) * 14}px`}}>
    {children}
  </div>
);

// Манипулятор робота (иконка)
const Arm: React.FC<{size?: number; wiggle?: number}> = ({size = 64, wiggle = 0}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x={8} y={50} width={30} height={8} rx={3} fill={COLORS.white} />
    <path d={`M22 50 L22 30 L${40 + wiggle} ${16 - wiggle * 0.5}`} fill="none" stroke={COLORS.white} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={22} cy={30} r={4.5} fill={COLORS.beige} />
    <path d={`M${40 + wiggle} ${16 - wiggle * 0.5} l8 -4 M${40 + wiggle} ${16 - wiggle * 0.5} l6 6`} stroke={COLORS.beige} strokeWidth={4} strokeLinecap="round" />
  </svg>
);
const Mark: React.FC<{ok: boolean; v: number}> = ({ok, v}) => (
  <svg width={34} height={34} viewBox="0 0 34 34" style={{scale: String(v)}}>
    <circle cx={17} cy={17} r={16} fill={ok ? COLORS.beige : 'none'} stroke={ok ? COLORS.beige : '#FF8A7E'} strokeWidth={2.5} />
    {ok ? <path d="M10 17.5 L15 22.5 L24.5 12" stroke={COLORS.navy} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M12 12 L22 22 M22 12 L12 22" stroke="#FF8A7E" strokeWidth={3} strokeLinecap="round" />}
  </svg>
);

// ── Хук ─────────────────────────────────────────────────────────────────────
export const RobotHook: React.FC<{until: number; top: number}> = ({until, top}) => {
  const {frame, fps} = useT();
  const out = 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut);
  const a = spring({frame: frame - 0.3 * fps, fps, config: {damping: 13, stiffness: 160}});
  const b = ramp(frame, fps, 0.75, 1.1);
  const q = frame > 1.1 * fps ? Math.sin((frame / fps - 1.1) * 7) * 10 * Math.exp(-(frame / fps - 1.1) * 1.8) : 0;
  return (
    <Box top={top} show={out}>
      <div style={{...txt(30), letterSpacing: '0.2em', ...metal, opacity: Math.min(1, a * 2)}}>РОБОТ</div>
      <div style={{fontFamily: STOLZL, fontWeight: 700, fontSize: 80, lineHeight: '88px', ...metal, scale: String(0.6 + a * 0.4), opacity: Math.min(1, a * 2)}}>DA VINCI</div>
      <div style={{...glass, borderRadius: 999, padding: '8px 22px', marginTop: 10, ...txt(32), opacity: b, scale: String(0.85 + b * 0.15)}}>
        ЗАМЕНИТ ХИРУРГА<span style={{display: 'inline-block', color: COLORS.beige, rotate: `${q}deg`, transformOrigin: '50% 0%'}}>?</span>
      </div>
    </Box>
  );
};

// ── Карточка робота со стрелкой на него (он за спиной врача, справа) ─────────────
export const RobotCard: React.FC<{at: number; until: number; top: number}> = ({at, until, top}) => {
  const {frame, fps} = useT();
  const show = useShow(at, until);
  const arrow = ramp(frame, fps, at + 0.5, at + 1.0, EASE.inOut);
  return (
    <Box top={top} show={show}>
      <div style={{...glass, borderRadius: 26, padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 18}}>
        <Arm size={70} />
        <div>
          <div style={label}>ХИРУРГИЧЕСКИЙ РОБОТ</div>
          <div style={{...txt(40), marginTop: 6}}>da Vinci</div>
        </div>
        <svg width={60} height={40} viewBox="0 0 60 40">
          <path d="M4 34 C20 30 34 20 50 8 M38 6 L52 6 L50 20" fill="none" stroke={COLORS.beige} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow} />
        </svg>
      </div>
    </Box>
  );
};

// ── Пластика ✗ / урология ✓ ─────────────────────────────────────────────────
export const WhatItDoes: React.FC<{at: number; noAt: number; yesAt: number; until: number; top: number}> = ({at, noAt, yesAt, until, top}) => {
  const {frame, fps} = useT();
  const show = useShow(at, until);
  const row = (text: string, ok: boolean, when: number) => {
    const v = spring({frame: frame - when * fps, fps, config: {damping: 14, stiffness: 170}});
    return (
      <div style={{...glass, borderRadius: 20, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, width: 520, opacity: Math.min(1, v * 2), translate: `${(1 - v) * 30}px 0px`}}>
        <span style={txt(30)}>{text}</span>
        <Mark ok={ok} v={v} />
      </div>
    );
  };
  return (
    <Box top={top} show={show}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        {row('пластические операции', false, noAt)}
        {row('урологические операции', true, yesAt)}
      </div>
    </Box>
  );
};

// ── Неделя: загорается воскресенье ──────────────────────────────────────────
export const Week: React.FC<{at: number; sunAt: number; until: number; top: number}> = ({at, sunAt, until, top}) => {
  const {frame, fps} = useT();
  const show = useShow(at, until);
  const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  return (
    <Box top={top} show={show}>
      <div style={{...label, marginBottom: 12, textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>РОБОТ ОПЕРИРУЕТ</div>
      <div style={{display: 'flex', gap: 10}}>
        {days.map((d, i) => {
          const pop = ramp(frame, fps, at + i * 0.05, at + i * 0.05 + 0.25);
          const sun = i === 6 ? spring({frame: frame - sunAt * fps, fps, config: {damping: 11, stiffness: 160}}) : 0;
          return (
            <div key={d} style={{...glass, width: 76, height: 76, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', ...txt(24), opacity: pop * (i === 6 ? 1 : 1 - Math.min(1, sun) * 0.45), backgroundColor: i === 6 && sun > 0.5 ? COLORS.beige : glass.backgroundColor, color: i === 6 && sun > 0.5 ? COLORS.navy : COLORS.white, scale: String(1 + sun * 0.18)}}>
              {d}
            </div>
          );
        })}
      </div>
    </Box>
  );
};

// ── Сегодня → будущее: робот едет к «пластике?» ───────────────────────────────
export const Future: React.FC<{at: number; moveAt: number; qAt: number; until: number; top: number}> = ({at, moveAt, qAt, until, top}) => {
  const {frame, fps, t} = useT();
  const show = useShow(at, until);
  const line = ramp(frame, fps, at + 0.1, at + 0.8, EASE.inOut);
  const move = ramp(frame, fps, moveAt, moveAt + 1.0, EASE.inOut);
  const q = ramp(frame, fps, qAt, qAt + 0.4);
  const W = 560;
  const pulse = 1 + Math.sin(t * 6) * 0.06 * q;
  return (
    <Box top={top} show={show}>
      <div style={{position: 'relative', width: W, height: 170}}>
        <div style={{position: 'absolute', left: 30, top: 92, height: 4, width: (W - 60) * line, background: `repeating-linear-gradient(90deg, ${COLORS.white} 0 14px, transparent 14px 24px)`}} />
        <div style={{position: 'absolute', left: 0, top: 112, width: 120, textAlign: 'center', ...txt(22), textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>сегодня</div>
        <div style={{position: 'absolute', right: 0, top: 112, width: 140, textAlign: 'center', ...txt(22), textShadow: '0 2px 10px rgba(0,0,0,0.7)', opacity: line}}>будущее</div>
        <div style={{...glass, position: 'absolute', left: 20 + move * (W - 140), top: 40, width: 96, height: 70, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Arm size={52} />
        </div>
        <div style={{...glass, position: 'absolute', right: -6, top: -4, borderRadius: 999, padding: '6px 16px', ...txt(24), opacity: q, scale: String((0.8 + q * 0.2) * pulse)}}>
          пластика<span style={{color: COLORS.beige}}>?</span>
        </div>
      </div>
    </Box>
  );
};

// ── Хирург управляет роботом: по линии бегут точки ────────────────────────────
export const Control: React.FC<{at: number; surgeonAt: number; linkAt: number; everyAt: number; until: number; top: number}> = ({at, surgeonAt, linkAt, everyAt, until, top}) => {
  const {frame, fps, t} = useT();
  const show = useShow(at, until);
  const s = spring({frame: frame - surgeonAt * fps, fps, config: {damping: 14, stiffness: 160}});
  const link = ramp(frame, fps, linkAt, linkAt + 0.6, EASE.inOut);
  const every = ramp(frame, fps, everyAt, everyAt + 0.3);
  const wig = every * Math.sin(t * 9) * 6;
  const node = (children: React.ReactNode, name: string, v: number) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: Math.min(1, v * 2), scale: String(0.8 + v * 0.2)}}>
      <div style={{...glass, width: 110, height: 110, borderRadius: 55, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
      <div style={{...txt(24), textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>{name}</div>
    </div>
  );
  return (
    <Box top={top} show={show}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 0}}>
        {node(
          <svg width={56} height={56} viewBox="0 0 56 56">
            <circle cx={28} cy={18} r={10} fill={COLORS.white} />
            <path d="M8 52 C10 36 46 36 48 52 Z" fill={COLORS.white} />
          </svg>,
          'хирург',
          s,
        )}
        <div style={{position: 'relative', width: 230, height: 110}}>
          <div style={{position: 'absolute', left: 10, right: 10, top: 53, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', clipPath: `inset(0 ${(1 - link) * 100}% 0 0)`}} />
          {link > 0.95
            ? [0, 1, 2, 3].map((i) => {
                const k = ((t * 0.9 + i / 4) % 1);
                return <div key={i} style={{position: 'absolute', top: 49, left: 10 + k * 198, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.beige, opacity: Math.sin(k * Math.PI)}} />;
              })
            : null}
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', ...txt(20), opacity: link, textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>управляет</div>
        </div>
        {node(<Arm size={60} wiggle={wig} />, 'робот', s)}
      </div>
    </Box>
  );
};

// ── Финал ───────────────────────────────────────────────────────────────────
export const Final: React.FC<{at: number; top: number}> = ({at, top}) => {
  const {frame, fps} = useT();
  const a = ramp(frame, fps, at, at + 0.5);
  const b = ramp(frame, fps, at + 0.35, at + 0.85);
  const sweep = interpolate(frame, [(at + 0.5) * fps, (at + 1.4) * fps], [-30, 130], clamp);
  const line: React.CSSProperties = {fontFamily: STOLZL, fontWeight: 700, fontSize: 60, lineHeight: '68px', ...metal};
  return (
    <Box top={top} show={1}>
      <div style={{position: 'relative', opacity: a, translate: `0px ${(1 - a) * 18}px`, filter: `blur(${(1 - a) * 8}px)`, textAlign: 'center'}}>
        <div style={line}>КАЖДОЕ ДВИЖЕНИЕ</div>
        <div style={{position: 'absolute', inset: 0, ...line, backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,0.95) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%)`, filter: 'none'}}>КАЖДОЕ ДВИЖЕНИЕ</div>
      </div>
      <div style={{...glass, borderRadius: 999, padding: '8px 22px', marginTop: 12, ...txt(30), opacity: b, scale: String(0.85 + b * 0.15)}}>контролирует хирург</div>
    </Box>
  );
};
