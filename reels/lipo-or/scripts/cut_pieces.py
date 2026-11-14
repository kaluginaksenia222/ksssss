# Нарезка по cuts.json по одному куску (мало памяти на длинных исходниках), затем склейка.
# Запуск: python3 -I scripts/cut_pieces.py <исходник> <выход.mp4> <папка для кусков>
import json, subprocess, sys, os
src, out, tmp = sys.argv[1:4]
CUTS = sys.argv[4] if len(sys.argv) > 4 else 'cuts.json'
os.makedirs(tmp, exist_ok=True)
keep = json.load(open(CUTS))['keep']
FADE = 0.015
names = []
for i, k in enumerate(keep):
    f, t = k['from'], k['to']; d = t - f
    p = os.path.join(tmp, f'p{i:03d}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{f:.3f}', '-i', src, '-t', f'{d:.3f}',
                    '-af', f'afade=t=in:d={FADE},afade=t=out:st={d - FADE:.3f}:d={FADE}',
                    '-r', '30', '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', p], check=True)
    names.append(p)
lst = os.path.join(tmp, 'list.txt')
open(lst, 'w').write(''.join(f"file '{n}'\n" for n in names))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', out], check=True)
t = 0; cuts = []
for k in keep:
    t += k['to'] - k['from']; cuts.append(round(t, 2))
print('pieces', len(keep), 'total', round(t, 2), 'cuts at', cuts[:-1])
