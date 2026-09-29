// ===== V1 ハイテンション (v3: motion-blur / camera / transitions) =====
const FH = 'Dela Gothic One', FM = 'Shippori Mincho B1';
const P = { bg: '#0B0B12', pink: '#FF2E7E', hot: '#FF5FA2', gold: '#FFD84A', red: '#C4143C', white: '#fff', rose: '#F4B6A6', plum: '#2a0a33' };
const POOL = [...'ガチ金玉パンパン踏潰蹂躙鍵檻奥喉穴孕熱悦罰服従執事嬢様命令欲支配♡！'];

// generic kinetic text
function KT(str, cx, cy, o, t, t0, mode, stag = .05, ex = {}) {
  return TX(str, cx, cy, Object.assign({}, o, {
    per: (i, n) => {
      const l = t - (t0 + i * stag); if (l <= 0) return { a: 0 };
      let p;
      switch (mode) {
        case 'stamp': p = { a: clamp(l * 40), s: 1 + 1.4 * (1 - E.out5(clamp(l / .22))) }; break;
        case 'pop': p = { a: clamp(l * 30), s: Math.max(.001, E.elastic(clamp(l / .65))) }; break;
        case 'rise': { const q = E.out5(clamp(l / .5)); p = { a: clamp(l * 9), dy: (1 - q) * 130, blur: (1 - q) * 12 }; break; }
        case 'slideL': { const q = spring(l, 11, 6.5); p = { a: clamp(l * 20), dx: (1 - q) * -1000 }; break; }
        case 'slideR': { const q = spring(l, 11, 6.5); p = { a: clamp(l * 20), dx: (1 - q) * 1000 }; break; }
        case 'drop': { const q = E.out3(clamp(l / .32)); p = { a: clamp(l * 20), dy: (1 - q) * -520, r: (1 - q) * .7, s: 1 + (1 - q) * .35 }; break; }
        default: p = { a: clamp(l * 30) };
      }
      if (ex.add) { const q = ex.add(i, n, l, t); p.dx = (p.dx || 0) + (q.dx || 0); p.dy = (p.dy || 0) + (q.dy || 0); p.r = (p.r || 0) + (q.r || 0); p.s = (p.s === undefined ? 1 : p.s) * (q.s || 1); if (q.fill) p.fill = q.fill; }
      return p;
    }
  }));
}
const sty = (size, fill, sc, ec, o = {}) => Object.assign({ size, maxW: 930, fill, stroke: { c: sc, w: Math.round(size * .075) }, ext: { c: ec, n: Math.max(6, Math.round(size * .055)), dx: 2, dy: size * .028 } }, o);

// low-angle looming silhouette
function loom(c, cx, y0, s, o = {}) {
  c.save(); c.translate(cx, y0); c.scale(s, s);
  const g = c.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, o.top || '#34124a'); g.addColorStop(1, o.bot || '#0d0418');
  c.fillStyle = g;
  // hair
  c.beginPath(); c.moveTo(-60, 20); c.bezierCurveTo(-130, 150, -170, 420, -120, 760); c.lineTo(120, 760); c.bezierCurveTo(170, 420, 130, 150, 60, 20); c.closePath(); c.fill();
  // torso
  c.beginPath(); c.moveTo(-190, 300); c.bezierCurveTo(-260, 480, -130, 620, -115, 780); c.bezierCurveTo(-100, 900, -420, 1000, -430, 1500); c.lineTo(430, 1500); c.bezierCurveTo(420, 1000, 100, 900, 115, 780); c.bezierCurveTo(130, 620, 260, 480, 190, 300); c.closePath(); c.fill();
  // bust
  for (const sx of [-1, 1]) {
    const bx = sx * 165, by = 390;
    const rg = c.createRadialGradient(bx - sx * 40, by - 70, 20, bx, by, 230); rg.addColorStop(0, o.hi || '#7a2a86'); rg.addColorStop(.55, o.mid || '#3c1350'); rg.addColorStop(1, o.bot || '#12061e');
    c.fillStyle = rg; c.beginPath(); c.ellipse(bx, by, 200, 190, 0, 0, 7); c.fill();
    c.strokeStyle = o.rim || '#FF2E7E'; c.globalAlpha = o.rimA === undefined ? .75 : o.rimA; c.lineWidth = 6; c.beginPath(); c.ellipse(bx, by, 200, 190, 0, Math.PI * (sx > 0 ? -.75 : -.25), Math.PI * (sx > 0 ? .1 : -.9), sx < 0); c.stroke(); c.globalAlpha = 1;
  }
  // head
  c.fillStyle = o.top || '#34124a'; c.fillRect(-26, 110, 52, 90); c.beginPath(); c.ellipse(0, 70, 50, 62, 0, 0, 7); c.fill();
  c.strokeStyle = o.rim || '#FF2E7E'; c.globalAlpha = .5; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 70, 50, 62, 0, -1.2, .6); c.stroke(); c.globalAlpha = 1;
  c.restore();
}

function baseBG(t, top, bot, glow, ga = .4) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glowCircle(W / 2, 900 + Math.sin(t * 1.3) * 60, 800 + env(t) * 260 + pulse(t, 7) * 140, glow, ga + pulse(t, 7) * .2);
}
function sparkleLayer(t, n = 34, col = '#FFD84A') { particles(t, n, 11, col, { sz: 10, sp: 46 }); }
function heartsLayer(t, n = 12) { particles(t, n, 5, '#FF2E7E', { kind: 'heart', sz: 15, sp: 70 }); }

