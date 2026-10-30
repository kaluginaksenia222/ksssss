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
import {DotGrid} from './components/ui';
import {fontsLoaded} from './design/fonts';
import {COLORS, LAYOUT, PANEL_HEIGHT, SPLIT_SOURCE_Y} from './design/tokens';
import {Coffee, Compress, FirstDays, Hook, IntroBar, POP_TIMES, Stitches, Therapy, TYPING} from './scenes/Sections';
import {SCENES, SECTIONS, TRANSITIONS, useSplit} from './timeline';

const HOOK_UNTIL = 7.0;
const HOOK_IN = 0.5;

// Видео: на весь кадр или съезжает в нижнюю половину; на каждом разделе — резкая
// смена крупности, внутри раздела — медленный наезд.
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

// Затемнение снизу, чтобы белые субтитры читались на полноэкранном видео
const BottomShade: React.FC = () => {
  const split = useSplit();
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)',
        opacity: 1 - split,
      }}
    />
  );
};

// Бежевая панель с точечной сеткой съезжает сверху; шов растушёван в видео
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
      {children}
    </AbsoluteFill>
  );
};

// Звуки: свуш на хуке и сменах вставок, «поп» на появлениях, клавиши при печати
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  const pops = [
    ...POP_TIMES.firstDays.map((t) => SCENES.firstDays + t),
    ...POP_TIMES.coffee.map((t) => SCENES.coffee + t),
    ...POP_TIMES.compress.map((t) => SCENES.compress + t),
    ...POP_TIMES.stitches.map((t) => SCENES.stitches + t),
    ...POP_TIMES.therapy.map((t) => SCENES.therapy + t),
  ];
  const keys = new Array(TYPING.chars)
    .fill(0)
    .map((_, i) => SCENES.therapy + TYPING.at + i / TYPING.cps)
    .filter((_, i) => i % 2 === 0);
  return (
    <>
      <Sequence name="SFX хук" from={Math.round(HOOK_IN * fps)} durationInFrames={Math.round(1.2 * fps)}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.18} />
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.6} />
      </Sequence>
      {TRANSITIONS.map((at) => (
        <Sequence key={`w${at}`} name="SFX свуш" from={Math.round(at * fps)} durationInFrames={Math.round(0.6 * fps)}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.18} />
        </Sequence>
      ))}
      {pops.map((at) => (
        <Sequence key={`p${at}`} name="SFX поп" from={Math.round(at * fps)} durationInFrames={Math.round(0.2 * fps)}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.14} />
        </Sequence>
      ))}
      {keys.map((at) => (
        <Sequence key={`k${at}`} name="SFX клавиша" from={Math.round(at * fps)} durationInFrames={3}>
          <Audio src={staticFile('sfx/key.wav')} volume={0.12} />
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

  const scene = (from: number, to: number) => ({
    from: Math.round(from * fps),
    durationInFrames: Math.round((to - from) * fps),
  });

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <BottomShade />
      <Sequence name="Верх видео" durationInFrames={Math.round(HOOK_UNTIL * fps)}>
        <IntroBar segments={[0, ...TRANSITIONS]} total={SCENES.end} until={HOOK_UNTIL} />
      </Sequence>
      <Sequence name="Хук" durationInFrames={Math.round(HOOK_UNTIL * fps)}>
        <Hook until={HOOK_UNTIL} />
      </Sequence>
      <Panel>
        <Sequence name="01 Первые дни" {...scene(SCENES.firstDays, SCENES.coffee)}>
          <FirstDays until={SCENES.coffee - SCENES.firstDays} />
        </Sequence>
        <Sequence name="02 Питание" {...scene(SCENES.coffee, SCENES.compress)}>
          <Coffee until={SCENES.compress - SCENES.coffee} />
        </Sequence>
        <Sequence name="03 Уход" {...scene(SCENES.compress, SCENES.stitches)}>
          <Compress until={SCENES.stitches - SCENES.compress} />
        </Sequence>
        <Sequence name="04 Швы" {...scene(SCENES.stitches, SCENES.therapy)}>
          <Stitches until={SCENES.therapy - SCENES.stitches} />
        </Sequence>
        <Sequence name="05 Восстановление" {...scene(SCENES.therapy, SCENES.end)}>
          <Therapy until={SCENES.end - SCENES.therapy + 1} />
        </Sequence>
      </Panel>
      <Captions />
      <SoundEffects />
    </AbsoluteFill>
  );
};
