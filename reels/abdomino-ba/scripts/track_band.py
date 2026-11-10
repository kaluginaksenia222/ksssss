import subprocess, numpy as np, sys, json
W,H=540,960; S=2
src=sys.argv[1]
raw=subprocess.run(['ffmpeg','-v','error','-i',src,'-t','7.6','-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
n=len(raw)//(W*H*3); a=np.frombuffer(raw,np.uint8).reshape(n,H,W,3).astype(int)
boxes=[]
for i in range(n):
  f=a[i,500:,:]  # band only in lower part
  m=(f[...,0]>160)&(f[...,1]>120)&(f[...,2]<100)&(f[...,0]-f[...,2]>90)&(f[...,1]-f[...,2]>60)
  ys,xs=np.nonzero(m)
  if len(xs)>=3:
    cx,cy=np.median(xs),np.median(ys)
    k=(abs(xs-cx)<60)&(abs(ys-cy)<60); xs,ys=xs[k],ys[k]
    boxes.append([i, int(xs.min()*S), int(xs.max()*S), int((ys.min()+500)*S), int((ys.max()+500)*S)])
  else: boxes.append([i,None])
json.dump(boxes,open(sys.argv[2],'w'))
miss=[b[0] for b in boxes if b[1] is None]
print(n,'frames, missing:',len(miss)); 
# print missing ranges
r=[];
for m in miss:
  if r and m==r[-1][1]+1: r[-1][1]=m
  else: r.append([m,m])
print([(x/30,y/30) for x,y in r])
