// ===== V1 ハイテンション =====
const FH = 'Dela Gothic One', FM = 'Shippori Mincho B1';
const P = { bg: '#0B0B12', pink: '#FF2E7E', gold: '#FFD84A', red: '#C4143C', white: '#fff', rose: '#F4B6A6' };
const POOL = [...'ガチ金玉パンパン踏潰蹂躙鍵檻奥喉穴孕熱悦罰服従執事嬢様命令欲支配♡！'];

function bgV1(t) {
  const pal = t < 8 ? ['#0B0B12', '#240a2a', '#FF2E7E'] : t < 14 ? ['#1a0308', '#5a0b1e', '#FF3355'] : t < 20 ? ['#0B0B12', '#2a0a33', '#FF2E7E']
    : t < 28 ? ['#2a0620', '#7a0a45', '#FF2E7E'] : t < 36 ? ['#050508', '#150a25', '#FFD84A'] : t < 44 ? ['#08080c', '#1c1608', '#FFD84A']
    : t < 52 ? ['#3a0518', '#a0103f', '#FF6E9E'] : ['#060b1c', '#101c3a', '#FF2E7E'];
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const e = env(t), p = pulse(t, 7);
  glowCircle(W / 2, 980 + Math.sin(t * 1.3) * 60, 760 + e * 260 + p * 120, pal[2], .35 + p * .25);
  // diagonal pop stripes
  ctx.save(); ctx.globalAlpha = .06; ctx.fillStyle = '#fff'; ctx.translate(W / 2, H / 2); ctx.rotate(-.5);
  for (let i = -20; i < 20; i++) { const x = i * 120 + (t * 40 % 120); ctx.fillRect(x, -H, 36, H * 2); }
  ctx.restore();
  particles(t, 36, 11, t < 52 ? '#FFD84A' : '#F4B6A6', { sz: 9, sp: 40 });
  if (t < 52) particles(t, 10, 5, '#FF2E7E', { kind: 'heart', sz: 14, sp: 60 });
}

function punchS(lt, k = 14, amp = .6) { return 1 + amp * Math.exp(-lt * k); }
function slam(t, t0, o = {}) { // returns per-char generator basics
  const lt = t - t0; return lt;
}
function shake(t, a = 6) { return [(hash(Math.floor(t * 30) * 3) - .5) * a * 2, (hash(Math.floor(t * 30) * 3 + 1) - .5) * a * 2]; }

function S1(t) {
  const A = t < 1.4;
  if (A) {
    // elegant intro
    const fg = ctx.createLinearGradient(0, 700, 0, 1300); fg.addColorStop(0, 'rgba(255,216,74,0)'); fg.addColorStop(1, 'rgba(255,46,126,.15)');
    figure(ctx, W / 2, 200, 1800, { col: '#1c0a2c', rim: '#FF2E7E', rimA: .5 });
    butler(ctx, W / 2, 1830, 120, '#000');
    const per = (i, n) => { const a = E.out3(seg(t, .1 + i * .07, .5 + i * .07)); return { a, blur: (1 - a) * 14, dy: (1 - a) * 30 }; };
    TX('ごきげんよう、', W / 2, 860, { font: FM, weight: 800, size: 84, fill: P.gold, ls: 10, per, shadow: { c: P.gold, b: 20 } });
    TX('執事さん♡', W / 2, 1010, { font: FM, weight: 800, size: 118, fill: '#fff', ls: 8, per: (i, n) => per(i + 4, n), shadow: { c: P.pink, b: 30 } });
  } else {
    const lt = t - 1.4;
    figure(ctx, W / 2, 200, 1800, { col: '#1c0a2c', rim: '#FF2E7E', rimA: .7 });
    butler(ctx, W / 2, 1830, 120, '#000');
    const s = punchS(lt, 10, .5), [sx, sy] = shake(t, 5 * Math.exp(-lt * 6));
    const per = (i, n) => ({ s, dx: sx, dy: sy, r: (hash(i) - .5) * .06 * Math.exp(-lt * 6) });
    TX('ごきげんよう、', W / 2, 800, { size: 150, maxW: 920, fill: P.pink, stroke: { c: '#fff', w: 6 }, ext: { c: '#3a0020', n: 10, dx: 3, dy: 5 }, per });
    TX('執事さん♡', W / 2, 1050, { size: 215, maxW: 920, fill: '#fff', stroke: { c: P.pink, w: 8 }, ext: { c: P.pink, n: 12, dx: 3, dy: 6 }, per });
    return { glitch: .5 * Math.exp(-lt * 5), chroma: 6 };
  }
}

