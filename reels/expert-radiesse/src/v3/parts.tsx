import React from 'react';
import {interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, SPRING} from '../design/tokens';

// Элементы версии 3 (тёмный «технологичный» стиль): металлические заголовки,
// стеклянные карточки, «живые» окна с видео врача, переход кольцом.
// Время — секунды от начала своего <Sequence>.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const usePop = (at: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - Math.round(at * fps), fps, config: SPRING.pop});
};

// Появление и уход в размытие (until — секунды от начала Sequence)
const useInOut = (at: number, until: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round(at * fps);
  const b = Math.round(until * fps);
  return Math.min(
    interpolate(frame, [a, a + 8], [0, 1], {...clamp, easing: EASE.out}),
    interpolate(frame, [b - 7, b], [1, 0], {...clamp, easing: EASE.in}),
  );
};

// Металлический заголовок: строки поднимаются из размытия, по буквам пробегает блик
export const MetalTitle: React.FC<{at: number; until: number; lines: string[]; size: number; top: number}> = ({
  at,
  until,
  lines,
  size,
  top,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = useInOut(at, until);
  const shine = interpolate(frame, [at * fps, (at + 1.2) * fps], [-60, 160], clamp);
  if (v <= 0) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center', opacity: v}}>
      {lines.map((line, i) => {
        const p = spring({frame: frame - Math.round((at + i * 0.08) * fps), fps, config: SPRING.soft});
        return (
          <div
            key={line}
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 0.98,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF ${shine}%, #C9CFDA ${shine + 18}%, ${COLORS.beige} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: `drop-shadow(0 4px 18px rgba(0,0,0,0.45)) blur(${(1 - p) * 8}px)`,
              translate: `0px ${(1 - p) * 40}px`,
              scale: String(interpolate(p, [0, 1], [1.08, 1])),
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

// Стеклянная карточка
export const Glass: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      border: '1.5px solid rgba(255, 255, 255, 0.28)',
      backdropFilter: 'blur(18px)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
      ...style,
    }}
  >
    {children}
  </div>
);

// Стеклянная карточка со строками, которые выскакивают по очереди (как сообщения)
export const ChatCard: React.FC<{at: number; until: number; rows: {text: string; at: number}[]; top: number}> = ({
  at,
  until,
  rows,
  top,
}) => {
  const v = useInOut(at, until);
  if (v <= 0) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top, left: 150, right: 150, opacity: v, filter: `blur(${(1 - v) * 8}px)`}}>
      <Glass style={{padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12}}>
        {rows.map((row) => (
          <ChatRow key={row.text} {...row} />
        ))}
      </Glass>
    </div>
  );
};

const ChatRow: React.FC<{text: string; at: number}> = ({text, at}) => {
  const p = usePop(at);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `${(1 - p) * -30}px 0px`,
      }}
    >
      <div style={{width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.beige, flexShrink: 0}} />
      <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.white}}>{text}</div>
      <div style={{flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)'}} />
    </div>
  );
};

// Где лицо врача в исходнике (1080×1920) — его ставим в центр «живого» окна
const FACE = {x: 712, y: 650};

// «Живое» окно: крупный план лица врача из того же видео, синхронно с речью
export const FaceWindow: React.FC<{
  at: number;
  until: number;
  style: React.CSSProperties;
  round?: boolean;
  zoom?: number;
  // Секунда исходника, с которой начинается родительский Sequence, — чтобы окно шло синхронно
  offset?: number;
}> = ({at, until, style, round, zoom = 2.2, offset = 0}) => {
  const {fps} = useVideoConfig();
  const p = usePop(at);
  const v = useInOut(at, until);
  if (v <= 0) {
    return null;
  }
  const w = Number(style.width);
  const h = Number(style.height);
  return (
    <div
      style={{
        position: 'absolute',
        overflow: 'hidden',
        borderRadius: round ? '50%' : 26,
        border: '3px solid rgba(255,255,255,0.7)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        scale: String(interpolate(p, [0, 1], [0.6, 1])),
        opacity: v,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1080 * zoom,
          height: 1920 * zoom,
          left: w / 2 - FACE.x * zoom,
          top: h / 2 - FACE.y * zoom,
        }}
      >
        <OffthreadVideo
          src={staticFile('source.mp4')}
          muted
          trimBefore={Math.round(offset * fps)}
          style={{width: '100%', height: '100%'}}
        />
      </div>
    </div>
  );
};

// Переключатель «мешает хирургу»: включается и в момент offAt выключается
export const ToggleCard: React.FC<{at: number; until: number; offAt: number; top: number}> = ({at, until, offAt, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = useInOut(at, until);
  const off = interpolate(frame, [offAt * fps, offAt * fps + 6], [0, 1], {...clamp, easing: EASE.inOut});
  if (v <= 0) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top, left: 160, right: 160, opacity: v, filter: `blur(${(1 - v) * 8}px)`}}>
      <Glass style={{padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.white}}>Мешает хирургу</div>
          <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: 6}}>
            {off > 0.5 ? 'не всегда' : 'по мнению пациентов'}
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            width: 96,
            height: 54,
            borderRadius: 27,
            backgroundColor: off > 0.5 ? 'rgba(255,255,255,0.22)' : COLORS.beige,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 5,
              left: 5 + (1 - off) * 42,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: off > 0.5 ? COLORS.white : COLORS.navy,
            }}
          />
        </div>
      </Glass>
    </div>
  );
};

