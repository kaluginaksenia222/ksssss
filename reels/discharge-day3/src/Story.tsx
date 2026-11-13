import React, {useEffect, useState} from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PAGES} from './data/transcript_story';
import {fontsLoaded} from './design/fonts';
import {COLORS, EASE, FONTS} from './design/tokens';

// Сторис: начало выписки (приветствие, самочувствие, «сейчас пройдусь по списку»).
// Только видео и субтитры: маленькие, белые, по 2 слова, по центру чуть ниже голов (рабочая зона Reels/Stories).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const STORY_SECONDS = 23.55;
const CAPTION_TOP = 1110; // у края стола; ниже 1067 правая граница рабочей зоны — 866

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
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
    <div style={{position: 'absolute', top: CAPTION_TOP, left: 100, right: 1080 - 866, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 400, fontSize: 40, color: COLORS.white, textShadow: '0 2px 12px rgba(0, 0, 0, 0.75)'}}>
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

export const Story: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Video src={staticFile('source_story.mp4')} style={{width: 1080, height: 1920}} />
      <Captions />
    </AbsoluteFill>
  );
};
