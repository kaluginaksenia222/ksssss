// Серия 3 «Телефон в сторону — идём играть». Кадр по времени t → SVG 1080×1920. Длина 25 с.
// Другая анимация, чем в 1–2 сериях: серый мир, разлив цвета, резкий перелёт камеры, бег с движущимся фоном, радуга.
// 0–2: крупно — Оки залип в телефон, глаза-спиральки, комната серая, за окном всё яркое.
// 2–4.6: мячик стучит в окно, Оки не замечает.  4.8–6.0: мячик влетает и прыгает Оки на голову — очнулся!
// 6.8–7.3: телефон улетает на полку и засыпает.  7.5–8.0: по комнате разливается цвет.  8.2–8.6: камера перелетает на улицу.
// 9–12.5: мячик прыгает у Оки на голове в такт.  13–16: бегут, фон едет.  16–17: большой прыжок, радуга.
// 19: цветок.  19.5–22: танец.  22: значок «мячик + галочка».  22.5–25: машут на прощание.
const { C, clamp, lerp, E, kf, win, g, ink, okiSVG, okiPoint, ballSVG, P, DEFS } = require('../../lib/anim');

const W = 1080, H = 1920;
const S = 2.75;
const OUT_X = 1080; // улица справа от комнаты
const HEAD_TOP = (y) => y - 88 * S;

// ---------- время: положение камеры по горизонтали ----------
const camX = (t) => kf(t, [[8.2, 0], [8.6, OUT_X, E.inOut]]);
const chase = (t) => (t < 13 ? 0 : t < 16 ? (t - 13) * 800 : 2400 + (t - 16) * 0); // прокрутка фона при беге

