// ===== MV renderer: window.renderFrame(frameIndex) draws deterministic frame
(function(){
const W=1920,H=1080,FPS=30;
const C={navy:'#0E1424',slate:'#3A4A6B',gold:'#D9B46A',lace:'#F4EFE8',rouge:'#C8507A',shadow:'#06080e'};
const JP="'Shippori Mincho B1'",EN="'Cinzel'",SC="'Pinyon Script'";
const cv=document.getElementById('c');const X=cv.getContext('2d');
const mk=(w=W,h=H)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const figC=mk(),figX=figC.getContext('2d');
const tmpC=mk(),tmpX=tmpC.getContext('2d');
const tmp2=mk(),tmp2X=tmp2.getContext('2d');
// ---------- math
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const inv=(a,b,v)=>clamp((v-a)/(b-a));
const ss=(a,b,v)=>{const t=inv(a,b,v);return t*t*(3-2*t);};
const eOut=t=>1-Math.pow(1-t,3), eIn=t=>t*t*t, eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const eBack=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);};
function hash(n){n=(n<<13)^n;return (1.0-((n*(n*n*15731+789221)+1376312589)&0x7fffffff)/1073741824.0)*0.5+0.5;}
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
const noise1=(x,seed=0)=>{const i=Math.floor(x),f=x-i;const a=hash(i+seed*977),b=hash(i+1+seed*977);const u=f*f*(3-2*f);return a+(b-a)*u;};
// ---------- precomputed assets
const grains=[];for(let g=0;g<6;g++){const c=mk(480,270),x=c.getContext('2d'),d=x.createImageData(480,270),r=rng(100+g);for(let i=0;i<d.data.length;i+=4){const v=r()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}x.putImageData(d,0,0);grains.push(c);}
// damask tile
const dam=mk(260,360);(function(){const x=dam.getContext('2d');x.strokeStyle=C.gold;x.fillStyle=C.gold;x.lineWidth=2;
  const motif=(cx,cy,s)=>{x.save();x.translate(cx,cy);x.scale(s,s);for(const m of [1,-1]){x.save();x.scale(m,1);x.beginPath();
    x.moveTo(0,-120);x.bezierCurveTo(40,-100,60,-60,30,-30);x.bezierCurveTo(80,-40,95,10,55,30);x.bezierCurveTo(90,50,70,100,20,80);x.bezierCurveTo(30,110,10,130,0,140);x.stroke();
    x.beginPath();x.moveTo(0,-90);x.bezierCurveTo(22,-70,25,-40,8,-20);x.stroke();
    x.beginPath();x.moveTo(8,0);x.bezierCurveTo(40,-5,50,25,20,40);x.bezierCurveTo(35,60,15,70,0,60);x.fill();
    x.beginPath();x.arc(60,-70,6,0,7);x.fill();x.beginPath();x.arc(70,70,5,0,7);x.fill();x.restore();}
    x.beginPath();x.moveTo(0,-140);x.lineTo(0,150);x.stroke();x.restore();};
  motif(130,180,1);motif(0,0,0.5);motif(260,0,0.5);motif(0,360,0.5);motif(260,360,0.5);})();
// lace tile
const lace=mk(200,200);(function(){const x=lace.getContext('2d');x.strokeStyle=C.lace;x.fillStyle=C.lace;x.lineWidth=1.4;
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const cx=50+i*100,cy=50+j*100;x.beginPath();x.arc(cx,cy,34,0,7);x.stroke();
    for(let k=0;k<8;k++){const a=k*Math.PI/4;x.beginPath();x.ellipse(cx+Math.cos(a)*20,cy+Math.sin(a)*20,9,4,a,0,7);x.stroke();}
    x.beginPath();x.arc(cx,cy,6,0,7);x.fill();for(let k=0;k<16;k++){const a=k*Math.PI/8;x.beginPath();x.arc(cx+Math.cos(a)*42,cy+Math.sin(a)*42,2,0,7);x.fill();}}
  x.globalAlpha=.5;for(let k=0;k<200;k+=10){x.beginPath();x.moveTo(k,0);x.lineTo(k,200);x.stroke();}})();
// particles
const dust=[];(function(){const r=rng(42);for(let i=0;i<180;i++)dust.push({x:r()*W,y:r()*H,z:r(),sp:0.2+r()*0.8,ph:r()*6.28,sz:r()});})();
// ---------- helpers
function grad(x,cx,cy,r,stops){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);stops.forEach(s=>g.addColorStop(s[0],s[1]));return g;}
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
function drawDust(x,t,alpha,colorHex=C.gold,count=180,drift=1){
  x.save();x.globalCompositeOperation='lighter';
  for(let i=0;i<count;i++){const d=dust[i];const px=(d.x+Math.sin(t*0.3*d.sp+d.ph)*40+t*8*drift*d.sp)%W;const py=((d.y-t*18*d.sp*drift)%H+H)%H;
    const tw=0.5+0.5*Math.sin(t*2.2*d.sp+d.ph*3);const r=1+d.sz*2.6*(0.6+d.z);
    x.globalAlpha=alpha*tw*(0.35+d.z*0.65);x.fillStyle=grad(x,px,py,r*4,[[0,rgba(colorHex,1)],[0.3,rgba(colorHex,.5)],[1,rgba(colorHex,0)]]);
    x.fillRect(px-r*4,py-r*4,r*8,r*8);}
  x.restore();}
function sparkle(x,px,py,r,a,rotA=0){ // 4-point star like cover
  x.save();x.globalCompositeOperation='lighter';x.globalAlpha=a;x.translate(px,py);x.rotate(rotA);
  x.fillStyle=grad(x,0,0,r*1.2,[[0,'rgba(255,240,200,1)'],[0.15,rgba(C.gold,.8)],[1,rgba(C.gold,0)]]);x.beginPath();x.arc(0,0,r*1.2,0,7);x.fill();
  x.fillStyle='rgba(255,245,220,0.95)';x.beginPath();x.moveTo(0,-r*2.4);x.quadraticCurveTo(r*.12,-r*.12,r*2.4,0);x.quadraticCurveTo(r*.12,r*.12,0,r*2.4);x.quadraticCurveTo(-r*.12,r*.12,-r*2.4,0);x.quadraticCurveTo(-r*.12,-r*.12,0,-r*2.4);x.fill();
  x.restore();}
