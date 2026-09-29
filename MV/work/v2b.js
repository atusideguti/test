// ===== V2 離島の神秘 (v3) =====
const Q = { navy: '#0A1020', silver: '#C9D3E6', gold: '#C8A96A', teal: '#1F3A4D', wine: '#6B1E2E', moonc: '#dfe8ff' };
const FM2 = 'Shippori Mincho B1';
const rev = (t, t0, d = .7, per = .09, blur = 16, ls0 = 0) => (i) => { const a = E.out3(seg(t, t0 + i * per, t0 + i * per + d)); return { a, blur: (1 - a) * blur, dy: (1 - a) * 26, s: 1 + (1 - a) * .08 }; };
const revV = (t, t0, d = .8, per = .14) => (i) => { const a = E.out3(seg(t, t0 + i * per, t0 + i * per + d)); return { a, blur: (1 - a) * 16, dy: (1 - a) * -30 }; };

function skyBG(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || '#03060f'); g.addColorStop(.55, o.mid || '#0A1020'); g.addColorStop(1, o.bot || '#14283a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // parallax stars, 3 layers
  for (let L = 0; L < 3; L++) {
    const r = rnd(21 + L * 7), n = 34 + L * 10, sp = (L + 1) * 1.6;
    for (let i = 0; i < n; i++) { const x = (r() * W + t * sp) % W, y = r() * (o.ymax || 1000), s = .5 + r() * (1 + L * .5), ph = r() * 6.28; const tw = .35 + .65 * Math.abs(Math.sin(t * (.5 + r()) + ph)); ctx.fillStyle = `rgba(225,235,255,${tw * (.5 + L * .2)})`; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); }
  }
  fogLayer('navyfog', [120, 150, 200], t, o.fog === undefined ? .16 : o.fog, 3, 14, 2, 500, H, 5);
  particles(t, 40, 3, '#C8A96A', { sz: 7, sp: 18 });
}
function moon2(x, y, r, a = 1, rays = true, t = 0) {
  glowCircle(x, y, r * 4.2, 'rgba(160,185,235,.55)', a);
  if (rays) lightRays(x, y, t, 9, 'rgba(180,200,255,.35)', .35 * a, 2400);
  const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); g.addColorStop(0, '#f6f8ff'); g.addColorStop(1, '#b5c3e0');
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(120,140,180,.25)'; [[-.3, -.1, .22], [.25, .2, .3], [.05, -.4, .12], [-.2, .35, .15]].forEach(([dx, dy, k]) => { ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, k * r, 0, 7); ctx.fill(); }); ctx.restore();
}
function sea(t, y0, o = {}) {
  const cols = o.cols || ['#0b1a2c', '#0d2033', '#10283c'];
  waves(t, y0, o.amp || 14, (l) => cols[l], .8, 3, 1);
}
function manor(cx, base, s, col, lit, t) {
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-620, 0); ctx.bezierCurveTo(-520, -60, -420, -50, -340, -70); ctx.lineTo(340, -70); ctx.bezierCurveTo(420, -50, 520, -60, 620, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(-260, -330, 520, 262); ctx.fillRect(-380, -250, 130, 180); ctx.fillRect(250, -250, 130, 180);
  ctx.beginPath(); ctx.moveTo(-290, -330); ctx.lineTo(0, -450); ctx.lineTo(290, -330); ctx.closePath(); ctx.fill();
  [[-220, 90, 240], [220, 90, 240], [0, 70, 420]].forEach(([x, w, h]) => { ctx.fillRect(x - w / 2, -70 - h, w, h); ctx.beginPath(); ctx.moveTo(x - w / 2 - 10, -70 - h); ctx.lineTo(x, -70 - h - w * 1.3); ctx.lineTo(x + w / 2 + 10, -70 - h); ctx.closePath(); ctx.fill(); });
  for (let i = 0; i < 9; i++) { const x = -560 + i * 140 + (i % 2) * 20; ctx.beginPath(); ctx.ellipse(x, -70, 40, 90 - (i % 3) * 20, 0, 0, 7); ctx.fill(); }
  const w = [[-300, -200], [-330, -140], [-230, -260], [-190, -170], [-120, -250], [-60, -190], [60, -190], [120, -250], [190, -170], [230, -260], [300, -190], [330, -130], [0, -330], [0, -400], [-220, -330], [220, -330]];
  w.forEach(([x, y], i) => { const fl = .65 + .35 * Math.sin(t * 3 + i * 1.7) * (i % 3 === 0 ? 1 : .4); ctx.globalAlpha = fl * .95; ctx.fillStyle = lit; ctx.shadowColor = lit; ctx.shadowBlur = 22; ctx.beginPath(); ctx.roundRect(x - 9, y - 16, 18, 32, [9, 9, 0, 0]); ctx.fill(); });
  ctx.restore();
}
// gown silhouette with cloth sway
function gown(c, cx, top, s, t, o = {}) {
  c.save(); c.translate(cx, top); c.scale(s, s);
  const sw = Math.sin(t * .9) * 10, sw2 = Math.sin(t * 1.3 + 1) * 14;
  const g = c.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, o.top || '#05081a'); g.addColorStop(1, o.bot || '#01030a'); c.fillStyle = g;
  // hair
  c.beginPath(); c.moveTo(-52, 25); c.bezierCurveTo(-125 + sw, 150, -150 + sw * 2, 330, -110 + sw * 3, 640); c.quadraticCurveTo(-60 + sw2, 690, 0, 640); c.quadraticCurveTo(60 - sw2, 700, 110 - sw * 3, 640); c.bezierCurveTo(150 - sw * 2, 330, 125 - sw, 150, 52, 25); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0, 70, 46, 58, 0, 0, 7); c.fill();
  // bodice + skirt
  c.beginPath(); c.moveTo(-18, 118); c.lineTo(18, 118); c.bezierCurveTo(70, 130, 118, 150, 132, 200); c.bezierCurveTo(160, 270, 130, 330, 80, 380); c.bezierCurveTo(70, 400, 76, 420, 90, 440);
  c.bezierCurveTo(200 + sw2, 700, 330 + sw, 1000, 470 + sw2 * 2, 1400);
  for (let x = 470; x >= -470; x -= 40) c.lineTo(x + sw2 * 2 * (x / 470), 1400 + Math.sin(x * .03 + t * 2.2) * 22);
  c.bezierCurveTo(-330 - sw, 1000, -200 - sw2, 700, -90, 440); c.bezierCurveTo(-76, 420, -70, 400, -80, 380); c.bezierCurveTo(-130, 330, -160, 270, -132, 200); c.bezierCurveTo(-118, 150, -70, 130, -18, 118); c.closePath(); c.fill();
  // rim light
  c.strokeStyle = o.rim || '#C9D3E6'; c.globalAlpha = o.rimA === undefined ? .7 : o.rimA; c.lineWidth = 5;
  c.beginPath(); c.moveTo(18, 118); c.bezierCurveTo(70, 130, 118, 150, 132, 200); c.bezierCurveTo(160, 270, 130, 330, 80, 380); c.bezierCurveTo(70, 400, 76, 420, 90, 440); c.bezierCurveTo(200 + sw2, 700, 330 + sw, 1000, 470 + sw2 * 2, 1400); c.stroke();
  c.beginPath(); c.ellipse(0, 70, 46, 58, 0, -1.4, .3); c.stroke();
  c.restore(); c.globalAlpha = 1;
}

