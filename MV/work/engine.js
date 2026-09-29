// ===== MV engine: deterministic canvas renderer (t in seconds) =====
const W = 1080, H = 1920, FPS = 30;
const cv = document.getElementById('c');
cv.width = W; cv.height = H;
let ctx = cv.getContext('2d');
const mainCtx = ctx;
const oc = document.createElement('canvas'); oc.width = W; oc.height = H;
const octx = oc.getContext('2d');
const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
const tctx = tmp.getContext('2d');
const tint = document.createElement('canvas'); tint.width = W; tint.height = H;
const kctx = tint.getContext('2d');
const half = document.createElement('canvas'); half.width = W / 4; half.height = H / 4;
const hctx = half.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: t => t,
  out2: t => 1 - (1 - t) * (1 - t),
  out3: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  in3: t => t * t * t,
  io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
};
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function rnd(seed) { let s = (seed * 2654435761) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// audio-reactive
function env(t) { const i = clamp(Math.round(t * FPS), 0, ENV.length - 1); return ENV[i] || 0; }
function pulse(t, k = 9) { let p = 0; for (const o of ONS) { if (o > t) break; const v = Math.exp(-(t - o) * k); if (v > p) p = v; } return p; }

// ---------- primitives ----------
function heartPath(c, x, y, s) {
  c.beginPath();
  c.moveTo(x, y + s * .35);
  c.bezierCurveTo(x - s * .05, y + s * .15, x - s * .5, y - s * .05, x - s * .5, y - s * .3);
  c.bezierCurveTo(x - s * .5, y - s * .55, x - s * .1, y - s * .6, x, y - s * .3);
  c.bezierCurveTo(x + s * .1, y - s * .6, x + s * .5, y - s * .55, x + s * .5, y - s * .3);
  c.bezierCurveTo(x + s * .5, y - s * .05, x + s * .05, y + s * .15, x, y + s * .35);
  c.closePath();
}
function heart(x, y, s, fill, stroke, sw = 4, c = ctx) {
  heartPath(c, x, y, s);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = sw; c.stroke(); }
}
function sparkle(x, y, r, col, a = 1, c = ctx) {
  c.save(); c.globalAlpha = a; c.fillStyle = col; c.translate(x, y);
  c.beginPath();
  c.moveTo(0, -r); c.quadraticCurveTo(r * .08, -r * .08, r, 0); c.quadraticCurveTo(r * .08, r * .08, 0, r);
  c.quadraticCurveTo(-r * .08, r * .08, -r, 0); c.quadraticCurveTo(-r * .08, -r * .08, 0, -r);
  c.fill(); c.restore();
}
function glowCircle(x, y, r, col, a = 1, c = ctx) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.save(); c.globalAlpha = a; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}

