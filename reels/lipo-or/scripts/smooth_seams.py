# Сглаживает стыки чужой нарезки по звуку: на стыках редактор оставил провалы в полную тишину (~18 мс)
# и щелчки. Провал заполняем звуком соседних кусков с плавным перетеканием (равная мощность), время не меняется.
# Запуск: python3 -I scripts/smooth_seams.py <вход.wav 48k моно> <выход.wav>
import sys, wave
import numpy as np
src, out = sys.argv[1:3]
w = wave.open(src); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64)
z = np.abs(x) < 3
gaps, i, n = [], 0, len(x)
while i < n:
    if z[i]:
        j = i
        while j < n and z[j]: j += 1
        if (j - i) / sr >= 0.008 and i > 0 and j < n:
            gaps.append((i, j))
        i = j
    else:
        i += 1
y = x.copy()
X = int(0.03 * sr)  # длина перетекания
for g0, g1 in gaps:
    gl = g1 - g0
    # хвост до стыка продлеваем «зеркалом», начало после стыка — тоже; в зоне стыка смешиваем
    pre = x[max(0, g0 - X - gl):g0]
    post = x[g1:g1 + X + gl]
    if len(pre) < X + gl or len(post) < X + gl:
        continue
    a = np.concatenate([pre, pre[::-1][:gl + X]])          # звук до стыка, продлённый через стык
    b = np.concatenate([post[::-1][:gl + X][::-1], post])  # звук после стыка, продлённый назад
    L = min(len(a), len(b))
    t = np.linspace(0, 1, L)
    mix = a[:L] * np.cos(t * np.pi / 2) + b[-L:] * np.sin(t * np.pi / 2)
    s = g0 - X - gl
    y[s:s + L] = mix
print('стыков сглажено:', len(gaps), [round(g0 / sr, 2) for g0, _ in gaps])
o = wave.open(out, 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes(np.clip(y, -32768, 32767).astype(np.int16).tobytes())
