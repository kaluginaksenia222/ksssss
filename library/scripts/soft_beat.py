# Синтез лёгкого ритмичного трека для before/after: аккорды, мягкая бочка, шейкер, 100 BPM.
# Запуск: python3 -I soft_beat.py <выход.wav> [секунды]
import sys, wave, numpy as np

out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 20
sr, bpm = 44100, 100
beat = 60 / bpm
t = np.arange(int(dur * sr)) / sr
mix = np.zeros_like(t)
rng = np.random.default_rng(7)
chords = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66]]

for i in range(int(dur / (4 * beat)) + 1):
    start = i * 4 * beat
    m = (t >= start) & (t < start + 4 * beat + 0.5)
    tt = t[m] - start
    env = np.minimum(1, tt / 0.15) * np.exp(-tt * 0.35)
    pad = sum(np.sin(2 * np.pi * f * t[m]) + 0.3 * np.sin(2 * np.pi * 2 * f * t[m]) for f in chords[i % 4]) / 4
    mix[m] += pad * env * 0.35
for k in range(int(dur / beat) + 1):
    on = k * beat
    m = (t >= on) & (t < on + 0.35)
    tt = t[m] - on
    mix[m] += 0.9 * np.sin(2 * np.pi * (48 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)  # бочка
    off = on + beat / 2
    m2 = (t >= off) & (t < off + 0.06)
    mix[m2] += 0.12 * rng.standard_normal(m2.sum()) * np.exp(-(t[m2] - off) * 70)  # шейкер

fade = np.clip(np.minimum(t / 0.4, (dur - t) / 1.2), 0, 1)
mix *= fade
mix /= np.max(np.abs(mix)) * 1.2
st = np.stack([mix, np.roll(mix, int(sr * 0.01))], axis=1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
