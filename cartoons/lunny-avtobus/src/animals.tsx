// Милые животные для детского баннера, нарисованы кодом.
import React from "react";

const INK = "#2b2140";
const Eyes: React.FC<{ dx: number; y: number; r: number }> = ({ dx, y, r }) => (
  <>
    <circle cx={-dx} cy={y} r={r} fill={INK} />
    <circle cx={dx} cy={y} r={r} fill={INK} />
    <circle cx={-dx + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
    <circle cx={dx + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
  </>
);
const Cheeks: React.FC<{ dx: number; y: number }> = ({ dx, y }) => (
  <>
    <ellipse cx={-dx} cy={y} rx={11} ry={7} fill="#ff8fa3" opacity={0.7} />
    <ellipse cx={dx} cy={y} rx={11} ry={7} fill="#ff8fa3" opacity={0.7} />
  </>
);
const Smile: React.FC<{ y: number; w?: number }> = ({ y, w = 10 }) => (
  <path d={`M${-w},${y} q${w / 2},${w * 0.7} ${w},0 q${w / 2},${w * 0.7} ${w},0`} transform={`translate(${-0} 0)`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
);

export const Bunny: React.FC = () => (
  <g>
    <ellipse cx={-22} cy={-110} rx={16} ry={50} fill="#fff" transform="rotate(-10 -22 -70)" />
    <ellipse cx={22} cy={-110} rx={16} ry={50} fill="#fff" transform="rotate(12 22 -70)" />
    <ellipse cx={-22} cy={-108} rx={7} ry={34} fill="#ffc2d1" transform="rotate(-10 -22 -70)" />
    <ellipse cx={22} cy={-108} rx={7} ry={34} fill="#ffc2d1" transform="rotate(12 22 -70)" />
    <ellipse cx={0} cy={40} rx={48} ry={44} fill="#fff" />
    <circle cx={0} cy={-30} r={50} fill="#fff" />
    <Eyes dx={18} y={-34} r={8} />
    <Cheeks dx={30} y={-16} />
    <ellipse cx={0} cy={-20} rx={6} ry={4} fill="#ff8fa3" />
    <Smile y={-12} w={7} />
    <ellipse cx={-26} cy={78} rx={18} ry={10} fill="#fff" />
    <ellipse cx={26} cy={78} rx={18} ry={10} fill="#fff" />
  </g>
);

export const Bear: React.FC = () => (
  <g>
    <circle cx={-40} cy={-68} r={20} fill="#a86b45" />
    <circle cx={40} cy={-68} r={20} fill="#a86b45" />
    <circle cx={-40} cy={-68} r={10} fill="#e6b48f" />
    <circle cx={40} cy={-68} r={10} fill="#e6b48f" />
    <ellipse cx={0} cy={42} rx={54} ry={48} fill="#a86b45" />
    <ellipse cx={0} cy={50} rx={30} ry={30} fill="#e6b48f" />
    <circle cx={0} cy={-30} r={56} fill="#a86b45" />
    <ellipse cx={0} cy={-12} rx={24} ry={18} fill="#e6b48f" />
    <Eyes dx={20} y={-38} r={8} />
    <Cheeks dx={34} y={-20} />
    <ellipse cx={0} cy={-18} rx={8} ry={6} fill={INK} />
    <Smile y={-8} w={7} />
    {/* машет лапкой */}
    <ellipse cx={58} cy={4} rx={16} ry={26} fill="#a86b45" transform="rotate(-40 58 4)" />
    <ellipse cx={-50} cy={30} rx={15} ry={24} fill="#a86b45" transform="rotate(20 -50 30)" />
  </g>
);

export const Kitten: React.FC = () => (
  <g>
    <path d="M-48,-52 L-40,-100 L-12,-72Z" fill="#ffad5c" />
    <path d="M48,-52 L40,-100 L12,-72Z" fill="#ffad5c" />
    <path d="M-40,-60 L-36,-86 L-20,-70Z" fill="#ffc2d1" />
    <path d="M40,-60 L36,-86 L20,-70Z" fill="#ffc2d1" />
    <path d="M40,70 q60,-10 50,-60" stroke="#ffad5c" strokeWidth={14} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={44} rx={42} ry={40} fill="#ffad5c" />
    <circle cx={0} cy={-30} r={54} fill="#ffad5c" />
    <path d="M-10,-82 l5,18 M0,-84 l0,18 M10,-82 l-5,18" stroke="#e8893a" strokeWidth={5} strokeLinecap="round" />
    <Eyes dx={20} y={-32} r={9} />
    <Cheeks dx={34} y={-12} />
    <path d="M-5,-16 L5,-16 L0,-10Z" fill="#ff8fa3" />
    <Smile y={-8} w={7} />
    <path d="M-30,-14 l-26,-4 M-30,-8 l-26,4 M30,-14 l26,-4 M30,-8 l26,4" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    {/* поднятая лапка держит шарики */}
    <ellipse cx={-64} cy={-30} rx={12} ry={56} fill="#ffad5c" transform="rotate(-8 -64 20)" />
    <circle cx={-70} cy={-92} r={14} fill="#ffad5c" />
  </g>
);

export const Hedgehog: React.FC = () => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI * (0.95 + i * 0.11);
      return <path key={i} d={`M${Math.cos(a) * 40},${Math.sin(a) * 40} L${Math.cos(a) * 82},${Math.sin(a) * 70} L${Math.cos(a + 0.18) * 40},${Math.sin(a + 0.18) * 40}Z`} fill="#6b4a36" />;
    })}
    <ellipse cx={-8} cy={0} rx={62} ry={44} fill="#6b4a36" />
    <path d="M30,-20 Q90,0 82,16 Q60,40 20,36Z" fill="#e6b48f" />
    <circle cx={84} cy={14} r={8} fill={INK} />
    <circle cx={50} cy={4} r={6} fill={INK} />
    <circle cx={52} cy={2} r={2} fill="#fff" />
    <ellipse cx={46} cy={20} rx={8} ry={5} fill="#ff8fa3" opacity={0.7} />
    <ellipse cx={-30} cy={42} rx={10} ry={6} fill="#5a3d2c" />
    <ellipse cx={20} cy={42} rx={10} ry={6} fill="#5a3d2c" />
  </g>
);

