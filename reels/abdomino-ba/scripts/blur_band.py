import subprocess, numpy as np, sys, json
src,boxf,out=sys.argv[1:4]
W,H=1080,1920
b={x[0]:x[1:] for x in json.load(open(boxf)) if x[1] is not None}
def box(i):
  for d in (0,-1,1,-2,2,-3,3):
    if i+d in b: return b[i+d]
def boxblur(r,k):
  for _ in range(3):
    c=np.cumsum(np.pad(r,((k+1,k),(0,0),(0,0)),mode='edge'),0); r=(c[2*k+1:]-c[:-2*k-1])/(2*k+1)
    c=np.cumsum(np.pad(r,((0,0),(k+1,k),(0,0)),mode='edge'),1); r=(c[:,2*k+1:]-c[:,:-2*k-1])/(2*k+1)
  return r
dec=subprocess.Popen(['ffmpeg','-v','error','-i',src,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','30','-i','-','-c:v','libx264','-crf','16','-preset','medium','-pix_fmt','yuv420p',out],stdin=subprocess.PIPE)
i=0
while True:
  buf=dec.stdout.read(W*H*3)
  if len(buf)<W*H*3: break
  f=np.frombuffer(buf,np.uint8).reshape(H,W,3).copy()
  bx=box(i) if i<235 else None
  if bx:
    x0,x1,y0,y1=bx; cx,cy=(x0+x1)/2,(y0+y1)/2
    hw=max((x1-x0)/2+70,80); hh=max((y1-y0)/2+60,80)
    X0,X1=int(max(0,cx-hw)),int(min(W,cx+hw)); Y0,Y1=int(max(0,cy-hh)),int(min(H,cy+hh))
    reg=f[Y0:Y1,X0:X1].astype(float); bl=boxblur(reg,int(max(14,max(x1-x0,y1-y0)/7)))
    yy,xx=np.mgrid[Y0:Y1,X0:X1]
    d=np.maximum(abs(xx-cx)/hw,abs(yy-cy)/hh); a=np.clip((1-d)/0.25,0,1)[...,None]
    f[Y0:Y1,X0:X1]=(reg*(1-a)+bl*a).astype(np.uint8)
  enc.stdin.write(f.tobytes()); i+=1
enc.stdin.close(); enc.wait(); print(i,'frames')
