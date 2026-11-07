// Общая библиотека для мультиков Oki Doki: персонаж Оки с подвижными частями,
// микробы, предметы, плавные переходы. Рисует SVG-строки, время — в секундах.

const C = {
  ink: '#4A2335',
  body: '#FF7A4D', bodyLight: '#FFA27A', bodyDark: '#E85A33',
  belly: '#FFE6CF', ear: '#FF9EAE',
  leaf: '#4CC25E', leafDark: '#2F9A44',
  petal: '#FFD23F', petalCore: '#FF8A3D',
  sky1: '#7FD3F7', sky2: '#C9F0FF',
  teal: '#2EC4B6', pink: '#FF6F91', purple: '#8C6CF2', yellow: '#FFD23F', blue: '#4D96FF',
  germ: '#9BD84E', germDark: '#5FA82C',
};

// ---------- математика движения ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  lin: (k) => k,
  inOut: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  out: (k) => 1 - Math.pow(1 - k, 3),
  in: (k) => k * k * k,
  back: (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  elastic: (k) => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
// ключевые кадры: [[время, значение, (переход к этому кадру)], ...]
function kf(t, keys, def = E.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, ease] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const k = (ease || def)((t - t0) / (t1 - t0 || 1));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
const win = (t, a, b) => clamp((t - a) / (b - a)); // 0..1 внутри отрезка

const g = (x, y, s, r, inner, extra = '') =>
  `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(r || 0).toFixed(2)}) scale(${typeof s === 'number' ? s.toFixed(4) : s})" ${extra}>${inner}</g>`;
const ink = (w = 5) => `stroke="${C.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// ---------- Оки ----------
// o: { x, y, s, rot, sq (сжатие: + приплюснут, - вытянут), look:[x,y], blink 0..1, lid 0..1 (сонные веки),
//      eyeS (размер глаз), mouth: 'smile'|'grin'|'yawn'|'o'|'brush'|'joy', mouthOpen 0..1,
//      armL, armR (подъём руки в градусах), propL, propR (SVG в руке), droop 0..1, bloom 0..1, cheeks 0..1, shine 0..1 }
const SHOULDER = { L: [-76, 0], R: [76, 0] };
const ARM_LEN = 58;

function okiMatrix(o) {
  const sx = 1 + (o.sq || 0) * 0.12, sy = 1 - (o.sq || 0) * 0.12;
  return { sx, sy };
}
// координата точки Оки (в его системе) на экране — чтобы передавать предметы из руки в мир
function okiPoint(o, px, py) {
  const { sx, sy } = okiMatrix(o);
  let x = px * sx, y = 100 + (py - 100) * sy;
  const r = ((o.rot || 0) * Math.PI) / 180;
  const dx = x, dy = y - 100;
  x = dx * Math.cos(r) - dy * Math.sin(r); y = 100 + dx * Math.sin(r) + dy * Math.cos(r);
  return [o.x + x * o.s, o.y + y * o.s];
}
function handLocal(side, raise) {
  const [sx0, sy0] = SHOULDER[side];
  const a = ((side === 'L' ? raise : -raise) * Math.PI) / 180;
  // вниз (0, ARM_LEN) поворачиваем на a
  return [sx0 - Math.sin(a) * ARM_LEN, sy0 + Math.cos(a) * ARM_LEN];
}
function handWorld(o, side) {
  const [hx, hy] = handLocal(side, side === 'L' ? o.armL || 0 : o.armR || 0);
  return okiPoint(o, hx, hy);
}

function okiSVG(o) {
  const st = ink(6);
  const { sx, sy } = okiMatrix(o);
  const arm = (side) => {
    const raise = side === 'L' ? o.armL || 0 : o.armR || 0;
    const [x0, y0] = SHOULDER[side];
    const ang = side === 'L' ? raise : -raise;
    const prop = side === 'L' ? o.propL : o.propR;
    return `<g transform="translate(${x0} ${y0}) rotate(${ang.toFixed(2)})">
      <ellipse cx="${side === 'L' ? -6 : 6}" cy="${ARM_LEN / 2 + 4}" rx="17" ry="${ARM_LEN / 2 + 6}" fill="${C.body}" ${st}/>
      ${prop ? `<g transform="translate(0 ${ARM_LEN}) rotate(${-ang.toFixed(2)})">${prop}</g>` : ''}
    </g>`;
  };
  // руки, опущенные вниз, — за телом; поднятые — перед ним
  const behind = (side) => (side === 'L' ? o.armL || 0 : o.armR || 0) < 40;

  // глаза
  const [lx, ly] = o.look || [0, 0];
  const es = o.eyeS || 1;
  const open = 1 - clamp(o.blink || 0);
  const lid = clamp(o.lid || 0);
  const eye = (x) => {
    const ry = 26 * es * Math.max(open, 0.06);
    if (open < 0.12) return `<path d="M${x - 16} -12 Q${x} -4 ${x + 16} -12" fill="none" ${st}/>`;
    const lidH = lid * 26 * es * 1.1;
    const id = `e${x < 0 ? 'l' : 'r'}`;
    return `<clipPath id="${id}"><ellipse cx="${x}" cy="-14" rx="${21 * es}" ry="${ry}"/></clipPath>
      <ellipse cx="${x}" cy="-14" rx="${21 * es}" ry="${ry}" fill="#fff"/>
      <g clip-path="url(#${id})">
        <circle cx="${x + lx * 6}" cy="${-10 + ly * 6}" r="${14 * Math.min(es, 1.1)}" fill="#2B2340"/>
        <circle cx="${x + lx * 6 - 5}" cy="${-16 + ly * 6}" r="5.5" fill="#fff"/>
        <circle cx="${x + lx * 6 + 5}" cy="${-4 + ly * 6}" r="2.5" fill="#fff"/>
        ${lid > 0 ? `<rect x="${x - 30}" y="${-14 - 26 * es - 4}" width="60" height="${lidH + 4}" fill="${C.body}"/>
        <path d="M${x - 24} ${-14 - 26 * es + lidH} H${x + 24}" ${ink(5)}/>` : ''}
      </g>
      <ellipse cx="${x}" cy="-14" rx="${21 * es}" ry="${ry}" fill="none" ${st}/>`;
  };
  const happyEye = (x) => `<path d="M${x - 16} -6 Q${x} -30 ${x + 16} -6" fill="none" ${st}/>`;

  // рот
  const mo = o.mouthOpen == null ? 1 : o.mouthOpen;
  let mouth = '';
  switch (o.mouth || 'smile') {
    case 'grin': {
      // широкая улыбка с зубами
      mouth = `<path d="M-30 14 Q0 ${30 + 22 * mo} 30 14 Z" fill="#7A1F2B" ${ink(5)}/>
        <clipPath id="mclip"><path d="M-30 14 Q0 ${30 + 22 * mo} 30 14 Z"/></clipPath>
        <g clip-path="url(#mclip)">
          <rect x="-30" y="12" width="60" height="${10 + 6 * mo}" fill="#fff"/>
          <path d="M-10 12 V${22 + 6 * mo} M10 12 V${22 + 6 * mo}" stroke="#E7D9D2" stroke-width="2.5"/>
          ${o.teethDirt ? `<circle cx="-16" cy="${18 + 2 * mo}" r="4" fill="#C9C26A" opacity="${o.teethDirt}"/><circle cx="6" cy="${19 + 2 * mo}" r="3.5" fill="#C9C26A" opacity="${o.teethDirt}"/><circle cx="20" cy="${17 + 2 * mo}" r="3" fill="#C9C26A" opacity="${o.teethDirt}"/>` : ''}
          <ellipse cx="0" cy="${38 + 16 * mo}" rx="14" ry="8" fill="#FF7A8A"/>
        </g>
        <path d="M-30 14 Q0 ${30 + 22 * mo} 30 14 Z" fill="none" ${ink(5)}/>`;
      break;
    }
    case 'yawn':
      mouth = `<ellipse cx="0" cy="${26 + 4 * mo}" rx="${10 + 8 * mo}" ry="${8 + 20 * mo}" fill="#7A1F2B" ${ink(5)}/>
        <ellipse cx="0" cy="${38 + 10 * mo}" rx="${6 + 4 * mo}" ry="${3 + 5 * mo}" fill="#FF7A8A"/>`;
      break;
    case 'o':
      mouth = `<ellipse cx="0" cy="26" rx="${8 + 4 * mo}" ry="${9 + 6 * mo}" fill="#7A1F2B" ${ink(5)}/>`;
      break;
    case 'flat':
      mouth = `<path d="M-14 24 Q0 ${20 - 6 * mo} 14 24" fill="none" ${st}/>`;
      break;
    case 'brush':
      mouth = `<path d="M-22 16 Q0 ${30 + 10 * mo} 22 16 Z" fill="#7A1F2B" ${ink(5)}/>
        <rect x="-20" y="15" width="40" height="7" fill="#fff"/>`;
      break;
    default:
      mouth = `<path d="M-20 18 Q0 ${18 + 28 * mo} 20 18 Z" fill="#7A1F2B" ${ink(5)}/><ellipse cx="0" cy="${18 + 14 * mo}" rx="9" ry="${2 + 3 * mo}" fill="#FF7A8A"/>`;
  }
  const eyes = o.eyes === 'happy' ? happyEye(-32) + happyEye(32) : eye(-32) + eye(32);

  // росток: droop — вянет, bloom — распускается цветок
  const droop = clamp(o.droop || 0), bloom = clamp(o.bloom || 0);
  const wob = o.sproutWob || 0;
  const tipX = lerp(6, 46, droop) + wob, tipY = lerp(-128, -104, droop);
  const leafRot = lerp(0, 62, droop) + wob * 0.6;
  const leafS = lerp(1, 0.88, droop);
  const leafCol = droop > 0.5 ? '#7BB05A' : C.leaf;
  const petals = [0, 72, 144, 216, 288].map((a) =>
    `<ellipse cx="0" cy="-20" rx="13" ry="19" transform="rotate(${a})" fill="${C.petal}" ${ink(4.5)}/>`).join('');
  const sprout = `
    <path d="M0 -84 Q${lerp(-4, 6, droop)} ${lerp(-112, -112, droop)} ${tipX} ${tipY}" fill="none" stroke="${C.leafDark}" stroke-width="7" stroke-linecap="round"/>
    <g transform="translate(${tipX} ${tipY}) rotate(${leafRot}) scale(${leafS})">
      <path d="M0 2 Q-40 -22 -52 10 Q-20 24 0 2 Z" fill="${leafCol}" ${ink(5)}/>
      <path d="M0 2 Q34 -30 50 4 Q20 22 0 2 Z" fill="${leafCol}" ${ink(5)}/>
      ${bloom > 0 ? `<g transform="translate(0 -18) scale(${E.back(bloom).toFixed(3)}) rotate(${(1 - bloom) * -90})">${petals}<circle r="12" fill="${C.petalCore}" ${ink(4.5)}/></g>` : ''}
    </g>`;

  const cheeks = o.cheeks == null ? 0.45 : o.cheeks;
  const inner = `
    <ellipse cx="0" cy="104" rx="${92 / sx}" ry="14" fill="#000" opacity=".12"/>
    <ellipse cx="-40" cy="86" rx="30" ry="17" fill="${C.bodyDark}" ${st}/>
    <ellipse cx="40" cy="86" rx="30" ry="17" fill="${C.bodyDark}" ${st}/>
    ${sprout}
    <circle cx="-56" cy="-62" r="22" fill="${C.body}" ${st}/><circle cx="-56" cy="-62" r="10" fill="${C.ear}"/>
    <circle cx="56" cy="-62" r="22" fill="${C.body}" ${st}/><circle cx="56" cy="-62" r="10" fill="${C.ear}"/>
    ${behind('L') ? arm('L') : ''}${behind('R') ? arm('R') : ''}
    <ellipse cx="0" cy="4" rx="90" ry="84" fill="url(#okiBody)" ${st}/>
    <ellipse cx="0" cy="40" rx="54" ry="40" fill="${C.belly}"/>
    <ellipse cx="-34" cy="-50" rx="22" ry="11" transform="rotate(-25 -34 -50)" fill="#fff" opacity=".35"/>
    <ellipse cx="-62" cy="16" rx="14" ry="9" fill="#FF4F6D" opacity="${cheeks}"/>
    <ellipse cx="62" cy="16" rx="14" ry="9" fill="#FF4F6D" opacity="${cheeks}"/>
    ${eyes}
    ${mouth}
    ${o.face || ''}
    ${behind('L') ? '' : arm('L')}${behind('R') ? '' : arm('R')}`;
  // сжатие с опорой на ступни
  return `<g transform="translate(${o.x.toFixed(2)} ${o.y.toFixed(2)}) scale(${o.s})">
    <g transform="translate(0 100) rotate(${(o.rot || 0).toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(0 -100)">${inner}</g></g>`;
}

// ---------- микроб ----------
function germ(t, { hue = 0, phase = 0, mood = 'cheeky' } = {}) {
  const pts = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 30 + 4 * Math.sin(a * 3 + t * 9 + phase) + 2 * Math.sin(a * 5 - t * 7);
    pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.9]);
  }
  // сглаженный контур
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[i], p1 = pts[(i + 1) % n];
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
    d += i === 0 ? `M${mx.toFixed(1)} ${my.toFixed(1)} ` : '';
    d += `Q${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${((p1[0] + pts[(i + 2) % n][0]) / 2).toFixed(1)} ${((p1[1] + pts[(i + 2) % n][1]) / 2).toFixed(1)} `;
  }
  const col = ['#9BD84E', '#7ED3A0', '#B9D84E'][hue % 3];
  const spikes = [0, 1, 2].map((i) => {
    const a = -Math.PI / 2 + (i - 1) * 0.6;
    return `<circle cx="${(Math.cos(a) * 38).toFixed(1)}" cy="${(Math.sin(a) * 36).toFixed(1)}" r="5" fill="${col}" ${ink(3.5)}/>`;
  }).join('');
  const mouth = mood === 'scared'
    ? `<ellipse cx="0" cy="12" rx="6" ry="7" fill="#3A1F2E"/>`
    : `<path d="M-10 8 Q0 18 10 8" fill="none" ${ink(3.5)}/><path d="M4 12 L6 17 L9 11" fill="#fff" ${ink(2)}/>`;
  const brows = mood === 'scared'
    ? `<path d="M-16 -18 L-6 -14 M16 -18 L6 -14" ${ink(3.5)}/>`
    : `<path d="M-16 -14 L-5 -10 M16 -14 L5 -10" ${ink(3.5)}/>`;
  return `${spikes}<path d="${d}Z" fill="${col}" ${ink(4.5)}/>
    <circle cx="-14" cy="-6" r="8" fill="#fff" ${ink(3)}/><circle cx="14" cy="-6" r="8" fill="#fff" ${ink(3)}/>
    <circle cx="${-14 + Math.sin(t * 3 + phase) * 2}" cy="-5" r="4" fill="#2B2340"/><circle cx="${14 + Math.sin(t * 3 + phase) * 2}" cy="-5" r="4" fill="#2B2340"/>
    ${brows}${mouth}
    <circle cx="-12" cy="18" r="3" fill="${C.germDark}" opacity=".6"/><circle cx="18" cy="-18" r="2.5" fill="${C.germDark}" opacity=".6"/>`;
}

// ---------- предметы ----------
const P = {
  toothbrush: (paste = 0) => `
    <rect x="-62" y="-10" width="92" height="20" rx="10" fill="${C.teal}" ${ink()}/>
    <rect x="24" y="-11" width="42" height="22" rx="7" fill="#fff" ${ink()}/>
    <rect x="28" y="-36" width="34" height="24" rx="6" fill="#DFF6FF" ${ink()}/>
    <path d="M37 -34 V-14 M45 -34 V-14 M53 -34 V-14" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>
    ${paste > 0 ? `<g transform="translate(45 -38) scale(${paste.toFixed(3)})">
      <path d="M-20 0 Q-22 -16 -6 -14 Q-4 -26 8 -20 Q22 -22 20 -6 Q24 4 10 2 H-14 Q-24 4 -20 0 Z" fill="#fff" ${ink(4)}/>
      <path d="M-10 -8 Q0 -14 10 -8" fill="none" stroke="#7FD3F7" stroke-width="4" stroke-linecap="round"/></g>` : ''}`,
  bubble: (r = 40) => `
    <circle r="${r}" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="${r / 8}"/>
    <path d="M${-r * 0.55} ${-r * 0.25} A${r * 0.6} ${r * 0.6} 0 0 1 ${-r * 0.15} ${-r * 0.6}" fill="none" stroke="#fff" stroke-width="${r / 6.5}" stroke-linecap="round"/>`,
  foam: (r = 12) => `<circle r="${r}" fill="#fff" ${ink(3.5)}/><circle cx="${-r * 0.3}" cy="${-r * 0.3}" r="${r * 0.25}" fill="#DFF6FF"/>`,
  sun: () => {
    const rays = Array.from({ length: 10 }, (_, i) => `<path d="M0 -50 V-64" transform="rotate(${i * 36})" stroke="#FFB238" stroke-width="8" stroke-linecap="round"/>`).join('');
    return rays + `<circle r="38" fill="${C.yellow}" ${ink()}/>`;
  },
  cup: () => `
    <path d="M-60 -80 H60 L50 40 Q48 60 28 60 H-28 Q-48 60 -50 40 Z" fill="${C.purple}" ${ink(6)}/>
    <path d="M-40 -60 L-34 30" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".4"/>`,
  soap: () => `
    <rect x="-46" y="-26" width="92" height="56" rx="22" fill="${C.pink}" ${ink()}/>
    <ellipse cx="-14" cy="-6" rx="18" ry="8" fill="#fff" opacity=".5"/>`,
  tube: (squeeze = 0) => {
    const w = lerp(1, 0.7, squeeze);
    return `<path d="M-70 ${-26 * w} L40 -22 Q50 -22 50 -12 V12 Q50 22 40 22 L-70 ${26 * w} Z" fill="#fff" ${ink()}/>
      <path d="M-60 ${-12 * w} L20 -10 M-60 ${10 * w} L20 10" stroke="${C.blue}" stroke-width="6" stroke-linecap="round"/>
      <rect x="50" y="-12" width="22" height="24" rx="5" fill="${C.blue}" ${ink(5)}/>
      <rect x="-78" y="${-30 * w}" width="12" height="${60 * w}" rx="4" fill="#DDE7F0" ${ink(5)}/>`;
  },
  sparkle: (k = 1) => `<path d="M0 -30 Q4 -4 30 0 Q4 4 0 30 Q-4 4 -30 0 Q-4 -4 0 -30 Z" fill="#fff" ${ink(4)} transform="scale(${k})"/>`,
  star: () => {
    const p = [];
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 40; const a = -Math.PI / 2 + i * Math.PI / 5; p.push(`${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`); }
    return `<polygon points="${p.join(' ')}" fill="${C.yellow}" ${ink()}/>`;
  },
};

const DEFS = `
  <defs>
    <radialGradient id="okiBody" cx="35%" cy="28%" r="80%">
      <stop offset="0" stop-color="${C.bodyLight}"/><stop offset=".55" stop-color="${C.body}"/><stop offset="1" stop-color="${C.bodyDark}"/>
    </radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FFF6C9" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6C9" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

module.exports = { C, clamp, lerp, E, kf, win, g, ink, okiSVG, okiPoint, handWorld, handLocal, germ, P, DEFS };
