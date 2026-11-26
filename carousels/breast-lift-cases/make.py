# Карусель «Когда я бы делал подтяжку груди» (формат «заключение хирурга» с печатями).
# Запуск: python3 make.py <base.css> <fonts.css> <mascot.webp>
import base64, sys, os
here = os.path.dirname(os.path.abspath(__file__))
base_css, fonts_css, mascot = sys.argv[1:4]
N = 9

CSS = r"""
.ruled{background-color:var(--paper);color:var(--navy);
  background-image:repeating-linear-gradient(180deg,transparent 0 63px,rgba(0,39,95,.07) 63px 65px)}
.ruled::before{content:"";position:absolute;left:52px;top:0;bottom:0;width:3px;background:rgba(157,192,225,.7)}
.white{background:var(--white);color:var(--navy)}
.navy .title{color:var(--white)}
.nick{position:absolute;left:72px;top:1262px;height:52px;display:flex;align-items:center;gap:12px;padding:0 22px;border-radius:999px;background:var(--white);color:var(--navy);font:600 22px/1 var(--body);z-index:6;border:2px solid var(--mist)}
.navy .nick{background:var(--navy-glass);color:var(--white);border:0}
.nick svg{width:24px;height:24px}
.pager{opacity:.55}
.eyebrow{position:absolute;left:84px;top:150px;color:#6B7A90}
.navy .eyebrow{color:var(--ice)}

/* печать */
.stamp{position:absolute;width:300px;height:300px;border-radius:50%;border:9px double var(--navy);color:var(--navy);display:grid;place-items:center;text-align:center;transform:rotate(-13deg);z-index:5;background:rgba(243,245,248,.55)}
.stamp div{display:grid;gap:8px;justify-items:center}
.stamp small{font:800 17px/1 var(--heavy);letter-spacing:.18em;text-transform:uppercase}
.stamp b{font:700 66px/.95 var(--display);text-transform:uppercase}
.stamp i{font:600 21px/1.2 var(--body);font-style:normal;max-width:200px}
.stamp::after{content:"";position:absolute;inset:16px;border-radius:50%;border:2px solid currentColor;opacity:.5}
.navy .stamp{border-color:var(--white);color:var(--white);background:rgba(0,39,95,.4)}

/* обложка */
.cv .title{position:absolute;left:78px;top:200px;width:940px;font-size:104px;line-height:.98;color:var(--navy)}
.cv .title .hl{display:inline-block;line-height:1;margin-top:14px;background:var(--navy);color:var(--white);padding:10px 20px 6px;border-radius:14px}
.cv .sub{position:absolute;left:84px;top:560px;width:500px;font:400 36px/1.38 var(--body);color:var(--graphite);margin:0}
.cv .sub b{color:var(--navy);font-weight:600}
.cv .go{position:absolute;left:84px;top:1110px;background:var(--navy);color:var(--white);z-index:4}
.cv .go svg{flex:none;width:34px;height:34px}
.cv .mascot{right:-80px;bottom:-50px;width:520px;z-index:4}

/* степени птоза */
.deg .title{position:absolute;left:78px;top:200px;width:940px;font-size:104px}
.deg .lead{position:absolute;left:84px;top:430px;width:900px;font:400 36px/1.4 var(--body);color:var(--graphite);margin:0}
.deg .lead b{color:var(--navy);font-weight:600}
.deg .grid{position:absolute;left:72px;right:56px;top:640px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.deg .cell{background:var(--white);border:2px solid var(--mist);border-radius:28px;padding:14px 10px 18px;display:grid;justify-items:center;gap:8px;text-align:center}
.deg .cell.hot{border-color:var(--navy);border-width:3px}
.deg .cell svg{width:100%;height:auto}
.deg .cell b{font:800 24px/1.1 var(--heavy);text-transform:uppercase;color:var(--navy)}
.deg .cell span{font:500 20px/1.25 var(--body);color:#4A5568}
.deg .note{position:absolute;left:84px;top:1110px;width:900px;font:600 33px/1.3 var(--body);color:var(--navy)}
.deg .note .mark{background:var(--navy);color:var(--white)}

/* случай */
.case .title{position:absolute;left:78px;top:200px;width:930px;font-size:92px}
.form{position:absolute;left:72px;top:450px;width:936px;background:var(--white);border-radius:40px;padding:38px 44px;display:grid;gap:26px;box-shadow:0 30px 60px -40px rgba(0,26,66,.5);border:2px solid var(--mist);z-index:2}
.form .f{display:grid;gap:10px}
.form .f+.f{border-top:3px dashed var(--mist);padding-top:24px}
.form .lab{font:800 22px/1 var(--heavy);letter-spacing:.14em;text-transform:uppercase;color:#6B7A90}
.form p{margin:0;font:400 38px/1.38 var(--body);color:var(--graphite)}
.form p b{font-weight:600;color:var(--navy)}
.case .stamp{right:46px;top:900px}

/* подождём */
.wait .title{position:absolute;left:78px;top:200px;width:700px;font-size:96px}
.wait .stamp{right:40px;top:990px;width:270px;height:270px}
.wait .stamp b{font-size:42px}
.wl{position:absolute;left:72px;right:72px;top:470px;display:grid;gap:20px}
.wr{display:flex;gap:24px;align-items:flex-start;background:var(--navy-glass);border-radius:30px;padding:24px 30px}
.wr .n{flex:none;width:54px;height:54px;border-radius:50%;background:var(--ice);color:var(--navy);display:grid;place-items:center;font:700 30px/1 var(--display)}
.wr div{display:grid;gap:6px}
.wr b{font:600 33px/1.25 var(--body);color:var(--white)}
.wr span{font:400 28px/1.35 var(--body);color:var(--mist)}

/* шрамы */
.scar .title{position:absolute;left:78px;top:200px;width:940px;font-size:104px}
.scar .row{position:absolute;left:72px;right:56px;top:440px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.scar .cell{background:var(--white);border:2px solid var(--mist);border-radius:28px;padding:18px 14px 20px;display:grid;justify-items:center;gap:10px;text-align:center}
.scar .cell svg{width:78%;height:auto}
.scar .cell b{font:800 23px/1.15 var(--heavy);text-transform:uppercase;color:var(--navy)}
.scar .pts{position:absolute;left:84px;right:72px;top:860px;display:grid;gap:20px}
.scar .pt{display:flex;gap:24px;font:400 34px/1.35 var(--body);color:var(--graphite)}
.scar .pt::before{content:"";flex:none;width:20px;height:20px;border-radius:5px;background:var(--navy);margin-top:12px;transform:rotate(45deg)}
.scar .pt b{font-weight:600;color:var(--navy)}

/* финал */
.fin .title{position:absolute;left:66px;top:200px;width:940px;font-size:130px}
.fin .txt{position:absolute;left:72px;top:470px;width:580px;font-size:35px;opacity:.95}
.fin .pl{position:absolute;left:72px;display:flex;gap:16px;align-items:center;border-radius:32px;padding:22px 30px;font:800 27px/1.2 var(--heavy);text-transform:uppercase;width:580px;z-index:4}
.fin .pl svg{flex:none;width:38px;height:38px}
.fin .p1{top:900px;background:var(--white);color:var(--navy)}
.fin .p2{top:1060px;background:var(--navy-glass);color:var(--white)}
.fin .eyebrow{left:72px}
.fin .mascot{right:-110px;bottom:-40px;width:530px}
.fin .ring{position:absolute;right:-70px;top:600px;width:580px;height:580px;border-radius:50%;background:var(--ice);opacity:.2}
"""

IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>'
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"/></svg>'
LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'

def stamp(word, note='', top='Решение хирурга'):
    return f'<div class="stamp"><div><small>{top}</small><b>{word}</b>{f"<i>{note}</i>" if note else ""}</div></div>'

# профиль груди сбоку: грудная стенка слева, пунктир — складка под грудью
PROFILES = [
    ("Норма", "сосок выше складки", "M30 50 C 95 62, 168 110, 168 150 C 168 192, 112 206, 30 200", (166, 146), False),
    ("1 степень", "сосок на уровне складки", "M30 50 C 85 75, 166 140, 163 192 C 160 230, 100 236, 30 200", (161, 198), False),
    ("2 степень", "сосок ниже складки", "M30 50 C 80 90, 160 168, 154 224 C 149 262, 92 264, 30 200", (152, 226), True),
    ("3 степень", "ниже складки и смотрит вниз", "M30 50 C 72 102, 146 204, 132 254 C 122 290, 72 284, 30 200", (124, 268), True),
]
def profile(d, nip):
    return (f'<svg viewBox="0 0 200 300" fill="none">'
            f'<line x1="30" y1="14" x2="30" y2="290" stroke="#9DC0E1" stroke-width="6" stroke-linecap="round"/>'
            f'<path d="{d}" fill="#DCE7F3" stroke="#00275F" stroke-width="6" stroke-linejoin="round"/>'
            f'<line x1="14" y1="200" x2="190" y2="200" stroke="#00275F" stroke-width="3" stroke-dasharray="7 8"/>'
            f'<circle cx="{nip[0]}" cy="{nip[1]}" r="9" fill="#00275F"/></svg>')

