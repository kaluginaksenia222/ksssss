// Серия 2 «Моем руки». Кадр по времени t (секунды) → SVG 1080×1920. Длина 25 с.
// 0–2: Оки прискакал с грязными лапками, видит печенье.  2–3.5: тянется — из грязи выпрыгивают микробы.
// 3.5–6.5: испуг.  6.5–8: придумал, прыгает к раковине.  8–9.5: вода, мочит руки.  9.5–10.5: мыло прыгает в руки.
// 10.5–17: трёт ладошки в такт, пена, микробы лопаются.  17–18.4: смывает пену.  18.4–19: стряхивает капли.
// 19: цветок.  19.6–22: печенье прилетает, Оки хрустит.  22: значок «руки помыты».  22.5–25: машет.
const { C, clamp, lerp, E, kf, win, g, ink, okiSVG, okiPoint, handWorld, germ, P, DEFS } = require('../../lib/anim');

const W = 1080, H = 1920;
const BASE = { x: 540, y: 1090, s: 2.75 };
const SINK_X = 470;            // где стоит Оки у раковины
const SPOUT = [207, 1105];     // носик крана: струя падает на левую ладошку Оки
const PLATE = [870, 1408];
const GERM_SPOTS = [[860, 960], [800, 700], [300, 760]]; // первый — ближе к лапке, из которой выпрыгнул
const GERM_IN = [3.0, 3.25, 3.5];
const GERM_POP = [12.0, 13.5, 15.0];

function background(t) {
  const tiles = [];
  for (let y = 0; y < 9; y++) for (let x = 0; x < 6; x++)
    tiles.push(`<rect x="${x * 180 + 4}" y="${y * 180 + 4}" width="172" height="172" rx="22" fill="#fff" opacity="${(x + y) % 2 ? 0.18 : 0.28}"/>`);
  return `
    <rect width="${W}" height="${H}" fill="#FFD36E"/>
    ${tiles.join('')}
    <clipPath id="win"><rect x="660" y="170" width="330" height="330" rx="40"/></clipPath>
    <rect x="660" y="170" width="330" height="330" rx="40" fill="url(#sky)"/>
    <g clip-path="url(#win)">${g(870, 300, 1.0, t * 8, P.sun())}
      ${g(760 + ((t * 20) % 400) - 100, 420, 0.5, 0, `<g fill="#fff"><circle cx="-30" cy="0" r="30"/><circle cx="10" cy="-14" r="38"/><circle cx="46" cy="4" r="28"/><rect x="-60" y="0" width="134" height="30" rx="15"/></g>`)}</g>
    <rect x="660" y="170" width="330" height="330" rx="40" fill="none" ${ink(10)}/>
    <path d="M825 175 V495 M665 335 H985" ${ink(10)}/>
    ${g(160, 330 - (t * 12) % 50, 1.0, 0, P.bubble())}${g(560, 260 - (t * 10) % 40, 0.6, 0, P.bubble())}
    <ellipse cx="540" cy="1000" rx="470" ry="470" fill="url(#glow)"/>`;
}

// кран стоит на столешнице слева, носик над раковиной
function faucet(t) {
  const knob = kf(t, [[7.9, 0], [8.1, 90], [18.2, 90], [18.4, 0]]);
  const pipe = 'M110 1430 V1050 Q110 1000 160 1000 Q207 1000 207 1050 V1100';
  return `
    <path d="${pipe}" fill="none" stroke="${C.ink}" stroke-width="44" stroke-linecap="round"/>
    <path d="${pipe}" fill="none" stroke="#D6E2EE" stroke-width="30" stroke-linecap="round"/>
    <path d="M100 1420 V1060" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
    <rect x="185" y="1092" width="44" height="22" rx="8" fill="#B9C8D8" ${ink(6)}/>
    <g transform="translate(110 1250) rotate(${knob})">
      <rect x="-48" y="-12" width="96" height="24" rx="12" fill="${C.pink}" ${ink(6)}/>
      <circle r="16" fill="#fff" ${ink(5)}/>
    </g>`;
}

