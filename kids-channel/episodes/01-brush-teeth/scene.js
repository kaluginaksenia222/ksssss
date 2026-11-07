// Серия 1 «Чистим зубы». Кадр по времени t (секунды) → SVG 1080×1920.
// 0–10.5 с: Оки сонный приходит в ванную, зевает, улыбается — из рта выпрыгивают микробы,
// Оки пугается, придумывает: щётка сама прыгает к нему в руку, паста летит на щётку.
// 10.5–17 с: чистит зубы в такт, пена, микробы лопаются по одному.
// 17–19 с: щётка обратно в стакан, чистые зубы сверкают, росток распускается в цветок.
// 19–25 с: радостный танец, значок «зубы почищены», Оки машет на прощание.
const { C, clamp, lerp, E, kf, win, g, ink, okiSVG, okiPoint, handWorld, germ, P, DEFS } = require('../../lib/anim');

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
  if (t >= 10.5) {
    o.eyes = undefined; o.lid = 0; o.eyeS = 1; o.cheeks = 0.6;
    o.armR = 10; o.sq = 0; o.rot = 0; o.droop = 0.6; o.y = BASE.y;
    if (t < 17.0) {
      const stroke = t >= 11.0 ? Math.sin((t - 11.0) * Math.PI * 4) : 0; // 4 движения щёткой в секунду
      o.armL = t < 11.0 ? kf(t, [[10.5, 135], [11.0, -72]]) : -72 + stroke * 13;
      o.mouth = 'brush'; o.mouthOpen = 0.6;
      o.teethDirt = 1 - win(t, 11.5, 16.0);
      o.y = BASE.y - Math.abs(Math.sin(t * Math.PI * 2)) * 14 * win(t, 11.0, 11.3); // подпрыгивает в такт
      o.rot = Math.sin(t * Math.PI) * 4 * win(t, 11.0, 11.5);
      o.look = kf(t, [[11.0, [0, 0]], [11.3, [-0.8, -0.7]], [12.2, [-0.8, -0.7]], [12.5, [0.8, -0.8]], [13.7, [0.8, -0.8]], [14.0, [0.9, 0.1]], [15.2, [0.9, 0.1]], [15.5, [0, 0]]]);
      if (t > 15.4) o.eyes = 'happy';
      for (const tp of GERM_POP) o.sq += kf(t, [[tp, 0], [tp + 0.08, 0.3], [tp + 0.25, 0]]);
    } else if (t < 18.9) {
      o.armL = kf(t, [[17.0, -72], [17.25, 60, E.out], [17.6, 10]]);
      o.mouth = t < 17.9 ? 'smile' : 'grin';
      o.mouthOpen = t < 17.9 ? 0.3 : kf(t, [[17.9, 0.2], [18.1, 1, E.back]]);
      o.teethDirt = 0;
      o.look = [0, 0];
      o.sq = kf(t, [[17.9, 0], [18.0, 0.3], [18.2, -0.15], [18.35, 0]]);
      o.droop = kf(t, [[18.5, 0.6], [18.9, 0, E.back]]);
    } else {
      o.mouth = 'grin'; o.mouthOpen = 1; o.teethDirt = 0; o.droop = 0;
      o.bloom = win(t, 18.9, 19.4);
      o.eyes = 'happy';
      const hopT = t - 19.5;
      if (t < 19.5) {
        o.armL = o.armR = kf(t, [[18.9, 10], [19.2, 150, E.back]]);
        o.sq = kf(t, [[18.9, 0], [19.0, 0.4], [19.2, -0.4], [19.45, 0]]);
      } else if (t < 22.5) {
        const ph = (hopT % 0.5) / 0.5;
        o.y = BASE.y - Math.sin(Math.PI * ph) * 70;
        o.sq = ph < 0.12 || ph > 0.9 ? 0.4 : -0.25 * Math.sin(Math.PI * ph);
        o.x = BASE.x + 60 * Math.sin(Math.PI * hopT);
        o.armL = 105 + 45 * Math.cos(Math.PI * hopT * 2);
        o.armR = 105 - 45 * Math.cos(Math.PI * hopT * 2);
        o.rot = Math.sin(Math.PI * hopT) * 6;
      } else {
        o.eyes = t < 22.7 ? 'happy' : undefined;
        o.look = [0, 0];
        o.mouth = 'smile';
        o.armL = kf(t, [[22.5, 105], [22.8, 15]]);
        o.armR = kf(t, [[22.5, 105], [22.8, 135]]) + Math.sin((t - 22.5) * Math.PI * 4) * 22 * win(t, 22.7, 22.9);
        o.sq = kf(t, [[22.5, 0.3], [22.7, -0.1], [22.9, 0]]);
        o.blink = t > 23.6 && t < 23.75 ? 1 : 0;
      }
    }
    // пена у рта
    const foam = win(t, 11.0, 12.5) * (1 - win(t, 17.0, 17.6));
    if (foam > 0) {
      const spots = [[-26, 30, 10], [-6, 38, 9], [14, 36, 11], [30, 26, 8], [38, 14, 7], [-38, 18, 7], [2, 44, 7], [-18, 42, 6]];
      o.face = spots.filter((_, i) => foam > i / spots.length).map(([x, y, r], i) =>
        g(x, y, 1, 0, P.foam(r * (1 + 0.12 * Math.sin(t * 12 + i))))).join('');
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

const GERM_SPOTS = [[300, 760], [790, 720], [820, 980]];
const GERM_IN = [3.7, 4.0, 4.3];
const GERM_POP = [12.0, 13.5, 15.0];
const MOUTH0 = [BASE.x, BASE.y + 25 * BASE.s];

function germPos(t, i) {
  const [sx, sy] = GERM_SPOTS[i];
  const k = win(t, GERM_IN[i], GERM_IN[i] + 0.45);
  const x = lerp(MOUTH0[0], sx, E.out(k));
  const y = lerp(MOUTH0[1], sy, E.out(k)) - Math.sin(Math.PI * k) * 160;
  const s = lerp(0.3, 1.85, E.back(k));
  const beat = (t * 2 + i * 0.5) % 1;
  const dance = k >= 1 ? Math.sin(beat * Math.PI * 2) : 0;
  const scared = t > 8.3;
  const shake = scared ? Math.sin(t * 50 + i) * 4 : 0;
  return { x: x + dance * 14 + shake, y: y - Math.abs(dance) * 18, s, r: dance * 12, scared };
}

function germs(t) {
  let out = '';
  for (let i = 0; i < 3; i++) {
    if (t < GERM_IN[i] || t >= GERM_POP[i]) continue;
    const p = germPos(t, i);
    const inflate = 1 + 0.35 * E.in(win(t, GERM_POP[i] - 0.15, GERM_POP[i]));
    out += g(p.x, p.y, p.s * inflate, p.r, germ(t, { hue: i, phase: i * 2, mood: p.scared ? 'scared' : 'cheeky' }));
  }
  return out;
}

// пузыри пены летят изо рта в микроба, микроб лопается
function germHits(t, o) {
  let out = '';
  const mouth = okiPoint(o, 0, 26);
  GERM_POP.forEach((tp, i) => {
    const k = win(t, tp - 0.45, tp);
    if (k > 0 && k < 1) {
      const p = germPos(t, i);
      for (let j = 0; j < 3; j++) {
        const kk = clamp(k * 1.15 - j * 0.08);
        const x = lerp(mouth[0], p.x, E.out(kk)), y = lerp(mouth[1], p.y, E.out(kk)) - Math.sin(Math.PI * kk) * 90;
        out += g(x, y, 1.3 - j * 0.3, 0, P.foam(16));
      }
    }
    const b = win(t, tp, tp + 0.55);
    if (b > 0 && b < 1) {
      const p = germPos(tp, i);
      for (let j = 0; j < 8; j++) {
        const a = (j / 8) * Math.PI * 2 + i;
        const r = 30 + 150 * E.out(b);
        out += g(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, (1 - b) * (j % 2 ? 0.9 : 1.4), t * 200, j % 2 ? P.sparkle() : P.foam(14));
      }
      out += `<circle cx="${p.x}" cy="${p.y}" r="${40 + 120 * E.out(b)}" fill="none" stroke="#fff" stroke-width="${10 * (1 - b)}" opacity="${1 - b}"/>`;
    }
  });
  return out;
}

function props(t, o) {
  let out = '';
  // стакан и щётка
  const brushInCup = t < 7.6 || t >= 17.5;
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
  // щётка возвращается в стакан 17.0–17.5
  if (t >= 17.0 && t < 17.5) {
    const k = E.inOut(win(t, 17.0, 17.5));
    const h = handWorld(okiState(17.0), 'L');
    const x = lerp(h[0], CUP[0] - 15, k), y = lerp(h[1], CUP[1] - 175, k) - Math.sin(Math.PI * k) * 300;
    out += g(x, y, 1.25, lerp(-8, -80 - 360, k), P.toothbrush());
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
  // пузырьки поднимаются изо рта, пока чистит
  if (t > 11.0 && t < 18.5) {
    const mouth = okiPoint(o, 0, 26);
    for (let k = 0; k < 22; k++) {
      const ts = 11.0 + k * 0.28;
      const age = t - ts;
      if (age < 0 || age > 1.4 || ts > 17.0) continue;
      const x = mouth[0] + Math.sin(k * 7.3) * 160 * age + Math.sin(t * 5 + k) * 10;
      const y = mouth[1] - 40 - 380 * age;
      out += g(x, y, 0.45 + 0.35 * age, 0, P.bubble(40), `opacity="${(1 - age / 1.4).toFixed(2)}"`);
    }
  }
  // чистые зубы сверкают
  const ting = win(t, 18.2, 18.8);
  if (ting > 0 && ting < 1) {
    const m = okiPoint(o, 0, 22);
    const s1 = Math.sin(Math.PI * ting);
    out += g(m[0] - 120, m[1] - 40, s1 * 2.2, t * 200, P.sparkle().replace('fill="#fff"', `fill="${C.yellow}"`));
    out += g(m[0] + 130, m[1] - 10, s1 * 1.5, -t * 200, P.sparkle().replace('fill="#fff"', `fill="${C.yellow}"`));
    out += g(m[0] + 20, m[1] + 30, s1 * 1.1, t * 300, P.sparkle());
  }
  // цветок распустился — конфетти из лепестков и звёзд
  const burst = win(t, 18.9, 20.4);
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
  // значок «зубы почищены»: щётка и зелёная галочка
  const badge = win(t, 21.9, 22.35);
  if (badge > 0) {
    const s1 = E.back(badge) * 1.5;
    const wob = Math.sin(t * 4) * 4;
    out += g(540, 360, s1, wob, `
      <circle r="86" fill="#fff" ${ink(7)}/>
      ${g(-4, 8, 0.95, -35, P.toothbrush(1))}
      <g transform="translate(58 -54)"><circle r="34" fill="${C.leaf}" ${ink(6)}/><path d="M-15 0 L-4 12 L16 -12" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  }
  return out;
}

function camera(t) {
  // наезд на лицо, пока микробы, потом обратно
  const z = kf(t, [[3.3, 1.1], [3.9, 1.38], [6.7, 1.38], [7.3, 1.1], [10.4, 1.1], [11.0, 1.4], [16.8, 1.4], [17.4, 1.15], [18.6, 1.15], [19.0, 1.25], [21.7, 1.25], [22.2, 1.08]]);
  const cx = 540, cy = kf(t, [[3.3, 960], [3.9, 960], [6.7, 960], [7.3, 960]]);
  return `translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`;
}

function frame(t) {
  const o = okiState(t);
  // щётка в руке после 8.3
  const pasteK = t >= 9.4 ? E.back(win(t, 9.4, 9.6)) : 0;
  if (t >= 8.3 && t < 17.0) {
    const rot = kf(t, [[10.5, BRUSH_ROT_HAND], [11.0, -8]]);
    o.propL = g(0, kf(t, [[10.5, 0], [11.0, 9]]), 1.25 / BASE.s, rot, P.toothbrush(pasteK));
  }
  const pr = props(t, o);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}
    <g transform="${camera(t)}">
      ${background(t)}
      ${okiSVG(o)}
      ${counter()}
      ${pr.back}
      ${germs(t)}
      ${germHits(t, o)}
      ${fx(t, o, pr.head)}
    </g></svg>`;
}

module.exports = { frame, W, H, DURATION: 25 };
