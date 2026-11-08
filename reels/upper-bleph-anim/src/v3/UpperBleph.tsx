import React, {useEffect, useState} from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsLoaded} from '../design/fonts';
import {COLORS, EASE, FONTS} from '../design/tokens';
import {InstagramHandle} from './ui';

// Схема верхней блефаропластики: глаз и веко тонкими линиями, операция по шагам.
// Схематично и без натурализма. Закадровый голос — синтезированный (RHVoice). Время — секунды ролика.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Шаги: начало, номер, заголовок, пояснение
// Время шагов совпадает с началом реплик озвучки (voice.json, длительности — из scripts/voice.py)
const VOICE = [
  {id: 'hook', at: 0.3},
  {id: 's1', at: 4.64},
  {id: 's2', at: 10.75},
  {id: 's3', at: 17.44},
  {id: 's4', at: 21.7},
  {id: 's5', at: 26.49},
  {id: 's6', at: 30.69},
  {id: 'result', at: 36.41},
];
const HOOK_END = 4.4;
const STEPS = [
  {at: 4.64, title: 'Нависание кожи', note: 'избыток кожи ложится на веко, взгляд тяжёлый'},
  {at: 10.75, title: 'Разметка', note: 'отмечаем лишнюю кожу, нижняя линия — в естественной складке'},
  {at: 17.44, title: 'Разрез', note: 'по линиям разметки'},
  {at: 21.7, title: 'Удаление кожи', note: 'убираем лишнюю полоску кожи'},
  {at: 26.49, title: 'Жировые грыжи', note: 'при необходимости убираем излишек жира'},
  {at: 30.69, title: 'Косметический шов', note: 'шов прячется в естественной складке века'},
];
const RESULT_AT = 36.41;
const END = 43.5;

// Геометрия глаза (координаты внутри svg 1000×600)
const LASH_LINE = 'M150 400 C330 270 670 270 850 400';
const LOWER_LID = 'M150 400 C330 500 670 500 850 400';
const CREASE = 'M180 330 C340 190 660 190 820 330';
const MARK_TOP = 'M200 322 C350 110 650 110 800 322';
const SKIN_STRIP = 'M200 322 C350 110 650 110 800 322 C650 208 350 208 200 322 Z';
// Нависающая кожа: верх — складка, низ — край, который опускается на ресницы (h — глубина провисания)
const hoodPath = (h: number) => `M180 330 C340 190 660 190 820 330 C660 ${h} 340 ${h} 180 330 Z`;
const BEFORE_H = 352;
const AFTER_H = 190;

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: EASE.inOut});

