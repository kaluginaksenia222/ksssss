# Колыбельная «музыкальная шкатулка» для «Лунного автобуса»: мелодия + мягкий пэд.
# Запуск: python3 -I lullaby.py <выход.wav> [секунды]
import sys, wave, numpy as np

out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 33
sr = 44100
t = np.arange(int(dur * sr)) / sr
mix = np.zeros_like(t)
N = lambda m: 440.0 * 2 ** ((m - 69) / 12)  # midi -> Гц
beat = 0.5  # 120 bpm восьмые по 0.25, четверть 0.5

# мелодия (midi, длительность в четвертях), до мажор, 8 тактов, повторяется
mel = [(72,1),(76,1),(79,1),(76,1),(77,1),(81,1),(79,2),
       (76,1),(79,1),(84,1),(83,1),(81,1),(79,1),(77,2),
       (72,1),(76,1),(79,1),(81,1),(79,1),(77,1),(76,2),
       (74,1),(77,1),(76,1),(74,1),(72,4)]
chords = [[48,55,64],[53,57,65],[48,55,64],[55,59,62],[57,60,64],[53,57,65],[55,59,65],[48,55,64]]

def bell(f, tt):
    return (np.sin(2*np.pi*f*tt) + 0.35*np.sin(2*np.pi*2*f*tt) + 0.12*np.sin(2*np.pi*3.01*f*tt)) * np.exp(-tt*3.2) * (1-np.exp(-tt*300))

pos = 0.6
while pos < dur:
    for m, d in mel:
        on = pos
        mm = (t >= on) & (t < on + 2.0)
        mix[mm] += 0.32 * bell(N(m), t[mm] - on)
        pos += d * beat
        if pos >= dur: break
    pos += 0

bar = 4 * beat
for i in range(int(dur / bar) + 2):
    ch = chords[i % 8]
    s = i * bar + 0.6
    seg = (t >= s - 0.3) & (t < s + bar + 0.6)
    tt = t[seg] - (s - 0.3)
    env = np.sin(np.pi * np.clip(tt / (bar + 0.9), 0, 1)) ** 2
    pad = sum(np.sin(2*np.pi*N(m)*t[seg]) + np.sin(2*np.pi*N(m)*1.004*t[seg]) for m in ch) / 6
    mix[seg] += 0.22 * pad * env

fade = np.clip(np.minimum(t / 0.8, (dur - t) / 2.0), 0, 1)
mix *= fade
mix /= np.max(np.abs(mix)) * 1.4
st = np.stack([mix, np.roll(mix, int(sr*0.015))], axis=1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
