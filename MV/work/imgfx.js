// ===== illustration shots (source coords are the ORIGINAL 2000x1500 key visual) =====
const KEY = new Image(); KEY.src = 'img/key2x.jpg';
const KS = 2; // key2x is 2x of source coords
// forbidden: printed caption in top-right (x>1195 && y<370)
const SHOTS = {
  full: { cx: 810, cy: 775, sw: 760 },     // whole figure, face at top
  face: { cx: 880, cy: 440, sw: 500 },     // face + earrings + upper bust
  bust: { cx: 880, cy: 600, sw: 620 },     // bust / lace, face small at top
  mid: { cx: 900, cy: 950, sw: 560 },      // under-bust, ribbon, navel, lace  (no face)
  low: { cx: 700, cy: 1000, sw: 560 },     // shaft area (no face)
  balls: { cx: 760, cy: 1055, sw: 500 },   // bottom area (no face)
  thigh: { cx: 1560, cy: 1000, sw: 560 },  // lace skirt / thigh (no face)
  room: { cx: 250, cy: 650, sw: 500 },     // ornate room wall (no figure)
};
function clampShot(cx, cy, sw) {
  sw = Math.min(sw, 1500 * 9 / 16 * 1.0 + 0, 2000); const sh = sw * 16 / 9;
  cx = clamp(cx, sw / 2, 2000 - sw / 2); cy = clamp(cy, sh / 2, 1500 - sh / 2);
  if (cy - sh / 2 < 372 && cx + sw / 2 > 1192) cx = 1192 - sw / 2;
  return [cx, cy, sw, sh];
}
// o: {z (zoom mult), dx, dy (source px), rot, filter}
function shot(s, o = {}) {
  if (typeof s === 'string') s = SHOTS[s];
  const z = o.z || 1; let [cx, cy, sw, sh] = clampShot(s.cx + (o.dx || 0), s.cy + (o.dy || 0), s.sw / z);
  ctx.save();
  if (o.filter) ctx.filter = o.filter;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (o.rot) { ctx.translate(W / 2, H / 2); ctx.rotate(o.rot); ctx.scale(1.08, 1.08); ctx.translate(-W / 2, -H / 2); }
  ctx.drawImage(KEY, (cx - sw / 2) * KS, (cy - sh / 2) * KS, sw * KS, sh * KS, 0, 0, W, H);
  ctx.restore();
  return { cx, cy, sw, sh };
}
function lerpShot(a, b, p) { a = typeof a === 'string' ? SHOTS[a] : a; b = typeof b === 'string' ? SHOTS[b] : b; return { cx: lerp(a.cx, b.cx, p), cy: lerp(a.cy, b.cy, p), sw: lerp(a.sw, b.sw, p) }; }
function tintK(col, alpha, mode = 'soft-light') { ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function grad(y0, y1, c0, c1, mode = 'source-over') { ctx.save(); ctx.globalCompositeOperation = mode; const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0)); ctx.restore(); }
function scan(alpha = .08, step = 6) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#000'; for (let y = 0; y < H; y += step) ctx.fillRect(0, y, W, step / 2); ctx.restore(); }
// RGB split of the illustration itself (drawn additively)
function shotSplit(s, o, amt) {
  if (amt < .5) return shot(s, o);
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const cols = [['#ff0000', -amt], ['#00ff00', 0], ['#0000ff', amt]];
  for (const [c, dx] of cols) {
    const L = renderLayer(4, () => { shot(s, Object.assign({}, o)); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(L, dx, 0); ctx.restore();
  }
}
