# Озвучивает реплики из voice.json синтезатором RHVoice и печатает длительность каждой.
# Запуск: python3 -I scripts/voice.py
import json, subprocess, wave
from pathlib import Path

root = Path(__file__).resolve().parent.parent
cfg = json.load(open(root / 'voice.json'))
for line in cfg['lines']:
    raw = root / 'public' / 'voice' / f"{line['id']}_raw.wav"
    out = root / 'public' / 'voice' / f"{line['id']}.wav"
    subprocess.run(['RHVoice-test', '-p', cfg['voice'], '-r', '95', '-o', str(raw)], input=line['text'].encode(), check=True)
    # голос: убрать низ, лёгкое тепло и компрессия, громкость под −16 LUFS, тишина по краям обрезана
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-af',
                    'highpass=f=80,equalizer=f=200:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.4:g=1.5,'
                    'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=7,'
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',
                    '-ar', '48000', '-ac', '1', str(out)], check=True)
    raw.unlink()
    with wave.open(str(out)) as w:
        print(f"{line['id']:7s} {w.getnframes() / w.getframerate():5.2f} s  {line['text']}")
