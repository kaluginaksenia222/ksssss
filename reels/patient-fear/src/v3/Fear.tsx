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
import {
  ChatBubble,
  Countdown,
  DecodeTitle,
  FlashCut,
  FlipBoard,
  Heartbeat,
  JitterPills,
  LampBeam,
  MorningArc,
  NoStamp,
  ReadyRing,
  RgbSplit,
  RunAwayTitle,
  StruckPills,
  TypedQuote,
  WorryGauge,
} from './story';
import {PAGES} from './transcript';
import {InstagramHandle} from './ui';

// Экспертный рилс «Пациентка сбежала перед операцией». Врач сидит по центру на красном фоне.
// Лицо сверху по центру → элементы по бокам от головы (y 400–700), заголовки на футболке (~1100),
// субтитры ниже (1400). Время — секунды нарезки (cuts.json).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FACE = {cx: 530, cy: 680};
const CUTS = [2.92, 8.58, 16.58, 18.2, 32.42, 36.84, 63.3, 65.7, 75.97, 78.49, 79.87];
const HOOK_END = 3.0;
const HIT = 1.02; // «сбежала»
export const FEAR_SECONDS = 82.0;
const CAPTION_TOP = 1400;
const CAPTION_OFF = [
  [0, HOOK_END],
  [26.2, 29.1], // кардиограмма «страх»
  [35.1, 37.6], // цитата
  [45.9, 48.0], // «страх — это нормально»
  [52.4, 55.4], // «отложить / перенести»
  [78.7, 99], // финал
];

const useFootageStyle = (): React.CSSProperties => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CUTS.filter((c) => t >= c).length;
  const scaleOf = (i: number) => (i % 2 === 1 ? 1.1 : 1);
  const cutAt = idx > 0 ? CUTS[idx - 1] : 0;
  const k = interpolate(frame, [cutAt * fps, cutAt * fps + 10], [0, 1], {...clamp, easing: EASE.inOut});
  const base = idx === 0 ? 1 : interpolate(k, [0, 1], [scaleOf(idx - 1), scaleOf(idx)]);
  const drift = interpolate(t - cutAt, [0, 8], [0, 0.03], {extrapolateRight: 'clamp'});
  // хук: влёт из приближения с размытием и второй короткий «толчок» на слове «сбежала»
  const fly = interpolate(frame, [0, 0.4 * fps], [0, 1], {...clamp, easing: EASE.out});
  const punch = interpolate(frame, [HIT * fps, (HIT + 0.08) * fps, (HIT + 0.5) * fps], [0, 0.06, 0], clamp);
  return {
    position: 'absolute',
    width: 1080,
    height: 1920,
    transformOrigin: `${(FACE.cx / 1080) * 100}% ${(FACE.cy / 1920) * 100}%`,
    scale: String(base + drift + (1 - fly) * 0.3 + punch),
    filter: fly < 1 ? `blur(${(1 - fly) * 16}px)` : undefined,
  };
};

const FootageLayer: React.FC<{extra?: React.CSSProperties}> = ({extra}) => {
  const style = useFootageStyle();
  return <Video src={staticFile('source.mp4')} muted style={{...style, ...extra, filter: [style.filter, extra?.filter].filter(Boolean).join(' ') || undefined}} />;
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
    <div style={{position: 'absolute', top: CAPTION_TOP, left: 64, right: 64, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 400, fontSize: 46, color: COLORS.white, textShadow: '0 2px 14px rgba(0, 0, 0, 0.6)'}}>
      {PAGES[index].words.map((word, wi) => {
        const st = Math.round(word.start * fps);
        const v = interpolate(frame, [st, st + 5], [0, 1], {...clamp, easing: EASE.out});
        return (
          <span key={`${index}-${wi}`} style={{display: 'inline-block', margin: '0 0.14em', opacity: v, translate: `0px ${(1 - v) * -8}px`}}>
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
      <Audio
        src={staticFile('music/calm_pad_45.wav')}
        loop
        volume={(f) => interpolate(f, [durationInFrames - 1.5 * fps, durationInFrames - 1], [1, 0], clamp)}
      />
      {/* хук: свуш на влёте, удар и блеск на «сбежала» */}
      {sfx('whoosh', 0, 0.16, 0.6)}
      {sfx('whoosh', HIT - 0.25, 0.14, 0.6)}
      {sfx('impact', HIT, 0.3, 1.0)}
      {sfx('shimmer', HIT + 0.3, 0.18, 1.1)}
      {/* мягкие появления */}
      {[14.1, 16.02, 18.44, 43.22, 44.56, 52.66, 54.74].map((at) => sfx('pop', at, 0.05, 0.2))}
      {[29.4, 30.4, 31.4].map((at) => sfx('tick', at, 0.05, 0.3))}
      {Array.from({length: 12}, (_, i) => sfx('key', 35.2 + i * 0.09, 0.04, 0.15))}
      {sfx('whoosh', 45.1, 0.08, 0.6)}
      {sfx('tick', 64.7, 0.06, 0.3)}
      {sfx('impact', 73.06, 0.16, 1.0)}
      {sfx('shimmer', 78.8, 0.2, 1.1)}
    </>
  );
};

export const Fear: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: '#1a0605'}}>
      <FootageLayer />
      <RgbSplit at={HIT}>{(style) => <FootageLayer extra={style} />}</RgbSplit>
      <FlashCut at={HIT} />

      <RunAwayTitle at={0.45} hitAt={HIT} tailAt={1.52} until={HOOK_END + 0.1} top={1060} />

      <MorningArc at={3.5} until={8.5} x={64} y={430} />
      <JitterPills items={[{text: 'разочарован', at: 14.1}, {text: 'злой', at: 16.02}]} until={17.0} x={1016} y={440} />
      <ChatBubble at={17.2} textAt={18.44} until={22.1} x={1016} y={400} who="МЕНЕДЖЕР" text="Пациентка хочет отказаться от операции" />
      <Heartbeat at={26.3} until={29.1} top={1090} />
      <Countdown at={29.3} until={32.6} x={790} y={400} />
      <TypedQuote at={35.2} until={37.6} text="Я оперироваться не буду" top={1090} cps={24} />
      <StruckPills items={[{text: 'убеждать', at: 43.22}, {text: 'уговаривать', at: 44.56}]} strikeAt={45.1} until={45.9} x={64} y={430} />
      <DecodeTitle at={45.94} until={48.0} lines={['Страх — это', 'нормально']} top={1100} />
      <WorryGauge at={48.0} edgeAt={49.5} forkA={52.66} forkB={54.74} until={55.4} top={1110} />
      <ReadyRing at={55.5} fullAt={59.7} until={61.6} x={790} y={400} />
      <FlipBoard at={63.4} flipAt={64.7} until={68.5} x={64} y={430} from="операция" to="отменена" />
      <NoStamp items={[{text: 'расстроится', at: 70.54}, {text: 'огорчится', at: 71.72}, {text: 'будет ругаться', at: 72.38}]} stampAt={73.06} until={75.9} x={1016} y={400} />
      <LampBeam at={77.6} titleAt={78.8} until={FEAR_SECONDS} lamp={[440, 360]} top={1110} lines={['Это выбор', 'пациента']} />

      <Captions />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      <SoundTrack />
    </AbsoluteFill>
  );
};
