# Музыка и звуки серии 2 «Моем руки». Инструменты общие: kids-channel/lib/synth.py.
# Запуск: python3 -I music.py <выход.wav> [секунды]. Темп 120: доля 0.5 с.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
from synth import *  # noqa

out = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 25.0
N = int(DUR * SR)
mus = np.zeros(N)
sfx = np.zeros(N)
B = 0.5

# 0–2: Оки весело скачет — игривая маримба
for n, b in [('C5', 0), ('E5', 0.5), ('G5', 1), ('E5', 1.5), ('A5', 2), ('G5', 3)]:
    put(mus, 0.05 + b * B, marimba(hz(n), 0.45), 0.28)
for b in range(4):
    put(mus, b * B, pluck(hz(['C4', 'E4', 'G4', 'E4'][b]), 0.4), 0.18)
put(mus, 0.0, pad([hz('C4'), hz('E4'), hz('G4')], 2.0), 0.08)
# 1.8–3: «ммм, печенье» — вверх
for k, n in enumerate(['G4', 'A4', 'B4', 'C5', 'D5']):
    put(mus, 1.9 + k * 0.2, musicbox(hz(n), 0.8), 0.14)

# 3–6.5: микробы — тот же «крадущийся» мотив, что в 1-й серии (узнаваемая тема микробов)
sneak = ['A2', 'C3', 'E3', 'D#3', 'E3', 'C3', 'A2', 'B2']
for i in range(14):
    put(mus, 3.0 + i * 0.25, pizz(hz(sneak[i % 8]) * 2), 0.32 if i % 2 == 0 else 0.22)
for b, n in [(0, 'E5'), (1.5, 'D#5'), (2, 'E5'), (3.5, 'B4'), (4, 'C5'), (5.5, 'A4')]:
    put(mus, 3.0 + b * B, marimba(hz(n)), 0.18)
put(mus, 6.0, pizz(hz('A3')), 0.3)

# 6.75–10.5: придумал! — арпеджио укулеле вверх и дробь перед темой
arp = ['F4', 'A4', 'C5', 'F5', 'C4', 'E4', 'G4', 'C5', 'D4', 'F4', 'A4', 'D5', 'G3', 'B3', 'D4', 'G4']
for i, n in enumerate(arp):
    put(mus, 6.75 + i * 0.25, pluck(hz(n), 0.6), 0.28)
put(mus, 6.75, pad([hz('F3'), hz('A3'), hz('C4')], 2.0), 0.08)
put(mus, 8.75, pad([hz('G3'), hz('B3'), hz('D4')], 1.8), 0.08)
put(mus, 9.5, snare_roll(1.0), 0.25)

# 10.5–17 и 19–24: основная тема канала, новая мелодия
chords = [['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4']]
roots = ['F2', 'C3', 'G2', 'C3']
theme = [('A5', 0), ('G5', 0.5), ('F5', 1), ('A5', 1.5), ('G5', 2), ('E5', 3), ('C5', 3.5), ('E5', 4), ('G5', 5), ('D5', 6), ('B4', 6.5), ('D5', 7),
         ('F5', 8), ('A5', 8.5), ('C6', 9), ('A5', 10), ('G5', 11), ('E5', 12), ('D5', 13), ('C5', 14)]
