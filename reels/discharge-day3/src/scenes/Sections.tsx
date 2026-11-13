import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT, PANEL_HEIGHT} from '../design/tokens';
import {Block, Check, Cross, Heading, MonoLabel, Pill, Pop, Skeleton, Typewriter, Window} from '../components/ui';

// Все времена — секунды от начала своего <Sequence>.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ——— Хук на видео ———

const MaskLine: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  return (
    <div style={{overflow: 'hidden', paddingBottom: 4}}>
      <div
        style={{
          translate: interpolate(frame, [s, s + 12], ['0px 110%', '0px 0%'], {...clamp, easing: EASE.out}),
          filter: `blur(${interpolate(frame, [s, s + 10], [6, 0], clamp)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Hook: React.FC<{until: number}> = ({until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const out = interpolate(frame, [end - 8, end], [1, 0], {...clamp, easing: EASE.in});
  const title = {
    fontFamily: FONTS.heading,
    fontWeight: 900,
    fontSize: 48,
    lineHeight: 1.02,
    letterSpacing: '-0.01em',
    textTransform: 'uppercase' as const,
    color: COLORS.white,
    textShadow: '0 2px 16px rgba(0, 0, 0, 0.35)',
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out, filter: `blur(${(1 - out) * 8}px)`}}>
      <div
        style={{
          position: 'absolute',
          top: 930,
          left: LAYOUT.sidePadding,
          right: LAYOUT.sidePadding,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
        }}
      >
        <MaskLine at={0.5}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: '0.16em',
              color: COLORS.white,
              opacity: 0.85,
            }}
          >
            ПАМЯТКА ПАЦИЕНТУ
          </div>
        </MaskLine>
        <div>
          <MaskLine at={0.62}>
            <div style={title}>Рекомендации</div>
          </MaskLine>
          <MaskLine at={0.74}>
            <div style={title}>по восстановлению</div>
          </MaskLine>
          <MaskLine at={0.86}>
            <div style={title}>после подтяжки лица</div>
          </MaskLine>
        </div>
      </div>
    </div>
  );
};

// ——— Верх видео в начале: плашка темы, таймкод и полоска подпунктов ———

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');

export const IntroBar: React.FC<{segments: number[]; total: number; until: number}> = ({segments, total, until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const end = Math.round(until * fps);
  const inn = interpolate(frame, [0, 10], [0, 1], {...clamp, easing: EASE.out});
  const out = interpolate(frame, [end - 8, end], [1, 0], {...clamp, easing: EASE.in});
  const width = 780;
  const bounds = [...segments, total];
  return (
    <div
      style={{
        position: 'absolute',
        top: 345,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity: Math.min(inn, out),
        filter: `blur(${(1 - Math.min(inn, out)) * 6}px)`,
      }}
    >
      <div
        style={{
          padding: '8px 18px',
          borderRadius: 999,
          backgroundColor: 'rgba(8, 32, 82, 0.55)',
          color: COLORS.beige,
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 24,
        }}
      >
        после подтяжки лица
      </div>
      <div
        style={{
          padding: '4px 14px',
          borderRadius: 999,
          backgroundColor: 'rgba(8, 32, 82, 0.7)',
          color: COLORS.beige,
          fontFamily: FONTS.mono,
          fontWeight: 500,
          fontSize: 20,
        }}
      >
        00:{pad2(t / 60)}:{pad2(t % 60)}:{pad2(frame % fps)}
      </div>
      <div style={{position: 'relative', width, height: 16, display: 'flex', gap: 8}}>
        {bounds.slice(0, -1).map((start, i) => {
          const stop = bounds[i + 1];
          const active = t >= start && t < stop;
          return (
            <div
              key={start}
              style={{
                flexGrow: stop - start,
                flexBasis: 0,
                borderRadius: 5,
                backgroundColor: active ? COLORS.white : 'rgba(255, 255, 255, 0.35)',
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            top: -9,
            left: (t / total) * width,
            width: 3,
            height: 34,
            borderRadius: 2,
            backgroundColor: COLORS.white,
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.35)',
          }}
        />
      </div>
    </div>
  );
};

// ——— Обёртка вставки на панели: плашка темы, метка раздела, окно; вход и выход ———

const PanelScene: React.FC<{label: string; until: number; children: React.ReactNode}> = ({
  label,
  until,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(until * fps);
  const inn = interpolate(frame, [4, 14], [0, 1], {...clamp, easing: EASE.out});
  const out = interpolate(frame, [end - 8, end], [1, 0], {...clamp, easing: EASE.in});
  const v = Math.min(inn, out);
  return (
    <div style={{position: 'absolute', inset: 0, height: PANEL_HEIGHT}}>
      <div style={{position: 'absolute', top: 340, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Pill>после подтяжки лица</Pill>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 405,
          left: 0,
          right: 0,
          bottom: 150,
          justifyContent: 'center',
          opacity: v,
          filter: `blur(${(1 - v) * 8}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <MonoLabel>{label}</MonoLabel>
        <div style={{scale: String(interpolate(v, [0, 1], [0.96, 1])), translate: `0px ${(1 - inn) * 20}px`}}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ——— Общие мелочи для окон ———

const Tab: React.FC<{active: number; children: React.ReactNode}> = ({active, children}) => (
  <div
    style={{
      padding: '8px 20px',
      borderRadius: 999,
      fontFamily: FONTS.mono,
      fontWeight: 500,
      fontSize: 22,
      color: active > 0.5 ? COLORS.white : COLORS.navy,
      backgroundColor: `rgba(8, 32, 82, ${active})`,
      border: `1.5px solid ${COLORS.navy}`,
    }}
  >
    {children}
  </div>
);

// Строка-карточка: иконка, заголовок со скелетоном, справа отметка
const Row: React.FC<{at: number; icon?: React.ReactNode; title: string; mark?: React.ReactNode; skeleton?: boolean}> = ({
  at,
  icon,
  title,
  mark,
  skeleton = true,
}) => (
  <Pop
    at={at}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '12px 20px',
      borderRadius: 16,
      border: `1px solid ${COLORS.beigeDark}`,
      boxShadow: `0 4px 14px ${COLORS.shadow}`,
      backgroundColor: COLORS.card,
    }}
  >
    {icon ? <div style={{width: 64, display: 'flex', justifyContent: 'center'}}>{icon}</div> : null}
    <div style={{flex: 1}}>
      <Heading>{title}</Heading>
      {skeleton ? <Skeleton at={at + 0.12} width="70%" style={{marginTop: 10}} /> : null}
    </div>
    {mark}
  </Pop>
);

// Полоса срока: заполняется слева направо, справа подпись
const Term: React.FC<{at: number; label: string; title: string}> = ({at, label, title}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  return (
    <Pop at={at} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 22}}>
      <Heading>{title}</Heading>
      <div style={{flex: 1, height: 16, borderRadius: 8, backgroundColor: COLORS.beigeDark, overflow: 'hidden'}}>
        <div
          style={{
            height: '100%',
            backgroundColor: COLORS.navy,
            transformOrigin: 'left center',
            scale: `${interpolate(frame, [s, s + 36], [0, 1], {...clamp, easing: EASE.inOut})} 1`,
          }}
        />
      </div>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, color: COLORS.navy}}>{label}</div>
    </Pop>
  );
};