// струя воды
function waterOn(t) {
  return kf(t, [[8.0, 0], [8.2, 1, E.out], [9.4, 1], [9.6, 0], [17.0, 0], [17.2, 1, E.out], [18.2, 1], [18.4, 0]]);
}
function stream(t, o) {
  const on = waterOn(t);
  if (on <= 0) return '';
  const top = SPOUT[1] + 10, bottom = lerp(top, 1440, on);
  const wig = Math.sin(t * 40) * 3;
  let s = `<path d="M${SPOUT[0] - 14} ${top} Q${SPOUT[0] - 14 + wig} ${(top + bottom) / 2} ${SPOUT[0] - 16} ${bottom} H${SPOUT[0] + 16} Q${SPOUT[0] + 14 - wig} ${(top + bottom) / 2} ${SPOUT[0] + 14} ${top} Z" fill="#8FDFFF" ${ink(5)}/>
    <path d="M${SPOUT[0] - 4} ${top + 10} V${bottom - 10}" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="40 30" stroke-dashoffset="${-t * 600}"/>`;
  // брызги у ладошки и в раковине
  for (let i = 0; i < 6; i++) {
    const ph = (t * 3 + i / 6) % 1;
    const x = SPOUT[0] + (i % 2 ? 1 : -1) * (20 + 80 * ph);
    const y = 1235 - 90 * Math.sin(Math.PI * ph) + 60 * ph;
    s += `<circle cx="${x}" cy="${y}" r="${7 * (1 - ph)}" fill="#8FDFFF" ${ink(3)}/>`;
  }
  return s;
}

function counter(t) {
  return `
    <rect x="0" y="1450" width="${W}" height="470" fill="#FFF4D6"/>
    <rect x="-20" y="1430" width="${W + 40}" height="60" rx="30" fill="#fff" ${ink(10)}/>
    <ellipse cx="${SPOUT[0]}" cy="1446" rx="120" ry="20" fill="#CDEFF7" ${ink(6)}/>`;
}

function plate(t) {
  const left = t < 19.6 ? 3 : 2;
  const cookies = [[-40, -26], [36, -24], [0, -46]].slice(0, left).map(([x, y]) => g(x, y, 0.9, x, P.cookie())).join('');
  return g(PLATE[0], PLATE[1], 1, 0, `<ellipse cx="0" cy="0" rx="110" ry="24" fill="#fff" ${ink(6)}/><ellipse cx="0" cy="-2" rx="70" ry="12" fill="#EAF6FB"/>${cookies}`);
}

