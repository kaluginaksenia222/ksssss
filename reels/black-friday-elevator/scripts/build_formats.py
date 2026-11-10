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
    "576x864":   dict(W=576,  H=864,  DW=1080, DH=1620, s=1.00, lr=90,  bottom=50, cond=19, legal=16, lt=70,  lw=330, ph=78, site=38),
    "960x1920":  dict(W=960,  H=1920, DW=1080, DH=2160, s=1.10, lr=70,  bottom=80, cond=26, legal=22, lt=130, lw=420, ph=100, site=48),
    "1920x1080": dict(W=1920, H=1080, DW=1920, DH=1080, s=0.62, lr=300, bottom=34, cond=17, legal=14, lt=40,  lw=230, ph=62, site=30, p2b=70),
    "3200x1600": dict(W=3200, H=1600, DW=1920, DH=960,  s=0.56, lr=300, bottom=26, cond=16, legal=13, lt=22,  lw=170, ph=56, site=28, p2b=100),
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
        ('#page2 { justify-content: flex-start; padding-top: 560px; }', f'#page2 {{ justify-content: center; padding-top: 0; padding-bottom: {f.get("p2b", 0)}px; }}'),
        ('#m2 { font-weight: 800; font-size: 44px; letter-spacing: 0.04em; color: var(--ink); margin-top: 54px; }',
         '#m2 { font-weight: 800; font-size: 54px; line-height: 1.25; text-align: center; letter-spacing: 0.03em; color: var(--ink); margin-top: 40px; }'),
        ('const PAGE2 = ["СКИДКА", "НА ПЕРВУЮ ОЧЕРЕДЬ"];', 'const PAGE2 = ["СКИДКА", "НА ПЕРВУЮ ОЧЕРЕДЬ\\nДОМ УЖЕ СДАН"];'),
        # логотип ЖК на дверях лифта: половинки на каждой створке, разъезжаются вместе с дверями
        ('position: absolute; top: 0; bottom: 0; width: 50%;', 'position: absolute; top: 0; bottom: 0; width: 50%; overflow: hidden;'),
        ('<div id="doorL" class="door"></div>', '<div id="doorL" class="door"><img class="dlogo" src="assets/img/karetny-red.png" alt="" style="left: 126px" /></div>'),
        ('<div id="doorR" class="door"></div>', '<div id="doorR" class="door"><img class="dlogo" src="assets/img/karetny-red.png" alt="" style="left: -220px" /></div>'),
        ('''          <div id="frame">''', '''          <div id="bfcap">BLACK FRIDAY — ЧЁРНАЯ ПЯТНИЦА</div>
          <div id="frame">'''),
        ('''      #note {
        position: absolute; left: 160px; right: 160px; bottom: 90px;
        font-family: "Onest BF", sans-serif; font-weight: 500; font-size: 22px; line-height: 1.5;
        letter-spacing: 0.04em; text-align: center; color: var(--ink-2); opacity: 0;
      }''', f'''      .dlogo {{ position: absolute; top: 420px; width: 440px; height: auto; }}
      /* перевод аббревиатуры BF (закон «О рекламе») — под табло */
      #bfcap {{ position: absolute; left: 0; width: 1080px; top: 566px; text-align: center; font-family: "Onest BF", sans-serif; font-weight: 800; font-size: 38px; letter-spacing: 0.03em; color: var(--ink); opacity: 0; }}
      #logo2 {{ position: absolute; left: 50%; top: {f["lt"]}px; width: {f["lw"]}px; height: auto; margin-left: -{f["lw"]/2}px; opacity: 0; }}
      #bottom {{ position: absolute; left: {f["lr"]}px; right: {f["lr"]}px; bottom: {f["bottom"]}px; display: flex; flex-direction: column; align-items: center; }}
      #phone {{ font-family: "Onest BF", sans-serif; font-weight: 800; font-size: {f["ph"]}px; line-height: 1; letter-spacing: 0.02em; color: var(--ink); opacity: 0; }}
      #site {{ font-family: "Onest BF", sans-serif; font-weight: 500; font-size: {f["site"]}px; line-height: 1.1; letter-spacing: 0.04em; color: #d6d6da; margin-top: {round(f["ph"]*0.15)}px; opacity: 0; }}
      #note {{ position: relative; margin-top: {round(f["ph"]*0.35)}px; font-family: "Onest BF", sans-serif; text-align: center; opacity: 0; }}
      #note .cond {{ font-weight: 500; font-size: {f["cond"]}px; line-height: 1.45; letter-spacing: 0.03em; color: var(--ink-2); }}
      /* обязательная рекламная пометка — мельче, под условиями */
      #note .legal {{ margin-top: {round(f["cond"] * 0.9)}px; font-weight: 400; font-size: {f["legal"]}px; line-height: 1.45; color: #85858b; }}'''),
        ('<div id="note">АКЦИЯ ДЕЙСТВУЕТ ДО 15&nbsp;НОЯБРЯ. НЕ СУММИРУЕТСЯ С&nbsp;ДРУГИМИ ПРЕДЛОЖЕНИЯМИ. ПОДРОБНОСТИ УТОЧНЯЙТЕ В&nbsp;ОТДЕЛЕ ПРОДАЖ И ПО ТЕЛЕФОНУ&nbsp;303-99-99</div>',
         '<img id="logo2" src="assets/img/karetny-white.png" alt="" />\n        <div id="bottom">\n        <div id="phone">303-99-99</div>\n        <div id="site">bolshoykaretny.ru</div>\n        <div id="note">\n          <div class="cond">АКЦИЯ ДЕЙСТВУЕТ ДО 15&nbsp;НОЯБРЯ. НЕ СУММИРУЕТСЯ С&nbsp;ДРУГИМИ ПРЕДЛОЖЕНИЯМИ. ПОДРОБНОСТИ УТОЧНЯЙТЕ В&nbsp;ОТДЕЛЕ ПРОДАЖ.</div>\n'
         f'          <div class="legal">{LEGAL}</div>\n        </div>\n        </div>'),
        ('      tl.fromTo("#note",', '''      tl.fromTo("#bfcap", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, T.bf + 0.1);
      tl.fromTo("#logo2", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, T.text2);
      tl.fromTo(["#phone", "#site"], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.12 }, T.pct + 0.6);
      tl.fromTo("#note",'''),
        ('\n      <audio id="sfx" class="clip" src="assets/sfx/sfx.wav" data-start="0" data-duration="15" data-track-index="1" data-volume="1"></audio>', ''),
        ('data-width="1080" data-height="1920"', f'data-width="{W}" data-height="{H}"'),
        ('tl.to("#cam", { scale: 2.4,', f'tl.to("#cam", {{ scale: {push:.2f},'),
        ('''        <div id="cam">
          <div id="panel"><div id="floorLed" class="led"></div></div>''', '''        <div id="cam">
          <div id="lift">
          <div id="panel"><div id="floorLed" class="led"></div></div>'''),
        ('''            </div>
          </div>
        </div>
        <div id="page1" class="page">''', '''            </div>
          </div>
          </div>
        </div>
        <div id="page1" class="page">'''),
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
    for sub in ("fonts", "vendor", "img"):
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
