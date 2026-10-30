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
import {InstagramHandle} from '../v2/ui';
import {BigRing, ChipRow, EchoWords, MeterCard, MetalTitle, RingReveal, ToggleCard, TopTags} from './parts';
import {PAGES} from './transcript';

// Экспертный рилс, версия 3 — приёмы тёмного референса по-своему, без вырезки человека:
// металлические заголовки чуть ниже середины, стеклянные карточки на груди,
// «живое» окно с лицом врача, переход кольцом в синие сцены с большим кругом (без лица).
// Субтитры — белые, тонкие, по 2 слова. Время — секунды по расшифровке голоса.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Синие сцены — короткие, чтобы хирург был в кадре дольше (кольцом из лица и обратно)
const BLUE1 = {from: 5.6, to: 9.75};
const BLUE2 = {from: 22.95, to: 29.2};
const BLUE3 = {from: 44.0, to: 47.0};
const RING_CENTER = {cx: 712, cy: 690};

// Заглушить слово-мат за кадром
const MUTE = {from: 53.38, to: 53.88};

// Хук: заголовок, от него эхом разлетаются процедуры, затем удар с дрожью кадра
// Эхо от заголовка: мелкие слова-процедуры разлетаются из его центра
const HOOK_WORDS = [
  {text: 'филлеры', at: 0.55, dx: -290, dy: -120},
  {text: 'SMAS', at: 0.9, dx: 300, dy: -110},
  {text: 'нити', at: 1.25, dx: -250, dy: 125},
  {text: 'радиесс', at: 1.55, dx: 270, dy: 120},
];
const HOOK_TITLE = {at: 0.15, top: 1060, cy: 1092};
const SLAM_AT = 1.76;

// Когда субтитры прячем: их заменяет заголовок с теми же словами
const CAPTION_OFF = [
  [0, 3.2],
  [5.6, 9.1],
  [12.82, 13.84],
  [20.06, 22.95],
  [23.2, 24.1],
  [31.9, 33.25],
  [42.36, 43.16],
  [45.3, 46.08],
  [47.1, 48.54],
  [54.94, 55.98],
];