// ---------------------------------------------------- S1 0-3
function S1(t) {
  const cutT = 1.4;
  if (t < cutT) {
    baseBG(t, '#08050f', '#22093a', '#a01a66', .35);
    lightRays(W / 2, -60, t, 7, 'rgba(255,120,190,.35)', .5, 2300);
    fogLayer('pink', [255, 90, 170], t, .28, 2.6, 30, 6, 900, H, 2);
    const z = 1 + .1 * E.out2(seg(t, 0, cutT)) + .9 * E.in3(seg(t, 1.22, cutT)) ;
    ctx.save(); camT({ z, rot: -.02 * seg(t, 0, cutT) });
    const rise = 1 - E.out3(seg(t, .1, 1.3));
    loom(ctx, W / 2, 260 + rise * 900, 1.35, { rimA: .5 });
    butler(ctx, W / 2, 1850, 130, '#000', 'bow');
    const ls = lerp(70, 8, E.out3(seg(t, .1, 1.1)));
    const per = (i) => { const a = E.out3(seg(t, .15 + i * .07, .6 + i * .07)); return { a, blur: (1 - a) * 16, dy: (1 - a) * 24 }; };
    TX('ごきげんよう、', W / 2, 850, { font: FM, weight: 800, size: 88, fill: P.gold, ls, per, shadow: { c: P.gold, b: 26 } });
    TX('執事さん♡', W / 2, 1010, { font: FM, weight: 800, size: 122, fill: '#fff', ls: ls * .6, per: (i, n) => per(i + 5), shadow: { c: P.pink, b: 34 } });
    ctx.restore();
    return { chroma: 2 + 10 * E.in3(seg(t, 1.22, cutT)), glitch: 0 };
  }
  const l = t - cutT;
  baseBG(t, '#1a0630', '#7a0a45', '#FF2E7E', .5);
  sunburst(W / 2, 900, t, 22, 'rgba(255,46,126,.30)', 'rgba(0,0,0,0)', 1, .25);
  speedLines(W / 2, 900, t, 26, '#fff', .35, 320, 460, 4);
  ctx.save(); const [sx, sy] = shk(t, 16 * Math.exp(-l * 7)); camT({ z: 1 + .3 * Math.exp(-l * 6) * Math.cos(l * 14), x: sx, y: sy, rot: -.03 * Math.exp(-l * 5) });
  ring(W / 2, 920, l, P.gold, 1100, 22, .7); ring(W / 2, 920, l - .08, '#fff', 900, 10, .6);
  burst(W / 2, 920, l, 30, ['#FFD84A', '#FF2E7E', '#fff'], 800, 1.1, 3);
  const add = (i, n, ll, tt) => ({ dy: Math.sin(tt * 9 + i * .8) * 9 * seg(ll, .4, .8), r: Math.sin(tt * 7 + i) * .03 * seg(ll, .4, .8) });
  KT('ごきげんよう、', W / 2 - 10, 780, sty(150, P.pink, '#fff', '#3a0020'), t, cutT, 'slideL', .045, { add });
  KT('執事さん♡', W / 2 + 10, 1050, sty(218, '#fff', P.pink, P.pink), t, cutT + .12, 'slideR', .05, { add });
  ctx.restore();
  sparkleLayer(t, 30); heartsLayer(t, 14);
  return { glitch: .5 * Math.exp(-l * 5), chroma: 3 + 12 * Math.exp(-l * 6) };
}

// ---------------------------------------------------- S2 3-8
function S2(t) {
  baseBG(t, '#12061e', '#3a0a3f', '#FF2E7E', .4);
  sunburst(W / 2, 1000, t, 26, 'rgba(255,46,126,.20)', 'rgba(0,0,0,0)', 1, .12);
  typeRows('いじめ倒して', t, { size: 300, rows: 6, y0: 120, gap: 330, speed: 90, stroke: 'rgba(255,255,255,.10)', sw: 4 });
  const l0 = t - 3;
  ctx.save(); const punch = Math.max(0, 1 - Math.abs(((t - 3.0) % 0.9)) * 0);
  const pk = Math.max(pulse2(t, [3.0, 3.9, 4.8], 9)); const [sx, sy] = shk(t, 14 * pk);
  camT({ z: lerp(1.12, 1.0, E.out2(seg(t, 3, 8))) + .03 * pk, rot: lerp(.03, -.02, seg(t, 3, 8)), x: sx, y: sy });
  const rise = 1 - E.out3(seg(t, 3, 4.4));
  loom(ctx, W / 2, 130 + rise * 1000, 1.55, { top: '#3d1656', rimA: .8 });
  // shadow cast toward butler
  const sg = ctx.createLinearGradient(0, 1200, 0, H); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = sg; ctx.fillRect(0, 1200, W, 720);
  butler(ctx, W / 2, 1855 + rise * 300, 120, '#000', 'bow');
  ring(W / 2, 560, t - 3.0, P.pink, 700, 16, .6); ring(W / 2, 800, t - 3.9, P.gold, 800, 16, .6); ring(W / 2, 1040, t - 4.8, '#fff', 900, 16, .6);
  burst(W / 2, 560, t - 3.0, 12, ['#FFD84A', '#fff'], 500, .8, 5); burst(W / 2, 800, t - 3.9, 14, ['#FF2E7E', '#fff'], 600, .8, 9); burst(W / 2, 1040, t - 4.8, 18, ['#FFD84A', '#FF2E7E'], 700, .9, 13);
  const fl = (i, n, l, tt) => ({ dy: Math.sin(tt * 3 + i * .5) * 6 * seg(l, .5, 1) });
  KT('今日も', W / 2, 545, sty(140, '#fff', '#12061e', P.pink), t, 3.0, 'stamp', .06, { add: fl });
  KT('いじめ倒して', W / 2 - 10, 790, sty(178, P.pink, '#12061e', '#7a0a2c'), t, 3.9, 'slideL', .04, { add: fl });
  KT('差し上げますわ！', W / 2 + 10, 1040, sty(124, P.gold, '#12061e', '#7a0a2c'), t, 4.8, 'slideR', .035, { add: fl });
  ctx.restore();
  sparkleLayer(t, 24); heartsLayer(t, 10);
  return { glitch: t > 4.75 ? .18 * Math.exp(-(t - 4.8) * 8) : (t > 3.85 && t < 4.0 ? .3 : 0), chroma: 3 + 6 * pk };
}
function pulse2(t, arr, k = 9) { let m = 0; for (const a of arr) if (t >= a) m = Math.max(m, Math.exp(-(t - a) * k)); return m; }

