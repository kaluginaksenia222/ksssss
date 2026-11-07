"""Звук «Три дома гасят свет»: выключатели, гул света, удар, мягкие клавиши.
Как в утверждённом «Дом гасит свет»; громкость ≈ −26,5 LUFS в готовом видео."""
import json, subprocess, os, wave
import numpy as np

S = json.load(open("scripts/schedule.json"))
T = S["T"]; SR = 48000; END = T["end"]
rng = np.random.default_rng(31)
out = np.zeros(int(SR * END), np.float32)
tt = np.arange(len(out)) / SR

def put(sig, t, g):
    s = int(t * SR); e = min(len(out), s + len(sig))
    if 0 <= s < len(out): out[s:e] += sig[: e - s] * g

def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y

def click():
    """Выключатель: два коротких мягких щелчка."""
    n = int(0.03 * SR); x = np.zeros(n, np.float32)
    for off, g in ((0, 1.0), (int(rng.uniform(0.006, 0.011) * SR), 0.5)):
        m = int(0.004 * SR)
        b = rng.normal(0, 1, m).astype(np.float32) * np.exp(-np.arange(m) / (0.0007 * SR))
        x[off:off+m] += np.diff(b, prepend=0) * 0.5 * g
        f = rng.uniform(1500, 2200)
        x[off:off+m] += (np.sin(2*np.pi*f*np.arange(m)/SR) * np.exp(-np.arange(m)/(0.001*SR))).astype(np.float32) * 0.25 * g
    return x

def soft_key():
    n = int(0.10 * SR); t = np.arange(n) / SR
    x = 0.8*np.sin(2*np.pi*rng.uniform(320, 420)*t)*np.exp(-t/0.012) + 0.6*np.sin(2*np.pi*rng.uniform(130, 170)*t)*np.exp(-t/0.02)
    nz = lowpass(rng.normal(0, 1, n).astype(np.float32), 0.06)
    x = x + 0.25*nz/(np.abs(nz).max()+1e-9)*np.exp(-t/0.006)
    x *= np.minimum(1, t/0.0015)
    return (x/np.abs(x).max()).astype(np.float32)

def read(p):
    with wave.open(p) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        a = np.frombuffer(w.readframes(w.getnframes()), {2: np.int16, 4: np.int32}[sw]).astype(np.float32)
        a = a / float(2 ** (8*sw - 1)); a = a.reshape(-1, ch).mean(1)
    if sr != SR: a = np.interp(np.arange(0, len(a), sr/SR), np.arange(len(a)), a).astype(np.float32)
    return a

for times in (S["OFF"], S["ON"]):
    ts = np.sort(np.array(times))
    for t0 in ts:
        dens = np.sum(np.abs(ts - t0) < 0.05)
        put(click(), t0, 0.5 / np.sqrt(dens))

# гул света: громкость = доля горящих окон
off = np.array(S["OFF"]); on = np.array(sorted(S["ON"]))
lit = np.zeros_like(tt)
for o in off: lit += (tt < o)
for o in on: lit += (tt >= o)
lit /= len(off)
hum = (np.sin(2*np.pi*100*tt)*0.5 + np.sin(2*np.pi*200*tt)*0.25 + np.sin(2*np.pi*300*tt)*0.12) * 0.05 * lit * np.minimum(1, tt/0.15)
out += hum.astype(np.float32)

put(read("../../library/sfx/impact.wav"), max(S["OFF"]), 0.35)   # все три дома погасли
for t0 in S["KEYS"]:
    put(soft_key(), t0, 0.36 + rng.uniform(-0.05, 0.05))

fs_, fe_ = int(T["fade"]*SR), int((END-0.1)*SR)
out[fs_:fe_] *= np.linspace(1, 0, fe_-fs_); out[fe_:] = 0
out *= 0.8/np.abs(out).max()
with wave.open("assets/sfx/raw.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out*32767).astype(np.int16).tobytes())
VOL = os.environ.get("VOL", "0.42")   # подобрано замером готового видео
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "assets/sfx/raw.wav", "-af",
                f"acompressor=threshold=-24dB:ratio=3:attack=2:release=60,loudnorm=I=-20.6:TP=-1.5:LRA=11,volume={VOL}",
                "-ar", "48000", "assets/sfx/sfx.wav"], check=True)
os.remove("assets/sfx/raw.wav")
print("ok")
