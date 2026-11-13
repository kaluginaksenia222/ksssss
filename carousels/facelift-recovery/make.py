# Генератор карусели «Восстановление после подтяжки лица» (формат «отрывной календарь»).
# Запуск: python3 make.py <base.css> <fonts.css> <mascot.webp>  -> slides.src.html (без шрифтов) и slides.html (всё внутри)
import base64, sys, os
here = os.path.dirname(os.path.abspath(__file__))
base_css, fonts_css, mascot = sys.argv[1:4]
N = 9

CSS = r"""
.white{background:var(--white);color:var(--navy)}
.pano-note{}
.title{color:inherit}
.navy .title{color:var(--white)}
.nick{position:absolute;left:72px;top:1262px;height:52px;display:flex;align-items:center;gap:12px;padding:0 22px;border-radius:999px;background:var(--paper);color:var(--navy);font:600 22px/1 var(--body);z-index:6}
.navy .nick{background:var(--navy-glass);color:var(--white)}
.nick svg{width:24px;height:24px}
.pager{opacity:.55}

/* лист календаря */
.cal{position:absolute;left:72px;top:150px;width:350px;transform:rotate(-3deg);z-index:3}
.cal .sh{position:absolute;inset:0;border-radius:30px;background:var(--mist)}
.cal .sh.s1{transform:translate(14px,14px) rotate(3deg)}
.cal .sh.s2{transform:translate(26px,26px) rotate(6deg);opacity:.6}
.cal .sheet{position:relative;border-radius:30px;background:var(--white);overflow:hidden;box-shadow:0 30px 50px -30px rgba(0,26,66,.55);border:3px solid var(--navy)}
.cal .top{height:92px;background:var(--navy);color:var(--white);display:grid;place-items:center;font:800 30px/1 var(--heavy);letter-spacing:.16em;text-transform:uppercase;position:relative}
.cal .rings{position:absolute;top:-22px;left:0;right:0;display:flex;justify-content:space-around;padding:0 70px;z-index:2}
.cal .rings span{width:22px;height:52px;border-radius:12px;background:var(--graphite);border:5px solid var(--paper)}
.cal .num{font:700 200px/1 var(--display);color:var(--navy);text-align:center;padding:26px 10px 6px;font-variant-numeric:tabular-nums;white-space:nowrap}
.cal .num.sm{font-size:150px;padding-top:44px;padding-bottom:22px}
.cal .cap{text-align:center;font:600 26px/1.2 var(--body);color:#4A5568;padding:0 20px 28px}
.navy .cal .sh{background:var(--navy-glass)}
.navy .cal .sheet{border-color:var(--white)}
.navy .cal .top{background:var(--ice);color:var(--navy)}

.ptitle{position:absolute;left:480px;top:190px;width:540px;font:700 98px/.92 var(--display);text-transform:uppercase;margin:0}
.peye{position:absolute;left:484px;top:150px;font:800 26px/1 var(--heavy);letter-spacing:.12em;text-transform:uppercase;color:#6B7A90}
.navy .peye{color:var(--ice)}

.pts{position:absolute;left:72px;right:72px;top:650px;display:grid;gap:24px;z-index:3}
.pt{display:flex;gap:26px;align-items:flex-start;font:400 36px/1.33 var(--body);color:var(--graphite)}
.pt::before{content:"";flex:none;width:22px;height:22px;border-radius:6px;background:var(--navy);margin-top:12px;transform:rotate(45deg)}
.pt b{font-weight:600;color:var(--navy)}
.navy .pt{color:var(--white)}
.navy .pt::before{background:var(--ice)}
.navy .pt b{color:var(--ice)}

/* шкала восстановления */
.track{position:absolute;left:72px;right:72px;top:1165px;z-index:2}
.track .line{position:absolute;left:14px;right:14px;top:13px;height:6px;border-radius:3px;background:var(--mist)}
.track .fill{position:absolute;left:14px;top:13px;height:6px;border-radius:3px;background:var(--navy)}
.track .stops{position:relative;display:flex;justify-content:space-between}
.track .st{display:grid;justify-items:center;gap:12px;width:28px;font:600 21px/1 var(--body);color:#8A97AA;white-space:nowrap}
.track .st i{width:32px;height:32px;border-radius:50%;background:var(--white);border:5px solid var(--mist)}
.track .st.done i{border-color:var(--navy);background:var(--navy)}
.track .st.now i{border-color:var(--navy);background:var(--ice);width:40px;height:40px;margin-top:-4px}
.track .st.now{color:var(--navy);font-weight:700}
.track .st:first-child{justify-items:start}.track .st:last-child{justify-items:end}

/* обложка */
.cv .eyebrow{position:absolute;left:72px;top:150px;color:#6B7A90}
.cv .title{position:absolute;left:66px;top:200px;width:960px;font-size:108px;line-height:1.02;color:var(--navy)}
.cv .title .hl{display:inline-block;line-height:1;margin-top:18px;background:var(--navy);color:var(--white);padding:10px 20px 6px;border-radius:14px}
.cv .sub{position:absolute;left:72px;top:650px;width:520px;font:400 36px/1.38 var(--body);color:var(--graphite);margin:0}
.cv .sub b{color:var(--navy);font-weight:600}
.cv .save{position:absolute;left:72px;top:1040px;background:var(--navy);color:var(--white);font-size:26px;padding:20px 30px;white-space:normal;line-height:1.2;width:460px;border-radius:30px;z-index:4}
.cv .save svg{flex:none;width:34px;height:34px}
.cv .cal{left:auto;right:150px;top:600px;width:300px;transform:rotate(6deg);z-index:1}
.cv .cal .num{font-size:170px}
.cv .mascot{right:-90px;bottom:-60px;width:520px;z-index:4}

/* пока нельзя */
.tags{position:absolute;left:72px;right:72px;top:650px;display:flex;flex-wrap:wrap;gap:18px 16px;z-index:3}
.tg{display:flex;flex-direction:column;gap:6px;border:4px solid var(--navy);border-radius:28px;padding:14px 24px;background:var(--white)}
.tg b{font:800 30px/1 var(--heavy);text-transform:uppercase;color:var(--navy);text-decoration:line-through;text-decoration-color:var(--ice);text-decoration-thickness:6px}
.tg span{font:600 24px/1.2 var(--body);color:#4A5568}
.why{position:absolute;left:72px;top:1010px;width:930px;font:400 34px/1.4 var(--body);color:var(--graphite);margin:0}
.why .mark{background:var(--navy);color:var(--white)}

/* никотин */
.nic .big{position:absolute;left:72px;top:690px;width:936px;display:grid;gap:22px}
.nic .big p{margin:0;font:400 37px/1.4 var(--body)}
.nic .big .mark{background:var(--white);color:var(--navy)}
.nic .chips{display:flex;gap:14px;flex-wrap:wrap}
.nic .chips span{border-radius:999px;padding:14px 24px;background:var(--navy-glass);font:800 26px/1 var(--heavy);text-transform:uppercase;color:var(--white)}

/* тревожные признаки */
.flags{position:absolute;left:72px;top:680px;width:936px;background:var(--white);border:3px solid var(--mist);border-radius:44px;padding:34px 40px;display:grid;gap:22px;z-index:2;box-shadow:0 30px 60px -40px rgba(0,26,66,.5)}
.fl{display:flex;gap:24px;align-items:center;font:600 34px/1.25 var(--body);color:var(--graphite)}
.fl .n{flex:none;width:58px;height:58px;border-radius:50%;background:var(--navy);color:var(--white);display:grid;place-items:center;font:700 32px/1 var(--display)}
.flags .hand{color:var(--navy);transform:rotate(-2deg);font-size:52px;margin-top:4px}

/* финал */
.fin .eyebrow{position:absolute;left:72px;top:150px}
.fin .title{position:absolute;left:66px;top:200px;width:940px;font-size:124px}
.fin .txt{position:absolute;left:72px;top:600px;width:560px;font-size:35px;opacity:.95}
.fin .pl{position:absolute;left:72px;display:flex;gap:16px;align-items:center;border-radius:32px;padding:22px 30px;font:800 27px/1.2 var(--heavy);text-transform:uppercase;width:560px;z-index:4}
.fin .pl svg{flex:none;width:38px;height:38px}
.fin .p1{top:910px;background:var(--white);color:var(--navy)}
.fin .p2{top:1060px;background:var(--navy-glass);color:var(--white)}
.fin .mascot{right:-110px;bottom:-40px;width:530px}
.fin .ring{position:absolute;right:-70px;top:600px;width:580px;height:580px;border-radius:50%;background:var(--ice);opacity:.2}
"""

IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>'
BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>'
SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="m10 13 4-4"/></svg>'
STOPS = ["1–3 дня", "7 дней", "14 дней", "1–2 мес", "3–6 мес", "12 мес"]

def track(now):
    w = 936 - 28
    fill = int(14 + w * now / (len(STOPS) - 1))
    st = ''.join(f'<div class="st{" now" if i == now else (" done" if i < now else "")}"><i></i>{s}</div>' for i, s in enumerate(STOPS))
    return f'<div class="track"><div class="line"></div><div class="fill" style="width:{fill - 14}px"></div><div class="stops">{st}</div></div>'

def cal(top, num, cap, sm=False):
    return (f'<div class="cal"><div class="sh s2"></div><div class="sh s1"></div><div class="sheet">'
            f'<div class="top">{top}</div><div class="num{" sm" if sm else ""}">{num}</div><div class="cap">{cap}</div></div>'
            f'<div class="rings"><span></span><span></span></div></div>')

def pts(items):
    return '<div class="pts">' + ''.join(f'<div class="pt"><span>{t}</span></div>' for t in items) + '</div>'

def slide(i, cls, body):
    return (f'<div class="frame"><div class="slide {cls}" id="s{i}"><div class="pager">{i}/{N}</div>{body}'
            f'<div class="nick">{IG}@dr_kudryakov</div></div></div>')

