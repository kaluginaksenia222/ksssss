# Собирает сторис планировок из одного шаблона. Запуск: python3 make_plans.py
plans = [
 ("06","374","Студия","24,43","Только нужные и&nbsp;полезные метры: кухня-ниша, жилая зона 9,7&nbsp;м² и&nbsp;лоджия. Пространство легко организовать под себя."),
 ("07","11","1-комнатная","35,21","Отдельная кухня 12,9&nbsp;м², комната 9,8&nbsp;м² и&nbsp;лоджия. Удобная планировка, где работает каждый метр."),
 ("08","8","1-комнатная","36,04","Отдельная кухня 12,9&nbsp;м², просторная прихожая 7,6&nbsp;м² и&nbsp;лоджия."),
 ("09","817","1-комнатная","47,74","Большая кухня 15,5&nbsp;м², комната 13,7&nbsp;м², лоджия и&nbsp;прихожая 12,6&nbsp;м², где поместится гардероб."),
 ("10","21","2-комнатная","52,01","Две отдельные комнаты, кухня 15,5&nbsp;м² и&nbsp;лоджия. Все комнаты выходят в&nbsp;прихожую."),
 ("11","760","2-комнатная","56,50","Комнаты 15 и&nbsp;11,7&nbsp;м², кухня 14,8&nbsp;м² с&nbsp;лоджией и&nbsp;просторная прихожая."),
 ("12","9","2-комнатная","66,60","Кухня-столовая 18,9&nbsp;м² и&nbsp;две большие комнаты: 16,6 и&nbsp;18,9&nbsp;м². У&nbsp;спальни есть лоджия."),
 ("13","49","3-комнатная","83,80","Три комнаты и&nbsp;кухня-столовая 28,5&nbsp;м² с&nbsp;окнами на&nbsp;две стороны. Есть лоджия."),
 ("14","3","3-комнатная","88,10","Три комнаты, кухня-столовая 28,5&nbsp;м² и&nbsp;большая прихожая 7,8&nbsp;м². Есть лоджия."),
 ("15","748","3-комнатная","94,58","Три комнаты, гардеробная 19,5&nbsp;м², два санузла и&nbsp;кухня 15&nbsp;м² с&nbsp;лоджией."),
]
T = """<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><link rel="stylesheet" href="story.css">
<style>
.plan{{position:absolute;top:250px;left:90px;right:90px;height:1000px;display:flex;align-items:center;justify-content:center}}
.plan img{{max-width:100%;max-height:100%;mix-blend-mode:multiply}}
</style></head><body><div class="story">
  <img class="logo" src="assets/logo-red.png" alt="">
  <div class="plan"><img src="assets/plans/plan-{n}.png" alt=""></div>
  <div class="text" style="top:1300px">
    <span class="eyebrow">Планировка</span>
    <h2 style="font-size:72px">{kind} · {area}&nbsp;м²</h2>
    <p style="margin-top:24px">{desc}</p>
  </div>
</div></body></html>
"""
for num,n,kind,area,desc in plans:
    open(f"story-{num}-plan-{n}.html","w").write(T.format(n=n,kind=kind,area=area,desc=desc))
    print(f"story-{num}-plan-{n}.html")