// ---------------------------------------------------- S3 8-14
const HITS3 = [8.5, 9.2, 9.9, 10.6, 11.3, 12.0, 12.7, 13.4];
function S3(t) {
  baseBG(t, '#1a0308', '#5a0b1e', '#FF3355', .5);
  halftone(t, 'rgba(255,60,90,.35)', 1, 46, (x, y, tt) => .5 + .5 * Math.sin(x * .004 + y * .003 + tt * 2) * (.6 + env(tt)));
  typeRows('踏んで', t, { size: 420, rows: 5, y0: 200, gap: 400, speed: 140, stroke: 'rgba(255,255,255,.14)', sw: 5 });
  let last = -1, nextH = 14.3; for (const h of HITS3) { if (t >= h) last = h; else { nextH = h; break; } }
  const prev = last < 0 ? 7.7 : last, ph = clamp((t - prev) / (nextH - prev));
  const hitL = last < 0 ? 9 : t - last;
  const impact = Math.exp(-hitL * 9);
  ctx.save();
  const [sx, sy] = shk(t, 16 * impact); camT({ y: 44 * impact + sx * 0, x: sx, z: 1 + .05 * impact - .03 * (1 - ph) * (ph < .8 ? 1 : 0), rot: Math.sin(t * .6) * .01 });
  // sole motion: anticipation
  const up = ph < .8 ? E.io(ph / .8) : 1;
  const y = ph < .8 ? lerp(1450, 1000, up) + Math.sin(ph * 30) * 4 * up : lerp(1000, 1450, E.in3((ph - .8) / .2));
  const sc = 1 + .05 * up; // perspective grows as it rises
  const squash = 1 - .4 * impact;
  ctx.save(); ctx.translate(W / 2, 1785); ctx.scale(1 + .3 * impact, squash); butler(ctx, 0, 0, 96, '#000', 'bow'); ctx.restore();
  // ground shadow
  ctx.save(); ctx.globalAlpha = .55 * (1 - up * .6); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(W / 2, 1800, 260 * (1 + (1 - up)), 60, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(sc, sc); ctx.rotate(Math.sin(t * 1.4) * .03); ctx.translate(-W / 2, -y);
  const sg = ctx.createLinearGradient(0, y - 450, 0, y + 450); sg.addColorStop(0, '#2a0812'); sg.addColorStop(1, '#0a0208');
  sole(ctx, W / 2, y, 900, sg);
  ctx.globalAlpha = .7; ctx.strokeStyle = P.pink; ctx.lineWidth = 2.4; ctx.translate(W / 2, y); ctx.scale(900 / 250, 900 / 250); solePath(ctx); ctx.stroke();
  ctx.restore();
  if (last > 0) { ring(W / 2, 1790, hitL, P.gold, 1200, 26, .6, .28); ring(W / 2, 1790, hitL - .06, '#fff', 900, 12, .5, .28); burst(W / 2, 1750, hitL, 16, ['#FFD84A', '#FF2E7E', '#fff'], 620, .8, Math.floor(last * 10)); }
  ctx.restore();
  ctx.save(); camT({ x: sx * .5, y: 20 * impact });
  if (t < 10.2) {
    const l = t - 8;
    TX('ほーらほらほら♡', W / 2, 420, sty(140, '#fff', P.red, '#3a0010', { maxW: 940, per: (i, n) => { const a = E.out3(clamp((l - i * .05) * 6)); return { a, dy: Math.sin(t * 11 + i * .9) * 20 - (1 - a) * 80, s: (1 + .12 * Math.sin(t * 11 + i)) * (.6 + .4 * a), r: Math.sin(t * 8 + i) * .07, fill: i % 2 ? '#fff' : P.gold }; } }));
  } else if (t < 12) {
    KT('踏んで', 400, 700, sty(270, P.gold, '#3a0010', P.red, { maxW: 720 }), t, 10.2, 'stamp', .09, { add: () => ({ r: -.14 }) });
    ring(400, 700, t - 10.2, P.gold, 700, 20, .5); ring(690, 1010, t - 11.0, '#fff', 700, 20, .5);
    KT('踏んで', 690, 1010, sty(270, '#fff', '#3a0010', P.pink, { maxW: 720 }), t, 11.0, 'stamp', .09, { add: () => ({ r: .1 }) });
  } else {
    const hs = [12.0, 12.7, 13.4];
    const str = '踏みまくりますわ！';
    TX(str, W / 2, 640, sty(116, '#fff', P.red, '#3a0010', {
      maxW: 940, per: (i, n) => { const t0 = hs[Math.min(2, Math.floor(i / 3))] + (i % 3) * .1, l = t - t0; if (l <= 0) return { a: 0 }; return { a: 1, s: 1 + 1.3 * (1 - E.out5(clamp(l / .2))), dy: Math.sin(t * 18 + i) * 5 }; }
    }));
  }
  ctx.restore();
  sparkleLayer(t, 26);
  return { glitch: .25 * impact, chroma: 3 + 8 * impact };
}

// ---------------------------------------------------- S4 14-20 card
function S4(t) {
  baseBG(t, '#0B0B12', '#2a0a33', '#FF2E7E', .4);
  halftone(t, 'rgba(255,46,126,.25)', 1, 52, (x, y, tt) => Math.max(0, 1 - Math.hypot(x - W / 2, y - 900) / 1100) * (.7 + .3 * Math.sin(tt * 2 + x * .01)));
  typeRows('離れ小島のお嬢様', t, { size: 240, rows: 7, y0: 60, gap: 300, speed: 60, stroke: 'rgba(255,255,255,.07)', sw: 3, font: FM, weight: 800 });
  lightLeak(t, 'rgba(255,60,140,.4)', .5, .3);
  const px = 80, pw = 920, py = 430, ph = 1080;
  const pin = spring(t - 14, 9, 5.2), bounceY = (1 - pin) * 900;
  ctx.save(); const [sx, sy] = shk(t, 8 * Math.exp(-(t - 14.2) * 8)); camT({ y: sy, x: sx, z: 1 + .02 * Math.sin(t * 1.2), rot: Math.sin(t * .7) * .006 });
  ctx.save(); ctx.translate(0, bounceY);
  rr(px, py, pw, ph, 28); ctx.fillStyle = 'rgba(16,6,24,.92)'; ctx.fill();
  const bg = ctx.createLinearGradient(0, py, 0, py + ph); bg.addColorStop(0, 'rgba(255,46,126,.28)'); bg.addColorStop(1, 'rgba(255,216,74,.10)'); rr(px, py, pw, ph, 28); ctx.fillStyle = bg; ctx.fill();
  // border draws itself
  const per = 2 * (pw + ph), dr = E.out3(seg(t, 14.2, 15.2)) * per;
  ctx.save(); rr(px, py, pw, ph, 28); ctx.setLineDash([dr, per]); ctx.strokeStyle = P.gold; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  rr(px + 16, py + 16, pw - 32, ph - 32, 20); ctx.strokeStyle = 'rgba(255,46,126,.7)'; ctx.lineWidth = 2; ctx.stroke();
  // avatar
  const av = E.elastic(clamp((t - 14.5) / .8));
  if (av > 0) {
    ctx.save(); ctx.translate(W / 2, 640); ctx.scale(av, av); ctx.beginPath(); ctx.arc(0, 0, 135, 0, 7); ctx.save(); ctx.clip();
    const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 150); g.addColorStop(0, '#5a1a70'); g.addColorStop(1, '#12061a'); ctx.fillStyle = g; ctx.fillRect(-150, -150, 300, 300);
    loom(ctx, 0, -110, .62, { rimA: .95 }); ctx.restore();
    ctx.strokeStyle = P.pink; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 135, 0, 7); ctx.stroke();
    ctx.rotate(t * 1.5); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; ctx.setLineDash([40, 30]); ctx.beginPath(); ctx.arc(0, 0, 152, 0, 7); ctx.stroke(); ctx.restore();
  }
  KT('離れ小島のお嬢様', W / 2, 850, sty(96, '#fff', P.pink, '#4a0028', { maxW: 820 }), t, 14.7, 'drop', .06);
  const cvStr = 'CV 山田じぇみ子'; const nshow = Math.floor(clamp((window.FT - 15.3) / .7) * [...cvStr].length + .001);
  if (nshow > 0) { TX([...cvStr].slice(0, nshow).join(''), W / 2, 950, { font: FM, weight: 800, size: 56, fill: P.gold, ls: 4 }); if (nshow < [...cvStr].length) { ctx.fillStyle = P.gold; ctx.globalAlpha = Math.floor(t * 6) % 2; ctx.fillRect(W / 2 + 200, 920, 6, 56); ctx.globalAlpha = 1; } }
  const wp = seg(t, 15.6, 16.2);
  if (wp > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 990, W * E.out3(wp), 100); ctx.clip(); TX('化け物と呼ばれた主人', W / 2, 1040, { font: FM, weight: 800, size: 62, maxW: 820, fill: P.rose, ls: 4 }); ctx.restore(); }
  const tags = [['#二メートルの巨躯', 16.0, 380, 1130], ['#ふたなり', 16.25, 780, 1130], ['#執着', 16.5, 480, 1214]];
  for (const [s, t0, cx, cy] of tags) {
    const l = t - t0; if (l < 0) continue; const sc = E.elastic(clamp(l / .55)); const w = [...s].length * 44 + 56;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); rr(-w / 2, -32, w, 64, 32); ctx.fillStyle = P.pink; ctx.fill(); ctx.restore();
    TX(s, cx, cy + 2, { font: FM, weight: 800, size: 40, fill: '#fff', per: () => ({ s: sc }) });
  }
  // flip reveal
  const y = 1370;
  if (t < 18.1) {
    const a = E.out3(seg(t, 16.9, 17.3)), cr = seg(t, 17.5, 18.1);
    ctx.save(); ctx.globalAlpha = a; const sh = cr > 0 ? (hash(Math.floor(t * 30)) - .5) * 12 * cr : 0;
    TX('上品な令嬢', W / 2 + sh, y, { font: FM, weight: 800, size: 118, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 20 } }); ctx.restore();
    if (cr > 0) {
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.shadowColor = P.pink; ctx.shadowBlur = 18; const r = rnd(5);
      for (let k = 0; k < 3; k++) { ctx.beginPath(); let x = 300 + k * 60, yy = 1300 + k * 20; ctx.moveTo(x, yy); const n = Math.floor(cr * 14); for (let i = 0; i < n; i++) { x += 20 + r() * 26; yy += (r() - .5) * 70 + (i % 2 ? 26 : -26); ctx.lineTo(x, yy); } ctx.stroke(); }
      ctx.restore();
    }
  } else {
    const l = t - 18.1;
    if (l < .95) shatter(() => TX('上品な令嬢', W / 2, y, { font: FM, weight: 800, size: 118, fill: '#fff', ls: 6 }), 250, 1290, 590, 160, l, { cell: 50, dur: .95, seed: 4 });
    ring(W / 2, y, l, P.gold, 800, 18, .6); burst(W / 2, y, l, 26, ['#FF2E7E', '#FFD84A', '#fff'], 620, 1.0, 21);
    KT('興奮が止まりませんの♡', W / 2, y, sty(88, P.pink, '#fff', '#3a0020', { maxW: 860, shadow: { c: P.pink, b: 30 } }), t, 18.15, 'pop', .04, { add: (i, n, ll, tt) => ({ dy: Math.sin(tt * 8 + i * .6) * 6 * seg(ll, .5, 1) }) });
  }
  ctx.restore(); ctx.restore();
  sparkleLayer(t, 26); heartsLayer(t, 12);
  return { glitch: t > 17.9 && t < 18.5 ? .8 * (1 - Math.abs(t - 18.1) * 2.5) : 0, chroma: 3 + (t > 18.1 ? 4 * Math.exp(-(t - 18.1) * 4) : 0) };
}

