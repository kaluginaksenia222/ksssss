// Герои «Лунного автобуса», нарисованные кодом (SVG): одинаковые в каждой серии.
import React from "react";

export const C = {
  skyTop: "#0b1240",
  skyBottom: "#2b2a6e",
  moon: "#ffe9a8",
  moonDim: "#6f6d8f",
  bus: "#ff8a3d",
  busDark: "#d9652a",
  window: "#bfe6ff",
  star: "#ffd84a",
  cloud: "#8f8bd6",
  hmurka: "#4a3f7a",
  ink: "#1b1640",
  white: "#ffffff",
};

// Енот Тоша — голова (для окна водителя)
export const Tosha: React.FC<{ blink?: boolean; mouth?: number }> = ({ blink, mouth = 0 }) => (
  <g>
    <ellipse cx={-38} cy={-42} rx={18} ry={22} fill="#7d7f8f" />
    <ellipse cx={38} cy={-42} rx={18} ry={22} fill="#7d7f8f" />
    <ellipse cx={-38} cy={-40} rx={9} ry={12} fill="#3a3a48" />
    <ellipse cx={38} cy={-40} rx={9} ry={12} fill="#3a3a48" />
    <ellipse cx={0} cy={0} rx={56} ry={50} fill="#9a9cab" />
    <path d="M-52,-4 Q-26,-26 0,-8 Q26,-26 52,-4 Q30,18 0,8 Q-30,18 -52,-4Z" fill="#2e2e3a" />
    <ellipse cx={0} cy={26} rx={30} ry={20} fill="#e9e6ee" />
    {blink ? (
      <>
        <path d="M-30,-4 q8,6 16,0" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M14,-4 q8,6 16,0" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx={-22} cy={-4} r={11} fill="#fff" />
        <circle cx={22} cy={-4} r={11} fill="#fff" />
        <circle cx={-20} cy={-3} r={6} fill={C.ink} />
        <circle cx={24} cy={-3} r={6} fill={C.ink} />
        <circle cx={-18} cy={-6} r={2} fill="#fff" />
        <circle cx={26} cy={-6} r={2} fill="#fff" />
      </>
    )}
    <ellipse cx={0} cy={16} rx={8} ry={6} fill={C.ink} />
    <ellipse cx={0} cy={32} rx={10} ry={3 + mouth * 9} fill="#7a2b3a" />
    {/* кепка водителя */}
    <path d="M-44,-34 Q0,-74 44,-34 Z" fill="#2f6fd6" />
    <rect x={-48} y={-38} width={96} height={10} rx={5} fill="#1f4fa6" />
    <circle cx={0} cy={-50} r={6} fill={C.star} />
  </g>
);

// Совёнок Бусинка
export const Businka: React.FC<{ blink?: boolean; mouth?: number; wing?: number }> = ({ blink, mouth = 0, wing = 0 }) => (
  <g>
    <path d="M-40,-34 L-30,-62 L-14,-40Z" fill="#8a5a3b" />
    <path d="M40,-34 L30,-62 L14,-40Z" fill="#8a5a3b" />
    <ellipse cx={0} cy={0} rx={50} ry={54} fill="#a8714b" />
    <ellipse cx={0} cy={20} rx={30} ry={30} fill="#f3d9b5" />
    <g transform={`rotate(${-20 - wing * 40} -46 0)`}>
      <ellipse cx={-50} cy={10} rx={14} ry={28} fill="#8a5a3b" />
    </g>
    <ellipse cx={50} cy={10} rx={14} ry={28} fill="#8a5a3b" />
    <circle cx={-20} cy={-10} r={20} fill="#fff" />
    <circle cx={20} cy={-10} r={20} fill="#fff" />
    {blink ? (
      <>
        <path d="M-32,-10 q12,8 24,0" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M8,-10 q12,8 24,0" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx={-18} cy={-8} r={11} fill={C.ink} />
        <circle cx={22} cy={-8} r={11} fill={C.ink} />
        <circle cx={-14} cy={-13} r={4} fill="#fff" />
        <circle cx={26} cy={-13} r={4} fill="#fff" />
      </>
    )}
    <path d={`M-8,8 L8,8 L0,${20 + mouth * 6}Z`} fill="#ffb02e" />
    {/* билетик-сумочка кондуктора */}
    <rect x={14} y={30} width={26} height={20} rx={4} fill="#e8484f" />
  </g>
);

