// Расшифровка голоса (Whisper small) с исправленными терминами.
// По 2 слова на экране, без знаков препинания в конце.
export type Word = {text: string; start: number; end: number};
export type Page = {words: Word[]};

export const PAGES: Page[] = [
  {words: [{text: "Самый", start: 0.00, end: 0.44}, {text: "частый", start: 0.44, end: 0.72}]},
  {words: [{text: "страх", start: 0.72, end: 1.04}, {text: "перед", start: 1.04, end: 1.22}]},
  {words: [{text: "пластической", start: 1.22, end: 1.74}, {text: "операцией", start: 1.74, end: 2.38}]},
  {words: [{text: "будет", start: 2.38, end: 2.72}, {text: "выглядеть", start: 2.72, end: 3.38}]},
  {words: [{text: "переделанной", start: 3.38, end: 4.00}]},
  {words: [{text: "Но", start: 4.16, end: 4.24}, {text: "хорошая", start: 4.24, end: 4.66}]},
  {words: [{text: "пластическая", start: 4.66, end: 5.24}, {text: "хирургия", start: 5.24, end: 6.02}]},
  {words: [{text: "это", start: 6.02, end: 6.12}, {text: "когда", start: 6.12, end: 6.40}]},
  {words: [{text: "никто", start: 6.40, end: 6.90}, {text: "не", start: 6.90, end: 7.12}]},
  {words: [{text: "понимает", start: 7.12, end: 7.60}]},
  {words: [{text: "что", start: 7.66, end: 7.74}, {text: "была", start: 7.74, end: 8.00}]},
  {words: [{text: "операция", start: 8.00, end: 8.56}]},
  {words: [{text: "Задача", start: 8.84, end: 9.34}, {text: "хирурга", start: 9.34, end: 9.86}]},
  {words: [{text: "сохранить", start: 9.86, end: 10.26}, {text: "естественные", start: 10.26, end: 10.84}]},
  {words: [{text: "пропорции", start: 10.84, end: 11.36}, {text: "лица", start: 11.36, end: 11.66}]},
  {words: [{text: "и", start: 11.66, end: 11.78}, {text: "тела", start: 11.78, end: 12.42}]},
  {words: [{text: "а", start: 12.56, end: 12.60}, {text: "не", start: 12.60, end: 12.70}]},
  {words: [{text: "изменить", start: 12.70, end: 13.00}, {text: "человека", start: 13.00, end: 13.38}]},
  {words: [{text: "до", start: 13.38, end: 13.66}, {text: "неузнаваемости", start: 13.66, end: 14.42}]},
];
