# Музыка и звуки серии 1 «Чистим зубы». Всё синтезируется кодом, без чужих записей.
# Запуск: python3 -I music.py <выход.wav> [секунды]
# Темп 120 ударов в минуту: доля = 0.5 с, такт = 2 с.
import sys, wave
import numpy as np

out = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 11.0
SR = 44100
N = int(DUR * SR)
mus = np.zeros(N)
sfx = np.zeros(N)
rng = np.random.default_rng(7)


def hz(name):
    notes = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((notes[n] + (o - 4) * 12) / 12)


def put(buf, at, sig, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def tt(d):
    return np.arange(int(d * SR)) / SR


# ---------- инструменты ----------
def musicbox(f, d=1.2):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 9) + 0.15 * np.sin(2 * np.pi * f * 2 * t)
    return s * np.exp(-t * 3.2) * np.minimum(1, t * 400)


def marimba(f, d=0.5):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)
    return s * np.exp(-t * 9) * np.minimum(1, t * 500)


def pluck(f, d=0.6, bright=0.5):
    # Карплус — Стронг: звук щипковой струны (как укулеле)
    n = int(d * SR)
    p = int(SR / f)
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    damp = 0.996 - (1 - bright) * 0.004
    for i in range(n):
        j = i % p
        out[i] = buf[j]
        buf[j] = 0.5 * (buf[j] + buf[(j + 1) % p]) * damp
    return out * np.minimum(1, np.arange(n) / 40)


def pizz(f, d=0.22):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) + 0.2 * np.sin(2 * np.pi * 3 * f * t)
    return s * np.exp(-t * 22) * np.minimum(1, t * 600)


def bass(f, d=0.45):
    t = tt(d)
    s = np.tanh(1.5 * np.sin(2 * np.pi * f * t))
    return s * np.exp(-t * 5) * np.minimum(1, t * 300)


def pad(freqs, d):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.004 * t) for f in freqs) / len(freqs)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
    return s * env


def kick():
    t = tt(0.3)
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)


def clap():
    t = tt(0.18)
    n = rng.uniform(-1, 1, len(t))
    n = n - np.concatenate([[0], n[:-1]])  # верхние частоты
    return n * np.exp(-t * 28) * 0.6


def shaker():
    t = tt(0.08)
    n = rng.uniform(-1, 1, len(t))
    n = n - np.concatenate([[0], n[:-1]])
    return n * np.exp(-t * 60) * 0.25


def snare_roll(d):
    t = tt(d)
    n = rng.uniform(-1, 1, len(t))
    hits = (np.sin(2 * np.pi * 16 * t) > 0.6).astype(float)
    return n * hits * np.linspace(0.1, 0.7, len(t))


# ---------- звуки ----------
def boop(f=300):  # мягкий прыжок
    t = tt(0.18)
    fr = f * (1 + 0.6 * np.exp(-t * 25))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 18)


def slide(f0, f1, d):  # свисток вниз/вверх (зевок, полёт)
    t = tt(d)
    fr = f0 * (f1 / f0) ** (t / d)
    vib = 1 + 0.02 * np.sin(2 * np.pi * 6 * t)
    env = np.sin(np.pi * t / d) ** 0.7
    return np.sin(2 * np.pi * np.cumsum(fr * vib) / SR) * env


def boing(f=220):
    t = tt(0.45)
    fr = f * (1 + 1.4 * t / 0.45) * (1 + 0.15 * np.sin(2 * np.pi * 18 * t))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 6)


def doink():  # удивление
    t = tt(0.35)
    fr = 520 * np.exp(-t * 3)
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(fr) / SR)) * np.exp(-t * 8)


def ding():
    return musicbox(hz('E6'), 1.5) + 0.7 * musicbox(hz('B6'), 1.5)


def whoosh(d=0.6):
    t = tt(d)
    n = rng.uniform(-1, 1, len(t))
    k = np.ones(25) / 25
    lo = np.convolve(n, k, mode='same')
    mix = lo + (n - lo) * (t / d)
    return mix * np.sin(np.pi * t / d) ** 2 * 0.8


def pop():
    t = tt(0.12)
    fr = 900 * np.exp(-t * 25) + 200
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 35)


