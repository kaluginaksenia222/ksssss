"""Звук ролика «Лифт едет вниз». Расписание — scripts/schedule.json (из dump_schedule.cjs).
Стиль как у «Дом гасит свет»: мягко и тихо, итог ≈ −26,5 LUFS (громкость подобрана замером готового видео). Запуск из папки проекта."""
import json, subprocess, os, wave
import numpy as np

S = json.load(open("scripts/schedule.json"))
T = S["T"]; SR = 48000; END = T["end"]
rng = np.random.default_rng(8)
out = np.zeros(int(SR * END), np.float32)
tt = np.arange(len(out)) / SR

def put(sig, t, g=1.0):
    s = int(t * SR); e = min(len(out), s + len(sig))
    if 0 <= s < len(out): out[s:e] += sig[: e - s] * g

def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y

def env(n, att, dec):
    t = np.arange(n) / SR
    return (np.minimum(1, t / att) * np.exp(-t / dec)).astype(np.float32)

def soft_key():
    """Мягкий стук клавиши (как утверждён в «Дом гасит свет»)."""
    n = int(0.10 * SR); t = np.arange(n) / SR
    x = 0.8 * np.sin(2*np.pi*rng.uniform(320, 420)*t) * np.exp(-t/0.012) \
      + 0.6 * np.sin(2*np.pi*rng.uniform(130, 170)*t) * np.exp(-t/0.02)
    nz = lowpass(rng.normal(0, 1, n).astype(np.float32), 0.06)
    x = x + 0.25 * nz / (np.abs(nz).max() + 1e-9) * np.exp(-t/0.006)
    x *= np.minimum(1, t / 0.0015)
    return (x / np.abs(x).max()).astype(np.float32)

def floor_tick():
    """Этаж проехали: тихий мягкий «тук» реле."""
    n = int(0.06 * SR); t = np.arange(n) / SR
    x = np.sin(2*np.pi*rng.uniform(900, 1000)*t) * np.exp(-t/0.008) + 0.5*np.sin(2*np.pi*220*t)*np.exp(-t/0.012)
    return (x * np.minimum(1, t/0.001)).astype(np.float32)

def chime():
    """Звонок лифта «динь»: два мягких тона."""
    n = int(1.6 * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f, g, d in ((1046.5, 1.0, 0.55), (2093, 0.25, 0.25), (1568, 0.35, 0.45)):
        x += g * np.sin(2*np.pi*f*t) * np.exp(-t/d)
    return (x * np.minimum(1, t/0.004)).astype(np.float32)

# 1. мотор: низкий гул, пока лифт едет, высота чуть растёт со скоростью
f0 = T["glitch"]
m = tt < f0 + 0.15
spd = np.clip(tt / f0, 0, 1)
ph = np.cumsum(2*np.pi*(70 + 25*spd) / SR)
motor = (np.sin(ph) + 0.4*np.sin(2*ph) + 0.15*np.sin(3*ph)) * 0.10
fade = np.clip((f0 + 0.15 - tt) / 0.2, 0, 1) * np.minimum(1, tt / 0.3)
air = lowpass(rng.normal(0, 1, len(out)).astype(np.float32), 0.02) * 1.2
out += ((motor + 0.05*air) * fade * m).astype(np.float32)

# 2. этажи
for fl in S["FLOORS"][1:]:
    put(floor_tick(), fl["t"], 0.22)

# 3. табло сбоит: треск
n = int((T["bf"] - T["glitch"]) * SR)
cr = np.zeros(n, np.float32)
for k in np.sort(rng.integers(0, n, 70)):
    L = int(rng.uniform(0.002, 0.006) * SR)
    cr[k:k+L] += rng.normal(0, 1, len(cr[k:k+L])).astype(np.float32) * rng.uniform(0.2, 0.6)
cr += 0.08 * np.sin(2*np.pi*120*np.arange(n)/SR).astype(np.float32)
put(cr, T["glitch"], 0.35)

# 4. «динь»
put(chime(), T["bf"], 0.32)

# 5. двери: мягкий шорох разъезда и тихий стук в конце
n = int((T["doorsEnd"] - T["doors"] + 0.2) * SR); t = np.arange(n) / SR
dur = T["doorsEnd"] - T["doors"]
sw = np.sin(np.clip(t / dur, 0, 1) * np.pi) ** 1.5
door = lowpass(rng.normal(0, 1, n).astype(np.float32), 0.05) * sw
door = door / (np.abs(door).max() + 1e-9)
put(door, T["doors"], 0.28)
thud = np.sin(2*np.pi*90*np.arange(int(0.15*SR))/SR) * env(int(0.15*SR), 0.002, 0.04)
put(thud, T["doorsEnd"] - 0.05, 0.25)

# 6. буквы: мягкие клавиши (страница 1 и 2)
for row in S["TIMES1"] + S["TIMES2"]:
    for t0 in row:
        put(soft_key(), t0, 0.36 + rng.uniform(-0.05, 0.05))

# 7. табло «−3%» загорается столбцами: тихая дробь
cols = len(S["PCT"]) * 5
for c in range(cols):
    put(floor_tick(), T["pct"] + c * 0.022, 0.09)

# затухание вместе с картинкой
fs_, fe_ = int(T["fade"] * SR), int((END - 0.1) * SR)
out[fs_:fe_] *= np.linspace(1, 0, fe_ - fs_); out[fe_:] = 0
out *= 0.8 / np.abs(out).max()
with wave.open("assets/sfx/raw.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "assets/sfx/raw.wav", "-af",
                "acompressor=threshold=-24dB:ratio=3:attack=2:release=60,loudnorm=I=-20.6:TP=-1.5:LRA=11,volume=0.39",
                "-ar", "48000", "assets/sfx/sfx.wav"], check=True)
os.remove("assets/sfx/raw.wav")
print("ok")
