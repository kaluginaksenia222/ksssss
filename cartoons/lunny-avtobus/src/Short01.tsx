// Shorts №1 «Лунный автобус»: Луна потеряла свет, первая звёздочка.
import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { Bus, Businka, C, Cloud, Hmurka, Moon, Star } from "./characters";

loadFont({ family: "Tight", url: staticFile("fonts/inter-tight-cyrillic-900-normal.woff2"), weight: "900" });
loadFont({ family: "Tight", url: staticFile("fonts/inter-tight-latin-900-normal.woff2"), weight: "900" });

export const SHORT01_FRAMES = 990;
const W = 1080;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const talk = (f: number, from: number, to: number) => (f >= from && f < to ? Math.abs(Math.sin((f - from) * 0.55)) : 0);

// реплики: кто, с какого по какой кадр, текст
const LINES: { who: "tosha" | "businka" | "title"; from: number; to: number; text: string }[] = [
  { who: "title", from: 8, to: 95, text: "Луна потеряла свет!" },
  { who: "tosha", from: 125, to: 235, text: "Пристегнулись?\nПолетели!" },
  { who: "businka", from: 250, to: 385, text: "Двенадцать звёздочек\nрассыпались по небу!" },
  { who: "businka", from: 420, to: 525, text: "Ой! Одну спрятала\nтучка Хмурка!" },
  { who: "businka", from: 530, to: 640, text: "Подуем вместе?" },
  { who: "title", from: 690, to: 800, text: "Ура! Первая звёздочка!" },
  { who: "tosha", from: 805, to: 885, text: "Куда полетим дальше?" },
];

