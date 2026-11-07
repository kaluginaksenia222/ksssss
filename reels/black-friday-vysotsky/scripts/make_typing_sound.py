"""Расписание печати и звук клавиш. Запуск: python3 scripts/make_typing_sound.py (из папки проекта)."""
import json, random, wave
import numpy as np

LINES = [("BLACK FRIDAY", 0.55, 0.095, 0.03), ("ВЫСОЦКИЙ ДЕВЕЛОПМЕНТ", None, 0.07, 0.02)]
GAP = 0.65      # пауза между строками
TAIL = 1.9      # сколько держим готовый кадр
rng = random.Random(7)

times, t = [], 0
for text, start, step, jit in LINES:
    t = start if start is not None else t + GAP
    row = []
    for ch in text:
        row.append(round(t, 3))
        t += step + rng.uniform(-jit, jit) + (0.06 if ch == " " else 0)
    times.append(row)
    t = row[-1]
total = round(t + TAIL, 2)

def read(p):
    with wave.open(p) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype={2: np.int16, 4: np.int32}[sw]).astype(np.float32)
        a /= float(2 ** (8 * sw - 1))
        return sr, a.reshape(-1, ch).mean(axis=1)

sr, key = read("../../library/sfx/key.wav")
out = np.zeros(int(sr * (total + 0.5)), np.float32)
for row in times:
    for i, tt in enumerate(row):
        g = 0.75 + rng.uniform(-0.15, 0.15)
        s = int(tt * sr)
        out[s:s + len(key)] += key * g
peak = np.abs(out).max()
out *= 0.7 / peak
with wave.open("assets/sfx/typing.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
json.dump({"times": times, "total": total}, open("scripts/schedule.json", "w"), ensure_ascii=False)
print(json.dumps({"times": times, "total": total}, ensure_ascii=False))