function grain(x,f,a=0.07){x.save();x.globalCompositeOperation='overlay';x.globalAlpha=a;const g=grains[f%6];const ox=(hash(f)*200)|0,oy=(hash(f+9)*100)|0;x.drawImage(g,-ox,-oy,W*1.25,H*1.25);x.restore();}
function vignette(x,a=0.75){x.save();x.fillStyle=grad(x,W/2,H/2,W*0.72,[[0.45,'rgba(0,0,0,0)'],[1,`rgba(0,0,0,${a})`]]);x.fillRect(0,0,W,H);x.restore();}
function leak(x,t,a,col1=C.gold,col2=C.rouge){x.save();x.globalCompositeOperation='screen';
  const px=W*(0.2+0.6*noise1(t*0.25,3)),py=H*(0.1+0.5*noise1(t*0.2,5));
  x.globalAlpha=a;x.fillStyle=grad(x,px,py,W*0.55,[[0,rgba(col1,.55)],[0.5,rgba(col2,.18)],[1,rgba(col2,0)]]);x.fillRect(0,0,W,H);
  const qx=W*(1-noise1(t*0.18,7)),qy=H*(0.6+0.3*noise1(t*.3,8));x.fillStyle=grad(x,qx,qy,W*0.4,[[0,rgba(col2,.35)],[1,rgba(col2,0)]]);x.fillRect(0,0,W,H);x.restore();}
function flash(x,a,col='#fff'){if(a<=0)return;x.save();x.globalAlpha=clamp(a);x.fillStyle=col;x.fillRect(0,0,W,H);x.restore();}
function wall(x,t,lx,ly,lr,intensity=1,tone=C.slate){
  x.fillStyle=C.navy;x.fillRect(0,0,W,H);
  const fl=0.92+0.08*noise1(t*6,2);
  x.fillStyle=grad(x,lx,ly,lr*fl,[[0,rgba('#e8d2a8',0.55*intensity)],[0.35,rgba(tone,0.85*intensity)],[1,rgba(C.navy,0)]]);x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=0.10*intensity;x.fillStyle=x.createPattern(dam,'repeat');x.fillRect(0,0,W,H);x.restore();
}
// chandelier silhouette with lit candles
function chandelier(x,cx,cy,s,t,alpha,lit){
  x.save();x.globalAlpha=alpha;x.translate(cx,cy);const sw=Math.sin(t*0.7)*0.02;x.rotate(sw);x.scale(s,s);
  x.strokeStyle=C.shadow;x.fillStyle=C.shadow;x.lineWidth=6;
  x.beginPath();x.moveTo(0,-400);x.lineTo(0,40);x.stroke();
  for(const [yy,ry,rx] of [[40,30,300],[150,26,200]]){
    x.beginPath();x.ellipse(0,yy,26,48,0,0,7);x.fill();
    const N=8;for(let k=0;k<N;k++){const a=k/N*Math.PI*2+t*0.15;const ex=Math.cos(a)*rx,ey=yy+Math.sin(a)*ry;if(Math.sin(a)<-0.2&&yy===40)continue;
      x.lineWidth=7;x.beginPath();x.moveTo(0,yy+20);x.bezierCurveTo(ex*0.3,yy+80,ex*0.9,yy+60,ex,ey);x.stroke();
      x.beginPath();x.ellipse(ex,ey,16,7,0,0,7);x.fill();x.fillRect(ex-5,ey-34,10,34);
      // crystal drops
      for(let d=0;d<4;d++){const dy=ey+18+d*16;x.beginPath();x.moveTo(ex,dy);x.lineTo(ex+5,dy+7);x.lineTo(ex,dy+16);x.lineTo(ex-5,dy+7);x.fill();}
      lit&&(k%1===0)&&(x.save(),x.globalCompositeOperation='lighter',x.fillStyle=grad(x,ex,ey-46,70,[[0,rgba('#fff4d6',0.9*lit)],[0.2,rgba(C.gold,0.55*lit)],[1,rgba(C.gold,0)]]),x.fillRect(ex-70,ey-116,140,140),
        x.fillStyle=rgba('#fff8e8',0.95*lit),x.beginPath(),x.ellipse(ex,ey-44+Math.sin(t*9+k)*1.5,4,10,0,0,7),x.fill(),x.restore());
    }
    // swags
    x.lineWidth=2;for(let k=0;k<N;k++){const a1=k/N*Math.PI*2+t*0.15,a2=(k+1)/N*Math.PI*2+t*0.15;x.beginPath();x.moveTo(Math.cos(a1)*rx,yy+Math.sin(a1)*ry);x.quadraticCurveTo(Math.cos((a1+a2)/2)*rx*0.9,yy+80,Math.cos(a2)*rx,yy+Math.sin(a2)*ry);x.stroke();}
  }
  x.beginPath();x.moveTo(0,190);x.lineTo(10,240);x.lineTo(0,300);x.lineTo(-10,240);x.fill();
  x.restore();
}
// ---------- text
function font(fam,size,w=''){return `${w} ${size}px ${fam}`;}
// draw a string char by char; fx(i,n)->{a,dx,dy,s,rot,blur,col}
function chars(x,str,px,py,o,fx){
  const arr=[...str];x.save();x.font=font(o.fam||JP,o.size,o.weight||'800');x.textBaseline='middle';
  const sp=o.spacing||0;
  const widths=arr.map(c=>o.vertical?o.size:x.measureText(c).width);
  const total=o.vertical?arr.length*(o.size+sp):widths.reduce((a,b)=>a+b+sp,0)-sp;
  let cur=o.align==='center'?-total/2:(o.align==='right'?-total:0);
  const out=[];
  arr.forEach((ch,i)=>{
    const e=fx?fx(i,arr.length):{};const a=e.a==null?1:e.a;const w=widths[i];
    let cx,cy;if(o.vertical){cx=px;cy=py+cur+o.size/2;}else{cx=px+cur+w/2;cy=py;}
    out.push([cx,cy,w]);
    cur+=(o.vertical?o.size:w)+sp;
    if(a<=0.001)return;
    x.save();x.globalAlpha=a*(o.alpha==null?1:o.alpha);x.translate(cx+(e.dx||0),cy+(e.dy||0));x.rotate(e.rot||0);const s=e.s==null?1:e.s;x.scale(s,e.sy==null?s:e.sy);
    if(e.blur)x.filter=`blur(${e.blur}px)`;
    let dxv=0,dyv=0;if(o.vertical&&'、。'.includes(ch)){dxv=o.size*0.32;dyv=-o.size*0.32;}
    x.textAlign='center';
    if(o.glow){x.shadowColor=o.glow;x.shadowBlur=o.glowBlur||24;}
    if(o.stroke){x.lineWidth=o.stroke;x.strokeStyle=e.col||o.color;x.strokeText(e.ch||ch,dxv,dyv);}
    else{x.fillStyle=e.col||o.color;x.fillText(e.ch||ch,dxv,dyv);}
    if(e.rgb){x.globalCompositeOperation='lighter';x.shadowBlur=0;x.globalAlpha=a*0.7;x.fillStyle='rgba(255,40,60,0.9)';x.fillText(e.ch||ch,dxv-e.rgb,dyv);x.fillStyle='rgba(40,220,255,0.9)';x.fillText(e.ch||ch,dxv+e.rgb,dyv);}
    x.restore();
  });
  x.restore();return {total,pos:out};
}
// ---------- figure compositing
function figMask(pose,view){figX.clearRect(0,0,W,H);FIG.drawFigure(figX,pose,view,'#000');return figC;}
function tint(src,col,dst=tmpX){dst.save();dst.clearRect(0,0,W,H);dst.globalCompositeOperation='source-over';dst.drawImage(src,0,0);dst.globalCompositeOperation='source-in';dst.fillStyle=col;dst.fillRect(0,0,W,H);dst.restore();return dst.canvas;}
function shadowOnWall(x,pose,view,o={}){
  const m=figMask(pose,view);
  const pen=tint(m,C.shadow);
  x.save();x.globalAlpha=0.35*(o.alpha==null?1:o.alpha);x.filter=`blur(${(o.blur||3)*5}px)`;x.drawImage(pen,o.penX||18,o.penY||0);x.restore();
  x.save();x.globalAlpha=0.93*(o.alpha==null?1:o.alpha);x.filter=`blur(${o.blur||3}px)`;x.drawImage(pen,0,0);x.restore();
}
function rimFigure(x,pose,view,o={}){
  const m=figMask(pose,view);const a=o.alpha==null?1:o.alpha;
  const g=tint(m,o.rim||C.gold);
  x.save();x.globalCompositeOperation='lighter';x.globalAlpha=0.55*a;x.filter='blur(26px)';x.drawImage(g,0,0);x.globalAlpha=0.9*a;x.filter='blur(3px)';x.drawImage(g,0,0);x.restore();
  const b=tint(m,o.fill||'#04050a',tmp2X);
  x.save();x.globalAlpha=a;x.drawImage(b,o.rimDx==null?-5:o.rimDx,o.rimDy==null?2:o.rimDy);x.restore();
}
// warp draw for low angle: strips scaled more at bottom
function warpDraw(x,src,cx,topScale,botScale){
  const hh=4;for(let y0=0;y0<H;y0+=hh){const s=lerp(topScale,botScale,y0/H);x.drawImage(src,0,y0,W,hh,cx-cx*s,y0,W*s,hh);}
}
function zoomBlur(x,amt,cx=W/2,cy=H/2){if(amt<=0.001)return;tmp2X.clearRect(0,0,W,H);tmp2X.drawImage(cv,0,0);x.save();x.globalCompositeOperation='lighter';
  for(let i=1;i<=5;i++){const s=1+amt*i*0.03;x.globalAlpha=0.16*(1-i/7);x.drawImage(tmp2,cx-cx*s,cy-cy*s,W*s,H*s);}x.restore();}
