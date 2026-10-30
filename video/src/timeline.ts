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

// Когда кадр делится на белую панель + видео. Как в референсе: после хука
// панель со вставками держится до конца.
export const SPLITS = [{in: 7.05, out: Infinity}];

// Начала вставок на панели (секунды) — по расшифровке голоса
export const SCENES = {
  firstDays: 7.05,
  coffee: 16.45,
  compress: 22.45,
  stitches: 33.25,
  therapy: 38.3,
  end: 50.37,
};

// Моменты переходов — для свушей
export const TRANSITIONS = [SCENES.firstDays, SCENES.coffee, SCENES.compress, SCENES.stitches, SCENES.therapy];

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
