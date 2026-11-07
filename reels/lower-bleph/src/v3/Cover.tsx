import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, FONTS} from '../design/tokens';
import {InstagramHandle} from './ui';

// Обложка рилса «Нижняя блефаропластика без разрезов».
// Всё важное — в центральной зоне 4:5 (y 285–1635), чтобы не обрезалось в сетке профиля.

const metal = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
};
const shadow = 'drop-shadow(0 3px 18px rgba(0,0,0,0.6))';

export const Cover: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      <Img
        src={staticFile('cover_frame.png')}
        style={{width: 1080, height: 1920, transformOrigin: '55% 36%', scale: '1.12'}}
      />
      <div
        style={{
          position: 'absolute',
          top: 330,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontWeight: 500,
          fontSize: 24,
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.85)',
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}
      >
        ПЛАСТИЧЕСКАЯ ХИРУРГИЯ
      </div>

      <div style={{position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <svg width={460} height={150} viewBox="0 0 520 170" style={{filter: shadow}}>
          <path d="M30 85 C130 10 390 10 490 85 C390 160 130 160 30 85 Z" fill="none" stroke={COLORS.white} strokeWidth={5} />
          <circle cx={260} cy={82} r={38} fill="none" stroke={COLORS.white} strokeWidth={5} />
          <circle cx={260} cy={82} r={15} fill={COLORS.beige} />
          <path d="M80 140 C180 178 340 178 440 140" fill="none" stroke={COLORS.beige} strokeWidth={4} strokeDasharray="10 12" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{position: 'absolute', top: 1170, left: 40, right: 40, textAlign: 'center', filter: shadow}}>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 70, lineHeight: 1.02, letterSpacing: '-0.01em', textTransform: 'uppercase', ...metal}}>
          Нижняя
          <br />
          блефаропластика
        </div>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 84, lineHeight: 1.05, textTransform: 'uppercase', ...metal, marginTop: 4}}>
          без разрезов?
        </div>
      </div>

      <AbsoluteFill style={{top: 'auto', bottom: 330, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
