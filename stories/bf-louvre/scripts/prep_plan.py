"""Планировка квартиры для сторис: убирает подписи улиц/набережной снаружи квартиры,
обрезает по рисунку, серый фон → белый.
python3 -I scripts/prep_plan.py <картинка> <id> [x0 y0 x1 y1 — область, если нужна]"""
import sys
from collections import deque
import numpy as np
from PIL import Image

src, fid = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
if len(sys.argv) == 7:
    im = im.crop(tuple(int(v) for v in sys.argv[3:7]))
a = np.clip(np.asarray(im, np.float32) * 255 / 232, 0, 255)

# --- 1. связные куски «чернил» на уменьшенной копии ---
S = 4
ink = a.min(axis=2) < 215
h, w = ink.shape[0] // S, ink.shape[1] // S
small = ink[: h * S, : w * S].reshape(h, S, w, S).any(axis=(1, 3))
lab = np.zeros((h, w), np.int32); n = 0; sizes = []
for y0, x0 in zip(*np.nonzero(small)):
    if lab[y0, x0]: continue
    n += 1; lab[y0, x0] = n; q = deque([(y0, x0)]); cnt = 0
    while q:
        y, x = q.popleft(); cnt += 1
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                yy, xx = y + dy, x + dx
                if 0 <= yy < h and 0 <= xx < w and small[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n; q.append((yy, xx))
    sizes.append(cnt)
# стены квартиры: все крупные куски (окна рвут стены на части); буквы — мелкие
big = {k + 1 for k, c in enumerate(sizes) if c >= 0.08 * max(sizes)}

# --- 2. выпуклая оболочка стен ---
pts = sorted(set(map(tuple, np.argwhere(np.isin(lab, list(big)))[:, ::-1].tolist())))
def cross(o, p, q): return (p[0]-o[0])*(q[1]-o[1]) - (p[1]-o[1])*(q[0]-o[0])
lo, hi = [], []
for p in pts:
    while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
    lo.append(p)
for p in reversed(pts):
    while len(hi) >= 2 and cross(hi[-2], hi[-1], p) <= 0: hi.pop()
    hi.append(p)
hull = lo[:-1] + hi[:-1]
def inside(x, y):
    return all(cross(hull[i], hull[(i + 1) % len(hull)], (x, y)) >= -2 for i in range(len(hull)))

# --- 3. куски, чей центр снаружи квартиры, — это подписи улиц: стираем ---
removed = 0
for k in range(1, n + 1):
    if k in big: continue
    ys, xs = np.nonzero(lab == k)
    if not inside(xs.mean(), ys.mean()):
        c = lab == k
        for _ in range(2):                    # с запасом: бледные края букв тоже
            c = c | np.roll(c, 1, 0) | np.roll(c, -1, 0) | np.roll(c, 1, 1) | np.roll(c, -1, 1)
        m = np.kron(c, np.ones((S, S), bool))
        m = np.pad(m, ((0, a.shape[0] - m.shape[0]), (0, a.shape[1] - m.shape[1])))
        a[m] = 255; removed += 1

# --- 4. обрезка по рисунку ---
inkf = a.min(axis=2) < 200
ys, xs = np.where(inkf); pad = 20
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, a.shape[1])
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, a.shape[0])
Image.fromarray(a[y0:y1, x0:x1].astype(np.uint8)).save(f"assets/plans/{fid}.png")
print(fid, "кусков снаружи стёрто:", removed, "размер:", x1 - x0, y1 - y0)
