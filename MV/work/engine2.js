// ===== engine2: layers, camera, transitions, fx library =====
const layerPool = [];
function renderLayer(i, fn) {
  if (!layerPool[i]) { const c = document.createElement('canvas'); c.width = W; c.height = H; layerPool[i] = { c, x: c.getContext('2d') }; }
  const L = layerPool[i], prev = ctx;
  ctx = L.x; L.x.setTransform(1, 0, 0, 1, 0, 0); L.x.globalAlpha = 1; L.x.globalCompositeOperation = 'source-over'; L.x.filter = 'none';
  L.x.clearRect(0, 0, W, H);
  fn();
  ctx = prev;
  return L.c;
}
function camT(o) { // apply camera to current ctx (call inside save/restore)
  ctx.translate(W / 2 + (o.x || 0), H / 2 + (o.y || 0)); ctx.rotate(o.rot || 0); ctx.scale(o.z || 1, o.z || 1); ctx.translate(-W / 2, -H / 2);
}
const smooth = (t, a, b) => E.io(seg(t, a, b));
function spring(l, k = 9, d = 5) { return l <= 0 ? 0 : 1 - Math.exp(-d * l) * Math.cos(k * l); } // 0->1 with overshoot
function shk(t, a, seed = 0) { const f = Math.floor(t * 30); return [(hash(f * 3 + seed) - .5) * 2 * a, (hash(f * 3 + seed + 1) - .5) * 2 * a]; }

// ---- noise / fog ----
function makeNoise(size, oct, rgb, seed = 1, gain = .5) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const id = x.createImageData(size, size); const d = id.data;
  const lat = []; let base = 4;
  for (let o = 0; o < oct; o++) { const n = base << o; const g = new Float32Array(n * n); for (let i = 0; i < n * n; i++) g[i] = hash(i * .731 + o * 91.7 + seed * 13.3); lat.push([n, g]); }
  const sm = t => t * t * (3 - 2 * t);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    let v = 0, amp = 1, tot = 0;
    for (let o = 0; o < oct; o++) {
      const [n, g] = lat[o]; const fx = px / size * n, fy = py / size * n; const x0 = Math.floor(fx), y0 = Math.floor(fy); const tx = sm(fx - x0), ty = sm(fy - y0);
      const a = g[(y0 % n) * n + (x0 % n)], b = g[(y0 % n) * n + ((x0 + 1) % n)], c2 = g[((y0 + 1) % n) * n + (x0 % n)], d2 = g[((y0 + 1) % n) * n + ((x0 + 1) % n)];
      v += amp * (a + (b - a) * tx + (c2 - a) * ty + (a - b - c2 + d2) * tx * ty); tot += amp; amp *= gain;
    }
    v /= tot; v = clamp((v - .35) * 2.2);
    const i = (py * size + px) * 4; d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = v * 255;
  }
  x.putImageData(id, 0, 0); return c;
}
const FOGS = {};
function fogLayer(key, rgb, t, alpha, scale = 2.4, vx = 20, vy = 4, ymin = 0, ymax = H, seed = 1) {
  if (!FOGS[key]) FOGS[key] = makeNoise(256, 5, rgb, seed);
  const c = FOGS[key]; const s = 256 * scale;
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.rect(0, ymin, W, ymax - ymin); ctx.clip();
  const ox = -((t * vx) % s + s) % s, oy = -((t * vy) % s + s) % s;
  for (let x = ox - s; x < W; x += s) for (let y = oy - s + ymin; y < ymax; y += s) ctx.drawImage(c, x, y, s, s);
  ctx.restore();
}