# виды швов спереди
def front(kind):
    s = ('<svg viewBox="0 0 200 200" fill="none">'
         '<path d="M22 70 C 22 150, 60 186, 100 186 C 140 186, 178 150, 178 70" stroke="#9DC0E1" stroke-width="6" stroke-linecap="round"/>'
         '<circle cx="100" cy="112" r="26" fill="#DCE7F3"/>')
    sc = '#00275F'
    s += f'<circle cx="100" cy="112" r="30" stroke="{sc}" stroke-width="5" stroke-dasharray="6 6"/>'
    if kind >= 2:
        s += f'<line x1="100" y1="142" x2="100" y2="186" stroke="{sc}" stroke-width="5" stroke-dasharray="6 6"/>'
    if kind >= 3:
        s += f'<path d="M48 176 C 70 186, 130 186, 152 176" stroke="{sc}" stroke-width="5" stroke-dasharray="6 6"/>'
    return s + '</svg>'

def slide(i, cls, body):
    return (f'<div class="frame"><div class="slide {cls}" id="s{i}"><div class="pager">{i}/{N}</div>{body}'
            f'<div class="nick">{IG}@dr_kudryakov</div></div></div>')

def case(i, n, title, see, do, st):
    return slide(i, 'ruled case', f'''
  <div class="eyebrow">Случай {n} из 4</div>
  <h2 class="title">{title}</h2>
  <div class="form">
    <div class="f"><span class="lab">Что вижу</span><p>{see}</p></div>
    <div class="f"><span class="lab">Что делаю</span><p>{do}</p></div>
  </div>
  {st}''')

S = []
S.append(slide(1, 'white cv', f'''
  <div class="eyebrow">Честно от хирурга</div>
  <h2 class="title">Когда я бы делал <span class="hl">подтяжку груди</span></h2>
  <p class="sub"><b>4 случая, когда операция поможет,</b> и 4, когда я скажу подождать</p>
  <div class="stamp" style="left:84px;top:780px;width:250px;height:250px;transform:rotate(-14deg)"><div><small>Решение</small><b style="font-size:54px">Делаю</b></div></div>
  <div class="stamp" style="left:330px;top:830px;width:210px;height:210px;transform:rotate(9deg);opacity:.5"><div><small>Решение</small><b style="font-size:40px">Подождём</b></div></div>
  <span class="pill go">Листайте{ARROW}</span>
  <div class="mascot flip"></div>'''))

cells = ''.join(f'<div class="cell{" hot" if hot else ""}">{profile(d, nip)}<b>{t}</b><span>{c}</span></div>' for t, c, d, nip, hot in PROFILES)
S.append(slide(2, 'ruled deg', f'''
  <div class="eyebrow">Сначала проверим</div>
  <h2 class="title">Опустилась ли грудь</h2>
  <p class="lead">Главный ориентир для меня: <b>где сосок относительно складки под грудью.</b> Встаньте боком к зеркалу и сравните.</p>
  <div class="grid">{cells}</div>
  <p class="note">Со 2 степени без подтяжки <span class="mark">обычно не обойтись.</span></p>'''))

S.append(case(3, 1, 'После беременности и кормления',
    'Грудь стала мягче и ниже, кожа растянулась, ареолы стали шире.',
    'Подтягиваю, <b>если детей больше не планируете.</b> Это самый частый повод для подтяжки.',
    stamp('Делаю')))