function S2(t) {
  const lt = t - 3;
  const rise = 1 - E.out3(seg(t, 3, 4.4));
  figure(ctx, W / 2, 160 + rise * 900, 2000, { col: '#22103a', rim: '#FF2E7E', rimA: .8 });
  butler(ctx, W / 2, 1840 + rise * 300, 110, '#000', 'bow');
  const L = [['今日も', 3.0, 545, 135, P.white], ['いじめ倒して', 3.9, 790, 175, P.pink], ['差し上げますわ！', 4.8, 1040, 122, P.gold]];
  for (const [s, t0, y, sz, col] of L) {
    const l = t - t0; if (l < 0) continue;
    const sc = punchS(l, 13, .7), [sx, sy] = shake(t, 9 * Math.exp(-l * 8));
    TX(s, W / 2, y, { size: sz, maxW: 970, fill: col, stroke: { c: '#12061a', w: 10 }, ext: { c: col === P.white ? P.pink : '#7a0a2c', n: 9, dx: 2, dy: 6 }, per: (i, n) => ({ s: sc, dx: sx, dy: sy + Math.max(0, .12 - l - i * .0) * 0, a: clamp(l * 60 - i * .3) }) });
  }
  return { glitch: t < 4.8 ? 0 : .15 * Math.exp(-((t - 4.8) % 0.9) * 6), chroma: 4 };
}

function S3(t) {
  const HITS = [8.5, 9.2, 9.9, 10.6, 11.3, 12.0, 12.7, 13.4];
  let last = -1, nextH = 14.1;
  for (const h of HITS) { if (t >= h) last = h; else { nextH = h; break; } }
  const prev = last < 0 ? 7.8 : last;
  const ph = clamp((t - prev) / (nextH - prev));
  // sole rises slow then slams
  const up = ph < .8 ? E.io(ph / .8) : 1, y = ph < .8 ? lerp(1400, 1000, up) : lerp(1000, 1420, E.in3((ph - .8) / .2));
  const hitLt = last < 0 ? 9 : t - last;
  // butler squashed
  const squash = 1 - .35 * Math.exp(-hitLt * 6);
  ctx.save(); ctx.translate(W / 2, 1780); ctx.scale(1, squash); butler(ctx, 0, 0, 100, '#000', 'bow'); ctx.restore();
  sole(ctx, W / 2, y, 900, '#12030a');
  ctx.save(); ctx.globalAlpha = .55; ctx.strokeStyle = P.pink; ctx.lineWidth = 2.2; ctx.translate(W / 2, y); ctx.scale(900 / 250, 900 / 250); solePath(ctx); ctx.stroke(); ctx.restore();
  // impact ring
  if (last > 0) { const l = t - last; if (l < .5) { ctx.save(); ctx.globalAlpha = (1 - l / .5) * .8; ctx.strokeStyle = P.gold; ctx.lineWidth = 12 * (1 - l / .5) + 2; ctx.beginPath(); ctx.ellipse(W / 2, 1720, 100 + l * 1200, 30 + l * 250, 0, 0, 7); ctx.stroke(); ctx.restore(); } }
  const [sx, sy] = last > 0 ? shake(t, 14 * Math.exp(-(t - last) * 9)) : [0, 0];
  ctx.save(); ctx.translate(sx, sy);
  if (t < 10.2) {
    TX('ほーらほらほら♡', W / 2, 420, { size: 132, maxW: 920, fill: '#fff', stroke: { c: P.red, w: 9 }, ext: { c: '#3a0010', n: 8, dx: 2, dy: 6 },
      per: (i, n) => ({ dy: Math.sin(t * 12 + i * .9) * 16, s: 1 + .1 * Math.sin(t * 12 + i), a: E.out3(seg(t, 8 + i * .04, 8.25 + i * .04)) }) });
  } else if (t < 12) {
    const l1 = t - 10.2, l2 = t - 11.0;
    if (l1 > 0) TX('踏んで', 400, 700, { size: 260, maxW: 700, fill: P.gold, stroke: { c: '#3a0010', w: 12 }, ext: { c: P.red, n: 10, dx: 3, dy: 6 }, per: () => ({ s: punchS(l1, 12, .8), r: -.14 }) });
    if (l2 > 0) TX('踏んで', 690, 1010, { size: 260, maxW: 700, fill: P.white, stroke: { c: '#3a0010', w: 12 }, ext: { c: P.pink, n: 10, dx: 3, dy: 6 }, per: () => ({ s: punchS(l2, 12, .8), r: .1 }) });
  } else {
    const l = t - 12;
    TX('踏みまくりますわ！', W / 2, 620, { size: 112, maxW: 920, fill: '#fff', stroke: { c: P.red, w: 10 }, ext: { c: '#3a0010', n: 10, dx: 2, dy: 7 },
      per: (i, n) => { const a = clamp(l * 40 - i * 2.5); return { a, s: punchS(clamp(l - i * .05, 0, 9), 12, .5), dy: Math.sin(t * 20 + i) * 6 }; } });
  }
  ctx.restore();
  return { glitch: .2 * Math.exp(-(t - Math.max(last, 8)) * 8), chroma: 3 };
}

