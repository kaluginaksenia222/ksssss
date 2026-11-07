// Баннер YouTube-канала «Лунный автобус», 2048×1152, без надписей.
// Безопасная зона (видна на всех устройствах): 1235×338 по центру — там герои.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bus, C, Cloud, Hmurka, Moon, Star } from "./characters";

const W = 2048;
const H = 1152;

export const Banner: React.FC = () => {
  const rnd = (i: number, n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const dots = Array.from({ length: 160 }, (_, i) => ({ x: rnd(i, 1) * W, y: rnd(i, 2) * H, r: 1.5 + rnd(i, 3) * 4, o: 0.35 + rnd(i, 4) * 0.6 }));
  const bigStars = [
    [160, 180, 26], [330, 900, 20], [520, 140, 18], [1500, 150, 22], [1880, 260, 28], [1760, 930, 20], [880, 1010, 16], [1150, 90, 16], [90, 620, 18], [1960, 640, 16],
  ];
  const mx = 640;
  const my = 576;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 50%, #34307e 0%, ${C.skyBottom} 35%, ${C.skyTop} 100%)` }}>
      <svg width={W} height={H}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o} />
        ))}
        {bigStars.map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i * 13})`} opacity={0.9}>
            <Star r={r} />
          </g>
        ))}
        {/* облака внизу и вверху */}
        {[-60, 300, 700, 1100, 1500, 1900].map((x, i) => (
          <g key={i} transform={`translate(${x} ${1060 + (i % 2) * 40})`}>
            <Cloud s={1.6} o={0.45} />
          </g>
        ))}
        {[200, 1000, 1800].map((x, i) => (
          <g key={i} transform={`translate(${x} ${40 + (i % 2) * 30})`}>
            <Cloud s={1.2} o={0.25} />
          </g>
        ))}
        {/* Луна с 12 звёздочками */}
        <g transform={`translate(${mx} ${my}) scale(0.75)`}>
          <Moon light={1} frame={0} />
        </g>
        {Array.from({ length: 12 }, (_, i) => {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 12;
          return (
            <g key={i} transform={`translate(${mx + Math.cos(a) * 148} ${my + Math.sin(a) * 148}) rotate(${i * 9})`}>
              <Star r={21} face={i % 3 === 0} />
            </g>
          );
        })}
        {/* дорожка искр за автобусом */}
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={820 + i * 36} cy={620 + Math.sin(i * 0.9) * 22} r={10 - i * 0.8} fill={C.star} opacity={0.45 + i * 0.06} />
        ))}
        {/* автобус */}
        <g transform="translate(1290 610) rotate(-4) scale(0.85)">
          <Bus frame={30} toshaMouth={0.6} businkaMouth={0.4} businkaWing={0.8} label={false} />
        </g>
        {/* подобревшая Хмурка у края */}
        <g transform="translate(1850 560) scale(0.55)">
          <Hmurka frame={0} mood={1} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
