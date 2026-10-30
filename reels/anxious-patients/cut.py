# Собирает нарезку по cuts.json: жёсткие склейки видео, на стыках звука — затухание 15 мс,
# у куска можно поднять громкость (gain_db).
# Запуск: python3 -I cut.py <исходник> <выход.mp4>
import json, subprocess, sys
from pathlib import Path

src, out = sys.argv[1:3]
keep = json.load(open(Path(__file__).with_name('cuts.json')))['keep']
fade = 0.015
parts, labels = [], []
for i, k in enumerate(keep):
    d = k['to'] - k['from']
    parts.append(f"[0:v]trim={k['from']}:{k['to']},setpts=PTS-STARTPTS[v{i}];"
                 f"[0:a]atrim={k['from']}:{k['to']},asetpts=PTS-STARTPTS,"
                 f"volume={k.get('gain_db', 0)}dB,"
                 f"afade=t=in:d={fade},afade=t=out:st={d - fade:.3f}:d={fade}[a{i}];")
    labels.append(f'[v{i}][a{i}]')
graph = ''.join(parts) + ''.join(labels) + f'concat=n={len(keep)}:v=1:a=1[v][a]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', graph, '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
print('total', round(sum(k['to'] - k['from'] for k in keep), 2), 's')