const Draw: React.FC<{d: string; p: number; w?: number; color?: string; dash?: boolean; opacity?: number}> = ({d, p, w = 5, color = COLORS.white, dash, opacity = 1}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
    pathLength={1}
    strokeDasharray={dash ? '0.018 0.022' : 1}
    strokeDashoffset={dash ? 0 : 1 - p}
    style={dash ? {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`} : undefined}
  />
);

const Eye: React.FC = () => {
  const t = useT();
  const draw = ease(t, 0.2, 1.4);
  // провисание кожи: до операции — на ресницах, после удаления — убрано; в финале — сравнение «до / после»
  const lift = ease(t, STEPS[3].at + 0.4, STEPS[3].at + 2.2);
  const compare = t > RESULT_AT + 1.4 ? (Math.sin((t - RESULT_AT - 1.4) * 1.6 - Math.PI / 2) + 1) / 2 : 0;
  const h = interpolate(lift, [0, 1], [BEFORE_H, AFTER_H]) + compare * (BEFORE_H - AFTER_H);
  const hoodOn = interpolate(t, [1.0, 1.8], [0, 1], clamp);
  const markP = ease(t, STEPS[1].at + 0.2, STEPS[1].at + 1.6);
  const markFade = 1 - ease(t, STEPS[3].at + 0.2, STEPS[3].at + 1.0);
  const cutP = ease(t, STEPS[2].at + 0.2, STEPS[2].at + 1.6);
  const stripFill = ease(t, STEPS[3].at, STEPS[3].at + 0.4) * (1 - ease(t, STEPS[3].at + 0.9, STEPS[3].at + 1.8));
  const stripUp = ease(t, STEPS[3].at + 0.6, STEPS[3].at + 1.8) * -70;
  const fat = ease(t, STEPS[4].at + 0.2, STEPS[4].at + 0.9) * (1 - ease(t, STEPS[4].at + 1.6, STEPS[4].at + 2.4));
  const stitches = [0, 1, 2, 3, 4, 5, 6, 7];
  const stitchFade = 1 - ease(t, RESULT_AT - 0.6, RESULT_AT + 0.4);
  const scarLine = ease(t, STEPS[5].at + 1.4, RESULT_AT) * (1 - ease(t, RESULT_AT + 0.8, RESULT_AT + 1.6)) * 0.8;
  // точки на линии ресниц для ресничек
  const lash = (u: number) => {
    const x = (1 - u) ** 3 * 150 + 3 * (1 - u) ** 2 * u * 330 + 3 * (1 - u) * u * u * 670 + u ** 3 * 850;
    const y = (1 - u) ** 3 * 400 + 3 * (1 - u) ** 2 * u * 270 + 3 * (1 - u) * u * u * 270 + u ** 3 * 400;
    return {x, y};
  };
  return (
    <svg width={1000} height={600} viewBox="0 0 1000 600" style={{position: 'absolute', top: 360, left: 40, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))'}}>
      <defs>
        <clipPath id="fissure">
          <path d="M150 400 C330 270 670 270 850 400 C670 500 330 500 150 400 Z" />
        </clipPath>
      </defs>
      {/* бровь */}
      <Draw d="M170 120 C360 40 640 40 830 120" p={ease(t, 0.1, 1.0)} w={4} opacity={0.35} />
      {/* глаз */}
      <g clipPath="url(#fissure)" opacity={draw}>
        <circle cx={500} cy={392} r={88} fill="none" stroke={COLORS.white} strokeWidth={5} />
        <circle cx={500} cy={392} r={34} fill={COLORS.beige} />
      </g>
      <Draw d={LOWER_LID} p={draw} />
      <Draw d={LASH_LINE} p={draw} />
      {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((u) => {
        const {x, y} = lash(u);
        return <path key={u} d={`M${x} ${y} l${(u - 0.5) * 30} -26`} stroke={COLORS.white} strokeWidth={3} strokeLinecap="round" opacity={draw * 0.85} />;
      })}
      {/* нависающая кожа: закрашена фоном, чтобы прятать ресницы */}
      <g opacity={hoodOn}>
        <path d={hoodPath(h)} fill={COLORS.navy} />
        <path d={hoodPath(h)} fill="rgba(248,240,229,0.16)" stroke={COLORS.beige} strokeWidth={3} />
      </g>
      <Draw d={CREASE} p={draw} w={3} opacity={0.6} />
      {/* разметка */}
      <g opacity={markFade}>
        <Draw d={MARK_TOP} p={markP} w={4} color={COLORS.beige} dash />
        <Draw d={CREASE} p={markP} w={4} color={COLORS.beige} dash />
      </g>
      {/* разрез по разметке */}
      <g opacity={markFade}>
        <Draw d={MARK_TOP} p={cutP} w={5} color={COLORS.beige} />
        <Draw d={CREASE} p={cutP} w={5} color={COLORS.beige} />
      </g>
      {/* полоска лишней кожи уходит вверх */}
      <path d={SKIN_STRIP} fill="rgba(248,240,229,0.45)" stroke={COLORS.beige} strokeWidth={3} opacity={stripFill} transform={`translate(0 ${stripUp})`} />
      {/* жировая грыжа у внутреннего угла */}
      <ellipse cx={300} cy={268} rx={58 * (0.6 + 0.4 * fat)} ry={34 * (0.6 + 0.4 * fat)} fill="rgba(248,240,229,0.35)" stroke={COLORS.beige} strokeWidth={3} opacity={fat} />
      {/* косметический шов: стежки по складке, потом остаётся тонкая линия */}
      {stitches.map((i) => {
        const u = 0.12 + i * 0.108;
        const x = (1 - u) ** 3 * 180 + 3 * (1 - u) ** 2 * u * 340 + 3 * (1 - u) * u * u * 660 + u ** 3 * 820;
        const y = (1 - u) ** 3 * 330 + 3 * (1 - u) ** 2 * u * 190 + 3 * (1 - u) * u * u * 190 + u ** 3 * 330;
        const p = ease(t, STEPS[5].at + 0.2 + i * 0.12, STEPS[5].at + 0.5 + i * 0.12);
        return <path key={i} d={`M${x - 9} ${y - 12} L${x + 9} ${y + 12}`} stroke={COLORS.beige} strokeWidth={4} strokeLinecap="round" opacity={p * stitchFade} />;
      })}
      <path d={CREASE} fill="none" stroke={COLORS.beige} strokeWidth={2} opacity={scarLine} />
    </svg>
  );
};

const metal = {
  backgroundImage: `linear-gradient(100deg, #E9EDF3 0%, #B9C2D0 35%, #FFFFFF 60%, #C9CFDA 75%, ${COLORS.beige} 100%)`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
};

// Подпись шага: номер, заголовок, пояснение — мягко сменяются
const Caption: React.FC<{num: string; title: string; note: string; at: number; until: number}> = ({num, title, note, at, until}) => {
  const t = useT();
  const v = Math.min(ease(t, at, at + 0.5), 1 - ease(t, until - 0.4, until));
  if (v <= 0) {
    return null;
  }
  return (
    <div style={{position: 'absolute', top: 1110, left: 60, right: 60, textAlign: 'center', opacity: v, translate: `0px ${(1 - v) * 16}px`}}>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)'}}>{num}</div>
      <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 62, textTransform: 'uppercase', marginTop: 10, ...metal}}>{title}</div>
      <div style={{fontFamily: FONTS.body, fontWeight: 400, fontSize: 34, lineHeight: 1.3, color: 'rgba(255,255,255,0.85)', marginTop: 12}}>{note}</div>
    </div>
  );
};

