import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS} from '../design/tokens';
import {BigRing, ChipRow, EchoWords, MetalTitle, RingMeter, RingReveal, TopTags} from './parts';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Настрой и восстановление» — стиль expert-reel-montage.
// Исходник — одобренная нарезка без запинок (cuts.json). Время — секунды нарезки.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Лицо врача в кадре — отсюда раскрываются кольца и сюда же направлены наезды
const FACE = {cx: 512, cy: 700};

// Стыки нарезки: на каждом плавно меняем крупность, чтобы скачок кадра не был заметен
const CUTS = [2.93, 4.66, 8.59, 10.97, 13.04, 16.29, 19.22, 25.34, 29.42, 30.39];

// Синие сцены: короткие, хирург остаётся в кадре большую часть ролика
const BLUE1 = {from: 10.9, to: 13.3};
const BLUE2 = {from: 19.25, to: 25.0};

// Хук: заголовок-вопрос, от него эхом разлетаются слова, на «действительно влияет» — удар
const HOOK = {at: 0.15, until: 3.1, top: 960, slam: 0.95};
const HOOK_ECHO = [
  {text: 'тревога', at: 0.55, dx: -300, dy: -185},
  {text: 'позитив', at: 0.85, dx: 300, dy: -185},
  {text: 'страх', at: 1.4, dx: -290, dy: 300},
  {text: 'осложнения', at: 1.7, dx: 270, dy: 310},
];

// Заголовки на видео (субтитры с теми же словами на это время прячем)
const TITLES = [
  {at: 17.7, until: 19.2, lines: ['Слишком', 'тревожные']},
  {at: 27.34, until: 29.4, lines: ['Сложнее', 'работать']},
  {at: 31.14, until: 32.3, lines: ['Время', 'сейчас такое']},
];
const CAPTION_OFF = [
  [0, HOOK.until],
  [BLUE1.from + 0.1, BLUE1.to],
  ...TITLES.map((t) => [t.at, t.until]),
];

