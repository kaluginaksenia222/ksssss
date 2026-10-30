import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT, TYPE} from '../design/tokens';
import {Card, CheckBadge, Icon, IconCard, SceneTitle, SectionLabel, usePop} from '../components/ui';

// Все времена внутри сцен — секунды от начала сцены.
// Сцена сама проявляется в начале и растворяется (blur + fade + scale) в конце.

const PanelScene: React.FC<{
  num: string;
  label: string;
  duration: number;
  children: React.ReactNode;
}> = ({num, label, duration, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(duration * fps);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const out = interpolate(frame, [end - 8, end], [1, 0], {...clamp, easing: EASE.in});
  const inn = interpolate(frame, [0, 6], [0, 1], {...clamp, easing: EASE.out});
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: Math.min(out, inn),
        filter: `blur(${(1 - out) * 8}px)`,
        scale: String(interpolate(out, [0, 1], [0.97, 1])),
      }}
    >
      <div style={{position: 'absolute', top: 168, left: 0, right: 0, textAlign: 'center'}}>
        <SectionLabel num={num} text={label} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: LAYOUT.sidePadding,
          right: LAYOUT.sidePadding,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Row: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', gap: 20}}>{children}</div>
);

// 01 — первые дни и нагрузки
export const FirstDays: React.FC<{duration: number}> = ({duration}) => (
  <PanelScene num="01" label="Первые дни" duration={duration}>
    <SceneTitle at={0.24} size={72}>
      Первые 2–3 дня
    </SceneTitle>
    <Row>
      <IconCard at={1.86} icon={<Icon name="noBend" />} title="Не наклонять голову" style={{flex: 1}} />
      <IconCard at={3.16} icon={<Icon name="bed" />} title="Не спать на животе" style={{flex: 1}} />
    </Row>
    <div style={{height: 14}} />
    <SceneTitle at={4.56} size={72}>
      2 недели — без
    </SceneTitle>
    <Row>
      <IconCard at={5.28} icon={<Icon name="dumbbell" />} title="Физических нагрузок" style={{flex: 1}} />
      <IconCard at={7.58} icon={<Icon name="heart" />} title="Эмоциональных нагрузок" style={{flex: 1}} />
    </Row>
  </PanelScene>
);

// Кружка кофе, которая перечёркивается
const CoffeeIcon: React.FC<{strikeAt: number}> = ({strikeAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(strikeAt * fps);
  const stroke = {stroke: COLORS.navy, strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const};
  return (
    <svg width={190} height={190} viewBox="0 0 100 100">
      <path d="M18 38 H70 V62 A20 20 0 0 1 50 82 H38 A20 20 0 0 1 18 62 Z" {...stroke} />
      <path d="M70 46 H78 A9 9 0 0 1 78 64 H70" {...stroke} />
      <path d="M34 14 C30 20 38 24 34 30 M48 12 C44 18 52 22 48 28" {...stroke} />
      <path
        d="M10 90 L90 10"
        {...stroke}
        strokeWidth={8}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={interpolate(frame, [s, s + 8], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.out,
        })}
      />
    </svg>
  );
};

const Chip: React.FC<{at: number; filled?: boolean; children: React.ReactNode}> = ({at, filled, children}) => {
  const p = usePop(at);
  return (
    <div
      style={{
        padding: '16px 28px',
        borderRadius: LAYOUT.pillRadius,
        backgroundColor: filled ? COLORS.navy : COLORS.white,
        border: `2px solid ${COLORS.navy}`,
        color: filled ? COLORS.beige : COLORS.navy,
        fontFamily: FONTS.body,
        fontWeight: 700,
        fontSize: 34,
        opacity: interpolate(p, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
        scale: interpolate(p, [0, 1], [0.85, 1]),
      }}
    >
      {children}
    </div>
  );
};

// 02 — кофе
export const Coffee: React.FC<{duration: number}> = ({duration}) => (
  <PanelScene num="02" label="Питание" duration={duration}>
    <Card at={0.08} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '30px 40px'}}>
      <CoffeeIcon strikeAt={0.56} />
      <div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: 110,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            color: COLORS.navy,
            textTransform: 'uppercase',
          }}
        >
          Кофе
        </div>
        <SceneTitle at={1.34} size={44}>
          несколько дней
        </SceneTitle>
      </div>
    </Card>
    <div style={{height: 20}} />
    <div style={{display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap'}}>
      <Chip at={2.74}>↑ давление</Chip>
      <Chip at={4.2}>→</Chip>
      <Chip at={4.9} filled>
        риск кровотечения
      </Chip>
    </div>
  </PanelScene>
);

// 03 — холодные компрессы
export const Compress: React.FC<{duration: number}> = ({duration}) => {
  const numberCard = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '26px 16px',
    flex: 1,
    textAlign: 'center' as const,
  };
  const caption = {fontFamily: FONTS.body, fontWeight: 700, fontSize: 30, color: COLORS.navy, lineHeight: 1.15};
  return (
    <PanelScene num="03" label="Уход" duration={duration}>
      <SceneTitle at={1.26} size={72}>
        Холодные компрессы
      </SceneTitle>
      <div style={{height: 10}} />
      <div style={{display: 'flex', gap: 20, height: 300}}>
        <Card at={2.52} style={numberCard}>
          <Icon name="snowflake" size={96} />
          <div style={caption}>Хлоргексидин в холодильник</div>
        </Card>
        <Card at={6.34} style={numberCard}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 900,
              fontSize: 120,
              lineHeight: 0.9,
              color: COLORS.navy,
            }}
          >
            ×5
          </div>
          <div style={caption}>до пяти раз в день</div>
        </Card>
        <Card at={8.16} style={numberCard}>
          <Icon name="eye" size={96} />
          <div style={caption}>на область век</div>
        </Card>
      </div>
    </PanelScene>
  );
};

