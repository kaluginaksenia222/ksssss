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
import {DotGrid, InstagramHandle} from './components/ui';
import {fontsLoaded} from './design/fonts';
import {COLORS, LAYOUT, PANEL_HEIGHT, SPLIT_SOURCE_Y} from './design/tokens';
import {Bandage, Cosmetics, Detralex, Drive, Heat, Hook, IntroBar, Load, POP_TIMES, Sleep, Sutures, TYPING, Visit} from './scenes/Sections';
import {SCENES, SECTIONS, TRANSITIONS, useSplit} from './timeline';

const HOOK_UNTIL = 6.76;
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
        volume={(f) => interpolate(f, [71.1 * fps, 71.5 * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
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

// Звуки: свуш на хуке и сменах вставок, тихий «поп» на главных появлениях, клавиши при печати
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  const pops = [
    ...POP_TIMES.load.map((t) => SCENES.load + t),
    ...POP_TIMES.sleep.map((t) => SCENES.sleep + t),
    ...POP_TIMES.drive.map((t) => SCENES.drive + t),
    ...POP_TIMES.heat.map((t) => SCENES.heat + t),
    ...POP_TIMES.cosmetics.map((t) => SCENES.cosmetics + t),
    ...POP_TIMES.bandage.map((t) => SCENES.bandage + t),
    ...POP_TIMES.detralex.map((t) => SCENES.detralex + t),
    ...POP_TIMES.sutures.map((t) => SCENES.sutures + t),
    ...POP_TIMES.visit.map((t) => SCENES.visit + t),
  ];
  const keys = TYPING.flatMap((ty) =>
    new Array(ty.chars)
      .fill(0)
      .map((_, i) => SCENES[ty.scene] + ty.at + i / ty.cps)
      .filter((_, i) => i % 2 === 0),
  );
  const {durationInFrames} = useVideoConfig();
  return (
    <>
      {/* тихая мелодичная музыка под голосом, затихает в конце */}
      <Audio
        src={staticFile('music/warm_keys_90.wav')}
        volume={(f) => 0.22 * interpolate(f, [durationInFrames - 1.5 * fps, durationInFrames - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
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
          <Audio src={staticFile('sfx/pop.wav')} volume={0.1} />
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
        <Sequence name="01 Нагрузки" {...scene(SCENES.load, SCENES.sleep)}>
          <Load until={SCENES.sleep - SCENES.load} />
        </Sequence>
        <Sequence name="02 Сон" {...scene(SCENES.sleep, SCENES.drive)}>
          <Sleep until={SCENES.drive - SCENES.sleep} />
        </Sequence>
        <Sequence name="03 За рулём" {...scene(SCENES.drive, SCENES.heat)}>
          <Drive until={SCENES.heat - SCENES.drive} />
        </Sequence>
        <Sequence name="04 Тепло" {...scene(SCENES.heat, SCENES.cosmetics)}>
          <Heat until={SCENES.cosmetics - SCENES.heat} />
        </Sequence>
        <Sequence name="05 Косметика" {...scene(SCENES.cosmetics, SCENES.bandage)}>
          <Cosmetics until={SCENES.bandage - SCENES.cosmetics} />
        </Sequence>
        <Sequence name="06 Бандаж" {...scene(SCENES.bandage, SCENES.detralex)}>
          <Bandage until={SCENES.detralex - SCENES.bandage} />
        </Sequence>
        <Sequence name="07 Детралекс" {...scene(SCENES.detralex, SCENES.sutures)}>
          <Detralex until={SCENES.sutures - SCENES.detralex} />
        </Sequence>
        <Sequence name="08 Швы" {...scene(SCENES.sutures, SCENES.visit)}>
          <Sutures until={SCENES.visit - SCENES.sutures} />
        </Sequence>
        <Sequence name="Финал: приём" {...scene(SCENES.visit, SCENES.end)}>
          <Visit until={SCENES.end - SCENES.visit + 1} />
        </Sequence>
      </Panel>
      <Captions />
      <AbsoluteFill style={{top: 1440, left: 100, right: 1080 - 866, width: 'auto', height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundEffects />
    </AbsoluteFill>
  );
};