function S4(t) {
  const lt = t - 14;
  const panel = E.out3(seg(t, 14, 14.5));
  const px = 80, pw = 920, py = 430, ph = 1080;
  ctx.save(); ctx.translate(W / 2, py + ph / 2); ctx.scale(1, panel); ctx.translate(-W / 2, -(py + ph / 2));
  rr(px, py, pw, ph, 28); ctx.fillStyle = 'rgba(16,6,24,.9)'; ctx.fill();
  const bg = ctx.createLinearGradient(0, py, 0, py + ph); bg.addColorStop(0, 'rgba(255,46,126,.25)'); bg.addColorStop(1, 'rgba(255,216,74,.08)');
  rr(px, py, pw, ph, 28); ctx.fillStyle = bg; ctx.fill();
  rr(px, py, pw, ph, 28); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; ctx.stroke();
  rr(px + 14, py + 14, pw - 28, ph - 28, 20); ctx.strokeStyle = 'rgba(255,46,126,.7)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  if (t > 14.3) {
    const a = E.out3(seg(t, 14.3, 14.9));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * -40);
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 640, 135, 0, 7); ctx.clip();
    const g = ctx.createRadialGradient(W / 2, 640, 20, W / 2, 640, 150); g.addColorStop(0, '#3a1040'); g.addColorStop(1, '#12061a'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 150, 490, 300, 300);
    figure(ctx, W / 2, 560, 900, { col: '#000', rim: P.pink, rimA: .9 });
    ctx.restore();
    ctx.strokeStyle = P.pink; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(W / 2, 640, 135, 0, 7); ctx.stroke();
    ctx.restore();
  }
  TX('離れ小島のお嬢様', W / 2, 850, { size: 96, maxW: 820, fill: '#fff', stroke: { c: P.pink, w: 6 }, ext: { c: '#4a0028', n: 6, dx: 2, dy: 4 },
    per: (i, n) => { const l = t - (14.5 + i * .06); const a = clamp(l * 8); return { a, dy: (1 - E.out3(clamp(l * 4))) * -60, s: 1 + .5 * Math.exp(-Math.max(0, l) * 12) }; } });
  // CV typewriter
  const cvStr = 'CV 山田じぇみ子'; const nshow = Math.floor(clamp((t - 15.1) / .7) * [...cvStr].length + .001);
  if (nshow > 0) TX([...cvStr].slice(0, nshow).join(''), W / 2, 950, { font: FM, weight: 800, size: 56, fill: P.gold, ls: 4 });
  // title wipe
  const wp = seg(t, 15.5, 16.1);
  if (wp > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 990, W * wp * 1.0, 100); ctx.clip(); TX('化け物と呼ばれた主人', W / 2, 1040, { font: FM, weight: 800, size: 62, maxW: 820, fill: P.rose, ls: 4 }); ctx.restore(); }
  // tags
  const tags = [['#二メートルの巨躯', 15.9, 250, 1130], ['#ふたなり', 16.15, 780, 1130], ['#執着', 16.4, 250, 1214]];
  for (const [s, t0, cx, cy] of tags) {
    const l = t - t0; if (l < 0) continue; const sc = E.back(clamp(l * 5));
    const w = [...s].length * 44 + 56;
    ctx.save(); ctx.translate(cx + (s === '#ふたなり' ? -0 : 0), cy); ctx.scale(sc, sc);
    ctx.translate(s === '#執着' ? 0 : 0, 0);
    rr(-w / 2 + (s === '#二メートルの巨躯' ? 130 : s === '#ふたなり' ? -40 : -60), -32, w, 64, 32);
    ctx.fillStyle = P.pink; ctx.fill(); ctx.restore();
    TX(s, cx + (s === '#二メートルの巨躯' ? 130 : s === '#ふたなり' ? -40 : -60), cy + 2, { font: FM, weight: 800, size: 40, fill: '#fff', per: () => ({ s: sc }) });
  }
  // reveal flip
  const crackT = seg(t, 17.4, 18.1);
  if (t < 18.1 && t > 16.8) {
    const a = E.out3(seg(t, 16.8, 17.2));
    ctx.save(); ctx.globalAlpha = a;
    const sh = crackT > 0 ? (hash(Math.floor(t * 30)) - .5) * 10 * crackT : 0;
    TX('上品な令嬢', W / 2 + sh, 1370, { font: FM, weight: 800, size: 118, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 20 } });
    ctx.restore();
    if (crackT > 0) {
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.shadowColor = P.pink; ctx.shadowBlur = 18; ctx.beginPath();
      const n = Math.floor(crackT * 14); let x = 420, y = 1310; ctx.moveTo(x, y);
      const r = rnd(5);
      for (let i = 0; i < n; i++) { x += 20 + r() * 26; y += (r() - .5) * 70 + (i % 2 ? 30 : -30) * .5; ctx.lineTo(x, y); }
      ctx.stroke(); ctx.restore();
    }
  } else if (t >= 18.1) {
    const l = t - 18.1;
    // shards flying
    if (l < .5) { ctx.save(); ctx.globalAlpha = 1 - l / .5; ctx.translate(0, l * 400); ctx.rotate(l * .3); TX('上品な令嬢', W / 2, 1370, { font: FM, weight: 800, size: 118, fill: '#fff', ls: 6 }); ctx.restore(); }
    TX('興奮が止まりませんの♡', W / 2, 1370, { size: 88, maxW: 860, fill: P.pink, stroke: { c: '#fff', w: 5 }, ext: { c: '#3a0020', n: 6, dx: 2, dy: 4 },
      shadow: { c: P.pink, b: 30 }, per: (i, n) => ({ s: punchS(clamp(l - i * .03, 0, 9), 11, .6), a: clamp(l * 30 - i * .8) }) });
  }
  return { glitch: t > 18 && t < 18.5 ? .8 : 0, chroma: 3 + (t > 18.1 ? 3 : 0) };
}