const st = {stroke: COLORS.navy, strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

// Гиря «5 кг»
const Weight: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 60 60">
    <path d="M22 18 A8 8 0 0 1 38 18" {...st} strokeWidth={4} />
    <path d="M14 22 H46 L52 52 H8 Z" fill={COLORS.navy} />
    <text x={30} y={45} textAnchor="middle" fontFamily="MonoLat, MonoCyr, monospace" fontSize={14} fill={COLORS.white} fontWeight={500}>
      5кг
    </text>
  </svg>
);

// Луна — сон
const Moon: React.FC = () => (
  <svg width={52} height={52} viewBox="0 0 52 52">
    <path d="M36 8 A20 20 0 1 0 44 34 A16 16 0 1 1 36 8 Z" fill={COLORS.navy} />
  </svg>
);

// Руль
const Wheel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={56} height={56} viewBox="-30 -30 60 60" style={{rotate: `${Math.sin(frame / 10) * 12}deg`}}>
      <circle r={24} {...st} strokeWidth={4.5} />
      <circle r={6} fill={COLORS.navy} />
      <path d="M-24 2 H-6 M6 2 H24 M0 8 V24" {...st} strokeWidth={4.5} />
    </svg>
  );
};

// Глаз с «боковым» сектором обзора, который сужается
const SideEye: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = interpolate(frame, [at * fps, (at + 0.8) * fps], [1, 0.35], {...clamp, easing: EASE.inOut});
  const a = 70 * k;
  const r = 26;
  const rad = (d: number) => (d * Math.PI) / 180;
  return (
    <svg width={64} height={56} viewBox="-6 -28 64 56">
      <path d={`M0 0 L${r * Math.cos(rad(-a))} ${r * Math.sin(rad(-a))} A${r} ${r} 0 0 1 ${r * Math.cos(rad(a))} ${r * Math.sin(rad(a))} Z`} fill={COLORS.beigeDark} stroke={COLORS.navy} strokeWidth={2} />
      <circle cx={0} cy={0} r={6} fill={COLORS.navy} />
    </svg>
  );
};

