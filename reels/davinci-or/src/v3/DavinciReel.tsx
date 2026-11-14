import React, {useEffect, useState} from 'react';
import {Audio, Video} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, continueRender, delayRender, Freeze, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE} from '../design/tokens';
import {Control, Final, Future, RobotCard, RobotHook, STOLZL, Week, WhatItDoes} from './robot';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Робот da Vinci» — нарезка заказчика (порядок не меняем), стык сглажен по звуку.
// Лёгкая музыка; звук только у зум-хука в начале. Шрифт Stolzl, субтитры с маленькой буквы.
// Всё по центру кадра, в рабочей зоне Reels; анимации — в одном месте (~1080).

const stolzlLoaded = loadFont({family: 'Stolzl', url: staticFile('stolzl/Stolzl-Bold.ttf'), weight: '700'});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FACE = {cx: 580, cy: 680};
const ROBOT = {cx: 930, cy: 600}; // экран робота за спиной — отсюда начинается зум-хук
const CUTS = [13.5];
const HOOK_END = 2.85;
const FINAL_AT = 40.4; // после «каждое движение»
const VIDEO_END = 40.9;
export const DAVINCI_SECONDS = 42.6;
const ANIM_TOP = 1080;
const CAPTION_TOP = 950;

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 10], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1 : interpolate(k, [0, 1], [1, 1.1]);
  const drift = interpolate(t - cutAt, [0, 10], [0, 0.03], {extrapolateRight: 'clamp'});
  // зум-хук: старт с крупного плана экрана робота, резкий отъезд к врачу (0 → 0,5 с)
  const z = interpolate(frame, [0, 0.5 * fps], [1, 0], {...clamp, easing: EASE.out});
  const ox = FACE.cx + (ROBOT.cx - FACE.cx) * z;
  const oy = FACE.cy + (ROBOT.cy - FACE.cy) * z;
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
          scale: String(base + drift + z * 0.8),
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

// Вставки видео робота (заказчик снял отдельно, 7,8 с): куски идут по порядку, голос врача продолжается.
// Мягкое появление и уход (0,2 с) и медленный наезд — без звуков.
const INSERTS = [
  {at: 2.95, from: 0.0, dur: 3.3}, // «сзади меня стоит этот робот да Винчи»
  {at: 11.1, from: 3.3, dur: 2.3}, // «этот робот оперирует урологические операции»
  {at: 20.6, from: 5.6, dur: 2.2}, // «увидеть его… хотя бы просто на него посмотреть»
];

const Insert: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = Math.min(
    interpolate(frame, [0, 0.2 * fps], [0, 1], clamp),
    interpolate(frame, [(dur - 0.2) * fps, dur * fps], [1, 0], clamp),
  );
  const zoom = interpolate(frame, [0, dur * fps], [1.0, 1.06], clamp);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Video src={staticFile('broll_robot.mp4')} muted trimBefore={Math.round(from * fps)} style={{position: 'absolute', width: 1080, height: 1920, scale: String(zoom)}} />
    </AbsoluteFill>
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

export const DavinciReel: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    Promise.all([fontsLoaded, stolzlLoaded]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#0A0F1E'}}>
      <FootageWithHold />
      {INSERTS.map((ins) => (
        <Sequence key={ins.at} name={`Вставка робота ${ins.at}`} from={Math.round(ins.at * 30)} durationInFrames={Math.round(ins.dur * 30)}>
          <Insert from={ins.from} dur={ins.dur} />
        </Sequence>
      ))}
      <Flash at={0.4} strength={0.35} />

      {/* все анимации — в одном месте, по центру кадра */}
      <RobotHook until={HOOK_END} top={ANIM_TOP} />
      <RobotCard at={2.95} until={6.7} top={ANIM_TOP + 20} />
      <WhatItDoes at={7.8} noAt={8.36} yesAt={11.88} until={13.45} top={ANIM_TOP + 10} />
      <Week at={13.6} sunAt={15.16} until={16.7} top={ANIM_TOP} />
      <Future at={26.0} moveAt={29.16} qAt={30.26} until={31.7} top={ANIM_TOP} />
      <Control at={33.0} surgeonAt={35.66} linkAt={37.46} everyAt={39.54} until={FINAL_AT} top={ANIM_TOP} />
      <Final at={FINAL_AT} top={ANIM_TOP + 30} />

      <Captions />
      <AbsoluteFill style={{top: 1440, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
