"""Фактура тёмной ткани 1080×1920 (детерминированная). Запуск из папки проекта."""
import numpy as np
from PIL import Image, ImageFilter

W, H = 1080, 1920
rng = np.random.default_rng(11)

def blur(a, r):
    im = Image.fromarray(((a - a.min()) / (np.ptp(a) + 1e-9) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), np.float32) / 255

# мелкое зерно
grain = rng.normal(0, 1, (H, W)).astype(np.float32)
# горизонтальные волокна: шум, растянутый по X
fib = rng.normal(0, 1, (H, W // 12)).astype(np.float32)
fib = np.asarray(Image.fromarray(fib).resize((W, H), Image.BICUBIC), np.float32)
fib = (fib - fib.mean()) / fib.std()
# крупные складки/неровности
folds = blur(rng.normal(0, 1, (H // 8, W // 8)).astype(np.float32), 3)
folds = np.asarray(Image.fromarray((folds * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
folds = (folds - folds.mean()) / (folds.std() + 1e-6)

y = np.linspace(0, 1, H)[:, None]
x = np.linspace(-1, 1, W)[None, :]
light = 1.0 - 0.35 * y - 0.18 * x**2      # свет сверху, края темнее

base = 0.15 * light + 0.03 * fib + 0.006 * folds + 0.016 * grain
base = np.clip(base, 0, 1)
rgb = np.stack([base * 0.95, base * 0.96, base * 1.08], -1)  # чуть холодный оттенок
Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).save("assets/img/fabric.png", optimize=True)
print("ok")
