import {Easing} from 'remotion';

// Токены из DESIGN.md (раздел 9)

export const COLORS = {
  navy: '#082052',
  navy80: '#2A3E6C',
  navy40: '#9AA4BC',
  beige: '#F8F0E5',
  beigeDark: '#EDE2D1',
  beigeLine: '#DCCDB6',
  white: '#FFFFFF',
  shadow: 'rgba(8, 32, 82, 0.10)',
} as const;

// Первым идёт фирменный шрифт: если положить его файл в public/fonts и
// подключить в fonts.ts, он заменит временную замену.
export const FONTS = {
  heading: 'Coolvetica, InterTightCyr, InterTightLat, sans-serif',
  body: '"Helvetica Neue", InterCyr, InterLat, sans-serif',
  accent: '"Gloria Script", GreatVibesCyr, GreatVibesLat, cursive',
  mono: '"SF Mono", MonoCyr, MonoLat, monospace',
} as const;

export const TYPE = {
  hit: 140,
  title: 88,
  blockTitle: 48,
  caption: 44,
  captionLead: 30,
  accent: 120,
  label: 24,
  pill: 26,
} as const;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

export const SPRING = {
  pop: {damping: 14, stiffness: 180, mass: 0.6},
  soft: {damping: 200},
} as const;

// В кадрах при 30 fps
export const DUR = {
  word: 4,
  highlight: 6,
  underline: 8,
  cardIn: 8,
  stagger: 6,
  out: 7,
  modeSwitch: 11,
  logoIn: 12,
  logoHold: 10,
  logoOut: 8,
} as const;

export const LAYOUT = {
  width: 1080,
  height: 1920,
  sidePadding: 64,
  splitAt: 0.48,
  seamFade: 80,
  gridStep: 24,
  cardRadius: 20,
  pillRadius: 999,
} as const;

// Высота белой панели в режиме B
export const PANEL_HEIGHT = Math.round(LAYOUT.height * LAYOUT.splitAt);

// Координата исходника, которая оказывается на шве в режиме B:
// так в нижней половине видно лицо и руки хирурга.
export const SPLIT_SOURCE_Y = 190;
