// Расшифровка голоса (Whisper small) с исправленными терминами.
// По 2 слова на экране, без знаков препинания в конце.
export type Word = {text: string; start: number; end: number};
export type Page = {words: Word[]};

export const PAGES: Page[] = [
  {words: [{text: "Сегодня", start: 0.00, end: 0.60}, {text: "наша", start: 0.60, end: 0.88}]},
  {words: [{text: "прекрасная", start: 0.88, end: 1.46}, {text: "пациентка", start: 1.46, end: 1.98}]},
  {words: [{text: "пришла", start: 1.98, end: 2.42}]},
  {words: [{text: "Мы", start: 2.62, end: 2.82}, {text: "выполнили", start: 2.82, end: 3.52}]},
  {words: [{text: "абдоминопластику", start: 3.52, end: 4.48}, {text: "и", start: 4.48, end: 4.83}]},
  {words: [{text: "липосакцию", start: 4.83, end: 5.18}, {text: "боков", start: 5.18, end: 5.62}]},
  {words: [{text: "Сегодня", start: 5.68, end: 5.84}, {text: "у", start: 5.84, end: 5.98}]},
  {words: [{text: "нас", start: 5.98, end: 6.06}, {text: "16-е", start: 6.06, end: 6.48}]},
  {words: [{text: "сутки", start: 6.48, end: 7.00}, {text: "сняли", start: 7.00, end: 7.40}]},
  {words: [{text: "швы", start: 7.40, end: 7.80}]},
  {words: [{text: "Мы", start: 7.98, end: 8.04}, {text: "ещё", start: 8.04, end: 8.22}]},
  {words: [{text: "видим", start: 8.22, end: 8.48}, {text: "немножко", start: 8.48, end: 8.90}]},
  {words: [{text: "отёк", start: 8.90, end: 9.66}, {text: "присутствует", start: 9.66, end: 10.48}]},
  {words: [{text: "пупочек", start: 10.58, end: 11.04}, {text: "в", start: 11.04, end: 11.12}]},
  {words: [{text: "отёке", start: 11.12, end: 11.52}]},
  {words: [{text: "Потом", start: 11.58, end: 11.78}, {text: "это", start: 11.78, end: 11.98}]},
  {words: [{text: "всё", start: 11.98, end: 12.18}, {text: "сойдёт", start: 12.18, end: 12.54}]},
  {words: [{text: "Будет", start: 12.64, end: 12.88}, {text: "очень", start: 12.88, end: 13.02}]},
  {words: [{text: "естественно", start: 13.02, end: 13.56}, {text: "смотреться", start: 13.56, end: 14.14}]},
  {words: [{text: "Рубец", start: 14.22, end: 14.56}, {text: "у", start: 14.56, end: 14.66}]},
  {words: [{text: "нас", start: 14.66, end: 14.80}, {text: "достаточно", start: 14.80, end: 15.16}]},
  {words: [{text: "низко", start: 15.16, end: 15.94}, {text: "спрятан", start: 16.06, end: 16.42}]},
  {words: [{text: "сейчас", start: 16.42, end: 16.56}, {text: "тоже", start: 16.56, end: 16.82}]},
  {words: [{text: "подклеены", start: 16.82, end: 17.40}, {text: "специально", start: 17.40, end: 17.94}]},
  {words: [{text: "на", start: 17.94, end: 18.08}, {text: "клеечки", start: 18.08, end: 18.46}]},
  {words: [{text: "потому", start: 18.52, end: 18.70}, {text: "что", start: 18.70, end: 18.92}]},
  {words: [{text: "только", start: 18.92, end: 19.16}, {text: "что", start: 19.16, end: 19.38}]},
  {words: [{text: "отклеили", start: 19.38, end: 20.00}]},
  {words: [{text: "Теперь", start: 20.16, end: 20.60}, {text: "будем", start: 20.60, end: 20.90}]},
  {words: [{text: "заниматься", start: 20.90, end: 21.52}, {text: "противорубцовой", start: 21.52, end: 22.48}]},
  {words: [{text: "терапией", start: 22.48, end: 23.04}]},
];