// ---------- комната ----------
function room(t) {
  const stripes = Array.from({ length: 9 }, (_, i) => `<rect x="${i * 130}" y="0" width="60" height="1440" fill="#fff" opacity=".12"/>`).join('');
  const planks = Array.from({ length: 6 }, (_, i) => `<path d="M0 ${1500 + i * 80} H1080" stroke="#B9814B" stroke-width="4"/>`).join('');
  return `
    <rect x="-200" y="-200" width="1480" height="1660" fill="#B8A6F0"/>${stripes}
    <rect x="-200" y="1430" width="1480" height="700" fill="#E3AE73"/>${planks}
    <rect x="-200" y="1410" width="1480" height="30" fill="#fff" ${ink(6)}/>
    <ellipse cx="600" cy="1445" rx="330" ry="40" fill="#FF9EAE" ${ink(6)}/>
    <rect x="790" y="905" width="250" height="26" rx="8" fill="#C98B52" ${ink(6)}/>
    <g transform="translate(990 905)"><path d="M-26 0 L-20 -50 H20 L26 0 Z" fill="#FF8A5B" ${ink(5)}/>
      <path d="M0 -50 Q-30 -100 -10 -120 M0 -50 Q20 -110 34 -100 M0 -50 Q4 -100 6 -130" fill="none" stroke="${C.leafDark}" stroke-width="7" stroke-linecap="round"/></g>
    <rect x="80" y="380" width="340" height="420" rx="30" fill="#E9E2FF" ${ink(10)}/>`;
}
// вид из окна: всегда цветной
function windowView(t, ballPart) {
  return `<clipPath id="wv"><rect x="96" y="396" width="308" height="388" rx="20"/></clipPath>
    <g clip-path="url(#wv)">
      <rect x="90" y="390" width="320" height="400" fill="url(#sky)"/>
      ${g(330, 470, 0.7, t * 10, P.sun())}
      <path d="M90 700 Q200 640 300 690 T420 680 V800 H90 Z" fill="#8EDB72"/>
      <path d="M90 740 Q220 700 420 740 V800 H90 Z" fill="#5FC261"/>
      ${[[150, 720], [250, 735], [360, 715]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${C.pink}"/><circle cx="${x}" cy="${y}" r="4" fill="${C.yellow}"/>`).join('')}
      ${ballPart}
    </g>
    <rect x="80" y="380" width="340" height="420" rx="30" fill="none" ${ink(10)}/>
    <path d="M250 384 V796 M84 590 H416" ${ink(9)}/>`;
}

// ---------- улица ----------
function hillPath(y, amp, period, off, w = 3600) {
  let d = `M${-1200} ${y}`;
  for (let x = -1200; x <= w; x += 60) d += ` L${x} ${(y - amp * (0.5 + 0.5 * Math.sin(((x + off) / period) * Math.PI * 2))).toFixed(1)}`;
  return d + ` V2200 H-1200 Z`;
}
function outside(t) {
  const c = chase(t);
  const rb = win(t, 16.3, 17.2);
  const rainbowCols = ['#FF5A5F', '#FF9F43', '#FFD23F', '#4CC25E', '#4D96FF', '#8C6CF2'];
  const rainbow = rb > 0 ? rainbowCols.map((col, i) => {
    const r = 760 - i * 34;
    const len = Math.PI * r;
    return `<path d="M${540 - r} 1450 A${r} ${r} 0 0 1 ${540 + r} 1450" fill="none" stroke="${col}" stroke-width="36" stroke-dasharray="${len}" stroke-dashoffset="${(len * (1 - E.out(rb))).toFixed(1)}"/>`;
  }).join('') : '';
  const cloud = (x, y, s) => g(((x - c * 0.15) % 1500 + 1500) % 1500 - 200, y, s, 0, `<g fill="#fff"><circle cx="-50" cy="10" r="34"/><circle cx="-10" cy="-14" r="46"/><circle cx="40" cy="4" r="38"/><rect x="-84" y="10" width="160" height="34" rx="17"/></g>`);
  // цветы и дерево на переднем плане едут со скоростью бега
  const deco = [];
  for (let i = 0; i < 10; i++) {
    const x = (((i * 300 + 120 - c) % 3000) + 3000) % 3000 - 300;
    const col = [C.pink, C.yellow, C.purple, '#FF5A5F'][i % 4];
    deco.push(`<g transform="translate(${x} ${1470 + (i % 3) * 30})"><path d="M0 0 V-50" stroke="${C.leafDark}" stroke-width="6"/>
      ${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="-62" rx="9" ry="13" transform="rotate(${a} 0 -50)" fill="${col}" ${ink(3.5)}/>`).join('')}
      <circle cy="-50" r="8" fill="${C.yellow}" ${ink(3.5)}/></g>`);
  }
  const tx = (((1400 - c) % 3000) + 3000) % 3000 - 500;
  const tree = `<g transform="translate(${tx} 1420)"><rect x="-22" y="-260" width="44" height="260" rx="14" fill="#B9814B" ${ink(6)}/>
    <circle cx="0" cy="-300" r="120" fill="#5FC261" ${ink(6)}/><circle cx="-80" cy="-240" r="80" fill="#5FC261" ${ink(6)}/><circle cx="80" cy="-240" r="80" fill="#5FC261" ${ink(6)}/>
    <circle cx="-40" cy="-330" r="12" fill="#FF5A5F" ${ink(4)}/><circle cx="50" cy="-270" r="12" fill="#FF5A5F" ${ink(4)}/></g>`;
  const butterflies = [0, 1].map((i) => {
    const bx = 300 + i * 420 + Math.sin(t * 1.3 + i * 2) * 140 - (c * 0.3) % 1300;
    const by = 700 + i * 160 + Math.sin(t * 2.2 + i) * 60;
    const f = Math.abs(Math.sin(t * 14 + i));
    const wcol = i ? C.pink : C.yellow;
    return `<g transform="translate(${((bx % 1300) + 1300) % 1300 - 100} ${by})">
      <ellipse cx="-14" cy="0" rx="${16 * f + 3}" ry="20" fill="${wcol}" ${ink(4)}/><ellipse cx="14" cy="0" rx="${16 * f + 3}" ry="20" fill="${wcol}" ${ink(4)}/>
      <rect x="-4" y="-16" width="8" height="32" rx="4" fill="${C.ink}"/></g>`;
  }).join('');
  return `
    <rect x="-300" y="-300" width="1680" height="2400" fill="url(#sky)"/>
    ${g(880, 300, 1.1, t * 10, P.sun())}
    ${cloud(200, 240, 1.2)}${cloud(900, 420, 0.9)}${cloud(1400, 200, 1.0)}
    ${rainbow}
    <path d="${hillPath(1180, 160, 1080, c * 0.3)}" fill="#B6EA8E"/>
    <path d="${hillPath(1330, 110, 760, c * 0.6 + 300)}" fill="#8EDB72"/>
    ${tree}
    <rect x="-300" y="1410" width="1680" height="700" fill="#5FC261"/>
    <path d="M-300 1410 H1380" stroke="#4CAF50" stroke-width="10"/>
    ${deco.join('')}
    ${butterflies}`;
}

