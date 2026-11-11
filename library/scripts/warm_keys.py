# Синтез приятного фонового трека: тёплые клавиши (электропиано), мягкая бочка,
# щёточки, простая мелодия-арпеджио и реверб. 78 BPM, аккорды Fmaj7–Em7–Dm7–Cmaj7.
# Запуск: python3 -I warm_keys.py <выход.wav> [секунды]
import sys, wave
import numpy as np

out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 90
sr, bpm = 44100, 78
beat = 60 / bpm
n = int(dur * sr)
t = np.arange(n) / sr
L = np.zeros(n)
R = np.zeros(n)
rng = np.random.default_rng(11)

def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def ep(freq, length, vel=1.0):
    # электропиано: FM с быстро гаснущим индексом модуляции
    tt = np.arange(int(length * sr)) / sr
    idx = 1.6 * np.exp(-tt * 6)
    sig = np.sin(2 * np.pi * freq * tt + idx * np.sin(2 * np.pi * freq * tt))
    sig += 0.25 * np.sin(2 * np.pi * 2 * freq * tt) * np.exp(-tt * 3)
    env = np.minimum(1, tt / 0.006) * np.exp(-tt * 1.4)
    return sig * env * vel

def put(sig, at, pan=0.0, gain=1.0):
    i = int(at * sr)
    if i >= n:
        return
    s = sig[: n - i] * gain
    L[i:i + len(s)] += s * (1 - pan) / 2
    R[i:i + len(s)] += s * (1 + pan) / 2

# Fmaj7, Em7, Dm7, Cmaj7 (MIDI), бас на октаву ниже корня
chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
bar = 4 * beat
bars = int(dur / bar) + 1
for b in range(bars):
    c = chords[b % 4]
    s = b * bar
    # аккорд на раз и чуть «растянутый» удар на 3-ю долю
    for k, m in enumerate(c):
        put(ep(hz(m + 12), bar + 0.8, 0.22), s + k * 0.012, pan=-0.3 + 0.2 * k)
        put(ep(hz(m + 12), 2 * beat, 0.12), s + 2 * beat + 0.02 + k * 0.01, pan=0.3 - 0.2 * k)
    # бас
    put(ep(hz(c[0] - 12), bar, 0.38), s)
    # мелодия-арпеджио по восьмым во второй половине куплета (каждые 2 такта из 4)
    if b % 4 in (1, 3) and b > 1:
        pattern = [c[3] + 12, c[2] + 12, c[1] + 24, c[2] + 12, c[3] + 12, c[1] + 24, c[0] + 24, c[2] + 12]
        for k, m in enumerate(pattern):
            put(ep(hz(m), 0.9, 0.10), s + k * beat / 2, pan=0.4 * np.sin(k))

# ударные начинаются со 2-го такта, мягко
for k in range(int(dur / beat) + 1):
    on = k * beat
    if on < bar:
        continue
    if k % 4 in (0, 2):
        tt = np.arange(int(0.4 * sr)) / sr
        kick = np.sin(2 * np.pi * (45 + 70 * np.exp(-tt * 28)) * tt) * np.exp(-tt * 8)
        put(kick, on, gain=0.55)
    if k % 4 in (1, 3):
        tt = np.arange(int(0.25 * sr)) / sr
        snare = rng.standard_normal(len(tt)) * np.exp(-tt * 18)
        snare = np.convolve(snare, np.ones(6) / 6, 'same')  # «щётка», без резкости
        put(snare, on, gain=0.09)
    for h in (0, 0.5):
        tt = np.arange(int(0.05 * sr)) / sr
        hat = np.diff(rng.standard_normal(len(tt) + 1)) * np.exp(-tt * 90)
        put(hat, on + h * beat + (0.015 if h else 0), pan=0.35, gain=0.035)

# реверб: свёртка с затухающим шумом (2,2 с)
irn = int(2.2 * sr)
ir_t = np.arange(irn) / sr
def ir(seed):
    r = np.random.default_rng(seed).standard_normal(irn) * np.exp(-ir_t * 3.2)
    return np.convolve(r, np.ones(20) / 20, 'same')
def conv(x, h):
    m = len(x) + len(h) - 1
    f = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, f) * np.fft.rfft(h, f), f)[: len(x)]
wetL, wetR = conv(L, ir(1)), conv(R, ir(2))
wetL *= np.std(L) / (np.std(wetL) + 1e-9) * 0.35
wetR *= np.std(R) / (np.std(wetR) + 1e-9) * 0.35
L, R = L + wetL, R + wetR

# мягкий «ленточный» срез верхов
k = np.ones(5) / 5
L, R = np.convolve(L, k, 'same'), np.convolve(R, k, 'same')
fade = np.clip(np.minimum(t / 1.0, (dur - t) / 2.0), 0, 1)
L, R = L * fade, R * fade
peak = max(np.abs(L).max(), np.abs(R).max())
st = np.stack([L, R], axis=1) / peak * 0.85
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', out, dur, 's')