function chroma(x,px){if(px<0.5)return;const d=x.getImageData(0,0,W,H),s=d.data,o=new Uint8ClampedArray(s);const sh=Math.round(px);
  for(let y=0;y<H;y++){const row=y*W*4;for(let xx=0;xx<W;xx++){const i=row+xx*4;const l=row+Math.max(0,xx-sh)*4,r=row+Math.min(W-1,xx+sh)*4;s[i]=o[l];s[i+2]=o[r+2];}}x.putImageData(d,0,0);}
function slices(x,t,amt,seed){if(amt<=0)return;tmp2X.clearRect(0,0,W,H);tmp2X.drawImage(cv,0,0);const r=rng(seed);
  for(let k=0;k<10;k++){const y=r()*H,h=10+r()*60,dx=(r()-0.5)*160*amt;x.drawImage(tmp2,0,y,W,h,dx,y,W,h);}}
function waveform(x,f,x0,x1,yc,amp,a){const wv=window.AUDIO.wav[Math.min(1799,f)];x.save();x.globalCompositeOperation='lighter';x.strokeStyle=rgba(C.gold,a);x.lineWidth=2;x.shadowColor=C.gold;x.shadowBlur=12;
  x.beginPath();const n=wv.length;for(let i=0;i<n;i++){const px=lerp(x0,x1,i/(n-1));const v=wv[i]*amp*(i%2?1:-1);i?x.lineTo(px,yc+v):x.moveTo(px,yc+v);}x.stroke();
  x.globalAlpha=0.5;x.beginPath();for(let i=0;i<n;i++){const px=lerp(x0,x1,i/(n-1));x.moveTo(px,yc-wv[i]*amp*0.5);x.lineTo(px,yc+wv[i]*amp*0.5);}x.stroke();x.restore();}
