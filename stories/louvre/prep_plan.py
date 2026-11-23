# python3 prep_plan.py <src> <out.png> x0 y0 x1 y1   (crop in source pixels; background -> transparent)
import sys
from PIL import Image
src,out,*box=sys.argv[1:]
c=Image.open(src).convert('RGB').crop(tuple(map(int,box))).convert('RGBA'); px=c.load()
for y in range(c.size[1]):
  for x in range(c.size[0]):
    r,g,b,a=px[x,y]; l=(r+g+b)/3
    px[x,y]=(r,g,b,0 if l>245 else min(255,int((250-l)*255/200)))
c=c.crop(c.getbbox()); c.save(out)
