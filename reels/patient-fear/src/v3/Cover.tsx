import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, FONTS} from '../design/tokens';
import {metal, SAFE} from './story';
import {InstagramHandle} from './ui';

// Обложка рилса «Пациентка сбежала перед операцией».
// Текст — в рабочей зоне Reels и в центре 4:5 (y 285–1635), чтобы не обрезался в сетке профиля.
const shadow = '0 2px 14px rgba(0,0,0,0.7)';

export const Cover: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  const box: React.CSSProperties = {position: 'absolute', left: SAFE.left, right: 1080 - SAFE.lowRight, display: 'flex', flexDirection: 'column', alignItems: 'center'};
  return (
    <AbsoluteFill style={{backgroundColor: '#1a0605'}}>
      <Img src={staticFile('cover_frame.png')} style={{width: 1080, height: 1920, transformOrigin: '49% 35%', scale: '1.08'}} />
      {/* лёгкое затемнение низа, чтобы заголовок читался на футболке */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0) 100%)'}} />

      <div style={{position: 'absolute', top: 360, left: SAFE.left, right: 1080 - SAFE.right, textAlign: 'center', fontFamily: FONTS.mono, fontSize: 24, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.88)', textShadow: shadow}}>
        ИСТОРИЯ ИЗ ПРАКТИКИ
      </div>

      <div style={{...box, top: 1075}}>
        <div style={{fontFamily: FONTS.body, fontWeight: 400, fontSize: 40, letterSpacing: '0.26em', textTransform: 'uppercase', color: COLORS.white, textShadow: shadow}}>пациентка</div>
        <div style={{position: 'relative', marginTop: 4}}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: '100%',
                top: 26 + i * 18,
                marginRight: 16 + i * 6,
                width: 70 + i * 26,
                height: 4,
                borderRadius: 3,
                background: `linear-gradient(90deg, rgba(248,240,229,0), ${COLORS.beige})`,
                opacity: 0.95 - i * 0.18,
              }}
            />
          ))}
          <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 96, lineHeight: '110px', textTransform: 'uppercase', ...metal, filter: 'drop-shadow(0 3px 16px rgba(0,0,0,0.7))'}}>
            сбежала
          </div>
        </div>
        <div style={{marginTop: 10, fontFamily: FONTS.body, fontWeight: 500, fontSize: 38, color: COLORS.beige, textShadow: shadow, textAlign: 'center', lineHeight: 1.2}}>
          за 30 минут
          <br />
          до операции
        </div>
      </div>

      <AbsoluteFill style={{top: 1440, left: SAFE.left, right: 1080 - SAFE.lowRight, width: 'auto', height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
