# Общие файлы для каруселей

- `base.css` — общие стили слайдов «Синий доктор» (1080 × 1350).
- `fonts.css` — шрифты Oswald, Montserrat, Inter, Caveat внутри CSS (из npm @fontsource, лицензия OFL).
- `mascot-cutout.webp` — 3D-хирург, вырезанный из фона.
- `render-n.js` — рендер слайдов в PNG: `node render-n.js <папка карусели> <число слайдов>`.

Сборка карусели: `python3 make.py ../_shared/base.css ../_shared/fonts.css ../_shared/mascot-cutout.webp`, затем рендер.
