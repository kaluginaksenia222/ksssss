"""Ассеты сторис: планировка и логотип из карточки, тёмный фон-бетон. Запуск из папки сторис."""
import sys
import numpy as np
from PIL import Image, ImageFilter

card = sys.argv[1] if len(sys.argv) > 1 else "assets/source-card-339.jpg"
src = Image.open(card).convert("RGB")
plan = np.asarray(src.crop((122, 625, 958, 1200)), np.float32)
plan = np.clip((plan - 0) * 255 / 232, 0, 255)        # серый фон → чисто белый, линии не трогаем
Image.fromarray(plan.astype(np.uint8)).save("assets/plan.png")

logo = src.crop((440, 1740, 640, 1872)).convert("L")
a = np.asarray(logo, np.float32); bg = np.median(a)
alpha = np.clip((bg - a) / (bg - a.min() + 1e-6) * 1.4, 0, 1)
rgba = np.zeros((*a.shape, 4), np.uint8); rgba[..., :3] = 255; rgba[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(rgba).save("assets/logo-white.png")

# тёмный бетон 1080×1920
W, H = 1080, 1920
rng = np.random.default_rng(3)
def cloud(scale, blur):
    n = rng.normal(0, 1, (H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray(((n - n.min()) / np.ptp(n) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    im = im.filter(ImageFilter.GaussianBlur(blur))
    x = np.asarray(im, np.float32) / 255
    return (x - x.mean()) / (x.std() + 1e-6)
big, mid = cloud(60, 20), cloud(12, 3)
grain = rng.normal(0, 1, (H, W)).astype(np.float32)
y = np.linspace(-1, 1, H)[:, None]; x = np.linspace(-1, 1, W)[None, :]
light = 1 - 0.55 * (x**2 * 0.8 + (y + 0.1) ** 2 * 0.6)          # свет в центре, виньетка
v = 0.085 * light + 0.010 * big + 0.008 * mid + 0.012 * grain
v = np.clip(v, 0, 1)
Image.fromarray((np.stack([v, v, v * 1.02], -1).clip(0, 1) * 255).astype(np.uint8)).save("assets/bg.png", optimize=True)
print("ok")
