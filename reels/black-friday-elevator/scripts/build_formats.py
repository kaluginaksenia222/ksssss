"""Рекламные форматы ролика «Лифт» (ЖК «Большой Каретный»): без звука, светло-серый лифт,
юридическая пометка внизу. Берёт index.html (1080×1920) и собирает formats/<WxH>/index.html.
Запуск из папки проекта: python3 -I scripts/build_formats.py"""
import os, re, shutil

SRC = open("index.html").read()
LEGAL = ('Реклама квартир в&nbsp;жилом комплексе «Большой каретный». Район Уктус г.&nbsp;Екатеринбург. '
         'Застройщик - ОБЩЕСТВО С&nbsp;ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "СПЕЦИАЛИЗИРОВАННЫЙ ЗАСТРОЙЩИК '
         '"НИЖНЕЙСЕТСКИЙ ПРУД" ОГРН: 1169658108839, ИНН: 6685119693, КПП: 668501001')

# имя: выход W×H, сцена-макет DW×DH (увеличивается в k раз), масштаб лифта s, отступы и кегли
FORMATS = {
    "576x864":   dict(W=576,  H=864,  DW=1080, DH=1620, s=1.00, p2=420, lr=90,  bottom=70, cond=22, legal=19),
    "960x1920":  dict(W=960,  H=1920, DW=1080, DH=2160, s=1.10, p2=660, lr=70,  bottom=90, cond=31, legal=28),
    "1920x1080": dict(W=1920, H=1080, DW=1920, DH=1080, s=0.62, p2=150, lr=300, bottom=50, cond=22, legal=18),
    "3200x1600": dict(W=3200, H=1600, DW=1920, DH=960,  s=0.56, p2=120, lr=300, bottom=40, cond=20, legal=16),
}
# лифт в исходнике: табло + проём занимают x 180..900, y 300..1720; центр дверей (540, 1170); проём 692×1086
LIFT_CX, LIFT_CY, DOOR_CY, OPEN_W, OPEN_H = 540, 1010, 1170, 692, 1086

