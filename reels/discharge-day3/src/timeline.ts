import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DUR, EASE} from './design/tokens';

// Разделы ролика (секунды нарезки) — по расшифровке голоса: хук и 5 правил
export const SECTIONS = [
  {start: 0, end: 6.76},
  {start: 6.76, end: 13.45},
  {start: 13.45, end: 17.75},
  {start: 17.75, end: 24.35},
  {start: 24.35, end: 29.2},
  {start: 29.2, end: 34.73},
];

// После хука панель со вставками держится до конца
export const SPLITS = [{in: 6.55, out: Infinity}];

// Начала вставок на панели (секунды)
export const SCENES = {
  load: 6.76,
  sleep: 13.45,
  drive: 17.75,
  heat: 24.35,
  cosmetics: 29.2,
  end: 34.73,
};

// Моменты переходов — для свушей
export const TRANSITIONS = [SCENES.load, SCENES.sleep, SCENES.drive, SCENES.heat, SCENES.cosmetics];

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