// ---------- Оки ----------
function okiState(t) {
  // индорная точка: x=600 в мире
  const o = { x: 600, y: 1090, s: S, sq: 0.25, rot: -3, look: [0, 0.9], droop: 1, armL: -55, armR: -55, eyes: 'spiral', spin: t * 400, mouth: 'flat', mouthOpen: 0.3, cheeks: 0.2 };
  if (t < 6.0) {
    o.sq = 0.25 + Math.sin(t * 2) * 0.03;
    // мельком смотрит на стук в окно и обратно в телефон
    if (t > 3.0 && t < 3.6) { o.eyes = undefined; o.look = kf(t, [[3.0, [0, 0.9]], [3.15, [-1, -0.3]], [3.45, [-1, -0.3]], [3.6, [0, 0.9]]]); }
  }
  if (t >= 6.0) {
    // бум! очнулся
    o.eyes = undefined; o.spin = 0;
    o.eyeS = kf(t, [[6.0, 1.3], [6.4, 1.05]]);
    o.blink = t > 6.05 && t < 6.15 ? 1 : 0;
    o.mouth = 'o'; o.mouthOpen = 1;
    o.sq = kf(t, [[6.0, 0.6], [6.15, -0.3], [6.35, 0]]);
    o.rot = 0;
    o.look = kf(t, [[6.2, [0, -1]], [6.5, [1, 0.6]], [6.8, [0, 0.9]], [7.0, [1, 0.6]]]);
    o.armL = kf(t, [[6.7, -55], [6.85, 10]]);
    o.armR = kf(t, [[6.7, -55], [6.85, 140, E.back], [7.2, 140], [7.5, 10]]);
    o.cheeks = 0.6;
    if (t > 7.0) { o.mouth = 'smile'; o.mouthOpen = 0.8; }
    o.droop = kf(t, [[7.5, 1], [8.0, 0.6, E.back]]);
    if (t >= 7.6 && t < 8.2) { o.eyes = 'happy'; o.mouth = 'grin'; o.mouthOpen = 1; o.sq = kf(t, [[7.6, 0], [7.75, 0.4], [7.95, -0.4], [8.2, 0]]); o.armL = o.armR = kf(t, [[7.6, 10], [7.9, 150, E.back]]); }
  }
  // перелёт на улицу: мировой x вместе с камерой
  if (t >= 8.2) {
    o.x = kf(t, [[8.2, 600], [8.6, OUT_X + 540, E.inOut]]);
    o.armL = o.armR = kf(t, [[8.2, 150], [8.6, 30]]);
    o.rot = kf(t, [[8.2, 0], [8.35, 12], [8.6, 0]]);
    o.eyes = 'happy'; o.mouth = 'grin'; o.mouthOpen = 1;
    const hk = win(t, 8.2, 8.6);
    if (hk > 0 && hk < 1) o.y = 1090 - Math.sin(Math.PI * hk) * 140;
  }
  // 9–12.5: мячик прыгает на голове в такт
  if (t >= 8.6 && t < 13.0) {
    o.eyes = undefined; o.look = [0.2, -1]; o.mouth = 'grin'; o.mouthOpen = 1; o.cheeks = 0.6;
    o.armL = o.armR = 30 + 20 * Math.sin(t * Math.PI * 2);
    for (let k = 0; k < 8; k++) o.sq += kf(t, [[9.0 + k * 0.5, 0], [9.06 + k * 0.5, 0.3], [9.25 + k * 0.5, 0]]);
    if (t > 12.5) o.look = kf(t, [[12.5, [0.2, -1]], [12.8, [1, 0.3]]]);
  }
  // 13–16: бежит, фон едет
  if (t >= 13.0 && t < 16.0) {
    o.x = OUT_X + 460;
    const ph = ((t - 13) % 0.25) / 0.25;
    o.y = 1090 - Math.sin(Math.PI * ph) * 40;
    o.sq = ph < 0.15 ? 0.3 : 0;
    o.rot = 8;
    o.armL = 60 + 50 * Math.sin((t - 13) * Math.PI * 4);
    o.armR = 60 - 50 * Math.sin((t - 13) * Math.PI * 4);
    o.look = [1, 0.2]; o.mouth = 'grin'; o.mouthOpen = 1; o.eyes = undefined;
    o.sproutWob = Math.sin(t * 25) * 8;
  }
  // 16–17: большой прыжок
  if (t >= 16.0 && t < 19.0) {
    o.x = kf(t, [[16.0, OUT_X + 460], [17.0, OUT_X + 480]]);
    const jk = win(t, 16.0, 17.0);
    o.y = 1090 - Math.sin(Math.PI * jk) * 340;
    o.sq = kf(t, [[16.0, 0.3], [16.1, -0.4], [16.5, 0], [16.95, -0.2], [17.05, 0.45], [17.25, 0]]);
    o.armL = o.armR = jk > 0 && jk < 1 ? 150 : kf(t, [[17.0, 150], [17.4, 20]]);
    o.eyes = jk > 0 && jk < 1 ? 'happy' : undefined;
    o.look = kf(t, [[17.2, [0, -0.6]], [17.6, [1, 0.3]], [18.2, [0, 0]]]);
    o.mouth = 'grin'; o.mouthOpen = 1; o.rot = 0;
    o.droop = kf(t, [[18.4, 0.6], [18.9, 0, E.back]]);
  }
  // 19: цветок
  if (t >= 19.0) {
    o.x = OUT_X + 480; o.y = 1090;
    o.droop = 0; o.bloom = win(t, 19.0, 19.5);
    o.mouth = 'grin'; o.mouthOpen = 1; o.eyes = 'happy'; o.rot = 0;
    if (t < 19.5) {
      o.armL = o.armR = kf(t, [[19.0, 20], [19.25, 150, E.back]]);
      o.sq = kf(t, [[19.0, 0], [19.1, 0.4], [19.3, -0.4], [19.5, 0]]);
    } else if (t < 22.5) {
      const hopT = t - 19.5, ph = (hopT % 0.5) / 0.5;
      o.y = 1090 - Math.sin(Math.PI * ph) * 70;
      o.sq = ph < 0.12 || ph > 0.9 ? 0.4 : -0.25 * Math.sin(Math.PI * ph);
      o.x = OUT_X + 420 + 60 * Math.sin(Math.PI * hopT);
      o.armL = 105 + 45 * Math.cos(Math.PI * hopT * 2);
      o.armR = 105 - 45 * Math.cos(Math.PI * hopT * 2);
      o.rot = Math.sin(Math.PI * hopT) * 6;
    } else {
      o.x = OUT_X + 420;
      o.eyes = t < 22.7 ? 'happy' : undefined;
      o.look = [0, 0]; o.mouth = 'smile';
      o.armL = 10;
      o.armR = kf(t, [[22.5, 10], [22.8, 135]]) + Math.sin((t - 22.5) * Math.PI * 4) * 22 * win(t, 22.7, 22.9);
      o.sq = kf(t, [[22.5, 0.3], [22.7, -0.1], [22.9, 0]]);
      o.blink = t > 23.6 && t < 23.75 ? 1 : 0;
    }
  }
  // телефон в лапках до 6.85
  if (t < 6.85) o.propL = g(28, -10, 0.62, 0, P.phone('game', t));
  // синий отсвет экрана на лице
  if (t < 6.85) o.face = `<ellipse cx="0" cy="0" rx="80" ry="70" fill="url(#phoneGlow)"/>`;
  return o;
}

