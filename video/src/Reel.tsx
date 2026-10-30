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
import {Captions} from './components/Captions';
import {LogoHit, VoiceWave} from './components/Overlays';
import {DotGrid, Reveal, TopicPill} from './components/ui';
import {fontsLoaded} from './design/fonts';
import {COLORS, LAYOUT, PANEL_HEIGHT, SPLIT_SOURCE_Y} from './design/tokens';
import {Coffee, Compress, FirstDays, Stitches, Therapy} from './scenes/Sections';
import {SECTIONS, SPLIT_EDGES, useSplit} from './timeline';

// Удар с названием операции — на слове «блефаропластику»
const HIT_AT = 2.7;
const HIT_HOLD = 1.3;

// Моменты появления заголовков — под них щелчок
const TITLE_TICKS = [7.68, 12.0, 16.58, 23.82, 33.56, 40.26];

// Видео: на весь кадр или съезжает в нижнюю половину; на каждом разделе — резкая
// смена крупности (крупнее на панели), внутри раздела — медленный наезд.
const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const split = useSplit();
  const section = SECTIONS.findIndex((s) => t >= s.start && t < s.end);
  const sectionStart = SECTIONS[Math.max(0, section)].start;
  const punch = t >= HIT_AT && t < HIT_AT + 1.66 ? 0.08 : 0;
  const baseScale = section % 2 === 1 ? 1.1 : 1;
  const drift = interpolate(t - sectionStart, [0, 12], [0, 0.04], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{translate: `0px ${split * (PANEL_HEIGHT - SPLIT_SOURCE_Y)}px`}}>
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

// Затемнение снизу под субтитрами, когда видео на весь кадр
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

// Бежевая панель съезжает сверху и уезжает обратно; шов растушёван в видео
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

// Звуки эффектов: свуш на смене режима, удар + блеск на названии, щелчок на заголовках
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      <Sequence name="SFX удар" from={Math.round(HIT_AT * fps)} durationInFrames={Math.round(1.2 * fps)}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.3} />
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.8} />
      </Sequence>
      {SPLIT_EDGES.map((at) => (
        <Sequence key={`w${at}`} name="SFX свуш" from={Math.round(at * fps)} durationInFrames={Math.round(0.6 * fps)}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
      {TITLE_TICKS.map((at) => (
        <Sequence key={`t${at}`} name="SFX щелчок" from={Math.round(at * fps)} durationInFrames={Math.round(0.2 * fps)}>
          <Audio src={staticFile('sfx/tick.wav')} volume={0.18} />
        </Sequence>
      ))}
    </>
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
      <Sequence name="Плашка темы" durationInFrames={Math.round(7.05 * fps)}>
        <AbsoluteFill style={{top: 96, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
          <Reveal at={0.1} until={7.05}>
            <TopicPill onVideo />
          </Reveal>
        </AbsoluteFill>
      </Sequence>
      <Sequence name="Удар: блефаропластика" from={Math.round(HIT_AT * fps)} durationInFrames={Math.round((HIT_HOLD + 0.5) * fps)}>
        <LogoHit text="Блефаропластика" holdUntil={HIT_HOLD} />
      </Sequence>
      <Sequence name="02 Кофе" from={Math.round(16.5 * fps)} durationInFrames={Math.round(5.95 * fps)}>
        <Coffee duration={5.95} />
      </Sequence>
      <Sequence name="04 Швы" from={Math.round(33.3 * fps)} durationInFrames={Math.round(5 * fps)}>
        <Stitches duration={5} />
      </Sequence>
      <Panel>
        <Sequence name="01 Первые дни" from={Math.round(7.44 * fps)} durationInFrames={Math.round(9.06 * fps)}>
          <FirstDays duration={9.06} />
        </Sequence>
        <Sequence name="03 Компрессы" from={Math.round(22.45 * fps)} durationInFrames={Math.round(10.85 * fps)}>
          <Compress duration={10.85} />
        </Sequence>
        <Sequence name="05 Терапия" from={Math.round(38.3 * fps)} durationInFrames={Math.round(12.07 * fps)}>
          <Therapy duration={13} />
        </Sequence>
      </Panel>
      <Captions />
      <SoundEffects />
    </AbsoluteFill>
  );
};