END = 24.0
tb = 10.5
while tb < END - 0.01:
    if 17.0 <= tb < 19.0:
        tb += B
        continue
    rel = tb - (10.5 if tb < 17.0 else 19.0)
    ci = int(rel // 2) % 4
    beat = int(round(rel / B)) % 4
    for k, n in enumerate(chords[ci]):
        put(mus, tb + k * 0.012, pluck(hz(n), 0.4, 0.3), 0.16 if beat % 2 == 0 else 0.11)
    put(mus, tb, kick() if beat % 2 == 0 else clap(), 0.5 if beat % 2 == 0 else 0.35)
    put(mus, tb, shaker(), 0.6)
    put(mus, tb + 0.25, shaker(), 1.0)
    if beat in (0, 2):
        put(mus, tb, bass(hz(roots[ci])), 0.35 if beat == 0 else 0.3)
    if beat == 3:
        put(mus, tb, bass(hz(roots[ci]) * 1.5), 0.25)
    tb += B
for n, b in theme:
    if 10.5 + b * B < 17.0:
        put(mus, 10.5 + b * B, marimba(hz(n), 0.45), 0.3)
    if 19.0 + b * B < END:
        put(mus, 19.0 + b * B, marimba(hz(n), 0.45), 0.3)
# 17–19: смывает пену — мягкий пэд
put(mus, 16.9, pad([hz('F3'), hz('A3'), hz('C4')], 2.2), 0.26)
for k, n in enumerate(['C5', 'A4', 'F4', 'C5']):
    put(mus, 17.2 + k * 0.4, musicbox(hz(n), 0.9), 0.22)
# финальный аккорд
for k, n in enumerate(['C4', 'E4', 'G4', 'C5']):
    put(mus, END + k * 0.03, pluck(hz(n), 1.0, 0.8), 0.3)
put(mus, END, musicbox(hz('C6'), 1.0), 0.25)
put(mus, END, kick(), 0.5)
put(mus, END, bass(hz('C3'), 1.0), 0.35)

# ---------- звуки к картинке ----------
for at in (0.5, 1.0, 1.5):
    put(sfx, at - 0.02, boop(300), 0.35)
for k, at in enumerate((3.0, 3.25, 3.5)):            # микробы выпрыгивают из грязи
    put(sfx, at, boing(200 + k * 40), 0.2)
put(sfx, 3.6, doink(), 0.26)                            # испуг
put(sfx, 6.75, ding(), 0.25)                           # идея
put(sfx, 7.3, slide(350, 700, 0.6), 0.08)              # прыжок к раковине
put(sfx, 7.9, boop(260), 0.35)
put(sfx, 7.9, slide(900, 600, 0.15), 0.08)             # кран повернулся
put(sfx, 8.0, water(1.6), 0.2)                        # вода
put(sfx, 9.1, boop(600), 0.12)                         # мыло подпрыгивает
put(sfx, 9.5, whoosh(0.5), 0.3)                        # мыло летит
put(sfx, 10.0, squish(), 0.45)                         # поймал мыло
k = 0
while 10.5 + k * 0.25 < 17.0:                          # трёт ладошки
    put(sfx, 10.5 + k * 0.25, rub(), 0.12)
    k += 1
for tp in (12.0, 13.5, 15.0):                          # пузырь летит, микроб лопается
    put(sfx, tp - 0.45, boop(500), 0.25)
    put(sfx, tp, pop(), 0.55)
    put(sfx, tp + 0.03, slide(900, 1500, 0.18), 0.12)
put(sfx, 17.0, water(1.4), 0.2)                       # смывает
put(sfx, 18.4, brrr(0.6), 0.2)                         # стряхивает капли
put(sfx, 18.5, musicbox(hz('E7'), 0.8) + musicbox(hz('B7'), 0.8), 0.15)
put(sfx, 19.0, pop(), 0.35)                             # цветок
put(sfx, 19.0, chime(), 0.22)
put(sfx, 19.6, slide(400, 700, 0.5), 0.07)
put(sfx, 20.0, whoosh(0.6), 0.25)                      # печенье летит
put(sfx, 20.6, pop(), 0.3)
for k in range(4):                                     # хрум-хрум
    put(sfx, 20.95 + k * 0.3, crunch(), 0.5)
put(sfx, 22.1, pop(), 0.4)                             # значок
put(sfx, 22.15, ding(), 0.18)
put(sfx, 22.6, slide(500, 800, 0.35), 0.08)            # пока-пока

mix = mus * 0.85 * 0.85 + sfx
mix[int(10.5 * SR):] -= mus[int(10.5 * SR):] * 0.85 * 0.85 * 0.45  # тема не громче вступления
fade = int(0.4 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
write_wav(out, mix)
print('ok', out, DUR, 's')