S = []
S.append(slide(1, 'white cv', f'''
  <div class="eyebrow">Календарь по дням</div>
  <h2 class="title">Восстановление после подтяжки <span class="hl">лица</span></h2>
  <p class="sub"><b>Онемение щёк может держаться полгода.</b> Рассказываю, что ещё нормально и когда всё пройдёт</p>
  {cal("день", "1", "из 365")}
  <span class="pill save">{BOOK}Сохраните, чтобы сверяться по дням</span>
  <div class="mascot flip"></div>'''))

S.append(slide(2, 'white', cal("дни", "1–3", "после операции", True) + '''
  <div class="peye">Первые дни</div><h2 class="ptitle">Самые тяжёлые дни</h2>''' + pts([
  "Отёк растёт и сильнее всего на <b>2 или 3 день</b>",
  "Лицо стянуто повязкой, щёки и уши онемевшие",
  "Спите на спине, голова приподнята",
  "Дренажи, если они есть, убирают на 1 или 2 день"]) + track(0)))

S.append(slide(3, 'white', cal("неделя", "1", "дни 4–7") + '''
  <div class="peye">Неделя 1</div><h2 class="ptitle">Лицо кажется чужим</h2>''' + pts([
  "Синяки опускаются на шею. <b>Так и должно быть</b>",
  "Улыбка может быть немного несимметричной из-за отёка",
  "Голову резко не поворачивайте и не наклоняйте",
  "Швы перед ухом снимают <b>с 5 по 7 день</b>"]) + track(1)))

S.append(slide(4, 'white', cal("неделя", "2", "дни 8–14") + '''
  <div class="peye">Неделя 2</div><h2 class="ptitle">Можно к людям</h2>''' + pts([
  "Швы за ухом и в волосах снимают <b>с 10 по 14 день</b>",
  "Синяки почти ушли, остатки скрывает тональный крем",
  "Бандаж носят на ночь столько, сколько скажет хирург",
  "На работу большинство выходят <b>через 2 или 3 недели</b>"]) + track(2)))

