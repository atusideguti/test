// ===== Silhouette figure engine (profile, facing +x). Units: height 1000 (0=crown, 1000=floor)
(function(){
const bump=(y,c,w)=>Math.exp(-((y-c)/w)*((y-c)/w));
const sstep=(a,b,x)=>{let t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
function rot(p,c,a){const s=Math.sin(a),co=Math.cos(a);const dx=p[0]-c[0],dy=p[1]-c[1];return [c[0]+dx*co-dy*s,c[1]+dx*s+dy*co];}

// Body outline: front (top->bottom) then back (bottom->top). tag f/b
const FRONT=[[8,0],[34,14],[44,36],[48,50],[52,58],[47,63],[51,70],[55,77],[61,85],[52,90],[54,95],[50,99],[53,103],[47,110],[46,118],[31,127],[22,139],[24,158],[36,177],[62,204],[102,233],[128,258],[130,276],[118,300],[96,314],[62,322],[52,340],[49,375],[55,418],[59,458],[52,494],[57,522],[63,570],[58,640],[48,700],[51,742],[45,820],[35,898],[29,935],[52,962],[80,984],[97,999],[84,1003],[58,992]];
const BACK=[[22,978],[-6,960],[-13,963],[-12,1003],[-21,1003],[-25,950],[-22,932],[-27,898],[-45,812],[-41,760],[-27,702],[-40,650],[-58,592],[-82,545],[-112,505],[-122,466],[-104,424],[-66,388],[-57,345],[-62,285],[-68,228],[-58,188],[-34,152],[-38,124],[-56,84],[-50,34],[-26,7]];
// Second leg (drawn separately, rotates at hip)
const LEG=[[0,470],[52,494],[57,522],[63,570],[58,640],[48,700],[51,742],[45,820],[35,898],[29,935],[52,962],[80,984],[97,999],[84,1003],[58,992],[22,978],[-6,960],[-13,963],[-12,1003],[-21,1003],[-25,950],[-22,932],[-27,898],[-45,812],[-41,760],[-27,702],[-40,650],[-58,592],[-72,540],[-60,480]];
// Hair curtain (back), inner edge hidden by body
function hairPts(pose){
  const sw=pose.hairSway||0, fl=pose.hairLift||0;
  const pts=[[4,-4],[-30,2],[-58,30],[-66,80],[-68,150],[-74,230],[-84,320],[-88,400],[-92,470],[-94,520],
    [-86,528],[-80,520],[-74,532],[-66,522],[-58,530],[-52,515],[-44,470],[-40,380],[-36,260],[-30,160],[-10,40]];
  return pts.map(p=>{
    const w=sstep(90,520,p[1]);
    let x=p[0]+sw*w*55 - fl*w*90, y=p[1]-fl*w*120;
    return [x,y];
  });
}
// side lock falling in front of the ear down over the shoulder
function lockPts(pose){
  const sw=(pose.hairSway||0)*0.6;
  const pts=[[18,40],[30,70],[22,110],[16,150],[14,200],[16,240],[6,246],[2,200],[0,150],[2,100],[6,60]];
  return pts.map(p=>[p[0]+sw*sstep(100,240,p[1])*20,p[1]]);
}
function dressPts(pose){
  const b=pose.bulge||0, ds=pose.dressSway||0;
  const pts=[[126,258],[133,285],[128,330],[118,380],[112,430],[116+b*14,470],[124+b*30,505],[130+b*34,540],[126+b*24,575],[118,600],
   // hem scallops front->back
   [100,606],[84,598],[68,608],[50,600],[32,610],[14,602],[-4,612],[-22,604],[-40,614],[-58,606],[-76,616],[-94,606],[-112,612],[-126,600],
   [-132,560],[-132,505],[-128,462],[-104,418],[-74,380],[-64,330],[-66,285],[-60,250],[0,238],[60,236]];
  return pts.map(p=>{const w=sstep(430,610,p[1]);return [p[0]+ds*w*26+(Math.sin(p[0]*0.05+ds*3)*w*3),p[1]+Math.abs(ds)*w*-4];});
}
function deform(p,pose){
  let x=p[0],y=p[1];
  const arch=pose.arch||0, bnc=pose.bounce||0, br=pose.breath||0;
  if(p.tag==='b'){x-=arch*bump(y,470,70)*26; x+=arch*bump(y,300,60)*6;}
  if(p.tag==='f'){x+=arch*bump(y,262,45)*14+br*bump(y,262,40)*6; y+=bnc*bump(y,268,40)*10; x-=arch*bump(y,420,40)*6;}
  let q=[x,y];
  const wh=sstep(160,128,y); if(pose.head) q=rot(q,[12,150],pose.head*wh);
  const wu=sstep(470,370,y); if(pose.lean) q=rot(q,[0,440],pose.lean*wu);
  return q;
}
function tagged(arr,t){return arr.map(p=>{const q=[p[0],p[1]];q.tag=t;return q;});}
const BODY=tagged(FRONT,'f').concat(tagged(BACK,'b'));

function smooth(ctx,pts,closed=true){
  const n=pts.length; if(n<3)return;
  ctx.moveTo(pts[0][0],pts[0][1]);
  const last=closed?n:n-1;
  for(let i=0;i<last;i++){
    const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    const a=closed||i>0?p0:p1, d=closed||i<n-2?p3:p2;
    ctx.bezierCurveTo(p1[0]+(p2[0]-a[0])/6,p1[1]+(p2[1]-a[1])/6,p2[0]-(d[0]-p1[0])/6,p2[1]-(d[1]-p1[1])/6,p2[0],p2[1]);
  }
  if(closed)ctx.closePath();
}
// limb polygon along joint chain with widths
function limb(ctx,joints,widths){
  const L=[],R=[];
  for(let i=0;i<joints.length;i++){
    const a=joints[Math.max(0,i-1)],b=joints[Math.min(joints.length-1,i+1)];
    let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    L.push([joints[i][0]-dy*widths[i],joints[i][1]+dx*widths[i]]);
    R.push([joints[i][0]+dy*widths[i],joints[i][1]-dx*widths[i]]);
  }
  smooth(ctx,L.concat(R.reverse()),true);
}
// elegant hand: origin wrist, pointing along angle ang (0 = +y down). local coords then rotated
function hand(ctx,w,ang,s,curl,spread){
  const co=Math.cos(-ang),si=Math.sin(-ang);
  const T=p=>[w[0]+(p[0]*co-p[1]*si)*s,w[1]+(p[0]*si+p[1]*co)*s];
  const fillNow=()=>{ctx.fill();ctx.beginPath();};
  fillNow();
  // palm
  smooth(ctx,[[-15,-6],[15,-6],[22,20],[25,52],[20,70],[0,73],[-19,70],[-24,48],[-22,18]].map(T),true);fillNow();
  const F=[[-17,66,52,5.4,-0.16],[-6,71,64,5.8,-0.05],[6,71,61,5.6,0.05],[17,66,48,5.0,0.16]];
  for(const [x0,y0,len,wd,a0] of F){
    let a=a0*(1+spread*2.2);const pts=[[x0,y0]];const seg=len/3;
    for(let q=0;q<3;q++){a+=curl*(0.45+q*0.3);const p=pts[pts.length-1];pts.push([p[0]+Math.sin(a)*seg,p[1]+Math.cos(a)*seg]);}
    const last=pts[3],pr=pts[2];const dx=last[0]-pr[0],dy=last[1]-pr[1];const l=Math.hypot(dx,dy);
    pts.push([last[0]+dx/l*7,last[1]+dy/l*7]); // pointed nail
    limb(ctx,pts.map(T),[wd*s,wd*0.95*s,wd*0.85*s,wd*0.7*s,0.6*s]);fillNow();
  }
  // thumb
  let a=0.95+spread*0.5;const tp=[[-20,18]];
  for(let q=0;q<2;q++){a-=curl*0.6+0.25;const p=tp[tp.length-1];tp.push([p[0]-Math.sin(a)*22,p[1]+Math.cos(a)*22]);}
  const l2=tp[2],p2=tp[1];const ddx=l2[0]-p2[0],ddy=l2[1]-p2[1],ll=Math.hypot(ddx,ddy);tp.push([l2[0]+ddx/ll*6,l2[1]+ddy/ll*6]);
  limb(ctx,tp.map(T),[9*s,7*s,5.5*s,0.6*s]);fillNow();
}
function arm(ctx,pose){
  const A=pose.arm||{sh:0.15,el:-0.2,wr:0,curl:0.2,spread:0};
  const S=deform(Object.assign([ -12,182],{tag:'x'}),pose);
  const a1=A.sh+(pose.lean||0), a2=a1+A.el;
  const E=[S[0]+Math.sin(a1)*175,S[1]+Math.cos(a1)*175];
  const W=[E[0]+Math.sin(a2)*160,E[1]+Math.cos(a2)*160];
  const M=[(S[0]+E[0])/2+Math.cos(a1)*3,(S[1]+E[1])/2-Math.sin(a1)*3];
  const F=[(E[0]+W[0])/2,(E[1]+W[1])/2];
  limb(ctx,[[S[0]-Math.sin(a1)*10,S[1]-Math.cos(a1)*10],M,E,F,W],[27,22,15,13,9]);ctx.fill();ctx.beginPath();
  hand(ctx,W,a2+(A.wr||0),1.0,A.curl||0,A.spread||0);
}
function legB(ctx,pose){
  const a=pose.legB||0,k=pose.kneeB||0;
  const pts=LEG.map(p=>{let q=[p[0],p[1]];if(p[1]>690)q=rot(q,[8,700],k*sstep(690,720,p[1]));return rot(q,[-8,490],a);});
  smooth(ctx,pts,true);
}
function earring(ctx,pose){
  const top=deform(Object.assign([-6,104],{tag:'x'}),pose);
  const sw=pose.earSwing||0;
  const l=34;const bx=top[0]+Math.sin(sw)*l,by=top[1]+Math.cos(sw)*l;
  ctx.moveTo(top[0],top[1]);ctx.lineTo(bx,by);
  return [top,[bx,by]];
}
function lashes(ctx,pose){
  const p=[[49,64],[57,60],[50,67],[59,64],[49,69]];
  const q=p.map(v=>deform(Object.assign([v[0],v[1]],{tag:'x'}),pose));
  ctx.moveTo(q[0][0],q[0][1]);ctx.lineTo(q[1][0],q[1][1]);ctx.lineTo(q[2][0],q[2][1]);ctx.lineTo(q[3][0],q[3][1]);ctx.lineTo(q[4][0],q[4][1]);ctx.closePath();
}
// Draw full figure into ctx at view {x,y(feet),s,flip}
function drawFigure(ctx,pose,view,color){
  ctx.save();
  ctx.translate(view.x,view.y);ctx.scale(view.s*(view.flip?-1:1),view.s);ctx.rotate(view.rot||0);ctx.translate(0,-1000);
  ctx.fillStyle=color;ctx.strokeStyle=color;
  // dress translucent first
  if(pose.dress!==false){
    ctx.save();ctx.globalAlpha=pose.dressAlpha==null?0.62:pose.dressAlpha;
    ctx.beginPath();smooth(ctx,dressPts(pose).map(p=>deform(Object.assign(p,{tag:'d'}),pose)),true);ctx.fill();
    // lace holes along hem band
    ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=0.6;ctx.beginPath();
    const ds=pose.dressSway||0;
    for(let i=0;i<14;i++){const cx0=-117+i*18;
      const hole=(x,y,r)=>{const q=deform(Object.assign([x+ds*20,y],{tag:'d'}),pose);ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,Math.PI*2);};
      hole(cx0,582,2.6);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;hole(cx0+Math.cos(a)*6,582+Math.sin(a)*6,1.9);}
      for(let k=0;k<5;k++){const a=Math.PI*(0.15+k*0.175);hole(cx0+9+Math.cos(a)*9,596-Math.sin(a)*9+12,1.3);}
      hole(cx0+9,566,1.5);hole(cx0,552,1.2);}
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();smooth(ctx,hairPts(pose).map(p=>deform(Object.assign(p,{tag:'h'}),pose)),true);ctx.fill();
  ctx.beginPath();legB(ctx,pose);ctx.fill();
  ctx.beginPath();smooth(ctx,BODY.map(p=>deform(p,pose)),true);ctx.fill();
  ctx.beginPath();smooth(ctx,lockPts(pose).map(p=>deform(Object.assign(p,{tag:'h'}),pose)),true);ctx.fill();
  ctx.beginPath();lashes(ctx,pose);ctx.fill();
  if(pose.dress!==false){ // bodice opaque over bust + straps
    ctx.beginPath();const bp=[[40,196],[96,222],[128,252],[134,284],[120,312],[60,318],[-62,300],[-66,240],[-40,200]];
    smooth(ctx,bp.map(p=>deform(Object.assign(p,{tag:'f'}),pose)),true);ctx.fill();
  }
  ctx.beginPath();arm(ctx,pose);ctx.fill();
  ctx.lineWidth=2.2;ctx.beginPath();const er=earring(ctx,pose);ctx.stroke();
  ctx.beginPath();ctx.ellipse(er[1][0],er[1][1]+6,4.5,9,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawHandBig(ctx,x,y,s,ang,curl,spread,color){
  ctx.save();ctx.fillStyle=color;ctx.beginPath();
  // forearm from wrist back
  const dx=-Math.sin(ang),dy=-Math.cos(ang);
  limb(ctx,[[x+dx*1400*s,y+dy*1400*s],[x+dx*700*s,y+dy*700*s],[x+dx*120*s,y+dy*120*s],[x,y]],[46*s,40*s,30*s,26*s]);ctx.fill();ctx.beginPath();
  hand(ctx,[x,y],ang,s*1.9,curl,spread);
  ctx.fill();ctx.restore();
}
window.FIG={drawFigure,drawHandBig,smooth};
})();