// ---------- text ----------
function fontStr(o) { return `${o.weight || 400} ${o.size}px "${o.font}", "Noto Sans JP", sans-serif`; }
const VERT_MAP = { 'ー': '｜', '、': '、', '。': '。', '…': '⋮', '〜': '︴' };
function measure(str, o) {
  ctx.save(); ctx.font = fontStr(o);
  const ls = o.ls || 0;
  const advs = [...str].map(ch => ch === '♡' ? o.size * .95 + ls : ctx.measureText(ch).width + ls);
  ctx.restore();
  return advs;
}
// per: (i,n) -> {a,dx,dy,s,r,blur,fill,sx,sy}
function TX(str, cx, cy, o) {
  o = Object.assign({ size: 100, font: 'Dela Gothic One', fill: '#fff', align: 'center' }, o);
  if (o.maxW) {
    const tot = measure(str, o).reduce((a, b) => a + b, 0);
    if (tot > o.maxW) o.size = Math.floor(o.size * o.maxW / tot);
  }
  const chars = [...str], n = chars.length;
  const advs = measure(str, o);
  const tot = advs.reduce((a, b) => a + b, 0);
  let x = o.align === 'center' ? cx - tot / 2 : o.align === 'left' ? cx : cx - tot;
  for (let i = 0; i < n; i++) {
    const p = o.per ? o.per(i, n) : {};
    const a = p.a === undefined ? 1 : p.a;
    if (a > 0.003) drawGlyph(chars[i], x + advs[i] / 2 + (p.dx || 0), cy + (p.dy || 0), o, p, a, advs[i]);
    x += advs[i];
  }
  return { w: tot, size: o.size };
}
function drawGlyph(ch, gx, gy, o, p, a, adv) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(gx, gy);
  if (p.r) ctx.rotate(p.r);
  const s = p.s === undefined ? 1 : p.s;
  ctx.scale((p.sx || 1) * s, (p.sy || 1) * s);
  if (p.blur > .3) ctx.filter = `blur(${p.blur}px)`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = fontStr(o); ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  const fill = p.fill || o.fill;
  if (ch === 'ヶ') { ch = 'ケ'; ctx.scale(.66, .66); ctx.translate(0, -o.size * .16); }
  const isHeart = ch === '♡';
  const draw = (dx, dy, f, st, sw) => {
    if (isHeart) { heart(dx, dy, o.size * .9, f, st, sw || 4); }
    else {
      if (st) { ctx.strokeStyle = st; ctx.lineWidth = sw || 4; ctx.strokeText(ch, dx, dy); }
      if (f) { ctx.fillStyle = f; ctx.fillText(ch, dx, dy); }
    }
  };
  if (o.ext) { for (let k = o.ext.n; k >= 1; k--) draw(o.ext.dx * k, o.ext.dy * k, o.ext.c, o.ext.c, (o.stroke ? o.stroke.w : 0)); }
  if (o.shadow) { ctx.shadowColor = o.shadow.c; ctx.shadowBlur = o.shadow.b; }
  if (o.stroke) draw(0, 0, null, o.stroke.c, o.stroke.w);
  if (o.shadow && o.stroke) { ctx.shadowBlur = 0; }
  if (o.grad) {
    const g = ctx.createLinearGradient(0, -o.size / 2, 0, o.size / 2);
    o.grad.forEach((c, i) => g.addColorStop(i / (o.grad.length - 1), c));
    draw(0, 0, g, null);
  } else draw(0, 0, fill, null);
  ctx.restore();
}
// vertical (top -> bottom), cx = column center, y0 = top
function VX(str, cx, y0, o) {
  o = Object.assign({ size: 100, font: 'Shippori Mincho B1', fill: '#fff', gap: 1.08 }, o);
  const chars = [...str], n = chars.length;
  const step = o.size * o.gap + (o.ls || 0);
  for (let i = 0; i < n; i++) {
    const p = o.per ? o.per(i, n) : {};
    const a = p.a === undefined ? 1 : p.a;
    if (a <= .003) continue;
    let ch = chars[i], ox = 0, oy = 0;
    if (ch === '、' || ch === '。') { ox = o.size * .55; oy = -o.size * .5; }
    let rot = p.r || 0;
    if (ch === 'ー') { ch = '｜'; }
    drawGlyph(ch, cx + ox + (p.dx || 0), y0 + i * step + step / 2 + oy + (p.dy || 0), o, Object.assign({}, p, { r: rot }), a, step);
  }
  return { h: n * step };
}
function scrambleStr(str, t, start, dur, pool, per = 1) {
  const chars = [...str];
  return chars.map((ch, i) => {
    const s0 = start + i * per * 0.06;
    if (t < s0) return null;
    if (t >= s0 + dur) return ch;
    return pool[Math.floor(hash(Math.floor(t * 20) * 31 + i * 7) * pool.length)];
  });
}