function okiState(t) {
  const o = { ...BASE, sq: 0, rot: 0, look: [0, 0], mouth: 'smile', mouthOpen: 0.7, droop: 0.3, armL: 10, armR: 10, eyeS: 1, mudL: 1, mudR: 1, cheeks: 0.6 };

  // 0–1.6: весело скачет из-за левого края
  if (t < 1.6) {
    o.x = lerp(-260, BASE.x, E.out(clamp(t / 1.5)));
    const ph = (t % 0.5) / 0.5;
    o.y = BASE.y - Math.sin(Math.PI * ph) * 110 * (t < 1.5 ? 1 : 0);
    o.sq = ph < 0.15 || ph > 0.85 ? 0.5 : -0.35 * Math.sin(Math.PI * ph);
    o.armL = o.armR = 60 + 40 * Math.sin(t * 12);
    o.eyes = 'happy';
  } else {
    o.sq = kf(t, [[1.5, 0.6], [1.75, -0.25], [1.95, 0]]);
  }
  // 1.7–3: видит печенье, тянется правой лапкой
  if (t >= 1.6 && t < 3.6) {
    o.look = kf(t, [[1.7, [0, 0]], [1.95, [1, 0.7]]]);
    o.mouth = 'o'; o.mouthOpen = kf(t, [[1.8, 0.3], [2.1, 1]]);
    o.eyeS = kf(t, [[1.8, 1], [2.1, 1.15, E.back]]);
    o.armR = kf(t, [[2.1, 10], [2.8, 62, E.out], [3.6, 62]]);
    o.rot = kf(t, [[2.1, 0], [2.8, 7]]);
  }
  // 3.6–6.5: микробы! испуг
  if (t >= 3.6 && t < 6.5) {
    const s = win(t, 3.6, 3.8);
    o.eyeS = lerp(1.15, 1.3, E.back(s));
    o.mouth = 'o'; o.mouthOpen = 1;
    o.droop = lerp(0.3, 1, s);
    o.armR = kf(t, [[3.6, 62], [3.8, 25, E.back]]);
    o.armL = kf(t, [[3.6, 10], [3.8, 35, E.back]]);
    o.rot = kf(t, [[3.6, 7], [3.8, -4]]) + Math.sin(t * 40) * 2.5 * (t < 4.4 ? 1 : 0);
    o.sproutWob = Math.sin(t * 30) * 6 * (t < 4.4 ? 1 : 0);
    o.sq = kf(t, [[3.6, 0], [3.7, -0.5], [3.9, 0.2], [4.1, 0]]);
    o.look = kf(t, [[3.9, [0.8, 0.6]], [4.4, [-0.9, -0.6]], [5.2, [-0.9, -0.6]], [5.6, [0.9, -0.6]], [6.3, [0.9, -0.6]]]);
  }
  // 6.5–8: придумал — к раковине
  if (t >= 6.5 && t < 10.5) {
    o.eyeS = kf(t, [[6.5, 1.3], [6.8, 1]]);
    o.mouth = 'smile'; o.mouthOpen = 0.7;
    o.droop = kf(t, [[6.6, 1], [7.2, 0.7]]);
    o.look = kf(t, [[6.5, [0.9, -0.6]], [6.8, [-1, 0.5]]]);
    o.armR = kf(t, [[6.5, 25], [6.9, 10]]);
    o.armL = kf(t, [[6.5, 35], [6.9, 10]]);
    o.sq = kf(t, [[6.85, 0], [6.95, 0.3], [7.1, -0.2], [7.25, 0]]);
    // прыжок 7.3–7.9
    const hk = win(t, 7.3, 7.9);
    o.x = lerp(BASE.x, SINK_X, E.inOut(hk));
    if (hk > 0 && hk < 1) { o.y = BASE.y - Math.sin(Math.PI * hk) * 120; o.sq = -0.3 * Math.sin(Math.PI * hk); }
    if (t >= 7.9) o.sq = kf(t, [[7.9, 0.4], [8.1, 0]]);
    // ладошку под воду
    if (t >= 8.0) {
      o.armL = kf(t, [[8.0, 10], [8.2, 20]]);
      o.look = [-1, 0.6];
      o.mudL = 1 - 0.4 * win(t, 8.2, 9.4);
      o.eyes = t > 8.4 && t < 9.4 ? 'happy' : undefined;
    }
    // мыло прилетает 9.5–10.3: ладошки вместе
    if (t >= 9.5) {
      o.armL = kf(t, [[9.5, 20], [10.0, -62]]);
      o.armR = kf(t, [[9.5, 10], [10.0, -62]]);
      o.look = kf(t, [[9.5, [-0.6, 0.8]], [10.0, [0, 1]]]);
    }
  }
  if (t >= 6.5) o.x = t < 7.3 ? BASE.x : o.x;
  // 10.5–17: трёт ладошки в такт
  if (t >= 10.5 && t < 17.0) {
    o.x = SINK_X;
    const k = (t - 10.5) * Math.PI * 4;
    o.armL = -62 + Math.sin(k) * 12;
    o.armR = -62 - Math.sin(k) * 12;
    o.y = BASE.y - Math.abs(Math.sin(t * Math.PI * 2)) * 14;
    o.rot = Math.sin(t * Math.PI) * 4;
    o.mouth = 'grin'; o.mouthOpen = 0.8;
    o.droop = 0.7;
    o.look = kf(t, [[10.5, [0, 1]], [11.3, [0.9, 0.1]], [12.2, [0.9, 0.1]], [12.5, [0.8, -0.8]], [13.7, [0.8, -0.8]], [14.0, [-0.8, -0.7]], [15.2, [-0.8, -0.7]], [15.5, [0, 0]]]);
    if (t > 15.4) o.eyes = 'happy';
    const clean = win(t, 11.0, 16.0);
    o.mudL = 0.6 * (1 - clean); o.mudR = 1 - clean;
    for (const tp of GERM_POP) o.sq += kf(t, [[tp, 0], [tp + 0.08, 0.3], [tp + 0.25, 0]]);
  }
  // 17–18.4: смывает пену; 18.4–19: стряхивает капли
  if (t >= 17.0 && t < 19.0) {
    o.x = SINK_X; o.mudL = o.mudR = 0;
    o.mouth = 'smile'; o.mouthOpen = 0.8; o.droop = kf(t, [[18.5, 0.7], [18.95, 0, E.back]]);
    o.look = [-1, 0.6];
    o.armL = kf(t, [[17.0, -62], [17.2, 20]]) + (t > 17.2 && t < 18.3 ? Math.sin(t * 25) * 6 : 0);
    o.armR = kf(t, [[17.0, -62], [17.2, -30]]);
    if (t >= 18.4) {
      const sh = Math.sin(t * 60);
      o.armL = 45 + sh * 25; o.armR = 45 - sh * 25;
      o.rot = sh * 3;
      o.eyes = 'happy'; o.mouth = 'grin'; o.mouthOpen = 1;
      o.look = [0, 0];
    }
  }
  // 19: цветок, потом печенье
  if (t >= 19.0) {
    o.mudL = o.mudR = 0; o.droop = 0;
    o.bloom = win(t, 19.0, 19.5);
    o.x = kf(t, [[19.6, SINK_X], [20.2, BASE.x]]);
    o.mouth = 'grin'; o.mouthOpen = 1; o.eyes = 'happy';
    if (t < 19.6) {
      o.armL = o.armR = kf(t, [[19.0, 45], [19.25, 150, E.back]]);
      o.sq = kf(t, [[19.0, 0], [19.1, 0.4], [19.3, -0.4], [19.55, 0]]);
    } else if (t < 22.5) {
      const hk = win(t, 19.6, 20.2);
      if (hk > 0 && hk < 1) o.y = BASE.y - Math.sin(Math.PI * hk) * 100;
      o.armL = kf(t, [[19.6, 150], [19.9, 10]]);
      // печенье в правую лапку 20.2–20.6, ко рту 20.6–20.8
      o.armR = kf(t, [[19.6, 150], [20.0, 60], [20.6, 60], [20.8, -68]]);
      o.eyes = t < 20.8 ? undefined : 'happy';
      o.look = kf(t, [[19.6, [0, 0]], [19.9, [1, 0.6]], [20.6, [0.4, 0.2]]]);
      if (t < 20.8) { o.mouth = 'o'; o.mouthOpen = 1; }
      // хрум-хрум 20.9–22.1
      if (t >= 20.8) {
        const bite = ((t - 20.9) % 0.3) / 0.3;
        o.mouth = t < 22.1 ? 'yawn' : 'smile';
        o.mouthOpen = t < 22.1 ? Math.abs(Math.sin(Math.PI * bite)) : 0.8;
        o.sq = t < 22.1 ? Math.sin(Math.PI * bite) * 0.12 : 0;
        o.cheeks = 0.8;
      }
      if (t >= 22.1) o.armR = kf(t, [[22.1, -68], [22.4, 10]]);
    } else {
      o.eyes = t < 22.7 ? 'happy' : undefined;
      o.look = [0, 0]; o.mouth = 'smile'; o.mouthOpen = 1;
      o.armL = 10;
      o.armR = kf(t, [[22.5, 10], [22.8, 135]]) + Math.sin((t - 22.5) * Math.PI * 4) * 22 * win(t, 22.7, 22.9);
      o.sq = kf(t, [[22.5, 0.3], [22.7, -0.1], [22.9, 0]]);
      o.blink = t > 23.6 && t < 23.75 ? 1 : 0;
    }
  }
  // мыло в ладошках 10.0–17.0 (у левой лапки, правая накрывает)
  if (t >= 10.0 && t < 17.0) {
    const s1 = 0.42 * (1 - 0.25 * win(t, 10.5, 17.0));
    o.propL = g(26, 4, s1, 0, P.soap());
  }
  // печенье в лапке 20.6–22.1
  if (t >= 20.6 && t < 22.1) {
    const bite = clamp(Math.floor((t - 20.9) / 0.3 + 1) * 0.25, 0, 1);
    o.propR = g(-6, 0, 0.42, 0, P.cookie(t < 20.9 ? 0 : bite));
  }
  return o;
}