// ---- background fx ----
function sunburst(cx, cy, t, n, colA, colB, alpha = 1, speed = .15) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * speed); ctx.globalAlpha = alpha;
  const R = 2600, da = Math.PI * 2 / n;
  for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? colA : colB; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, i * da, (i + 1) * da); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function halftone(t, col, alpha, step = 44, fn) {
  ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = alpha;
  for (let y = 0; y < H + step; y += step) for (let x = ((y / step) % 2) * step / 2; x < W + step; x += step) {
    const v = fn ? fn(x, y, t) : .5; if (v <= .02) continue;
    ctx.beginPath(); ctx.arc(x, y, step * .5 * clamp(v), 0, 7); ctx.fill();
  }
  ctx.restore();
}
function ring(x, y, l, col, maxR = 900, w = 14, dur = .6, squash = 1) {
  if (l < 0 || l > dur) return; const p = l / dur, r = E.out3(p) * maxR;
  ctx.save(); ctx.globalAlpha = (1 - p) * .9; ctx.strokeStyle = col; ctx.lineWidth = w * (1 - p) + 1; ctx.beginPath(); ctx.ellipse(x, y, r, r * squash, 0, 0, 7); ctx.stroke(); ctx.restore();
}
function burst(x, y, l, n, cols, maxR = 700, dur = .9, seed = 1) {
  if (l < 0 || l > dur) return; const p = l / dur;
  for (let i = 0; i < n; i++) {
    const a = hash(i + seed) * 6.283, sp = .4 + hash(i + seed + 50) * .6, r = E.out3(p) * maxR * sp, gr = p * p * 260;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r + gr, sz = (10 + hash(i + seed + 9) * 22) * (1 - p);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (i % 3 === 0) heart(px, py, sz * 1.8, cols[i % cols.length], null); else sparkle(px, py, sz * 1.4, cols[i % cols.length], 1 - p);
    ctx.restore();
  }
}
function speedLines(cx, cy, t, n, col, alpha = .5, r0 = 300, len = 500, seed = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = hash(i + seed) * 6.283, ph = (t * (1.6 + hash(i + seed + 3)) + hash(i + seed + 7)) % 1;
    const r = r0 + ph * 1100, l2 = len * (.3 + hash(i + seed + 5)) * (.4 + ph);
    ctx.globalAlpha = alpha * Math.sin(ph * Math.PI); ctx.lineWidth = 3 + hash(i + seed + 8) * 9;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * (r + l2), Math.sin(a) * (r + l2)); ctx.stroke();
  }
  ctx.restore();
}
function lightRays(cx, cy, t, n, col, alpha, len = 2200) {
  ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (hash(i + 3) - .5) * 1.6 + Math.sin(t * .3 + i) * .05, w = .02 + hash(i + 8) * .05;
    const g = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha * (.4 + .6 * Math.abs(Math.sin(t * .7 + i * 2)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * len, Math.sin(a - w) * len); ctx.lineTo(Math.cos(a + w) * len, Math.sin(a + w) * len); ctx.fill();
  }
  ctx.restore();
}
function lightLeak(t, col, alpha, x0 = .5) {
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha;
  const cx = W * (x0 + Math.sin(t * .5) * .3), cy = H * (.3 + Math.cos(t * .4) * .2);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 900); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function confetti(t, n, cols, seed = 2, alpha = 1) {
  for (let i = 0; i < n; i++) {
    const x0 = hash(i + seed) * W, sp = 120 + hash(i + seed + 4) * 260, y = ((hash(i + seed + 6) * H + t * sp) % (H + 200)) - 100, ph = hash(i + seed + 8) * 6.28;
    const w = 12 + hash(i + seed + 2) * 18, rot = t * (2 + hash(i) * 4) + ph;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x0 + Math.sin(t * 1.4 + ph) * 60, y); ctx.rotate(rot); ctx.scale(1, Math.cos(rot * 1.7)); ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-w / 2, -w / 4, w, w / 2); ctx.restore();
  }
}
// giant background type rows (only confirmed strings)
function typeRows(str, t, o) {
  o = Object.assign({ size: 420, rows: 5, y0: 200, gap: 380, speed: 120, stroke: 'rgba(255,255,255,.12)', fill: null, font: 'Dela Gothic One', sw: 4, weight: 400 }, o);
  ctx.save(); ctx.font = `${o.weight} ${o.size}px "${o.font}"`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const w = ctx.measureText(str + '　').width;
  for (let r = 0; r < o.rows; r++) {
    const dir = r % 2 ? -1 : 1, off = ((t * o.speed * dir * (1 + r * .12)) % w + w) % w;
    for (let x = -w + off - (dir > 0 ? 0 : w); x < W + w; x += w) {
      if (o.fill) { ctx.fillStyle = o.fill; ctx.fillText(str, x, o.y0 + r * o.gap); }
      if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.sw; ctx.strokeText(str, x, o.y0 + r * o.gap); }
    }
  }
  ctx.restore();
}
// diagonal shine over drawn content (uses layer 3)
function withShine(drawFn, t, period = 2.2, phase = 0, col = 'rgba(255,255,255,.9)', wd = 260) {
  const L = renderLayer(3, drawFn);
  const lx = layerPool[3].x; lx.save(); lx.globalCompositeOperation = 'source-atop';
  const p = ((t / period + phase) % 1); const xx = -400 + p * (W + 800);
  const g = lx.createLinearGradient(xx - wd, 0, xx + wd, H * .35); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, col); g.addColorStop(1, 'rgba(255,255,255,0)');
  lx.fillStyle = g; lx.fillRect(0, 0, W, H); lx.restore();
  ctx.drawImage(L, 0, 0);
}
// shatter: text/graphic fragments flying
function shatter(drawFn, bx, by, bw, bh, l, o = {}) {
  o = Object.assign({ cell: 56, seed: 3, spread: 700, grav: 900, dur: .9 }, o);
  const L = renderLayer(2, drawFn); const p = clamp(l / o.dur);
  const cols = Math.ceil(bw / o.cell), rows = Math.ceil(bh / o.cell);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) for (let k = 0; k < 2; k++) {
    const x0 = bx + i * o.cell, y0 = by + j * o.cell, s = o.cell;
    const tri = k ? [[x0, y0], [x0 + s, y0 + s], [x0, y0 + s]] : [[x0, y0], [x0 + s, y0], [x0 + s, y0 + s]];
    const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
    const id = i * 31 + j * 17 + k * 7 + o.seed, vx = (hash(id) - .5) * o.spread + (cx - W / 2) * .8, vy = -hash(id + 1) * o.spread * .6 - 100;
    const dx = vx * l, dy = vy * l + .5 * o.grav * l * l, rot = (hash(id + 2) - .5) * 8 * l;
    ctx.save(); ctx.globalAlpha = 1 - p * p; ctx.translate(cx + dx, cy + dy); ctx.rotate(rot);
    ctx.beginPath(); ctx.moveTo(tri[0][0] - cx, tri[0][1] - cy); ctx.lineTo(tri[1][0] - cx, tri[1][1] - cy); ctx.lineTo(tri[2][0] - cx, tri[2][1] - cy); ctx.closePath(); ctx.clip();
    ctx.drawImage(L, -cx, -cy); ctx.restore();
  }
}
// ---- transitions (A/B are canvases) ----
function transition(kind, p, A, B, o = {}) {
  const e = E.io(p);
  ctx.save();
  if (kind === 'zoom') { // push through A into B
    ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.globalAlpha = clamp(e * 1.6); ctx.translate(W / 2, H / 2); const s = lerp(.55, 1, E.out3(p)); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2); ctx.drawImage(B, 0, 0); ctx.restore();
    // outgoing zoom blur
    ctx.globalCompositeOperation = 'source-over';
    for (let k = 0; k < 5; k++) { ctx.save(); ctx.globalAlpha = (1 - e) * .32; ctx.translate(W / 2, H / 2); const s = 1 + (e * .9) * (1 + k * .12); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2); ctx.drawImage(A, 0, 0); ctx.restore(); }
  } else if (kind === 'whip') {
    const dir = o.dir || 1, sh = e * W * 1.25;
    for (let k = 0; k < 9; k++) { const q = k / 8; ctx.globalAlpha = (k === 0 ? 1 : 1 / (k + 1)); ctx.drawImage(A, -dir * (sh + q * 200 * e), 0); }
    ctx.globalAlpha = 1;
    for (let k = 0; k < 9; k++) { const q = k / 8; ctx.globalAlpha = (k === 0 ? 1 : 1 / (k + 1)); ctx.drawImage(B, dir * (W * 1.25 - sh) + dir * q * 200 * (1 - e), 0); }
  } else if (kind === 'glitch') {
    ctx.drawImage(A, 0, 0); const r = rnd(Math.floor(p * 40) * 7 + 3);
    const bands = 26; const bh = H / bands;
    for (let i = 0; i < bands; i++) { const th = r(); if (th < p * 1.15) { const off = (r() - .5) * 220 * Math.sin(p * Math.PI); ctx.drawImage(B, 0, i * bh, W, bh + 1, off, i * bh, W, bh + 1); } }
  } else if (kind === 'wipe') {
    ctx.drawImage(A, 0, 0); const k = E.out5(p) * (W + H * .6);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-H * .3 + k - W - H * .6, 0); ctx.lineTo(k - H * .6, 0); ctx.lineTo(k, H); ctx.lineTo(-H * .3 + k - W - H * .6 - H * .6, H); ctx.closePath();
    // simpler: polygon sweeping left->right diagonal
    ctx.restore();
    ctx.save(); ctx.beginPath(); const sk = 380, x1 = -sk + E.out5(p) * (W + sk * 2); ctx.moveTo(0, 0); ctx.lineTo(x1 + sk, 0); ctx.lineTo(x1, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.save(); ctx.fillStyle = o.col || '#FFD84A'; ctx.globalAlpha = Math.sin(p * Math.PI) * .9; ctx.beginPath(); ctx.moveTo(x1 + sk - 60, 0); ctx.lineTo(x1 + sk + 20, 0); ctx.lineTo(x1 + 20, H); ctx.lineTo(x1 - 60, H); ctx.fill(); ctx.restore();
  } else if (kind === 'fade') {
    ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0);
  } else if (kind === 'blurfade') {
    ctx.filter = `blur(${Math.sin(p * Math.PI) * 14}px)`; ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0);
  } else if (kind === 'moonzoom') {
    for (let k = 0; k < 4; k++) { ctx.save(); ctx.globalAlpha = k === 0 ? 1 : .3 * (1 - e); ctx.translate(o.x || W / 2, o.y || H / 2); const s = 1 + e * (1.4 + k * .1); ctx.scale(s, s); ctx.translate(-(o.x || W / 2), -(o.y || H / 2)); ctx.drawImage(A, 0, 0); ctx.restore(); }
    ctx.globalAlpha = clamp((p - .35) / .65); ctx.drawImage(B, 0, 0);
  } else if (kind === 'dip') {
    if (p < .5) { ctx.drawImage(A, 0, 0); ctx.globalAlpha = p * 2; ctx.fillStyle = o.col || '#000'; ctx.fillRect(0, 0, W, H); } else { ctx.drawImage(B, 0, 0); ctx.globalAlpha = (1 - p) * 2; ctx.fillStyle = o.col || '#000'; ctx.fillRect(0, 0, W, H); }
  }
  ctx.restore();
}
function runScenes(V, t) {
  const S = V.scenes; let idx = S.findIndex(s => t >= s.a && t < s.b); if (idx < 0) idx = S.length - 1;
  let fx = null;
  for (const tr of V.trans) {
    if (Math.abs(t - tr.at) < tr.dur / 2) {
      const i = S.findIndex(s => Math.abs(s.a - tr.at) < .001); if (i < 1) continue;
      const p = (t - (tr.at - tr.dur / 2)) / tr.dur;
      let fa, fb;
      const A = renderLayer(0, () => { fa = S[i - 1].fn(t); });
      const B = renderLayer(1, () => { fb = S[i].fn(t); });
      transition(tr.kind, p, A, B, tr);
      return Object.assign({}, fb || {}, { glitch: Math.max((fa && fa.glitch) || 0, (fb && fb.glitch) || 0, tr.kind === 'glitch' ? Math.sin(p * Math.PI) * .7 : 0) });
    }
  }
  fx = S[idx].fn(t); return fx || {};
}