// Крупность: резкая смена по разделам, медленный наезд внутри
const ZOOMS = [
  {at: 0, scale: 1},
  {at: 3.2, scale: 1.12},
  {at: 10.5, scale: 1},
  {at: 12.82, scale: 1.12},
  {at: 16.0, scale: 1},
  {at: 20.06, scale: 1.12},
  {at: 35.6, scale: 1},
  {at: 42.36, scale: 1.12},
  {at: 50.5, scale: 1},
  {at: 54.94, scale: 1.12},
];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const z = ZOOMS.reduce((acc, item) => (t >= item.at ? item : acc), ZOOMS[0]);
  const drift = interpolate(t - z.at, [0, 8], [0, 0.03], {extrapolateRight: 'clamp'});
  // Хук: влёт кадра из приближения с размытием, ступеньки наезда на каждом слове, дрожь на ударе
  const slamIn = interpolate(frame, [0, 8], [0.45, 0], {...clamp, easing: EASE.out});
  const steps = t < SLAM_AT ? HOOK_WORDS.filter((w) => t >= w.at).length * 0.02 : 0;
  const k = frame - Math.round(SLAM_AT * fps);
  const shake = k >= 0 && k < 10 ? (1 - k / 10) * 16 : 0;
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{
          width: 1080,
          height: 1920,
          transformOrigin: '62% 34%',
          scale: String(z.scale + drift + slamIn + steps),
          translate: `${Math.sin(k * 2.7) * shake}px ${Math.cos(k * 3.1) * shake}px`,
          filter: `blur(${slamIn * 24}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Вспышки хука: на первом кадре, на каждом слове и на ударе
const HookFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hits = [0, ...HOOK_WORDS.map((w) => w.at), SLAM_AT];
  const v = Math.max(
    ...hits.map((at, i) => {
      const k = frame - Math.round(at * fps);
      const peak = i === 0 ? 0.7 : at === SLAM_AT ? 0.4 : 0.08;
      return k >= 0 ? interpolate(k, [0, 5], [peak, 0], clamp) : 0;
    }),
  );
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
        const s = Math.round(word.start * fps);
        return (
          <span
            key={`${index}-${word.start}`}
            style={{
              display: 'inline-block',
              margin: '0 0.14em',
              opacity: interpolate(frame, [s, s + 4], [0, 1], {...clamp, easing: EASE.out}),
              translate: interpolate(frame, [s, s + 4], ['0px 10px', '0px 0px'], {...clamp, easing: EASE.out}),
              filter: `blur(${interpolate(frame, [s, s + 4], [4, 0], clamp)}px)`,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

// Синий фон сцены: большой круг и моно-метка сверху
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

// Синяя сцена 1: чего боятся пациенты — заголовки сменяются, переключатель «мешает»
const BlueFears: React.FC = () => {
  const local = (abs: number) => abs - BLUE1.from;
  return (
    <BlueStage label="СТРАХИ ПАЦИЕНТОВ">
      <MetalTitle at={local(5.76)} until={local(7.2)} lines={['Чего боятся']} size={72} top={500} />
      <MetalTitle at={local(7.22)} until={local(8.32)} lines={['Филлеры']} size={72} top={500} />
      <MetalTitle at={local(8.34)} until={9} lines={['Нити']} size={72} top={500} />
      <ToggleCard at={local(7.22)} until={9} offAt={local(9.42)} top={700} />
    </BlueStage>
  );
};

// Синяя сцена 2: Радиесс почти не выводится
const BlueRadiesse: React.FC = () => {
  const local = (abs: number) => abs - BLUE2.from;
  const end = BLUE2.to - BLUE2.from;
  return (
    <BlueStage label="ГЛАВНАЯ ПРОБЛЕМА">
      <MetalTitle at={local(23.58)} until={end} lines={['Радиесс']} size={80} top={500} />
      <MeterCard
        at={local(25.84)}
        until={end}
        top={700}
        title="Выводится из тканей"
        note="практически не выводится"
        from={45}
        to={4}
        moveAt={local(26.68)}
        moveUntil={local(28.82)}
      />
    </BlueStage>
  );
};

// Синяя сцена 3: восстановление дольше
const BlueRehab: React.FC = () => {
  const local = (abs: number) => abs - BLUE3.from;
  const end = BLUE3.to - BLUE3.from;
  return (
    <BlueStage label="РЕАБИЛИТАЦИЯ">
      <MetalTitle at={local(44.32)} until={end} lines={['Дольше', 'восстановление']} size={64} top={490} />
      <MeterCard
        at={local(44.62)}
        until={end}
        top={660}
        title="Срок восстановления"
        note="чуть дольше обычного"
        from={40}
        to={75}
        moveAt={local(44.92)}
        moveUntil={local(46.08)}
      />
    </BlueStage>
  );
};

// Звуки: свуш на переходах кольцом, удар с блеском на металлических заголовках,
// тихий «поп» на появлениях, щелчок переключателя
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  const sfx = (name: string, at: number, volume: number, dur = 0.8) => (
    <Sequence key={`${name}${at}`} name={`SFX ${name}`} from={Math.round(at * fps)} durationInFrames={Math.round(dur * fps)}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
  return (
    <>
      {[SLAM_AT, 12.82, 20.06, 23.58, 32.04, 42.36, 44.32, 54.94].map((at) => sfx('shimmer', at, 0.5, 1.1))}
      {[12.82, 20.06, 23.58, 32.04, 42.36, 54.94].map((at) => sfx('impact', at, 0.22))}
      {[BLUE1, BLUE2, BLUE3].flatMap((b) => [b.from, b.to - 0.33]).map((at) => sfx('whoosh', at, 0.2, 0.6))}
      {[0, SLAM_AT].map((at) => sfx('impact', at, 0.3))}
      {sfx('whoosh', 0, 0.22, 0.6)}
      {HOOK_WORDS.map((w) => sfx('tick', w.at, 0.22, 0.2))}
      {[7.22, 8.34, 14.56, 16.3, 25.84, 32.66, 37.26, 40.06, 47.1, 57.24, 57.98].map((at) => sfx('pop', at, 0.1, 0.2))}
      {sfx('tick', 9.42, 0.25, 0.2)}
    </>
  );
};

export const ExpertV3: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <TopTags tags={['ЭКСПЕРТ', 'ПЛАСТИЧЕСКАЯ ХИРУРГИЯ', '01 / 05']} />

      {/* Хук: кадр влетает, «МЕШАЮТ ХИРУРГУ?», процедуры разлетаются эхом, удар на «мешают» */}
      <HookFlash />
      <MetalTitle at={HOOK_TITLE.at} until={3.15} lines={['Мешают хирургу?']} size={64} top={HOOK_TITLE.top} />
      <EchoWords cx={540} cy={HOOK_TITLE.cy} until={3.15} words={HOOK_WORDS} />


      <Sequence name="Синяя сцена: страхи пациентов" from={Math.round(BLUE1.from * fps)} durationInFrames={Math.round((BLUE1.to - BLUE1.from) * fps)}>
        <RingReveal until={BLUE1.to - BLUE1.from} {...RING_CENTER}>
          <BlueFears />
        </RingReveal>
      </Sequence>

      <MetalTitle at={12.82} until={13.84} lines={['Аппаратные', 'методики']} size={64} top={1000} />
      <ChipRow at={14.5} until={16.3} top={1230} chips={[{text: 'SMAS-лифтинг', at: 14.56, strong: true}]} />
      <MeterCard
        at={16.3}
        until={19.95}
        top={1220}
        title="Сеансы SMAS-лифтинга"
        note="если их было очень много"
        from={15}
        to={92}
        moveAt={16.76}
        moveUntil={17.9}
      />
      <MetalTitle at={20.06} until={22.95} lines={['Больше всего', 'мешает']} size={64} top={1000} />

      <Sequence name="Синяя сцена: Радиесс" from={Math.round(BLUE2.from * fps)} durationInFrames={Math.round((BLUE2.to - BLUE2.from) * fps)}>
        <RingReveal until={BLUE2.to - BLUE2.from} {...RING_CENTER}>
          <BlueRadiesse />
        </RingReveal>
      </Sequence>

      <MeterCard
        at={37.26}
        until={40.0}
        top={1220}
        title="Проникает в ткани"
        note="очень глубоко"
        from={15}
        to={88}
        moveAt={37.48}
        moveUntil={39.34}
      />
      <MetalTitle at={32.04} until={33.25} lines={['Достаю', 'ложкой']} size={64} top={1000} />
      <MeterCard
        at={33.1}
        until={35.55}
        top={1220}
        title="Остатки препарата"
        note="то, что можно достать"
        from={100}
        to={35}
        moveAt={33.28}
        moveUntil={35.0}
      />
      <ChipRow at={40.06} until={42.3} top={1230} chips={[{text: 'часть остаётся', at: 40.06, strong: true}]} />
      <MetalTitle at={42.36} until={43.9} lines={['Создаются', 'проблемы']} size={64} top={1000} />

      <Sequence name="Синяя сцена: реабилитация" from={Math.round(BLUE3.from * fps)} durationInFrames={Math.round((BLUE3.to - BLUE3.from) * fps)}>
        <RingReveal until={BLUE3.to - BLUE3.from} {...RING_CENTER}>
          <BlueRehab />
        </RingReveal>
      </Sequence>

      <MeterCard
        at={47.1}
        until={50.4}
        top={1220}
        title="Кровоснабжение тканей"
        note="немножко нарушено"
        from={100}
        to={68}
        moveAt={48.54}
        moveUntil={49.62}
      />
      <MetalTitle at={54.94} until={57.1} lines={['Хирургическая', 'ложка']} size={64} top={1000} />
      <ChipRow
        at={57.2}
        until={59.6}
        top={1230}
        chips={[
          {text: 'кругленькая', at: 57.24},
          {text: 'с дырочкой', at: 57.98, strong: true},
        ]}
      />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      {/* Слово-мат за кадром (≈53.4 с) глушим */}
      <Audio
        src={staticFile('source.mp4')}
        volume={(f) => (f >= Math.round(MUTE.from * fps) && f < Math.round(MUTE.to * fps) ? 0 : 1)}
      />
      <SoundEffects />
    </AbsoluteFill>
  );
};