// ---------------------------------------------------- S5 20-28
function S5(t) {
  const e = env(t), p = pulse(t, 8);
  baseBG(t, '#2a0620', '#7a0a45', '#FF2E7E', .55);
  sunburst(W / 2, 950, t, 30, 'rgba(255,255,255,.07)', 'rgba(0,0,0,0)', 1, -.2);
  halftone(t, 'rgba(255,90,160,.35)', 1, 44, (x, y, tt) => Math.max(0, .9 - Math.hypot(x - W / 2, y - H / 2) / 1000) * (.5 + p));
  typeRows(t < 22.4 ? 'ガチガチ' : 'パンパン', t, { size: 380, rows: 5, y0: 220, gap: 420, speed: 160, stroke: 'rgba(255,255,255,.12)', sw: 5 });
  const [sx, sy] = shk(t, 4 + e * 12 + p * 8);
  ctx.save(); camT({ z: 1 + .05 * p + .02 * e, x: sx, y: sy, rot: Math.sin(t * 2) * .01 });
  if (t < 22.7) {
    const chars = scrambleStr('ガチガチ', t, 20, .4, POOL, 1);
    const l = t - 20; const shine = (fn) => withShine(fn, t, 1.4, 0, 'rgba(255,255,255,.85)', 220);
    ring(W / 2, 560, l - .05, P.gold, 900, 26, .6); burst(W / 2, 560, l, 20, ['#FFD84A', '#fff'], 700, .9, 31);
    shine(() => TX(chars.map(c => c || ' ').join(''), W / 2, 560, sty(255, '#fff', P.red, P.gold, {
      maxW: 920, per: (i) => { const ll = t - 20 - i * .06; return { a: chars[i] ? 1 : 0, s: (1 + .1 * p) * (1 + .6 * Math.exp(-Math.max(0, ll) * 12)), dx: Math.sin(t * 50 + i) * (2 + e * 5), dy: Math.cos(t * 44 + i * 2) * (2 + e * 5) }; }
    })));
    // pulsing veins: lines from bottom
    ctx.save(); ctx.globalAlpha = .5; ctx.strokeStyle = '#ffb0d0'; ctx.lineWidth = 6; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(140 + k * 200, 1000); for (let y = 1000; y < 1500; y += 30) ctx.lineTo(140 + k * 200 + Math.sin(y * .02 + t * 6 + k) * 22, y); ctx.stroke(); } ctx.restore();
  }
  if (t >= 22.4 && t < 25.7) {
    const l = t - 22.4, a = E.out3(seg(t, 22.4, 22.9)) * (1 - seg(t, 25.3, 25.7));
    for (const [ox, oy] of [[340, 1400], [740, 1400]]) {
      const j = spring(l - (ox < 500 ? 0 : .08), 12, 3.5); const r = 190 * (.5 + .5 * j) * (1 + .14 * Math.sin(t * 9 + ox) + p * .16 + e * .1);
      ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(ox - r * .3, oy - r * .35, r * .1, ox, oy, r); g.addColorStop(0, '#ffc0d8'); g.addColorStop(.4, P.pink); g.addColorStop(1, '#5a0030');
      ctx.fillStyle = g; ctx.shadowColor = P.pink; ctx.shadowBlur = 50; ctx.beginPath(); ctx.arc(ox, oy + Math.sin(t * 8 + ox) * 10, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.ellipse(ox - r * .35, oy - r * .4, r * .18, r * .1, -.6, 0, 7); ctx.fill(); ctx.restore();
    }
    ring(W / 2, 1400, l, '#fff', 900, 16, .6, .5);
    TX('金玉パンパン', W / 2, 900, sty(172, P.gold, '#3a0010', P.red, {
      maxW: 920, per: (i, n) => { const ll = l - i * .05; if (ll <= 0) return { a: 0 }; const inf = 1 + (.25 + .25 * p) * Math.sin(t * 16 + i * .8) + .3 * Math.exp(-ll * 10); return { a: 1, s: inf, sy: 1 / Math.sqrt(inf), dy: Math.sin(t * 16 + i * .8) * 12 }; }
    }));
  }
  if (t >= 25.5) {
    const l = t - 25.5;
    ring(W / 2, 1000, l, '#fff', 1100, 30, .6);
    for (const [s, y, off, dir] of [['もう待てま', 900, 0, 1], ['せんわ！！', 1130, .3, -1]]) {
      KT(s, W / 2, y, sty(196, '#fff', P.pink, '#3a0020', { maxW: 920 }), t, 25.5 + off, dir > 0 ? 'slideL' : 'slideR', .04, { add: (i, n, ll, tt) => { const [a, b] = shk(tt + i, 7 * seg(ll, .3, 1)); return { dx: a, dy: b }; } });
    }
  }
  ctx.restore();
  sparkleLayer(t, 30, '#FFD84A'); heartsLayer(t, 12);
  const gl = t > 25.5 ? .1 + .22 * p : (t > 20 && t < 20.5 ? .5 : 0);
  return { glitch: gl, chroma: 4 + p * 9 };
}

