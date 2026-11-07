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
import {COLORS, EASE, FONTS} from '../design/tokens';
import {CrowdSearch, DiagonalVeil, LightSweepTitle, NaturalSlider, UnderlineTitle} from './calm';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Естественный результат». Мягкая подача: плавные наезды на стыках,
// свои анимации (каждая один раз), тихая музыка. Время — секунды нарезки (cuts.json).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FACE = {cx: 590, cy: 620};
const CUTS = [2.42, 4.02, 8.77, 14.37];
const HOOK_END = 4.1;
const BLUE = {from: 4.3, to: 8.75};
const CAPTION_OFF = [
  [0, HOOK_END],
  [BLUE.from + 0.3, BLUE.to - 0.2],
  [14.3, 99],
];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.08 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 14], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1.04 : interpolate(k, [0, 1], [idx === 1 ? 1.04 : scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 6], [0, 0.02], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('source.mp4')}
        muted
        style={{width: 1080, height: 1920, transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`, scale: String(base + drift)}}
      />
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (CAPTION_OFF.some(([a, b]) => t >= a && t < b)) {
    return null;
  }
  const index = PAGES.findIndex((page, i) => {
    const next = PAGES[i + 1];
    const from = page.words[0].start - 0.05;
    const to = next ? Math.min(next.words[0].start - 0.05, page.words[page.words.length - 1].end + 0.6) : Infinity;
    return t >= from && t < to;
  });
  if (index === -1) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top: 1110, left: 64, right: 64, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 400, fontSize: 46, color: COLORS.white, textShadow: '0 2px 14px rgba(0, 0, 0, 0.55)'}}>
      {PAGES[index].words.map((word, wi) => {
        const st = Math.round(word.start * fps);
        return (
          <span
            key={`${index}-${wi}`}
            style={{
              display: 'inline-block',
              margin: '0 0.14em',
              opacity: interpolate(frame, [st, st + 5], [0, 1], {...clamp, easing: EASE.out}),
              translate: interpolate(frame, [st, st + 5], ['0px 8px', '0px 0px'], {...clamp, easing: EASE.out}),
              filter: `blur(${interpolate(frame, [st, st + 5], [3, 0], clamp)}px)`,
            }}
          >
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
      <Audio src={staticFile('music/calm_pad.wav')} volume={(f) => interpolate(f, [durationInFrames - 1.2 * fps, durationInFrames - 1], [1, 0], clamp)} />
      {sfx('shimmer', 0.2, 0.22, 1.1)}
      {[BLUE.from, BLUE.to - 0.7].map((at) => sfx('whoosh', at, 0.08, 0.6))}
      {[9.86, 14.45].map((at) => sfx('pop', at, 0.05, 0.2))}
    </>
  );
};

export const Natural: React.FC = () => {
  const {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Footage />

      <LightSweepTitle at={0.15} until={HOOK_END} label="САМЫЙ ЧАСТЫЙ СТРАХ" lines={['Выглядеть', '«переделанной»']} size={70} top={1040} />

      <Sequence name="Синяя сцена: никто не заметит" from={Math.round(BLUE.from * fps)} durationInFrames={Math.round((BLUE.to - BLUE.from) * fps)}>
        <DiagonalVeil until={BLUE.to - BLUE.from}>
          <CrowdSearch until={BLUE.to - BLUE.from - 0.4} titleAt={7.12 - BLUE.from} />
        </DiagonalVeil>
      </Sequence>

      <NaturalSlider at={9.0} settleAt={10.3} tugAt={12.6} until={14.3} top={1250} />
      <UnderlineTitle at={14.35} until={15.7} text="Естественный результат" size={60} top={1060} />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