const rms=f=>window.AUDIO.rms[clamp(f,0,1799)|0]||0;
// pose helpers
function sway(t,amp=1,sp=1){return{arch:0.55+0.45*Math.sin(t*1.1*sp)*amp,lean:-0.03+0.035*Math.sin(t*1.1*sp+0.8)*amp,head:-0.05+0.05*Math.sin(t*0.9*sp+1.6),hairSway:0.35*Math.sin(t*1.1*sp-0.9)*amp,dressSway:0.5*Math.sin(t*1.1*sp-0.6)*amp,
  bounce:Math.sin(t*2.2*sp)*0.5*amp,breath:0.5+0.5*Math.sin(t*1.6),earSwing:0.35*Math.sin(t*1.6*sp-1.2),bulge:0.6};}

// =================== SCENES ===================
const S=[];
// S1 0-6 prologue
S.push([0,6,(x,t,f)=>{
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  const li=ss(0.4,3.2,t);
  wall(x,t,960,260,900,li*0.8);
  chandelier(x,960,250-10*t,0.9+t*0.02,t,ss(0.2,2.5,t),li);
  drawDust(x,t,li*0.8);
  // title small caps typewriter
  const s='THE ISLE OF NO RETURN';const n=Math.floor(inv(1.0,3.2,t)*s.length+0.001);
  const r=chars(x,s.slice(0,n),960,860,{fam:EN,size:44,weight:'700',color:C.lace,spacing:10,align:'center',glow:rgba(C.gold,.6)},null);
  if(t>1&&t<5.6&&(Math.floor(t*3)%2===0||n<s.length)){const lastx=960+r.total/2+14;x.fillStyle=C.gold;x.fillRect(lastx,836,4,48);}
  x.save();x.strokeStyle=rgba(C.gold,0.7*ss(2.8,3.8,t));x.lineWidth=1.5;const lw=380*eOut(inv(2.8,3.8,t));x.beginPath();x.moveTo(960-lw,912);x.lineTo(960+lw,912);x.stroke();x.restore();
  chars(x,'離れ小島',1700,250,{size:84,color:C.lace,vertical:true,spacing:14,glow:rgba(C.gold,.5)},(i)=>{const p=eOut(inv(2.0+i*0.18,2.7+i*0.18,t));return{a:p,dy:(1-p)*70};});
  const out=ss(5.4,6.0,t);flash(x,out,'#000');
}]);
// S2 6-13 entrance: heels & hem sliding on wall
S.push([6,13,(x,t,f)=>{
  const lt=t-6;wall(x,t,1100,700,1300,1);
  drawDust(x,t,0.35);
  const enter=eOut(inv(0,1.3,lt));
  const pan=eIO(inv(1.0,7,lt));
  const view={x:lerp(2600,1180,enter),y:lerp(1040,2260,pan),s:3.2,flip:true};
  const walk=(1-ss(1.0,1.6,lt));
  const p=Object.assign(sway(t,0.5+0.5*pan,0.9),{legB:Math.sin(lt*7)*0.22*walk,kneeB:Math.max(0,Math.sin(lt*7))*0.25*walk,dressSway:0.5*Math.sin(t*1.2)+walk*0.8*Math.sin(lt*7)});
  p.arm={sh:0.12,el:-0.1,wr:0.1,curl:0.3,spread:0.1};
  shadowOnWall(x,p,view,{blur:2+walk*3,penX:26});
  leak(x,t,0.35);
  // text: 見下ろされる悦び
  const t0=6.17;const punch=1+0.14*Math.exp(-(t-t0-0.35)*6)*(t>t0+0.35?1:0);
  x.save();x.translate(560,540);x.scale(punch,punch);
  chars(x,'見下ろされる悦び',0,0,{size:96,color:C.lace,spacing:6,align:'center',glow:rgba(C.gold,.55),glowBlur:30},(i,n)=>{const p=eOut(inv(t0+i*0.07,t0+0.5+i*0.07,t));return{a:p*(1-ss(12.5,12.95,t)),blur:(1-p)*18,dy:(1-p)*-20};});
  x.restore();
  
  const b=1-ss(6.0,6.5,t);flash(x,b,'#000');
}]);
// S3 13-20.5 lace curtain sway + 躾
S.push([13,20.5,(x,t,f)=>{
  const lt=t-13;wall(x,t,960,420,1100,0.95);
  // big background typo
  x.save();x.font=font(EN,330,'700');x.textBaseline='middle';x.lineWidth=2;x.strokeStyle=rgba(C.gold,0.28);
  const off=(lt*90)%1900;for(let k=-1;k<3;k++){x.strokeText('OJOUSAMA',-off+k*1900,300);}
  x.strokeStyle=rgba(C.gold,0.16);const off2=(lt*60)%1900;for(let k=-1;k<3;k++){x.strokeText('OJOUSAMA',off2+k*1900-1900,780);}x.restore();
  const view={x:980+Math.sin(lt*0.4)*20,y:1790-lt*12,s:2.05,flip:false};
  const p=sway(t,1.35,1.0);p.arm={sh:-0.6,el:0.8,wr:0.2,curl:0.35,spread:0.1};
  shadowOnWall(x,p,view,{blur:2.5,penX:-22});
  // lace curtain overlay waving
  x.save();x.globalAlpha=0.16;x.translate(Math.sin(lt*0.8)*30,0);x.fillStyle=x.createPattern(lace,'repeat');x.fillRect(-60,0,W+120,H);x.restore();
  x.save();x.globalAlpha=0.22;const cg=x.createLinearGradient(0,0,W,0);for(let k=0;k<=12;k++){cg.addColorStop(k/12,k%2?'rgba(244,239,232,0.35)':'rgba(244,239,232,0.05)');}x.fillStyle=cg;x.fillRect(0,0,W,H);x.restore();
  leak(x,t,0.45);
  drawDust(x,t,0.5);
  // 躾 punch at 17.44
  const t0=17.44;if(t>t0-0.1){const k=t-t0;const pin=eOut(inv(-0.1,0.12,k));const sc=lerp(2.4,1,pin)+0.08*Math.exp(-k*5)*Math.sin(k*30);
    const rg=k<0.35?(0.35-k)*40:0;
    chars(x,'躾',960,500,{size:430,color:C.lace,align:'center',glow:rgba(C.gold,.8),glowBlur:60},()=>({a:pin*(1-ss(20.1,20.5,t)),s:sc,rgb:rg}));
    
    flash(x,0.55*Math.exp(-Math.max(0,k)*9)*(k>0?1:0),'#fff');
  }
  flash(x,1-ss(13.0,13.4,t),'#000');
}]);
// S4 20.5-29.5 hand shadow + scramble words
const POOL='服従平伏隷属躾跪影巨躯主令嬢化物蜜艶檻鎖支配所有夜孤';
function scramble(x,word,px,py,size,tIn,tRes,tOut,t,seed,o={}){
  const n=[...word].length;
  return chars(x,word,px,py,Object.assign({size,color:C.lace,spacing:10,glow:rgba(C.gold,.5)},o),(i)=>{
    const tr=tRes+i*0.08;const a=ss(tIn,tIn+0.15,t)*(1-ss(tOut-0.12,tOut,t));
    if(t<tr){const ch=[...POOL][Math.floor(hash(Math.floor(t*15)*31+i*7+seed)*POOL.length)];return{a:a*0.85,ch,col:C.gold,rgb:6,dx:(hash(Math.floor(t*30)+i)-0.5)*10};}
    const k=t-tr;return{a,s:1+0.18*Math.exp(-k*10),rgb:k<0.15?8:0};});
}
S.push([20.5,29.5,(x,t,f)=>{
  const lt=t-20.5;wall(x,t,1250,380,1200,0.9);
  drawDust(x,t,0.4);
  // hand reaching from top-right, closing
  const reach=eOut(inv(0,2.5,lt));const close=ss(4.5,8.6,lt);
  const hx=lerp(2100,1330,reach)+Math.sin(lt*0.7)*16,hy=lerp(-200,470,reach);
  const ang=lerp(0.95,0.75,close);
  tmpX.clearRect(0,0,W,H);
  figX.clearRect(0,0,W,H);FIG.drawHandBig(figX,hx,hy,1.35,ang,lerp(0.05,1.25,close),lerp(0.45,0.05,close),'#000');
  const pen=tint(figC,C.shadow);
  x.save();x.globalAlpha=0.35;x.filter='blur(18px)';x.drawImage(pen,30,14);x.restore();
  x.save();x.globalAlpha=0.94;x.filter='blur(2.5px)';x.drawImage(pen,0,0);x.restore();
  leak(x,t,0.3);
  // words
  scramble(x,'服従',420,470,170,20.6,21.0,22.36,t,1);
  scramble(x,'平伏',420,470,170,22.36,22.5,25.19,t,2);
  scramble(x,'隷属',420,470,170,25.19,25.35,26.75,t,3);
  chars(x,'ひれ伏すのが、礼儀。',140,760,{size:72,color:C.lace,spacing:4,glow:rgba(C.gold,.5)},(i)=>{const p=eBack(inv(26.8+i*0.06,27.2+i*0.06,t));return{a:clamp(p)*(1-ss(29.1,29.5,t)),rot:(1-clamp(p))*-0.8,s:0.6+0.4*p};});
  // glitch at switches
  for(const tg of [22.36,25.19,26.75]){const k=Math.abs(t-tg);if(k<0.12){slices(x,t,1-k/0.12,Math.floor(t*30));}}
}]);
// S5 29.5-35 name card
S.push([29.5,35,(x,t,f)=>{
  const lt=t-29.5;x.fillStyle=C.navy;x.fillRect(0,0,W,H);
  x.fillStyle=grad(x,1420,420,900,[[0,rgba(C.slate,0.9)],[0.6,rgba(C.navy,0.9)],[1,rgba('#000',1)]]);x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=0.07;x.fillStyle=x.createPattern(dam,'repeat');x.fillRect(0,0,W,H);x.restore();
  drawDust(x,t,0.55);
  // close-up profile facing left, hair lift
  const lift=ss(0.3,2.6,lt)-ss(4.2,5.4,lt)*0.6;
  const p=sway(t,0.5,0.8);p.hairLift=0.35*lift;p.head=-0.12-0.06*lift;
  p.arm={sh:lerp(0.2,2.85,eIO(lift)),el:lerp(-0.2,1.55,eIO(lift)),wr:0.5,curl:0.45,spread:0.2};
  const view={x:1480-lt*6,y:3180,s:3.0,flip:true};
  rimFigure(x,p,view,{rimDx:6,rimDy:2});
  leak(x,t,0.35);
  // card
  const fr=eOut(inv(0.1,0.9,lt));x.save();x.strokeStyle=rgba(C.gold,0.9);x.lineWidth=2;
  const L=140,T=250,R=900,B=860;x.beginPath();x.moveTo(L,T);x.lineTo(lerp(L,R,fr),T);x.moveTo(R,B);x.lineTo(lerp(R,L,fr),B);x.moveTo(L,B);x.lineTo(L,lerp(B,T,fr));x.moveTo(R,T);x.lineTo(R,lerp(T,B,fr));x.stroke();
  x.globalAlpha=fr;x.lineWidth=1;x.strokeRect(L+12,T+12,R-L-24,B-T-24);
  for(const [cx,cy] of [[L,T],[R,T],[L,B],[R,B]]){x.fillStyle=C.gold;x.beginPath();x.moveTo(cx,cy-10);x.lineTo(cx+10,cy);x.lineTo(cx,cy+10);x.lineTo(cx-10,cy);x.fill();}
  x.restore();
  
  // name mask reveal at 30.28
  const mr=eIO(inv(30.28,30.9,t));x.save();x.beginPath();x.rect(170,330,720*mr,160);x.clip();
  chars(x,'杉並家令嬢',190,410,{size:118,color:C.lace,spacing:6,glow:rgba(C.gold,.5)});x.restore();
  if(mr>0&&mr<1){x.fillStyle=C.gold;x.fillRect(170+720*mr,340,5,140);}
  chars(x,'CV 山田じぇみ子',192,510,{fam:JP,size:38,weight:'500',color:C.gold,spacing:4},(i)=>({a:ss(30.8+i*0.03,31.1+i*0.03,t)}));
  const s3='離れ小島の化け物お嬢様';const tn=Math.floor(inv(31.3,32.2,t)*s3.length+0.001);
  chars(x,s3.slice(0,tn),192,600,{size:54,color:C.rouge,spacing:3,glow:rgba(C.rouge,.6)});
  const tags=['#二メートルの巨躯','#絶対的な主人','#ふたなり'];let tx=192;
  tags.forEach((tg,k)=>{const p=eBack(inv(32.0+k*0.4,32.35+k*0.4,t));x.save();x.font=font(JP,32,'800');const w=x.measureText(tg).width+36;
    x.globalAlpha=clamp(p);x.translate(tx+w/2,720);x.scale(clamp(p,0,1.2),clamp(p,0,1.2));x.strokeStyle=C.gold;x.lineWidth=1.5;x.strokeRect(-w/2,-28,w,56);x.fillStyle=rgba(C.gold,0.12);x.fillRect(-w/2,-28,w,56);
    x.fillStyle=C.lace;x.textAlign='center';x.textBaseline='middle';x.fillText(tg,0,2);x.restore();tx+=w+16;});
  const out=ss(34.7,35,t);flash(x,out*0.9,'#000');
  flash(x,1-ss(29.5,29.8,t),'#000');
}]);
// S6 35-44 climax: towering 2M
S.push([35,44,(x,t,f)=>{
  const lt=t-35,T0=37.26,k=t-T0;
  x.fillStyle='#02030a';x.fillRect(0,0,W,H);
  const hb=Math.pow(Math.max(0,Math.sin(t*Math.PI*1.3)),16);
  const reveal=ss(T0-0.05,T0+0.1,t);
  const moon=grad(x,1060,380,lerp(500,1100,reveal),[[0,rgba('#fff4dc',lerp(0.12+hb*0.1,0.85,reveal))],[0.25,rgba(C.gold,lerp(0.08,0.45,reveal))],[0.6,rgba(C.slate,lerp(0.05,0.5,reveal))],[1,rgba('#02030a',0)]]);
  x.fillStyle=moon;x.fillRect(0,0,W,H);
  chandelier(x,1060,-80,1.1,t,0.5+0.5*reveal,reveal);
  // 2M giant background
  if(k>0){const p=eOut(inv(0,0.5,k));x.save();x.globalAlpha=p*(1-ss(43.5,44,t));x.font=font(EN,1180,'700');x.textAlign='center';x.textBaseline='middle';
    x.lineWidth=5;x.strokeStyle=rgba(C.gold,0.55);x.translate(980,560);x.scale(lerp(1.4,1,p)+k*0.01,lerp(1.4,1,p)+k*0.01);x.strokeText('2M',0,0);x.globalAlpha*=0.12;x.fillStyle=C.gold;x.fillText('2M',0,0);x.restore();}
  drawDust(x,t,0.3+0.6*reveal,C.gold,180,1+2*reveal);
  // figure: pre-reveal rising from below; after reveal towering
  const rise=eOut(inv(35,T0,t));
  const p=sway(t,0.8,0.8);p.bulge=0.9;p.arm={sh:-0.6+0.05*Math.sin(t),el:0.8,wr:0.2,curl:0.35,spread:0.1};
  const view={x:1060,y:lerp(2300,1150,reveal>0?1:rise*0.4)+(reveal>0?-k*6:0),s:1.12,flip:true};
  figX.clearRect(0,0,W,H);FIG.drawFigure(figX,p,view,'#000');
  tmp2X.clearRect(0,0,W,H);warpDraw(tmp2X,figC,1060,0.86,1.22);
  const g=tint(tmp2,C.gold);
  x.save();x.globalCompositeOperation='lighter';x.globalAlpha=0.5;x.filter='blur(30px)';x.drawImage(g,0,0);x.globalAlpha=0.8;x.filter='blur(3px)';x.drawImage(g,0,0);x.restore();
  const bl=tint(tmp2,'#030409',tmpX);x.drawImage(bl,4,1);
  // 巨躯 punch
  const K=38.5;if(t>K-0.08){const kk=t-K;const pin=eOut(inv(-0.08,0.1,kk));
    chars(x,'巨躯',150,820,{size:250,color:C.lace,spacing:0,glow:rgba(C.gold,.9),glowBlur:50},(i)=>({a:pin*(1-ss(43.5,44,t)),s:lerp(2.2,1,pin)+0.1*Math.exp(-kk*6)*Math.sin(kk*28),rgb:kk<0.3?(0.3-kk)*50:0,dy:0}));
    }
  // shake / flash / zoom blur
  if(k>0&&k<0.7){const a=(0.7-k)*26;x.save();tmpX.clearRect(0,0,W,H);tmpX.drawImage(cv,0,0);x.clearRect(0,0,W,H);x.drawImage(tmpC,(hash(f*3)-0.5)*a,(hash(f*5)-0.5)*a);x.restore();}
  zoomBlur(x,k>0?Math.max(0,1-k*1.6)*1.4:0,1060,420);
  flash(x,k>0?Math.exp(-k*5):0,'#fff');
  if(t>42.9){for(let i=0;i<14;i++){const r=rng(i*13+5);const st=42.95+r()*0.6;const a=Math.sin(clamp((t-st)/0.9)*Math.PI);if(a>0)sparkle(x,200+r()*1520,120+r()*800,6+r()*14,a*0.9,t*0.5);}}
  flash(x,1-ss(35,35.4,t),'#000');
}]);
// S7 44-51 crack reveal
function crackGeo(seed){const r=rng(seed);const pts=[[0,0.5]];let y=0.5;for(let i=1;i<=14;i++){y=clamp(y+(r()-0.5)*0.7,0.05,0.95);pts.push([i/14,y]);}
  const br=[];for(let b=0;b<5;b++){const i=1+Math.floor(r()*12);const p=pts[i];const d=r()<.5?-1:1;br.push([p,[p[0]+(r()-0.5)*0.08,p[1]+d*(0.25+r()*0.3)],[p[0]+(r()-0.5)*0.12,p[1]+d*(0.5+r()*0.4)]]);}return{pts,br};}
