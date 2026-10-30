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
import {ChatCard, FaceWindow, MetalTitle, RingReveal, ToggleCard, TopTags} from './parts';
import {PAGES} from './transcript';

// Экспертный рилс, версия 3 — приёмы тёмного референса по-своему, без вырезки человека:
// металлические заголовки чуть ниже середины, стеклянные карточки на груди,
// «живые» окна с лицом врача, переход кольцом в тёмно-синюю сцену.
// Субтитры — белые, тонкие, по 2 слова. Время — секунды по расшифровке голоса.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Тёмная сцена (кольцом), центр кольца — лицо врача
const DARK = {from: 4.95, to: 10.5, cx: 712, cy: 690};

// Когда субтитры прячем: их заменяет заголовок
const CAPTION_OFF = [
  [1.76, 3.2],
  [5.05, 9.1],
  [12.82, 13.84],
];

// Крупность: резкая смена по разделам, медленный наезд внутри
const ZOOMS = [
  {at: 0, scale: 1},
  {at: 3.2, scale: 1.12},
  {at: 10.5, scale: 1},
  {at: 12.82, scale: 1.12},
];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const z = ZOOMS.reduce((acc, item) => (t >= item.at ? item : acc), ZOOMS[0]);
  const drift = interpolate(t - z.at, [0, 8], [0, 0.03], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{width: 1080, height: 1920, transformOrigin: '50% 32%', scale: String(z.scale + drift)}}
      />
    </AbsoluteFill>
  );
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

// Тёмно-синяя сцена: круглое «живое» видео врача, метка, заголовки сменяют друг друга, переключатель
const DarkScene: React.FC = () => {
  const local = (abs: number) => abs - DARK.from;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        backgroundImage: 'radial-gradient(ellipse 70% 40% at 50% 30%, rgba(248,240,229,0.12), rgba(8,32,82,0) 70%)',
      }}
    >
      <FaceWindow at={0.1} until={9} round zoom={1.05} offset={DARK.from} style={{left: 390, top: 230, width: 300, height: 300}} />
      <div
        style={{
          position: 'absolute',
          top: 600,
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
        СТРАХИ ПАЦИЕНТОВ
      </div>
      <MetalTitle at={local(5.76)} until={local(7.2)} lines={['Чего боятся']} size={100} top={650} />
      <MetalTitle at={local(7.22)} until={local(8.32)} lines={['Филлеры']} size={110} top={650} />
      <MetalTitle at={local(8.34)} until={9} lines={['Нити']} size={110} top={650} />
      <ToggleCard at={local(7.22)} until={9} offAt={local(9.42)} top={860} />
    </AbsoluteFill>
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
      {[1.76, 12.82].map((at) => [sfx('impact', at, 0.22), sfx('shimmer', at, 0.5, 1.1)])}
      {[DARK.from, DARK.to - 0.33].map((at) => sfx('whoosh', at, 0.2, 0.6))}
      {[0.3, 0.55, 0.8, 3.28, 7.22, 8.34].map((at) => sfx('pop', at, 0.1, 0.2))}
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

      {/* Хук: процедуры всплывают «сообщениями», затем металлический удар */}
      <ChatCard
        at={0.25}
        until={1.7}
        top={1230}
        rows={[
          {text: 'Филлеры', at: 0.3},
          {text: 'Нити', at: 0.55},
          {text: 'SMAS-лифтинг', at: 0.8},
        ]}
      />
      <MetalTitle at={1.76} until={3.15} lines={['Мешают', 'хирургу?']} size={112} top={1000} />

      {/* «Живое» окно с крупным планом лица */}
      <FaceWindow at={3.28} until={4.9} zoom={0.95} style={{left: 70, top: 480, width: 250, height: 320}} />

      <Sequence name="Тёмная сцена: страхи пациентов" from={Math.round(DARK.from * fps)} durationInFrames={Math.round((DARK.to - DARK.from) * fps)}>
        <RingReveal until={DARK.to - DARK.from} cx={DARK.cx} cy={DARK.cy}>
          <DarkScene />
        </RingReveal>
      </Sequence>

      <MetalTitle at={12.82} until={13.84} lines={['Аппаратные', 'методики']} size={100} top={1000} />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <Audio src={staticFile('source.mp4')} />
      <SoundEffects />
    </AbsoluteFill>
  );
};