function S5(t) {
  const e = env(t), p = pulse(t, 8);
  // orbs
  if (t > 22.3 && t < 25.6) {
    const a = E.out3(seg(t, 22.3, 22.9)) * (1 - seg(t, 25.2, 25.6));
    for (const [x, y] of [[340, 1400], [740, 1400]]) {
      const r = 190 * (1 + .12 * Math.sin(t * 9) + p * .12 + e * .1);
      ctx.save(); ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#ffb3d1'); g.addColorStop(.4, P.pink); g.addColorStop(1, '#5a0030');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.globalAlpha = a * .8; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x - r * .35, y - r * .4, r * .18, r * .1, -.6, 0, 7); ctx.fill();
      ctx.restore();
    }
  }
  if (t < 22.6) {
    const l = t - 20; const [sx, sy] = shake(t, 4 + e * 12);
    const chars = scrambleStr('ガチガチ', t, 20, .35, POOL, 1);
    TX(chars.map(c => c || ' ').join(''), W / 2 + sx, 560 + sy, { size: 250, maxW: 920, fill: '#fff', stroke: { c: P.red, w: 12 }, ext: { c: P.gold, n: 12, dx: 3, dy: 7 },
      per: (i) => ({ a: chars[i] ? 1 : 0, s: 1 + .08 * p + .5 * Math.exp(-Math.max(0, t - 20 - i * .06) * 12) }) });
  }
  if (t >= 22.4 && t < 25.6) {
    const l = t - 22.4;
    TX('金玉パンパン', W / 2, 900, { size: 170, maxW: 920, fill: P.gold, stroke: { c: '#3a0010', w: 12 }, ext: { c: P.red, n: 10, dx: 3, dy: 7 },
      per: (i, n) => ({ s: (1 + .2 * p) * punchS(clamp(l - i * .05, 0, 9), 11, .6), dy: Math.sin(t * 16 + i * .8) * 10, a: clamp(l * 30 - i * 1.4) }) });
  }
  if (t >= 25.5) {
    const l = t - 25.5;
    for (const [s, y, off] of [['もう待てま', 900, 0], ['せんわ！！', 1130, .35]]) {
      TX(s, W / 2, y, { size: 190, maxW: 920, fill: '#fff', stroke: { c: P.pink, w: 10 }, ext: { c: '#3a0020', n: 8, dx: 2, dy: 6 },
        per: (i, n) => { const [sx, sy] = shake(t + i, 6); return { dx: sx, dy: sy, s: punchS(clamp(l - off - i * .05, 0, 9), 11, .7), a: clamp((l - off) * 30 - i * 1.2) }; } });
    }
  }
  const gl = t > 25.5 ? .12 + .2 * p : (t > 20 && t < 20.5 ? .5 : 0);
  return { glitch: gl, chroma: 4 + p * 9 };
}

