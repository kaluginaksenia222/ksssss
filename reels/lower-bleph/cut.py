# Собирает нарезку по cuts.json и сокращает паузы внутри кусков.
# Запуск: python3 -I cut.py <исходник> <выход.mp4> [--plan]
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

src, out = sys.argv[1:3]
keep = json.load(open(Path(__file__).with_name('cuts.json')))['keep']
PAUSE_DB, PAUSE_MIN, PAUSE_KEEP, FADE = -40.0, 0.3, 0.12, 0.015

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = 160  # 10 мс
db = 20 * np.log10(np.sqrt(np.convolve(a ** 2, np.ones(480) / 480, 'same')[::hop]) + 1e-9)

def split(f, t):
    # делит кусок по тихим местам длиннее PAUSE_MIN, оставляя PAUSE_KEEP паузы
    pieces, cur, i, n = [], f, int(f * 100), int(t * 100)
    while i < n:
        if db[i] < PAUSE_DB:
            j = i
            while j < n and db[j] < PAUSE_DB:
                j += 1
            if (j - i) / 100 >= PAUSE_MIN and i > int(f * 100) and j < n:
                mid_a, mid_b = i / 100 + PAUSE_KEEP / 2, j / 100 - PAUSE_KEEP / 2
                pieces.append((cur, mid_a)); cur = mid_b
            i = j
        else:
            i += 1
    pieces.append((cur, t))
    return pieces

segs = [p for k in keep for p in split(k['from'], k['to'])]
if '--plan' in sys.argv:
    for s in segs: print(f'{s[0]:.2f}-{s[1]:.2f}')
parts, labels = [], []
for i, (f, t) in enumerate(segs):
    d = t - f
    parts.append(f"[0:v]trim={f}:{t},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={f}:{t},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:d={FADE},afade=t=out:st={d - FADE:.3f}:d={FADE}[a{i}];")
    labels.append(f'[v{i}][a{i}]')
graph = ''.join(parts) + ''.join(labels) + f'concat=n={len(segs)}:v=1:a=1[v][a]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', graph, '-map', '[v]', '-map', '[a]',
                '-r', '30', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                '-movflags', '+faststart', out], check=True)
print('pieces', len(segs), 'total', round(sum(t - f for f, t in segs), 2), 's')
