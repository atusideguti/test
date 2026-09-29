import librosa,numpy as np,subprocess,json,sys,soundfile as sf
U="/root/.claude/uploads/d2f23da7-675a-582d-8a24-3791cd603e21/"
import glob
src={1:glob.glob(U+"*01.*")[0],2:glob.glob(U+"*02.*")[0],4:glob.glob(U+"*04.*")[0]}
FF="ffmpeg"
def load(k):
    y,sr=librosa.load(src[k],sr=48000,mono=False)
    return y,sr
cache={}
def get(k):
    if k not in cache: cache[k]=load(k)
    return cache[k]
def snap(k,t,win=2.5):
    y,sr=get(k); m=y.mean(0) if y.ndim>1 else y
    hop=480; r=librosa.feature.rms(y=m,hop_length=hop)[0]
    a=int(max(0,(t-win))*sr/hop); b=int((t+win)*sr/hop)
    i=a+int(np.argmin(r[a:b])); return i*hop/sr
# (track, start, dur) lists
PLAN={
 "v1":[(1,0,14),(1,226,14),(1,670,8),(4,4,8),(1,916,8),(1,1010,9.3)],
 "v2":[(1,0,12),(1,440,18),(2,364,10),(4,0,10),(1,1010,11)],
}
out={}
for v,segs in PLAN.items():
    parts=[];info=[]
    for (k,s,d) in segs:
        y,sr=get(k)
        s2=snap(k,s) if s>0 else 0.0
        # keep duration; snap start to a quiet point
        ys=y[:,int(s2*sr):int((s2+d)*sr)]
        parts.append(ys); info.append((k,round(s2,2),d))
    # crossfade 0.25s
    cf=int(0.25*48000)
    res=parts[0]
    for p in parts[1:]:
        fo=np.linspace(1,0,cf); fi=1-fo
        mix=res[:,-cf:]*fo+p[:,:cf]*fi
        res=np.concatenate([res[:,:-cf],mix,p[:,cf:]],axis=1)
    print(v,info,res.shape[1]/48000)
    tgt=60*48000
    if res.shape[1]<tgt: res=np.pad(res,((0,0),(0,tgt-res.shape[1])))
    res=res[:,:tgt]
    sf.write(f"{v}_raw.wav",res.T,48000)
