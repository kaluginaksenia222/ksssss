# Собирает cuts.json: выбранные куски речи минус паузы и проверенные «э-э».
# Запуск: python3 -I scripts/build_cut.py <a16.wav> <det.json> <модель whisper>
import json, sys, wave
import numpy as np
from faster_whisper import WhisperModel
wav, detf, model = sys.argv[1:4]
RANGES = [  # (от, до, что сказано) — секунды исходника
    (6.82, 11.62, 'у нас третьи сутки после операции, сегодня у нас выписка'),
    (20.88, 23.92, 'наши рекомендации, сейчас я пойду по списочку'),
    (38.26, 45.12, 'исключение физической, эмоциональной нагрузки две недели… больше 5 килограмм'),
    (47.80, 49.48, 'на животе пока не спим'),
    (49.84, 52.45, 'стараемся только спать на спине'),
    (67.98, 74.56, 'не управляйте автотранспортом 7 дней… боковое зрение страдает'),
    (82.00, 87.42, 'исключение тепловых процедур… 3 месяца нельзя'),
    (91.40, 93.80, 'с 10 суток можно пользоваться косметикой'),
    (103.02, 103.64, 'за исключением'),
    (105.48, 107.20, 'крема, где содержится ретинол'),
    (243.98, 244.74, 'в целом всё хорошо'),
]
det = json.load(open(detf))
w = wave.open(wav); sr = 16000
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
m = WhisperModel(model, device='cpu', compute_type='int8')
def tr(x):
    return ' '.join(s.text.strip() for s in m.transcribe(x, language='ru', beam_size=5)[0]).lower().replace(',', '').replace('.', '').replace('?', '')
def sub(segs, f, t):
    out = []
    for x, y in segs:
        if t <= x or f >= y: out.append((x, y)); continue
        if f - x > 0.05: out.append((x, f))
        if y - t > 0.05: out.append((t, y))
    return out
keep = []
for f, t, text in RANGES:
    segs = [(f, t)]
    for sf, st in det['silence']:
        if st - sf >= 0.18 and sf > f and st < t:
            segs = sub(segs, sf + 0.05, st - 0.05)
    for ff, ft in det['filler']:
        if ff > f + 0.1 and ft < t - 0.1:
            lo, hi = int(max(f, ff - 1.5) * sr), int(min(t, ft + 1.5) * sr)
            a0 = tr(a[lo:hi]); a1 = tr(np.concatenate([a[lo:int((ff + 0.04) * sr)], a[int((ft - 0.04) * sr):hi]]))
            ok = a0 == a1
            print(f'  заминка? {ff:.2f}-{ft:.2f} {"режем" if ok else "оставляем"} | {a0} | {a1}')
            if ok: segs = sub(segs, ff + 0.04, ft - 0.04)
    keep += segs
json.dump({'source': 'IMG_6650.mov (GitHub, video-6, 13.11) — выписка на 3-и сутки после операции, врач проходит по рекомендациям',
           'note': 'Взяты только общие рекомендации (нагрузки, сон, руль, тепло, косметика) и хук; личные назначения лекарств не берём. Паузы и «э-э» вырезаны (проверено распознаванием).',
           'keep': [{'from': round(x, 2), 'to': round(y, 2)} for x, y in keep]}, open('cuts.json', 'w'), ensure_ascii=False, indent=1)
print(len(keep), 'pieces', round(sum(y - x for x, y in keep), 2), 's')
