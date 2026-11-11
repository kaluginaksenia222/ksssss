import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS} from '../design/tokens';

// Анимации ролика «Пациентка сбежала» — все новые, синего фона нет, всё прямо на кадре.
// Хук: слово влетает со «спидлайнами» и цветным расслоением кадра. Дальше: дуга-утро,
// «дрожащие» плашки эмоций, чат с набором текста, кардиограмма страха, кольцо обратного
// отсчёта, цитата на печатной машинке, зачёркнутые плашки, заголовок-«дешифровка»,
// шкала волнения с развилкой, кольцо готовности, табло-перевёртыш, штамп «НЕТ», луч лампы.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const metal: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))',
};

const glass: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.13)',
  border: '1.5px solid rgba(255,255,255,0.32)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 6px 24px rgba(0,0,0,0.22)',
};

const shadow = '0 2px 12px rgba(0,0,0,0.6)';

// Рабочая зона Reels (маска заказчика, пересчитана на 1080×1920):
// всё — между x 100 и 980, y 330 и 1500; ниже 1067 правая граница 866 (кнопки Instagram).
export const SAFE = {left: 100, right: 980, lowRight: 866, top: 330, bottom: 1500};
const titleBox: React.CSSProperties = {position: 'absolute', left: SAFE.left, right: 1080 - SAFE.lowRight};
const mono: React.CSSProperties = {fontFamily: FONTS.mono, fontSize: 20, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.85)', textShadow: shadow};

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

// ── ХУК ───────────────────────────────────────────────────────────────────
// Цветное расслоение кадра (красный и бирюзовый сдвигаются в стороны и сходятся)
export const RgbSplit: React.FC<{at: number; dur?: number; children: (style: React.CSSProperties) => React.ReactNode}> = ({at, dur = 0.35, children}) => {
  const {frame, fps} = useT();
  const p = interpolate(frame, [at * fps, (at + dur) * fps], [0, 1], clamp);
  if (p <= 0 || p >= 1) {
    return null;
  }
  const k = (1 - p) ** 2;
  const shift = 18 * k;
  return (
    <AbsoluteFill style={{opacity: 0.55 * k}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="onlyR">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="onlyGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
      </svg>
      <AbsoluteFill style={{mixBlendMode: 'screen', translate: `${shift}px 0px`}}>{children({filter: 'url(#onlyR)'})}</AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'screen', translate: `${-shift}px 0px`}}>{children({filter: 'url(#onlyGB)'})}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FlashCut: React.FC<{at: number}> = ({at}) => {
  const {frame, fps} = useT();
  const p = interpolate(frame, [at * fps, (at + 0.4) * fps], [0, 1], clamp);
  if (p >= 1 || p <= 0) {
    return null;
  }
  return <AbsoluteFill style={{backgroundColor: '#FFF3E6', opacity: (1 - p) ** 3 * 0.42}} />;
};

// «Пациентка / СБЕЖАЛА / перед операцией»: главное слово влетает справа и оставляет следы-полосы
export const RunAwayTitle: React.FC<{at: number; hitAt: number; tailAt: number; until: number; top: number}> = ({at, hitAt, tailAt, until, top}) => {
  const {frame, fps} = useT();
  const show = 1 - ramp(frame, fps, until - 0.35, until, EASE.inOut);
  const a = ramp(frame, fps, at, at + 0.3);
  const hit = ramp(frame, fps, hitAt, hitAt + 0.32, EASE.out);
  const tail = ramp(frame, fps, tailAt, tailAt + 0.35);
  const streak = interpolate(frame, [hitAt * fps, (hitAt + 0.2) * fps, (hitAt + 0.9) * fps], [0, 1, 0], clamp);
  const thin: React.CSSProperties = {fontFamily: FONTS.body, fontWeight: 400, fontSize: 38, letterSpacing: '0.24em', textTransform: 'uppercase', color: COLORS.white, textShadow: shadow};
  return (
    <div style={{...titleBox, top, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: show}}>
      <div style={{...thin, opacity: a, translate: `0px ${(1 - a) * 14}px`}}>пациентка</div>
      <div style={{position: 'relative', marginTop: 6, height: 96}}>
        {/* полосы скорости: тянутся влево за словом */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              right: '100%',
              top: 22 + i * 16,
              marginRight: 18 + i * 6,
              width: (160 + i * 50) * streak,
              height: 3,
              borderRadius: 3,
              background: `linear-gradient(90deg, rgba(248,240,229,0), ${COLORS.beige})`,
              opacity: 0.9 - i * 0.15,
            }}
          />
        ))}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: 80,
            lineHeight: '96px',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            ...metal,
            opacity: hit > 0 ? 1 : 0,
            translate: `${(1 - hit) * 520}px 0px`,
            transform: `skewX(${-(1 - hit) * 18}deg)`,
            filter: `${metal.filter} blur(${(1 - hit) * 8}px)`,
          }}
        >
          сбежала
        </div>
      </div>
      <div style={{...thin, fontSize: 34, letterSpacing: '0.16em', marginTop: 8, opacity: tail, translate: `0px ${(1 - tail) * 14}px`}}>перед самой операцией</div>
    </div>
  );
};

