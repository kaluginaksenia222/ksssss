# Синтез спокойной музыкальной подложки: аккорды-«пэд» Am–F–C–G и тихое арпеджио.
# Запуск: python3 -I calm_pad.py <выход.wav> [секунды]
import sys, wave, numpy as np

out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 34
sr = 44100
t = np.arange(int(dur * sr)) / sr
chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [130.81, 261.63, 329.63], [196.0, 246.94, 293.66]]
bars = 4.0
mix = np.zeros_like(t)

def tone(f, tt):
    # мягкий тон: основной + тихая октава, лёгкая расстройка двух голосов
    return (np.sin(2 * np.pi * f * tt) + np.sin(2 * np.pi * f * 1.003 * tt)
            + 0.25 * np.sin(2 * np.pi * 2 * f * tt)) / 2.5

n = int(np.ceil(dur / bars)) + 1
for i in range(n):
    chord = chords[i % 4]
    start = i * bars - 1.0
    seg = (t >= start) & (t < start + bars + 2.0)
    tt = t[seg] - start
    env = np.sin(np.pi * np.clip(tt / (bars + 2.0), 0, 1)) ** 2  # плавный вход и выход аккорда
    pad = sum(tone(f, t[seg]) for f in chord) / 3
    bass = 0.5 * np.sin(2 * np.pi * chord[0] / 2 * t[seg])
    mix[seg] += (pad + bass) * env * 0.5
    # арпеджио: ноты аккорда восьмыми, с быстрым затуханием
    for k in range(8):
        on = start + 1.0 + k * 0.5
        f = chord[k % 3] * 2
        m = (t >= on) & (t < on + 1.2)
        ta = t[m] - on
        mix[m] += 0.12 * np.sin(2 * np.pi * f * t[m]) * np.exp(-ta * 4) * (1 - np.exp(-ta * 200))

fade = np.clip(np.minimum(t / 1.5, (dur - t) / 2.0), 0, 1)
mix *= fade
mix /= np.max(np.abs(mix)) * 1.25
stereo = np.stack([mix, np.roll(mix, int(sr * 0.012))], axis=1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
