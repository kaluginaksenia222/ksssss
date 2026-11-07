"""Звук ролика одной дорожкой: разрезы ткани, лоскуты, телефон, клавиши, затухание.
Тайминги совпадают с T и TIMES в index.html. Запуск из папки проекта."""
import wave
import numpy as np

SR = 48000
END = 10.6
rng = np.random.default_rng(5)
out = np.zeros(int(SR * END), np.float32)

def read(p):
    with wave.open(p) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        a = np.frombuffer(w.readframes(w.getnframes()), {2: np.int16, 4: np.int32}[sw]).astype(np.float32)
        a = a / float(2 ** (8 * sw - 1))
        a = a.reshape(-1, ch).mean(1)
    if sr != SR:
        a = np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a).astype(np.float32)
    return a

def put(sig, t, g=1.0):
    s = int(t * SR); e = min(len(out), s + len(sig))
    out[s:e] += sig[: e - s] * g

def onepole(x, a):  # простой фильтр нижних частот
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y

def rip(dur):
    """Треск рвущейся ткани: плотные щелчки + шершавый шум."""
    n = int(dur * SR)
    clicks = np.zeros(n, np.float32)
    k = 0
    while k < n:
        k += int(rng.integers(60, 420))
        if k < n:
            clicks[k] = rng.uniform(0.4, 1.0) * rng.choice([-1, 1])
    decay = np.exp(-np.arange(int(0.004 * SR)) / (0.0009 * SR)).astype(np.float32)
    crackle = np.convolve(clicks, decay)[:n]
    noise = rng.normal(0, 1, n).astype(np.float32)
    hiss = noise - onepole(noise, 0.08)          # убрать низ
    body = onepole(noise, 0.12)
    env = np.minimum(1, np.arange(n) / (0.03 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.06 * SR))
    flutter = 0.6 + 0.4 * np.abs(np.sin(np.arange(n) / SR * 2 * np.pi * 23))
    return (crackle * 0.9 + hiss * 0.18 + body * 0.25) * env * flutter

key = read("../../library/sfx/key.wav")
whoosh = read("../../library/sfx/whoosh.wav")
impact = read("../../library/sfx/impact.wav")

put(rip(0.62), 0.45, 0.9)    # разрез 1
put(rip(0.52), 1.12, 0.9)    # разрез 2
put(rip(0.35), 1.82, 0.55)   # лоскуты рвутся до конца
put(whoosh, 2.25, 0.55)      # телефон выезжает
put(impact, 3.4, 0.25)       # телефон встал
put(whoosh, 3.85, 0.3)       # наезд камеры

TIMES = [
    [4.95, 5.04, 5.12, 5.22, 5.3, 5.39, 5.52, 5.6, 5.69, 5.77, 5.86, 5.94],
    [6.35, 6.41, 6.47, 6.52, 6.58, 6.64, 6.7, 6.76, 6.82, 6.93, 6.99, 7.05, 7.11, 7.17, 7.23, 7.29, 7.35, 7.41, 7.47, 7.53],
    [7.95, 8.02, 8.09, 8.16, 8.23, 8.3, 8.37, 8.48, 8.55, 8.62, 8.73, 8.8, 8.87, 8.94, 9.01, 9.08, 9.15, 9.22],
]
for row in TIMES:
    for t in row:
        put(key, t, 0.55 + rng.uniform(-0.12, 0.12))

# затухание к концу вместе с картинкой
fs, fe = int(9.75 * SR), int(10.5 * SR)
out[fs:fe] *= np.linspace(1, 0, fe - fs)
out[fe:] = 0
out *= 0.8 / np.abs(out).max()
with wave.open("assets/sfx/sfx.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok")