// ---------- post fx ----------
function grabFrame() { tctx.clearRect(0, 0, W, H); tctx.drawImage(cv, 0, 0); }
function chroma(dx) {
  if (Math.abs(dx) < .5) return;
  grabFrame();
  const chans = [['#ff0000', -dx, 0], ['#00ff00', 0, 0], ['#0000ff', dx, 0]];
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  for (const [col, ox, oy] of chans) {
    kctx.globalCompositeOperation = 'source-over'; kctx.clearRect(0, 0, W, H);
    kctx.drawImage(tmp, 0, 0);
    kctx.globalCompositeOperation = 'multiply'; kctx.fillStyle = col; kctx.fillRect(0, 0, W, H);
    ctx.drawImage(tint, ox, oy);
  }
  ctx.restore();
}
function sliceGlitch(t, amt, seed = 1) {
  if (amt <= 0.01) return;
  grabFrame();
  const r = rnd(Math.floor(t * 30) * 13 + seed);
  const n = 3 + Math.floor(amt * 8);
  for (let i = 0; i < n; i++) {
    const y = Math.floor(r() * (H - 100)), h = 12 + Math.floor(r() * 120 * amt + 10);
    const off = (r() - .5) * 260 * amt;
    ctx.drawImage(tmp, 0, y, W, h, off, y, W, h);
  }
}
function bloom(a = .35, blur = 10) {
  hctx.clearRect(0, 0, W / 4, H / 4);
  hctx.drawImage(cv, 0, 0, W / 4, H / 4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(half, 0, 0, W, H);
  ctx.restore();
}
function vignette(a = .6) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
const grainCv = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  const id = g.createImageData(256, 256); const r = rnd(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
})();
function grain(t, a = .06) {
  const f = Math.floor(t * 24);
  const ox = Math.floor(hash(f) * 256), oy = Math.floor(hash(f + 99) * 256);
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainCv, 'repeat');
  ctx.translate(-ox, -oy); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}
