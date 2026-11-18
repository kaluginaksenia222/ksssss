import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, continueRender, delayRender, Freeze, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE} from '../design/tokens';
import {BrowStory, Final, LineHook, Rarely, STOLZL} from './brows';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Мужской взгляд: эндоскопия бровей — редко». Врач в студии, паузы и «э-э» вырезаны.
// Лёгкая музыка; звук только у зум-хука. Шрифт Stolzl, субтитры с маленькой буквы, всё по центру,
// анимации — одна схема глаз в одном месте. Время — секунды нарезки (cuts.json).

const stolzlLoaded = loadFont({family: 'Stolzl', url: staticFile('stolzl/Stolzl-Bold.ttf'), weight: '700'});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FACE = {cx: 530, cy: 680};
const EYES = {cx: 530, cy: 640}; // зум-хук начинается с крупного плана глаз
const ALL_CUTS = [8.77, 10.63, 13.33, 13.5, 17.97, 19.83, 24.63, 25.1, 25.27, 25.67, 26.27, 29.83];
const CUTS = ALL_CUTS.reduce<number[]>((acc, c) => (c - (acc[acc.length - 1] ?? 0) >= 2.5 ? [...acc, c] : acc), []);
const HOOK_END = 5.9;
const FINAL_AT = 31.1; // после «в своей практике»
const VIDEO_END = 31.83;
export const BROWS_SECONDS = 33.6;
const ANIM_TOP = 1080;
const CAPTION_TOP = 1010;

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 10], [0, 1], {...clamp, easing: EASE.inOut});
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.1 : 1);
  const base = idx === 0 ? 1 : interpolate(k, [0, 1], [scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 10], [0, 0.03], {extrapolateRight: 'clamp'});
  // зум-хук: старт с крупного плана глаз, резкий отъезд (0 → 0,5 с)
  const z = interpolate(frame, [0, 0.5 * fps], [1, 0], {...clamp, easing: EASE.out});
  const ox = FACE.cx + (EYES.cx - FACE.cx) * z;
  const oy = FACE.cy + (EYES.cy - FACE.cy) * z;
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{
          position: 'absolute',
          width: 1080,
          height: 1920,
          transformOrigin: `${(ox / 1080) * 100}% ${(oy / 1920) * 100}%`,
          scale: String(base + drift + z * 1.0),
          filter: z > 0.05 ? `blur(${z * 2}px)` : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

const FootageWithHold: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const last = Math.round(VIDEO_END * fps) - 2;
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
    const end = page.words[page.words.length - 1].end;
    const from = page.words[0].start - 0.05;
    const to = next ? Math.min(next.words[0].start - 0.05, end + 0.6) : end + 0.5;
    return t >= from && t < to;
  });
  if (index === -1) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top: CAPTION_TOP, left: 100, right: 100, textAlign: 'center', fontFamily: STOLZL, fontWeight: 700, fontSize: 34, color: COLORS.white, textShadow: '0 2px 10px rgba(0, 0, 0, 0.85), 0 0 3px rgba(0,0,0,0.6)'}}>
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
      {/* единственные звуки — зум-хук в начале */}
      {sfx('whoosh', 0, 0.2, 0.6)}
      {sfx('impact', 0.4, 0.22, 1.0)}
    </>
  );
};

export const BrowsReel: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    Promise.all([fontsLoaded, stolzlLoaded]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#0A0F1E'}}>
      <FootageWithHold />
      <Flash at={0.4} strength={0.35} />

      {/* все анимации — в одном месте, по центру кадра */}
      <LineHook until={HOOK_END} top={ANIM_TOP} lines={['ПОЧЕМУ МУЖЧИНАМ', 'НЕ ПОДНИМАЮТ', 'БРОВИ']} />
      <BrowStory at={6.0} lowAt={8.76} skinAt={12.85} blephAt={16.86} liftAt={18.68} openAt={21.42} maleAt={23.78} until={25.2} top={ANIM_TOP - 20} />
      <Rarely at={25.3} rareAt={26.4} until={FINAL_AT} top={ANIM_TOP} />
      <Final at={FINAL_AT} top={ANIM_TOP + 30} line="МУЖСКОЙ ВЗГЛЯД" sub="сохраняем, а не меняем" />

      <Captions />
      <AbsoluteFill style={{top: 1440, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
