// Серия 1 «Чистим зубы». Кадр по времени t (секунды) → SVG 1080×1920.
// Часть 1 (0–10.5 с): Оки сонный приходит в ванную, зевает, улыбается — из рта выпрыгивают микробы,
// Оки пугается, придумывает: щётка сама прыгает к нему в руку, паста летит на щётку.
const { C, clamp, lerp, E, kf, win, g, ink, okiSVG, handWorld, germ, P, DEFS } = require('../../lib/anim');

const W = 1080, H = 1920;
const BASE = { x: 540, y: 1090, s: 2.75 };
const CUP = [230, 1370];
const TUBE = [820, 1402];

function background(t) {
  const tiles = [];
  for (let y = 0; y < 9; y++) for (let x = 0; x < 6; x++)
    tiles.push(`<rect x="${x * 180 + 4}" y="${y * 180 + 4}" width="172" height="172" rx="22" fill="#fff" opacity="${(x + y) % 2 ? 0.14 : 0.22}"/>`);
  const sunY = kf(t, [[0, 470], [2.6, 335, E.out]]);
  return `
    <rect width="${W}" height="${H}" fill="#7FD8E8"/>
    ${tiles.join('')}
    <clipPath id="win"><rect x="90" y="170" width="330" height="330" rx="40"/></clipPath>
    <rect x="90" y="170" width="330" height="330" rx="40" fill="url(#sky)"/>
    <g clip-path="url(#win)">${g(255, sunY, 1.1, t * 8, P.sun())}</g>
    <rect x="90" y="170" width="330" height="330" rx="40" fill="none" ${ink(10)}/>
    <path d="M255 175 V495 M95 335 H415" ${ink(10)}/>
    ${g(820, 300 - (t * 14) % 60, 1.3, 0, P.bubble())}${g(950, 560 - (t * 10) % 40, 0.7, 0, P.bubble())}
    ${g(130, 760 - (t * 12) % 50, 1.0, 0, P.bubble())}${g(960, 920 - (t * 16) % 50, 1.2, 0, P.bubble())}
    <ellipse cx="540" cy="1000" rx="470" ry="470" fill="url(#glow)" opacity="${kf(t, [[0, 0.3], [2.5, 1]])}"/>`;
}

function counter() {
  return `
    <rect x="0" y="1450" width="${W}" height="470" fill="#E9FBFF"/>
    <rect x="-20" y="1430" width="${W + 40}" height="60" rx="30" fill="#fff" ${ink(10)}/>`;
}

