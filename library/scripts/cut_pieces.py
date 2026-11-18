# Нарезка по cuts.json без рассинхрона: границы кусков выравниваются по кадрам (30 к/с),
# картинка режется по кускам и склеивается, звук режется по тем же границам с точностью до сэмпла
# (с микрозатуханием 15 мс на стыках) и накладывается одной дорожкой. Длина звука = длине видео.
# Запуск: python3 -I scripts/cut_pieces.py <исходник> <выход.mp4> <папка для кусков> [cuts.json]
import json, os, subprocess, sys, wave
import numpy as np
src, out, tmp = sys.argv[1:4]
CUTS = sys.argv[4] if len(sys.argv) > 4 else 'cuts.json'
FPS, SR, FADE = 30, 48000, 0.015
os.makedirs(tmp, exist_ok=True)
keep = json.load(open(CUTS))['keep']
segs = []
for k in keep:
    f, t = round(k['from'] * FPS) / FPS, round(k['to'] * FPS) / FPS
    if t - f >= 1 / FPS:
        segs.append((f, t))
# звук исходника целиком
wav = os.path.join(tmp, 'src.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vn', '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', wav], check=True)
w = wave.open(wav); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64)
parts, names = [], []
nf = int(FADE * SR)
for i, (f, t) in enumerate(segs):
    s0, s1 = int(round(f * SR)), int(round(t * SR))
    x = a[s0:s1].copy()
    if len(x) > 2 * nf:
        x[:nf] *= np.linspace(0, 1, nf); x[-nf:] *= np.linspace(1, 0, nf)
    parts.append(x)
    p = os.path.join(tmp, f'v{i:03d}.mp4')
    frames = int(round((t - f) * FPS))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{f:.4f}', '-i', src, '-frames:v', str(frames), '-an',
                    '-r', str(FPS), '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p', p], check=True)
    names.append(p)
lst = os.path.join(tmp, 'list.txt')
open(lst, 'w').write(''.join(f"file '{n}'\n" for n in names))
vid = os.path.join(tmp, 'video.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', vid], check=True)
aud = os.path.join(tmp, 'audio.wav')
o = wave.open(aud, 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
o.writeframes(np.clip(np.concatenate(parts), -32768, 32767).astype(np.int16).tobytes()); o.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', vid, '-i', aud, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
t = 0; cuts = []
for f, tt in segs:
    t += tt - f; cuts.append(round(t, 3))
print('pieces', len(segs), 'total', round(t, 3), 'cuts at', [round(c, 2) for c in cuts[:-1]])
