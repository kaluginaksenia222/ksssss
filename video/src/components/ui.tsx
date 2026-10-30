import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT, SPRING, TYPE} from '../design/tokens';

// Бежевая панель с медленно дрейфующей точечной сеткой
export const DotGrid: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.beige,
        backgroundImage: `radial-gradient(circle, rgba(154, 164, 188, 0.45) 1.6px, transparent 1.8px)`,
        backgroundSize: `${LAYOUT.gridStep}px ${LAYOUT.gridStep}px`,
        backgroundPosition: `${(frame / 15) % LAYOUT.gridStep}px 0px`,
        ...style,
      }}
    />
  );
};

// Четырёхлучевая звезда — фирменный мотив
export const Sparkle: React.FC<{size: number; color: string; style?: React.CSSProperties}> = ({
  size,
  color,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M50 0 C53 38 62 47 100 50 C62 53 53 62 50 100 C47 62 38 53 0 50 C38 47 47 38 50 0 Z" fill={color} />
  </svg>
);

// Плашка темы сверху кадра
export const TopicPill: React.FC<{onVideo?: boolean}> = ({onVideo}) => (
  <div
    style={{
      padding: '10px 22px',
      borderRadius: LAYOUT.pillRadius,
      backgroundColor: onVideo ? 'rgba(8, 32, 82, 0.6)' : COLORS.beigeDark,
      color: onVideo ? COLORS.beige : COLORS.navy,
      fontFamily: FONTS.body,
      fontWeight: 500,
      fontSize: TYPE.pill,
    }}
  >
    после блефаропластики
  </div>
);

// Метка раздела «01 · ПЕРВЫЕ ДНИ»
export const SectionLabel: React.FC<{num: string; text: string}> = ({num, text}) => (
  <div
    style={{
      fontFamily: FONTS.body,
      fontWeight: 500,
      fontSize: TYPE.label,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: COLORS.navy40,
    }}
  >
    {num} · {text}
  </div>
);

// Появление по spring «pop» начиная с секунды at (в локальном времени сцены)
export const usePop = (at: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - Math.round(at * fps), fps, config: SPRING.pop});
};

// Заголовок сцены (Coolvetica): выезжает снизу, проявляется из размытия
export const SceneTitle: React.FC<{at: number; size?: number; children: React.ReactNode}> = ({
  at,
  size = TYPE.title,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(at * fps);
  return (
    <div
      style={{
        fontFamily: FONTS.heading,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        color: COLORS.navy,
        opacity: interpolate(frame, [start, start + 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.out,
        }),
        translate: interpolate(frame, [start, start + 10], ['0px 28px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.out,
        }),
        filter: `blur(${interpolate(frame, [start, start + 8], [10, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}px)`,
      }}
    >
      {children}
    </div>
  );
};

// UI-карточка: белая, со скруглением, тенью и pop-in
export const Card: React.FC<{
  at: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, style, children}) => {
  const p = usePop(at);
  return (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: LAYOUT.cardRadius,
        border: `1px solid ${COLORS.beigeLine}`,
        boxShadow: `0 8px 24px ${COLORS.shadow}`,
        opacity: interpolate(p, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
        scale: interpolate(p, [0, 1], [0.85, 1]),
        translate: interpolate(p, [0, 1], ['0px 12px', '0px 0px']),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Карточка «иконка + текст»
export const IconCard: React.FC<{
  at: number;
  icon: React.ReactNode;
  title: string;
  sub?: string;
  style?: React.CSSProperties;
}> = ({at, icon, title, sub, style}) => (
  <Card
    at={at}
    style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', ...style}}
  >
    <div style={{flexShrink: 0, display: 'flex'}}>{icon}</div>
    <div>
      <div style={{fontFamily: FONTS.body, fontWeight: 700, fontSize: 34, color: COLORS.navy, lineHeight: 1.1}}>
        {title}
      </div>
      {sub ? (
        <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 26, color: COLORS.navy80, marginTop: 6}}>
          {sub}
        </div>
      ) : null}
    </div>
  </Card>
);

// Галочка в круге — выскакивает по spring
export const CheckBadge: React.FC<{at: number; size?: number}> = ({at, size = 56}) => {
  const p = usePop(at);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{scale: String(p), flexShrink: 0}}>
      <circle cx="32" cy="32" r="32" fill={COLORS.navy} />
      <path d="M19 33 L28 42 L46 23" stroke={COLORS.beige} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Линейные иконки 64×64 в цвете navy
const stroke = {
  stroke: COLORS.navy,
  strokeWidth: 5,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Icon: React.FC<{name: string; size?: number}> = ({name, size = 72}) => {
  const paths: Record<string, React.ReactNode> = {
    noBend: (
      <>
        <circle cx="32" cy="18" r="9" {...stroke} />
        <path d="M32 27 V50 M20 38 L32 50 L44 38" {...stroke} />
        <path d="M8 56 L56 8" {...stroke} />
      </>
    ),
    bed: (
      <>
        <path d="M6 46 V20 M6 38 H58 V52 M6 52 V46" {...stroke} />
        <rect x="12" y="26" width="14" height="10" rx="4" {...stroke} />
        <path d="M30 36 V28 H52 A6 6 0 0 1 58 34 V38" {...stroke} />
        <path d="M8 58 L56 6" {...stroke} />
      </>
    ),
    dumbbell: (
      <path d="M4 32 H60 M12 20 V44 M20 14 V50 M44 14 V50 M52 20 V44" {...stroke} />
    ),
    heart: (
      <>
        <path d="M32 54 C8 38 6 24 14 16 C21 9 29 12 32 19 C35 12 43 9 50 16 C58 24 56 38 32 54 Z" {...stroke} />
        <path d="M16 32 H25 L29 25 L34 39 L38 32 H48" {...stroke} />
      </>
    ),
    snowflake: (
      <path
        d="M32 4 V60 M8 18 L56 46 M56 18 L8 46 M25 8 L32 15 L39 8 M25 56 L32 49 L39 56"
        {...stroke}
      />
    ),
    eye: (
      <>
        <path d="M4 32 C14 16 50 16 60 32 C50 48 14 48 4 32 Z" {...stroke} />
        <circle cx="32" cy="32" r="8" {...stroke} />
        <path d="M14 14 L18 20 M32 8 V15 M50 14 L46 20" {...stroke} />
      </>
    ),
    patch: (
      <>
        <rect x="6" y="20" width="52" height="24" rx="12" {...stroke} />
        <rect x="22" y="24" width="20" height="16" rx="3" {...stroke} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {paths[name]}
    </svg>
  );
};