S.append(case(4, 2, 'После сильного похудения',
    'Объём ушёл, а кожа осталась. Грудь опустилась, даже если раньше была упругой.',
    'Подтягиваю, когда <b>вес держится стабильно хотя бы полгода.</b>',
    stamp('Делаю', 'если вес стабилен')))
S.append(case(5, 3, 'Грудь опустилась и пустая сверху',
    'Сосок ниже складки, а в верхней части груди почти нет объёма.',
    'Подтяжку вместе с имплантом. <b>Одна подтяжка поднимет грудь, но объём сверху не вернёт.</b>',
    stamp('Делаю', '+ имплант')))
S.append(case(6, 4, 'Одна грудь ниже другой',
    'Соски на разной высоте, разница в форме заметна даже в одежде.',
    'Подтягиваю одну или обе, <b>чтобы выровнять.</b> Иногда добавляю имплант с одной стороны.',
    stamp('Делаю')))

S.append(slide(7, 'navy wait', f'''
  <div class="eyebrow">А теперь честно</div>
  <h2 class="title">Когда я скажу подождать</h2>
  {stamp('Подождём')}
  <div class="wl">
    <div class="wr"><span class="n">1</span><div><b>Планируете беременность в ближайшие годы</b><span>После кормления грудь может опуститься снова</span></div></div>
    <div class="wr"><span class="n">2</span><div><b>Вес ещё меняется</b><span>Результат поплывёт вместе с ним</span></div></div>
    <div class="wr"><span class="n">3</span><div><b>Сосок выше складки, а хочется объёма</b><span>Тут может хватить импланта без подтяжки</span></div></div>
    <div class="wr"><span class="n">4</span><div><b>Курите и не готовы бросить</b><span>Швы на груди будут заживать хуже</span></div></div>
  </div>'''))

S.append(slide(8, 'ruled scar', f'''
  <div class="eyebrow">До решения</div>
  <h2 class="title">Что важно знать</h2>
  <div class="row">
    <div class="cell">{front(1)}<b>Вокруг ареолы</b></div>
    <div class="cell">{front(2)}<b>Ареола и вниз</b></div>
    <div class="cell">{front(3)}<b>Якорь</b></div>
  </div>
  <div class="pts">
    <div class="pt"><span><b>Шрамы будут.</b> Какой вариант, зависит от степени опущения. За год они светлеют.</span></div>
    <div class="pt"><span>Результат держится годами, но грудь продолжает меняться с возрастом.</span></div>
    <div class="pt"><span>Кормить после подтяжки часто можно, но <b>гарантировать это нельзя.</b></span></div>
  </div>'''))

S.append(slide(9, 'navy fin', f'''
  <div class="ring"></div>
  <div class="eyebrow">Ваш случай</div>
  <h2 class="title">Узнали себя?</h2>
  <p class="txt">На консультации я посмотрю степень опущения и скажу, что подойдёт именно вам: подтяжка, имплант или оба сразу.</p>
  <span class="pl p1">{CHAT}Напишите номер своего случая: 1, 2, 3 или 4</span>
  <span class="pl p2">{LINK}Записаться через ПроДокторов</span>
  <div class="mascot"></div>'''))

page = f'''<title>Подтяжка груди: когда делать</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
{open(base_css).read()}
{CSS}
</style>
<div class="intro">
  <h1>Когда я бы делал подтяжку груди</h1>
  <p>9 слайдов в формате «заключение хирурга», 1080 × 1350. Фото для Instagram лежат в проекте, в папке carousels/breast-lift-cases/slides/instagram.</p>
</div>
<div class="feed">
{"".join(S)}
</div>
<script>
(function(){{
  if(location.hash==='#export'){{document.body.classList.add('export');return}}
  function fit(){{document.querySelectorAll('.frame').forEach(function(f){{f.firstElementChild.style.transform='scale('+(f.clientWidth/1080)+')'}})}}
  fit(); window.addEventListener('resize',fit);
  if(window.ResizeObserver){{new ResizeObserver(fit).observe(document.querySelector('.feed'))}}
}})();
</script>
'''
open(os.path.join(here, 'slides.src.html'), 'w').write(page)
full = page.replace('/*FONTS*/', open(fonts_css).read()).replace('MASCOT', 'data:image/webp;base64,' + base64.b64encode(open(mascot, 'rb').read()).decode())
open(os.path.join(here, 'slides.html'), 'w').write(full)
