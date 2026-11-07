# Музыка и звуки серии 3 «Телефон в сторону — идём играть». Своя мелодия, всё синтезируется.
# Запуск: python3 -I music.py <выход.wav> [секунды]. Темп 120: доля 0.5 с.
# 0–7.5: глухая «телефонная» игровая музыка (квадратные волны), стуки мяча в окно.
# 7.5–8: подъём, 8.0: взрыв цвета — весёлая песенка-свистелка с хлопками, короткий цепкий мотив повторяется.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
from synth import *  # noqa

out = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 25.0
N = int(DUR * SR)
mus = np.zeros(N)
sfx = np.zeros(N)
B = 0.5


def square(f, d=0.12):  # «телефонная» восьмибитная нота, приглушённая
    t = tt(d)
    s = np.sign(np.sin(2 * np.pi * f * t))
    s = np.convolve(s, np.ones(24) / 24, mode='same')
    return s * np.exp(-t * 14) * np.minimum(1, t * 800)


def whistle(f, d=0.45):  # свистелка — ведущий голос песенки
    t = tt(d)
    vib = 1 + 0.012 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 0.15)
    s = np.sin(2 * np.pi * np.cumsum(f * vib) / SR) + 0.08 * np.sin(2 * np.pi * np.cumsum(2 * f * vib) / SR)
    env = np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05)
    return s * env


def stab(freqs, d=0.18):  # короткий яркий аккорд «хэй!»
    t = tt(d)
    s = sum(2 * ((f * t) % 1) - 1 for f in freqs) / len(freqs)
    s = np.convolve(s, np.ones(6) / 6, mode='same')
    return s * np.exp(-t * 10)


def knock():
    t = tt(0.12)
    return (np.sin(2 * np.pi * 170 * t) + 0.5 * rng.uniform(-1, 1, len(t)) * np.exp(-t * 80)) * np.exp(-t * 30)


def crash(d=1.5):
    t = tt(d)
    n = rng.uniform(-1, 1, len(t))
    n = n - np.convolve(n, np.ones(4) / 4, mode='same')
    return n * np.exp(-t * 3.5)


def riser(d):
    t = tt(d)
    n = rng.uniform(-1, 1, len(t))
    return (n * 0.5 + np.sin(2 * np.pi * np.cumsum(200 * 8 ** (t / d)) / SR)) * (t / d) ** 2


# ---------- 0–7.5: игра в телефоне (глухо, монотонно) ----------
loop = ['C5', 'E5', 'G5', 'E5', 'C5', 'E5', 'G5', 'B5']
k = 0
while k * 0.125 < 7.4:
    put(mus, k * 0.125, square(hz(loop[k % 8])), 0.24)
    if k % 8 == 0:
        put(mus, k * 0.125, square(hz('C3'), 0.3), 0.28)
    k += 1
for at in (0.6, 1.9, 4.0, 5.1):               # «блип-блип» монеток в игре
    put(mus, at, square(hz('E6'), 0.08), 0.18)
    put(mus, at + 0.08, square(hz('B6'), 0.12), 0.18)
put(mus, 0.0, pad([hz('A3'), hz('C4'), hz('E4')], 3.5), 0.05)

# ---------- 8–24: песенка ----------
# мотив (своя мелодия): «та-та-ти-та | та-та-ти» и ответ, 8 тактов = 8 с, затем повтор с вариацией
hook = [('G5', 0, 0.4), ('G5', 0.5, 0.4), ('E5', 1, 0.25), ('G5', 1.5, 0.4), ('A5', 2, 0.4), ('G5', 2.5, 0.4), ('E5', 3, 0.9),
        ('D5', 4, 0.4), ('D5', 4.5, 0.4), ('E5', 5, 0.25), ('D5', 5.5, 0.4), ('B4', 6, 0.4), ('G4', 7, 0.9),
        ('G5', 8, 0.4), ('G5', 8.5, 0.4), ('E5', 9, 0.25), ('G5', 9.5, 0.4), ('A5', 10, 0.4), ('G5', 10.5, 0.4), ('E5', 11, 0.9),
        ('D5', 12, 0.4), ('E5', 12.5, 0.4), ('F#5', 13, 0.4), ('A5', 13.5, 0.4), ('G5', 14, 1.4)]