export const Chick: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <g transform={flip ? "scale(-1 1)" : undefined}>
    <path d="M-4,-58 q4,-14 10,-2 q6,-12 8,4" stroke="#ffb703" strokeWidth={4} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={40} ry={44} fill="#ffe14d" />
    <ellipse cx={-30} cy={6} rx={12} ry={20} fill="#ffd21f" transform="rotate(20 -30 6)" />
    <circle cx={10} cy={-14} r={6} fill={INK} />
    <circle cx={12} cy={-16} r={2} fill="#fff" />
    <path d="M30,-6 L48,0 L30,6Z" fill="#ff9f1c" />
    <ellipse cx={18} cy={6} rx={8} ry={5} fill="#ff8fa3" opacity={0.7} />
    <path d="M-10,42 l0,10 M10,42 l0,10" stroke="#ff9f1c" strokeWidth={4} strokeLinecap="round" />
  </g>
);

export const Butterfly: React.FC<{ c: string }> = ({ c }) => (
  <g>
    <ellipse cx={-14} cy={-10} rx={16} ry={20} fill={c} transform="rotate(-25 -14 -10)" />
    <ellipse cx={14} cy={-10} rx={16} ry={20} fill={c} transform="rotate(25 14 -10)" />
    <ellipse cx={-10} cy={12} rx={10} ry={12} fill={c} opacity={0.85} />
    <ellipse cx={10} cy={12} rx={10} ry={12} fill={c} opacity={0.85} />
    <rect x={-3} y={-20} width={6} height={40} rx={3} fill={INK} />
    <path d="M-2,-20 q-6,-12 -12,-14 M2,-20 q6,-12 12,-14" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
  </g>
);