function S6(t) {
  const e = env(t), p = pulse(t, 8);
  // radial visualizer
  const cx = 500, cy = 1010, N = 72;
  const a0 = E.out3(seg(t, 28, 28.6));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .25); ctx.globalAlpha = a0 * .9;
  for (let i = 0; i < N; i++) {
    const v = .25 + .75 * hash(Math.floor(t * 15) * 0.37 + i * 1.7) * (.35 + e * .9 + p * .4);
    const ang = i / N * 6.283; const r0 = 240, r1 = r0 + v * 190;
    ctx.strokeStyle = i % 3 === 0 ? P.gold : P.pink; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); ctx.lineTo(Math.cos(ang) * r1, Math.sin(ang) * r1); ctx.stroke();
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = a0; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 215, 0, 7); ctx.stroke(); ctx.restore();
  // band + wipe text
  if (t < 31.2) {
    const w = E.out5(seg(t, 28, 28.6));
    ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-.06);
    ctx.fillStyle = P.pink; ctx.fillRect(-W / 2 - 40 + (1 - w) * -W, -100, W + 80, 200);
    ctx.fillStyle = P.gold; ctx.fillRect(-W / 2 - 40 + (1 - w) * -W, 100, W + 80, 12);
    ctx.restore();
    const tw = seg(t, 28.3, 29.0);
    ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-.06);
    ctx.beginPath(); ctx.rect(-W / 2, -120, W * tw, 240); ctx.clip();
    TX('お口をお貸しなさい♡', 0, 0, { size: 100, maxW: 940, fill: '#fff', stroke: { c: '#3a0020', w: 8 } });
    ctx.restore();
  }
  // vertical slam
  if (t >= 30.9 && t < 33.6) {
    VX('喉奥まで', 905, 640, { font: FH, size: 150, gap: 1.02, fill: P.gold, stroke: { c: '#1c1608', w: 10 }, ext: { c: P.red, n: 8, dx: 3, dy: 5 },
      per: (i) => { const l = t - (30.9 + i * .28); return { a: l > 0 ? 1 : 0, s: punchS(Math.max(0, l), 12, .9), dx: shake(t + i, 5 * Math.exp(-Math.max(0, l) * 6))[0] }; } });
  }
  if (t >= 33.4) {
    const l = t - 33.4; const off = Math.floor(l * 10) % 2 ? 1 : 0;
    const per = (i) => ({ s: punchS(clamp(l - i * .05, 0, 9), 11, .6), a: clamp(l * 30 - i * 1.4) });
    TX('オナホ執事', W / 2, 1560, { size: 200, maxW: 920, fill: null, stroke: { c: P.pink, w: 10 }, ext: { c: '#3a0020', n: 8, dx: 3, dy: 6 }, per });
    TX('オナホ執事', W / 2, 1560, { size: 200, maxW: 920, fill: '#fff', per });
  }
  return { glitch: t > 33.4 ? .4 * Math.exp(-(t - 33.4) * 3) + .1 : 0, chroma: 3 + p * 6 };
}