// Автобус Тарахтун с пассажирами
export const Bus: React.FC<{
  frame: number;
  toshaMouth?: number;
  businkaMouth?: number;
  businkaWing?: number;
  label?: boolean;
}> = ({ frame, toshaMouth = 0, businkaMouth = 0, businkaWing = 0, label = true }) => {
  const blinkT = frame % 110 < 5;
  const blinkB = (frame + 47) % 130 < 5;
  const prop = (frame * 38) % 360;
  return (
    <g>
      {/* пропеллер */}
      <rect x={-6} y={-200} width={12} height={40} fill="#555" />
      <g transform={`translate(0 -200) scale(${Math.cos((prop * Math.PI) / 180)} 1)`}>
        <ellipse cx={0} cy={0} rx={110} ry={12} fill="#cfd3e6" opacity={0.9} />
      </g>
      {/* корпус */}
      <rect x={-280} y={-170} width={540} height={260} rx={90} fill={C.bus} />
      <rect x={-280} y={20} width={540} height={70} rx={35} fill={C.busDark} />
      {/* фара-глаз автобуса */}
      <circle cx={238} cy={30} r={26} fill="#fff7c2" />
      <circle cx={242} cy={30} r={12} fill={C.ink} />
      {/* окна */}
      <rect x={70} y={-140} width={170} height={130} rx={40} fill={C.window} />
      <rect x={-240} y={-140} width={140} height={120} rx={36} fill={C.window} />
      <rect x={-80} y={-140} width={130} height={120} rx={36} fill={C.window} />
      <g transform="translate(155 -60) scale(0.95)">
        <Tosha blink={blinkT} mouth={toshaMouth} />
      </g>
      <g transform="translate(-170 -66) scale(0.8)">
        <Businka blink={blinkB} mouth={businkaMouth} wing={businkaWing} />
      </g>
      {/* блик на окнах */}
      <path d="M90,-128 l40,0 l-30,40Z" fill="#fff" opacity={0.5} />
      {/* надпись */}
      {label && <text x={-15} y={68} textAnchor="middle" fontFamily="Tight" fontSize={34} fill="#fff">ЛУННЫЙ</text>}
      {/* колёса-крылышки */}
      <circle cx={-170} cy={95} r={38} fill={C.ink} />
      <circle cx={-170} cy={95} r={14} fill="#aaa" />
      <circle cx={150} cy={95} r={38} fill={C.ink} />
      <circle cx={150} cy={95} r={14} fill="#aaa" />
    </g>
  );
};

export const Star: React.FC<{ r: number; fill?: string; face?: boolean }> = ({ r, fill = C.star, face }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.48;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g>
      <polygon points={pts} fill={fill} stroke="#fff3b0" strokeWidth={r * 0.06} strokeLinejoin="round" />
      {face && (
        <>
          <circle cx={-r * 0.16} cy={-r * 0.04} r={r * 0.07} fill={C.ink} />
          <circle cx={r * 0.16} cy={-r * 0.04} r={r * 0.07} fill={C.ink} />
          <path d={`M${-r * 0.12},${r * 0.12} q${r * 0.12},${r * 0.12} ${r * 0.24},0`} stroke={C.ink} strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

export const Moon: React.FC<{ light: number; frame: number }> = ({ light, frame }) => {
  const mix = (a: string, b: string, k: number) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(",")})`;
  };
  const sleepy = light < 0.5;
  return (
    <g>
      <circle r={190 + light * 60} fill={C.moon} opacity={0.12 * light} />
      <circle r={150 + light * 30} fill={C.moon} opacity={0.18 * light} />
      <circle r={130} fill={mix(C.moonDim, C.moon, light)} />
      <circle cx={-50} cy={-40} r={18} fill="#000" opacity={0.08} />
      <circle cx={40} cy={50} r={24} fill="#000" opacity={0.08} />
      {sleepy ? (
        <>
          <path d="M-60,-6 q20,14 40,0" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M20,-6 q20,14 40,0" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M-20,50 q20,-12 40,0" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <text x={110} y={-110 - (frame % 60)} fontFamily="Tight" fontSize={44} fill="#cfd3ff" opacity={1 - (frame % 60) / 60}>z</text>
        </>
      ) : (
        <>
          <circle cx={-40} cy={-6} r={14} fill={C.ink} />
          <circle cx={40} cy={-6} r={14} fill={C.ink} />
          <circle cx={-35} cy={-11} r={5} fill="#fff" />
          <circle cx={45} cy={-11} r={5} fill="#fff" />
          <path d="M-36,40 q36,36 72,0" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={-80} cy={30} r={16} fill="#ff9aa8" opacity={0.6} />
          <circle cx={80} cy={30} r={16} fill="#ff9aa8" opacity={0.6} />
        </>
      )}
    </g>
  );
};

// Тучка Хмурка
export const Hmurka: React.FC<{ frame: number; mood: number }> = ({ frame, mood }) => {
  const b = Math.sin(frame / 12) * 6;
  return (
    <g transform={`translate(0 ${b})`}>
      <circle cx={-120} cy={20} r={90} fill={C.hmurka} />
      <circle cx={0} cy={-30} r={120} fill={C.hmurka} />
      <circle cx={130} cy={20} r={95} fill={C.hmurka} />
      <rect x={-200} y={20} width={400} height={95} rx={47} fill={C.hmurka} />
      <circle cx={-40} cy={0} r={18} fill="#fff" />
      <circle cx={40} cy={0} r={18} fill="#fff" />
      <circle cx={-38} cy={4} r={9} fill={C.ink} />
      <circle cx={42} cy={4} r={9} fill={C.ink} />
      {/* брови: хмурые → удивлённые */}
      <path d={`M-62,${-28 + mood * -10} L-20,${-20 - mood * 14}`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <path d={`M62,${-28 + mood * -10} L20,${-20 - mood * 14}`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <path d={`M-24,${58} q24,${-14 + mood * 30} 48,0`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Cloud: React.FC<{ s?: number; o?: number }> = ({ s = 1, o = 0.5 }) => (
  <g transform={`scale(${s})`} opacity={o}>
    <circle cx={-70} cy={10} r={50} fill={C.cloud} />
    <circle cx={0} cy={-15} r={70} fill={C.cloud} />
    <circle cx={75} cy={12} r={52} fill={C.cloud} />
    <rect x={-120} y={10} width={245} height={52} rx={26} fill={C.cloud} />
  </g>
);