// ---------- мячик ----------
function ballState(t, o) {
  // в окне (стучит) — координаты в мире комнаты
  if (t < 4.9) {
    const knocks = [2.2, 2.7, 3.2, 4.3, 4.5];
    let s = 0.75, sq = 0;
    for (const k of knocks) { s += 0.25 * Math.sin(Math.PI * win(t, k - 0.12, k + 0.12)); sq += 0.4 * Math.sin(Math.PI * win(t, k, k + 0.15)); }
    const y = t < 4.7 ? 600 + Math.sin(t * 6) * 20 : 600 - E.in(win(t, 4.7, 4.9)) * 400;
    return { inWindow: true, x: 250 + Math.sin(t * 2) * 30, y, s, sq: -sq, look: [0.8, 0.3], mood: t > 3.5 && t < 4.2 ? 'o' : 'happy' };
  }
  // влетает сверху, отскакивает от пола и от головы Оки
  if (t < 6.4) {
    const head = [600, HEAD_TOP(1090) - 64 * 1.1];
    const pts = [[t, 0]];
    let x, y, sq = 0, spin = t * 500;
    if (t < 5.6) { const k = E.in(win(t, 4.9, 5.6)); x = lerp(330, 380, k); y = lerp(-150, 1340, k); }
    else if (t < 6.0) { const k = win(t, 5.6, 6.0); x = lerp(380, head[0], k); y = lerp(1340, head[1], k) - Math.sin(Math.PI * k) * 320; sq = kf(t, [[5.6, 0.6], [5.75, 0]]); }
    else { const k = win(t, 6.0, 6.4); x = lerp(head[0], 860, k); y = lerp(head[1], 1340, k) - Math.sin(Math.PI * k) * 300; sq = kf(t, [[6.0, 0.6], [6.15, 0]]); }
    return { x, y, s: 1.1, sq, spin, look: [0.5, 0.5], mood: 'happy' };
  }
  // в комнате ждёт Оки
  if (t < 8.2) {
    const b = Math.abs(Math.sin((t - 6.4) * Math.PI * 2)) * 50 * (t < 7.6 ? 0.6 : 1.2);
    return { x: 860, y: 1340 - b, s: 1.1, sq: b < 5 ? 0.4 : 0, look: [-1, -0.2], mood: t > 7.6 ? 'wink' : 'happy' };
  }
  // перелёт на улицу
  if (t < 8.6) {
    const k = win(t, 8.2, 8.6);
    return { x: lerp(860, OUT_X + 820, E.inOut(k)), y: 1340 - Math.sin(Math.PI * k) * 200, s: 1.1, spin: t * 900, look: [1, 0], mood: 'happy' };
  }
  // прыгает на голове 9–12.5
  if (t < 13.0) {
    const head = HEAD_TOP(o.y) - 64 * 1.1 + 6;
    if (t < 9.0) { const k = win(t, 8.6, 9.0); return { x: lerp(OUT_X + 820, o.x, k), y: lerp(1340, head, k) - Math.sin(Math.PI * k) * 260, s: 1.1, spin: t * 400, look: [-1, 0.5] }; }
    if (t < 12.5) {
      const ph = ((t - 9.0) % 0.5) / 0.5;
      return { x: o.x + Math.sin(t * 3) * 20, y: head - Math.sin(Math.PI * ph) * 380, s: 1.1, sq: ph < 0.1 ? 0.5 : -0.15 * Math.sin(Math.PI * ph), spin: t * 300, look: [0, 1], mood: ph > 0.3 && ph < 0.7 ? 'wink' : 'happy' };
    }
    const k = win(t, 12.5, 13.0);
    return { x: lerp(o.x, OUT_X + 820, k), y: lerp(head, 1340, k) - Math.sin(Math.PI * k) * 300, s: 1.1, spin: t * 600, look: [-1, 0] };
  }
  // бежит впереди 13–16
  if (t < 16.0) {
    const ph = ((t - 13) % 0.5) / 0.5;
    return { x: OUT_X + 820, y: 1340 - Math.sin(Math.PI * ph) * 90, s: 1.1, sq: ph < 0.1 ? 0.4 : 0, spin: t * 900, look: [-1, 0], mood: 'happy' };
  }
  // прыжок и приземление
  if (t < 19.5) {
    const jk = win(t, 16.0, 17.0);
    const x = kf(t, [[17.0, OUT_X + 820], [18.0, OUT_X + 760]]);
    const b = t > 17.0 ? Math.abs(Math.sin((t - 17.0) * Math.PI * 2)) * 40 : 0;
    return { x, y: 1340 - Math.sin(Math.PI * jk) * 380 - b, s: 1.1, sq: kf(t, [[16.95, 0], [17.05, 0.5], [17.2, 0]]), spin: jk * 720, look: [-1, -0.2], mood: 'happy' };
  }
  // танцует рядом
  const ph = ((t - 19.5) % 0.5) / 0.5;
  const amp = t < 22.5 ? 110 : 40;
  return { x: OUT_X + 770, y: 1340 - Math.sin(Math.PI * ph) * amp, s: 1.1, sq: ph < 0.1 ? 0.4 : 0, look: [-1, -0.2], mood: t > 23 ? 'wink' : 'happy', spin: Math.sin(t * 3) * 20 };
}
const ballG = (b) => g(b.x, b.y, b.s, 0, ballSVG(b));