// ---------------------------------------------------- T1 0-5
function T1(t) {
  skyBG(t, { ymax: 1100 });
  ctx.save(); camT({ z: 1 + .07 * E.out2(seg(t, 0, 5)), x: -8 * t, y: 0 });
  moon2(300, 560, 125, 1, true, t);
  sea(t, 1420);
  ctx.save(); ctx.globalAlpha = .4; for (let i = 0; i < 18; i++) { const y = 1440 + i * 24, w = 210 - i * 8 + Math.sin(t * 2 + i) * 24; ctx.fillStyle = '#c9d3e6'; ctx.fillRect(300 - w / 2 + Math.sin(t + i) * 14, y, w, 4); } ctx.restore();
  const bx = 520 + t * 24, by = 1405 + Math.sin(t * 1.6) * 3, ba = 1 - seg(t, 2.6, 4.6);
  if (ba > 0) { ctx.save(); ctx.globalAlpha = ba; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(bx - 34, by); ctx.lineTo(bx + 34, by); ctx.lineTo(bx + 22, by + 12); ctx.lineTo(bx - 22, by + 12); ctx.fill(); ctx.fillRect(bx - 1, by - 42, 3, 42); ctx.beginPath(); ctx.moveTo(bx + 4, by - 40); ctx.lineTo(bx + 28, by - 6); ctx.lineTo(bx + 4, by - 6); ctx.fill(); ctx.restore(); }
  fogLayer('mist1', [190, 205, 235], t, .28, 3.2, 26, 0, 1180, 1560, 9);
  const gap = lerp(1.6, 1.12, E.out3(seg(t, .4, 3)));
  VX('離れ小島', 830, 380, { font: FM2, weight: 800, size: 168, gap, fill: Q.silver, shadow: { c: '#8fb0ff', b: 34 }, per: revV(t, .5, .9, .24) });
  VX('船は、来ない。', 640, 560, { font: FM2, weight: 800, size: 74, gap: 1.14, fill: Q.gold, shadow: { c: Q.gold, b: 18 }, per: revV(t, 2.2, .7, .14) });
  ctx.restore();
  return { chroma: 1.5 };
}
// ---------------------------------------------------- T2 5-12
function T2(t) {
  const lt = t - 5;
  skyBG(t, { ymax: 900 });
  ctx.save(); camT({ z: 1 + .16 * E.io(seg(t, 5, 12)), x: -lt * 10, y: -lt * 6 });
  moon2(790, 700, 125, 1, true, t);
  // far island
  ctx.fillStyle = '#050a16'; ctx.beginPath(); ctx.moveTo(-100, 1380); ctx.bezierCurveTo(100, 1290, 250, 1330, 420, 1300); ctx.lineTo(420, 1500); ctx.lineTo(-100, 1500); ctx.fill();
  manor(W / 2, 1340, 1.55, '#02050c', '#e8c46e', t);
  fogLayer('mist2', [190, 205, 235], t, .3, 3, -20, 0, 1000, 1400, 7);
  sea(t, 1460, { cols: ['#0a1828', '#0c2032', '#10283c'] });
  ctx.restore();
  fogLayer('mist3', [190, 205, 235], t + 30, .2, 3.6, 34, 2, 1300, 1800, 3);
  const ls = lerp(40, 16, E.out3(seg(t, 5.1, 6.3)));
  TX('月の下の屋敷', W / 2, 330, { font: FM2, weight: 800, size: 100, maxW: 940, fill: Q.silver, ls, shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 5.2, .7, .13) });
  TX('化け物と呼ばれた、ひとり', W / 2, 470, { font: FM2, weight: 800, size: 70, maxW: 940, fill: Q.gold, ls: lerp(20, 6, E.out3(seg(t, 6.6, 7.8))), shadow: { c: Q.gold, b: 14 }, per: rev(t, 6.6, .6, .1) });
  return { chroma: 1.5 };
}
// ---------------------------------------------------- T3 12-20
function laceEdge(x0, x1, y, dir, col, prog = 1) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; const n = Math.floor((x1 - x0) / 34 * prog);
  for (let i = 0; i < n; i++) { const x = x0 + i * 34; ctx.beginPath(); ctx.arc(x + 17, y, 17, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 17, y + dir * 6, 5, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function petals(t, n, seed, alpha = 1, col = '#e08a9a') {
  for (let i = 0; i < n; i++) { const x = (hash(i + seed) * W + Math.sin(t * .8 + i) * 80), y = ((hash(i + seed + 3) * H + t * (90 + hash(i + seed + 5) * 140)) % (H + 100)) - 50, r = t * (1.2 + hash(i) * 2) + i; ctx.save(); ctx.globalAlpha = alpha * .8; ctx.translate(x, y); ctx.rotate(r); ctx.scale(1, .5 + .5 * Math.cos(r * 1.3)); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, 7); ctx.fill(); ctx.restore(); }
}
function T3(t) {
  skyBG(t, { ymax: 900, top: '#04070f', fog: .14 });
  moon2(300, 250, 90, .9, true, t);
  const pin = E.out3(seg(t, 12, 13)), tilt = (1 - pin) * .12;
  const px = 100, pw = 880, py = 400, ph = 1130;
  ctx.save(); camT({ z: 1 + .025 * seg(t, 12, 20), rot: Math.sin(t * .5) * .004 });
  ctx.save(); ctx.globalAlpha = pin; ctx.translate(W / 2, H / 2); ctx.scale(1 - tilt * .3, 1); ctx.translate(-W / 2, -H / 2 + (1 - pin) * 70);
  rr(px, py, pw, ph, 18); ctx.fillStyle = 'rgba(8,14,30,.9)'; ctx.fill();
  const per = 2 * (pw + ph), dr = E.out3(seg(t, 12.1, 13.6)) * per;
  ctx.save(); rr(px, py, pw, ph, 18); ctx.setLineDash([dr, per]); ctx.strokeStyle = Q.gold; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
  rr(px + 16, py + 16, pw - 32, ph - 32, 10); ctx.strokeStyle = 'rgba(201,211,230,.45)'; ctx.lineWidth = 1.5; ctx.stroke();
  const lp = E.out3(seg(t, 12.6, 14.2)); laceEdge(px + 20, px + pw - 20, py + 16, 1, 'rgba(200,169,106,.7)', lp); laceEdge(px + 20, px + pw - 20, py + ph - 16, -1, 'rgba(200,169,106,.7)', lp);
  ctx.restore();
  if (t > 13) {
    const a = E.out3(seg(t, 13, 13.8)); ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * -30);
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 610, 125, 0, 7); ctx.clip(); const g = ctx.createRadialGradient(W / 2, 610, 10, W / 2, 610, 150); g.addColorStop(0, '#2b3f6a'); g.addColorStop(1, '#0a1020'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 140, 470, 280, 280);
    gown(ctx, W / 2, 530, .5, t, { rimA: .9 }); ctx.restore();
    ctx.strokeStyle = Q.silver; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, 610, 125, 0, 7); ctx.stroke(); ctx.strokeStyle = Q.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(W / 2, 610, 137 + Math.sin(t * 2) * 2, 0, 7); ctx.stroke(); ctx.restore();
  }
  TX('離れ小島のお嬢様', W / 2, 810, { font: FM2, weight: 800, size: 84, maxW: 780, fill: Q.silver, ls: lerp(30, 6, E.out3(seg(t, 13.3, 14.4))), shadow: { c: '#8fb0ff', b: 18 }, per: rev(t, 13.3, .7, .08) });
  const cvs = 'CV 山田じぇみ子'; const n = Math.floor(clamp((window.FT - 13.9) / .9) * [...cvs].length + .001);
  if (n > 0) TX([...cvs].slice(0, n).join(''), W / 2, 905, { font: FM2, weight: 800, size: 50, fill: Q.gold, ls: 8 });
  TX('化け物と呼ばれた主人', W / 2, 995, { font: FM2, weight: 800, size: 58, maxW: 780, fill: '#e9c9c0', ls: 6, per: rev(t, 14.3, .7, .06) });
  const tags = [['#二メートルの巨躯', 14.7, 300, 1090], ['#ふたなり', 15.0, 700, 1090], ['#執着', 15.3, 500, 1170]];
  for (const [s, t0, cx, cy] of tags) { const a = E.out3(seg(t, t0, t0 + .6)); if (a <= 0) continue; const w = [...s].length * 38 + 50; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 20); rr(cx - w / 2, cy - 30, w, 60, 30); ctx.strokeStyle = Q.gold; ctx.lineWidth = 2; ctx.stroke(); TX(s, cx, cy + 2, { font: FM2, weight: 800, size: 34, fill: Q.silver }); ctx.restore(); }
  const y = 1345;
  if (t >= 15.7 && t < 18.0) {
    const a = E.out3(seg(t, 15.7, 16.4)), cr = seg(t, 17.1, 17.9), fl = E.io(seg(t, 17.7, 18.0));
    const sh = cr > 0 ? (hash(Math.floor(t * 30)) - .5) * 5 * cr : 0;
    ctx.save(); ctx.globalAlpha = a * (1 - fl); ctx.translate(W / 2, y); ctx.scale(1 - fl, 1); ctx.translate(-W / 2, -y);
    TX('気品ある令嬢', W / 2 + sh, y, { font: FM2, weight: 800, size: 96, maxW: 780, fill: '#fff', ls: 10, shadow: { c: '#8fb0ff', b: 22 }, per: rev(t, 15.7, .7, .07) }); ctx.restore();
    if (cr > 0) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; const r = rnd(9); for (let k = 0; k < 2; k++) { ctx.beginPath(); let x = 300 + k * 50, yy = 1290 + k * 30; ctx.moveTo(x, yy); const nn = Math.floor(cr * 16); for (let i = 0; i < nn; i++) { x += 18 + r() * 24; yy += (r() - .5) * 60 + (i % 2 ? 22 : -22); ctx.lineTo(x, yy); } ctx.stroke(); } ctx.restore(); }
  }
  if (t >= 18.0) {
    const s = E.io(seg(t, 18.0, 18.45)), l = t - 18.0;
    ring(W / 2, y, l, '#ff5a72', 700, 8, .8, .3);
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(s, 1); ctx.translate(-W / 2, -y);
    TX('二度と、離せない', W / 2, y, { font: FM2, weight: 800, size: 100, maxW: 780, fill: '#ff5a72', ls: 8, shadow: { c: '#a0102a', b: 34 + 10 * Math.sin(t * 4) }, stroke: { c: '#3a0812', w: 3 } }); ctx.restore();
  }
  ctx.restore();
  if (t >= 18) petals(t, 26, 5, E.out3(seg(t, 18, 19)) * (1 - seg(t, 19.6, 20)), '#c04a68');
  return { chroma: 1.5 };
}
// ---------------------------------------------------- T4 20-30
function T4(t) {
  skyBG(t, { ymax: 900, fog: .2 });
  const cam = E.io(seg(t, 20, 30));
  ctx.save(); camT({ z: 1 + .12 * cam, y: lerp(-380, 380, cam) });
  moon2(540, 250, 170, .95, true, t);
  gown(ctx, W / 2, 20, 2.15, t, { rimA: .8 });
  ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = Q.silver; ctx.lineWidth = 1.5; for (let i = 0; i < 30; i++) { const x = W / 2 + (i - 15) * 60 * (1 + Math.sin(t + i) * .01); ctx.beginPath(); ctx.moveTo(W / 2 + (x - W / 2) * .2, 1250); ctx.quadraticCurveTo(x, 1800, x + (x - W / 2) * .25, 2600); ctx.stroke(); } ctx.restore();
  butler(ctx, 260, 2610, 200, '#000', 'bow');
  fogLayer('mist4', [190, 205, 235], t, .24, 3, 22, 1, 1500, 2600, 2);
  ctx.restore();
  const per1 = revV(t, 21.0, .9, .3), per2 = revV(t, 22.7, .9, .3), fl = Math.sin(t * .9) * 6;
  withShine(() => { VX('跪くまで、', 890, 330 + fl, { font: FM2, weight: 800, size: 118, gap: 1.12, fill: Q.silver, shadow: { c: '#8fb0ff', b: 26 }, per: per1 }); VX('許さない', 730, 420 - fl, { font: FM2, weight: 800, size: 118, gap: 1.12, fill: Q.gold, shadow: { c: Q.gold, b: 20 }, per: per2 }); }, t, 4, .1, 'rgba(255,255,255,.55)', 220);
  return { chroma: 1.5 };
}
// ---------------------------------------------------- T5 30-40
function T5(t) {
  const e = env(t);
  if (t < 33.4) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0610'); g.addColorStop(.6, '#2a0c14'); g.addColorStop(1, '#5a1a10'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glowCircle(W / 2, 1000, 900, 'rgba(220,70,40,.55)', .9 + .15 * Math.sin(t * 3));
    fogLayer('emberfog', [255, 120, 60], t, .22, 2.6, 6, -60, 0, H, 4);
    for (let i = 0; i < 110; i++) { const x = hash(i) * W, sp = 90 + hash(i + 3) * 200, y = H - ((t * sp + hash(i + 5) * H) % H); ctx.save(); ctx.globalCompositeOperation = 'lighter'; sparkle(x + Math.sin(t * 2 + i) * 24, y, 5 + hash(i + 8) * 10, '#ffb070', (.4 + .6 * Math.abs(Math.sin(t * 6 + i))) * (1 - y / H * .3)); ctx.restore(); }
    const a = E.out3(seg(t, 30, 31.3));
    ctx.save(); camT({ z: 1 + .08 * seg(t, 30, 33.4) });
    shimmerDraw(() => TX('熱', W / 2, 900, { font: FM2, weight: 800, size: 760, fill: null, grad: ['#ffe2b0', '#e0603a', '#6B1E2E'], shadow: { c: '#ff6a3a', b: 70 }, per: () => ({ a, s: (1.25 - .25 * a) * (1 + .03 * Math.sin(t * 5)), blur: (1 - a) * 22 }) }), t, 10 + 5 * e, .028, 7);
    ctx.restore();
    ring(W / 2, 900, t - 30.2, 'rgba(255,150,90,1)', 1000, 20, 1.2);
  } else if (t < 36.6) {
    const l = t - 33.4; skyBG(t, { ymax: 1000, fog: .18 }); glowCircle(W / 2, 900, 800, 'rgba(120,150,230,.3)', 1);
    for (let k = 0; k < 7; k++) { const r = ((l * 240 + k * 150) % 1000); ctx.save(); ctx.globalAlpha = (1 - r / 1000) * .55; ctx.strokeStyle = Q.silver; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(W / 2, 900, r, r * .9, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    for (let g = 4; g >= 0; g--) {
      VX('囁き', W / 2, 480 - g * 6, { font: FM2, weight: 800, size: 340, gap: 1.02, fill: g === 0 ? '#fff' : Q.silver, shadow: g === 0 ? { c: '#8fb0ff', b: 44 } : null,
        per: (i) => { const a = E.out3(seg(t, 33.5 + i * .25, 34.3 + i * .25)); return { a: a * (g === 0 ? 1 : .18), blur: (1 - a) * 20 + g * 3, dx: g * 14 * Math.sin(t * 1.5 + g), s: 1 + g * .02 * Math.sin(t * 2) }; } });
    }
  } else {
    const l = t - 36.6, bp = (l % .9) / .9; const beat = Math.exp(-bp * 9) + .7 * Math.exp(-Math.abs(bp - .22) * 25);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#12040a'); g.addColorStop(1, '#3a0c1a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glowCircle(W / 2, 900, 700 + beat * 250, 'rgba(200,30,60,.6)', .5 + .3 * beat);
    for (let i = 0; i < 12; i++) { const a = hash(i) * 6.283, r0 = 380 + beat * 30; ctx.save(); ctx.globalAlpha = .35; ctx.strokeStyle = '#7a1428'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, 900 + Math.sin(a) * r0); for (let s = 1; s < 12; s++) ctx.lineTo(W / 2 + Math.cos(a + Math.sin(s + i) * .1) * (r0 + s * 90), 900 + Math.sin(a + Math.sin(s + i) * .1) * (r0 + s * 90)); ctx.stroke(); ctx.restore(); }
    for (let k = 0; k < 4; k++) { const r = ((l * 500 + k * 250) % 1000); ctx.save(); ctx.globalAlpha = (1 - r / 1000) * .7; ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, 900, 150 + r, 0, 7); ctx.stroke(); ctx.restore(); }
    TX('鼓動', W / 2, 900, { font: FM2, weight: 800, size: 360, maxW: 980, fill: '#ffdfe4', stroke: { c: '#6B1E2E', w: 6 }, shadow: { c: '#ff2a55', b: 50 + beat * 50 }, per: () => ({ s: (1 + .1 * beat) * (1.3 - .3 * E.out3(seg(t, 36.6, 37.1))), a: E.out3(seg(t, 36.6, 37.1)) }) });
    ctx.save(); ctx.globalAlpha = beat * .25; ctx.fillStyle = '#ff2a55'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  return { chroma: 1.5 + (t > 36.6 ? 3 : 0) };
}
// ---------------------------------------------------- T6 40-50
function milk(t, t0) {
  const l = t - t0;
  for (let i = 0; i < 10; i++) {
    const y = 460 + i * 110 + Math.sin(t * 1.4 + i) * 22, w = clamp(l * 1.7 - i * .1) * (W + 300), th = 46 + hash(i + 3) * 30;
    if (w <= 0) continue;
    ctx.save(); const g = ctx.createLinearGradient(0, y - th, 0, y + th); g.addColorStop(0, 'rgba(255,252,246,.0)'); g.addColorStop(.5, 'rgba(255,252,246,.42)'); g.addColorStop(1, 'rgba(255,252,246,.0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-50, y); for (let x = -50; x <= w; x += 20) ctx.lineTo(x, y - th * (.6 + .4 * Math.sin(x * .012 + t * 3 + i)) * (x > w - 200 ? (w - x) / 200 : 1)); for (let x = w; x >= -50; x -= 20) ctx.lineTo(x, y + th * (.6 + .4 * Math.sin(x * .011 - t * 2.4 + i)) * (x > w - 200 ? (w - x) / 200 : 1)); ctx.fill();
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(w - 60, y, th * .5, 0, 7); ctx.fill(); ctx.restore();
  }
}
function T6(t) {
  skyBG(t, { ymax: 1000, fog: .18 });
  if (t < 43) {
    const l = t - 40;
    ctx.save(); camT({ z: 1 + .06 * l / 3 });
    cage3d(t, W / 2, 900, 2.1, 'rgba(200,169,106,1)', t * .5, .55);
    TX('檻', W / 2, 900, { font: FM2, weight: 800, size: 700, fill: Q.silver, shadow: { c: '#8fb0ff', b: 30 }, per: () => ({ a: E.out3(seg(t, 40, 40.9)), blur: (1 - E.out3(seg(t, 40, 40.9))) * 18, s: 1.12 - .12 * E.out3(seg(t, 40, 41)) }) });
    for (let i = 0; i < 13; i++) { const x = 60 + i * 80, g = E.out3(clamp((l - i * .07) / .6)); ctx.fillStyle = Q.gold; ctx.globalAlpha = .85; ctx.fillRect(x - 3, 0, 6, H * g); ctx.globalAlpha = 1; }
    ctx.restore();
  } else if (t < 45.6) {
    const l = t - 43; glowCircle(W / 2, 900, 640, 'rgba(200,169,106,.5)', 1);
    lightRays(W / 2, 900, t, 12, 'rgba(255,220,150,.5)', .6, 1600);
    ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(-.7 + E.out3(clamp(l / 1)) * .7 + Math.sin(l * 3) * .02); ctx.shadowColor = Q.gold; ctx.shadowBlur = 40; keyShape(ctx, 0, -120, 540, 'rgba(200,169,106,.4)', 0); ctx.restore();
    TX('鍵', W / 2, 900, { font: FM2, weight: 800, size: 620, fill: Q.gold, shadow: { c: Q.gold, b: 50 }, per: () => ({ a: E.out3(seg(t, 43, 43.6)), s: 1 + .25 * Math.exp(-l * 8) }) });
    ring(W / 2, 900, l, Q.gold, 900, 8, .8);
  } else if (t < 47.7) {
    const l = t - 45.6;
    for (const x of [400, 680]) { const j = spring(l - (x < 500 ? .2 : .32), 10, 4); const y = 1300 + Math.sin(t * 2 + x) * 10, r = 130 * (.4 + .6 * j) * (1 + .03 * Math.sin(t * 5)); const g = ctx.createRadialGradient(x - 30, y - 30, 8, x, y, r); g.addColorStop(0, '#fff2c8'); g.addColorStop(.5, '#C8A96A'); g.addColorStop(1, '#3a2a10'); ctx.save(); ctx.globalAlpha = E.out3(seg(t, 45.8, 46.5)); ctx.shadowColor = Q.gold; ctx.shadowBlur = 40; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
    shimmerDraw(() => TX('金玉', W / 2, 800, { font: FM2, weight: 800, size: 380, maxW: 980, fill: Q.gold, shadow: { c: Q.gold, b: 40 }, per: (i) => { const a = E.out3(seg(t, 45.6 + i * .18, 46.2 + i * .18)); return { a, blur: (1 - a) * 16, s: 1.2 - .2 * a }; } }), t, 5, .02, 4);
  } else {
    const l = t - 47.7; milk(t, 47.7);
    const wp = E.out3(seg(t, 47.8, 48.7));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * wp, H); ctx.clip();
    TX('ザーメン', W / 2, 900, { font: FM2, weight: 800, size: 250, maxW: 980, fill: '#fffaf2', shadow: { c: '#8fb0ff', b: 40 }, stroke: { c: '#0A1020', w: 10 }, per: () => ({ s: 1 + .02 * Math.sin(t * 4) }) }); ctx.restore();
  }
  return { chroma: 1.5 };
}
// ---------------------------------------------------- T7/T8 50-60
function T7(t) {
  const l = t - 50;
  skyBG(t, { ymax: 1200, fog: .14 });
  ctx.save(); camT({ z: 1 + .06 * l / 5.6 });
  moon2(W / 2, 760, 200 + l * 16, 1, true, t);
  sea(t, 1500);
  ctx.restore();
  if (t < 52.7) TX('一年', W / 2, 760, { font: FM2, weight: 800, size: 420, maxW: 980, fill: '#0A1020', ls: 20, stroke: { c: '#dfe8ff', w: 5 }, per: (i) => { const a = E.out3(seg(t, 50.2 + i * .25, 50.9 + i * .25)); return { a: a * (1 - seg(t, 52.4, 52.7)), blur: (1 - a) * 18, s: 1.12 - .12 * a }; } });
  const a2 = 1 - seg(t, 55.2, 55.6); ctx.save(); ctx.globalAlpha = a2;
  TX('あなたはもう、', W / 2, 1120, { font: FM2, weight: 800, size: 100, maxW: 940, fill: Q.silver, ls: lerp(30, 8, E.out3(seg(t, 52.2, 53.4))), shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 52.2, .7, .1) });
  TX('逃げられない', W / 2, 1270, { font: FM2, weight: 800, size: 140, maxW: 940, fill: '#fff', ls: 8, shadow: { c: '#8fb0ff', b: 30 }, per: rev(t, 53.1, .7, .1) });
  ctx.restore();
  return { chroma: 1.5 };
}
function T8(t) {
  skyBG(t, { ymax: 1200, fog: .14 });
  ctx.save(); camT({ z: 1.06 - .04 * seg(t, 55.6, 60) });
  moon2(W / 2, 900, 140, 1, true, t);
  ctx.save(); for (let i = 0; i < 70; i++) { const a = hash(i) * 6.283 + t * .3, r = 250 + hash(i + 4) * 440; ctx.globalCompositeOperation = 'lighter'; sparkle(W / 2 + Math.cos(a) * r, 900 + Math.sin(a) * r * .8, 5 + hash(i + 8) * 9, '#C8A96A', .5 + .5 * Math.sin(t * 3 + i)); } ctx.restore();
  ctx.restore();
  TX('化け物は、', W / 2, 430, { font: FM2, weight: 800, size: 120, maxW: 940, fill: Q.silver, ls: lerp(40, 10, E.out3(seg(t, 55.7, 57))), shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 55.7, .7, .1) });
  TX('あなたを離さない。', W / 2, 590, { font: FM2, weight: 800, size: 100, maxW: 940, fill: '#fff', ls: 8, shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 56.4, .7, .08) });
  if (t >= 56.8) {
    [['デカふたなりの', 1170, 104, Q.silver, 0], ['お嬢様は', 1290, 104, Q.silver, .25], ['オナホ執事を', 1410, 104, Q.gold, .5], ['離さない', 1530, 104, Q.gold, .75]].forEach(([s, y, sz, f, off]) => {
      withShine(() => TX(s, W / 2, y, { font: FM2, weight: 800, size: sz, maxW: 940, fill: f, ls: 8, shadow: { c: f, b: 20 }, per: rev(t, 56.8 + off, .6, .06) }), t, 3, off * .1, 'rgba(255,255,255,.7)', 200);
    });
    TX('CV 山田じぇみ子', W / 2, 1690, { font: FM2, weight: 800, size: 48, fill: '#e9c9c0', ls: 8, per: () => ({ a: E.out3(seg(t, 58.2, 58.9)) }) });
  }
  return { chroma: 1.5 };
}
const V2 = {
  scenes: [{ a: 0, b: 5, fn: T1 }, { a: 5, b: 12, fn: T2 }, { a: 12, b: 20, fn: T3 }, { a: 20, b: 30, fn: T4 }, { a: 30, b: 40, fn: T5 }, { a: 40, b: 50, fn: T6 }, { a: 50, b: 55.6, fn: T7 }, { a: 55.6, b: 60.01, fn: T8 }],
  trans: [{ at: 5, dur: .9, kind: 'blurfade' }, { at: 12, dur: .8, kind: 'moonzoom', x: 790, y: 700 }, { at: 20, dur: .8, kind: 'blurfade' }, { at: 30, dur: .5, kind: 'dip', col: '#000' }, { at: 40, dur: .5, kind: 'dip', col: '#000' }, { at: 50, dur: .8, kind: 'blurfade' }, { at: 55.6, dur: .8, kind: 'fade' }],
  draw(t) { return runScenes(this, t); },
  post(t, fx) {
    bloom(.45, 14);
    chroma(fx.chroma || 1.5);
    vignette(.7);
    grain(t, .05);
    flash(t, [18.0], '#fff', 6, .5);
    fadeIO(t, .6, .8);
  }
};
