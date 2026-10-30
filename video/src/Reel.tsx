import React, {useEffect, useState} from 'react';
import {Video} from '@remotion/media';
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
import {Captions} from './components/Captions';
import {LogoHit, TimelineBar, VoiceWave} from './components/Overlays';
import {DotGrid, TopicPill} from './components/ui';
import {fontsLoaded} from './design/fonts';
import {COLORS, DUR, EASE, LAYOUT, PANEL_HEIGHT, SPLIT_SOURCE_Y} from './design/tokens';
import {Coffee, Compress, FirstDays, Stitches, Therapy} from './scenes/Sections';

// Разделы ролика (секунды) — по расшифровке голоса
const SECTIONS = [
  {start: 0, end: 7.44},
  {start: 7.44, end: 16.5},
  {start: 16.5, end: 22.56},
  {start: 22.56, end: 33.3},
  {start: 33.3, end: 38.4},
  {start: 38.4, end: 50.37},
];

// Переход A → B (полный экран → сплит)
const SPLIT_START = 7.05;
const SPLIT_AT = 7.42;
// Удар с названием операции — на слове «блефаропластику»
const HIT_AT = 2.7;
const HIT_HOLD = 1.3;

// Прогресс перехода в сплит, 0 — полный экран, 1 — сплит
const useSplit = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.round(SPLIT_START * fps);
  return interpolate(frame, [s, s + DUR.modeSwitch], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.inOut,
  });
};

// Видео: в режиме A на весь кадр с медленным зумом и панч-ином на ударе,
// в режиме B съезжает в нижнюю половину; на каждом разделе — резкая смена крупности.
const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const split = useSplit();
  const section = SECTIONS.findIndex((s) => t >= s.start && t < s.end);
  const sectionStart = SECTIONS[Math.max(0, section)].start;
  const punch = t >= HIT_AT && t < HIT_AT + 1.66 ? 0.08 : 0;
  const baseScale = section > 0 && section % 2 === 0 ? 1.1 : 1;
  const drift = interpolate(t - sectionStart, [0, 12], [0, 0.04], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        translate: `0px ${split * (PANEL_HEIGHT - SPLIT_SOURCE_Y)}px`,
      }}
    >
      <Video
        src={staticFile('source.mp4')}
        style={{
          width: LAYOUT.width,
          height: LAYOUT.height,
          transformOrigin: '50% 40%',
          scale: String(baseScale + punch + drift),
        }}
      />
    </AbsoluteFill>
  );
};

// Затемнение снизу под субтитрами режима A
const BottomShade: React.FC = () => {
  const split = useSplit();
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)',
        opacity: 1 - split,
      }}
    />
  );
};

// Режим A: таймлайн сверху, гаснет перед переходом
const ModeAOverlay: React.FC = () => {
  const split = useSplit();
  if (split >= 1) {
    return null;
  }
  return (
    <AbsoluteFill style={{opacity: 1 - split, filter: `blur(${split * 6}px)`}}>
      <TimelineBar sections={SECTIONS} />
    </AbsoluteFill>
  );
};

// Режим B: бежевая панель съезжает сверху, шов растушёван в видео
const Panel: React.FC<{children: React.ReactNode}> = ({children}) => {
  const split = useSplit();
  if (split <= 0) {
    return null;
  }
  return (
    <AbsoluteFill
      style={{
        bottom: 'auto',
        height: PANEL_HEIGHT + LAYOUT.seamFade,
        translate: `0px ${(split - 1) * (PANEL_HEIGHT + LAYOUT.seamFade)}px`,
      }}
    >
      <DotGrid style={{bottom: LAYOUT.seamFade}} />
      <div
        style={{
          position: 'absolute',
          top: PANEL_HEIGHT,
          left: 0,
          right: 0,
          height: LAYOUT.seamFade,
          background: `linear-gradient(to bottom, ${COLORS.beige}, rgba(248, 240, 229, 0))`,
        }}
      />
      <div style={{position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <TopicPill />
      </div>
      {children}
      <VoiceWave top={PANEL_HEIGHT - 100} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <BottomShade />
      <ModeAOverlay />
      <Sequence name="Удар: блефаропластика" from={Math.round(HIT_AT * fps)} durationInFrames={Math.round((HIT_HOLD + 0.5) * fps)}>
        <LogoHit text="Блефаропластика" holdUntil={HIT_HOLD} />
      </Sequence>
      <Panel>
        <Sequence name="01 Первые дни" from={Math.round(7.44 * fps)} durationInFrames={Math.round(9.06 * fps)}>
          <FirstDays duration={9.06} />
        </Sequence>
        <Sequence name="02 Кофе" from={Math.round(16.5 * fps)} durationInFrames={Math.round(6.06 * fps)}>
          <Coffee duration={6.06} />
        </Sequence>
        <Sequence name="03 Компрессы" from={Math.round(22.56 * fps)} durationInFrames={Math.round(10.74 * fps)}>
          <Compress duration={10.74} />
        </Sequence>
        <Sequence name="04 Швы" from={Math.round(33.3 * fps)} durationInFrames={Math.round(5.1 * fps)}>
          <Stitches duration={5.1} />
        </Sequence>
        <Sequence name="05 Терапия" from={Math.round(38.4 * fps)} durationInFrames={Math.round(11.97 * fps)}>
          <Therapy duration={11.97 + 1} />
        </Sequence>
      </Panel>
      <Captions splitAt={SPLIT_AT} />
    </AbsoluteFill>
  );
};
