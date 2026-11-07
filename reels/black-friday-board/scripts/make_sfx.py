"""Звук табло: мягкое щёлканье створок по каждой перекидке (scripts/schedule.json).
Стиль и громкость как у утверждённых роликов: мягко, ≈ −26,5 LUFS в готовом видео."""
import json, subprocess, os, wave
import numpy as np

S = json.load(open("scripts/schedule.json"))
T = S["T"]; SR = 48000; END = T["end"]
rng = np.random.default_rng(12)
out = np.zeros(int(SR * END), np.float32)

def put(sig, t, g):
    s = int(t * SR); e = min(len(out), s + len(sig))
    if 0 <= s < len(out): out[s:e] += sig[: e - s] * g

def flap():
    """Створка табло: короткий мягкий пластиковый щелчок, без металла."""
    n = int(0.03 * SR); t = np.arange(n) / SR
    x = np.sin(2*np.pi*rng.uniform(700, 1100)*t) * np.exp(-t/0.004) \
      + 0.6*np.sin(2*np.pi*rng.uniform(220, 300)*t) * np.exp(-t/0.007)
    x *= np.minimum(1, t / 0.0008)
    return (x / np.abs(x).max()).astype(np.float32)

flips = np.sort(np.array(S["FLIPS"]))
for t0 in flips:
    dens = np.sum(np.abs(flips - t0) < 0.03)          # чем гуще щелчки, тем тише каждый
    put(flap(), t0 + rng.uniform(0, 0.004), 0.5 / np.sqrt(dens))

fs_, fe_ = int(T["fade"] * SR), int((END - 0.1) * SR)
out[fs_:fe_] *= np.linspace(1, 0, fe_ - fs_); out[fe_:] = 0
out *= 0.8 / np.abs(out).max()
with wave.open("assets/sfx/raw.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
VOL = os.environ.get("VOL", "0.30")   # подобрано замером готового видео
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "assets/sfx/raw.wav", "-af",
                f"acompressor=threshold=-24dB:ratio=3:attack=2:release=60,loudnorm=I=-20.6:TP=-1.5:LRA=11,volume={VOL}",
                "-ar", "48000", "assets/sfx/sfx.wav"], check=True)
os.remove("assets/sfx/raw.wav")
print("ok", len(flips))
