// Рисует оформление канала Oki Doki (баннер, аватар, главное изображение, обложка шортс).
// Всё нарисовано вручную в SVG, без генерации ИИ. Запуск: node kids-channel/brand/build.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'out');
const FONTS = path.join(__dirname, 'fonts');

// ---------- палитра ----------
const C = {
  ink: '#4A2335',
  body: '#FF7A4D', bodyLight: '#FFA27A', bodyDark: '#E85A33',
  belly: '#FFE6CF', ear: '#FF9EAE',
  leaf: '#4CC25E', leafDark: '#2F9A44',
  petal: '#FFD23F', petalCore: '#FF8A3D',
  sky1: '#7FD3F7', sky2: '#C9F0FF',
  hill1: '#8EDB72', hill2: '#5FC261', hill3: '#B6EA8E',
  teal: '#2EC4B6', pink: '#FF6F91', purple: '#8C6CF2', yellow: '#FFD23F', blue: '#4D96FF',
};

const g = (x, y, s, r, inner) =>
  `<g transform="translate(${x} ${y}) rotate(${r || 0}) scale(${s})">${inner}</g>`;

// ---------- персонаж Оки ----------
// Круглый коралловый малыш с росточком на голове.
// Фишка сериала: когда Оки делает правильную вещь, росток распускается в цветок.
function oki({ mood = 'happy', top = 'leaf', armL = 'down', armR = 'down', look = [0, 0], prop = '' } = {}) {
  const sw = 6;
  const st = `stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
  const arm = (side, pose) => {
    const sx = side === 'L' ? -1 : 1;
    if (pose === 'up') return `<ellipse cx="${sx * 92}" cy="-40" rx="17" ry="32" transform="rotate(${sx * 35} ${sx * 92} -40)" fill="${C.body}" ${st}/>`;
    if (pose === 'wave') return `<ellipse cx="${sx * 90}" cy="-30" rx="17" ry="30" transform="rotate(${sx * 50} ${sx * 90} -30)" fill="${C.body}" ${st}/>`;
    return `<ellipse cx="${sx * 90}" cy="24" rx="17" ry="30" transform="rotate(${sx * -25} ${sx * 90} 24)" fill="${C.body}" ${st}/>`;
  };
  const [lx, ly] = look;
  const eye = (x) => `
    <ellipse cx="${x}" cy="-14" rx="21" ry="26" fill="#fff" ${st}/>
    <circle cx="${x + lx * 6}" cy="${-10 + ly * 6}" r="14" fill="#2B2340"/>
    <circle cx="${x + lx * 6 - 5}" cy="${-16 + ly * 6}" r="5.5" fill="#fff"/>
    <circle cx="${x + lx * 6 + 5}" cy="${-4 + ly * 6}" r="2.5" fill="#fff"/>`;
  const closedEye = (x) => `<path d="M${x - 16} -12 Q${x} 4 ${x + 16} -12" fill="none" ${st}/>`;
  let face;
  if (mood === 'sleepy') {
    face = closedEye(-32) + closedEye(32) + `<ellipse cx="0" cy="24" rx="7" ry="8" fill="#7A1F2B" ${st} stroke-width="4"/>`;
  } else if (mood === 'joy') {
    face = closedEye(-32).replace('Q-32 4', 'Q-32 -30').replace('-12 Q', '-6 Q') + closedEye(32).replace('Q32 4', 'Q32 -30').replace('-12 Q', '-6 Q') +
      `<path d="M-24 14 Q0 52 24 14 Z" fill="#7A1F2B" ${st} stroke-width="5"/><ellipse cx="0" cy="34" rx="10" ry="6" fill="#FF7A8A"/>`;
  } else {
    face = eye(-32) + eye(32) +
      `<path d="M-20 18 Q0 46 20 18 Z" fill="#7A1F2B" ${st} stroke-width="5"/><ellipse cx="0" cy="32" rx="9" ry="5" fill="#FF7A8A"/>`;
  }
  const leafTop = `
    <path d="M0 -84 Q-4 -112 6 -128" fill="none" stroke="${C.leafDark}" stroke-width="7" stroke-linecap="round"/>
    <path d="M6 -126 Q-34 -150 -46 -118 Q-14 -104 6 -126 Z" fill="${C.leaf}" ${st} stroke-width="5"/>
    <path d="M6 -126 Q40 -158 56 -124 Q26 -106 6 -126 Z" fill="${C.leaf}" ${st} stroke-width="5"/>`;
  const petals = [0, 72, 144, 216, 288].map((a) =>
    `<ellipse cx="0" cy="-20" rx="13" ry="19" transform="rotate(${a})" fill="${C.petal}" ${st} stroke-width="4.5"/>`).join('');
  const flowerTop = `
    <path d="M0 -84 Q-4 -112 4 -132" fill="none" stroke="${C.leafDark}" stroke-width="7" stroke-linecap="round"/>
    <path d="M2 -106 Q-30 -122 -38 -98 Q-14 -90 2 -106 Z" fill="${C.leaf}" ${st} stroke-width="5"/>
    <g transform="translate(4 -150)">${petals}<circle r="12" fill="${C.petalCore}" ${st} stroke-width="4.5"/></g>`;
  return `
    <ellipse cx="0" cy="104" rx="92" ry="14" fill="#000" opacity=".12"/>
    <ellipse cx="-40" cy="86" rx="30" ry="17" fill="${C.bodyDark}" ${st}/>
    <ellipse cx="40" cy="86" rx="30" ry="17" fill="${C.bodyDark}" ${st}/>
    ${top === 'flower' ? flowerTop : leafTop}
    <circle cx="-56" cy="-62" r="22" fill="${C.body}" ${st}/><circle cx="-56" cy="-62" r="10" fill="${C.ear}"/>
    <circle cx="56" cy="-62" r="22" fill="${C.body}" ${st}/><circle cx="56" cy="-62" r="10" fill="${C.ear}"/>
    ${armL === 'down' ? arm('L', armL) : ''}${armR === 'down' ? arm('R', armR) : ''}
    <ellipse cx="0" cy="4" rx="90" ry="84" fill="url(#okiBody)" ${st}/>
    <ellipse cx="0" cy="40" rx="54" ry="40" fill="${C.belly}"/>
    <ellipse cx="-34" cy="-50" rx="22" ry="11" transform="rotate(-25 -34 -50)" fill="#fff" opacity=".35"/>
    ${armL !== 'down' ? arm('L', armL) : ''}${armR !== 'down' ? arm('R', armR) : ''}
    <ellipse cx="-62" cy="16" rx="14" ry="9" fill="#FF4F6D" opacity=".45"/>
    <ellipse cx="62" cy="16" rx="14" ry="9" fill="#FF4F6D" opacity=".45"/>
    ${face}
    ${prop}`;
}

// ---------- иконки привычек ----------
const ink = `stroke="${C.ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const I = {
  toothbrush: () => `
    <rect x="-62" y="-10" width="92" height="20" rx="10" fill="${C.teal}" ${ink}/>
    <rect x="24" y="-11" width="42" height="22" rx="7" fill="#fff" ${ink}/>
    <rect x="28" y="-36" width="34" height="24" rx="6" fill="#DFF6FF" ${ink}/>
    <path d="M37 -34 V-14 M45 -34 V-14 M53 -34 V-14" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 -38 q6 -14 14 -4 q8 -14 16 0" fill="#fff" ${ink} stroke-width="4"/>`,
  bubble: () => `
    <circle r="40" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="5"/>
    <path d="M-22 -10 A24 24 0 0 1 -6 -24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  moon: () => `<path d="M10 -44 A44 44 0 1 0 40 22 A34 34 0 0 1 10 -44 Z" fill="${C.yellow}" ${ink}/>`,
  star: () => {
    const p = [];
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 40; const a = -Math.PI / 2 + i * Math.PI / 5; p.push(`${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`); }
    return `<polygon points="${p.join(' ')}" fill="${C.yellow}" ${ink}/>`;
  },
  book: () => `
    <path d="M0 -30 Q-26 -42 -54 -32 V34 Q-26 24 0 36 Q26 24 54 34 V-32 Q26 -42 0 -30 Z" fill="${C.purple}" ${ink}/>
    <path d="M0 -24 Q-22 -34 -46 -26 V26 Q-22 18 0 28 Z" fill="#fff" ${ink} stroke-width="4"/>
    <path d="M0 -24 Q22 -34 46 -26 V26 Q22 18 0 28 Z" fill="#fff" ${ink} stroke-width="4"/>
    <path d="M-36 -10 Q-22 -16 -10 -10 M-36 4 Q-22 -2 -10 4 M10 -10 Q22 -16 36 -10 M10 4 Q22 -2 36 4" fill="none" stroke="#C9B8FF" stroke-width="4" stroke-linecap="round"/>`,
  apple: () => `
    <path d="M0 -24 C-30 -44 -52 -14 -44 14 C-36 42 -14 50 0 40 C14 50 36 42 44 14 C52 -14 30 -44 0 -24 Z" fill="#FF5A5F" ${ink}/>
    <path d="M0 -24 Q2 -40 10 -48" fill="none" ${ink}/>
    <path d="M6 -40 Q20 -60 36 -46 Q20 -34 6 -40 Z" fill="${C.leaf}" ${ink} stroke-width="4"/>
    <ellipse cx="-24" cy="-6" rx="8" ry="12" fill="#fff" opacity=".45"/>`,
  soap: () => `
    <rect x="-46" y="-26" width="92" height="56" rx="22" fill="${C.pink}" ${ink}/>
    <ellipse cx="-14" cy="-6" rx="18" ry="8" fill="#fff" opacity=".5"/>
    <circle cx="-30" cy="-42" r="13" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-width="4"/>
    <circle cx="4" cy="-50" r="9" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-width="4"/>
    <circle cx="30" cy="-40" r="15" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-width="4"/>`,
  drop: () => `<path d="M0 -46 C18 -18 34 0 34 18 A34 34 0 0 1 -34 18 C-34 0 -18 -18 0 -46 Z" fill="${C.blue}" ${ink}/>
    <path d="M-16 14 A16 16 0 0 0 -4 30" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>`,
  backpack: () => `
    <path d="M-22 -40 Q0 -64 22 -40" fill="none" ${ink} stroke-width="8"/>
    <rect x="-44" y="-42" width="88" height="90" rx="26" fill="${C.yellow}" ${ink}/>
    <rect x="-28" y="6" width="56" height="32" rx="10" fill="#FFB238" ${ink} stroke-width="4"/>
    <path d="M-28 18 H28" stroke="${C.ink}" stroke-width="4"/>`,
  heart: () => `<path d="M0 34 C-50 4 -48 -38 -20 -38 C-8 -38 0 -28 0 -20 C0 -28 8 -38 20 -38 C48 -38 50 4 0 34 Z" fill="${C.pink}" ${ink}/>`,
  sun: () => {
    const rays = Array.from({ length: 10 }, (_, i) => `<path d="M0 -50 V-64" transform="rotate(${i * 36})" stroke="#FFB238" stroke-width="8" stroke-linecap="round"/>`).join('');
    return rays + `<circle r="38" fill="${C.yellow}" ${ink}/>`;
  },
  cloud: (op = 1) => `<g opacity="${op}" fill="#fff">
    <circle cx="-50" cy="10" r="34"/><circle cx="-10" cy="-14" r="46"/><circle cx="40" cy="4" r="38"/><circle cx="74" cy="20" r="24"/>
    <rect x="-84" y="10" width="182" height="34" rx="17"/></g>`,
};

// иконка в цветном кружке
const badge = (x, y, s, color, icon, r = 0) =>
  g(x, y, s, r, `<circle r="70" fill="${color}" ${ink} stroke-width="6"/><circle r="70" fill="url(#badgeShine)"/>${g(0, 4, 0.82, 0, icon)}`);

const defs = `
  <defs>
    <radialGradient id="okiBody" cx="35%" cy="28%" r="80%">
      <stop offset="0" stop-color="${C.bodyLight}"/><stop offset=".55" stop-color="${C.body}"/><stop offset="1" stop-color="${C.bodyDark}"/>
    </radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/>
    </linearGradient>
    <radialGradient id="badgeShine" cx="35%" cy="25%" r="70%">
      <stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FFF6C9" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6C9" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#2B4C7E" flood-opacity=".25"/></filter>
  </defs>`;

const fontCss = `
  @font-face{font-family:Fredoka;font-weight:600;src:url('file://${FONTS}/fredoka-latin-600-normal.woff2') format('woff2')}
  @font-face{font-family:Fredoka;font-weight:700;src:url('file://${FONTS}/fredoka-latin-700-normal.woff2') format('woff2')}
  html,body{margin:0;padding:0;background:#fff}svg{display:block}
  text{font-family:Fredoka}`;

// Логотип: «Oki Doki» объёмными буквами с тёмной обводкой и тенью
function logo(x, y, size) {
  const words = `<tspan fill="${C.body}">Oki</tspan> <tspan fill="${C.yellow}">Doki</tspan>`;
  const plain = 'Oki Doki';
  const base = `x="0" y="0" text-anchor="middle" font-size="${size}" font-weight="700" stroke-linejoin="round"`;
  return `<g transform="translate(${x} ${y})">
    <text ${base} fill="${C.ink}" stroke="${C.ink}" stroke-width="${size * 0.17}" transform="translate(0 ${size * 0.07})">${plain}</text>
    <text ${base} fill="#fff" stroke="#fff" stroke-width="${size * 0.17}" transform="translate(0 ${size * 0.0})" opacity="0">${plain}</text>
    <text ${base} stroke="${C.ink}" stroke-width="${size * 0.1}" paint-order="stroke">${words}</text>
  </g>`;
}

function page(w, h, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}</style></head><body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg></body></html>`;
}

// фон: небо, облака, холмы
function scene(w, h, { hillY = 0.78 } = {}) {
  const hy = h * hillY;
  return `
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    <path d="M0 ${hy + 40} Q${w * 0.2} ${hy - 90} ${w * 0.45} ${hy + 10} T${w} ${hy - 40} V${h} H0 Z" fill="${C.hill3}"/>
    <path d="M0 ${hy + 90} Q${w * 0.3} ${hy - 10} ${w * 0.6} ${hy + 80} T${w} ${hy + 50} V${h} H0 Z" fill="${C.hill1}"/>
    <path d="M0 ${hy + 160} Q${w * 0.25} ${hy + 90} ${w * 0.5} ${hy + 150} T${w} ${hy + 130} V${h} H0 Z" fill="${C.hill2}"/>`;
}

// ---------- 1. Баннер 2560×1440 ----------
// Безопасная зона (видна везде): 1546×423 по центру → x 507..2053, y 508..931
function banner() {
  const W = 2560, H = 1440;
  const sub = `<text x="1580" y="870" text-anchor="middle" font-size="62" font-weight="600" fill="${C.ink}">Happy habits · Music only</text>`;
  return page(W, H, `
    ${scene(W, H, { hillY: 0.72 })}
    ${g(330, 300, 1.4, 0, I.cloud(0.95))}${g(2250, 260, 1.2, 0, I.cloud(0.9))}${g(1300, 180, 0.9, 0, I.cloud(0.8))}
    ${g(2330, 520, 0.9, 0, I.sun())}
    ${g(260, 640, 1.1, 0, I.bubble())}${g(380, 520, 0.6, 0, I.bubble())}${g(2420, 760, 0.8, 0, I.bubble())}${g(2200, 900, 0.5, 0, I.bubble())}
    ${badge(250, 1040, 0.95, '#fff', I.toothbrush(), -12)}
    ${badge(440, 1180, 0.8, '#fff', I.soap(), 8)}
    ${badge(2140, 1120, 0.85, '#2B3A7A', I.moon(), 10)}
    ${badge(2340, 1010, 0.85, '#fff', I.book(), -8)}
    ${badge(2330, 1260, 0.75, '#fff', I.apple(), 6)}
    ${g(860, 1000, 0.6, -15, I.star())}${g(1980, 470, 0.55, 12, I.star())}
    <ellipse cx="760" cy="760" rx="280" ry="280" fill="url(#glow)"/>
    ${g(760, 790, 1.3, -4, oki({ top: 'flower', armR: 'wave', look: [0.4, -0.2] }))}
    ${logo(1580, 740, 240)}
    ${sub}
  `);
}

// ---------- 2. Аватар 800×800 ----------
function avatar() {
  const W = 800;
  const rays = Array.from({ length: 16 }, (_, i) =>
    `<path d="M0 0 L-60 -520 L60 -520 Z" transform="rotate(${i * 22.5})" fill="#fff" opacity=".18"/>`).join('');
  return page(W, W, `
    <rect width="${W}" height="${W}" fill="${C.yellow}"/>
    <g transform="translate(400 400)">${rays}</g>
    <circle cx="400" cy="400" r="330" fill="#FFE27A"/>
    ${g(400, 455, 2.05, 0, oki({ top: 'flower', mood: 'happy' }))}
  `);
}

// ---------- 3. Главное изображение 1920×1080 (ключевой арт / превью трейлера) ----------
function keyArt() {
  const W = 1920, H = 1080;
  const ring = [
    [I.toothbrush(), '#fff', -10], [I.soap(), '#fff', 6], [I.backpack(), '#fff', -6], [I.book(), '#fff', 8],
    [I.apple(), '#fff', -4], [I.moon(), '#2B3A7A', 10], [I.heart(), '#fff', -8], [I.drop(), '#fff', 6],
  ];
  const pos = [[330, 330], [250, 620], [420, 880], [1500, 880], [1670, 620], [1590, 330], [700, 180], [1220, 180]];
  return page(W, H, `
    ${scene(W, H, { hillY: 0.74 })}
    ${g(260, 140, 0.9, 0, I.cloud(0.9))}${g(1720, 120, 0.8, 0, I.cloud(0.85))}
    <ellipse cx="960" cy="620" rx="420" ry="420" fill="url(#glow)"/>
    ${ring.map(([ic, col, r], i) => badge(pos[i][0], pos[i][1], 0.95, col, ic, r)).join('')}
    ${g(960, 640, 2.15, 0, oki({ top: 'flower', mood: 'joy', armL: 'up', armR: 'up' }))}
    ${g(620, 470, 0.5, -12, I.star())}${g(1310, 430, 0.6, 14, I.star())}${g(1180, 300, 0.35, 0, I.star())}
    ${logo(960, 1000, 120)}
  `);
}

// ---------- 4. Обложка для Shorts 1080×1920 (пример серии «Чистим зубы», без текста) ----------
function shortsCover() {
  const W = 1080, H = 1920;
  const brush = g(112, -40, 0.9, -60, I.toothbrush());
  const foam = [[30, 34, 10], [44, 24, 7], [40, 44, 6]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="3.5"/>`).join('');
  const tiles = [];
  for (let y = 0; y < 9; y++) for (let x = 0; x < 6; x++)
    tiles.push(`<rect x="${x * 180 + 4}" y="${y * 180 + 4}" width="172" height="172" rx="22" fill="#fff" opacity="${(x + y) % 2 ? 0.14 : 0.22}"/>`);
  const cup = `
    <path d="M-20 -60 L-6 -150" stroke="${C.pink}" stroke-width="14" stroke-linecap="round"/>
    <rect x="-22" y="-176" width="26" height="34" rx="6" transform="rotate(10 -9 -159)" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
    <path d="M-60 -80 H60 L50 40 Q48 60 28 60 H-28 Q-48 60 -50 40 Z" fill="${C.purple}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M-40 -60 L-34 30" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".4"/>`;
  return page(W, H, `
    <rect width="${W}" height="${H}" fill="#7FD8E8"/>
    ${tiles.join('')}
    <rect x="90" y="170" width="330" height="330" rx="40" fill="url(#sky)" stroke="${C.ink}" stroke-width="10"/>
    ${g(255, 335, 1.1, 0, I.sun())}
    <path d="M255 175 V495 M95 335 H415" stroke="${C.ink}" stroke-width="10"/>
    ${g(820, 300, 1.3, 0, I.bubble())}${g(950, 520, 0.7, 0, I.bubble())}${g(130, 760, 1.0, 0, I.bubble())}${g(960, 900, 1.2, 0, I.bubble())}${g(660, 160, 0.5, 0, I.bubble())}${g(120, 1250, 0.6, 0, I.bubble())}
    <ellipse cx="540" cy="1000" rx="470" ry="470" fill="url(#glow)"/>
    ${g(540, 1090, 2.75, 0, oki({ top: 'flower', mood: 'happy', armR: 'up', look: [0.2, 0], prop: brush + foam }))}
    <rect x="0" y="1450" width="${W}" height="470" fill="#E9FBFF"/>
    <rect x="-20" y="1430" width="${W + 40}" height="60" rx="30" fill="#fff" stroke="${C.ink}" stroke-width="10"/>
    ${g(230, 1370, 1.15, 0, cup)}
    ${g(850, 1395, 1.0, 0, I.soap())}
    ${g(540, 1700, 0.9, 0, I.bubble())}${g(320, 1640, 0.5, 0, I.bubble())}${g(780, 1680, 0.6, 0, I.bubble())}
  `);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = [
    ['banner_2560x1440', 2560, 1440, banner()],
    ['avatar_800x800', 800, 800, avatar()],
    ['key-art_1920x1080', 1920, 1080, keyArt()],
    ['shorts-cover_1080x1920', 1080, 1920, shortsCover()],
  ];
  const browser = await chromium.launch();
  for (const [name, w, h, html] of jobs) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const file = path.join(OUT, name + '.html');
    fs.writeFileSync(file, html);
    await p.goto('file://' + file);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    fs.unlinkSync(file);
    await p.close();
  }
  await browser.close();
  console.log('ok');
})();
