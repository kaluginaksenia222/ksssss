import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, FONTS} from '../design/tokens';
import {metal} from './fresh';
import {InstagramHandle} from './ui';

// Обложка рилса «16 сутки после абдоминопластики».
// Заголовок — на тёмном зеркале справа вверху (там нет лиц), всё в рабочей зоне Reels
// (x 100–980, y 330–1500; ниже 1067 правая граница 866) и в центре 4:5.
const shadow = '0 2px 14px rgba(0,0,0,0.7)';

export const Cover: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Img src={staticFile('cover_frame.png')} style={{width: 1080, height: 1920}} />
      <div style={{position: 'absolute', top: 370, left: 640, width: 330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontFamily: FONTS.mono, fontSize: 22, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.85)', textShadow: shadow}}>РЕЗУЛЬТАТ</div>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 150, lineHeight: '150px', marginTop: 6, ...metal}}>16</div>
        <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, lineHeight: '66px', textTransform: 'uppercase', ...metal}}>сутки</div>
        <div style={{height: 2, width: 200, margin: '14px 0 12px', background: `linear-gradient(90deg, rgba(248,240,229,0), ${COLORS.beige}, rgba(248,240,229,0))`}} />
        <div style={{fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, lineHeight: 1.2, color: COLORS.white, textShadow: shadow, textAlign: 'center'}}>
          после
          <br />
          абдоминопластики
        </div>
      </div>
      <AbsoluteFill style={{top: 1440, left: 100, right: 1080 - 866, width: 'auto', height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