const Bubble: React.FC<{ text: string; from: number; to: number; who: string }> = ({ text, from, to, who }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame: f - from, fps, config: { damping: 11, stiffness: 160 } });
  const out = interpolate(f, [to - 8, to], [1, 0], clamp);
  const s = inS * out;
  if (s <= 0.001) return null;
  const title = who === "title";
  const bg = title ? C.star : C.white;
  const tailLeft = who === "businka";
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: title ? 660 : 1430,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${s})`,
        transformOrigin: tailLeft ? "25% 0%" : "70% 0%",
      }}
    >
      <div
        style={{
          position: "relative",
          background: bg,
          color: C.ink,
          fontFamily: "Tight",
          fontWeight: 900,
          fontSize: title ? 84 : 74,
          lineHeight: 1.1,
          textAlign: "center",
          padding: "34px 50px",
          borderRadius: 60,
          whiteSpace: "pre-line",
          boxShadow: "0 14px 0 rgba(0,0,0,0.25)",
        }}
      >
        {!title && (
          <div
            style={{
              position: "absolute",
              top: -38,
              left: tailLeft ? 120 : undefined,
              right: tailLeft ? undefined : 150,
              width: 0,
              height: 0,
              borderLeft: "30px solid transparent",
              borderRight: "30px solid transparent",
              borderBottom: `44px solid ${bg}`,
            }}
          />
        )}
        {text}
      </div>
    </div>
  );
};

const SkyStars: React.FC = () => {
  const f = useCurrentFrame();
  const stars = React.useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
          return x - Math.floor(x);
        };
        return { x: r(1) * W, y: r(2) * 1920, s: 2 + r(3) * 5, p: r(4) * 6.28 };
      }),
    []
  );
  return (
    <svg width={W} height={1920} style={{ position: "absolute" }}>
      {stars.map((s, i) => (
        <circle key={i} cx={(s.x - f * 0.4 * (s.s / 4) + W * 4) % W} cy={s.y} r={s.s} fill="#fff" opacity={0.35 + 0.5 * Math.abs(Math.sin(f / 20 + s.p))} />
      ))}
    </svg>
  );
};

export const Short01: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // автобус: влетает слева, качается, в конце улетает вправо
  const busIn = spring({ frame: f - 95, fps, config: { damping: 14, stiffness: 60 } });
  const busOut = interpolate(f, [880, 920], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const busX = interpolate(busIn, [0, 1], [-500, 560]) + busOut * 1000;
  const busY = 1190 + Math.sin(f / 14) * 18;
  const busRot = Math.sin(f / 20) * 2 + busOut * -8;

  // Хмурка: вплывает справа, после «три!» удивляется и улетает вверх
  const hIn = spring({ frame: f - 395, fps, config: { damping: 15, stiffness: 70 } });
  const hAway = interpolate(f, [622, 670], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const hX = interpolate(hIn, [0, 1], [1500, 690]) + hAway * 700;
  const hY = 720 - hAway * 1100;
  const hMood = interpolate(f, [615, 630], [0, 1], clamp);

  // звёздочка: прячется за Хмуркой, появляется, летит к Луне
  const starShow = spring({ frame: f - 625, fps, config: { damping: 9, stiffness: 120 } });
  const fly = interpolate(f, [700, 760], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const slotA = -Math.PI / 2;
  const sx = interpolate(fly, [0, 1], [690, 540 + Math.cos(slotA) * 215]);
  const sy = interpolate(fly, [0, 1], [730, 380 + Math.sin(slotA) * 215]) - Math.sin(fly * Math.PI) * 160;
  const sr = interpolate(fly, [0, 1], [110, 34]);

  // Луна: тусклая, после звезды чуть светлее
  const light = interpolate(f, [755, 790], [0, 0.6], clamp);
  const moonY = 380 + Math.sin(f / 30) * 6;

  // падающая звезда в начале
  const fall = interpolate(f, [30, 75], [0, 1], clamp);

  // счёт «раз-два-три»
  const counts = [
    { n: "1", at: 545 },
    { n: "2", at: 572 },
    { n: "3", at: 599 },
  ];

  // финальная карточка
  const endS = spring({ frame: f - 905, fps, config: { damping: 12 } });

  const businkaTalk = LINES.filter((l) => l.who === "businka").reduce((m, l) => Math.max(m, talk(f, l.from, l.to - 15)), 0);
  const toshaTalk = LINES.filter((l) => l.who === "tosha").reduce((m, l) => Math.max(m, talk(f, l.from, l.to - 15)), 0);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.skyTop}, ${C.skyBottom} 70%, #4a3d8f)` }}>
      <SkyStars />
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        {/* дальние облака */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${((((i * 420 - f * 2.2) % 1680) + 1680) % 1680) - 300} ${1500 + (i % 2) * 220})`}>
            <Cloud s={1.1} o={0.35} />
          </g>
        ))}

        {/* слоты для 12 звёзд вокруг Луны */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = slotA + (i * Math.PI * 2) / 12;
          return (
            <g key={i} transform={`translate(${540 + Math.cos(a) * 215} ${moonY + Math.sin(a) * 215})`} opacity={0.35}>
              <Star r={26} fill="none" />
            </g>
          );
        })}
        <g transform={`translate(540 ${moonY})`}>
          <Moon light={light} frame={f} />
        </g>

        {/* падающая звезда */}
        {fall > 0 && fall < 1 && (
          <g transform={`translate(${interpolate(fall, [0, 1], [700, 1200])} ${interpolate(fall, [0, 1], [300, 760])}) rotate(${fall * 400})`} opacity={1 - fall * 0.6}>
            <Star r={36} />
          </g>
        )}

        {/* звёздочка */}
        {f >= 620 && (
          <g transform={`translate(${sx} ${fly >= 1 ? moonY - 215 : sy}) scale(${starShow}) rotate(${Math.sin(f / 8) * 8 * (1 - fly)})`}>
            {fly < 1 && <circle r={sr * 1.6} fill={C.star} opacity={0.18} />}
            <Star r={sr} face />
          </g>
        )}

        {/* Хмурка */}
        {f >= 390 && hY > -400 && (
          <g transform={`translate(${hX} ${hY}) scale(${1.05 - hAway * 0.5})`}>
            <Hmurka frame={f} mood={hMood} />
          </g>
        )}

        {/* ветерок, когда дуем */}
        {f >= 600 && f < 650 &&
          [0, 1, 2].map((i) => {
            const k = interpolate(f, [600 + i * 4, 640 + i * 4], [0, 1], clamp);
            return (
              <path
                key={i}
                d={`M${300 + k * 260},${800 - i * 70} q60,-30 120,0`}
                stroke="#dfe6ff"
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
                opacity={Math.sin(k * Math.PI)}
              />
            );
          })}

        {/* автобус */}
        {f >= 90 && (
          <g transform={`translate(${busX} ${busY}) rotate(${busRot}) scale(1.35)`}>
            <Bus frame={f} toshaMouth={toshaTalk} businkaMouth={businkaTalk} businkaWing={f >= 530 && f < 620 ? Math.abs(Math.sin(f / 5)) : 0} />
          </g>
        )}
      </svg>

      {/* счёт */}
      {counts.map(({ n, at }) => {
        const k = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 200 } });
        const o = interpolate(f, [at + 18, at + 26], [1, 0], clamp);
        if (f < at || o <= 0) return null;
        return (
          <div key={n} style={{ position: "absolute", left: 40, width: 320, top: 560, textAlign: "center", fontFamily: "Tight", fontSize: 300, color: C.star, transform: `scale(${k})`, opacity: o, textShadow: "0 12px 0 rgba(0,0,0,0.3)" }}>
            {n}
          </div>
        );
      })}

      {/* счётчик звёзд */}
      {f >= 760 && (
        <div style={{ position: "absolute", top: 90, right: 60, background: "rgba(0,0,0,0.35)", borderRadius: 40, padding: "14px 30px", fontFamily: "Tight", fontSize: 56, color: C.star, transform: `scale(${spring({ frame: f - 760, fps, config: { damping: 10 } })})` }}>
          ★ 1 / 12
        </div>
      )}

      {LINES.map((l, i) => (
        <Bubble key={i} {...l} />
      ))}

      {/* финальная карточка */}
      {f >= 905 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 200 }}>
          <div style={{ transform: `scale(${endS})`, textAlign: "center", fontFamily: "Tight" }}>
            <div style={{ fontSize: 120, color: C.bus, lineHeight: 1, textShadow: "0 10px 0 #7a2f10" }}>ЛУННЫЙ</div>
            <div style={{ fontSize: 120, color: C.star, lineHeight: 1, textShadow: "0 10px 0 #8a6a00" }}>АВТОБУС</div>
            <div style={{ marginTop: 40, fontSize: 56, color: "#fff" }}>Новая серия — скоро!</div>
          </div>
          <svg width={240} height={240} style={{ position: "absolute", left: 60, bottom: 160, transform: `scale(${endS})` }}>
            <g transform="translate(120 130) scale(1.3)">
              <Businka wing={Math.abs(Math.sin(f / 5))} blink={f % 70 < 4} />
            </g>
          </svg>
        </AbsoluteFill>
      )}

      {/* звук */}
      <Audio src={staticFile("music/lullaby.wav")} volume={0.55} />
      <Sequence from={30}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} /></Sequence>
      <Sequence from={95}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} /></Sequence>
      {LINES.map((l, i) => (
        <Sequence key={i} from={l.from}><Audio src={staticFile("sfx/pop.wav")} volume={0.35} /></Sequence>
      ))}
      <Sequence from={395}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} /></Sequence>
      {counts.map(({ at }) => (
        <Sequence key={at} from={at}><Audio src={staticFile("sfx/tick.wav")} volume={0.7} /></Sequence>
      ))}
      <Sequence from={600}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} /></Sequence>
      <Sequence from={625}><Audio src={staticFile("sfx/shimmer.wav")} volume={0.7} /></Sequence>
      <Sequence from={755}><Audio src={staticFile("sfx/shimmer.wav")} volume={0.6} /></Sequence>
      <Sequence from={905}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};