// ---------- телефон летит на полку и засыпает ----------
function phoneFly(t, o) {
  if (t < 6.85) return '';
  const shelf = [880, 845];
  if (t < 7.3) {
    const k = E.inOut(win(t, 6.85, 7.3));
    const start = okiPoint(okiState(6.84), 28, -10);
    return g(lerp(start[0], shelf[0], k), lerp(start[1], shelf[1], k) - Math.sin(Math.PI * k) * 250, 0.62 * S * lerp(1, 0.75, k), k * 360, P.phone('game', t));
  }
  const zz = ((t - 7.3) % 1.2) / 1.2;
  return g(shelf[0], shelf[1], 0.62 * S * 0.75, 0, P.phone('sleep')) +
    (t < 8.2 ? g(shelf[0] + 70 + zz * 40, shelf[1] - 90 - zz * 70, 0.35 * (1 - zz) + 0.1, zz * 90, P.star()) : '');
}

// ---------- эффекты ----------
function fx(t, o, b) {
  let out = '';
  // искры при каждом стуке мяча в окно
  for (const k of [2.2, 2.7, 3.2, 4.3, 4.5]) {
    const p = win(t, k, k + 0.35);
    if (p > 0 && p < 1) out += `<circle cx="250" cy="600" r="${60 + 120 * E.out(p)}" fill="none" stroke="#fff" stroke-width="${10 * (1 - p)}" opacity="${1 - p}"/>`;
  }
  // бум по голове 6.0: звёздочки кругом
  const bonk = win(t, 6.0, 6.8);
  if (bonk > 0 && bonk < 1) {
    for (let i = 0; i < 5; i++) {
      const a = t * 6 + (i / 5) * Math.PI * 2;
      out += g(600 + Math.cos(a) * 170, HEAD_TOP(1090) - 20 + Math.sin(a) * 50, 0.6 * (1 - bonk), t * 200, P.star());
    }
  }
  // ноты-звёздочки при ударах мяча о голову
  for (let k = 0; k < 8; k++) {
    const p = win(t, 9.0 + k * 0.5, 9.45 + k * 0.5);
    if (p > 0 && p < 1) {
      const hx = o.x, hy = HEAD_TOP(o.y);
      out += g(hx + (k % 2 ? 1 : -1) * (90 + 120 * p), hy - 40 * p, 0.7 * (1 - p), t * 300, k % 2 ? P.star() : P.sparkle());
    }
  }
  // полосы скорости при перелёте камеры
  const pan = win(t, 8.2, 8.6);
  if (pan > 0 && pan < 1) {
    const a = Math.sin(Math.PI * pan);
    for (let i = 0; i < 14; i++) {
      const y = 120 + i * 130 + (i % 3) * 20;
      out += `<rect x="${camX(t) + ((i * 173) % 900)}" y="${y}" width="${300 + (i % 4) * 120}" height="${10 + (i % 3) * 6}" rx="8" fill="#fff" opacity="${0.75 * a}"/>`;
    }
  }
  // пыль из-под ног при беге
  if (t > 13 && t < 16) {
    for (let i = 0; i < 6; i++) {
      const ts = 13 + i * 0.5 + ((t - 13) - ((t - 13) % 3));
      const age = ((t - 13) % 0.5) + i * 0.08;
      const p = clamp(age / 0.5);
      out += `<circle cx="${o.x - 120 - p * 200 - i * 20}" cy="${1395 - p * 40}" r="${(18 - i * 2) * (1 - p) + 2}" fill="#fff" opacity="${0.8 * (1 - p)}"/>`;
    }
  }
  // приземление после прыжка
  const land = win(t, 17.0, 17.5);
  if (land > 0 && land < 1) out += `<ellipse cx="${o.x}" cy="1400" rx="${120 + 260 * E.out(land)}" ry="${20 + 30 * land}" fill="none" stroke="#fff" stroke-width="${12 * (1 - land)}" opacity="${1 - land}"/>`;
  // цветок — конфетти
  const burst = win(t, 19.0, 20.5);
  if (burst > 0 && burst < 1) {
    const f = okiPoint(o, 6, -150);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const sp = 380 + (i % 3) * 140;
      const x = f[0] + Math.cos(a) * sp * burst;
      const y = f[1] + Math.sin(a) * sp * burst + 700 * burst * burst;
      const col = [C.yellow, C.pink, C.leaf, C.blue][i % 4];
      const piece = i % 4 === 0 ? P.star() : `<ellipse rx="16" ry="26" fill="${col}" ${ink(4)}/>`;
      out += g(x, y, (1 - burst * 0.6) * (i % 4 === 0 ? 0.6 : 0.9), t * 300 + i * 40, piece);
    }
    out += `<circle cx="${f[0]}" cy="${f[1]}" r="${60 + 300 * E.out(burst)}" fill="none" stroke="#fff" stroke-width="${16 * (1 - burst)}" opacity="${1 - burst}"/>`;
  }
  // значок «играли на улице»: мячик и зелёная галочка
  const badge = win(t, 22.1, 22.55);
  if (badge > 0) {
    out += g(OUT_X + 400, 400, E.back(badge) * 1.5, Math.sin(t * 4) * 4, `
      <circle r="86" fill="#fff" ${ink(7)}/>
      ${g(0, 6, 0.85, 0, ballSVG({ mood: 'happy' }))}
      <g transform="translate(58 -54)"><circle r="34" fill="${C.leaf}" ${ink(6)}/><path d="M-15 0 L-4 12 L16 -12" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  }
  return out;
}

// ---------- камера ----------
function camera(t) {
  // начало: крупный план лица — крючок первых секунд
  const z = kf(t, [[0, 1.75], [1.6, 1.75], [2.3, 1.1, E.inOut], [5.8, 1.1], [6.0, 1.22], [6.6, 1.1], [7.5, 1.1], [7.8, 1.0], [12.9, 1.0], [13.2, 1.0], [16.0, 1.0], [16.5, 0.9], [17.2, 1.0], [18.8, 1.0], [19.1, 1.12], [21.9, 1.12], [22.4, 1.0]]);
  const cy = kf(t, [[0, 860], [1.6, 860], [2.3, 960]]);
  const cx = 540;
  const shake = win(t, 6.0, 6.25) > 0 && win(t, 6.0, 6.25) < 1 ? Math.sin(t * 90) * 10 : 0;
  return `translate(${cx + shake} ${cy}) scale(${z.toFixed(4)}) translate(${-cx - camX(t)} ${-cy})`;
}

// ---------- кадр ----------
function frame(t) {
  const o = okiState(t);
  const b = ballState(t, o);
  const cx = camX(t);
  // насыщенность цвета комнаты: серо, пока Оки в телефоне; круг цвета разливается с 7.5
  const wipe = win(t, 7.5, 8.05);
  const indoor = (filter) => `<g ${filter}>
      ${room(t)}
    </g>`;
  const actors = (filter) => `<g ${filter}>
      ${!b.inWindow && t < 8.6 ? '' : ''}
      ${okiSVG(o)}
      ${phoneFly(t, o)}
    </g>`;
  const ballInWindow = b.inWindow ? ballG(b) : '';
  const ballFree = b.inWindow ? '' : ballG(b);
  let scene;
  const roomBlock = (f) => `${indoor(f)}${windowView(t, ballInWindow)}`;
  if (t < 7.5) {
    scene = `${roomBlock('filter="url(#gray)"')}${actors('filter="url(#gray)"')}<rect x="-300" y="-300" width="1680" height="2600" fill="#1B1640" opacity=".18"/>${ballFree}`;
  } else if (t < 8.05) {
    const r = 40 + 1900 * E.inOut(wipe);
    const center = okiPoint(o, 0, 0);
    scene = `${roomBlock('filter="url(#gray)"')}${actors('filter="url(#gray)"')}
      <clipPath id="wipe"><circle cx="${center[0]}" cy="${center[1]}" r="${r}"/></clipPath>
      <g clip-path="url(#wipe)">${roomBlock('')}${actors('')}</g>
      <circle cx="${center[0]}" cy="${center[1]}" r="${r}" fill="none" stroke="#fff" stroke-width="18" opacity="${1 - wipe}"/>
      ${ballFree}`;
  } else {
    // комната (уезжает) + улица справа
    scene = `${cx < OUT_X ? roomBlock('') : ''}
      <g transform="translate(${OUT_X} 0)">${cx > 0 ? outside(t) : ''}</g>
      ${actors('')}${ballFree}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}
    <defs>
      <filter id="gray" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0.08"/></filter>
      <radialGradient id="phoneGlow" cx="50%" cy="65%" r="60%"><stop offset="0" stop-color="#7FE0FF" stop-opacity=".55"/><stop offset="1" stop-color="#7FE0FF" stop-opacity="0"/></radialGradient>
    </defs>
    <g transform="${camera(t)}">
      ${scene}
      ${fx(t, o, b)}
    </g></svg>`;
}

module.exports = { frame, W, H, DURATION: 25 };