function S7(t) {
  const e = env(t), p = pulse(t, 8);
  // cage
  const ca = E.out3(seg(t, 36, 37));
  const [sx, sy] = t > 38.9 && t < 39.3 ? shake(t, 10) : [0, 0];
  ctx.save(); ctx.translate(sx, sy); ctx.globalAlpha = ca;
  ctx.shadowColor = P.gold; ctx.shadowBlur = 30 + p * 20;
  cage(ctx, W / 2, 860, 520, P.gold, 7);
  ctx.restore();
  // padlock drops
  if (t > 38.4) {
    const l = t - 38.4, d = E.out3(clamp(l / .45)); const y = lerp(300, 1010, d);
    ctx.save(); ctx.translate(sx, sy); ctx.shadowColor = P.gold; ctx.shadowBlur = 24; padlock(ctx, W / 2, y, 260, '#FFD84A', 1 - clamp((l - .45) / .15)); ctx.restore();
    if (l > .45 && l < .9) { for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; const r = (l - .45) * 700; sparkle(W / 2 + Math.cos(a) * r, 1010 + Math.sin(a) * r * .5, 22 * (1 - (l - .45) / .45), '#fff', 1 - (l - .45) / .45); } }
  }
  if (t < 38.6) {
    const l = t - 36;
    TX('三ヶ月', W / 2, 400, { size: 270, maxW: 920, fill: P.gold, stroke: { c: '#1c1608', w: 12 }, ext: { c: '#7a5a00', n: 10, dx: 3, dy: 6 }, per: (i) => ({ s: punchS(clamp(l - i * .12, 0, 9), 10, .8), a: clamp(l * 40 - i * 4), r: (1 - E.out3(clamp(l * 3 - i * .3))) * .5 }) });
  } else if (t < 41.3) {
    const l = t - 38.9;
    TX('オナ禁', W / 2, 1420, { size: 270, maxW: 920, fill: '#fff', stroke: { c: P.red, w: 12 }, ext: { c: P.red, n: 12, dx: 3, dy: 7 }, per: (i) => ({ s: punchS(clamp(l - i * .1, 0, 9), 10, .9), a: clamp(l * 40 - i * 4) }) });
  }
  if (t >= 41.2) {
    const l = t - 41.2;
    // key pendulum
    const ang = Math.sin(l * 4.2) * .35 * Math.exp(-l * .4);
    ctx.save(); ctx.translate(W / 2, 150); ctx.rotate(ang); ctx.shadowColor = P.gold; ctx.shadowBlur = 24;
    ctx.strokeStyle = P.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 240); ctx.stroke();
    keyShape(ctx, 0, 380, 260, P.gold, 0); ctx.restore();
    TX('鍵は、', W / 2, 1540, { size: 128, maxW: 920, fill: '#fff', stroke: { c: '#1c1608', w: 10 }, per: (i) => ({ s: punchS(clamp(l - i * .06, 0, 9), 11, .6), a: clamp(l * 30 - i * 1.4) }) });
    TX('わたくしの手の中♡', W / 2, 1690, { size: 112, maxW: 920, fill: P.gold, stroke: { c: '#1c1608', w: 10 }, per: (i) => ({ s: punchS(clamp(l - .4 - i * .05, 0, 9), 11, .6), a: clamp((l - .4) * 30 - i * 1.4) }) });
  }
  return { glitch: t > 38.9 && t < 39.2 ? .5 : 0, chroma: 3 };
}