// Маленькие стеклянные метки сверху кадра
export const TopTags: React.FC<{tags: string[]}> = ({tags}) => (
  <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12}}>
    {tags.map((tag) => (
      <Glass key={tag} style={{padding: '6px 14px', borderRadius: 999}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 18, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em'}}>
          {tag}
        </div>
      </Glass>
    ))}
  </div>
);

// Переход кольцом: тёмная сцена раскрывается кругом из центра и закрывается обратно
export const RingReveal: React.FC<{until: number; cx: number; cy: number; children: React.ReactNode}> = ({
  until,
  cx,
  cy,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const open = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: EASE.inOut});
  const close = interpolate(frame, [end - 10, end], [0, 1], {...clamp, easing: EASE.inOut});
  const r = 2300 * open * (1 - close);
  const ring = Math.max(
    interpolate(frame, [0, 4, 14], [0, 1, 0], clamp),
    interpolate(frame, [end - 10, end - 6, end], [0, 1, 0], clamp),
  );
  return (
    <>
      <div style={{position: 'absolute', inset: 0, clipPath: `circle(${r}px at ${cx}px ${cy}px)`}}>{children}</div>
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.85)',
          opacity: ring,
        }}
      />
    </>
  );
};

// Большой круг на синем фоне: прорисовывается, внутри медленно вращается пунктир
export const BigRing: React.FC<{cx: number; cy: number; size: number}> = ({cx, cy, size}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [4, 26], [1, 0], {...clamp, easing: EASE.out});
  const r = size / 2;
  return (
    <svg
      width={size + 20}
      height={size + 20}
      viewBox={`${-r - 10} ${-r - 10} ${size + 20} ${size + 20}`}
      style={{position: 'absolute', left: cx - r - 10, top: cy - r - 10}}
    >
      <circle
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth={2.5}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw}
        transform="rotate(-90)"
      />
      <circle
        r={r - 34}
        fill="none"
        stroke="rgba(248,240,229,0.22)"
        strokeWidth={2}
        strokeDasharray="4 14"
        transform={`rotate(${frame * 0.3})`}
        opacity={1 - draw}
      />
      <circle r={9} cx={0} cy={-r} fill={COLORS.beige} transform={`rotate(${frame * 0.8})`} opacity={1 - draw} />
    </svg>
  );
};

// Стеклянная карточка со шкалой: значение плавно едет от from к to между moveAt и moveUntil
export const MeterCard: React.FC<{
  at: number;
  until: number;
  top: number;
  title: string;
  note: string;
  from: number;
  to: number;
  moveAt: number;
  moveUntil: number;
}> = ({at, until, top, title, note, from, to, moveAt, moveUntil}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = useInOut(at, until);
  const value = interpolate(frame, [moveAt * fps, moveUntil * fps], [from, to], {...clamp, easing: EASE.inOut});
  if (v <= 0) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top, left: 140, right: 140, opacity: v, filter: `blur(${(1 - v) * 8}px)`}}>
      <Glass style={{padding: '22px 26px'}}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
          <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.white}}>{title}</div>
          <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, color: COLORS.beige}}>{Math.round(value)}%</div>
        </div>
        <div style={{height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 16, overflow: 'hidden'}}>
          <div style={{width: `${value}%`, height: '100%', borderRadius: 6, backgroundColor: COLORS.beige}} />
        </div>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: 12}}>
          {note}
        </div>
      </Glass>
    </div>
  );
};

// Стеклянные метки в ряд, выскакивают по очереди
export const ChipRow: React.FC<{at: number; until: number; top: number; chips: {text: string; at: number; strong?: boolean}[]}> = ({
  at,
  until,
  top,
  chips,
}) => {
  const v = useInOut(at, until);
  if (v <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 14,
        opacity: v,
        filter: `blur(${(1 - v) * 8}px)`,
      }}
    >
      {chips.map((chip) => (
        <Chip key={chip.text} {...chip} />
      ))}
    </div>
  );
};

const Chip: React.FC<{text: string; at: number; strong?: boolean}> = ({text, at, strong}) => {
  const p = usePop(at);
  return (
    <div style={{scale: String(p), opacity: interpolate(p, [0, 0.4], [0, 1], clamp)}}>
      <Glass
        style={{
          padding: '12px 22px',
          borderRadius: 999,
          backgroundColor: strong ? COLORS.beige : 'rgba(255, 255, 255, 0.12)',
        }}
      >
        <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 28, color: strong ? COLORS.navy : COLORS.white}}>
          {text}
        </div>
      </Glass>
    </div>
  );
};