// положение Оки и мимика по времени
function okiState(t) {
  const o = { ...BASE, sq: 0, rot: 0, look: [0, 0.3], lid: 0.55, mouth: 'flat', mouthOpen: 0.3, droop: 0.85, armL: 10, armR: 10, eyeS: 1 };

  // 0–1.6: три сонных прыжка из-за левого края
  if (t < 1.6) {
    const k = t / 1.5;
    o.x = lerp(-260, 540, E.out(clamp(k)));
    const ph = (t % 0.5) / 0.5;
    o.y = BASE.y - Math.sin(Math.PI * ph) * 80 * (t < 1.5 ? 1 : 0);
    o.sq = ph < 0.15 || ph > 0.85 ? 0.5 : -0.3 * Math.sin(Math.PI * ph);
    o.rot = Math.sin(t * 9) * 4;
  } else {
    o.sq = kf(t, [[1.5, 0.6], [1.75, -0.25], [1.95, 0]]);
  }
  // 2.0–3.2: зевок с потягиванием
  const yawn = kf(t, [[2.0, 0], [2.4, 1], [2.9, 1], [3.2, 0]]);
  if (yawn > 0) {
    o.armL = o.armR = lerp(10, 155, yawn);
    o.sq = -0.7 * yawn;
    o.mouth = 'yawn'; o.mouthOpen = yawn;
    o.blink = yawn > 0.3 ? 1 : 0;
  }
  if (t > 3.25 && t < 3.4) o.blink = 1; // моргнул, проснулся

  // 3.5–6.6: широкая улыбка → микробы → испуг
  if (t >= 3.4 && t < 6.6) {
    o.lid = kf(t, [[3.4, 0.55], [3.6, 0]]);
    o.mouth = 'grin'; o.mouthOpen = kf(t, [[3.4, 0], [3.6, 1, E.back]]);
    o.teethDirt = 1;
    o.look = [0, 0];
    o.cheeks = 0.6;
    if (t > 4.5) {
      // испуг
      const s = win(t, 4.5, 4.7);
      o.eyeS = lerp(1, 1.28, E.back(s));
      o.mouth = 'o'; o.mouthOpen = s;
      o.droop = lerp(0.85, 1, s);
      o.rot = Math.sin(t * 40) * 2.5 * (t < 5.3 ? 1 : 0);
      o.sproutWob = Math.sin(t * 30) * 6 * (t < 5.3 ? 1 : 0);
      o.sq = kf(t, [[4.5, 0], [4.6, -0.5], [4.8, 0.2], [5.0, 0]]);
      o.armL = o.armR = kf(t, [[4.5, 10], [4.7, 40, E.back]]);
      // смотрит то на одного, то на другого микроба
      o.look = kf(t, [[4.8, [0, 0]], [5.1, [-0.9, -0.6]], [5.6, [-0.9, -0.6]], [5.9, [0.9, -0.5]], [6.4, [0.9, -0.5]]]);
    }
  }
  // 6.6–7.2: придумал! смотрит на стаканчик со щёткой
  if (t >= 6.6) {
    o.lid = 0; o.eyeS = kf(t, [[6.6, 1.28], [6.9, 1]]);
    o.look = kf(t, [[6.6, [0.9, -0.5]], [6.9, [-1, 0.6]]]);
    o.mouth = 'smile'; o.mouthOpen = kf(t, [[6.6, 0.2], [7.0, 0.7]]);
    o.droop = kf(t, [[6.8, 1], [7.4, 0.6]]);
    o.armL = kf(t, [[6.6, 40], [7.0, 10], [7.5, 75, E.back], [9.7, 75], [10.0, 135, E.back]]);
    o.armR = kf(t, [[6.6, 40], [7.0, 10]]);
    o.sq = kf(t, [[6.9, 0], [7.0, 0.3], [7.15, -0.2], [7.3, 0]]);
    if (t > 8.3) o.look = kf(t, [[8.3, [-1, 0.6]], [8.5, [-0.8, -0.8]], [9.0, [0.9, 0.5]], [9.4, [-0.6, -0.9]]]);
    if (t > 9.7) {
      o.mouth = 'grin'; o.mouthOpen = kf(t, [[9.7, 0.5], [10.0, 1, E.back]]); o.teethDirt = 1;
      o.sq = kf(t, [[9.7, 0], [9.85, 0.35], [10.05, -0.3], [10.3, 0]]);
      o.eyes = t > 9.9 ? 'happy' : undefined;
    }
  }
  return o;
}

// щётка в мире или в руке
const BRUSH_S = 0.9 / 2.75; // в руке Оки щётка того же экранного размера, что и в стакане
const BRUSH_ROT_HAND = -70;
function brushHeadWorld(hand) {
  const a = (BRUSH_ROT_HAND * Math.PI) / 180;
  const lx = 45 * 1.25, ly = -38 * 1.25;
  return [hand[0] + lx * Math.cos(a) - ly * Math.sin(a), hand[1] + lx * Math.sin(a) + ly * Math.cos(a)];
}

function germs(t, o) {
  if (t < 3.6) return '';
  const mouth = [o.x, o.y + 25 * o.s];
  const spots = [[300, 760], [790, 720], [820, 980]];
  const starts = [3.7, 4.0, 4.3];
  let out = '';
  spots.forEach(([sx, sy], i) => {
    const t0 = starts[i];
    if (t < t0) return;
    const k = win(t, t0, t0 + 0.45);
    // вылет по дуге изо рта
    const x = lerp(mouth[0], sx, E.out(k));
    const y = lerp(mouth[1], sy, E.out(k)) - Math.sin(Math.PI * k) * 160;
    const s = lerp(0.3, 1.85, E.back(k));
    // танец в такт (0.5 с) — покачивание
    const beat = (t * 2 + i * 0.5) % 1;
    const dance = k >= 1 ? Math.sin(beat * Math.PI * 2) : 0;
    const scared = t > 8.3;
    const shake = scared ? Math.sin(t * 50 + i) * 4 : 0;
    out += g(x + dance * 14 + shake, y - Math.abs(dance) * 18, s, dance * 12, germ(t, { hue: i, phase: i * 2, mood: scared ? 'scared' : 'cheeky' }));
  });
  return out;
}

