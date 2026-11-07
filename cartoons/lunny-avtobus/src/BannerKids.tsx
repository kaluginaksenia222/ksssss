// Общий детский баннер YouTube-канала, 2048×1152, без надписей и без героев сериала.
// Главное — в безопасной зоне 1235×338 по центру (x 406–1641, y 407–745).
import React from "react";
import { AbsoluteFill } from "remotion";

const W = 2048;
const H = 1152;

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={-70} cy={10} r={50} fill="#fff" />
    <circle cx={0} cy={-18} r={70} fill="#fff" />
    <circle cx={75} cy={12} r={52} fill="#fff" />
    <rect x={-120} y={10} width={245} height={52} rx={26} fill="#fff" />
  </g>
);

const Balloon: React.FC<{ x: number; y: number; c: string; s?: number; tilt?: number }> = ({ x, y, c, s = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
    <path d="M0,62 q-14,40 6,80 q16,34 -4,74" stroke="#5b5b7a" strokeWidth={3} fill="none" />
    <ellipse cx={0} cy={0} rx={48} ry={60} fill={c} />
    <path d="M-8,58 L8,58 L0,70Z" fill={c} />
    <ellipse cx={-18} cy={-22} rx={10} ry={18} fill="#fff" opacity={0.45} transform="rotate(20 -18 -22)" />
  </g>
);

const Tree: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-10} y={0} width={20} height={70} rx={8} fill="#8a5a3b" />
    <circle cx={0} cy={-20} r={56} fill={c} />
    <circle cx={-34} cy={6} r={36} fill={c} />
    <circle cx={34} cy={6} r={36} fill={c} />
  </g>
);

const Flower: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-2} y={0} width={4} height={26} fill="#3f9a3a" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 10} cy={Math.sin((a * Math.PI) / 180) * 10} r={8} fill={c} />
    ))}
    <circle r={6} fill="#ffd23f" />
  </g>
);

export const BannerKids: React.FC = () => {
  const rainbow = ["#ff5a5f", "#ff9f1c", "#ffd23f", "#5ccf5a", "#3fa9f5", "#8a6cf0"];
  const rnd = (i: number, n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const flowerColors = ["#ff5a5f", "#ffffff", "#ff8fc7", "#8a6cf0", "#ff9f1c"];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#5ec8ff 0%, #9fe0ff 55%, #d6f3ff 100%)" }}>
      <svg width={W} height={H}>
        {/* солнце в углу */}
        <g transform="translate(1800 190)">
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-10} y={-190} width={20} height={60} rx={10} fill="#ffd23f" transform={`rotate(${i * 30})`} />
          ))}
          <circle r={115} fill="#ffe46b" />
          <circle r={95} fill="#ffd23f" />
        </g>
        {/* радуга: центр в безопасной зоне */}
        {rainbow.map((c, i) => (
          <path key={c} d={`M${1024 - 560 + i * 44},800 A${560 - i * 44},${470 - i * 44} 0 0 1 ${1024 + 560 - i * 44},800`} stroke={c} strokeWidth={46} fill="none" />
        ))}
        <Cloud x={470} y={760} s={1.25} />
        <Cloud x={1580} y={760} s={1.25} />
        <Cloud x={300} y={170} s={0.9} />
        <Cloud x={1050} y={110} s={0.7} />
        <Cloud x={1400} y={260} s={0.6} />
        {/* холмы */}
        <path d={`M0,900 Q350,760 700,880 T1400,870 T2048,840 L2048,${H} L0,${H}Z`} fill="#7ed957" />
        <path d={`M0,990 Q420,880 900,980 T2048,960 L2048,${H} L0,${H}Z`} fill="#5cc04a" />
        <Tree x={170} y={860} s={1.1} c="#3fa83a" />
        <Tree x={330} y={900} s={0.8} c="#4cbb45" />
        <Tree x={1850} y={850} s={1.1} c="#3fa83a" />
        <Tree x={1700} y={890} s={0.8} c="#4cbb45" />
        {Array.from({ length: 40 }, (_, i) => (
          <Flower key={i} x={rnd(i, 1) * W} y={1010 + rnd(i, 2) * 110} c={flowerColors[i % 5]} />
        ))}
        {/* шарики в безопасной зоне */}
        <Balloon x={760} y={520} c="#ff5a5f" tilt={-8} />
        <Balloon x={850} y={480} c="#ffd23f" s={0.9} tilt={4} />
        <Balloon x={1200} y={500} c="#3fa9f5" tilt={6} />
        <Balloon x={1290} y={545} c="#8a6cf0" s={0.85} tilt={-4} />
        <Balloon x={1024} y={450} c="#ff8fc7" s={1.1} />
        {/* воздушный змей слева */}
        <g transform="translate(560 300) rotate(-15)">
          <path d="M0,-70 L50,0 L0,90 L-50,0Z" fill="#ff9f1c" />
          <path d="M0,-70 L0,90 M-50,0 L50,0" stroke="#fff" strokeWidth={4} />
          <path d="M0,90 q30,40 0,80 q-30,40 0,80" stroke="#5b5b7a" strokeWidth={3} fill="none" />
          {[120, 170, 220].map((y, i) => (
            <path key={y} d={`M-12,${y} L12,${y + 10} L-12,${y + 20}Z`} fill={["#ff5a5f", "#3fa9f5", "#5ccf5a"][i]} transform={`translate(${i % 2 ? -10 : 10} 0)`} />
          ))}
        </g>
        {/* птички */}
        {[[1450, 380], [1520, 420], [300, 520]].map(([x, y], i) => (
          <path key={i} d={`M${x - 20},${y} q10,-14 20,0 q10,-14 20,0`} stroke="#2b3a67" strokeWidth={4} fill="none" strokeLinecap="round" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
