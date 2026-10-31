import React from 'react';
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, SPRING} from '../design/tokens';

// Новые движения для ролика про подбор имплантов (стиль общий, анимация своя):
// расшифровка букв, жидкая заливка-переход, мерный стакан, плашка с именем, полоска прогресса.
// Время — секунды от начала своего <Sequence>.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const metal = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
};

const GLYPHS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789#%+';

// Заголовок-«расшифровка»: каждая буква перебирает случайные символы и встаёт на место
export const DecodeTitle: React.FC<{
  at: number;
  until: number;
  lines: string[];
  size: number;
  top: number;
}> = ({at, until, lines, size, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [until * fps - 7, until * fps], [1, 0], {...clamp, easing: EASE.in});
  if (frame < at * fps || out <= 0) {
    return null;
  }
  let n = 0;
  return (
    <div style={{position: 'absolute', top, left: 30, right: 30, textAlign: 'center', opacity: out, filter: `blur(${(1 - out) * 10}px)`}}>
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1.02,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            whiteSpace: 'pre',
            filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.5))',
          }}
        >
          {line.split('').map((ch, i) => {
            const idx = n++;
            // буква «застывает» в свой момент; до этого — случайные символы, меняются каждые 2 кадра
            const lockAt = Math.round(at * fps) + 4 + idx * 1.1;
            const locked = frame >= lockAt;
            const started = frame >= lockAt - 9;
            const glyph =
              ch === ' ' || locked
                ? ch
                : GLYPHS[Math.floor(random(`g${idx}-${Math.floor(frame / 2)}`) * GLYPHS.length)];
            return (
              <span
                key={i}
                style={{
                  ...(locked ? metal : {color: 'rgba(248,240,229,0.55)'}),
                  opacity: started ? 1 : 0,
                }}
              >
                {glyph}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Жидкая заливка: синяя «вода» с волнистым краем поднимается снизу, потом стекает обратно
export const LiquidReveal: React.FC<{until: number; children: React.ReactNode}> = ({until, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const rise = interpolate(frame, [0, 14], [0, 1], {...clamp, easing: EASE.inOut});
  const fall = interpolate(frame, [end - 14, end], [0, 1], {...clamp, easing: EASE.inOut});
  const level = rise * (1 - fall); // 0 — пусто, 1 — экран залит
  const surface = 1920 * (1 - level * 1.1) + 60; // уровень воды с запасом на волну
  const wave = (x: number) => Math.sin(x / 140 + frame / 5) * 28 + Math.sin(x / 61 - frame / 3) * 12;
  let d = `M0 1920 L0 ${surface + wave(0)}`;
  for (let x = 0; x <= 1080; x += 30) {
    d += ` L${x} ${(surface + wave(x)).toFixed(1)}`;
  }
  d += ' L1080 1920 Z';
  const content = Math.min(interpolate(frame, [12, 20], [0, 1], clamp), interpolate(frame, [end - 16, end - 10], [1, 0], clamp));
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <path d={d} fill={COLORS.navy} />
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: content}}>{children}</div>
    </>
  );
};

// Мерный стакан: стекло со шкалой, бежевая жидкость с волнистой поверхностью и пузырьками
const Beaker: React.FC<{fill: number; label: string; x: number; top: number; scale?: number}> = ({fill, label, x, top, scale = 1}) => {
  const frame = useCurrentFrame();
  const w = 220;
  const h = 360;
  const level = h - 20 - fill * (h - 70);
  let surf = `M14 ${level}`;
  for (let i = 0; i <= w - 28; i += 8) {
    surf += ` L${14 + i} ${(level + Math.sin(i / 18 + frame / 4) * 5).toFixed(1)}`;
  }
  surf += ` L${w - 14} ${h - 14} L14 ${h - 14} Z`;
  const bubbles = [0, 1, 2, 3, 4].map((b) => {
    const cycle = ((frame + b * 11) % 45) / 45;
    return {cx: 40 + b * 36, cy: h - 20 - cycle * (h - 20 - level), o: fill > 0.05 ? (1 - cycle) * 0.7 : 0};
  });
  return (
    <div style={{position: 'absolute', left: x - (w * scale) / 2, top, width: w * scale, scale: String(scale), transformOrigin: 'top left'}}>
      <svg width={w} height={h + 70} viewBox={`0 0 ${w} ${h + 70}`}>
        <path d={surf} fill={COLORS.beige} opacity={0.92} />
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={4} fill={COLORS.white} opacity={b.o} />
        ))}
        <path d={`M8 6 L8 ${h - 10} Q8 ${h} 18 ${h} L${w - 18} ${h} Q${w - 8} ${h} ${w - 8} ${h - 10} L${w - 8} 6`} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((m) => (
          <path key={m} d={`M${w - 8} ${h - 20 - m * ((h - 70) / 5)} l-${m % 2 === 0 ? 34 : 20} 0`} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
        ))}
        <text x={w / 2} y={h + 52} textAnchor="middle" fontFamily="InterCyr, InterLat, sans-serif" fontWeight={500} fontSize={30} fill={COLORS.white}>
          {label}
        </text>
      </svg>
    </div>
  );
};

