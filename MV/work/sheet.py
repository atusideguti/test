import sys,glob,os
from PIL import Image
ver=sys.argv[1]; files=sorted(glob.glob(f"stills_{ver}/t*.png"), key=lambda f: float(os.path.basename(f)[1:-4]))
sel=[f for f in files if float(os.path.basename(f)[1:-4])>=float(sys.argv[2]) and float(os.path.basename(f)[1:-4])<float(sys.argv[3])]
cols=int(sys.argv[4]) if len(sys.argv)>4 else 4
w,h=360,640
rows=(len(sel)+cols-1)//cols
S=Image.new("RGB",(cols*w,rows*h))
for i,f in enumerate(sel):
    im=Image.open(f).convert("RGB").resize((w,h)); S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(f"sheet_{ver}_{sys.argv[2]}.jpg",quality=85); print(len(sel))
