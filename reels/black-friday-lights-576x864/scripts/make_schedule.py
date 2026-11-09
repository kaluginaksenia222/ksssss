"""Расписание ролика «Дом гасит свет», версия 576×864 (вертикаль) без звука. Запуск из папки проекта:
python3 -I scripts/make_schedule.py  → assets/schedule.js и assets/sfx/sfx.wav"""
import json, wave
import numpy as np

COLS, ROWS = 11, 15         # вертикальный дом под 576×864
END = 10.8
rng = np.random.default_rng(21)

# ---- окна, из которых складывается «%» ----
pct = set()
def ring(c0, r0):
    for c in range(c0, c0 + 3):
        for r in range(r0, r0 + 3):
            if not (c == c0 + 1 and r == r0 + 1):
                pct.add((c, r))
ring(1, 3); ring(7, 9)
for r in range(2, 13):
    pct.add((9 - round((r - 2) * 8 / 10), r))

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
        w["off"] = round(PCT_OFF0 + (w["r"] - 2) * 0.035 + rng.uniform(0, 0.02), 3)
PCT_LAST = max(w["off"] for w in windows if w["p"])

# ---- текст: буквы «включаются» как окна ----
LINES = ["ЧЁРНАЯ ПЯТНИЦА", "СКИДКИ НА КВАРТИРЫ", "В ЖК ЛУВР"]
STEPS = [(PCT_LAST + 0.5, 0.05), (None, 0.034), (None, 0.05)]
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
END = 15.0                                 # ролик ровно 15 секунд
FADE = END - 0.9

sched = {"cols": COLS, "rows": ROWS, "windows": windows, "lastOff": LAST, "pctOff": PCT_OFF0,
         "lines": LINES, "times": times, "offTimes": off_times,
         "lines2": LINES2, "times2": times2, "note": NOTE, "fade": FADE, "end": END}
open("assets/schedule.js", "w").write("window.SCHED = " + json.dumps(sched, ensure_ascii=False) + ";\n")

print(f"окон {len(windows)}, в «%» {len(pct)}, гаснут до {LAST:.2f} c, текст до {TEXT_END:.2f} c, конец {END}")