// ---------------------------------------------------- S6 28-36
function S6(t) {
  const e = env(t), p = pulse(t, 8);
  baseBG(t, '#050508', '#150a25', '#FFD84A', .3);
  halftone(t, 'rgba(255,216,74,.22)', 1, 50, (x, y, tt) => Math.max(0, 1 - Math.hypot(x - 500, y - 1010) / 900) * (.5 + e));
  typeRows('オナホ執事', t, { size: 300, rows: 6, y0: 100, gap: 340, speed: 110, stroke: 'rgba(255,216,74,.12)', sw: 4 });
  const cx = 500, cy = 1010, N = 96;
  const a0 = E.out3(seg(t, 28, 28.6));
  ctx.save(); const [sx, sy] = shk(t, 5 * p); camT({ x: sx, y: sy, z: 1 + .04 * p });
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .25); ctx.globalAlpha = a0;
  for (let i = 0; i < N; i++) {
    const v = .2 + .8 * hash(Math.floor(t * 18) * .37 + i * 1.7) * (.35 + e * .9 + p * .5);
    const ang = i / N * 6.283, r0 = 235, r1 = r0 + v * 210;
    ctx.strokeStyle = i % 3 === 0 ? P.gold : P.pink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); ctx.lineTo(Math.cos(ang) * r1, Math.sin(ang) * r1); ctx.stroke();
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = a0; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 212 + p * 14, 0, 7); ctx.stroke();
  glowCircle(cx, cy, 300, 'rgba(255,216,74,.35)', .8 + p * .4); ctx.restore();
  // band + wipe text
  if (t < 31.4) {
    const w = E.out5(seg(t, 27.9, 28.6)), out = E.in3(seg(t, 30.9, 31.4));
    ctx.save(); ctx.translate(W / 2 + out * W * 1.2, 470); ctx.rotate(-.06); ctx.fillStyle = P.pink; ctx.fillRect(-W / 2 - 40 + (1 - w) * -W, -100, W + 80, 200); ctx.fillStyle = P.gold; ctx.fillRect(-W / 2 - 40 + (1 - w) * -W, 100, W + 80, 12);
    const tw = seg(t, 28.3, 29.0); ctx.beginPath(); ctx.rect(-W / 2, -120, W * tw, 240); ctx.clip();
    TX('お口をお貸しなさい♡', 0, 0, sty(100, '#fff', '#3a0020', '#3a0020', { maxW: 920, per: (i) => ({ dy: Math.sin(t * 10 + i * .6) * 5 }) })); ctx.restore();
  }
  if (t >= 30.9 && t < 33.7) {
    VX('喉奥まで', 905, 640, { font: FH, size: 150, gap: 1.02, fill: P.gold, stroke: { c: '#1c1608', w: 10 }, ext: { c: P.red, n: 8, dx: 3, dy: 5 },
      per: (i) => { const l = t - (30.9 + i * .28); if (l <= 0) return { a: 0 }; return { a: 1, s: 1 + 1.5 * (1 - E.out5(clamp(l / .22))), dx: shk(t + i, 5 * Math.exp(-l * 6))[0] }; } });
    for (let i = 0; i < 4; i++) ring(905, 640 + i * 153 + 76, t - (30.9 + i * .28), '#fff', 300, 10, .4);
  }
  if (t >= 33.4) {
    const l = t - 33.4;
    for (let k = 4; k >= 1; k--) { const q = (l * 1.6 + k * .18) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * .35; ctx.translate(W / 2, 1560); ctx.scale(1 + q * .5, 1 + q * .5); ctx.translate(-W / 2, -1560); TX('オナホ執事', W / 2, 1560, { size: 200, maxW: 920, fill: null, stroke: { c: P.pink, w: 6 } }); ctx.restore(); }
    withShine(() => KT('オナホ執事', W / 2, 1560, sty(204, '#fff', P.pink, '#3a0020', { maxW: 920 }), t, 33.4, 'stamp', .06), t, 1.6, 0, 'rgba(255,216,74,.9)', 200);
  }
  ctx.restore();
  sparkleLayer(t, 30);
  return { glitch: t > 33.4 ? .3 * Math.exp(-(t - 33.4) * 3) + .08 : 0, chroma: 3 + p * 7 };
}