def squish():
    t = tt(0.3)
    n = rng.uniform(-1, 1, len(t))
    lo = np.convolve(n, np.ones(60) / 60, mode='same')
    fr = 180 * np.exp(-t * 4)
    return (lo * 3 + 0.5 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * np.exp(-t * 9)


def tada():
    s = np.zeros(int(1.6 * SR))
    for k, n in enumerate(['C5', 'E5', 'G5', 'C6']):
        sig = musicbox(hz(n), 1.6 - k * 0.05)
        s[int(k * 0.05 * SR): int(k * 0.05 * SR) + len(sig)] += sig
    return s * 0.6


def scrub():  # щётка шуршит
    t = tt(0.16)
    n = rng.uniform(-1, 1, len(t))
    n = n - np.convolve(n, np.ones(6) / 6, mode='same')
    return n * np.sin(np.pi * t / 0.16) ** 2


def chime():  # цветок распускается: быстрое восходящее арпеджио колокольчиков
    s = np.zeros(int(2.0 * SR))
    for k, n in enumerate(['C5', 'E5', 'G5', 'C6', 'E6', 'G6']):
        sig = musicbox(hz(n), 1.4)
        i = int(k * 0.06 * SR)
        s[i:i + len(sig)] += sig
    return s * 0.5


# ---------- партитура ----------
B = 0.5  # доля

# 0–3.5: сонное утро — музыкальная шкатулка и мягкий пэд
melody1 = [('E5', 0), ('G5', 1), ('C6', 2), ('B5', 3), ('A5', 4), ('G5', 5), ('E5', 5.5)]
for n, b in melody1:
    put(mus, 0.1 + b * B, musicbox(hz(n)), 0.22)
put(mus, 0.0, pad([hz('C4'), hz('E4'), hz('G4')], 2.0), 0.10)
put(mus, 2.0, pad([hz('A3'), hz('C4'), hz('F4')], 1.6), 0.10)

# 3.5–7.0: хитрые микробы — пиццикато крадущимся шагом + маримба
sneak = ['A2', 'C3', 'E3', 'D#3', 'E3', 'C3', 'A2', 'B2']
for i in range(14):
    put(mus, 3.5 + i * 0.25, pizz(hz(sneak[i % 8]) * 2), 0.32 if i % 2 == 0 else 0.22)
for b, n in [(0, 'E5'), (1.5, 'D#5'), (2, 'E5'), (3.5, 'B4'), (4, 'C5'), (5.5, 'A4')]:
    put(mus, 3.5 + b * B, marimba(hz(n)), 0.18)

# 7.0–10.0: придумал! — восходящее арпеджио укулеле и дробь
arp = ['C4', 'E4', 'G4', 'C5', 'E4', 'G4', 'C5', 'E5', 'F4', 'A4', 'C5', 'F5']
for i, n in enumerate(arp):
    put(mus, 7.0 + i * 0.25, pluck(hz(n), 0.6), 0.32)
put(mus, 7.0, pad([hz('C4'), hz('E4'), hz('G4')], 1.5), 0.08)
put(mus, 8.5, pad([hz('F3'), hz('A3'), hz('C4')], 1.0), 0.08)
put(mus, 9.0, snare_roll(1.0), 0.25)
for i in range(4):
    put(mus, 9.0 + i * 0.25, pluck(hz(['G3', 'B3', 'D4', 'G4'][i]), 0.4), 0.3)

# 10–18 и 19–24: основная тема — бодрые аккорды укулеле, бочка, хлопки, маримба.
# 18–19: пауза в ударных (Оки смотрит на чистые зубы), 19: цветок распустился — тема снова.
chords = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']]
roots = ['C3', 'G2', 'A2', 'F2']
theme = [('E5', 0), ('G5', 0.5), ('G5', 1), ('A5', 1.5), ('G5', 2), ('E5', 3), ('D5', 4), ('B4', 4.5), ('D5', 5), ('G5', 6),
         ('C5', 8), ('E5', 8.5), ('A5', 9), ('G5', 10), ('E5', 11), ('F5', 12), ('E5', 13), ('D5', 14), ('C5', 15)]
END = 24.0
tb = 10.0
while tb < END - 0.01:
    if 18.0 <= tb < 19.0:
        tb += B
        continue
    rel = tb - (10.0 if tb < 18.0 else 19.0)
    ci = int(rel // 2) % 4
    beat = int(round(rel / B)) % 4
    for k, n in enumerate(chords[ci]):
        put(mus, tb + k * 0.012, pluck(hz(n), 0.4, 0.3), 0.16 if beat % 2 == 0 else 0.11)
    if beat % 2 == 0:
        put(mus, tb, kick(), 0.5)
    else:
        put(mus, tb, clap(), 0.35)
    put(mus, tb, shaker(), 0.6)
    put(mus, tb + 0.25, shaker(), 1.0)
    if beat == 0:
        put(mus, tb, bass(hz(roots[ci])), 0.35)
    if beat == 2:
        put(mus, tb, bass(hz(roots[ci])), 0.3)
    if beat == 3:
        put(mus, tb, bass(hz(roots[ci]) * 1.5), 0.25)
    tb += B
for n, b in theme:
    put(mus, 10.0 + b * B, marimba(hz(n), 0.45), 0.3)
for n, b in theme:
    if b < 10:
        put(mus, 19.0 + b * B, marimba(hz(n), 0.45), 0.3)
# 18–19: мягкий пэд и колокольчики на паузе
put(mus, 17.8, pad([hz('F3'), hz('A3'), hz('C4')], 1.3), 0.16)
# финальный аккорд
for k, n in enumerate(['C4', 'E4', 'G4', 'C5']):
    put(mus, END + k * 0.03, pluck(hz(n), 1.0, 0.8), 0.3)
put(mus, END, musicbox(hz('C6'), 1.0), 0.25)
put(mus, END, kick(), 0.5)
put(mus, END, bass(hz('C3'), 1.0), 0.35)

# ---------- звуки к картинке ----------
for at in (0.5, 1.0, 1.5):
    put(sfx, at - 0.02, boop(260), 0.35)
put(sfx, 2.05, slide(700, 330, 1.0), 0.12)          # зевок
for k, at in enumerate((3.7, 4.0, 4.3)):           # микробы выпрыгивают
    put(sfx, at, boing(200 + k * 40), 0.3)
put(sfx, 4.5, doink(), 0.4)                          # испуг
put(sfx, 7.0, ding(), 0.25)                          # идея
put(sfx, 7.6, whoosh(0.7), 0.35)                     # щётка летит
put(sfx, 7.6, slide(400, 900, 0.7), 0.06)
put(sfx, 8.3, pop(), 0.45)                           # поймал
put(sfx, 8.75, squish(), 0.55)                       # тюбик
put(sfx, 8.85, slide(500, 1000, 0.5), 0.07)          # паста летит
put(sfx, 9.4, squish(), 0.4)                         # плюх на щётку
put(sfx, 9.95, tada(), 0.22)                         # та-да
k = 0
while 11.0 + k * 0.25 < 17.0:                      # щётка шуршит в такт
    put(sfx, 11.0 + k * 0.25, scrub(), 0.10)
    k += 1
for tp in (12.0, 13.5, 15.0):                       # пена летит, микроб лопается
    put(sfx, tp - 0.45, boop(500), 0.25)
    put(sfx, tp, pop(), 0.55)
    put(sfx, tp + 0.03, slide(900, 1500, 0.18), 0.12)
put(sfx, 17.0, whoosh(0.5), 0.3)                     # щётка обратно в стакан
put(sfx, 17.5, marimba(hz('E6'), 0.3), 0.25)
put(sfx, 18.2, musicbox(hz('E7'), 0.8) + musicbox(hz('B7'), 0.8), 0.18)   # зубы сверкают
put(sfx, 18.9, pop(), 0.5)                           # цветок
put(sfx, 18.9, chime(), 0.35)
for k in range(6):                                   # прыжки в танце
    put(sfx, 19.5 + k * 0.5 + 0.48, boop(300), 0.18)
put(sfx, 21.9, pop(), 0.4)                           # значок
put(sfx, 21.95, ding(), 0.18)
put(sfx, 22.6, slide(500, 800, 0.35), 0.08)          # пока-пока

mus[int(10.0 * SR):] *= 0.5  # основная тема не должна быть резко громче вступления
mix = mus * 0.85 + sfx
# плавное затухание в конце отрывка
fade = int(0.4 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
mix = np.tanh(mix * 1.1)
mix = mix / np.max(np.abs(mix)) * 0.89  # пик около -1 дБ
st = np.stack([mix, mix], axis=1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', out, DUR, 's')
