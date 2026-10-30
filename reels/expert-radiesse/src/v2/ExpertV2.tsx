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
import {fontsLoaded} from '../design/fonts';
import {COLORS, LAYOUT, PANEL_HEIGHT} from '../design/tokens';
import {Captions} from './Captions';
import {LogoHit, TopBar, VoiceWave} from './Overlays';
import {FEARS_POPS, Fears} from './Scenes';
import {SECTIONS, SPLIT_IN, SPLIT_SOURCE_Y, useSplit} from './timeline';
import {DotGrid, InstagramHandle} from './ui';

// Экспертный рилс, версия 2 — механика последнего референса, наши шрифты и цвета:
// хук на весь кадр с верхней полосой и ударом-реверал, затем бежевая панель съезжает
// сверху, видео уходит вниз, на панели — «живые» вставки в окнах интерфейса.

// Удар-реверал на словах «пластическому хирургу»
const HIT_AT = 2.08;
const HIT_HOLD = 1.1;

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const split = useSplit();
  const section = SECTIONS.findIndex((s, i) => t >= s && t < (SECTIONS[i + 1] ?? Infinity));
  const sectionStart = SECTIONS[Math.max(0, section)];
  // Панч-ин на ударе и резкая смена крупности по разделам
  const punch = t >= HIT_AT && t < HIT_AT + 1.2 ? 0.08 : 0;
  const base = section % 2 === 1 ? 1.08 : 1;
  const drift = interpolate(t - sectionStart, [0, 10], [0, 0.03], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{translate: `0px ${split * (PANEL_HEIGHT + 60 - SPLIT_SOURCE_Y)}px`}}>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{width: 1080, height: 1920, transformOrigin: '50% 30%', scale: String(base + punch + drift)}}
      />
    </AbsoluteFill>
  );
};

// Затемнение снизу под субтитрами, пока видео на весь кадр
const BottomShade: React.FC = () => {
  const split = useSplit();
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(8,32,82,0.5) 100%)',
        opacity: 1 - split,
      }}
    />
  );
};

// Верх видео — только до сплита
const TopBarLayer: React.FC = () => {
  const split = useSplit();
  if (split >= 1) {
    return null;
  }
  return (
    <AbsoluteFill style={{opacity: 1 - split, filter: `blur(${split * 6}px)`}}>
      <TopBar sections={SECTIONS} />
    </AbsoluteFill>
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
      <VoiceWave top={PANEL_HEIGHT - 80} />
    </AbsoluteFill>
  );
};

// Звуки: блеск и удар на реверале, свуш на сплите, тихий «поп» на появлениях
const SoundEffects: React.FC = () => {
  const {fps} = useVideoConfig();
  const pops = FEARS_POPS.map((t) => SPLIT_IN + t);
  return (
    <>
      <Sequence name="SFX удар" from={Math.round(HIT_AT * fps)} durationInFrames={Math.round(1.2 * fps)}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.25} />
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.6} />
      </Sequence>
      <Sequence name="SFX свуш" from={Math.round(SPLIT_IN * fps)} durationInFrames={Math.round(0.6 * fps)}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.2} />
      </Sequence>
      {pops.map((at) => (
        <Sequence key={`p${at}`} name="SFX поп" from={Math.round(at * fps)} durationInFrames={Math.round(0.2 * fps)}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.1} />
        </Sequence>
      ))}
    </>
  );
};

export const ExpertV2: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />
      <BottomShade />
      <TopBarLayer />
      <Sequence name="Удар: доктор Кудряков" from={Math.round(HIT_AT * fps)} durationInFrames={Math.round((HIT_HOLD + 0.4) * fps)}>
        <LogoHit text="Доктор Кудряков" top={1050} holdUntil={HIT_HOLD} />
      </Sequence>
      <Panel>
        <Sequence name="01 Страхи пациентов" from={Math.round(SPLIT_IN * fps)} durationInFrames={Math.round((13.4 - SPLIT_IN) * fps)}>
          <Fears until={13.4 - SPLIT_IN} />
        </Sequence>
      </Panel>
      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <Audio src={staticFile('source.mp4')} />
      <SoundEffects />
    </AbsoluteFill>
  );
};
