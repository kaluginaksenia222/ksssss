import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS} from '../design/tokens';
import {CapsuleHook, DecisionTree, PillTimeline, PollSticker, SAFE, SelfLoop} from './pills';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Антидепрессанты и операция». Врач сидит по центру на красном фоне.
// Всё — в рабочей зоне Reels (маска заказчика). Лицо сверху по центру → элементы рядом с лицом
// по бокам (не шире 270 px), крупные — в зелёной зоне на футболке; субтитры маленькие под головой.
// Время — секунды нарезки (cuts.json).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FACE = {cx: 530, cy: 690};
// стыки нарезки; смену крупности делаем не чаще раза в 2,5 с, чтобы кадр не дёргался
const ALL_CUTS = [1.23, 2.72, 3.94, 7.66, 7.97, 9.49, 9.61, 12.71, 19.66, 19.8, 22.02, 27.7, 29.35, 30.77, 33.29, 35.94, 43.97, 46.05, 49.55, 52.9, 54.21, 54.5, 55.2, 55.31, 55.87, 56.63];
const CUTS = ALL_CUTS.reduce<number[]>((acc, c) => (c - (acc[acc.length - 1] ?? 0) >= 2.5 ? [...acc, c] : acc), []);
const HOOK_END = 2.85;
const BANG = 2.14; // «операцию?»
export const MEDS_SECONDS = 58.8;
const CAPTION_TOP = 950;
const ANIM_TOP = 1090;
// субтитры — весь ролик, без пропусков

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
  const whip = 1;
  const pull = interpolate(frame, [1.0 * fps, 1.3 * fps], [0, 1], {...clamp, easing: EASE.inOut});
  const close = (1 - pull) * (0.42 + interpolate(frame, [0, 1.0 * fps], [0, 0.05], clamp));
  const gray = 1 - interpolate(frame, [1.05 * fps, 1.35 * fps], [0, 1], clamp);
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
          scale: String(base + drift + punch + close),
          translate: `${(1 - whip) * 520}px 0px`,
          filter: [hb > 0.5 ? 'url(#hblur)' : '', gray > 0.01 ? `grayscale(${gray}) contrast(${1 + gray * 0.15})` : ''].join(' ').trim() || undefined,
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
      {/* звуков вдвое меньше: только хук и по одному на каждую анимацию */}
      {sfx('impact', 0, 0.22, 1.0)}
      {sfx('shimmer', 0.55, 0.16, 1.1)}
      {sfx('whoosh', 1.0, 0.14, 0.6)}
      {sfx('tick', 7.86, 0.06, 0.3)}
      {sfx('tick', 18.3, 0.05, 0.3)}
      {sfx('pop', 21.54, 0.05, 0.2)}
      {sfx('whoosh', 39.08, 0.06, 0.6)}
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
      <Flash at={0} strength={0.3} />
      <Flash at={0.55} strength={0.3} />
      <Flash at={BANG} strength={0.25} />

      {/* все анимации — в одном месте: по центру на футболке (зелёная зона маски), top 1090 */}
      <CapsuleHook until={HOOK_END + 0.1} top={ANIM_TOP} landAt={0.4} openAt={0.55} tailAt={1.05} />
      <PollSticker at={2.95} answerAt={7.86} until={9.3} top={ANIM_TOP} />
      <DecisionTree
        rootAt={21.2}
        leaves={[
          {text: 'перенести операцию', at: 22.22},
          {text: 'отменить препараты', at: 23.64},
          {text: 'оперировать на препаратах', at: 25.88},
        ]}
        until={30.3}
        top={ANIM_TOP}
      />
      <SelfLoop at={14.6} until={19.9} x={SAFE.left + (SAFE.lowRight - SAFE.left - 270) / 2} y={ANIM_TOP - 10} />
      <PillTimeline at={38.0} offAt={39.08} backAt={42.66} until={44.1} top={ANIM_TOP} />

      <Captions />
      <AbsoluteFill style={{top: 1440, left: SAFE.left, right: 1080 - SAFE.lowRight, width: 'auto', height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
