import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DUR, EASE} from './design/tokens';

// Разделы ролика (секунды нарезки) — по расшифровке голоса: хук, 8 правил, финал
export const SCENES = {
  load: 6.65,
  sleep: 13.29,
  drive: 17.49,
  heat: 24.06,
  cosmetics: 28.89,
  bandage: 33.67,
  detralex: 42.92,
  sutures: 46.78,
  visit: 62.49,
  end: 72.80,
};

export const SECTIONS = [
  {start: 0, end: SCENES.load},
  {start: SCENES.load, end: SCENES.sleep},
  {start: SCENES.sleep, end: SCENES.drive},
  {start: SCENES.drive, end: SCENES.heat},
  {start: SCENES.heat, end: SCENES.cosmetics},
  {start: SCENES.cosmetics, end: SCENES.bandage},
  {start: SCENES.bandage, end: SCENES.detralex},
  {start: SCENES.detralex, end: SCENES.sutures},
  {start: SCENES.sutures, end: SCENES.visit},
  {start: SCENES.visit, end: SCENES.end},
];

// После хука панель со вставками держится до конца
export const SPLITS = [{in: 6.44, out: Infinity}];

// Моменты переходов — для свушей
export const TRANSITIONS = [SCENES.load, SCENES.sleep, SCENES.drive, SCENES.heat, SCENES.cosmetics, SCENES.bandage, SCENES.detralex, SCENES.sutures, SCENES.visit];

// Прогресс сплита: 0 — видео на весь экран, 1 — панель + видео
export const useSplit = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut} as const;
  return Math.max(
    ...SPLITS.map((s) => {
      const a = Math.round(s.in * fps);
      const inn = interpolate(frame, [a, a + DUR.modeSwitch], [0, 1], clamp);
      if (!Number.isFinite(s.out)) {
        return inn;
      }
      const b = Math.round(s.out * fps);
      return Math.min(inn, interpolate(frame, [b, b + DUR.modeSwitch], [1, 0], clamp));
    }),
  );
};