function germPos(t, i, o) {
  const born = handWorld(okiState(GERM_IN[i]), 'R');
  const [sx0, sy] = GERM_SPOTS[i];
  const sx = sx0 + (o.x - BASE.x) * 0.6;
  const k = win(t, GERM_IN[i], GERM_IN[i] + 0.45);
  const x = lerp(born[0], sx, E.out(k));
  const y = lerp(born[1], sy, E.out(k)) - Math.sin(Math.PI * k) * 160;
  const s = lerp(0.3, 1.85, E.back(k));
  const beat = (t * 2 + i * 0.5) % 1;
  const dance = k >= 1 ? Math.sin(beat * Math.PI * 2) : 0;
  const scared = t > 10.0;
  const shake = scared ? Math.sin(t * 50 + i) * 4 : 0;
  return { x: x + dance * 14 + shake, y: y - Math.abs(dance) * 18, s, r: dance * 12, scared };
}

function germs(t, o) {
  let out = '';
  for (let i = 0; i < 3; i++) {
    if (t < GERM_IN[i] || t >= GERM_POP[i]) continue;
    const p = germPos(t, i, o);
    const inflate = 1 + 0.35 * E.in(win(t, GERM_POP[i] - 0.15, GERM_POP[i]));
    out += g(p.x, p.y, p.s * inflate, p.r, germ(t, { hue: i, phase: i * 2, mood: p.scared ? 'scared' : 'cheeky' }));
  }
  return out;
}

