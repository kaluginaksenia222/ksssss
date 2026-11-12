import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS} from '../design/tokens';
import {DecisionTree, LensCheck, MixCircles, PillHook, PillTimeline, PollSticker, SAFE, SelfLoop, SwingBadge} from './pills';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Антидепрессанты и операция». Врач сидит по центру на красном фоне.
// Всё — в рабочей зоне Reels (маска заказчика). Лицо сверху по центру → элементы рядом с лицом
// по бокам (не шире 270 px), крупные — в зелёной зоне на футболке; субтитры маленькие под головой.
// Время — секунды нарезки (cuts.json).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FACE = {cx: 530, cy: 690};
const CUTS = [2.86, 8.86, 10.38, 21.18, 23.86, 33.5, 36.02];
const HOOK_END = 2.9;
const BANG = 2.26; // «операцию?»
export const MEDS_SECONDS = 47.5;
const CAPTION_TOP = 950;
const CAPTION_OFF = [
  [0, HOOK_END],
  [23.9, 33.3], // дерево решений повторяет речь
  [34.7, 36.0], // бейдж «анестезиолог»
];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.1 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 10], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1.04 : interpolate(k, [0, 1], [idx === 1 ? 1.04 : scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 8], [0, 0.03], {extrapolateRight: 'clamp'});
  // хук: кадр «въезжает» вбок с размытием по горизонтали (whip-pan) и толчок на «операцию»
  const whip = interpolate(frame, [0, 0.32 * fps], [0, 1], {...clamp, easing: EASE.out});
  const punch = interpolate(frame, [BANG * fps, (BANG + 0.07) * fps, (BANG + 0.45) * fps], [0, 0.05, 0], clamp);
  const hb = (1 - whip) * 40;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="hblur" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${hb} 0`} />
        </filter>
      </svg>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{
          position: 'absolute',
          width: 1080,
          height: 1920,
          transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`,
          scale: String(base + drift + punch),
          translate: `${(1 - whip) * 520}px 0px`,
          filter: hb > 0.5 ? 'url(#hblur)' : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

const Flash: React.FC<{at: number; strength?: number}> = ({at, strength = 0.4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + 0.4) * fps], [0, 1], clamp);
  if (p <= 0 || p >= 1) {
    return null;
  }
  return <AbsoluteFill style={{backgroundColor: '#FFF3E6', opacity: (1 - p) ** 3 * strength}} />;
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
    <div style={{position: 'absolute', top: CAPTION_TOP, left: SAFE.left, right: 1080 - SAFE.right, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 400, fontSize: 36, color: COLORS.white, textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'}}>
      {PAGES[index].words.map((word, wi) => {
        const st = Math.round(word.start * fps);
        const v = interpolate(frame, [st, st + 5], [0, 1], {...clamp, easing: EASE.out});
        return (
          <span key={`${index}-${wi}`} style={{display: 'inline-block', margin: '0 0.14em', opacity: v, filter: `blur(${(1 - v) * 3}px)`}}>
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
      <Audio src={staticFile('music/warm_keys_90.wav')} volume={(f) => 0.24 * interpolate(f, [durationInFrames - 1.5 * fps, durationInFrames - 1], [1, 0], clamp)} />
      {sfx('whoosh', 0, 0.18, 0.6)}
      {sfx('pop', 0.35, 0.08, 0.2)}
      {sfx('impact', BANG, 0.28, 1.0)}
      {sfx('shimmer', BANG + 0.2, 0.16, 1.1)}
      {sfx('pop', 3.0, 0.06, 0.2)}
      {sfx('tick', 8.58, 0.07, 0.3)}
      {[11.06, 12.84, 14.54].map((at) => sfx('pop', at, 0.05, 0.2))}
      {sfx('tick', 17.0, 0.05, 0.3)}
      {[23.32, 23.98, 25.42, 27.66].map((at) => sfx('pop', at, 0.05, 0.2))}
      {sfx('whoosh', 34.6, 0.08, 0.6)}
      {[38.14, 39.62].map((at) => sfx('pop', at, 0.05, 0.2))}
      {sfx('whoosh', 42.4, 0.07, 0.6)}
      {sfx('shimmer', 45.96, 0.14, 1.1)}
    </>
  );
};

export const Meds: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#1a0605'}}>
      <Footage />
      <Flash at={BANG} />

      <PillHook until={HOOK_END + 0.1} top={1075} word="антидепрессанты" dropAt={0.35} tailAt={1.5} />
      <PollSticker at={3.0} answerAt={8.58} until={9.6} top={1090} />
      <LensCheck items={[{text: 'препарат', at: 11.06}, {text: 'дозировка', at: 12.84}, {text: 'кто назначил', at: 14.54}]} until={16.2} y={400} />
      <SelfLoop at={16.4} until={21.4} x={SAFE.left} y={420} />
      <DecisionTree
        rootAt={23.0}
        leaves={[
          {text: 'перенести операцию', at: 23.98},
          {text: 'отменить препараты', at: 25.42},
          {text: 'оперировать на препаратах', at: 27.66},
        ]}
        until={33.3}
        top={1090}
      />
      <SwingBadge at={34.6} until={36.1} x={720} />
      <MixCircles aAt={38.14} bAt={39.62} until={41.6} top={1110} />
      <PillTimeline at={41.7} offAt={42.4} backAt={45.96} until={MEDS_SECONDS} top={1110} />

      <Captions />
      <AbsoluteFill style={{top: 1440, left: SAFE.left, right: 1080 - SAFE.lowRight, width: 'auto', height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
