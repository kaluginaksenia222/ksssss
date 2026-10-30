import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Временные замены фирменных шрифтов (с кириллицей):
// Coolvetica → Inter Tight, Helvetica Neue → Inter, Gloria Script → Great Vibes.
// Кириллица и латиница лежат в разных файлах, поэтому это разные семейства,
// а браузер подбирает нужное по символу (см. FONTS в tokens.ts).
const files: {family: string; file: string; weight: string}[] = [
  {family: 'InterTightCyr', file: 'inter-tight-cyrillic-800-normal.woff2', weight: '800'},
  {family: 'InterTightLat', file: 'inter-tight-latin-800-normal.woff2', weight: '800'},
  {family: 'InterTightCyr', file: 'inter-tight-cyrillic-900-normal.woff2', weight: '900'},
  {family: 'InterTightLat', file: 'inter-tight-latin-900-normal.woff2', weight: '900'},
  {family: 'InterCyr', file: 'inter-cyrillic-400-normal.woff2', weight: '400'},
  {family: 'InterLat', file: 'inter-latin-400-normal.woff2', weight: '400'},
  {family: 'InterCyr', file: 'inter-cyrillic-500-normal.woff2', weight: '500'},
  {family: 'InterLat', file: 'inter-latin-500-normal.woff2', weight: '500'},
  {family: 'InterCyr', file: 'inter-cyrillic-700-normal.woff2', weight: '700'},
  {family: 'InterLat', file: 'inter-latin-700-normal.woff2', weight: '700'},
  {family: 'MonoCyr', file: 'jetbrains-mono-cyrillic-500-normal.woff2', weight: '500'},
  {family: 'MonoLat', file: 'jetbrains-mono-latin-500-normal.woff2', weight: '500'},
  {family: 'GreatVibesCyr', file: 'great-vibes-cyrillic-400-normal.woff2', weight: '400'},
  {family: 'GreatVibesLat', file: 'great-vibes-latin-400-normal.woff2', weight: '400'},
];

export const fontsLoaded = Promise.all(
  files.map(({family, file, weight}) =>
    loadFont({family, url: staticFile(`fonts/${file}`), weight}),
  ),
);
