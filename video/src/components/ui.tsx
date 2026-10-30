import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT, SPRING} from '../design/tokens';

// Небольшой UI-набор в духе референса: всё мелкое и аккуратное.
// Все времена — секунды от начала своего <Sequence>.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Белая панель с медленно дрейфующей точечной сеткой
export const DotGrid: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.white,
        backgroundImage: `radial-gradient(circle, rgba(154, 164, 188, 0.5) 1.6px, transparent 1.8px)`,
        backgroundSize: `${LAYOUT.gridStep}px ${LAYOUT.gridStep}px`,
        backgroundPosition: `${(frame / 15) % LAYOUT.gridStep}px 0px`,
        ...style,
      }}
    />
  );
};

// Spring-появление начиная с секунды at
export const usePop = (at: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - Math.round(at * fps), fps, config: SPRING.pop});
};

// Появление снизу из размытия; если задан until — уход в размытие
export const Reveal: React.FC<{
  at: number;
  until?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, until, style, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(at * fps);
  const end = until === undefined ? Infinity : Math.round(until * fps);
  const inn = interpolate(frame, [start, start + 9], [0, 1], {...clamp, easing: EASE.out});
  const out = Number.isFinite(end) ? interpolate(frame, [end - 7, end], [1, 0], {...clamp, easing: EASE.in}) : 1;
  const v = Math.min(inn, out);
  if (v <= 0) {
    return null;
  }
  return (
    <div style={{opacity: v, translate: `0px ${(1 - inn) * 16}px`, filter: `blur(${(1 - v) * 8}px)`, ...style}}>
      {children}
    </div>
  );
};

// Элемент, который выскакивает по spring (масштаб + прозрачность + сдвиг)
export const Pop: React.FC<{at: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  at,
  style,
  children,
}) => {
  const p = usePop(at);
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'}),
        scale: String(interpolate(p, [0, 1], [0.9, 1])),
        translate: `0px ${(1 - p) * 10}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Моноширинная метка раздела «01 · ПЕРВЫЕ ДНИ»
export const MonoLabel: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      fontFamily: FONTS.mono,
      fontWeight: 500,
      fontSize: 20,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: COLORS.navy,
      opacity: 0.75,
    }}
  >
    {children}
  </div>
);

// Плашка темы
export const Pill: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      padding: '8px 18px',
      borderRadius: LAYOUT.pillRadius,
      backgroundColor: COLORS.white,
      border: `1px solid ${COLORS.beigeLine}`,
      boxShadow: `0 4px 14px ${COLORS.shadow}`,
      fontFamily: FONTS.body,
      fontWeight: 500,
      fontSize: 24,
      color: COLORS.navy,
    }}
  >
    {children}
  </div>
);

// Иконка документа для шапки окна
export const DocIcon: React.FC = () => (
  <svg width={26} height={30} viewBox="0 0 26 30">
    <path d="M3 1 H17 L25 9 V29 H3 Z" fill="none" stroke={COLORS.navy40} strokeWidth={2} strokeLinejoin="round" />
    <path
      d="M17 1 V9 H25 M8 15 H20 M8 20 H20 M8 25 H16"
      fill="none"
      stroke={COLORS.navy40}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

// Окно-карточка: шапка с иконкой и названием, разделитель, содержимое
export const Window: React.FC<{
  title: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({title, icon = <DocIcon />, style, children}) => (
  <div
    style={{
      width: 820,
      backgroundColor: COLORS.white,
      borderRadius: 24,
      border: `1px solid ${COLORS.beigeLine}`,
      boxShadow: `0 10px 30px ${COLORS.shadow}`,
      overflow: 'hidden',
      ...style,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '20px 26px',
        borderBottom: `1px solid ${COLORS.beigeDark}`,
      }}
    >
      {icon}
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 26, color: COLORS.navy}}>{title}</div>
    </div>
    <div style={{padding: '26px 30px 30px'}}>{children}</div>
  </div>
);

// Заголовок блока внутри окна «## Голова»
export const Heading: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: FONTS.body, fontWeight: 700, fontSize: 32, color: COLORS.navy}}>
    <span style={{color: COLORS.navy40, marginRight: 10}}>##</span>
    {children}
  </div>
);

// Серая скелетон-строка, вытягивается слева направо
export const Skeleton: React.FC<{at: number; width: number | string; style?: React.CSSProperties}> = ({
  at,
  width,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  return (
    <div
      style={{
        width,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.beigeDark,
        transformOrigin: 'left center',
        scale: `${interpolate(frame, [s, s + 10], [0, 1], {...clamp, easing: EASE.out})} 1`,
        ...style,
      }}
    />
  );
};

// Блок «заголовок + две скелетон-строки», выскакивает в момент at
export const Block: React.FC<{at: number; title: string; style?: React.CSSProperties}> = ({at, title, style}) => (
  <Pop at={at} style={style}>
    <Heading>{title}</Heading>
    <Skeleton at={at + 0.1} width="88%" style={{marginTop: 16}} />
    <Skeleton at={at + 0.18} width="62%" style={{marginTop: 10}} />
  </Pop>
);

// Текст, который печатается по буквам с мигающим курсором
export const Typewriter: React.FC<{at: number; text: string; cps?: number; style?: React.CSSProperties}> = ({
  at,
  text,
  cps = 22,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const elapsed = frame / fps - at;
  const chars = Math.max(0, Math.min(text.length, Math.floor(elapsed * cps)));
  const cursorOn = Math.floor(frame / 15) % 2 === 0 || chars < text.length;
  return (
    <span style={style}>
      {text.slice(0, chars)}
      <span
        style={{
          display: 'inline-block',
          width: 3,
          height: '1em',
          marginLeft: 3,
          verticalAlign: '-0.12em',
          backgroundColor: COLORS.navy,
          opacity: elapsed > 0 && cursorOn ? 1 : 0,
        }}
      />
    </span>
  );
};

// Галочка в круге
export const Check: React.FC<{at: number; size?: number}> = ({at, size = 34}) => {
  const p = usePop(at);
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" style={{scale: String(p), flexShrink: 0}}>
      <circle cx="17" cy="17" r="17" fill={COLORS.navy} />
      <path
        d="M10 17.5 L15 22.5 L24.5 12"
        stroke={COLORS.white}
        strokeWidth={3.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Крестик в круге (нельзя)
export const Cross: React.FC<{at: number; size?: number}> = ({at, size = 34}) => {
  const p = usePop(at);
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" style={{scale: String(p), flexShrink: 0}}>
      <circle cx="17" cy="17" r="15.5" fill="none" stroke={COLORS.navy} strokeWidth={2.4} />
      <path d="M12 12 L22 22 M22 12 L12 22" stroke={COLORS.navy} strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  );
};
