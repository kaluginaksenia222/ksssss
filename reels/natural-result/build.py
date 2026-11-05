# Собирает ролик по cuts.json: склейка лучших дублей, цветокоррекция и студийная обработка голоса.
# Запуск: python3 -I build.py <исходник> <выход.mp4>
import json, subprocess, sys
from pathlib import Path

src, out = sys.argv[1:3]
cfg = json.load(open(Path(__file__).with_name('cuts.json')))
keep, fade, xf = cfg['keep'], 0.02, 0.12  # xf — мягкое растворение видео между дублями
parts, labels = [], []
for i, k in enumerate(keep):
    d = k['to'] - k['from']
    parts.append(f"[0:v]trim={k['from']}:{k['to']},setpts=PTS-STARTPTS,{cfg['grade']},format=yuv420p[v{i}];"
                 f"[0:a]atrim={k['from']}:{k['to']},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:d={fade},afade=t=out:st={d - fade:.3f}:d={fade}[a{i}];")
# Видео: растворения между дублями; звук: такие же короткие перекрёстные затухания
graph = ''.join(parts)
prev, offset = 'v0', 0.0
for i in range(1, len(keep)):
    offset += keep[i - 1]['to'] - keep[i - 1]['from'] - xf
    graph += f"[{prev}][v{i}]xfade=transition=fade:duration={xf}:offset={offset:.3f}[x{i}];"
    prev = f'x{i}'
chain = 'a0'
for i in range(1, len(keep)):
    graph += f"[{chain}][a{i}]acrossfade=d={xf}:c1=tri:c2=tri[ac{i}];"
    chain = f'ac{i}'
graph += f"[{chain}]{cfg['audio']}[aout]"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', graph, '-map', f'[{prev}]', '-map', '[aout]',
                '-r', '25', '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
print('total', round(sum(k['to'] - k['from'] for k in keep) - xf * (len(keep) - 1), 2), 's')
