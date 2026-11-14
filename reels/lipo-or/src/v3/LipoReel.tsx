import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, continueRender, delayRender, Freeze, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS} from '../design/tokens';
import {FinalTitle, Shutter, Silhouette, StrikeHook, ThreeTypes} from './lipo';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Липосакция — не метод похудения»: хирург в операционной перед операцией.
// Хук переставлен в начало. Всё по центру кадра, в рабочей зоне Reels; анимации — в одном месте (~1080),
// субтитры маленькие, чуть ниже головы. Время — секунды нарезки (cuts.json).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FACE = {cx: 490, cy: 650};
const ALL_CUTS = [0.17, 1.81, 1.9, 3.0, 3.39, 7.6, 9.58, 11.69, 12.77, 15.6, 18.43, 18.78, 20.0, 25.08, 29.9, 32.0, 34.42, 35.84, 36.66, 39.21, 41.88, 43.08, 44.69, 46.24, 46.42, 47.02, 49.36, 52.68, 55.0];
const CUTS = ALL_CUTS.filter((c) => c > 2.5).reduce<number[]>((acc, c) => (c - (acc[acc.length - 1] ?? 0) >= 2.8 ? [...acc, c] : acc), []);
const HOOK_END = 3.0;
export const LIPO_SECONDS = 58.5;
const FINAL_AT = 56.4; // после «будем его убирать»
const VIDEO_END = 57.3; // дальше — стоп-кадр под финальный заголовок
const ANIM_TOP = 1080;
const CAPTION_TOP = 950;

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.1 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 10], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1.06 : interpolate(k, [0, 1], [idx === 1 ? 1.06 : scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 8], [0, 0.03], {extrapolateRight: 'clamp'});
  // хук: толчок кадра на «похудения»
  const punch = interpolate(frame, [2.46 * fps, 2.52 * fps, 2.9 * fps], [0, 0.05, 0], clamp);
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{position: 'absolute', width: 1080, height: 1920, transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`, scale: String(base + drift + punch)}}
      />
    </AbsoluteFill>
  );
};

// После конца видео держим последний кадр (стоп-кадр), пока виден финальный заголовок
const FootageWithHold: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const last = Math.round(VIDEO_END * fps) - 1;
  return (
    <Freeze frame={last} active={frame >= last}>
      <Footage />
    </Freeze>
  );
};

const Flash: React.FC<{at: number; strength: number}> = ({at, strength}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + 0.4) * fps], [0, 1], clamp);
  if (p <= 0 || p >= 1) {
    return null;
  }
  return <AbsoluteFill style={{backgroundColor: '#FFF6EA', opacity: (1 - p) ** 3 * strength}} />;
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const index = PAGES.findIndex((page, i) => {
    const next = PAGES[i + 1];
    const from = page.words[0].start - 0.05;
    const to = next ? Math.min(next.words[0].start - 0.05, page.words[page.words.length - 1].end + 0.6) : page.words[page.words.length - 1].end + 0.5;
    return t >= from && t < to;
  });
  if (index === -1) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top: CAPTION_TOP, left: 100, right: 100, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 500, fontSize: 36, color: COLORS.white, textShadow: '0 2px 10px rgba(0, 0, 0, 0.85), 0 0 3px rgba(0,0,0,0.6)'}}>
      {PAGES[index].words.map((word, wi) => {
        const st = Math.round(word.start * fps);
        const v = interpolate(frame, [st, st + 5], [0, 1], {...clamp, easing: EASE.out});
        return (
          <span key={`${index}-${wi}`} style={{display: 'inline-block', margin: '0 0.14em', opacity: v, translate: `0px ${(1 - v) * 8}px`}}>
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
      <Audio src={staticFile('music/warm_keys_90.wav')} volume={(f) => 0.22 * interpolate(f, [durationInFrames - 1.2 * fps, durationInFrames - 1], [1, 0], clamp) * interpolate(f, [FINAL_AT * fps, (FINAL_AT + 0.4) * fps], [1, 1.5], clamp)} />
      {sfx('whoosh', 0.05, 0.16, 0.6)}
      {sfx('impact', 2.46, 0.24, 1.0)}
      {sfx('pop', 9.8, 0.05, 0.2)}
      {sfx('pop', 14.1, 0.04, 0.2)}
      {[21.16, 29.34, 39.8].map((at) => sfx('pop', at, 0.05, 0.2))}
      {sfx('shimmer', 49.04, 0.16, 1.1)}
      {sfx('shimmer', FINAL_AT, 0.18, 1.1)}
    </>
  );
};

export const LipoReel: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#0A0F1E'}}>
      <FootageWithHold />
      <Flash at={0.3} strength={0.3} />
      <Flash at={2.46} strength={0.25} />
      <Shutter />

      {/* все анимации — в одном месте, по центру кадра */}
      <StrikeHook until={HOOK_END + 0.1} top={ANIM_TOP} strikeAt={2.46} />
      <Silhouette at={9.8} zonesAt={14.1} goneAt={17.38} until={18.7} top={ANIM_TOP - 10} />
      <ThreeTypes
        slotsAt={20.1}
        items={[
          {title: 'Ручная', at: 21.16},
          {title: 'Вибрационная', at: 29.34},
          {title: 'Ультразвуковая', at: 39.8},
        ]}
        activeUntil={[28.18, 37.42, 47.5]}
        todayAt={49.04}
        until={FINAL_AT}
        top={ANIM_TOP + 10}
      />
      <FinalTitle at={FINAL_AT} top={ANIM_TOP + 30} />

      <Captions />
      <AbsoluteFill style={{top: 1440, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
