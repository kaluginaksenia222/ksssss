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
import {ChipRow, MetalTitle, TopTags} from './parts';
import {BeakerSplit, DecodeTitle, FactorList, LiquidReveal, ProgressBar} from './novel';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Как подбирают размер имплантов» — стиль expert-reel-montage, новые движения.
// Исходник — нарезка с подрезанными паузами (cuts.json). Время — секунды нарезки.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Лицо врача в кадре — сюда направлены наезды
const FACE = {cx: 600, cy: 640};

// Стыки нарезки: на каждом плавный наезд или отъезд, чтобы скачок кадра не был заметен
const CUTS = [2.45, 4.1, 4.87, 5.93, 12.6, 19.44, 19.97];

// Хук: «Один и тот же имплант смотрится по-разному» — вопрос без ответа держит до конца
const HOOK = {at: 0.1, lock: 1.6, until: 2.55, top: 1000};

// Синяя сцена: стакан 300 мл раздваивается на двух девушек
const BLUE = {from: 14.85, to: 19.55};

const CAPTION_OFF = [
  [0, 2.6],
  [23.2, 99],
];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.12 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 8], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1 : interpolate(k, [0, 1], [scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 6], [0, 0.025], {extrapolateRight: 'clamp'});
  // Хук: две полупрозрачные копии кадра расходятся и сходятся в одну — «один, но разный»
  const ghost = interpolate(frame, [0, 1.3 * fps], [1, 0], {...clamp, easing: EASE.inOut});
  const style = (dx: number, opacity: number) => ({
    position: 'absolute' as const,
    width: 1080,
    height: 1920,
    transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`,
    scale: String(base + drift),
    translate: `${dx}px 0px`,
    opacity,
  });
  return (
    <AbsoluteFill>
      <Video src={staticFile('source.mp4')} muted style={style(0, 1)} />
      {ghost > 0 ? (
        <>
          <Video src={staticFile('source.mp4')} muted style={style(-90 * ghost, 0.4 * ghost)} />
          <Video src={staticFile('source.mp4')} muted style={style(90 * ghost, 0.4 * ghost)} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// Мягкая вспышка, когда заголовок хука «расшифровался»
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame - Math.round(HOOK.lock * fps);
  return <AbsoluteFill style={{backgroundColor: COLORS.beige, opacity: s >= 0 ? interpolate(s, [0, 6], [0.22, 0], clamp) : 0}} />;
};

// «ПОЧЕМУ?» под заголовком хука — мягко пульсирует
const Why: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round(HOOK.lock * fps);
  const v = Math.min(interpolate(frame, [a, a + 8], [0, 1], clamp), interpolate(frame, [HOOK.until * fps - 7, HOOK.until * fps], [1, 0], clamp));
  return (
    <div
      style={{
        position: 'absolute',
        top: HOOK.top + 150,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONTS.mono,
        fontWeight: 500,
        fontSize: 30,
        letterSpacing: '0.3em',
        color: COLORS.beige,
        textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        opacity: v * (0.75 + 0.25 * Math.sin(frame / 4)),
      }}
    >
      ПОЧЕМУ?
    </div>
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

// Синяя сцена: один объём — разный результат
const BlueBeaker: React.FC = () => {
  const local = (abs: number) => abs - BLUE.from;
  const end = BLUE.to - BLUE.from;
  return (
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(ellipse 70% 40% at 50% 34%, rgba(248,240,229,0.12), rgba(8,32,82,0) 70%)'}}>
      <div
        style={{
          position: 'absolute',
          top: 270,
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
        ОДИН ОБЪЁМ
      </div>
      <MetalTitle at={local(15.14)} until={end} lines={['Разный результат']} size={64} top={315} />
      <BeakerSplit fillAt={local(15.0)} splitAt={local(17.12)} top={500} />
    </AbsoluteFill>
  );
};

// Звуки: расшифровка — щелчки, удар и блеск на заголовке, свуш на заливке, «поп» на появлениях
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  const sfx = (name: string, at: number, volume: number, dur = 0.8) => (
    <Sequence key={`${name}${at}`} name={`SFX ${name}`} from={Math.round(at * fps)} durationInFrames={Math.round(dur * fps)}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
  return (
    <>
      {sfx('whoosh', 0, 0.2, 0.6)}
      {[0.2, 0.45, 0.7, 0.95, 1.2, 1.45].map((at) => sfx('key', at, 0.14, 0.1))}
      {sfx('impact', HOOK.lock, 0.25)}
      {[HOOK.lock, 15.14, 23.2].map((at) => sfx('shimmer', at, 0.45, 1.1))}
      {[BLUE.from, BLUE.to - 0.45].map((at) => sfx('whoosh', at, 0.22, 0.6))}
      {[2.7, 2.86, 5.04, 6.56, 9.4, 10.72, 13.68, 17.12, 20.78, 22.58].map((at) => sfx('pop', at, 0.1, 0.2))}
    </>
  );
};

export const Implant: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <Flash />
      <ProgressBar />
      <TopTags tags={['ЭКСПЕРТ', 'ПЛАСТИЧЕСКАЯ ХИРУРГИЯ', 'ИМПЛАНТЫ']} />

      {/* Хук */}
      <DecodeTitle at={HOOK.at} until={HOOK.until} lines={['Один и тот же имплант', 'смотрится по-разному']} size={58} top={HOOK.top} />
      <Why />

      <ChipRow
        at={2.86}
        until={5.95}
        top={1230}
        chips={[
          {text: '3 размер', at: 2.86},
          {text: 'не всем подходит', at: 5.04, strong: true},
        ]}
      />

      <FactorList
        at={6.5}
        until={12.55}
        top={1200}
        rows={[
          {text: 'анатомия грудной клетки', at: 6.56},
          {text: 'молочная железа', at: 9.4},
          {text: 'покровные ткани', at: 10.72},
        ]}
      />
      <ChipRow at={13.6} until={14.75} top={1230} chips={[{text: 'имплант именно вам', at: 13.68, strong: true}]} />

      <Sequence name="Синяя сцена: стакан 300 мл" from={Math.round(BLUE.from * fps)} durationInFrames={Math.round((BLUE.to - BLUE.from) * fps)}>
        <LiquidReveal until={BLUE.to - BLUE.from}>
          <BlueBeaker />
        </LiquidReveal>
      </Sequence>

      <ChipRow
        at={20.7}
        until={23.1}
        top={1230}
        chips={[
          {text: 'анатомия', at: 20.78},
          {text: 'пожелания', at: 22.58, strong: true},
        ]}
      />
      <MetalTitle at={23.2} until={24.6} lines={['Подбираем', 'под вас']} size={64} top={1000} />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>

      <Audio src={staticFile('source.mp4')} />
      {/* Музыка: спокойная подложка, тише голоса; в последнюю секунду затихает */}
      <Audio
        src={staticFile('music/calm_pad.wav')}
        volume={(f) => 1.8 * interpolate(f, [durationInFrames - fps, durationInFrames - 1], [1, 0], clamp)}
      />
      <SoundEffects />
    </AbsoluteFill>
  );
};
