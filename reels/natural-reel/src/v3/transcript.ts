// Расшифровка голоса (Whisper small) с исправленными терминами.
// По 2 слова на экране, без знаков препинания в конце.
export type Word = {text: string; start: number; end: number};
export type Page = {words: Word[]};

export const PAGES: Page[] = [
  {words: [{text: "Самый", start: 0.00, end: 0.38}, {text: "частый", start: 0.38, end: 0.66}]},
  {words: [{text: "страх", start: 0.66, end: 0.86}, {text: "перед", start: 0.86, end: 1.10}]},
  {words: [{text: "пластической", start: 1.10, end: 1.64}, {text: "операцией", start: 1.64, end: 2.16}]},
  {words: [{text: "будет", start: 2.16, end: 2.36}, {text: "выглядеть", start: 2.36, end: 2.88}]},
  {words: [{text: "переделанной", start: 2.88, end: 3.60}]},
  {words: [{text: "но", start: 3.60, end: 4.04}, {text: "хорошая", start: 4.04, end: 4.40}]},
  {words: [{text: "пластическая", start: 4.40, end: 5.04}, {text: "хирургия", start: 5.04, end: 5.74}]},
  {words: [{text: "это", start: 5.82, end: 6.12}, {text: "когда", start: 6.12, end: 6.32}]},
  {words: [{text: "никто", start: 6.32, end: 6.62}, {text: "не", start: 6.62, end: 6.78}]},
  {words: [{text: "понимает", start: 6.78, end: 7.22}]},
  {words: [{text: "что", start: 7.26, end: 7.36}, {text: "была", start: 7.36, end: 7.58}]},
  {words: [{text: "выполнена", start: 7.58, end: 8.06}, {text: "операция", start: 8.06, end: 8.54}]},
  {words: [{text: "Задача", start: 9.08, end: 9.44}, {text: "пластического", start: 9.44, end: 9.98}]},
  {words: [{text: "хирурга", start: 9.98, end: 10.52}, {text: "сохранить", start: 10.72, end: 11.14}]},
  {words: [{text: "естественные", start: 11.14, end: 11.76}, {text: "пропорции", start: 11.76, end: 12.32}]},
  {words: [{text: "лица", start: 12.32, end: 12.68}, {text: "и", start: 12.68, end: 12.90}]},
  {words: [{text: "тела", start: 12.90, end: 13.70}]},
  {words: [{text: "а", start: 13.96, end: 14.14}, {text: "не", start: 14.14, end: 14.35}]},
  {words: [{text: "изменить", start: 14.35, end: 14.56}, {text: "человека", start: 14.56, end: 14.92}]},
  {words: [{text: "до", start: 14.92, end: 15.18}, {text: "неузнаваемости", start: 15.18, end: 16.00}]},
  {words: [{text: "А", start: 16.08, end: 16.16}, {text: "реальные", start: 16.16, end: 16.48}]},
  {words: [{text: "результаты", start: 16.48, end: 17.02}, {text: "вы", start: 17.02, end: 17.12}]},
  {words: [{text: "можете", start: 17.12, end: 17.38}, {text: "посмотреть", start: 17.38, end: 17.90}]},
  {words: [{text: "в", start: 17.90, end: 18.16}, {text: "актуальном", start: 18.16, end: 18.62}]},
  {words: [{text: "«до/после»", start: 18.62, end: 19.18}]},
];
