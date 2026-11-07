"""Расписание ролика «Дом гасит свет» + звук. Запуск из папки проекта:
python3 -I scripts/make_schedule.py  → assets/schedule.js и assets/sfx/sfx.wav"""
import json, wave
import numpy as np

COLS, ROWS = 11, 21
END = 10.8
rng = np.random.default_rng(21)

# ---- окна, из которых складывается «%» ----
pct = set()
def ring(c0, r0):
    for c in range(c0, c0 + 3):
        for r in range(r0, r0 + 3):
            if not (c == c0 + 1 and r == r0 + 1):
                pct.add((c, r))
ring(1, 5); ring(7, 13)
for r in range(4, 17):
    pct.add((9 - round((r - 4) * 8 / 12), r))

# ---- окна: цвет, изначально тёмные, время выключения ----
windows = []
others = []
for r in range(ROWS):
    for c in range(COLS):
        p = (c, r) in pct
        dark = (not p) and rng.random() < 0.1
        tone = int(rng.integers(0, 4))           # 0..2 тёплые, 3 — холодный «телевизор»
        if tone == 3 and rng.random() < 0.85: tone = int(rng.integers(0, 3))
        w = {"c": c, "r": r, "p": p, "dark": dark, "tone": tone, "b": round(float(rng.uniform(0.78, 1.0)), 3)}
        windows.append(w)
        if not p and not dark:
            others.append(w)

order = rng.permutation(len(others))
singles = [0.70, 1.02, 1.28, 1.48, 1.64, 1.77, 1.88]
rest = len(others) - len(singles)
for k, idx in enumerate(order):
    if k < len(singles):
        t = singles[k]
    else:
        u = (k - len(singles) + 1) / rest
        t = 1.98 + 1.0 * u ** 0.6           # всё чаще и чаще
    others[idx]["off"] = round(t, 3)
LAST = max(w["off"] for w in others)

# «%» висит в темноте, потом гаснет волной по диагонали
PCT_OFF0 = LAST + 0.95
for w in windows:
    if w["p"]:
        w["off"] = round(PCT_OFF0 + (w["r"] - 4) * 0.032 + rng.uniform(0, 0.02), 3)
PCT_LAST = max(w["off"] for w in windows if w["p"])

# ---- текст: буквы «включаются» как окна ----
LINES = ["ЧЁРНАЯ ПЯТНИЦА", "ВЫСОЦКИЙ ДЕВЕЛОПМЕНТ", "СКИДКИ НА КВАРТИРЫ", "В ЖК ЛУВР"]
STEPS = [(PCT_LAST + 0.5, 0.05), (None, 0.034), (None, 0.034), (None, 0.05)]
times, t = [], 0
for text, (start, step) in zip(LINES, STEPS):
    t = start if start is not None else t + (0.1 if text == "В ЖК ЛУВР" else 0.28)
    row = []
    for ch in text:
        row.append(round(t, 3))
        t += step + rng.uniform(-0.008, 0.008) + (0.035 if ch == " " else 0)
    times.append(row)
    t = row[-1]
TEXT_END = t

# ---- страница 1 гаснет буквами (волна слева направо, сверху вниз) ----
P1_OFF = TEXT_END + 1.6
off_times = []
for li, text in enumerate(LINES):
    off_times.append([round(P1_OFF + li * 0.06 + i * 0.012 + rng.uniform(0, 0.03), 3) for i, _ in enumerate(text)])
P1_GONE = max(max(r) for r in off_times) + 0.1

# ---- страница 2: «11 КВАРТИР», «−11%», мелкий текст условий ----
LINES2 = ["11 КВАРТИР", "−11%"]
times2, t = [], P1_GONE + 0.2
for text, step in zip(LINES2, (0.05, 0.09)):
    row = []
    for ch in text:
        row.append(round(t, 3))
        t += step + (0.035 if ch == " " else 0)
    times2.append(row)
    t = row[-1] + 0.3
NOTE = round(times2[-1][-1] + 0.45, 3)     # условия проявляются
FADE = round(NOTE + 3.6, 2)                # успеть прочитать
END = round(FADE + 0.9, 2)