def build(name, f):
    W, H, DW, DH, s = f["W"], f["H"], f["DW"], f["DH"], f["s"]
    k = W / DW
    assert abs(H / DH - k) < 1e-6, name
    tx, ty = DW / 2 - LIFT_CX * s, DH / 2 - LIFT_CY * s
    ox, oy = DW / 2, DH / 2 + (DOOR_CY - LIFT_CY) * s
    push = max(DW / (OPEN_W * s), DH / (OPEN_H * s)) * 1.15
    h = SRC
    R = [
        ('content="width=1080, height=1920"', f'content="width={W}, height={H}"'),
        ('html, body { width: 1080px; height: 1920px;', f'html, body {{ width: {W}px; height: {H}px;'),
        ('#scene { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; }',
         f'#scene {{ position: absolute; left: 0; top: 0; width: {W}px; height: {H}px; overflow: hidden; }}\n'
         f'      /* макет {DW}×{DH}, увеличен в {k:.4f} раза до {W}×{H}: всё векторное и остаётся чётким */\n'
         f'      #stage {{ position: absolute; left: 0; top: 0; width: {DW}px; height: {DH}px; transform: scale({k:.6f}); transform-origin: 0 0; overflow: hidden; }}\n'
         f'      #lift {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform: translate({tx:.1f}px, {ty:.1f}px) scale({s}); transform-origin: 0 0; }}'),
        ('#cam { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 540px 1170px; }',
         f'#cam {{ position: absolute; left: 0; top: 0; width: {DW}px; height: {DH}px; transform-origin: {ox:.1f}px {oy:.1f}px; }}'),
        # светло-серый лифт; табло остаётся тёмным, чтобы красные точки горели ярко
        ('--door-1: #141417;', '--door-1: #cdd0d5;'),
        ('--door-2: #0b0b0d;', '--door-2: #9fa3a9;'),
        ('border-radius: 18px; background: #050506; box-shadow: 0 0 0 2px #1b1b1f, inset 0 0 30px #000;',
         'border-radius: 18px; background: #070708; box-shadow: 0 0 0 6px #b4b8be, inset 0 0 30px #000;'),
        ('background: #0f0f12; box-shadow: 0 0 0 2px #1f1f24;', 'background: #85898f; box-shadow: 0 0 0 2px #b4b8be;'),
        ('repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0 2px, rgba(0,0,0,0.02) 2px 5px),\n          linear-gradient(90deg',
         'repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 2px, rgba(0,0,0,0.05) 2px 5px),\n          linear-gradient(90deg'),
        ('repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0 2px, rgba(0,0,0,0.02) 2px 5px),\n          linear-gradient(270deg',
         'repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 2px, rgba(0,0,0,0.05) 2px 5px),\n          linear-gradient(270deg'),
        ('#doorL { left: 0; box-shadow: inset -2px 0 0 #050506; }', '#doorL { left: 0; box-shadow: inset -3px 0 0 #5c5f65; }'),
        ('#doorR { right: 0; box-shadow: inset 2px 0 0 #050506;', '#doorR { right: 0; box-shadow: inset 3px 0 0 #5c5f65;'),
        ('#page2 { justify-content: flex-start; padding-top: 560px; }', f'#page2 {{ justify-content: flex-start; padding-top: {f["p2"]}px; }}'),
        ('''      #note {
        position: absolute; left: 160px; right: 160px; bottom: 90px;
        font-family: "Onest BF", sans-serif; font-weight: 500; font-size: 22px; line-height: 1.5;
        letter-spacing: 0.04em; text-align: center; color: var(--ink-2); opacity: 0;
      }''', f'''      #note {{
        position: absolute; left: {f["lr"]}px; right: {f["lr"]}px; bottom: {f["bottom"]}px;
        font-family: "Onest BF", sans-serif; text-align: center; opacity: 0;
      }}
      #note .cond {{ font-weight: 500; font-size: {f["cond"]}px; line-height: 1.45; letter-spacing: 0.03em; color: var(--ink-2); }}
      /* обязательная рекламная пометка — мельче, под условиями */
      #note .legal {{ margin-top: {round(f["cond"] * 0.9)}px; font-weight: 400; font-size: {f["legal"]}px; line-height: 1.45; color: #85858b; }}'''),
        ('<div id="note">АКЦИЯ ДЕЙСТВУЕТ ДО 15&nbsp;НОЯБРЯ. НЕ СУММИРУЕТСЯ С&nbsp;ДРУГИМИ ПРЕДЛОЖЕНИЯМИ. ПОДРОБНОСТИ УТОЧНЯЙТЕ В&nbsp;ОТДЕЛЕ ПРОДАЖ И ПО ТЕЛЕФОНУ&nbsp;303-99-99</div>',
         '<div id="note">\n          <div class="cond">АКЦИЯ ДЕЙСТВУЕТ ДО 15&nbsp;НОЯБРЯ. НЕ СУММИРУЕТСЯ С&nbsp;ДРУГИМИ ПРЕДЛОЖЕНИЯМИ. ПОДРОБНОСТИ УТОЧНЯЙТЕ В&nbsp;ОТДЕЛЕ ПРОДАЖ И ПО <span style="white-space: nowrap">ТЕЛЕФОНУ 303-99-99</span></div>\n'
         f'          <div class="legal">{LEGAL}</div>\n        </div>'),
        ('\n      <audio id="sfx" class="clip" src="assets/sfx/sfx.wav" data-start="0" data-duration="15" data-track-index="1" data-volume="1"></audio>', ''),
        ('data-width="1080" data-height="1920"', f'data-width="{W}" data-height="{H}"'),
        ('tl.to("#cam", { scale: 2.4,', f'tl.to("#cam", {{ scale: {push:.2f},'),
        ('''        <div id="cam">
          <div id="panel"><div id="floorLed" class="led"></div></div>''', '''        <div id="cam">
          <div id="lift">
          <div id="panel"><div id="floorLed" class="led"></div></div>'''),
        ('''              <div id="doorR" class="door"></div>
            </div>
          </div>
        </div>''', '''              <div id="doorR" class="door"></div>
            </div>
          </div>
          </div>
        </div>'''),
    ]
    for a, b in R:
        assert a in h, (name, a[:70])
        h = h.replace(a, b)
    # всё внутри сцены — в #stage
    a = 'data-track-kind="graphics" data-layout-ignore>\n'
    i = h.index(a) + len(a)
    h = h[:i] + '        <div id="stage">\n' + h[i:]
    h = h.replace('        <div id="fade"></div>\n      </div>', '        <div id="fade"></div>\n        </div>\n      </div>', 1)
    h = h.replace('@font-face { font-family: "Onest BF"; font-weight: 500;',
                  '@font-face { font-family: "Onest BF"; font-weight: 400; src: url("assets/fonts/onest-latin-400-normal.woff2") format("woff2"); unicode-range: U+0000-00FF; }\n'
                  '      @font-face { font-family: "Onest BF"; font-weight: 400; src: url("assets/fonts/onest-cyrillic-400-normal.woff2") format("woff2"); unicode-range: U+0400-04FF; }\n'
                  '      @font-face { font-family: "Onest BF"; font-weight: 500;', 1)
    d = f"formats/{name}"
    os.makedirs(f"{d}/assets", exist_ok=True)
    for sub in ("fonts", "vendor"):
        shutil.copytree(f"assets/{sub}", f"{d}/assets/{sub}", dirs_exist_ok=True)
    for w in ("400",):
        for sc in ("latin", "cyrillic"):
            shutil.copy(f"../../library/fonts/onest-{sc}-{w}-normal.woff2", f"{d}/assets/fonts/")
    for fn in ("hyperframes.json", "package.json", "meta.json"):
        shutil.copy(fn, d)
    open(f"{d}/index.html", "w").write(h)
    print(name, f"k={k:.3f} лифт×{s} наезд×{push:.2f}")

for n, f in FORMATS.items():
    build(n, f)
