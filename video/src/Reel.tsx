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
import {fontsLoaded} from './design/fonts';
import {COLORS, LAYOUT, PANEL_HEIGHT, SPLIT_SOURCE_Y} from './design/tokens';
import {Hook, PanelTitle, VideoTitle} from './scenes/Sections';
import {SECTIONS, SPLITS, SPLIT_EDGES, useSplit} from './timeline';

// Хук держится до перехода к первому совету
const HOOK_UNTIL = 7.0;
const HOOK_IN = 0.5;

// Белые заголовки поверх видео (секунды, по расшифровке голоса)
const VIDEO_TITLES = [
  {from: 7.68, until: 11.9, text: 'Первые 2–3 дня'},
  {from: 12.0, until: 16.35, text: '2 недели\nбез нагрузок'},
  {from: 16.58, until: 22.3, text: 'Без кофе'},
  {from: 33.56, until: 38.2, text: 'Швы — на 6–7 сутки'},
];

// Видео: на весь кадр или съезжает в нижнюю половину; на каждом разделе — резкая
// смена крупности (крупнее на панели), внутри раздела — медленный наезд.
const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const split = useSplit();
  const section = SECTIONS.findIndex((s) => t >= s.start && t < s.end);
  const sectionStart = SECTIONS[Math.max(0, section)].start;
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
          scale: String(baseScale + drift),
        }}
      />
    </AbsoluteFill>
  );
};

// Затемнение снизу, чтобы белые субтитры читались
const BottomShade: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)'}} />
);

// Белая панель съезжает сверху и уезжает обратно; шов растушёван в видео
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
      <div style={{position: 'absolute', inset: 0, bottom: LAYOUT.seamFade, backgroundColor: COLORS.white}} />
      <div
        style={{
          position: 'absolute',
          top: PANEL_HEIGHT,
          left: 0,
          right: 0,
          height: LAYOUT.seamFade,
          background: `linear-gradient(to bottom, ${COLORS.white}, rgba(255, 255, 255, 0))`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// Звуки эффектов: блеск на хуке, свуш на смене режима, щелчок на заголовках
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      <Sequence name="SFX хук" from={Math.round(HOOK_IN * fps)} durationInFrames={Math.round(1.2 * fps)}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.2} />
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.7} />
      </Sequence>
      {SPLIT_EDGES.map((at) => (
        <Sequence key={`w${at}`} name="SFX свуш" from={Math.round(at * fps)} durationInFrames={Math.round(0.6 * fps)}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
      {VIDEO_TITLES.map(({from}) => (
        <Sequence key={`t${from}`} name="SFX щелчок" from={Math.round(from * fps)} durationInFrames={Math.round(0.2 * fps)}>
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
      <Sequence name="Хук" durationInFrames={Math.round(HOOK_UNTIL * fps)}>
        <Hook until={HOOK_UNTIL} />
      </Sequence>
      {VIDEO_TITLES.map(({from, until, text}) => (
        <Sequence key={from} name={text.replace('\n', ' ')} from={Math.round(from * fps)} durationInFrames={Math.round((until - from) * fps)}>
          <VideoTitle until={until - from}>{text}</VideoTitle>
        </Sequence>
      ))}
      <Panel>
        <Sequence name="Холодные компрессы" from={Math.round(SPLITS[0].in * fps)}>
          <PanelTitle at={0.3} until={SPLITS[0].out - SPLITS[0].in}>
            Холодные компрессы
          </PanelTitle>
        </Sequence>
        <Sequence name="Фотодинамическая терапия" from={Math.round(SPLITS[1].in * fps)}>
          <PanelTitle at={0.3} until={SPLITS[1].out - SPLITS[1].in}>
            Фотодинамическая терапия
          </PanelTitle>
        </Sequence>
      </Panel>
      <Captions />
      <SoundEffects />
    </AbsoluteFill>
  );
};
