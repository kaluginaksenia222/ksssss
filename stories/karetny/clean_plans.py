# Обрезает планировки по стенам и убирает названия улиц. Запуск: python3 clean_plans.py
from PIL import Image, ImageFilter, ImageDraw
import glob, numpy as np, os
for f in sorted(glob.glob('source/plans/*.jpg')):
    n=os.path.basename(f)[5:-4]
    im=Image.open(f).convert('RGB'); W,H=im.size
    k=W/1414 if W<H else W/2000          # координаты ниже сняты с превью 1414×2000 / 2000×1414
    d=ImageDraw.Draw(im)
    if n=='760': d.rectangle([1245*k,0,W,795*k],fill='white')
    if n in('49','3'):
        x0,y0,x1,y1=1378*k,297*k,728*k,1690*k; off=45*k
        X=lambda y: x0+off+(x1-x0)*(y-y0)/(y1-y0)
        d.polygon([(X(0),0),(W,0),(W,H),(X(H),H)],fill='white')
    g=im.convert('L')
    walls=np.asarray(g.filter(ImageFilter.MaxFilter(21)))<128   # тонкий текст исчезает, толстые стены остаются
    ys,xs=np.where(walls); pad=int(60*k)
    top=12 if n in ('9','21') else pad
    box=(max(xs.min()-pad,0),max(ys.min()-top,0),min(xs.max()+pad,W),min(ys.max()+12,H))  # снизу сразу под стеной: там улица
    im=im.crop(box)
    canvas=Image.new('RGB',(im.width,im.height+pad),'white'); canvas.paste(im,(0,0)); im=canvas
    # всё, что за пределами стен по вертикали (улицы сверху/снизу), уже отрезано
    im.save(f'assets/plans/plan-{n}.png'); print(n,box,im.size)