function flash(t, times, col = '#fff', k = 10, a = .9) {
  let m = 0;
  for (const f of times) { if (t >= f) { const v = Math.exp(-(t - f) * k); if (v > m) m = v; } }
  if (m > .01) { ctx.save(); ctx.globalAlpha = m * a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  return m;
}
function fadeIO(t, fin = .5, fout = .8, total = 60) {
  const a = Math.min(t / fin, (total - t) / fout);
  if (a < 1) { ctx.save(); ctx.globalAlpha = 1 - clamp(a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

// ---------- silhouettes ----------
function mirrorPath(c, pts, cx, sc) {
  // pts: list of [x,y] (right side, top->bottom) with bezier triplets flagged by length 6
}
function figure(c, cx, top, h, o = {}) {
  // hourglass giant silhouette; unit height 1000 mapped to h
  const s = h / 1000, col = o.col || '#000';
  c.save(); c.translate(cx, top); c.scale(s, s); c.fillStyle = col;
  const gown = o.gown;
  // hair (behind)
  c.beginPath();
  c.moveTo(-52, 30);
  c.bezierCurveTo(-90, 120, -105, 330, -85, 520);
  c.lineTo(-40, 500); c.lineTo(40, 500); c.lineTo(85, 520);
  c.bezierCurveTo(105, 330, 90, 120, 52, 30);
  c.closePath(); c.fill();
  // head
  c.beginPath(); c.ellipse(0, 62, 40, 50, 0, 0, Math.PI * 2); c.fill();
  // body
  c.beginPath();
  c.moveTo(-15, 100);
  c.lineTo(15, 100);
  c.lineTo(16, 128);
  c.bezierCurveTo(70, 135, 115, 150, 132, 190);
  c.bezierCurveTo(165, 250, 160, 300, 118, 335);  // bust
  c.bezierCurveTo(88, 355, 78, 375, 74, 405);      // waist
  if (gown) {
    c.bezierCurveTo(80, 470, 150, 620, 250, 800);
    c.bezierCurveTo(300, 900, 330, 960, 350, 1000);
    c.lineTo(-350, 1000);
    c.bezierCurveTo(-330, 960, -300, 900, -250, 800);
    c.bezierCurveTo(-150, 620, -80, 470, -74, 405);
  } else {
    c.bezierCurveTo(78, 440, 140, 470, 148, 540);   // hip
    c.bezierCurveTo(150, 700, 110, 850, 96, 1000);
    c.lineTo(14, 1000);
    c.bezierCurveTo(10, 800, 12, 640, 0, 560);
    c.bezierCurveTo(-12, 640, -10, 800, -14, 1000);
    c.lineTo(-96, 1000);
    c.bezierCurveTo(-110, 850, -150, 700, -148, 540);
    c.bezierCurveTo(-140, 470, -78, 440, -74, 405);
  }
  c.bezierCurveTo(-78, 375, -88, 355, -118, 335);
  c.bezierCurveTo(-160, 300, -165, 250, -132, 190);
  c.bezierCurveTo(-115, 150, -70, 135, -16, 128);
  c.closePath(); c.fill();
  // arms (down along sides, slightly separated by rim)
  if (o.rim) {
    c.strokeStyle = o.rim; c.lineWidth = 5; c.globalAlpha = o.rimA === undefined ? .8 : o.rimA;
    c.beginPath();
    c.moveTo(16, 128); c.bezierCurveTo(70, 135, 115, 150, 132, 190); c.bezierCurveTo(165, 250, 160, 300, 118, 335);
    c.bezierCurveTo(88, 355, 78, 375, 74, 405);
    if (gown) c.bezierCurveTo(80, 470, 150, 620, 250, 800); else c.bezierCurveTo(78, 440, 140, 470, 148, 540);
    c.stroke();
    c.beginPath();
    c.moveTo(-16, 128); c.bezierCurveTo(-70, 135, -115, 150, -132, 190); c.bezierCurveTo(-165, 250, -160, 300, -118, 335);
    c.bezierCurveTo(-88, 355, -78, 375, -74, 405);
    if (gown) c.bezierCurveTo(-80, 470, -150, 620, -250, 800); else c.bezierCurveTo(-78, 440, -140, 470, -148, 540);
    c.stroke();
    c.globalAlpha = 1;
  }
  c.restore();
}
function butler(c, x, y, h, col = '#000', pose = 'stand') {
  c.save(); c.translate(x, y); c.scale(h / 100, h / 100); c.fillStyle = col;
  if (pose === 'stand') {
    c.beginPath(); c.arc(0, -88, 9, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-14, -74); c.lineTo(14, -74); c.lineTo(17, -30); c.lineTo(11, -30); c.lineTo(10, 0); c.lineTo(2, 0); c.lineTo(0, -28); c.lineTo(-2, 0); c.lineTo(-10, 0); c.lineTo(-11, -30); c.lineTo(-17, -30); c.closePath(); c.fill();
  } else { // kneeling / bowed
    c.beginPath(); c.arc(-20, -22, 9, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-14, -30); c.quadraticCurveTo(10, -60, 22, -34); c.lineTo(30, 0); c.lineTo(-28, 0); c.lineTo(-24, -14); c.closePath(); c.fill();
  }
  c.restore();
}
function solePath(c) {
  c.beginPath();
  c.moveTo(-40, -70);
  c.bezierCurveTo(-62, -40, -58, 0, -38, 30);
  c.bezierCurveTo(-30, 55, -42, 80, -34, 108);
  c.bezierCurveTo(-26, 132, 26, 132, 34, 108);
  c.bezierCurveTo(42, 80, 34, 50, 44, 20);
  c.bezierCurveTo(62, -20, 60, -50, 40, -70);
  c.bezierCurveTo(20, -84, -20, -84, -40, -70);
  c.closePath();
}
function sole(c, cx, cy, s, col = '#000') {
  // foot sole, toes up. s = total height (~ 250 units)
  c.save(); c.translate(cx, cy); c.scale(s / 250, s / 250); c.fillStyle = col;
  solePath(c); c.fill();
  [[-30, -100, 17], [-4, -112, 14], [17, -108, 12.5], [35, -98, 11], [50, -84, 9.5]].forEach(([x, y, r]) => { c.beginPath(); c.ellipse(x, y, r, r * 1.15, 0, 0, 7); c.fill(); });
  c.restore();
}
function cage(c, cx, cy, s, col, sw = 6) {
  c.save(); c.translate(cx, cy); c.scale(s / 100, s / 100); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = sw * 100 / s; c.lineCap = 'round';
  // ring
  c.beginPath(); c.ellipse(0, 40, 55, 14, 0, 0, Math.PI * 2); c.stroke();
  // capsule
  c.beginPath(); c.moveTo(-30, 40); c.lineTo(-30, -40); c.arc(0, -40, 30, Math.PI, 0); c.lineTo(30, 40); c.stroke();
  [-15, 0, 15].forEach(x => { c.beginPath(); c.moveTo(x, 40); c.lineTo(x * 0.6, -68); c.stroke(); });
  for (const y of [-40, -8, 22]) { c.beginPath(); c.ellipse(0, y, 30 - Math.abs(y + 10) * .0, 6, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
}
function padlock(c, cx, cy, s, col, open = 0) {
  c.save(); c.translate(cx, cy); c.scale(s / 100, s / 100); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 12; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-24, -10 - open * 22); c.lineTo(-24, -40 - open * 22); c.arc(0, -40 - open * 22, 24, Math.PI, 0); c.lineTo(24, -10 - open * 22 + (open > .5 ? 0 : 0)); c.stroke();
  c.beginPath(); c.roundRect(-44, -12, 88, 66, 10); c.fill();
  c.globalCompositeOperation = 'destination-out';
  c.beginPath(); c.arc(0, 14, 9, 0, 7); c.fill(); c.fillRect(-4, 14, 8, 22);
  c.restore();
}
function keyShape(c, cx, cy, s, col, rot = 0) {
  c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(s / 100, s / 100); c.fillStyle = col;
  c.beginPath(); c.arc(0, -40, 26, 0, 7); c.arc(0, -40, 11, 0, 7, true); c.fill('evenodd');
  c.fillRect(-6, -16, 12, 100); c.fillRect(6, 52, 22, 10); c.fillRect(6, 68, 16, 10);
  c.restore();
}
function waves(t, y0, amp, col, speed = 1, layers = 3, alpha = 1, freq = .006) {
  for (let l = 0; l < layers; l++) {
    ctx.save(); ctx.globalAlpha = alpha * (0.5 + .5 * (l / layers)); ctx.fillStyle = typeof col === 'function' ? col(l) : col;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) {
      const y = y0 + l * 46 + Math.sin(x * freq * (1 + l * .3) + t * speed * (1 + l * .4) + l * 2) * amp + Math.sin(x * freq * 2.3 - t * speed * .7 + l) * amp * .4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
function particles(t, n, seed, col, opt = {}) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, sp = (opt.sp || 30) * (.4 + r()), ph = r() * 6.28, sz = (opt.sz || 8) * (.4 + r());
    const x = ((x0 + Math.sin(t * .8 + ph) * 30 + (opt.dx || 0) * t * sp / 30) % W + W) % W;
    const y = (((y0 - t * sp * (opt.up === false ? -1 : 1)) % H) + H) % H;
    const tw = .5 + .5 * Math.sin(t * (2 + r() * 3) + ph);
    if (opt.kind === 'heart') { ctx.save(); ctx.globalAlpha = tw * .8; heart(x, y, sz * 2, col, null); ctx.restore(); }
    else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; sparkle(x, y, sz * (.6 + tw * .8), col, tw); ctx.restore(); }
  }
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function shimmerDraw(fn, t, amp = 10, freq = .03, sp = 6, stepH = 6) {
  const prev = ctx; ctx = octx; octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, W, H); fn(); ctx = prev;
  for (let y = 0; y < H; y += stepH) ctx.drawImage(oc, 0, y, W, stepH, Math.sin(y * freq + t * sp) * amp, y, W, stepH);
}
