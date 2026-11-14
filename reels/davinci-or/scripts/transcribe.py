# Расшифровка голоса с таймкодами по словам (faster-whisper, CPU).
# Запуск: python3 -I transcribe.py <папка модели> <audio16k.wav> <transcript.json>
# Аудио заранее: ffmpeg -i public/source.mp4 -ac 1 -ar 16000 audio16k.wav
import json
import sys
import wave

import numpy as np
from faster_whisper import WhisperModel

model_dir, audio_path, out = sys.argv[1:4]
model = WhisperModel(model_dir, device="cpu", compute_type="int8")
wf = wave.open(audio_path)
audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
segs, info = model.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False)
res = {"language": info.language, "segments": []}
for s in segs:
    res["segments"].append({"start": s.start, "end": s.end, "text": s.text,
        "words": [{"w": w.word, "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 2)} for w in s.words]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}")
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
print("lang", info.language)
