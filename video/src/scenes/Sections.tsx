import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT, PANEL_HEIGHT} from '../design/tokens';
import {Block, Check, Heading, MonoLabel, Pill, Pop, Skeleton, Typewriter, Window, usePop} from '../components/ui';

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
    fontSize: 54,
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
          top: 980,
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
            <div style={title}>Рекомендации после</div>
          </MaskLine>
          <MaskLine at={0.74}>
            <div style={title}>блефаропластики</div>
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
        top: 96,
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
        после блефаропластики
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
      <div style={{position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Pill>после блефаропластики</Pill>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 0,
          right: 0,
          bottom: 170,
          justifyContent: 'center',
          opacity: v,
          filter: `blur(${(1 - v) * 8}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
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

// ——— 01 Первые дни ———

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

export const FirstDays: React.FC<{until: number}> = ({until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sw = Math.round(6.87 * fps);
  const second = interpolate(frame, [sw, sw + 6], [0, 1], clamp);
  return (
    <PanelScene label="01 / 05" until={until}>
      <Window title="Первые дни">
        <Pop at={0.89} style={{display: 'flex', gap: 14, marginBottom: 30}}>
          <Tab active={1 - second}>2–3 дня</Tab>
          <Tab active={second}>2 недели</Tab>
        </Pop>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 40, rowGap: 34}}>
          <Block at={2.25} title="Голова" />
          <Block at={3.55} title="Сон" />
          <Block at={5.67} title="Спорт" />
          <Block at={7.97} title="Эмоции" />
        </div>
      </Window>
    </PanelScene>
  );
};

// ——— 02 Питание: кофе и давление ———

const CoffeeCup: React.FC<{strikeAt: number}> = ({strikeAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(strikeAt * fps);
  const st = {stroke: COLORS.navy, strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const};
  return (
    <svg width={150} height={150} viewBox="0 0 100 100">
      <path d="M18 38 H70 V62 A20 20 0 0 1 50 82 H38 A20 20 0 0 1 18 62 Z" {...st} />
      <path d="M70 46 H78 A9 9 0 0 1 78 64 H70" {...st} />
      <path
        d="M34 14 C30 20 38 24 34 30 M48 12 C44 18 52 22 48 28"
        {...st}
        strokeWidth={4}
        transform={`translate(0 ${Math.sin(frame / 8) * 2})`}
      />
      <path
        d="M12 88 L88 12"
        {...st}
        strokeWidth={6}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={interpolate(frame, [s, s + 9], [1, 0], {...clamp, easing: EASE.out})}
      />
    </svg>
  );
};

const Gauge: React.FC<{at: number; riseAt: number; riseUntil: number}> = ({at, riseAt, riseUntil}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = usePop(at);
  const angle = interpolate(frame, [riseAt * fps, riseUntil * fps], [-70, 55], {...clamp, easing: EASE.inOut});
  return (
    <svg width={190} height={120} viewBox="-60 -50 120 62" style={{opacity: p}}>
      <path d="M-48 0 A48 48 0 0 1 48 0" stroke={COLORS.beigeDark} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path
        d="M-48 0 A48 48 0 0 1 48 0"
        stroke={COLORS.navy}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={interpolate(angle, [-90, 90], [1, 0])}
      />
      <g transform={`rotate(${angle})`}>
        <path d="M0 0 V-38" stroke={COLORS.navy} strokeWidth={3.5} strokeLinecap="round" />
      </g>
      <circle cx={0} cy={0} r={6} fill={COLORS.navy} />
    </svg>
  );
};

const Drop: React.FC<{at: number}> = ({at}) => {
  const p = usePop(at);
  return (
    <svg width={56} height={70} viewBox="0 0 40 50" style={{scale: String(p), translate: `0px ${(1 - p) * -20}px`}}>
      <path d="M20 2 C28 16 36 24 36 33 A16 16 0 0 1 4 33 C4 24 12 16 20 2 Z" fill={COLORS.navy} />
    </svg>
  );
};

export const Coffee: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="02 / 05" until={until}>
    <Window title="Питание">
      <div style={{display: 'flex', gap: 30}}>
        <Pop at={0.13} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
          <CoffeeCup strikeAt={0.61} />
          <Heading>Кофе</Heading>
          <Skeleton at={0.3} width="70%" />
        </Pop>
        <Pop at={2.37} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
          <div style={{height: 150, display: 'flex', alignItems: 'flex-end', gap: 6}}>
            <Gauge at={2.37} riseAt={2.79} riseUntil={4.4} />
            <Drop at={4.95} />
          </div>
          <Heading>Давление</Heading>
          <Skeleton at={2.5} width="70%" />
        </Pop>
      </div>
    </Window>
  </PanelScene>
);

// ——— 03 Уход: холодные компрессы ———

const Snowflake: React.FC<{size: number}> = ({size}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{rotate: `${frame * 0.6}deg`}}>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`}>
          <path
            d="M0 0 V-50 M-12 -38 L0 -28 L12 -38"
            stroke={COLORS.navy}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
};