sched = {"cols": COLS, "rows": ROWS, "windows": windows, "lastOff": LAST, "pctOff": PCT_OFF0,
         "lines": LINES, "times": times, "offTimes": off_times,
         "lines2": LINES2, "times2": times2, "note": NOTE, "fade": FADE, "end": END}
open("assets/schedule.js", "w").write("window.SCHED = " + json.dumps(sched, ensure_ascii=False) + ";\n")

# ================= звук =================
SR = 48000
out = np.zeros(int(SR * END), np.float32)
def put(sig, t, g=1.0):
    s = int(t * SR); e = min(len(out), s + len(sig))
    if s < len(out): out[s:e] += sig[: e - s] * g

def click(bright=1.0):
    """Щелчок выключателя: два коротких удара (нажатие и отпускание)."""
    n = int(0.03 * SR); x = np.zeros(n, np.float32)
    for off, g in ((0, 1.0), (int(rng.uniform(0.006, 0.011) * SR), 0.5)):
        m = int(0.004 * SR)
        burst = rng.normal(0, 1, m).astype(np.float32) * np.exp(-np.arange(m) / (0.0007 * SR))
        burst = np.diff(burst, prepend=0) * 0.6 + burst * 0.4 * (1 - bright)
        x[off:off + m] += burst * g
        f = rng.uniform(1700, 2600)
        tone = np.sin(2 * np.pi * f * np.arange(m) / SR) * np.exp(-np.arange(m) / (0.001 * SR))
        x[off:off + m] += tone.astype(np.float32) * 0.25 * g
    return x

# щелчки окон; чем гуще, тем тише каждый
offs = sorted(w["off"] for w in others)
for i, t0 in enumerate(offs):
    dens = sum(1 for u in offs if abs(u - t0) < 0.05)
    put(click(), t0, 0.5 / np.sqrt(dens))
for w in windows:
    if w["p"]:
        put(click(), w["off"], 0.22)

# гул света: громкость = доля горящих окон
tt = np.arange(len(out)) / SR
lit = np.zeros_like(tt)
allw = [w for w in windows if not w["dark"]]
for w in allw:
    lit += (tt < w["off"])
lit /= len(allw)
hum = (np.sin(2*np.pi*100*tt) * 0.5 + np.sin(2*np.pi*200*tt) * 0.25 + np.sin(2*np.pi*300*tt) * 0.12)
hum *= 0.05 * lit * np.minimum(1, tt / 0.15)
out += hum.astype(np.float32)

def read(p):
    with wave.open(p) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        a = np.frombuffer(w.readframes(w.getnframes()), {2: np.int16, 4: np.int32}[sw]).astype(np.float32)
        a = a / float(2 ** (8 * sw - 1)); a = a.reshape(-1, ch).mean(1)
    if sr != SR:
        a = np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a).astype(np.float32)
    return a
impact = read("../../library/sfx/impact.wav")
put(impact, LAST, 0.35)        # дом погас

# буквы: мягкие щелчки
for row in times:
    for t0 in row:
        put(click(0.4), t0, 0.32 + rng.uniform(-0.06, 0.06))

fs = int(FADE * SR); fe = int((END - 0.1) * SR)
out[fs:fe] *= np.linspace(1, 0, fe - fs); out[fe:] = 0
out *= 0.8 / np.abs(out).max()
with wave.open("assets/sfx/sfx.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"страница 1 гаснет {P1_OFF:.2f}, страница 2: {times2[0][0]:.2f}–{times2[-1][-1]:.2f}, условия {NOTE:.2f}, конец {END:.2f}")
print(f"окон {len(windows)}, в «%» {len(pct)}, гаснут до {LAST:.2f} c, % гаснет {PCT_OFF0:.2f}–{PCT_LAST:.2f} c, текст до {TEXT_END:.2f} c")

# громкость под рилс: около −16 LUFS, пики не выше −1.5 dB
import subprocess, os
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "assets/sfx/sfx.wav", "-af",
                "acompressor=threshold=-24dB:ratio=3:attack=2:release=60,loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ar", "48000", "assets/sfx/sfx_norm.wav"], check=True)
os.replace("assets/sfx/sfx_norm.wav", "assets/sfx/sfx.wav")
