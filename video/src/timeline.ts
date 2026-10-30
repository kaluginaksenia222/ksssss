import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DUR, EASE} from './design/tokens';

// Разделы ролика (секунды) — по расшифровке голоса
export const SECTIONS = [
  {start: 0, end: 7.44},
  {start: 7.44, end: 16.5},
  {start: 16.5, end: 22.45},
  {start: 22.45, end: 33.3},
  {start: 33.3, end: 38.3},
  {start: 38.3, end: 50.37},
];

// Когда кадр делится на белую панель + видео. Только на двух ключевых советах,
// всё остальное время — видео на весь экран.
export const SPLITS = [
  {in: 23.5, out: 28.5},
  {in: 40.0, out: 45.3},
];

// Все моменты переходов — для свушей
export const SPLIT_EDGES = SPLITS.flatMap((s) => [s.in, s.out]);

// Прогресс сплита: 0 — видео на весь экран, 1 — панель + видео
export const useSplit = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut} as const;
  return Math.max(
    ...SPLITS.map((s) => {
      const a = Math.round(s.in * fps);
      const b = Math.round(s.out * fps);
      return Math.min(
        interpolate(frame, [a, a + DUR.modeSwitch], [0, 1], clamp),
        interpolate(frame, [b, b + DUR.modeSwitch], [1, 0], clamp),
      );
    }),
  );
};
