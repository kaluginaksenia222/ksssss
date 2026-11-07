# Общие инструменты и звуки для музыки мультиков Oki Doki (всё синтезируется, без чужих записей).
# Подключение в серии: sys.path.insert(0, <kids-channel/lib>); from synth import *
import wave
import numpy as np

SR = 44100
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



def water(d):  # струя воды
    t = tt(d)
    n = rng.uniform(-1, 1, len(t))
    lo = np.convolve(n, np.ones(8) / 8, mode='same')
    am = 0.7 + 0.3 * np.convolve(rng.uniform(0, 1, len(t)), np.ones(800) / 800, mode='same')
    env = np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.15)
    return lo * am * env


def rub():  # ладошки трутся в мыле
    t = tt(0.2)
    n = rng.uniform(-1, 1, len(t))
    lo = np.convolve(n, np.ones(20) / 20, mode='same')
    sq = np.sin(2 * np.pi * np.cumsum(1400 + 400 * np.sin(2 * np.pi * 9 * t)) / SR) * 0.08
    return (lo * 2 + sq) * np.sin(np.pi * t / 0.2) ** 2


def crunch():  # хрум печенья
    t = tt(0.14)
    n = rng.uniform(-1, 1, len(t)) * (rng.uniform(0, 1, len(t)) > 0.7)
    return n * np.exp(-t * 25)


def brrr(d=0.5):  # стряхивает капли
    t = tt(d)
    fr = 260 * (1 + 0.25 * np.sin(2 * np.pi * 22 * t))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / d)


def write_wav(path, mix):
    mix = np.tanh(mix * 1.1)
    mix = mix / np.max(np.abs(mix)) * 0.89  # пик около -1 дБ
    st = np.stack([mix, mix], axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