function props(t, o) {
  let out = '';
  // стакан и щётка
  const brushInCup = t < 7.6;
  const cupBrush = g(CUP[0] - 20, CUP[1] - 150, 1.25, -80, P.toothbrush());
  out += g(CUP[0], CUP[1], 1.15, 0, (brushInCup ? '' : '') + P.cup());
  if (brushInCup) {
    const hop = t > 7.0 ? Math.abs(Math.sin((t - 7.0) * 18)) * 18 * win(t, 7.0, 7.2) : 0;
    out = g(CUP[0] - 15, CUP[1] - 175 - hop, 1.25, -80 + Math.sin(t * 30) * (t > 7.0 ? 6 : 0), P.toothbrush()) + out;
  }
  // полёт щётки 7.6–8.3
  if (t >= 7.6 && t < 8.3) {
    const k = E.inOut(win(t, 7.6, 8.3));
    const hand = handWorld(o, 'L');
    const x = lerp(CUP[0] - 15, hand[0], k), y = lerp(CUP[1] - 175, hand[1], k) - Math.sin(Math.PI * k) * 260;
    out += g(x, y, 1.25, lerp(-80, BRUSH_ROT_HAND + 360, k), P.toothbrush());
    // искорки следом
    for (let i = 1; i <= 3; i++) {
      const kk = E.inOut(win(t - i * 0.05, 7.6, 8.3));
      const sx = lerp(CUP[0] - 15, hand[0], kk), sy = lerp(CUP[1] - 175, hand[1], kk) - Math.sin(Math.PI * kk) * 260;
      out += g(sx, sy, 0.5 - i * 0.12, t * 300, P.sparkle());
    }
  }
  // тюбик
  const sq = kf(t, [[8.7, 0], [8.85, 1, E.out], [9.2, 1], [9.4, 0]]);
  out += g(TUBE[0] + 40, TUBE[1] - 8, 0.9, 180, P.tube(sq));
  // капля пасты летит 8.85–9.4
  const hand = handWorld(o, 'L');
  const head = brushHeadWorld(hand);
  if (t >= 8.85 && t < 9.4) {
    const k = win(t, 8.85, 9.4);
    const from = [TUBE[0] - 30, TUBE[1] - 10];
    const x = lerp(from[0], head[0], k), y = lerp(from[1], head[1], k) - Math.sin(Math.PI * k) * 300;
    out += g(x, y, 0.9, k * 540, `<path d="M-18 0 Q-20 -16 -4 -14 Q0 -24 10 -16 Q22 -14 18 0 Q14 10 0 8 Q-16 10 -18 0 Z" fill="#fff" ${ink(4)}/>`);
  }
  return { back: out, head };
}

// вспышки «идея» и «поймал»
function fx(t, o, head) {
  let out = '';
  const idea = win(t, 6.95, 7.5);
  if (idea > 0 && idea < 1) {
    const s = E.back(clamp(idea * 2)) * (1 - E.in(idea));
    out += g(BASE.x + 210, BASE.y - 420, s * 1.6, t * 90, P.sparkle());
    out += g(BASE.x + 290, BASE.y - 330, s * 0.9, -t * 120, P.sparkle());
  }
  const catchK = win(t, 8.3, 8.7);
  if (catchK > 0 && catchK < 1) {
    const hand = handWorld(o, 'L');
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = 40 + 90 * E.out(catchK);
      out += g(hand[0] + Math.cos(a) * r, hand[1] + Math.sin(a) * r, 0.4 * (1 - catchK), 0, P.sparkle());
    }
  }
  const splat = win(t, 9.4, 9.8);
  if (splat > 0 && splat < 1) {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.5;
      const r = 30 + 70 * E.out(splat);
      out += g(head[0] + Math.cos(a) * r, head[1] + Math.sin(a) * r, 0.35 * (1 - splat), 0, P.foam(14));
    }
  }
  // «та-да» 10.0: звёздочки вокруг
  const tada = win(t, 9.95, 10.5);
  if (tada > 0) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      const r = 330 + 160 * E.out(tada);
      out += g(BASE.x + Math.cos(a) * r, BASE.y - 60 + Math.sin(a) * r * 1.1, 0.7 * (1 - E.in(tada)), t * 120, i % 2 ? P.star() : P.sparkle());
    }
  }
  return out;
}

function camera(t) {
  // наезд на лицо, пока микробы, потом обратно
  const z = kf(t, [[3.3, 1.1], [3.9, 1.38], [6.7, 1.38], [7.3, 1.1]]);
  const cx = 540, cy = kf(t, [[3.3, 960], [3.9, 960], [6.7, 960], [7.3, 960]]);
  return `translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`;
}

function frame(t) {
  const o = okiState(t);
  // щётка в руке после 8.3
  const pasteK = t >= 9.4 ? E.back(win(t, 9.4, 9.6)) : 0;
  if (t >= 8.3) o.propL = g(0, 0, 1.25 / BASE.s, BRUSH_ROT_HAND, P.toothbrush(pasteK));
  const pr = props(t, o);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}
    <g transform="${camera(t)}">
      ${background(t)}
      ${okiSVG(o)}
      ${counter()}
      ${pr.back}
      ${germs(t, o)}
      ${fx(t, o, pr.head)}
    </g></svg>`;
}

module.exports = { frame, W, H, DURATION: 10.6 };
