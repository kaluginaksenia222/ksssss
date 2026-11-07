"""Планировка квартиры для сторис: обрезка по рисунку, серый фон → белый.
python3 -I scripts/prep_plan.py <картинка> <id> [x0 y0 x1 y1 — область, если нужна]"""
import sys
import numpy as np
from PIL import Image

src, fid = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
if len(sys.argv) == 7:
    im = im.crop(tuple(int(v) for v in sys.argv[3:7]))
a = np.asarray(im, np.float32)
a = np.clip(a * 255 / 232, 0, 255)                       # фон в чистый белый
ink = (a.min(axis=2) < 200)
ys, xs = np.where(ink)
pad = 20
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, a.shape[1])
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, a.shape[0])
Image.fromarray(a[y0:y1, x0:x1].astype(np.uint8)).save(f"assets/plans/{fid}.png")
print(fid, x1 - x0, y1 - y0)
