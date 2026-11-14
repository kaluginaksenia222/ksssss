import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, continueRender, delayRender, Freeze, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';

const stolzlLoaded = loadFont({family: 'Stolzl', url: staticFile('stolzl/Stolzl-Bold.ttf'), weight: '700'});
import {COLORS, EASE} from '../design/tokens';
import {loadFont} from '@remotion/fonts';
import {FinalTitle, Silhouette, STOLZL, StrikeHook, ThreeTypes} from './lipo2';
import {PAGES} from './transcript2';
import {InstagramHandle} from './ui';

// Версия 2 — по нарезке заказчика (порядок фраз её). Стыки сглажены по звуку (scripts/smooth_seams.py),
// лёгкая музыка фоном, звуков на анимациях нет — только зум-хук в начале со звуком.
// Шрифт — Stolzl (заглавные в заголовках), субтитры все с маленькой буквы. Всё по центру кадра, в рабочей зоне Reels.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// стыки нарезки заказчика (по картинке); смена крупности на каждом, кроме слишком частых
const ALL_CUTS = [4.3, 8.4, 11.83, 15.67, 38.57, 42.07, 47.83, 48.67];
const CUTS = ALL_CUTS.reduce<number[]>((acc, c) => (c - (acc[acc.length - 1] ?? 0) >= 2.5 ? [...acc, c] : acc), []);
const HOOK_END = 4.2;
export const LIPO2_SECONDS = 60.2;
const FINAL_AT = 57.8; // после «будем его убирать»
const VIDEO_END = 59.8; // дальше — стоп-кадр
const ANIM_TOP = 1080;
const CAPTION_TOP = 950;
const FACE = {cx: 490, cy: 650};

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.1 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 10], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1.0 : interpolate(k, [0, 1], [idx === 1 ? 1.0 : scaleOf(idx - 1), scaleOf(idx)]);
  // зум-хук: кадр начинается с крупного плана лица и резко отъезжает (0 → 0,45 с), затем короткий толчок
  const zoom = interpolate(frame, [0, 0.45 * fps], [0.55, 0], {...clamp, easing: EASE.out});
  const blur = interpolate(frame, [0, 0.3 * fps], [1.5, 0], clamp);
  const drift = interpolate(t - cutAt, [0, 8], [0, 0.03], {extrapolateRight: 'clamp'});
  const punch = interpolate(frame, [1.0 * fps, 1.06 * fps, 1.45 * fps], [0, 0.04, 0], clamp);
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source2.mp4')}
        muted
        style={{position: 'absolute', width: 1080, height: 1920, transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`, scale: String(base + drift + punch + zoom), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}
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
    <div style={{position: 'absolute', top: CAPTION_TOP, left: 100, right: 100, textAlign: 'center', fontFamily: STOLZL, fontWeight: 700, fontSize: 34, color: COLORS.white, textTransform: 'lowercase', textShadow: '0 2px 10px rgba(0, 0, 0, 0.85), 0 0 3px rgba(0,0,0,0.6)'}}>
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
      <Audio src={staticFile('source2.mp4')} />
      <Audio src={staticFile('music/warm_keys_90.wav')} volume={(f) => 0.22 * interpolate(f, [durationInFrames - 1.2 * fps, durationInFrames - 1], [1, 0], clamp) * interpolate(f, [FINAL_AT * fps, (FINAL_AT + 0.4) * fps], [1, 1.5], clamp)} />
      {/* единственные звуки — зум-хук в начале */}
      {sfx('whoosh', 0, 0.2, 0.6)}
      {sfx('impact', 0.35, 0.22, 1.0)}
    </>
  );
};

export const LipoReel2: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    Promise.all([fontsLoaded, stolzlLoaded]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#0A0F1E'}}>
      <FootageWithHold />
      <Flash at={0.35} strength={0.35} />

      {/* все анимации — в одном месте, по центру кадра */}
      <StrikeHook until={HOOK_END} top={ANIM_TOP} strikeAt={1.0} />
      <Silhouette at={9.8} zonesAt={13.94} goneAt={16.5} until={18.9} top={ANIM_TOP - 10} />
      <ThreeTypes
        slotsAt={22.5}
        items={[
          {title: 'Ручная', at: 24.46},
          {title: 'Вибрационная', at: 32.32},
          {title: 'Ультразвуковая', at: 41.44},
        ]}
        activeUntil={[31.4, 40.2, 48.8]}
        todayAt={49.98}
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