// Пар — тепло
const Steam: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      {[10, 24, 38].map((x, i) => (
        <path
          key={x}
          d={`M${x} 42 C${x - 6} 34 ${x + 6} 26 ${x} 18 C${x - 5} 12 ${x + 4} 8 ${x} 4`}
          {...st}
          strokeWidth={3.5}
          transform={`translate(0 ${Math.sin(frame / 7 + i) * 2})`}
        />
      ))}
    </svg>
  );
};

// Баночка крема
const Jar: React.FC = () => (
  <svg width={56} height={52} viewBox="0 0 56 52">
    <rect x={6} y={6} width={44} height={12} rx={4} fill={COLORS.navy} />
    <rect x={10} y={20} width={36} height={28} rx={6} {...st} strokeWidth={4} />
    <path d="M18 34 H38" {...st} strokeWidth={3} />
  </svg>
);

// Мини-календарь на 7 дней: клетки закрашиваются по очереди
const Week: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: 10}}>
      {[1, 2, 3, 4, 5, 6, 7].map((d, i) => {
        const s = Math.round((at + i * 0.08) * fps);
        const v = interpolate(frame, [s, s + 5], [0, 1], clamp);
        return (
          <div
            key={d}
            style={{
              width: 62,
              height: 62,
              borderRadius: 14,
              border: `1.5px solid ${v > 0.5 ? COLORS.navy : COLORS.beigeLine}`,
              backgroundColor: `rgba(8, 32, 82, ${v})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.mono,
              fontWeight: 500,
              fontSize: 26,
              color: v > 0.5 ? COLORS.white : COLORS.navy,
              scale: String(1 + Math.sin(v * Math.PI) * 0.12),
            }}
          >
            {d}
          </div>
        );
      })}
    </div>
  );
};

// ——— 01 Нагрузки ——— (время — от начала сцены)
export const Load: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="01 / 08" until={until}>
    <Window title="Нагрузки">
      <Pop at={2.5} style={{display: 'flex', gap: 14, marginBottom: 22}}>
        <Tab active={1}>2 недели</Tab>
      </Pop>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 30, marginBottom: 22}}>
        <Block at={0.9} title="Физические" />
        <Block at={1.42} title="Эмоциональные" />
      </div>
      <Row at={4.1} icon={<Weight />} title="Больше 5 кг" skeleton={false} mark={<Cross at={5.5} size={40} />} />
    </Window>
  </PanelScene>
);

// ——— 02 Сон ———
export const Sleep: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="02 / 08" until={until}>
    <Window title="Сон" icon={<Moon />}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <Row at={0.1} title="На животе" mark={<Cross at={0.75} size={40} />} />
        <Row at={1.6} title="Только на спине" mark={<Check at={3.0} size={40} />} />
      </div>
    </Window>
  </PanelScene>
);

// ——— 03 За рулём ———
export const Drive: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="03 / 08" until={until}>
    <Window title="За руль — нельзя" icon={<Wheel />}>
      <Week at={1.3} />
      <Pop at={1.3} style={{marginTop: 10, fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, color: COLORS.navy}}>
        7 дней
      </Pop>
      <div style={{marginTop: 18}}>
        <Row at={5.0} icon={<SideEye at={5.3} />} title="Боковое зрение" mark={<Cross at={5.9} size={40} />} />
      </div>
    </Window>
  </PanelScene>
);

// ——— 04 Тепло ———
const Mini: React.FC<{at: number; title: string}> = ({at, title}) => (
  <Pop
    at={at}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 18px',
      borderRadius: 16,
      border: `1px solid ${COLORS.beigeDark}`,
      boxShadow: `0 4px 14px ${COLORS.shadow}`,
      backgroundColor: COLORS.card,
    }}
  >
    <div style={{fontFamily: FONTS.body, fontWeight: 700, fontSize: 28, color: COLORS.navy}}>{title}</div>
    <Cross at={at + 0.3} size={34} />
  </Pop>
);

export const Heat: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="04 / 08" until={until}>
    <Window title="Тепловые процедуры" icon={<Steam />}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        <Mini at={1.6} title="Баня" />
        <Mini at={2.25} title="Сауна" />
        <Mini at={2.75} title="Горячий душ" />
        <Mini at={3.35} title="Горячая ванна" />
      </div>
      <Term at={4.1} title="Нельзя" label="3 мес" />
    </Window>
  </PanelScene>
);

// ——— 05 Косметика ———
export const Cosmetics: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="05 / 08" until={until}>
    <Window title="Косметика" icon={<Jar />}>
      <Pop at={0.6} style={{display: 'flex', gap: 14, marginBottom: 20}}>
        <Tab active={1}>с 10-х суток</Tab>
      </Pop>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <Row at={1.5} title="Крем, тональный" mark={<Check at={2.0} size={40} />} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 20px',
            borderRadius: 16,
            backgroundColor: '#F6F7FA',
            border: `1px solid ${COLORS.beigeDark}`,
          }}
        >
          <div style={{flex: 1, fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.navy}}>
            <Typewriter at={4.2} text="Ретинол" />
          </div>
          <Cross at={5.0} size={40} />
        </div>
      </div>
    </Window>
  </PanelScene>
);

// ——— 06 Бандаж ———
const Alternate: React.FC<{at: number; a: string; b: string; secondAt: number}> = ({at, a, b, secondAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // после второй фразы чипы переключаются по очереди: носим ↔ снимаем
  const flip = t < secondAt ? 0 : Math.floor((t - secondAt) / 0.9) % 2 === 0 ? 1 : 0;
  return (
    <Pop at={at} style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, color: COLORS.navy, width: 90}}>ДЕНЬ</div>
      <Tab active={1 - flip}>{a}</Tab>
      <Pop at={secondAt}>
        <Tab active={flip}>{b}</Tab>
      </Pop>
    </Pop>
  );
};

export const Bandage: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="06 / 08" until={until}>
    <Window title="Бандаж">
      <Alternate at={0.7} secondAt={1.6} a="2 ч в бандаже" b="2 ч без" />
      <div style={{marginTop: 18}}>
        <Row at={3.1} icon={<Moon />} title="Ночью — в бандаже" skeleton={false} mark={<div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, color: COLORS.navy}}>1 мес</div>} />
      </div>
      <Pop at={5.4} style={{display: 'flex', gap: 14, alignItems: 'center', marginTop: 18}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, color: COLORS.navy, width: 90, whiteSpace: 'nowrap'}}>10+ ДН</div>
        <Tab active={1}>только ночью</Tab>
      </Pop>
    </Window>
  </PanelScene>
);

// ——— 07 Детралекс ———
const Pill2: React.FC = () => (
  <svg width={48} height={30} viewBox="0 0 100 60">
    <rect x={4} y={8} width={92} height={44} rx={22} fill="none" stroke={COLORS.navy} strokeWidth={8} />
    <path d="M50 8 V52" stroke={COLORS.navy} strokeWidth={8} />
    <path d="M10 30 A22 22 0 0 1 50 10 V52 A22 22 0 0 1 10 30 Z" fill={COLORS.navy} />
  </svg>
);

const Month: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 8}}>
      {Array.from({length: 30}, (_, i) => {
        const s = Math.round((at + i * 0.03) * fps);
        const v = interpolate(frame, [s, s + 4], [0, 1], clamp);
        return (
          <div key={i} style={{width: 30, height: 30, borderRadius: 15, border: `2px solid ${COLORS.navy}`, backgroundColor: `rgba(8, 32, 82, ${v})`, scale: String(1 + Math.sin(v * Math.PI) * 0.2)}} />
        );
      })}
    </div>
  );
};

export const Detralex: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="07 / 08" until={until}>
    <Window title="Детралекс" icon={<Pill2 />}>
      <Pop at={1.8} style={{display: 'flex', gap: 14, marginBottom: 22}}>
        <Tab active={1}>1 таблетка</Tab>
        <Pop at={2.3}>
          <Tab active={1}>1 раз в день</Tab>
        </Pop>
      </Pop>
      <Pop at={3.0}>
        <Month at={3.0} />
        <div style={{marginTop: 12, fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, color: COLORS.navy}}>30 дней</div>
      </Pop>
    </Window>
  </PanelScene>
);

// ——— 08 Обработка швов ———
// Схема: ухо, шов перед ухом и за ухом прорисовывается, скобки в волосах
const Ear: React.FC<{frontAt: number; backAt: number; staplesAt: number}> = ({frontAt, backAt, staplesAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const front = interpolate(frame, [frontAt * fps, (frontAt + 0.7) * fps], [1, 0], {...clamp, easing: EASE.inOut});
  const back = interpolate(frame, [backAt * fps, (backAt + 0.7) * fps], [1, 0], {...clamp, easing: EASE.inOut});
  return (
    <svg width={200} height={200} viewBox="0 0 200 200">
      {/* линия волос */}
      <path d="M40 40 C80 18 140 16 182 34" fill="none" stroke={COLORS.beigeLine} strokeWidth={5} strokeLinecap="round" />
      {/* щека и челюсть */}
      <path d="M30 70 C34 120 52 160 90 186" fill="none" stroke={COLORS.beigeLine} strokeWidth={5} strokeLinecap="round" />
      {/* ушная раковина */}
      <path d="M100 66 C112 46 150 46 156 76 C160 100 146 112 140 126 C134 140 138 156 122 160 C108 164 102 150 100 140" fill={COLORS.card} stroke={COLORS.navy} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M116 78 C126 66 142 72 140 90 C138 104 128 108 126 120" fill="none" stroke={COLORS.navy} strokeWidth={3.5} strokeLinecap="round" />
      {/* шов перед ухом: сверху вниз */}
      <path d="M90 52 C86 80 86 116 94 158" fill="none" stroke={COLORS.navy} strokeWidth={4.5} strokeDasharray="8 7" strokeLinecap="round" style={{clipPath: `inset(0 0 ${front * 100}% 0)`}} />
      {/* шов за ухом: снизу вверх, уходит в волосы */}
      <path d="M126 170 C160 166 172 130 170 92 C169 70 172 52 178 40" fill="none" stroke={COLORS.navy} strokeWidth={4.5} strokeDasharray="8 7" strokeLinecap="round" style={{clipPath: `inset(${back * 100}% 0 0 0)`}} />
      {/* скобочки в волосах */}
      {[0, 1, 2].map((i) => {
        const v = interpolate(frame, [(staplesAt + i * 0.12) * fps, (staplesAt + i * 0.12) * fps + 5], [0, 1], clamp);
        return <path key={i} d={`M${104 + i * 24} ${24 - i * 2} v-12 h14 v12`} fill="none" stroke={COLORS.navy} strokeWidth={4.5} strokeLinejoin="round" opacity={v} />;
      })}
    </svg>
  );
};

export const Sutures: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="08 / 08" until={until}>
    <Window title="Обработка швов">
      <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{padding: '14px 18px', borderRadius: 16, backgroundColor: '#F6F7FA', border: `1px solid ${COLORS.beigeDark}`, fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.navy}}>
            <Typewriter at={1.8} text="Хлоргексидин" />
          </div>
          <Pop at={3.4} style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <Tab active={0}>ватный диск</Tab>
          </Pop>
          <Row at={14.1} title="Наклейки — не снимать" skeleton={false} mark={<Cross at={15.1} size={36} />} />
        </div>
        <Pop at={4.5}>
          <Ear frontAt={7.4} backAt={8.5} staplesAt={11.2} />
        </Pop>
      </div>
    </Window>
  </PanelScene>
);

// ——— Финал: приём в понедельник ———
const CalIcon: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 30 30">
    <rect x={2} y={5} width={26} height={23} rx={5} fill="none" stroke={COLORS.navy40} strokeWidth={2.2} />
    <path d="M2 12 H28 M9 2 V8 M21 2 V8" stroke={COLORS.navy40} strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);

export const Visit: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="Приём" until={until}>
    <Window title="Приём в понедельник" icon={<CalIcon />}>
      <Pop at={0.2} style={{display: 'flex', gap: 14, marginBottom: 20}}>
        <Tab active={1}>понедельник</Tab>
      </Pop>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <Row at={3.6} title="Снимем часть швов" skeleton={false} mark={<Check at={3.9} size={38} />} />
        <Row at={4.4} title="Всё посмотрим" skeleton={false} mark={<Check at={4.7} size={38} />} />
      </div>
    </Window>
  </PanelScene>
);

// Главные появления (секунды от начала сцены) — под них тихий «поп»
export const POP_TIMES = {
  load: [5.5],
  sleep: [0.75, 3.0],
  drive: [1.3, 5.9],
  heat: [4.1],
  cosmetics: [2.0, 5.0],
  bandage: [1.6, 3.1],
  detralex: [2.3, 3.0],
  sutures: [3.4, 15.1],
  visit: [3.9, 4.7],
};

// Печать текста — для звука клавиш (сцена, время от её начала, длина)
export const TYPING = [
  {scene: 'cosmetics' as const, at: 4.2, chars: 'Ретинол'.length, cps: 22},
  {scene: 'sutures' as const, at: 1.8, chars: 'Хлоргексидин'.length, cps: 22},
];