// Крупность по кускам нарезки: чередуем 1.0 и 1.12, смена — плавный наезд за 8 кадров
const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const prevIdx = Math.max(0, idx - 1);
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.12 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 8], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1 : interpolate(k, [0, 1], [scaleOf(prevIdx), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 6], [0, 0.025], {extrapolateRight: 'clamp'});
  // Хук: влёт кадра из приближения с размытием, дрожь на ударе
  const slamIn = interpolate(frame, [0, 9], [0.4, 0], {...clamp, easing: EASE.out});
  const s = frame - Math.round(HOOK.slam * fps);
  const shake = s >= 0 && s < 10 ? (1 - s / 10) * 14 : 0;
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{
          width: 1080,
          height: 1920,
          transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`,
          scale: String(base + drift + slamIn),
          translate: `${Math.sin(s * 2.7) * shake}px ${Math.cos(s * 3.1) * shake}px`,
          filter: `blur(${slamIn * 22}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Вспышки: на первом кадре и на ударе хука
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame - Math.round(HOOK.slam * fps);
  const v = Math.max(interpolate(frame, [0, 6], [0.6, 0], clamp), s >= 0 ? interpolate(s, [0, 5], [0.3, 0], clamp) : 0);
  return <AbsoluteFill style={{backgroundColor: COLORS.beige, opacity: v}} />;
};

// Субтитры: белые, тонкие, по 2 слова, чуть ниже середины
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (CAPTION_OFF.some(([a, b]) => t >= a && t < b)) {
    return null;
  }
  const index = PAGES.findIndex((page, i) => {
    const next = PAGES[i + 1];
    const from = page.words[0].start - 0.05;
    const to = next ? Math.min(next.words[0].start - 0.05, page.words[page.words.length - 1].end + 0.6) : Infinity;
    return t >= from && t < to;
  });
  if (index === -1) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        top: 1110,
        left: 64,
        right: 64,
        textAlign: 'center',
        fontFamily: FONTS.body,
        fontWeight: 400,
        fontSize: 46,
        color: COLORS.white,
        textShadow: '0 2px 14px rgba(0, 0, 0, 0.5)',
      }}
    >
      {PAGES[index].words.map((word) => {
        const st = Math.round(word.start * fps);
        return (
          <span
            key={`${index}-${word.start}`}
            style={{
              display: 'inline-block',
              margin: '0 0.14em',
              opacity: interpolate(frame, [st, st + 4], [0, 1], {...clamp, easing: EASE.out}),
              translate: interpolate(frame, [st, st + 4], ['0px 10px', '0px 0px'], {...clamp, easing: EASE.out}),
              filter: `blur(${interpolate(frame, [st, st + 4], [4, 0], clamp)}px)`,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

// Синий фон сцены: большой круг и моно-метка
const BlueStage: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.navy,
      backgroundImage: 'radial-gradient(ellipse 70% 40% at 50% 34%, rgba(248,240,229,0.12), rgba(8,32,82,0) 70%)',
    }}
  >
    <BigRing cx={540} cy={640} size={860} />
    <div
      style={{
        position: 'absolute',
        top: 440,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONTS.mono,
        fontWeight: 500,
        fontSize: 22,
        letterSpacing: '0.16em',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      {label}
    </div>
    {children}
  </AbsoluteFill>
);

// Синяя сцена 1: большинство настроено позитивно
const BluePositive: React.FC = () => {
  const local = (abs: number) => abs - BLUE1.from;
  const end = BLUE1.to - BLUE1.from;
  return (
    <BlueStage label="НАСТРОЙ ПАЦИЕНТОВ">
      <MetalTitle at={local(11.1)} until={end} lines={['Большинство', 'позитивно']} size={68} top={500} />
      <ChipRow at={local(12.42)} until={end} top={700} chips={[{text: 'позитивный настрой', at: local(12.42), strong: true}]} />
    </BlueStage>
  );
};

// Синяя сцена 2: тревога не только из-за операций, а по жизни в целом
const BlueAnxiety: React.FC = () => {
  const local = (abs: number) => abs - BLUE2.from;
  const end = BLUE2.to - BLUE2.from;
  return (
    <BlueStage label="ТРЕВОЖНОСТЬ">
      <MetalTitle at={local(19.56)} until={end} lines={['Тревога', 'шире операций']} size={64} top={500} />
      <ChipRow
        at={local(21.4)}
        until={end}
        top={700}
        chips={[
          {text: 'операции', at: local(21.66)},
          {text: 'жизнь в целом', at: local(23.92), strong: true},
        ]}
      />
    </BlueStage>
  );
};

// Звуки: удар и блеск на хуке и заголовках, свуш на кольцах, тихий «поп» на появлениях, щелчки эха
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  const sfx = (name: string, at: number, volume: number, dur = 0.8) => (
    <Sequence key={`${name}${at}`} name={`SFX ${name}`} from={Math.round(at * fps)} durationInFrames={Math.round(dur * fps)}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
  return (
    <>
      {[0, HOOK.slam].map((at) => sfx('impact', at, 0.3))}
      {sfx('whoosh', 0, 0.22, 0.6)}
      {[HOOK.slam, ...TITLES.map((x) => x.at), 11.1, 19.56].map((at) => sfx('shimmer', at, 0.45, 1.1))}
      {[BLUE1, BLUE2].flatMap((b) => [b.from, b.to - 0.33]).map((at) => sfx('whoosh', at, 0.2, 0.6))}
      {HOOK_ECHO.map((w) => sfx('tick', w.at, 0.2, 0.2))}
      {[5.2, 9.44, 14.9, 21.66, 23.92, 29.66].map((at) => sfx('pop', at, 0.1, 0.2))}
    </>
  );
};

export const Anxious: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  const seq = (b: {from: number; to: number}) => ({from: Math.round(b.from * fps), durationInFrames: Math.round((b.to - b.from) * fps)});

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <Flash />
      <TopTags tags={['ЭКСПЕРТ', 'ПЛАСТИЧЕСКАЯ ХИРУРГИЯ', 'НАСТРОЙ']} />

      {/* Хук */}
      <MetalTitle
        at={HOOK.at}
        until={HOOK.until}
        lines={['Насколько настрой', 'действительно влияет', 'на восстановление', 'после операции?']}
        size={60}
        top={HOOK.top}
      />
      <EchoWords cx={540} cy={HOOK.top + 125} until={HOOK.until} words={HOOK_ECHO} />

      {/* 80–90 % тревожных пациентов действительно получали осложнения */}
      <RingMeter
        at={5.2}
        until={8.5}
        top={1190}
        title="Осложнения у тревожных"
        note="по наблюдению хирурга"
        from={0}
        to={85}
        moveAt={5.44}
        moveUntil={6.4}
        center="80–90%"
      />
      <ChipRow at={9.44} until={10.85} top={1230} chips={[{text: 'всё решаемо', at: 9.44, strong: true}]} />

      <Sequence name="Синяя сцена: позитив" {...seq(BLUE1)}>
        <RingReveal until={BLUE1.to - BLUE1.from} {...FACE}>
          <BluePositive />
        </RingReveal>
      </Sequence>

      <ChipRow at={14.9} until={17.6} top={1230} chips={[{text: 'тенденция ↑', at: 14.9}]} />
      <MetalTitle {...TITLES[0]} size={68} top={1000} />

      <Sequence name="Синяя сцена: тревожность" {...seq(BLUE2)}>
        <RingReveal until={BLUE2.to - BLUE2.from} {...FACE}>
          <BlueAnxiety />
        </RingReveal>
      </Sequence>

      <MetalTitle {...TITLES[1]} size={68} top={1000} />
      <ChipRow at={29.6} until={30.95} top={1230} chips={[{text: 'не со всеми', at: 29.66}]} />
      <MetalTitle {...TITLES[2]} size={64} top={1000} />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>

      <Audio src={staticFile('source.mp4')} />
      {/* Музыка: спокойная подложка, примерно на 8 дБ тише голоса */}
      <Audio src={staticFile('music/calm_pad.wav')} volume={1.8} />
      <SoundEffects />
    </AbsoluteFill>
  );
};