// 04 — снятие швов: полоска из 7 дней
const DayCell: React.FC<{day: number; at: number; fillAt?: number}> = ({day, at, fillAt}) => {
  const p = usePop(at);
  const fill = usePop(fillAt ?? 1e6);
  return (
    <div
      style={{
        position: 'relative',
        width: 112,
        height: 112,
        borderRadius: 24,
        border: `2px solid ${COLORS.navy}`,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: interpolate(p, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
        scale: interpolate(p, [0, 1], [0.8, 1]),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: COLORS.navy,
          transformOrigin: 'bottom',
          scale: `1 ${fill}`,
        }}
      />
      <div
        style={{
          position: 'relative',
          fontFamily: FONTS.heading,
          fontWeight: 900,
          fontSize: 56,
          color: fill > 0.5 ? COLORS.beige : COLORS.navy,
        }}
      >
        {day}
      </div>
    </div>
  );
};

export const Stitches: React.FC<{duration: number}> = ({duration}) => (
  <PanelScene num="04" label="Швы" duration={duration}>
    <SceneTitle at={1.36} size={72}>
      Снимаем швы
    </SceneTitle>
    <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: COLORS.navy80, letterSpacing: '0.04em'}}>
      сутки после операции
    </div>
    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
        <DayCell key={day} day={day} at={0.1 + day * 0.06} fillAt={day === 6 ? 0.26 : day === 7 ? 0.66 : undefined} />
      ))}
    </div>
    <div style={{height: 10}} />
    <IconCard at={3.6} icon={<Icon name="patch" />} title="+ наклейки на неделю" sub="подклеиваем после снятия швов" />
  </PanelScene>
);

// 05 — фотодинамическая терапия
const CheckRow: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => (
  <Card at={at} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 24px'}}>
    <CheckBadge at={at + 0.15} />
    <div style={{fontFamily: FONTS.body, fontWeight: 700, fontSize: 36, color: COLORS.navy}}>{children}</div>
  </Card>
);

const AccentWord: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(at * fps);
  return (
    <span
      style={{
        fontFamily: FONTS.accent,
        fontWeight: 400,
        fontSize: TYPE.accent * 0.7,
        lineHeight: 0.6,
        marginLeft: 14,
        display: 'inline-block',
        rotate: '-4deg',
        opacity: interpolate(frame, [s, s + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        clipPath: `inset(0 ${interpolate(frame, [s, s + 14], [100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.out,
        })}% 0 0)`,
      }}
    >
      {children}
    </span>
  );
};

export const Therapy: React.FC<{duration: number}> = ({duration}) => (
  <PanelScene num="05" label="Восстановление" duration={duration}>
    <SceneTitle at={1.86} size={66}>
      Фотодинамическая терапия
    </SceneTitle>
    <SceneTitle at={3.64} size={34}>
      <span style={{fontFamily: FONTS.body, fontWeight: 500, textTransform: 'none', color: COLORS.navy80}}>
        после блефаропластики — чтобы быстрее:
      </span>
    </SceneTitle>
    <div style={{height: 4}} />
    <CheckRow at={6.6}>сошли отёки</CheckRow>
    <CheckRow at={7.84}>ушли синяки</CheckRow>
    <CheckRow at={8.78}>
      рубец стал <AccentWord at={9.7}>мягче</AccentWord>
    </CheckRow>
  </PanelScene>
);