chords = [['G3', 'B3', 'D4'], ['E3', 'G3', 'B3'], ['C4', 'E4', 'G4'], ['D4', 'F#4', 'A4']]
roots = ['G2', 'E2', 'C3', 'D3']
END = 24.0
tb = 8.0
while tb < END - 0.01:
    rel = tb - 8.0
    ci = int(rel // 2) % 4
    beat = int(round(rel / B)) % 4
    for kk, n in enumerate(chords[ci]):
        put(mus, tb + kk * 0.012, pluck(hz(n), 0.4, 0.3), 0.15 if beat % 2 == 0 else 0.1)
    put(mus, tb, kick() if beat % 2 == 0 else clap(), 0.5 if beat % 2 == 0 else 0.42)
    if beat % 2 == 1:
        put(mus, tb + 0.03, clap(), 0.25)               # двойной хлопок — под него хочется хлопать
    put(mus, tb, shaker(), 0.6)
    put(mus, tb + 0.25, shaker(), 1.0)
    if beat in (0, 2):
        put(mus, tb, bass(hz(roots[ci])), 0.35)
    if beat == 3:
        put(mus, tb + 0.25, bass(hz(roots[ci]) * 1.5), 0.25)
    tb += B
for rep, t0 in enumerate((8.0, 16.0)):
    for n, b, d in hook:
        at = t0 + b * B
        if at < END:
            put(mus, at, whistle(hz(n), d), 0.22)
            put(mus, at, musicbox(hz(n), 0.5), 0.06)   # колокольчик подсвечивает мелодию
    # «хэй!» в конце каждой фразы
    for b in (3.5, 7.5, 11.5):
        if t0 + b * B < END:
            put(mus, t0 + b * B, stab([hz('G4'), hz('B4'), hz('D5')]), 0.3)
# второй проход: подголосок маримбой
for n, b in [('B5', 0), ('D6', 1), ('C6', 2), ('B5', 3), ('A5', 4), ('B5', 5), ('G5', 6), ('D5', 7)]:
    put(mus, 16.0 + b * 2 * B + 0.25, marimba(hz(n), 0.4), 0.14)
# финал
for kk, n in enumerate(['G3', 'B3', 'D4', 'G4']):
    put(mus, END + kk * 0.03, pluck(hz(n), 1.0, 0.8), 0.3)
put(mus, END, whistle(hz('G5'), 0.9), 0.2)
put(mus, END, kick(), 0.5)
put(mus, END, bass(hz('G2'), 1.0), 0.35)

# ---------- звуки ----------
for at in (2.2, 2.7, 3.2, 4.3, 4.5):           # мяч стучит в окно
    put(sfx, at, knock(), 0.45)
put(sfx, 4.7, slide(500, 1100, 0.25), 0.1)     # мяч улетает вверх
put(sfx, 4.9, slide(1200, 400, 0.7), 0.1)      # и падает в комнату
put(sfx, 5.6, boing(180), 0.3)                 # пол
put(sfx, 6.0, boing(240), 0.35)                # бум по голове
put(sfx, 6.0, pop(), 0.35)
put(sfx, 6.1, doink(), 0.25)
put(sfx, 6.4, boop(260), 0.25)
put(sfx, 6.85, whoosh(0.45), 0.28)             # телефон летит на полку
put(sfx, 7.3, slide(700, 180, 0.35), 0.12)     # телефон засыпает
put(sfx, 7.3, marimba(hz('C5'), 0.3), 0.15)
put(sfx, 7.45, riser(0.55), 0.25)              # подъём к цвету
put(sfx, 8.0, crash(), 0.22)                   # цвет!
put(sfx, 8.2, whoosh(0.45), 0.3)               # перелёт на улицу
for kk in range(8):                            # мяч на голове
    put(sfx, 9.0 + kk * 0.5, boop(380 + (kk % 2) * 120), 0.22)
put(sfx, 12.5, whoosh(0.4), 0.15)
kk = 0
while 13.0 + kk * 0.25 < 16.0:                 # топ-топ
    put(sfx, 13.0 + kk * 0.25, boop(160), 0.12)
    kk += 1
put(sfx, 16.0, slide(300, 900, 0.5), 0.1)      # прыжок
put(sfx, 16.4, chime(), 0.16)                  # радуга
put(sfx, 17.0, kick(), 0.35)                   # приземлились
put(sfx, 19.0, pop(), 0.32)                    # цветок
put(sfx, 19.0, chime(), 0.2)
put(sfx, 22.1, pop(), 0.35)                    # значок
put(sfx, 22.15, ding(), 0.16)
put(sfx, 22.6, slide(500, 800, 0.35), 0.08)    # пока-пока

mix = mus * 0.72 + sfx
mix[int(8.0 * SR):] -= mus[int(8.0 * SR):] * 0.72 * 0.4  # песенка не громче начала
fade = int(0.4 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
write_wav(out, mix)
print('ok', out, DUR, 's')