const Thermometer: React.FC<{dropAt: number}> = ({dropAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const level = interpolate(frame, [dropAt * fps, (dropAt + 0.8) * fps], [0.85, 0.2], {...clamp, easing: EASE.inOut});
  return (
    <svg width={34} height={90} viewBox="0 0 34 90">
      <rect x={10} y={4} width={14} height={62} rx={7} fill="none" stroke={COLORS.navy} strokeWidth={2.5} />
      <rect x={14} y={8 + 54 * (1 - level)} width={6} height={54 * level + 10} rx={3} fill={COLORS.navy} />
      <circle cx={17} cy={74} r={11} fill={COLORS.navy} />
    </svg>
  );
};

const Doses: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: 12}}>
      {[0, 1, 2, 3, 4].map((i) => {
        const s = Math.round((at + i * 0.1) * fps);
        const fill = interpolate(frame, [s, s + 4], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              border: `2.5px solid ${COLORS.navy}`,
              backgroundColor: `rgba(8, 32, 82, ${fill})`,
              scale: String(1 + Math.sin(fill * Math.PI) * 0.2),
            }}
          />
        );
      })}
    </div>
  );
};

const EyeCompress: React.FC<{at: number; padAt: number}> = ({at, padAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = interpolate(frame, [at * fps, (at + 0.5) * fps], [1, 0], {...clamp, easing: EASE.out});
  const pad = usePop(padAt);
  return (
    <svg width={96} height={60} viewBox="0 0 100 60">
      <path
        d="M6 30 C24 8 76 8 94 30 C76 52 24 52 6 30 Z"
        stroke={COLORS.navy}
        strokeWidth={4}
        fill="none"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw}
      />
      <circle cx={50} cy={30} r={9} fill={COLORS.navy} opacity={1 - draw} />
      <rect
        x={20}
        y={6}
        width={60}
        height={26}
        rx={10}
        fill={COLORS.beigeDark}
        stroke={COLORS.navy}
        strokeWidth={2.5}
        opacity={pad}
        transform={`translate(0 ${(1 - pad) * -20})`}
      />
    </svg>
  );
};

const Item: React.FC<{at: number; icon: React.ReactNode; title: string; right?: React.ReactNode}> = ({
  at,
  icon,
  title,
  right,
}) => (
  <Pop
    at={at}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      padding: '16px 22px',
      borderRadius: 18,
      border: `1px solid ${COLORS.beigeDark}`,
      boxShadow: `0 4px 14px ${COLORS.shadow}`,
      backgroundColor: COLORS.card,
    }}
  >
    <div style={{width: 96, display: 'flex', justifyContent: 'center'}}>{icon}</div>
    <div style={{flex: 1}}>
      <Heading>{title}</Heading>
      <Skeleton at={at + 0.12} width="80%" style={{marginTop: 12}} />
    </div>
    {right}
  </Pop>
);

export const Compress: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="03 / 05" until={until}>
    <Window title="Холодные компрессы">
      <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        <Item at={2.63} icon={<Snowflake size={72} />} title="Хлоргексидин" right={<Thermometer dropAt={5.21} />} />
        <Item
          at={6.3}
          icon={<div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 34, color: COLORS.navy}}>×5</div>}
          title="В день"
          right={<Doses at={6.63} />}
        />
        <Item at={8.27} icon={<EyeCompress at={8.27} padAt={9.39} />} title="Веки" />
      </div>
    </Window>
  </PanelScene>
);

// ——— 04 Швы: календарь ———