const handsCenter = (o) => okiPoint(o, 0, 30);

function fx(t, o) {
  let out = '';
  // пена на ладошках
  const foam = win(t, 10.6, 12.0) * (1 - win(t, 17.0, 17.35));
  if (foam > 0) {
    const [hx, hy] = handsCenter(o);
    const spots = [[-60, -10, 26], [-20, -30, 30], [30, -24, 28], [62, 4, 22], [-50, 30, 22], [10, 30, 26], [50, 36, 18], [-80, 10, 16], [84, -20, 16], [-4, -54, 18]];
    spots.forEach(([x, y, r], i) => {
      if (foam <= i / spots.length) return;
      out += g(hx + x + Math.sin(t * 8 + i) * 4, hy + y, 1, 0, P.foam(r * (1 + 0.1 * Math.sin(t * 12 + i))));
    });
  }
  // мыльные пузыри поднимаются
  if (t > 10.8 && t < 18.5) {
    const [hx, hy] = handsCenter(o);
    for (let k = 0; k < 22; k++) {
      const ts = 10.8 + k * 0.28;
      const age = t - ts;
      if (age < 0 || age > 1.6 || ts > 17.0) continue;
      const x = hx + Math.sin(k * 7.3) * 200 * age + Math.sin(t * 5 + k) * 10;
      const y = hy - 60 - 420 * age;
      out += g(x, y, 0.5 + 0.4 * age, 0, P.bubble(40), `opacity="${(1 - age / 1.6).toFixed(2)}"`);
    }
  }
  // пузыри летят в микробов, микробы лопаются
  GERM_POP.forEach((tp, i) => {
    const [hx, hy] = handsCenter(o);
    const k = win(t, tp - 0.45, tp);
    if (k > 0 && k < 1) {
      const p = germPos(t, i, o);
      for (let j = 0; j < 3; j++) {
        const kk = clamp(k * 1.15 - j * 0.08);
        const x = lerp(hx, p.x, E.out(kk)), y = lerp(hy, p.y, E.out(kk)) - Math.sin(Math.PI * kk) * 90;
        out += g(x, y, 1.1 - j * 0.25, 0, P.bubble(30));
      }
    }
    const b = win(t, tp, tp + 0.55);
    if (b > 0 && b < 1) {
      const p = germPos(tp, i, okiState(tp));
      for (let j = 0; j < 8; j++) {
        const a = (j / 8) * Math.PI * 2 + i;
        const r = 30 + 150 * E.out(b);
        out += g(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, (1 - b) * (j % 2 ? 0.9 : 1.4), t * 200, j % 2 ? P.sparkle() : P.foam(14));
      }
      out += `<circle cx="${p.x}" cy="${p.y}" r="${40 + 120 * E.out(b)}" fill="none" stroke="#fff" stroke-width="${10 * (1 - b)}" opacity="${1 - b}"/>`;
    }
  });
  // мыло прыгает с тарелочки у раковины в ладошки 9.5–10.0
  if (t < 10.0) {
    const SOAP0 = [370, 1405];
    if (t < 9.5) {
      const hop = t > 9.1 ? Math.abs(Math.sin((t - 9.1) * 16)) * 14 : 0;
      out += g(SOAP0[0], SOAP0[1] - hop, 0.95, 0, P.soap());
    } else {
      const k = E.inOut(win(t, 9.5, 10.0));
      const h = handWorld(okiState(10.0), 'L');
      const dst = [h[0] + 26 * BASE.s, h[1] + 4 * BASE.s];
      out += g(lerp(SOAP0[0], dst[0], k), lerp(SOAP0[1], dst[1], k) - Math.sin(Math.PI * k) * 260, lerp(0.95, 0.42 * BASE.s, k), k * 360, P.soap());
    }
  }
  // пена смывается в раковину 17.2–18.2
  const wash = win(t, 17.2, 18.3);
  if (wash > 0 && wash < 1) {
    for (let i = 0; i < 8; i++) {
      const ph = (wash * 2.5 + i / 8) % 1;
      out += g(SPOUT[0] + Math.sin(i * 3) * 50, lerp(1230, 1440, ph), 0.8 * (1 - ph * 0.5), 0, P.foam(14));
    }
  }
  // капли летят, когда стряхивает 18.4–19.0
  const shake = win(t, 18.4, 19.2);
  if (shake > 0 && shake < 1) {
    for (const side of ['L', 'R']) {
      const h = handWorld(o, side);
      for (let i = 0; i < 5; i++) {
        const ph = (shake * 3 + i / 5) % 1;
        const a = (side === 'L' ? Math.PI : 0) + (i - 2) * 0.35 - 0.5 * (side === 'L' ? -1 : 1);
        const r = 30 + 220 * ph;
        out += g(h[0] + Math.cos(a) * r, h[1] + Math.sin(a) * r + 120 * ph * ph, (1 - ph) * 0.9, 0,
          `<path d="M0 -20 C9 -6 16 2 16 10 A16 16 0 0 1 -16 10 C-16 2 -9 -6 0 -20 Z" fill="#8FDFFF" ${ink(4)}/>`);
      }
    }
  }
  // чистые ладошки сверкают 18.5
  const ting = win(t, 18.45, 19.0);
  if (ting > 0 && ting < 1) {
    const s1 = Math.sin(Math.PI * ting);
    for (const side of ['L', 'R']) {
      const h = handWorld(o, side);
      out += g(h[0], h[1] - 40, s1 * 1.6, t * 200, P.sparkle().replace('fill="#fff"', `fill="${C.yellow}"`));
    }
  }
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
  // печенье летит с тарелки 20.0–20.6
  if (t >= 20.0 && t < 20.6) {
    const k = E.inOut(win(t, 20.0, 20.6));
    const h = handWorld(okiState(20.6), 'R');
    out += g(lerp(PLATE[0], h[0] - 6 * BASE.s, k), lerp(PLATE[1] - 46, h[1], k) - Math.sin(Math.PI * k) * 240, lerp(0.9, 0.42 * BASE.s, k), k * 360, P.cookie());
  }
  // крошки 20.9–22.1
  if (t >= 20.9 && t < 22.4) {
    const m = okiPoint(o, 0, 30);
    for (let i = 0; i < 12; i++) {
      const ts = 20.9 + (i % 4) * 0.3;
      const age = t - ts;
      if (age < 0 || age > 0.6) continue;
      const a = Math.PI * 0.25 + (i * 0.7) % (Math.PI * 0.5);
      out += `<circle cx="${m[0] + Math.cos(a) * 160 * age * (i % 2 ? 1 : -1)}" cy="${m[1] + 40 + 300 * age * age + Math.sin(a) * 60 * age}" r="${7 - age * 6}" fill="#E0A458" ${ink(2.5)}/>`;
    }
  }
  // значок «руки помыты»: мыло и зелёная галочка
  const badge = win(t, 22.1, 22.55);
  if (badge > 0) {
    out += g(390, 360, E.back(badge) * 1.5, Math.sin(t * 4) * 4, `
      <circle r="86" fill="#fff" ${ink(7)}/>
      ${g(-4, 12, 0.95, -10, P.soap())}
      ${g(-30, -38, 0.35, 0, P.bubble(40))}${g(22, -46, 0.25, 0, P.bubble(40))}
      <g transform="translate(58 -54)"><circle r="34" fill="${C.leaf}" ${ink(6)}/><path d="M-15 0 L-4 12 L16 -12" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  }
  // «придумал!»
  const idea = win(t, 6.75, 7.3);
  if (idea > 0 && idea < 1) {
    const s1 = E.back(clamp(idea * 2)) * (1 - E.in(idea));
    out += g(BASE.x - 230, BASE.y - 420, s1 * 1.6, t * 90, P.sparkle());
    out += g(BASE.x - 310, BASE.y - 330, s1 * 0.9, -t * 120, P.sparkle());
  }
  return out;
}

function camera(t) {
  const z = kf(t, [[2.0, 1.1], [3.0, 1.1], [3.6, 1.35], [6.4, 1.35], [7.0, 1.1], [10.3, 1.1], [10.9, 1.38], [16.8, 1.38], [17.3, 1.15], [18.8, 1.15], [19.1, 1.25], [21.9, 1.25], [22.4, 1.08]]);
  const cx = kf(t, [[3.0, 540], [3.6, 600], [6.4, 600], [7.0, 540], [10.3, 540], [10.9, 470], [16.8, 470], [17.3, 540]]);
  const cy = 960;
  return `translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`;
}

function frame(t) {
  const o = okiState(t);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}
    <g transform="${camera(t)}">
      ${background(t)}
      ${okiSVG(o)}
      ${faucet(t)}
      ${stream(t, o)}
      ${counter(t)}
      ${plate(t)}
      ${germs(t, o)}
      ${fx(t, o)}
    </g></svg>`;
}

module.exports = { frame, W, H, DURATION: 25 };