// Сцена со стаканом: наполняется до 300 мл, затем раздваивается на два одинаковых стакана
export const BeakerSplit: React.FC<{fillAt: number; splitAt: number; top: number}> = ({fillAt, splitAt, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fill = interpolate(frame, [fillAt * fps, (fillAt + 0.9) * fps], [0, 0.75], {...clamp, easing: EASE.out});
  const sp = spring({frame: frame - Math.round(splitAt * fps), fps, config: SPRING.soft});
  const neq = spring({frame: frame - Math.round((splitAt + 0.5) * fps), fps, config: SPRING.pop});
  const ml = Math.round(interpolate(fill, [0, 0.75], [0, 300]));
  return (
    <>
      <Beaker fill={fill} label={sp > 0.5 ? 'девушка 2' : `${ml} мл`} x={540 + sp * 190} top={top} />
      {sp > 0.02 ? <Beaker fill={fill} label="девушка 1" x={540 - sp * 190} top={top} /> : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: top + 140,
          textAlign: 'center',
          fontFamily: FONTS.heading,
          fontWeight: 900,
          fontSize: 90,
          ...metal,
          scale: String(neq),
          opacity: neq,
        }}
      >
        ≠
      </div>
    </>
  );
};

// Плашка с именем: стекло выезжает слева, под именем прорисовывается линия
export const NamePlate: React.FC<{at: number; until: number; name: string; role: string; top: number}> = ({at, until, name, role, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: SPRING.soft});
  const out = interpolate(frame, [until * fps - 8, until * fps], [1, 0], {...clamp, easing: EASE.in});
  const line = interpolate(frame, [(at + 0.25) * fps, (at + 0.7) * fps], [0, 1], {...clamp, easing: EASE.out});
  if (frame < at * fps || out <= 0) {
    return null;
  }
  return (
    <div style={{position: 'absolute', left: 56, top, translate: `${(1 - p) * -520}px 0px`, opacity: Math.min(p * 2, out)}}>
      <div
        style={{
          padding: '18px 26px 20px',
          borderRadius: 26,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1.5px solid rgba(255, 255, 255, 0.28)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 44, textTransform: 'uppercase', letterSpacing: '-0.01em', ...metal}}>
          {name}
        </div>
        <div style={{height: 3, borderRadius: 2, backgroundColor: COLORS.beige, marginTop: 8, width: `${line * 100}%`}} />
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.85)', marginTop: 10, textTransform: 'uppercase'}}>
          {role}
        </div>
      </div>
    </div>
  );
};

// Тонкая полоска прогресса сверху: заполняется по ходу ролика — хочется досмотреть
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 36, left: 64, right: 64, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)'}}>
      <div style={{width: `${(frame / (durationInFrames - 1)) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: COLORS.beige}} />
    </div>
  );
};

// Факторы подбора: стеклянные строки с галочкой появляются по очереди
export const FactorList: React.FC<{at: number; until: number; top: number; rows: {text: string; at: number}[]}> = ({at, until, top, rows}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = Math.min(
    interpolate(frame, [at * fps, at * fps + 8], [0, 1], clamp),
    interpolate(frame, [until * fps - 8, until * fps], [1, 0], clamp),
  );
  if (v <= 0) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: v}}>
      {rows.map((r) => (
        <FactorRow key={r.text} {...r} />
      ))}
    </div>
  );
};

const FactorRow: React.FC<{text: string; at: number}> = ({text, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: SPRING.pop});
  const tick = interpolate(frame, [(at + 0.15) * fps, (at + 0.45) * fps], [1, 0], {...clamp, easing: EASE.out});
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 24px 12px 14px',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        border: '1.5px solid rgba(255, 255, 255, 0.28)',
        backdropFilter: 'blur(18px)',
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `${(1 - p) * 60}px 0px`,
      }}
    >
      <svg width={34} height={34} viewBox="0 0 34 34">
        <circle cx={17} cy={17} r={17} fill={COLORS.beige} />
        <path d="M10 17.5 L15 22.5 L24.5 12" stroke={COLORS.navy} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={tick} />
      </svg>
      <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.white}}>{text}</div>
    </div>
  );
};