const CRK=crackGeo(77);
S.push([44,51,(x,t,f)=>{
  const lt=t-44;x.fillStyle=C.navy;x.fillRect(0,0,W,H);
  x.fillStyle=grad(x,520,420,1100,[[0,rgba('#f1c7d4',0.55)],[0.35,rgba(C.rouge,0.55)],[0.75,rgba(C.navy,0.9)],[1,'#05060c']]);x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=0.09;x.fillStyle=x.createPattern(dam,'repeat');x.fillRect(0,0,W,H);x.restore();
  drawDust(x,t,0.45,'#f7d7e0');
  const trace=eIO(inv(44.3,50.3,t));
  const p=sway(t,1.25,1.05);p.bulge=1.0;
  p.arm={sh:lerp(0.5,0.25,trace),el:lerp(2.1,-0.03,trace),wr:lerp(-1.1,0.3,trace),curl:0.3,spread:0.15};
  const view={x:560,y:1045,s:0.97,flip:false};
  shadowOnWall(x,p,view,{blur:2,penX:-30,penY:6});
  leak(x,t,0.4,C.rouge,C.gold);
  // text 1 with crack
  const box={x:1000,y:430,w:820,h:130};
  const shatter=46.6;
  if(t<shatter+0.9){
    tmpX.clearRect(0,0,W,H);
    chars(tmpX,'気高く、傲慢な主。',box.x,box.y+box.h/2,{size:92,color:C.lace,spacing:2,glow:rgba(C.gold,.5)},(i)=>{const p=eOut(inv(44.0+i*0.05,44.4+i*0.05,t));return{a:p,dy:(1-p)*30,blur:(1-p)*10};});
    const cp=eOut(inv(44.77,46.4,t));
    if(cp>0){tmpX.save();tmpX.lineCap='round';
      const draw=(pts,w,col)=>{tmpX.strokeStyle=col;tmpX.lineWidth=w;tmpX.beginPath();const n=pts.length;const upto=cp*(n-1);for(let i=0;i<n;i++){if(i>upto+1)break;let pp=pts[i];if(i>upto){const a=pts[i-1];const u=upto-(i-1);pp=[lerp(a[0],pp[0],u),lerp(a[1],pp[1],u)];}const X_=box.x+pp[0]*box.w,Y_=box.y+pp[1]*box.h;i?tmpX.lineTo(X_,Y_):tmpX.moveTo(X_,Y_);}tmpX.stroke();};
      tmpX.globalCompositeOperation='destination-out';draw(CRK.pts,7,'#000');CRK.br.forEach(b=>draw(b,4,'#000'));
      tmpX.globalCompositeOperation='source-over';draw(CRK.pts,1.5,rgba(C.rouge,0.9));tmpX.restore();}
    if(t<shatter){x.drawImage(tmpC,0,0);}
    else{const k=t-shatter;const N=9;for(let s_=0;s_<N;s_++){const r=rng(s_*17+3);const x0=box.x+box.w*s_/N-20,x1=box.x+box.w*(s_+1)/N+20;
      x.save();x.beginPath();x.moveTo(x0,box.y-40);x.lineTo(x1,box.y-40+r()*20);x.lineTo(x1+(r()-0.5)*30,box.y+box.h+40);x.lineTo(x0+(r()-0.5)*30,box.y+box.h+40);x.closePath();x.clip();
      const cx=(x0+x1)/2,cy=box.y+box.h/2;x.translate(cx+(r()-0.5)*200*k,cy+k*k*900*(0.5+r()));x.rotate((r()-0.5)*3*k);x.translate(-cx,-cy);x.globalAlpha=clamp(1-k*1.2);x.drawImage(tmpC,0,0);x.restore();}
      flash(x,0.5*Math.exp(-k*10),'#fff');}
  }
  // text 2 flips in
  const fl=inv(47.0,47.6,t);
  if(fl>0){chars(x,'受け止めてくれる誰かを、',1000,470,{size:64,color:C.lace,spacing:2,glow:rgba(C.rouge,.7),glowBlur:30},(i)=>{const p=eOut(inv(47.0+i*0.04,47.5+i*0.04,t));return{a:p*(1-ss(50.6,51,t)),sy:Math.cos((1-p)*Math.PI*0.5)};});
    chars(x,'待っていた。',1000,570,{size:92,color:C.rouge,spacing:6,glow:rgba(C.rouge,.8),glowBlur:40},(i)=>{const p=eOut(inv(47.7+i*0.07,48.2+i*0.07,t));return{a:p*(1-ss(50.6,51,t)),sy:Math.cos((1-p)*Math.PI*0.5),s:1};});
    }
  flash(x,1-ss(44,44.3,t),'#000');
}]);
// S8 51-56 window & sea
S.push([51,56,(x,t,f)=>{
  const lt=t-51;x.fillStyle='#04060c';x.fillRect(0,0,W,H);
  // window region
  const wx=560,wy=110,ww=600,wh=880;
  x.save();x.beginPath();x.moveTo(wx,wy+ww/2);x.arc(wx+ww/2,wy+ww/2,ww/2,Math.PI,0);x.lineTo(wx+ww,wy+wh);x.lineTo(wx,wy+wh);x.closePath();x.clip();
  const sky=x.createLinearGradient(0,wy,0,wy+wh);sky.addColorStop(0,'#0b1330');sky.addColorStop(0.55,C.slate);sky.addColorStop(0.56,'#1a2440');sky.addColorStop(1,'#060912');x.fillStyle=sky;x.fillRect(wx,wy,ww,wh);
  x.fillStyle=grad(x,wx+ww*0.62,wy+260,260,[[0,'rgba(255,250,235,1)'],[0.12,'rgba(255,245,220,0.9)'],[0.14,rgba(C.gold,0.35)],[1,rgba(C.gold,0)]]);x.fillRect(wx,wy,ww,wh);
  const hz=wy+wh*0.555;x.strokeStyle=rgba('#dfe8ff',0.5);x.lineWidth=1.5;
  for(let i=0;i<22;i++){const yy=hz+8+i*i*0.9;x.globalAlpha=0.25+0.6*(1-i/22);x.beginPath();for(let xx=wx;xx<=wx+ww;xx+=12){const yv=yy+Math.sin(xx*0.02+t*1.5+i)*2*(1+i*0.2);xx===wx?x.moveTo(xx,yv):x.lineTo(xx,yv);}x.stroke();}
  x.globalAlpha=1;for(let i=0;i<40;i++){const r=rng(i+900);const gx=wx+ww*0.62+(r()-0.5)*(60+i*6),gy=hz+10+r()*300;const a=0.5+0.5*Math.sin(t*4+i);x.fillStyle=rgba('#fff5dd',a*0.8);x.fillRect(gx,gy,8+r()*14,1.6);}
  x.restore();
  // frame
  x.save();x.strokeStyle='#020308';x.lineWidth=22;x.beginPath();x.moveTo(wx,wy+ww/2);x.arc(wx+ww/2,wy+ww/2,ww/2,Math.PI,0);x.lineTo(wx+ww,wy+wh);x.lineTo(wx,wy+wh);x.closePath();x.stroke();
  x.lineWidth=10;x.beginPath();x.moveTo(wx+ww/2,wy);x.lineTo(wx+ww/2,wy+wh);x.moveTo(wx,wy+ww/2+120);x.lineTo(wx+ww,wy+ww/2+120);x.moveTo(wx,wy+ww/2+420);x.lineTo(wx+ww,wy+ww/2+420);x.stroke();x.restore();
  // room glow
  x.fillStyle=grad(x,wx+ww/2,wy+wh/2,1000,[[0,rgba(C.slate,0.25)],[1,'rgba(0,0,0,0)']]);x.fillRect(0,0,W,H);
  drawDust(x,t,0.35,'#dfe8ff',120,0.6);
  const p=sway(t,0.7,0.8);p.bulge=0.7;p.arm={sh:-0.6,el:0.8,wr:0.2,curl:0.35,spread:0.1};
  rimFigure(x,p,{x:1470-lt*10,y:1060,s:0.9,flip:true},{rim:'#cfd8f0',rimDx:5});
  // vertical text left, typewriter
  const s='迎えの船は、一年来ない。';const n=[...s].length;const k=inv(51.5,53.0,t)*n;
  chars(x,s,250,140,{size:62,color:C.lace,vertical:true,spacing:6,glow:rgba(C.gold,.5)},(i)=>({a:clamp(k-i)*(1-ss(55.6,56,t))}));
  
  waveform(x,f,620,1700,955,40,0.75*ss(51,51.6,t)*(1-ss(55.5,56,t)));
  flash(x,1-ss(51,51.3,t),'#000');
}]);
// S9 56-60 title
S.push([56,60.1,(x,t,f)=>{
  const lt=t-56;x.fillStyle=C.navy;x.fillRect(0,0,W,H);
  x.fillStyle=grad(x,1440,300,1000,[[0,rgba('#fff0d0',0.55)],[0.2,rgba(C.gold,0.35)],[0.55,rgba(C.slate,0.6)],[1,'#03040a']]);x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=0.1;x.fillStyle=x.createPattern(dam,'repeat');x.fillRect(0,0,W,H);x.restore();
  chandelier(x,1440,-160,0.8,t,0.8,1);
  drawDust(x,t,0.8);
  const p=sway(t,0.9,0.9);p.head=-0.14;p.bulge=0.8;p.arm={sh:-0.6+0.04*Math.sin(t*1.3),el:0.8,wr:0.2,curl:0.35,spread:0.1};
  rimFigure(x,p,{x:1520,y:1085,s:1.0,flip:true},{rimDx:6});
  leak(x,t,0.4);
  const fx=(t0,st)=>(i)=>{const p=eBack(inv(t0+i*st,t0+0.4+i*st,t));return{a:clamp(p*1.4),rot:(1-clamp(p))*-1.4,s:lerp(1.8,1,clamp(p)),blur:(1-clamp(p))*6};};
  chars(x,'デカふたなりのお嬢様は',140,400,{size:86,color:C.lace,spacing:2,glow:rgba(C.gold,.6),glowBlur:26},fx(56.0,0.05));
  chars(x,'オナホ執事を離さない',140,560,{size:112,color:C.lace,spacing:2,glow:rgba(C.rouge,.8),glowBlur:36},fx(56.55,0.06));
  chars(x,'Deka Hutanari no Ojousama ha Onaho Shitsuji wo Hanasanai.',150,672,{fam:SC,size:44,weight:'400',color:C.gold},(i)=>({a:ss(57.3+i*0.012,57.6+i*0.012,t)}));
  chars(x,'CV 山田じぇみ子',150,808,{size:40,weight:'500',color:C.lace,spacing:4},(i)=>({a:ss(57.6+i*0.03,57.9+i*0.03,t)}));
  x.save();x.strokeStyle=rgba(C.gold,0.8);x.lineWidth=1.5;const lw=eOut(inv(57.4,58.2,t))*900;x.beginPath();x.moveTo(150,752);x.lineTo(150+lw,752);x.stroke();x.restore();
  const fl=Math.exp(-Math.max(0,t-59.2)*4)*(t>59.2?1:0);if(fl>0){sparkle(x,150+lw,752,22,fl,t);flash(x,fl*0.25,'#fff2d6');}
  flash(x,1-ss(56,56.25,t),'#fff');
  flash(x,ss(59.2,60.0,t),'#000');
}]);

function render(f,opt={}){
  const t=f/FPS;X.save();X.clearRect(0,0,W,H);X.filter='none';
  let sc=S.find(s=>t>=s[0]&&t<s[1])||S[S.length-1];
  sc[2](X,t,f);
  X.restore();
  // global look
  if(opt.noPost)return;
  vignette(X,0.7);grain(X,f,0.075);
  // global chromatic at key hits
  let ch=0;for(const tg of [17.44,22.36,25.19,37.26,46.6]){const k=t-tg;if(k>=0&&k<0.25)ch=Math.max(ch,(0.25-k)*40);}if(ch>0.5)chroma(X,ch);
}
window.renderFrame=render;window.S=S;window._helpers={chars,rimFigure,shadowOnWall,flash,sparkle,drawDust,leak,vignette,grain,chandelier,wall,C,JP,EN,SC,sway,warpDraw,tint,figMask};
})();