// ── 1. Утро в отделении: дуга, по которой поднимается солнце ───────────────────
export const MorningArc: React.FC<{at: number; until: number; x: number; y: number}> = ({at, until, x, y}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const draw = ramp(frame, fps, at, at + 0.8, EASE.inOut);
  const sun = ramp(frame, fps, at + 0.3, at + 2.6, EASE.inOut);
  const ang = Math.PI * (1 - sun * 0.55);
  const R = 110;
  const sx = 130 + R * Math.cos(ang);
  const sy = 130 - R * Math.sin(ang);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: show}}>
      <svg width={260} height={150} style={{overflow: 'visible', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'}}>
        <line x1={0} y1={130} x2={260} y2={130} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
        <path d={`M 20 130 A ${R} ${R} 0 0 1 240 130`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={2} strokeDasharray="4 8" pathLength={1} style={{clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`}} />
        <circle cx={sx} cy={sy} r={14} fill={COLORS.beige} opacity={draw} />
        <circle cx={sx} cy={sy} r={24 + Math.sin(frame / 6) * 2} fill="none" stroke={COLORS.beige} strokeWidth={1.5} opacity={draw * 0.5} />
      </svg>
      <div style={{...mono, marginTop: 10}}>УТРО · ОТДЕЛЕНИЕ</div>
    </div>
  );
};

// ── 2. Эмоции: плашки появляются с дрожью ────────────────────────────────────
export const JitterPills: React.FC<{items: {text: string; at: number}[]; until: number; x: number; y: number}> = ({items, until, x, y}) => {
  const {frame, fps} = useT();
  const show = useInOut(items[0].at - 0.1, until);
  return (
    <div style={{position: 'absolute', right: 1080 - x, top: y, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, opacity: show}}>
      {items.map((it, i) => {
        const v = ramp(frame, fps, it.at, it.at + 0.25);
        const jit = interpolate(frame, [it.at * fps, (it.at + 0.5) * fps], [1, 0], clamp);
        const dx = (random(`j${i}${frame}`) - 0.5) * 10 * jit;
        const dy = (random(`k${i}${frame}`) - 0.5) * 6 * jit;
        return (
          <div key={i} style={{...glass, borderRadius: 999, padding: '12px 26px', opacity: v, translate: `${dx}px ${dy}px`, scale: String(0.85 + v * 0.15), borderColor: 'rgba(255,170,160,0.55)'}}>
            <span style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: COLORS.white}}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── 3. Чат: «печатает…», потом сообщение ─────────────────────────────────────
export const ChatBubble: React.FC<{at: number; textAt: number; until: number; x: number; y: number; who: string; text: string}> = ({at, textAt, until, x, y, who, text}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const pop = ramp(frame, fps, at, at + 0.3);
  const typed = frame >= textAt * fps;
  const grow = ramp(frame, fps, textAt, textAt + 0.35);
  return (
    <div style={{position: 'absolute', right: 1080 - x, top: y, opacity: show, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
      <div style={{...mono, fontSize: 18}}>{who}</div>
      <div
        style={{
          ...glass,
          borderRadius: 30,
          borderBottomRightRadius: 8,
          padding: typed ? '16px 24px' : '18px 22px',
          maxWidth: 270,
          scale: String(0.6 + pop * 0.4),
          transformOrigin: '100% 100%',
        }}
      >
        {typed ? (
          <span style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 27, lineHeight: 1.25, color: COLORS.white, opacity: grow, display: 'block'}}>{text}</span>
        ) : (
          <div style={{display: 'flex', gap: 8}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.white, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(frame / 4 - i * 0.9))}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── 4. Кардиограмма страха: пульс бежит и учащается ────────────────────────────
export const Heartbeat: React.FC<{at: number; until: number; top: number}> = ({at, until, top}) => {
  const {frame, fps, t} = useT();
  const show = useInOut(at, until);
  const W = 760;
  const speed = interpolate(t, [at, until], [1, 2.2], clamp);
  const phase = (t - at) * 260 * speed;
  // ломаная кардиограммы: повторяющийся «удар»
  const beat = 150 / speed;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 4) {
    const u = (((x + phase) % beat) + beat) % beat;
    let y = 0;
    if (u > beat * 0.4 && u < beat * 0.46) y = -10;
    else if (u >= beat * 0.46 && u < beat * 0.5) y = 46;
    else if (u >= beat * 0.5 && u < beat * 0.56) y = -64;
    else if (u >= beat * 0.56 && u < beat * 0.6) y = 18;
    pts.push(`${x},${50 + y * 0.8}`);
  }
  const reveal = ramp(frame, fps, at, at + 0.6, EASE.inOut);
  const label = ramp(frame, fps, at + 0.6, at + 1.0);
  return (
    <div style={{position: 'absolute', top, left: SAFE.left, width: W, opacity: show}}>
      <svg width={W} height={110} style={{overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(255,120,110,0.6))', maskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)'}}>
        <polyline points={pts.join(' ')} fill="none" stroke="#FFD9D2" strokeWidth={3.5} strokeLinejoin="round" style={{clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}} />
      </svg>
      <div style={{textAlign: 'center', marginTop: 6, fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, textTransform: 'uppercase', ...metal, opacity: label}}>страх</div>
    </div>
  );
};

// Круглая стеклянная шкала (кольцо, число в центре, подпись под кругом)
const Ring: React.FC<{p: number; center: React.ReactNode; label: string; size?: number}> = ({p, center, label, size = 190}) => {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
      <div style={{...glass, width: size, height: size, borderRadius: '50%', position: 'relative'}}>
        <svg width={size} height={size} style={{position: 'absolute', inset: 0, rotate: '-90deg'}}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={7} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.beige} strokeWidth={7} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{center}</div>
      </div>
      <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 28, color: COLORS.white, textShadow: shadow}}>{label}</div>
    </div>
  );
};

// ── 5. Обратный отсчёт: 30:00 и кольцо, которое тает ───────────────────────────
export const Countdown: React.FC<{at: number; until: number; x: number; y: number}> = ({at, until, x, y}) => {
  const {fps, frame} = useT();
  const show = useInOut(at, until);
  const v = ramp(frame, fps, at, at + 0.4);
  // секунды бегут быстро: за время показа «проходит» 2 минуты
  const left = Math.max(0, 30 * 60 - Math.max(0, frame - at * fps) * 4);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(Math.floor(left % 60)).padStart(2, '0');
  const p = interpolate(frame, [at * fps, until * fps], [1, 0.82], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: show, scale: String(0.9 + v * 0.1)}}>
      <Ring p={p} center={<span style={{fontFamily: FONTS.mono, fontSize: 44, color: COLORS.white}}>{`${mm}:${ss}`}</span>} label="до операции" />
    </div>
  );
};

// ── 6. Цитата на печатной машинке с мигающей кареткой ──────────────────────────
export const TypedQuote: React.FC<{at: number; until: number; text: string; top: number; cps?: number}> = ({at, until, text, top, cps = 20}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until, 0.15, 0.4);
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - at * fps) / fps) * cps)));
  const caret = Math.floor(frame / 8) % 2 === 0 || n < text.length;
  return (
    <div style={{...titleBox, top, textAlign: 'center', opacity: show}}>
      <div style={{...mono, marginBottom: 14}}>ПАЦИЕНТКА</div>
      <span style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 54, lineHeight: 1.2, color: COLORS.white, textShadow: shadow}}>
        <span style={{color: COLORS.beige}}>«</span>
        {text.slice(0, n)}
        {n >= text.length ? <span style={{color: COLORS.beige}}>»</span> : null}
        <span style={{display: 'inline-block', width: 4, height: 50, marginLeft: 4, translate: '0px 6px', backgroundColor: COLORS.beige, opacity: caret ? 1 : 0}} />
      </span>
    </div>
  );
};

// ── 7. Плашки, которые зачёркиваются одной линией ─────────────────────────────
export const StruckPills: React.FC<{items: {text: string; at: number}[]; strikeAt: number; until: number; x: number; y: number}> = ({items, strikeAt, until, x, y}) => {
  const {frame, fps} = useT();
  const show = useInOut(items[0].at - 0.1, until);
  const strike = ramp(frame, fps, strikeAt, strikeAt + 0.35, EASE.inOut);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: show, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start'}}>
      <div style={{...mono}}>Я НЕ ПСИХОЛОГ</div>
      {items.map((it, i) => {
        const v = ramp(frame, fps, it.at, it.at + 0.3);
        const s = Math.max(0, Math.min(1, strike * 1.6 - i * 0.6));
        return (
          <div key={i} style={{...glass, position: 'relative', borderRadius: 999, padding: '12px 26px', opacity: v * (1 - s * 0.35), translate: `${(1 - v) * -30}px 0px`}}>
            <span style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: COLORS.white}}>{it.text}</span>
            <div style={{position: 'absolute', left: 16, top: '52%', height: 3, borderRadius: 2, width: `calc(${s} * (100% - 32px))`, backgroundColor: '#FFB4A8', rotate: '-4deg'}} />
          </div>
        );
      })}
    </div>
  );
};

// ── 8. Заголовок-«дешифровка»: буквы перебираются и встают на место ────────────
const GLYPHS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789';
export const DecodeTitle: React.FC<{at: number; until: number; lines: string[]; top: number; size?: number}> = ({at, until, lines, top, size = 64}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until, 0.15, 0.4);
  const total = lines.join('').length;
  let k = 0;
  return (
    <div style={{...titleBox, top, textAlign: 'center', opacity: show}}>
      {lines.map((line, li) => (
        <div key={li} style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: size, lineHeight: 1.08, textTransform: 'uppercase', ...metal}}>
          {line.split('').map((ch, ci) => {
            const idx = k++;
            const settle = (at + 0.1 + (idx / total) * 0.7) * fps;
            if (ch === ' ' || frame >= settle) {
              return <span key={ci}>{ch}</span>;
            }
            if (frame < at * fps + idx * 0.6) {
              return <span key={ci} style={{opacity: 0}}>{ch}</span>;
            }
            const g = GLYPHS[Math.floor(random(`g${idx}-${Math.floor(frame / 2)}`) * GLYPHS.length)];
            return <span key={ci} style={{opacity: 0.7}}>{g}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

// ── 9. Шкала волнения: бегунок уходит в красную зону, потом развилка ──────────
export const WorryGauge: React.FC<{at: number; edgeAt: number; forkA: number; forkB: number; until: number; top: number}> = ({at, edgeAt, forkA, forkB, until, top}) => {
  const {frame, fps, t} = useT();
  const show = useInOut(at, until);
  const bar = ramp(frame, fps, at, at + 0.5, EASE.inOut);
  const pos = interpolate(frame, [at * fps, (at + 0.6) * fps, edgeAt * fps, (edgeAt + 0.6) * fps], [0.08, 0.45, 0.45, 0.95], {...clamp, easing: EASE.inOut});
  const alarm = frame > edgeAt * fps ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
  const W = 600;
  const a = ramp(frame, fps, forkA, forkA + 0.35);
  const b = ramp(frame, fps, forkB, forkB + 0.35);
  const pill = (text: string, v: number) => (
    <div style={{...glass, borderRadius: 999, padding: '12px 26px', opacity: v, scale: String(0.8 + v * 0.2)}}>
      <span style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: COLORS.white}}>{text}</span>
    </div>
  );
  return (
    <div style={{position: 'absolute', top, left: SAFE.left + (SAFE.lowRight - SAFE.left - W) / 2, width: W, opacity: show}}>
      <div style={{display: 'flex', justifyContent: 'space-between', ...mono, marginBottom: 12}}>
        <span>СПОКОЙНО</span>
        <span style={{color: alarm ? `rgba(255,190,180,${0.6 + alarm * 0.4})` : undefined}}>НА ГРАНИ</span>
      </div>
      <div style={{position: 'relative', height: 14, borderRadius: 7, overflow: 'visible'}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 7, background: 'linear-gradient(90deg, rgba(255,255,255,0.35), #F3C7A6 60%, #FF7A6B)', clipPath: `inset(0 ${(1 - bar) * 100}% 0 0 round 7px)`, boxShadow: `0 0 ${alarm * 18}px rgba(255,120,107,0.8)`}} />
        <div style={{position: 'absolute', left: `calc(${pos * 100}% - 15px)`, top: -8, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white, boxShadow: '0 2px 10px rgba(0,0,0,0.4)', opacity: bar}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 22, marginTop: 34}}>
        {pill('отложить', a)}
        {pill('перенести', b)}
      </div>
    </div>
  );
};

// ── 10. Кольцо готовности 0 → 100% ───────────────────────────────────────────
export const ReadyRing: React.FC<{at: number; fullAt: number; until: number; x: number; y: number}> = ({at, fullAt, until, x, y}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const p = interpolate(frame, [at * fps, fullAt * fps], [0, 1], {...clamp, easing: EASE.inOut});
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: show}}>
      <Ring p={p} center={<span style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 50, ...metal}}>{`${Math.round(p * 100)}%`}</span>} label="готовность" />
    </div>
  );
};

// ── 11. Табло-перевёртыш: «операция» → «отменена» ─────────────────────────────
export const FlipBoard: React.FC<{at: number; flipAt: number; until: number; x: number; y: number; from: string; to: string}> = ({at, flipAt, until, x, y, from, to}) => {
  const {frame, fps} = useT();
  const show = useInOut(at, until);
  const n = Math.max(from.length, to.length);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: show}}>
      <div style={{...mono, marginBottom: 12}}>РАСПИСАНИЕ</div>
      <div style={{display: 'flex', gap: 3}}>
        {Array.from({length: n}, (_, i) => {
          const s = (flipAt + i * 0.05) * fps;
          const p = interpolate(frame, [s, s + 6], [0, 1], clamp);
          const ch = (p < 0.5 ? from[i] : to[i]) ?? ' ';
          const fold = p < 0.5 ? 1 - p * 2 : (p - 0.5) * 2;
          return (
            <div key={i} style={{width: 29, height: 46, borderRadius: 5, backgroundColor: 'rgba(10,10,14,0.72)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
              <span style={{fontFamily: FONTS.mono, fontSize: 27, color: p >= 0.5 && to !== from ? '#FFC2B8' : COLORS.white, scale: `1 ${Math.max(0.05, fold)}`}}>{ch.toUpperCase()}</span>
              <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: 'rgba(0,0,0,0.6)'}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── 12. Штамп «НЕТ» поверх списка чувств хирурга ─────────────────────────────
export const NoStamp: React.FC<{items: {text: string; at: number}[]; stampAt: number; until: number; x: number; y: number}> = ({items, stampAt, until, x, y}) => {
  const {frame, fps} = useT();
  const show = useInOut(items[0].at - 0.1, until);
  const st = ramp(frame, fps, stampAt, stampAt + 0.18, EASE.in);
  const fadeItems = ramp(frame, fps, stampAt, stampAt + 0.4);
  return (
    <div style={{position: 'absolute', right: 1080 - x, top: y, opacity: show, width: 270, height: 260}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10}}>
        <div style={{...mono}}>ХИРУРГ…</div>
        {items.map((it, i) => {
          const v = ramp(frame, fps, it.at, it.at + 0.3);
          return (
            <div key={i} style={{fontFamily: FONTS.body, fontWeight: 400, fontSize: 30, color: COLORS.white, textShadow: shadow, opacity: v * (1 - fadeItems * 0.6), translate: `${(1 - v) * 20}px 0px`}}>
              {it.text}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 70,
          padding: '4px 22px',
          border: `5px solid ${COLORS.beige}`,
          borderRadius: 14,
          fontFamily: FONTS.heading,
          fontWeight: 900,
          fontSize: 64,
          letterSpacing: '0.08em',
          color: COLORS.beige,
          rotate: '-12deg',
          opacity: st,
          scale: String(1.8 - st * 0.8),
          textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        }}
      >
        НЕТ
      </div>
    </div>
  );
};

// ── 13. Финал: луч от лампы в кадре опускается на заголовок ───────────────────
export const LampBeam: React.FC<{at: number; titleAt: number; until: number; lamp: [number, number]; top: number; lines: string[]}> = ({at, titleAt, until, lamp, top, lines}) => {
  const {frame, fps} = useT();
  const show = 1 - ramp(frame, fps, until - 0.5, until, EASE.inOut);
  const beam = ramp(frame, fps, at, at + 1.2, EASE.inOut);
  const title = ramp(frame, fps, titleAt, titleAt + 0.6);
  const [lx, ly] = lamp;
  const bottom = ly + (top - 40 - ly) * beam;
  const spread = 120 + 300 * beam;
  return (
    <AbsoluteFill style={{opacity: show}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,236,210,0.55)" />
            <stop offset="1" stopColor="rgba(255,236,210,0)" />
          </linearGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <polygon points={`${lx - 60},${ly} ${lx + 60},${ly} ${483 + spread},${bottom} ${483 - spread},${bottom}`} fill="url(#beam)" filter="url(#soft)" opacity={0.5 * beam} />
      </svg>
      <div style={{...titleBox, top, textAlign: 'center', opacity: title, filter: `blur(${(1 - title) * 8}px)`}}>
        {lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 70, lineHeight: 1.06, textTransform: 'uppercase', ...metal, filter: 'drop-shadow(0 3px 14px rgba(0,0,0,0.85))'}}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
