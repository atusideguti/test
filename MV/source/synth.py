import numpy as np, soundfile as sf
sr=48000; T=60.0; n=int(sr*T); t=np.arange(n)/sr
rng=np.random.default_rng(7)
def env(a,d,s,r,L):
    pass
out=np.zeros((n,2))
# drone: D2, A2, D3, F3 soft sines with slow beating & tremolo
drone=np.zeros(n)
for f,amp in [(73.42,1.0),(110.0,0.55),(146.83,0.35),(174.61,0.22),(73.8,0.5)]:
    drone+=amp*np.sin(2*np.pi*f*t+rng.uniform(0,6))
drone*= (0.75+0.25*np.sin(2*np.pi*0.11*t))
# fade in 0-5, swell to climax 35-44, lift for title
g=np.interp(t,[0,5,30,35,37.3,44,50,56,59.2,60],[0,0.6,0.7,1.0,1.25,0.8,0.7,0.9,1.0,0.0])
drone*=g
# filtered noise room tone (one-pole lowpass)
wn=rng.standard_normal(n); a=0.995; ln=np.zeros(n)
from scipy.signal import lfilter
ln=lfilter([1-a],[1,-a],wn)*6
room=ln*np.interp(t,[0,3,57,60],[0,1,1,0])
def bell(t0,f0=880,dur=4.0,amp=0.5):
    s=np.zeros(n); i0=int(t0*sr); L=int(dur*sr); tt=np.arange(L)/sr
    tone=np.zeros(L)
    for k,(m,a_) in enumerate([(1,1),(2.76,0.5),(5.4,0.25),(8.93,0.12),(2.0,0.3)]):
        tone+=a_*np.sin(2*np.pi*f0*m*tt)*np.exp(-tt*(1.2+k*0.9))
    L=min(L,n-i0); s[i0:i0+L]=tone[:L]*amp; return s
def boom(t0,amp=1.0):
    s=np.zeros(n); i0=int(t0*sr); L=int(3*sr); tt=np.arange(L)/sr
    f=45+60*np.exp(-tt*8); ph=2*np.cumsum(np.pi*f)/sr
    tone=np.sin(ph)*np.exp(-tt*1.6)
    L=min(L,n-i0); s[i0:i0+L]=tone[:L]*amp; return s
def riser(t0,t1,amp=0.4):
    s=np.zeros(n); i0=int(t0*sr); i1=int(t1*sr)
    seg=rng.standard_normal(i1-i0); tt=np.linspace(0,1,i1-i0)
    b=0.98-0.9*tt**2  # opening filter
    y=np.zeros_like(seg); acc=0
    for i in range(len(seg)):
        acc=b[i]*acc+(1-b[i])*seg[i]; y[i]=acc
    s[i0:i1]=y*(tt**2)*amp*3; return s
def whoosh(t0,dur=1.2,amp=0.3):
    s=np.zeros(n); i0=int(t0*sr); L=int(dur*sr); tt=np.linspace(0,1,L)
    seg=lfilter([0.08],[1,-0.92],rng.standard_normal(L))
    e=np.sin(np.pi*tt)**2
    L=min(L,n-i0); s[i0:i0+L]=(seg*e*amp*4)[:L]; return s
fx=np.zeros(n)
for t0,f0,a_ in [(0.8,1318.5,0.18),(6.17,1174.7,0.35),(17.44,880,0.3),(30.28,1318.5,0.3),(37.26,587.3,0.45),(44.77,1567.9,0.25),(56.0,1174.7,0.35),(59.2,1760,0.2)]:
    fx+=bell(t0,f0,4.5,a_)
fx+=boom(37.26,1.0)+boom(17.44,0.45)
fx+=riser(33.0,37.2,0.5)
for t0 in [5.6,12.8,20.3,29.2,43.7,50.7,55.6]: fx+=whoosh(t0,1.1,0.25)
mono=drone*0.10+room*0.05+fx*0.22
# stereo: bells slight width
L=mono+fx*0.03*np.sin(2*np.pi*0.2*t); R=mono-fx*0.03*np.sin(2*np.pi*0.2*t)
bed=np.stack([L,R],1)
bed/=np.abs(bed).max()+1e-9
sf.write("bed.wav",(bed*0.5).astype(np.float32),sr)
print("ok")
