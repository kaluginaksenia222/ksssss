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
import {Blinds, DayCounter, FadingScar, LowScar, OutlineFillTitle, ProcedureList, StitchesOff, SwellingBubble, WarmFlash} from './fresh';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «16 сутки после абдоминопластики». Врач и пациентка в кадре.
// Лица слева вверху (пациентка) и справа по центру (врач), живот слева в середине —
// поэтому элементы справа вверху (на зеркале), заголовки и субтитры ниже живота.
// Время — секунды нарезки (cuts.json).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const CUTS = [7.79, 14.07, 15.93, 19.99];
const HOOK_END = 2.55;
const BLUE = {from: 14.25, to: 19.3};
export const DAY16_SECONDS = 23.3;
const CAPTION_TOP = 1560;
const CAPTION_OFF = [
  [0, HOOK_END],
  [3.4, 5.65], // список процедур
  [12.6, 14.15], // заголовок «будет естественно»
  [BLUE.from + 0.2, BLUE.to - 0.2],
  [20.9, 99], // «противорубцовая терапия» на плашке
];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.08 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 12], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1 : interpolate(k, [0, 1], [scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 7], [0, 0.025], {extrapolateRight: 'clamp'});
  // хук: кадр влетает из приближения с размытием
  const fly = interpolate(frame, [0, 0.55 * fps], [0, 1], {...clamp, easing: EASE.out});
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{
          width: 1080,
          height: 1920,
          transformOrigin: '50% 40%',
          scale: String(base + drift + (1 - fly) * 0.28),
          filter: fly < 1 ? `blur(${(1 - fly) * 14}px)` : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

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
    <div style={{position: 'absolute', top: CAPTION_TOP, left: 64, right: 64, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 400, fontSize: 46, color: COLORS.white, textShadow: '0 2px 14px rgba(0, 0, 0, 0.6)'}}>
      {PAGES[index].words.map((word, wi) => {
        const st = Math.round(word.start * fps);
        return (
          <span
            key={`${index}-${wi}`}
            style={{
              display: 'inline-block',
              margin: '0 0.14em',
              opacity: interpolate(frame, [st, st + 5], [0, 1], {...clamp, easing: EASE.out}),
              scale: String(interpolate(frame, [st, st + 6], [0.92, 1], {...clamp, easing: EASE.out})),
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

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
      <Audio src={staticFile('music/calm_pad_45.wav')} volume={(f) => interpolate(f, [durationInFrames - 1.2 * fps, durationInFrames - 1], [1, 0], clamp)} />
      {sfx('impact', 0.02, 0.22, 1.0)}
      {sfx('shimmer', 1.0, 0.22, 1.1)}
      {[3.52, 4.83].map((at) => sfx('pop', at, 0.06, 0.2))}
      {sfx('tick', 7.0, 0.06, 0.3)}
      {[BLUE.from, BLUE.to - 0.5].map((at) => sfx('whoosh', at, 0.09, 0.6))}
      {sfx('pop', BLUE.from + 2.57, 0.05, 0.2)}
      {sfx('pop', 20.4, 0.05, 0.2)}
    </>
  );
};

export const Day16: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <WarmFlash at={0.05} />

      <DayCounter at={0.15} until={HOOK_END} top={1290} />
      <ProcedureList items={[{text: 'Абдоминопластика', at: 3.52}, {text: 'Липосакция боков', at: 4.83}]} until={5.75} top={250} />
      <StitchesOff at={6.0} offAt={7.0} until={8.1} top={260} />
      <SwellingBubble at={8.9} shrinkAt={12.18} until={13.0} top={230} />
      <OutlineFillTitle at={12.7} until={14.15} text="Будет естественно" top={1330} />

      <Sequence name="Синяя сцена: рубец ниже белья" from={Math.round(BLUE.from * fps)} durationInFrames={Math.round((BLUE.to - BLUE.from) * fps)}>
        <Blinds until={BLUE.to - BLUE.from}>
          <LowScar scarAt={0.55} lineAt={1.8} tapeAt={2.57} titleAt={2.0} />
        </Blinds>
      </Sequence>

      <FadingScar at={20.3} until={DAY16_SECONDS} top={260} />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
