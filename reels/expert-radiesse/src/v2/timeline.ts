import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DUR, EASE} from '../design/tokens';

// Версия 2: механика последнего референса. Секунды — по расшифровке голоса.

// После хука экран делится: сверху бежевая панель со вставками, снизу видео
export const SPLIT_IN = 4.9;

// Разделы — сегменты полоски сверху и резкая смена крупности видео
export const SECTIONS = [0, 4.9, 13.4, 20.0, 35.6, 51.0, 59.7];

// Где на шве оказывается исходник: выше головы, чтобы в нижней половине было лицо и руки
export const SPLIT_SOURCE_Y = 410;

export const useSplit = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round(SPLIT_IN * fps);
  return interpolate(frame, [a, a + DUR.modeSwitch], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.inOut,
  });
};