function S8(t) {
  const p = pulse(t, 9), e = env(t);
  // radial speed streaks
  if (t >= 46) {
    ctx.save(); ctx.translate(W / 2, 900); ctx.globalAlpha = .4 + p * .3; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
    for (let i = 0; i < 40; i++) { const a = hash(i) * 6.283, r0 = 250 + hash(i + 9) * 200 + ((t * 900 * (.5 + hash(i + 3))) % 900), len = 60 + hash(i + 5) * 220; ctx.lineWidth = 3 + hash(i + 7) * 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * (r0 + len), Math.sin(a) * (r0 + len)); ctx.stroke(); }
    ctx.restore();
  }
  if (t < 46.2) {
    const l = t - 44;
    for (let g = 3; g >= 0; g--) {
      const tt = t - g * .045;
      const dy = -Math.abs(Math.sin(tt * 11)) * 110;
      ctx.save(); ctx.globalAlpha = g === 0 ? 1 : .18 / g;
      TX('ヘコヘコ♡', W / 2, 760 + dy, { size: 270, maxW: 920, fill: g === 0 ? '#fff' : P.gold, stroke: { c: g === 0 ? P.red : null, w: 12 }, ext: g === 0 ? { c: '#3a0010', n: 12, dx: 3, dy: 8 } : null,
        per: (i) => ({ sy: 1 - .14 * Math.max(0, Math.cos(tt * 11)) * (dy > -20 ? 1 : 0), sx: 1 + .08 * Math.max(0, Math.cos(tt * 11)), a: clamp(l * 40 - i * 2) }) });
      ctx.restore();
    }
  } else if (t < 47.9) {
    const l = t - 46.2; const [sx, sy] = shake(t, 10);
    TX('オス穴', W / 2 + sx, 900 + sy, { size: 330, maxW: 920, fill: '#fff', stroke: { c: P.pink, w: 14 }, ext: { c: '#3a0020', n: 14, dx: 4, dy: 8 }, per: (i) => ({ s: punchS(clamp(l - i * .07, 0, 9), 11, .9), a: clamp(l * 40 - i * 3) }) });
  } else if (t < 49.4) {
    const l = t - 47.9; const zs = 1 + 2.4 * Math.pow(1 - E.out5(clamp(l / .28)), 1);
    TX('奥まで', W / 2, 880, { size: 330, maxW: 920, fill: P.gold, stroke: { c: '#3a0010', w: 14 }, ext: { c: P.red, n: 14, dx: 4, dy: 8 }, per: () => ({ s: zs, a: clamp(l * 20), dx: shake(t, 6)[0] }) });
  } else {
    const l = t - 49.4;
    const sc = punchS(l, 8, .5);
    TX('ぶっぱなし', W / 2, 720, { size: 230, maxW: 920, fill: '#fff', stroke: { c: P.red, w: 14 }, ext: { c: '#3a0010', n: 14, dx: 4, dy: 8 }, per: (i) => ({ s: sc * punchS(clamp(l - i * .05, 0, 9), 12, .3), a: clamp(l * 40 - i * 3), dx: shake(t + i, 8 * Math.exp(-l * 2))[0] }) });
    TX('ですわ！！', W / 2, 1010, { size: 200, maxW: 920, fill: P.gold, stroke: { c: '#3a0010', w: 14 }, ext: { c: P.red, n: 14, dx: 4, dy: 8 }, per: (i) => ({ s: sc * punchS(clamp(l - .3 - i * .05, 0, 9), 12, .3), a: clamp((l - .3) * 40 - i * 3) }) });
  }
  // countdown strip
  if (t >= 47.9) {
    const idx = t < 48.8 ? 0 : t < 49.7 ? 2 : t < 50.6 ? 4 : 6;
    const l = t - 47.9;
    TX('3・2・1・0', W / 2, 1600, { size: 165, maxW: 920, fill: '#fff', stroke: { c: '#3a0010', w: 10 }, ext: { c: P.pink, n: 8, dx: 3, dy: 6 }, per: (i) => {
      const on = i === idx; const t0 = [47.9, 0, 48.8, 0, 49.7, 0, 50.6][i] || 0; return { a: clamp(l * 20) * (on ? 1 : (i % 2 ? .3 : .28)), s: on ? 1.25 * punchS(Math.max(0, t - t0), 12, .5) : .9, fill: on ? P.gold : '#fff' };
    } });
  }
  return { glitch: t > 49.4 ? .08 + .18 * p : .05 * p, chroma: 3 + p * 8 };
}