// ---------------------------------------------------- S7 36-44
function cage3d(t, cx, cy, s, col, rot, alpha = 1) {
  const N = 12, R = 150 * s, top = cy - 300 * s, bot = cy + 280 * s;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 24;
  for (let i = 0; i < N; i++) {
    const th = i / N * 6.283 + rot, x = cx + Math.sin(th) * R, d = Math.cos(th); ctx.globalAlpha = alpha * (.35 + .65 * (d * .5 + .5)); ctx.lineWidth = (5 + d * 2.5) * s;
    ctx.beginPath(); ctx.moveTo(x, bot); ctx.lineTo(x, cy - 90 * s); ctx.quadraticCurveTo(x * .55 + cx * .45, top + 20 * s, cx, top - 20 * s); ctx.stroke();
  }
  ctx.globalAlpha = alpha; ctx.lineWidth = 6 * s;
  for (const yy of [cy - 60 * s, cy + 70 * s, cy + 200 * s]) { ctx.beginPath(); ctx.ellipse(cx, yy, R, R * .24, 0, 0, 7); ctx.stroke(); }
  ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.ellipse(cx, bot, R * 1.7, R * .4, 0, 0, 7); ctx.stroke();
  ctx.restore();
}
function S7(t) {
  const e = env(t), p = pulse(t, 8);
  baseBG(t, '#08080c', '#1c1608', '#FFD84A', .35);
  lightRays(W / 2, 100, t, 8, 'rgba(255,216,74,.4)', .5, 2200);
  halftone(t, 'rgba(255,216,74,.16)', 1, 54, (x, y, tt) => .4 + .4 * Math.sin(x * .01 - tt * 2 + y * .004));
  ctx.save(); const [sx, sy] = t > 38.9 && t < 39.4 ? shk(t, 18 * Math.exp(-(t - 38.9) * 8)) : [0, 0]; camT({ x: sx, y: sy, z: 1 + .03 * Math.sin(t * .8) + .04 * p, rot: Math.sin(t * .5) * .01 });
  const ca = E.out3(seg(t, 36, 37));
  cage3d(t, W / 2, 880, 1.7, P.gold, t * 1.1, ca);
  if (t > 38.4) {
    const l = t - 38.4, d = E.out3(clamp(l / .4)); const y = lerp(260, 1000, d);
    ctx.save(); ctx.shadowColor = P.gold; ctx.shadowBlur = 30; padlock(ctx, W / 2, y, 270, '#FFD84A', 1 - clamp((l - .4) / .12)); ctx.restore();
    ring(W / 2, 1000, l - .4, '#fff', 800, 20, .6, .6); ring(W / 2, 1000, l - .45, P.gold, 1000, 12, .6, .6);
    burst(W / 2, 1000, l - .4, 24, ['#FFD84A', '#fff'], 700, .9, 51);
  }
  const shineG = (fn) => withShine(fn, t, 1.8, .2, 'rgba(255,255,255,.95)', 200);
  if (t < 38.7) shineG(() => KT('三ヶ月', W / 2, 400, sty(280, P.gold, '#1c1608', '#7a5a00', { maxW: 920 }), t, 36, 'drop', .1));
  else if (t < 41.5) shineG(() => KT('オナ禁', W / 2, 1440, sty(280, '#fff', P.red, P.red, { maxW: 920 }), t, 38.9, 'stamp', .09));
  if (t >= 41.2) {
    const l = t - 41.2, ang = Math.sin(l * 4.2) * .35 * Math.exp(-l * .4);
    ctx.save(); ctx.translate(W / 2, 100); ctx.rotate(ang); ctx.shadowColor = P.gold; ctx.shadowBlur = 24; ctx.strokeStyle = P.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 250); ctx.stroke(); keyShape(ctx, 0, 390, 270, P.gold, 0); ctx.restore();
    KT('鍵は、', W / 2, 1520, sty(132, '#fff', '#1c1608', '#1c1608', { maxW: 920 }), t, 41.2, 'rise', .07);
    withShine(() => KT('わたくしの手の中♡', W / 2, 1680, sty(114, P.gold, '#1c1608', '#1c1608', { maxW: 920 }), t, 41.6, 'rise', .05), t, 1.5, .5, 'rgba(255,255,255,.9)', 180);
  }
  ctx.restore();
  sparkleLayer(t, 30);
  return { glitch: t > 38.9 && t < 39.2 ? .5 : 0, chroma: 3 + p * 4 };
}