S.append(slide(5, 'white', cal("месяц", "1–2", "после операции", True) + '''
  <div class="peye">Первые 2 месяца</div><h2 class="ptitle">Пока нельзя</h2>
  <div class="tags">
    <div class="tg"><b>Спорт</b><span>около 6 недель</span></div>
    <div class="tg"><b>Тяжести</b><span>около 6 недель</span></div>
    <div class="tg"><b>Окрашивание волос</b><span>около 6 недель</span></div>
    <div class="tg"><b>Баня и сауна</b><span>около 2 месяцев</span></div>
    <div class="tg"><b>Солярий</b><span>около 2 месяцев</span></div>
  </div>
  <p class="why">Жара и нагрузка поднимают давление, и <span class="mark">отёк возвращается.</span></p>''' + track(3)))

S.append(slide(6, 'navy nic', cal("без никотина", "4+4", "недели до и после", True) + '''
  <div class="peye">Самое важное</div><h2 class="ptitle">Главный запрет: никотин</h2>
  <div class="big">
    <p>Никотин сужает сосуды. Коже после подтяжки и так не хватает кровотока, поэтому швы заживают хуже, а <span class="mark">участки кожи могут погибнуть.</span></p>
    <p>Обычно бросают за 4 недели до операции и не начинают 4 недели после. Точный срок скажет хирург.</p>
    <div class="chips"><span>Сигареты</span><span>Вейпы</span><span>Айкос</span><span>Пластыри</span></div>
  </div>'''))

S.append(slide(7, 'white', cal("месяцы", "3–12", "после операции", True) + '''
  <div class="peye">Дальше</div><h2 class="ptitle">Онемение и итог</h2>''' + pts([
  "Чувствительность щёк и ушей возвращается постепенно, обычно <b>за 3 или 6 месяцев</b>",
  "Небольшой отёк держится до 3 месяцев, иногда дольше",
  "Швы светлеют и почти не видны к году",
  "Окончательный результат виден <b>через полгода, иногда к году</b>"]) + track(5)))

S.append(slide(8, 'white', cal("в любой день", "!", "звоните сразу") + '''
  <div class="peye">Не ждите приёма</div><h2 class="ptitle">Звоните хирургу, если</h2>
  <div class="flags">
    <div class="fl"><span class="n">1</span>Одна сторона лица быстро опухает и болит</div>
    <div class="fl"><span class="n">2</span>Кожа в одном месте потемнела или посинела</div>
    <div class="fl"><span class="n">3</span>Температура выше 38</div>
    <div class="fl"><span class="n">4</span>Из шва идёт гной</div>
    <div class="fl"><span class="n">5</span>Часть лица перестала двигаться</div>
    <div class="hand">лучше лишний раз позвонить</div>
  </div>'''))

S.append(slide(9, 'navy fin', f'''
  <div class="ring"></div>
  <div class="eyebrow">Итог</div>
  <h2 class="title">Сроки у всех немного разные</h2>
  <p class="txt">Точный план восстановления даст ваш хирург на консультации. А этот календарь поможет понять, что нормально, и не паниковать.</p>
  <span class="pl p1">{BOOK}Сохраните, чтобы сверяться по дням</span>
  <span class="pl p2">{SEND}Отправьте тому, кто планирует подтяжку</span>
  <div class="mascot"></div>'''))

page = f'''<title>Подтяжка лица: восстановление</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
{open(base_css).read()}
{CSS}
</style>
<div class="intro">
  <h1>Восстановление после подтяжки лица</h1>
  <p>9 слайдов в формате «отрывной календарь», 1080 × 1350. Готовые фото для Instagram лежат в проекте, в папке carousels/facelift-recovery/slides/instagram.</p>
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