function S9(t) {
  const lt = t - 52; const fo = 1 - seg(t, 55.0, 55.6);
  // sea horizon
  const yh = 1250;
  ctx.save(); const g = ctx.createLinearGradient(0, yh - 250, 0, yh + 50); g.addColorStop(0, 'rgba(255,46,126,0)'); g.addColorStop(1, 'rgba(255,46,126,.4)'); ctx.fillStyle = g; ctx.fillRect(0, yh - 250, W, 300); ctx.restore();
  waves(t, yh, 22, (l) => ['#0a1530', '#0c1a3c', '#0e2048'][l], 1.1, 3, 1);
  // moon
  glowCircle(800, 420, 340, 'rgba(244,182,166,.7)', .8);
  ctx.fillStyle = '#F4B6A6'; ctx.beginPath(); ctx.arc(800, 420, 90, 0, 7); ctx.fill();
  ctx.save(); ctx.globalAlpha = fo;
  TX('船は、あと一年', W / 2, 760, { font: FM, weight: 800, size: 120, maxW: 940, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 30 },
    per: (i) => { const a = E.out3(seg(t, 52.1 + i * .08, 52.6 + i * .08)); return { a, blur: (1 - a) * 12, dy: (1 - a) * 20 }; } });
  TX('来ませんわ♡', W / 2, 950, { font: FM, weight: 800, size: 140, maxW: 940, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 30 },
    per: (i) => { const a = E.out3(seg(t, 52.8 + i * .08, 53.3 + i * .08)); return { a: a * (1 - seg(t, 55.2, 55.6) * 0), blur: (1 - a) * 12, dy: (1 - a) * 20 }; } });
  ctx.restore();
  return { glitch: 0, chroma: 2 };
}

function S10(t) {
  const a1 = E.out3(seg(t, 54.6, 55.3));
  TX('逃げられませんわよ♡', W / 2, 470, { font: FH, size: 100, maxW: 940, fill: P.pink, stroke: { c: '#fff', w: 5 }, shadow: { c: P.pink, b: 24 },
    per: (i) => ({ a: clamp((t - 54.6 - i * .05) * 12), s: punchS(clamp(t - 54.6 - i * .05, 0, 9), 10, .5) }) });
  if (t >= 56.4) {
    const l = t - 56.4;
    [['デカふたなりの', 860, 132, '#fff', P.pink, 0], ['お嬢様は', 1010, 150, '#fff', P.pink, .3], ['オナホ執事を', 1170, 140, P.gold, P.red, .6], ['離さない', 1330, 170, P.gold, P.red, .9]].forEach(([s, y, sz, f, ec, off]) => {
      TX(s, W / 2, y, { size: sz, maxW: 920, fill: f, stroke: { c: '#3a0010', w: 9 }, ext: { c: ec, n: 8, dx: 3, dy: 6 },
        per: (i) => ({ a: clamp((l - off) * 20 - i * .9), s: punchS(clamp(l - off - i * .04, 0, 9), 11, .5) }) });
    });
    TX('CV 山田じぇみ子', W / 2, 1560, { font: FM, weight: 800, size: 58, fill: '#dfe6ff', ls: 6, per: () => ({ a: E.out3(seg(t, 57.3, 57.9)) }) });
  }
  return { glitch: 0, chroma: 2 };
}

const V1 = {
  draw(t) {
    bgV1(t);
    let fx = { glitch: 0, chroma: 3 };
    let r;
    if (t < 3) r = S1(t);
    else if (t < 8) r = S2(t);
    else if (t < 14) r = S3(t);
    else if (t < 20) r = S4(t);
    else if (t < 28) r = S5(t);
    else if (t < 36) r = S6(t);
    else if (t < 44) r = S7(t);
    else if (t < 52) r = S8(t);
    else { r = S9(t); }
    if (t >= 54.6) { const r2 = S10(t); }
    if (r) fx = Object.assign(fx, r);
    return fx;
  },
  post(t, fx) {
    bloom(.3, 10);
    sliceGlitch(t, fx.glitch || 0, 3);
    chroma((fx.chroma || 3) + (fx.glitch || 0) * 14);
    vignette(.55);
    grain(t, .06);
    flash(t, [1.4, 8.0, 14.0, 20.0, 22.4, 25.5, 28.0, 36.0, 38.9, 44.0, 46.2, 47.9, 49.4], '#fff', 12, .55);
    flash(t, [18.1], '#fff', 8, .95);
    flash(t, [51.4], '#fff', 3.2, 1);
    flash(t, [52.0], '#000', 8, .8);
    fadeIO(t, .5, .8);
  }
};