// ---------------------------------------------------- S8 44-52
function S8(t) {
  const p = pulse(t, 9), e = env(t);
  const strobe = pulse(t, 14) > .55 ? 1 : 0;
  baseBG(t, strobe ? '#5a0524' : '#3a0518', strobe ? '#d0185a' : '#a0103f', '#FF6E9E', .5);
  sunburst(W / 2, 900, t, 24, 'rgba(255,255,255,.10)', 'rgba(0,0,0,0)', 1, .5 + p);
  halftone(t, 'rgba(255,255,255,.18)', 1, 40, (x, y, tt) => Math.max(0, 1 - Math.hypot(x - W / 2, y - 900) / 1000) * (.4 + p));
  typeRows(t < 46.2 ? 'ヘコヘコ♡' : 'ぶっぱなし', t, { size: 400, rows: 5, y0: 230, gap: 400, speed: 260, stroke: 'rgba(255,255,255,.16)', sw: 5 });
  if (t >= 46) speedLines(W / 2, 900, t, 46, '#fff', .55, 260, 520, 7);
  ctx.save(); const [sx, sy] = shk(t, 8 + 14 * p); camT({ x: sx, y: sy, z: 1 + .07 * p + (t > 49.4 ? .04 * Math.sin(t * 30) : 0), rot: (hash(Math.floor(t * 12)) - .5) * .02 });
  if (t < 46.2) {
    const l = t - 44;
    for (let g = 3; g >= 0; g--) {
      const tt = t - g * .04, ph = Math.abs(Math.sin(tt * 11)), dy = -ph * 130, sqz = 1 - .18 * (1 - ph) * (ph < .3 ? 1 : 0);
      ctx.save(); ctx.globalAlpha = g === 0 ? 1 : .2 / g;
      TX('ヘコヘコ♡', W / 2, 780 + dy, sty(275, g === 0 ? '#fff' : P.gold, g === 0 ? P.red : null, '#3a0010', { maxW: 920, ext: g === 0 ? { c: '#3a0010', n: 14, dx: 3, dy: 8 } : null, per: (i) => ({ sy: sqz + (i % 2 ? .04 : 0), sx: 2 - sqz, a: clamp(l * 40 - i * 2), r: Math.sin(tt * 11 + i) * .04 }) }));
      ctx.restore();
    }
  } else if (t < 47.9) {
    const l = t - 46.2; ring(W / 2, 900, l, '#fff', 1000, 30, .5);
    KT('オス穴', W / 2, 900, sty(340, '#fff', P.pink, '#3a0020', { maxW: 920 }), t, 46.2, 'stamp', .07, { add: (i, n, ll, tt) => ({ dx: shk(tt + i, 6)[0] }) });
  } else if (t < 49.4) {
    const l = t - 47.9; ring(W / 2, 880, l, P.gold, 1000, 30, .5); const zs = 1 + 2.6 * (1 - E.out5(clamp(l / .26)));
    TX('奥まで', W / 2, 880, sty(340, P.gold, '#3a0010', P.red, { maxW: 920, per: () => ({ s: zs, a: clamp(l * 20), dx: shk(t, 6)[0] }) }));
  } else {
    const l = t - 49.4; ring(W / 2, 800, l, '#fff', 1300, 34, .7); burst(W / 2, 850, l, 40, ['#fff', '#FFD84A', '#FF2E7E'], 1100, 1.2, 77);
    const sc = 1 + .5 * Math.exp(-l * 7);
    KT('ぶっぱなし', W / 2, 720, sty(240, '#fff', P.red, '#3a0010', { maxW: 920 }), t, 49.4, 'stamp', .05, { add: (i, n, ll, tt) => ({ dx: shk(tt + i, 8 * Math.exp(-l * 2))[0], s: sc }) });
    KT('ですわ！！', W / 2, 1010, sty(210, P.gold, '#3a0010', P.red, { maxW: 920 }), t, 49.75, 'stamp', .05, { add: (i, n, ll, tt) => ({ dx: shk(tt + i, 8 * Math.exp(-l * 2))[0], s: sc }) });
  }
  ctx.restore();
  if (t >= 47.9) {
    const idx = t < 48.8 ? 0 : t < 49.7 ? 2 : t < 50.6 ? 4 : 6, l = t - 47.9;
    TX('3・2・1・0', W / 2, 1600, { size: 170, maxW: 920, fill: '#fff', stroke: { c: '#3a0010', w: 10 }, ext: { c: P.pink, n: 8, dx: 3, dy: 6 }, per: (i) => {
      const on = i === idx, t0 = [47.9, 0, 48.8, 0, 49.7, 0, 50.6][i] || 0; return { a: clamp(l * 20) * (on ? 1 : .3), s: on ? 1.3 * (1 + 1.2 * Math.exp(-Math.max(0, t - t0) * 12)) : .9, fill: on ? P.gold : '#fff' };
    } });
    if (idx === 6) ring(W / 2 + 380, 1600, t - 50.6, P.gold, 500, 16, .5);
  }
  sparkleLayer(t, 30, '#fff');
  return { glitch: t > 49.4 ? .06 + .16 * p : .04 * p, chroma: 3 + p * 8 };
}

