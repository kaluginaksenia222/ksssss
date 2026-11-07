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
import {ChipRow} from './parts';
import {ChoicePair, EyeHook, HaveNot, HazeReveal, InnerLid, LashLine, EyeBags, MistTitle, SoftClock, TermCard, TideReveal} from './gentle';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Нижняя блефаропластика без разрезов» — мягкая подача:
// плавные наезды на стыках, анимации без резкостей, каждая — один раз, тихая музыка и звуки.
// Исходник — смысловая нарезка (cuts.json). Время — секунды нарезки.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Лицо врача — сюда направлены наезды
const FACE = {cx: 600, cy: 700};

// Стыки нарезки: на каждом плавная смена крупности, чтобы скачок не был заметен
const CUTS = [2.12, 11.44, 13.2, 20.96, 23.46, 24.83, 27.39, 36.79, 38.25, 39.32, 40.77, 41.26];

const HOOK_END = 2.3;
const BLUE1 = {from: 6.55, to: 9.9};
const BLUE2 = {from: 32.3, to: 36.95};
const CAPTION_OFF = [
  [0, HOOK_END],
  [BLUE1.from + 0.2, BLUE1.to - 0.2],
  [BLUE2.from + 0.3, BLUE2.to - 0.3],
  // текст уже на экране (карточка с названием методики, часы «20–30 минут»)
  [4.4, 6.5],
  [22.3, 23.5],
];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.08 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 14], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1 : interpolate(k, [0, 1], [scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 8], [0, 0.02], {extrapolateRight: 'clamp'});
  // Хук: кадр мягко проявляется из лёгкого приближения
  const intro = interpolate(frame, [0, 24], [0.06, 0], {...clamp, easing: EASE.out});
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{
          width: 1080,
          height: 1920,
          transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`,
          scale: String(base + drift + intro),
        }}
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
      {PAGES[index].words.map((word, wi) => {
        const st = Math.round(word.start * fps);
        return (
          <span
            key={`${index}-${wi}`}
            style={{
              display: 'inline-block',
              margin: '0 0.14em',
              opacity: interpolate(frame, [st, st + 5], [0, 1], {...clamp, easing: EASE.out}),
              translate: interpolate(frame, [st, st + 5], ['0px 8px', '0px 0px'], {...clamp, easing: EASE.out}),
              filter: `blur(${interpolate(frame, [st, st + 5], [3, 0], clamp)}px)`,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

// Тихие звуки: только мягкие свуши на синих сценах, лёгкий блеск на хуке и едва слышные «попы»
const SoundTrack: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const sfx = (name: string, at: number, volume: number, dur = 0.8) => (
    <Sequence key={`${name}${at}`} name={`SFX ${name}`} from={Math.round(at * fps)} durationInFrames={Math.round(dur * fps)}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
  return (
    <>
      <Audio src={staticFile('source.mp4')} />
      {/* Тихая музыка: заметно ниже голоса, затихает в конце */}
      <Audio
        src={staticFile('music/calm_pad_45.wav')}
        volume={(f) => 1.0 * interpolate(f, [durationInFrames - 1.5 * fps, durationInFrames - 1], [1, 0], clamp)}
      />
      {sfx('shimmer', 0.15, 0.25, 1.1)}
      {[BLUE1.from, BLUE1.to - 0.5, BLUE2.from, BLUE2.to - 0.7].map((at) => sfx('whoosh', at, 0.08, 0.6))}
      {[3.88, 15.7, 17.32, 21.06, 24.84, 26.32, 34.18, 35.62, 37.3].map((at) => sfx('pop', at, 0.05, 0.2))}
    </>
  );
};

export const LowerBleph: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  const seq = (b: {from: number; to: number}) => ({from: Math.round(b.from * fps), durationInFrames: Math.round((b.to - b.from) * fps)});

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />

      {/* Хук */}
      <Sequence name="Хук" durationInFrames={Math.round(HOOK_END * fps)}>
        <EyeHook until={HOOK_END} top={830} />
        <MistTitle at={0.1} until={HOOK_END} lines={['Нижняя блефаропластика', 'без разрезов?']} size={60} top={1080} />
      </Sequence>

      <TermCard at={3.9} until={6.5} label="МЕТОДИКА" term="Трансконъюнктивальная блефаропластика" top={1250} />

      <Sequence name="Синяя сцена: разрез изнутри" {...seq(BLUE1)}>
        <HazeReveal until={BLUE1.to - BLUE1.from}>
          <InnerLid until={BLUE1.to - BLUE1.from} />
        </HazeReveal>
      </Sequence>

      <ChipRow at={10.0} until={11.5} top={1230} chips={[{text: 'подходит не всем', at: 10.0, strong: true}]} />
      <HaveNot at={15.7} noAt={17.32} until={20.9} top={1250} yes="грыжи нижних век" no="избытков кожи" />
      <SoftClock at={21.0} until={23.5} top={1220} />
      <ChoicePair at={24.84} secondAt={26.32} until={27.4} top={1200} a="внутривенный наркоз" b="местная анестезия" />

      <Sequence name="Синяя сцена: грыжи и кожа" {...seq(BLUE2)}>
        <TideReveal until={BLUE2.to - BLUE2.from}>
          <EyeBags bagAt={34.18 - BLUE2.from} skinAt={35.62 - BLUE2.from} titleAt={36.1 - BLUE2.from} until={BLUE2.to - BLUE2.from} />
        </TideReveal>
      </Sequence>

      <Sequence name="Финал: разрез по краю ресниц" from={Math.round(37.0 * fps)}>
        <LashLine at={0.3} until={5.2} top={1200} label={false} />
      </Sequence>

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