const Day: React.FC<{day: number; at: number; markAt?: number; checkAt?: number}> = ({day, at, markAt, checkAt}) => {
  const p = usePop(at);
  const mark = usePop(markAt ?? 1e6);
  return (
    <div
      style={{
        position: 'relative',
        width: 92,
        height: 92,
        borderRadius: 18,
        border: `1.5px solid ${mark > 0.5 ? COLORS.navy : COLORS.beigeLine}`,
        backgroundColor: `rgba(8, 32, 82, ${Math.min(1, mark)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONTS.mono,
        fontWeight: 500,
        fontSize: 32,
        color: mark > 0.5 ? COLORS.white : COLORS.navy,
        opacity: Math.min(1, p),
        scale: String(interpolate(p, [0, 1], [0.8, 1])),
      }}
    >
      {day}
      {checkAt === undefined ? null : (
        <div style={{position: 'absolute', top: -12, right: -12}}>
          <Check at={checkAt} size={34} />
        </div>
      )}
    </div>
  );
};

export const Stitches: React.FC<{until: number}> = ({until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const barAt = Math.round(2.67 * fps);
  return (
    <PanelScene label="04 / 05" until={until}>
      <Window title="Снятие швов">
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <Day
              key={day}
              day={day}
              at={0.1 + day * 0.04}
              markAt={day === 6 ? 0.31 : day === 7 ? 0.71 : undefined}
              checkAt={day === 6 || day === 7 ? 2.11 + (day - 6) * 0.1 : undefined}
            />
          ))}
        </div>
        <Pop at={2.67} style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 18}}>
          <Heading>Наклейки</Heading>
          <div style={{flex: 1, height: 16, borderRadius: 8, backgroundColor: COLORS.beigeDark, overflow: 'hidden'}}>
            <div
              style={{
                height: '100%',
                backgroundColor: COLORS.navy,
                transformOrigin: 'left center',
                scale: `${interpolate(frame, [barAt, barAt + 40], [0, 1], {...clamp, easing: EASE.inOut})} 1`,
              }}
            />
          </div>
          <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, color: COLORS.navy}}>7 дн</div>
        </Pop>
      </Window>
    </PanelScene>
  );
};

// ——— 05 Восстановление: терапия ———

const SendButton: React.FC<{at: number}> = ({at}) => {
  const p = usePop(at);
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" style={{flexShrink: 0, scale: String(0.9 + Math.min(1, p) * 0.1)}}>
      <circle cx={24} cy={24} r={24} fill={p > 0.5 ? COLORS.navy : COLORS.navy40} />
      <path
        d="M24 34 V15 M16 22 L24 14 L32 22"
        stroke={COLORS.white}
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Result: React.FC<{at: number; title: string}> = ({at, title}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  return (
    <Pop at={at} style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Check at={at + 0.5} />
      <div style={{width: 170}}>
        <Heading>{title}</Heading>
      </div>
      <div style={{flex: 1, height: 14, borderRadius: 7, backgroundColor: COLORS.beigeDark, overflow: 'hidden'}}>
        <div
          style={{
            height: '100%',
            backgroundColor: COLORS.navy,
            transformOrigin: 'left center',
            scale: `${interpolate(frame, [s, s + 30], [1, 0.25], {...clamp, easing: EASE.inOut})} 1`,
          }}
        />
      </div>
    </Pop>
  );
};

export const Therapy: React.FC<{until: number}> = ({until}) => (
  <PanelScene label="05 / 05" until={until}>
    <Window title="Восстановление">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 20px',
          borderRadius: 18,
          backgroundColor: '#F6F7FA',
          border: `1px solid ${COLORS.beigeDark}`,
        }}
      >
        <div style={{flex: 1, fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.navy}}>
          <Typewriter at={1.96} text="Фотодинамическая терапия" />
        </div>
        <SendButton at={3.4} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 24, marginTop: 30}}>
        <Result at={6.7} title="Отёки" />
        <Result at={7.94} title="Синяки" />
        <Result at={8.88} title="Рубец" />
      </div>
    </Window>
  </PanelScene>
);

// Главные появления (секунды от начала сцены) — под них тихий «поп»
export const POP_TIMES = {
  firstDays: [2.25, 3.55, 5.67, 7.97],
  coffee: [0.61, 4.95],
  compress: [2.63, 6.3, 8.27],
  stitches: [2.11, 2.67],
  therapy: [6.7, 7.94, 8.88],
};

// Печать текста в терапии — для звука клавиш
export const TYPING = {at: 1.96, chars: 'Фотодинамическая терапия'.length, cps: 22};