const Hook: React.FC = () => {
  const t = useT();
  const v = Math.min(ease(t, 0.1, 0.7), 1 - ease(t, HOOK_END - 0.4, HOOK_END));
  return (
    <div style={{position: 'absolute', top: 1110, left: 40, right: 40, textAlign: 'center', opacity: v}}>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.75)'}}>КАК ПРОХОДИТ ОПЕРАЦИЯ</div>
      <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 64, lineHeight: 1.04, textTransform: 'uppercase', marginTop: 12, ...metal, letterSpacing: `${interpolate(v, [0, 1], [0.1, -0.01])}em`}}>
        Верхняя
        <br />
        блефаропластика
      </div>
    </div>
  );
};

// Финал: метка «до / после» в такт сравнению
const ResultCaption: React.FC = () => {
  const t = useT();
  const v = ease(t, RESULT_AT, RESULT_AT + 0.6);
  const compare = t > RESULT_AT + 1.4 ? (Math.sin((t - RESULT_AT - 1.4) * 1.6 - Math.PI / 2) + 1) / 2 : 0;
  return (
    <div style={{position: 'absolute', top: 1110, left: 60, right: 60, textAlign: 'center', opacity: v}}>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 26, letterSpacing: '0.24em', color: COLORS.beige}}>{compare > 0.5 ? 'ДО' : 'ПОСЛЕ'}</div>
      <div style={{fontFamily: FONTS.heading, fontWeight: 900, fontSize: 62, textTransform: 'uppercase', marginTop: 10, ...metal}}>Открытый взгляд</div>
      <div style={{fontFamily: FONTS.body, fontWeight: 400, fontSize: 34, color: 'rgba(255,255,255,0.85)', marginTop: 12}}>шов почти не виден</div>
    </div>
  );
};

export const UpperBleph: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy, backgroundImage: 'radial-gradient(ellipse 80% 45% at 50% 36%, rgba(248,240,229,0.10), rgba(8,32,82,0) 70%)'}}>
      <Eye />
      <Hook />
      {STEPS.map((s, i) => (
        <Caption key={s.title} num={`${String(i + 1).padStart(2, '0')} / 06`} title={s.title} note={s.note} at={s.at} until={STEPS[i + 1]?.at ?? RESULT_AT} />
      ))}
      <ResultCaption />
      <AbsoluteFill style={{top: 'auto', bottom: 170, height: 'auto', alignItems: 'center'}}>
        <InstagramHandle handle="dr_kudryakov" />
      </AbsoluteFill>
      {VOICE.map((v) => (
        <Sequence key={v.id} name={`Голос ${v.id}`} from={Math.round(v.at * fps)}>
          <Audio src={staticFile(`voice/${v.id}.wav`)} />
        </Sequence>
      ))}
      {/* Тихая музыка под голосом */}
      <Audio src={staticFile('music/calm_pad_45.wav')} volume={(f) => interpolate(f, [durationInFrames - 1.5 * fps, durationInFrames - 1], [1, 0], clamp)} />
      {[0.2, ...STEPS.map((s) => s.at), RESULT_AT].map((at) => (
        <Sequence key={at} from={Math.round(at * fps)} durationInFrames={Math.round(0.3 * fps)}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.06} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const UPPER_BLEPH_SECONDS = END;