// ---------------------------------------------------- S9/S10 52-60
function S9(t) {
  const lt = t - 52, yh = 1250;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#050914'); g.addColorStop(.6, '#101c3a'); g.addColorStop(1, '#1a2450'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); const gg = ctx.createLinearGradient(0, yh - 380, 0, yh + 30); gg.addColorStop(0, 'rgba(255,46,126,0)'); gg.addColorStop(1, 'rgba(255,46,126,.5)'); ctx.fillStyle = gg; ctx.fillRect(0, yh - 380, W, 410); ctx.restore();
  particles(t, 60, 8, '#F4B6A6', { sz: 6, sp: 10 });
  ctx.save(); camT({ z: 1 + .03 * lt / 8, y: -lt * 3 });
  glowCircle(800, 400, 380, 'rgba(244,182,166,.7)', .9); ctx.fillStyle = '#F4B6A6'; ctx.beginPath(); ctx.arc(800, 400, 92, 0, 7); ctx.fill();
  fogLayer('pink', [255, 90, 170], t, .25, 2.6, 18, 3, 900, H, 2);
  waves(t, yh, 22, (l) => ['#0a1530', '#0c1a3c', '#0e2048'][l], 1.1, 3, 1);
  // moon reflection
  ctx.save(); ctx.globalAlpha = .4; for (let i = 0; i < 12; i++) { ctx.fillStyle = '#F4B6A6'; const w = 180 - i * 10 + Math.sin(t * 2 + i) * 20; ctx.fillRect(800 - w / 2 + Math.sin(t + i) * 10, yh + 60 + i * 26, w, 4); } ctx.restore();
  heartsLayer(t, 16);
  const fo = 1 - seg(t, 55.0, 55.6);
  ctx.save(); ctx.globalAlpha = fo;
  TX('船は、あと一年', W / 2, 760, { font: FM, weight: 800, size: 120, maxW: 940, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 30 }, per: (i) => { const a = E.out3(seg(t, 52.2 + i * .08, 52.8 + i * .08)); return { a, blur: (1 - a) * 14, dy: (1 - a) * 26, s: 1 + (1 - a) * .15 }; } });
  TX('来ませんわ♡', W / 2, 950, { font: FM, weight: 800, size: 140, maxW: 940, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 30 }, per: (i) => { const a = E.out3(seg(t, 53.0 + i * .08, 53.6 + i * .08)); return { a, blur: (1 - a) * 14, dy: (1 - a) * 26, s: 1 + (1 - a) * .15 }; } });
  ctx.restore();
  if (t >= 54.6) {
    withShine(() => TX('逃げられませんわよ♡', W / 2, 470, { font: FH, size: 100, maxW: 920, fill: P.pink, stroke: { c: '#fff', w: 5 }, shadow: { c: P.pink, b: 24 }, per: (i) => { const l = t - 54.6 - i * .05; return { a: clamp(l * 12), s: 1 + 1.2 * (1 - E.out5(clamp(l / .22))) }; } }), t, 1.8, .3);
  }
  if (t >= 56.4) {
    const l = t - 56.4;
    [['デカふたなりの', 860, 132, '#fff', P.pink, 0], ['お嬢様は', 1010, 150, '#fff', P.pink, .3], ['オナホ執事を', 1170, 140, P.gold, P.red, .6], ['離さない', 1330, 170, P.gold, P.red, .9]].forEach(([s, y, sz, f, ec, off]) => {
      ring(W / 2, y, l - off, ec, 700, 14, .5);
      KT(s, W / 2, y, sty(sz, f, '#3a0010', ec, { maxW: 920 }), t, 56.4 + off, 'stamp', .04);
    });
    TX('CV 山田じぇみ子', W / 2, 1560, { font: FM, weight: 800, size: 58, fill: '#dfe6ff', ls: 6, per: () => ({ a: E.out3(seg(t, 57.5, 58.1)) }) });
  }
  ctx.restore();
  return { glitch: 0, chroma: 2 };
}

const V1 = {
  scenes: [{ a: 0, b: 3, fn: S1 }, { a: 3, b: 8, fn: S2 }, { a: 8, b: 14, fn: S3 }, { a: 14, b: 20, fn: S4 }, { a: 20, b: 28, fn: S5 }, { a: 28, b: 36, fn: S6 }, { a: 36, b: 44, fn: S7 }, { a: 44, b: 52, fn: S8 }, { a: 52, b: 60.01, fn: S9 }],
  trans: [{ at: 3, dur: .3, kind: 'zoom' }, { at: 8, dur: .34, kind: 'wipe', col: '#FFD84A' }, { at: 14, dur: .3, kind: 'glitch' }, { at: 20, dur: .3, kind: 'zoom' }, { at: 28, dur: .3, kind: 'whip', dir: 1 }, { at: 36, dur: .3, kind: 'glitch' }, { at: 44, dur: .3, kind: 'zoom' }, { at: 52, dur: .5, kind: 'fade' }],
  draw(t) { return runScenes(this, t); },
  post(t, fx) {
    bloom(.34, 10);
    sliceGlitch(t, fx.glitch || 0, 3);
    chroma((fx.chroma || 3) + (fx.glitch || 0) * 14);
    vignette(.55);
    grain(t, .06);
    flash(t, [1.4, 20.0, 22.4, 25.5, 28.0, 38.9, 44.0, 46.2, 47.9, 49.4], '#fff', 12, .45);
    flash(t, [18.1], '#fff', 8, .9);
    flash(t, [51.4], '#fff', 3.2, 1);
    fadeIO(t, .5, .8);
  }
};
