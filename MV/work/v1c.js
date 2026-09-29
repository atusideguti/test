// ===== V1 ハイテンション (v4: illustration-driven) =====
const FH = 'Dela Gothic One', FM = 'Shippori Mincho B1';
const P = { pink: '#FF2E7E', gold: '#FFD84A', red: '#C4143C', rose: '#F4B6A6' };
const POOL = [...'ガチ金玉パンパン踏潰蹂躙鍵檻奥喉穴孕熱悦罰服従執事嬢様命令欲支配♡！'];

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
const sty = (size, fill, sc, ec, o = {}) => Object.assign({ size, maxW: 930, fill, stroke: { c: sc, w: Math.round(size * .075) }, ext: { c: ec, n: Math.max(6, Math.round(size * .055)), dx: 2, dy: size * .028 }, shadow: { c: 'rgba(0,0,0,.55)', b: 24 } }, o);
function pulse2(t, arr, k = 9) { let m = 0; for (const a of arr) if (t >= a) m = Math.max(m, Math.exp(-(t - a) * k)); return m; }
const zp = (l, k = 10, a = .18) => l < 0 ? 1 : 1 + a * Math.exp(-l * k); // zoom punch

// grading presets
const G = {
  pink: 'saturate(1.25) contrast(1.12) brightness(.92)',
  hot: 'saturate(1.45) contrast(1.22) brightness(.84) hue-rotate(-8deg)',
  gold: 'grayscale(1) sepia(1) saturate(2.4) hue-rotate(-12deg) brightness(.66) contrast(1.3)',
  night: 'saturate(.75) contrast(1.1) brightness(.72)',
};
function gradePink(a = .45) { tintK('#FF2E7E', a, 'soft-light'); tintK('#2a0020', .25, 'multiply'); }
function sparks(t, n = 26) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; particles(t, n, 11, '#FFD84A', { sz: 10, sp: 46 }); ctx.restore(); }
function hearts(t, n = 10) { particles(t, n, 5, '#FF2E7E', { kind: 'heart', sz: 15, sp: 70 }); }
function typeOverlay(str, t, a = .16, sp = 120) { ctx.save(); ctx.globalCompositeOperation = 'overlay'; typeRows(str, t, { size: 380, rows: 5, y0: 220, gap: 420, speed: sp, stroke: `rgba(255,255,255,${a * 2})`, fill: `rgba(255,255,255,${a})`, sw: 5 }); ctx.restore(); }

// ------------------------------------------------ S1 0-3
function S1(t) {
  const cutT = 1.4;
  if (t < cutT) {
    const p = seg(t, 0, cutT);
    shot('face', { z: 1 + .08 * E.out2(p) + .6 * E.in3(seg(t, 1.2, cutT)), dy: -10 * p, filter: 'saturate(1.05) contrast(1.05) brightness(' + (0.55 + .35 * E.out3(seg(t, 0, .8))) + ')' });
    tintK('#FF2E7E', .25, 'soft-light');
    grad(1000, H, 'rgba(20,0,20,0)', 'rgba(20,0,20,.85)');
    lightLeak(t, 'rgba(255,120,190,.5)', .45, .8);
    const ls = lerp(70, 8, E.out3(seg(t, .1, 1.1)));
    const per = (i) => { const a = E.out3(seg(t, .15 + i * .07, .6 + i * .07)); return { a, blur: (1 - a) * 16, dy: (1 - a) * 24 }; };
    TX('ごきげんよう、', W / 2, 1320, { font: FM, weight: 800, size: 88, fill: P.gold, ls, per, shadow: { c: '#000', b: 20 } });
    TX('執事さん♡', W / 2, 1480, { font: FM, weight: 800, size: 122, fill: '#fff', ls: ls * .6, per: (i) => per(i + 5), shadow: { c: P.pink, b: 34 } });
    sparks(t, 18);
    return { chroma: 2 + 10 * E.in3(seg(t, 1.2, cutT)) };
  }
  const l = t - cutT;
  const [sx, sy] = shk(t, 16 * Math.exp(-l * 7));
  shotSplit('full', { z: zp(l, 6, .35), dx: sx * .3, dy: sy * .3, filter: G.hot }, 14 * Math.exp(-l * 5));
  gradePink(.5);
  grad(560, 1250, 'rgba(40,0,30,0)', 'rgba(40,0,30,.55)');
  ctx.save(); ctx.globalCompositeOperation = 'screen'; speedLines(W / 2, 900, t, 22, '#fff', .35, 360, 460, 4); ctx.restore();
  ring(W / 2, 920, l, P.gold, 1100, 22, .7); ring(W / 2, 920, l - .08, '#fff', 900, 10, .6);
  burst(W / 2, 920, l, 30, ['#FFD84A', '#FF2E7E', '#fff'], 800, 1.1, 3);
  const add = (i, n, ll, tt) => ({ dy: Math.sin(tt * 9 + i * .8) * 9 * seg(ll, .4, .8), r: Math.sin(tt * 7 + i) * .03 * seg(ll, .4, .8) });
  KT('ごきげんよう、', W / 2 - 10, 800, sty(150, P.pink, '#fff', '#3a0020'), t, cutT, 'slideL', .045, { add });
  KT('執事さん♡', W / 2 + 10, 1070, sty(218, '#fff', P.pink, P.pink), t, cutT + .12, 'slideR', .05, { add });
  hearts(t, 12); sparks(t, 22);
  return { glitch: .45 * Math.exp(-l * 5), chroma: 3 + 12 * Math.exp(-l * 6) };
}

// ------------------------------------------------ S2 3-8 : tilt up from body to face
function S2(t) {
  const pk = pulse2(t, [3.0, 3.9, 4.8], 9), [sx, sy] = shk(t, 12 * pk);
  const p = E.io(seg(t, 3, 7.6));
  const s = lerpShot({ cx: 880, cy: 1000, sw: 560 }, 'full', p);
  shot(s, { z: 1 + .07 * pk, dx: sx * .4, dy: sy * .4, filter: G.pink });
  gradePink(.4);
  typeOverlay('いじめ倒して', t, .1, 90);
  grad(400, 1200, 'rgba(30,0,25,0)', 'rgba(30,0,25,.5)');
  ring(W / 2, 560, t - 3.0, P.pink, 700, 16, .6); ring(W / 2, 800, t - 3.9, P.gold, 800, 16, .6); ring(W / 2, 1040, t - 4.8, '#fff', 900, 16, .6);
  burst(W / 2, 560, t - 3.0, 12, ['#FFD84A', '#fff'], 500, .8, 5); burst(W / 2, 800, t - 3.9, 14, ['#FF2E7E', '#fff'], 600, .8, 9); burst(W / 2, 1040, t - 4.8, 18, ['#FFD84A', '#FF2E7E'], 700, .9, 13);
  ctx.save(); camT({ x: sx, y: sy });
  const fl = (i, n, l, tt) => ({ dy: Math.sin(tt * 3 + i * .5) * 6 * seg(l, .5, 1) });
  KT('今日も', W / 2, 600, sty(140, '#fff', '#12061e', P.pink), t, 3.0, 'stamp', .06, { add: fl });
  KT('いじめ倒して', W / 2 - 10, 840, sty(178, P.pink, '#fff', '#7a0a2c'), t, 3.9, 'slideL', .04, { add: fl });
  KT('差し上げますわ！', W / 2 + 10, 1090, sty(124, P.gold, '#12061e', '#7a0a2c'), t, 4.8, 'slideR', .035, { add: fl });
  ctx.restore();
  sparks(t, 20); hearts(t, 8);
  return { glitch: t > 4.75 ? .15 * Math.exp(-(t - 4.8) * 8) : 0, chroma: 3 + 6 * pk };
}

// ------------------------------------------------ S3 8-14 : hit cuts
const HITS3 = [8.5, 9.2, 9.9, 10.6, 11.3, 12.0, 12.7, 13.4];
const CUTS3 = ['mid', 'low', 'thigh', 'mid', 'low', 'thigh', 'mid', 'low', 'thigh'];
function S3(t) {
  let idx = 0, last = 8; for (let i = 0; i < HITS3.length; i++) if (t >= HITS3[i]) { idx = i + 1; last = HITS3[i]; }
  const l = t - last, impact = t >= 8.5 ? Math.exp(-l * 9) : 0;
  const [sx, sy] = shk(t, 18 * impact);
  const drift = (t - last) * .03;
  shotSplit(CUTS3[idx], { z: (1.02 + drift) * zp(t >= 8.5 ? l : -1, 12, .22), dx: sx * .3, dy: sy * .3 + (idx % 2 ? 1 : -1) * 20 * (t - last), filter: G.hot }, 10 * impact);
  tintK('#ff2244', .4, 'soft-light'); tintK('#300010', .22, 'multiply');
  halftone(t, 'rgba(255,60,90,.22)', 1, 46, (x, y, tt) => .5 + .5 * Math.sin(x * .004 + y * .003 + tt * 2));
  typeOverlay('踏んで', t, .12, 160);
  if (t >= 8.5) { ring(W / 2, 1500, l, P.gold, 1200, 26, .6, .35); burst(W / 2, 1400, l, 16, ['#FFD84A', '#FF2E7E', '#fff'], 620, .8, Math.floor(last * 10)); }
  ctx.save(); camT({ x: sx * .6, y: sy * .6 });
  if (t < 10.2) {
    const q = t - 8;
    TX('ほーらほらほら♡', W / 2, 460, sty(140, '#fff', P.red, '#3a0010', { maxW: 940, per: (i) => { const a = E.out3(clamp((q - i * .05) * 6)); return { a, dy: Math.sin(t * 11 + i * .9) * 20 - (1 - a) * 80, s: (1 + .12 * Math.sin(t * 11 + i)) * (.6 + .4 * a), r: Math.sin(t * 8 + i) * .07, fill: i % 2 ? '#fff' : P.gold }; } }));
  } else if (t < 12) {
    KT('踏んで', 400, 760, sty(270, P.gold, '#3a0010', P.red, { maxW: 720 }), t, 10.2, 'stamp', .09, { add: () => ({ r: -.14 }) });
    KT('踏んで', 690, 1070, sty(270, '#fff', '#3a0010', P.pink, { maxW: 720 }), t, 11.0, 'stamp', .09, { add: () => ({ r: .1 }) });
  } else {
    const hs = [12.0, 12.7, 13.4];
    TX('踏みまくりますわ！', W / 2, 900, sty(116, '#fff', P.red, '#3a0010', { maxW: 940, per: (i) => { const t0 = hs[Math.min(2, Math.floor(i / 3))] + (i % 3) * .1, q = t - t0; if (q <= 0) return { a: 0 }; return { a: 1, s: 1 + 1.3 * (1 - E.out5(clamp(q / .2))), dy: Math.sin(t * 18 + i) * 5 }; } }));
  }
  ctx.restore();
  sparks(t, 20);
  return { glitch: .22 * impact, chroma: 3 + 8 * impact };
}

// ------------------------------------------------ S4 14-20 card
function S4(t) {
  const p = seg(t, 14, 20);
  shot('full', { z: 1.04 + .05 * p, dy: -30 * p, filter: 'saturate(1.1) contrast(1.05) brightness(.7)' });
  tintK('#FF2E7E', .35, 'soft-light'); grad(420, H, 'rgba(18,4,22,0)', 'rgba(18,4,22,.6)');
  lightLeak(t, 'rgba(255,60,140,.4)', .45, .3);
  const px = 80, pw = 920, py = 470, ph = 1080;
  const pin = spring(t - 14, 9, 5.2), bounceY = (1 - pin) * 900;
  ctx.save(); const [sx, sy] = shk(t, 8 * Math.exp(-(t - 14.2) * 8)); camT({ y: sy, x: sx, rot: Math.sin(t * .7) * .006 });
  ctx.save(); ctx.translate(0, bounceY);
  rr(px, py, pw, ph, 28); ctx.fillStyle = 'rgba(16,6,24,.84)'; ctx.fill();
  const bg = ctx.createLinearGradient(0, py, 0, py + ph); bg.addColorStop(0, 'rgba(255,46,126,.25)'); bg.addColorStop(1, 'rgba(255,216,74,.08)'); rr(px, py, pw, ph, 28); ctx.fillStyle = bg; ctx.fill();
  const per = 2 * (pw + ph), dr = E.out3(seg(t, 14.2, 15.2)) * per;
  ctx.save(); rr(px, py, pw, ph, 28); ctx.setLineDash([dr, per]); ctx.strokeStyle = P.gold; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  rr(px + 16, py + 16, pw - 32, ph - 32, 20); ctx.strokeStyle = 'rgba(255,46,126,.7)'; ctx.lineWidth = 2; ctx.stroke();
  // avatar: the real face
  const av = E.elastic(clamp((t - 14.5) / .8));
  if (av > 0) {
    ctx.save(); ctx.translate(W / 2, 690); ctx.scale(av, av);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.clip(); ctx.translate(-W / 2, -690);
    ctx.filter = 'saturate(1.15) contrast(1.05)'; ctx.drawImage(KEY, 700 * KS, 125 * KS, 320 * KS, 320 * KS, W / 2 - 150, 690 - 150, 300, 300); ctx.filter = 'none';
    ctx.restore();
    ctx.strokeStyle = P.pink; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.stroke();
    ctx.rotate(t * 1.5); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; ctx.setLineDash([40, 30]); ctx.beginPath(); ctx.arc(0, 0, 168, 0, 7); ctx.stroke(); ctx.restore();
  }
  KT('離れ小島のお嬢様', W / 2, 910, sty(96, '#fff', P.pink, '#4a0028', { maxW: 820 }), t, 14.7, 'drop', .06);
  const cvStr = 'CV 山田じぇみ子'; const nshow = Math.floor(clamp((window.FT - 15.3) / .7) * [...cvStr].length + .001);
  if (nshow > 0) TX([...cvStr].slice(0, nshow).join(''), W / 2, 1010, { font: FM, weight: 800, size: 56, fill: P.gold, ls: 4 });
  const wp = seg(t, 15.6, 16.2);
  if (wp > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 1050, W * E.out3(wp), 100); ctx.clip(); TX('化け物と呼ばれた主人', W / 2, 1100, { font: FM, weight: 800, size: 62, maxW: 820, fill: P.rose, ls: 4 }); ctx.restore(); }
  const tags = [['#二メートルの巨躯', 16.0, 380, 1190], ['#ふたなり', 16.25, 780, 1190], ['#執着', 16.5, 480, 1274]];
  for (const [s, t0, cx, cy] of tags) {
    const l = t - t0; if (l < 0) continue; const sc = E.elastic(clamp(l / .55)); const w = [...s].length * 44 + 56;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); rr(-w / 2, -32, w, 64, 32); ctx.fillStyle = P.pink; ctx.fill(); ctx.restore();
    TX(s, cx, cy + 2, { font: FM, weight: 800, size: 40, fill: '#fff', per: () => ({ s: sc }) });
  }
  const y = 1420;
  if (t < 18.1) {
    const a = E.out3(seg(t, 16.9, 17.3)), cr = seg(t, 17.5, 18.1);
    ctx.save(); ctx.globalAlpha = a; const sh = cr > 0 ? (hash(Math.floor(t * 30)) - .5) * 12 * cr : 0;
    TX('上品な令嬢', W / 2 + sh, y, { font: FM, weight: 800, size: 118, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 20 } }); ctx.restore();
    if (cr > 0) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.shadowColor = P.pink; ctx.shadowBlur = 18; const r = rnd(5); for (let k = 0; k < 3; k++) { ctx.beginPath(); let x = 300 + k * 60, yy = y - 70 + k * 20; ctx.moveTo(x, yy); const n = Math.floor(cr * 14); for (let i = 0; i < n; i++) { x += 20 + r() * 26; yy += (r() - .5) * 70 + (i % 2 ? 26 : -26); ctx.lineTo(x, yy); } ctx.stroke(); } ctx.restore(); }
  } else {
    const l = t - 18.1;
    if (l < .95) shatter(() => TX('上品な令嬢', W / 2, y, { font: FM, weight: 800, size: 118, fill: '#fff', ls: 6 }), 250, y - 80, 590, 160, l, { cell: 50, dur: .95, seed: 4 });
    ring(W / 2, y, l, P.gold, 800, 18, .6); burst(W / 2, y, l, 26, ['#FF2E7E', '#FFD84A', '#fff'], 620, 1.0, 21);
    KT('興奮が止まりませんの♡', W / 2, y, sty(88, P.pink, '#fff', '#3a0020', { maxW: 860 }), t, 18.15, 'pop', .04, { add: (i, n, ll, tt) => ({ dy: Math.sin(tt * 8 + i * .6) * 6 * seg(ll, .5, 1) }) });
  }
  ctx.restore(); ctx.restore();
  sparks(t, 20); hearts(t, 10);
  return { glitch: t > 17.9 && t < 18.5 ? .8 * (1 - Math.abs(t - 18.1) * 2.5) : 0, chroma: 3 + (t > 18.1 ? 4 * Math.exp(-(t - 18.1) * 4) : 0) };
}

// ------------------------------------------------ S5 20-28
function S5(t) {
  const e = env(t), p = pulse(t, 8);
  const [sx, sy] = shk(t, 4 + e * 10 + p * 8);
  if (t < 22.4) {
    const l = t - 20;
    shotSplit('low', { z: 1.05 + .06 * p + .03 * Math.sin(t * 7), dx: sx * .3, dy: sy * .3 - l * 10, filter: G.hot }, 4 + p * 10);
    tintK('#FF2E7E', .45, 'soft-light'); typeOverlay('ガチガチ', t, .12, 160);
    const chars = scrambleStr('ガチガチ', t, 20, .4, POOL, 1);
    ring(W / 2, 560, l - .05, P.gold, 900, 26, .6); burst(W / 2, 560, l, 20, ['#FFD84A', '#fff'], 700, .9, 31);
    withShine(() => TX(chars.map(c => c || ' ').join(''), W / 2, 560, sty(255, '#fff', P.red, P.gold, { maxW: 920, per: (i) => { const ll = t - 20 - i * .06; return { a: chars[i] ? 1 : 0, s: (1 + .1 * p) * (1 + .6 * Math.exp(-Math.max(0, ll) * 12)), dx: Math.sin(t * 50 + i) * (2 + e * 5), dy: Math.cos(t * 44 + i * 2) * (2 + e * 5) }; } })), t, 1.4, 0, 'rgba(255,255,255,.85)', 220);
  } else if (t < 25.5) {
    const l = t - 22.4;
    const bounce = 1 + .05 * Math.abs(Math.sin(t * 8));
    shotSplit('balls', { z: 1.04 * bounce * zp(l, 9, .2), dx: sx * .3, dy: sy * .3, filter: G.hot }, 5 + p * 8);
    tintK('#FF2E7E', .4, 'soft-light'); typeOverlay('パンパン', t, .12, 180);
    ring(W / 2, 900, l, '#fff', 900, 16, .6, .6);
    TX('金玉パンパン', W / 2, 700, sty(172, P.gold, '#3a0010', P.red, { maxW: 920, per: (i, n) => { const ll = l - i * .05; if (ll <= 0) return { a: 0 }; const inf = 1 + (.25 + .25 * p) * Math.sin(t * 16 + i * .8) + .3 * Math.exp(-ll * 10); return { a: 1, s: inf, sy: 1 / Math.sqrt(inf), dy: Math.sin(t * 16 + i * .8) * 12 }; } }));
  } else {
    const l = t - 25.5;
    shotSplit('full', { z: zp(l, 5, .3) * (1 + .02 * Math.sin(t * 20)), dx: sx * .5, dy: sy * .5, filter: G.hot }, 6 + p * 10);
    gradePink(.5); grad(700, 1350, 'rgba(40,0,30,0)', 'rgba(40,0,30,.5)');
    ring(W / 2, 1000, l, '#fff', 1100, 30, .6);
    for (const [s, y, off, dir] of [['もう待てま', 920, 0, 1], ['せんわ！！', 1150, .3, -1]]) KT(s, W / 2, y, sty(196, '#fff', P.pink, '#3a0020', { maxW: 920 }), t, 25.5 + off, dir > 0 ? 'slideL' : 'slideR', .04, { add: (i, n, ll, tt) => { const [a, b] = shk(tt + i, 7 * seg(ll, .3, 1)); return { dx: a, dy: b }; } });
  }
  sparks(t, 24); hearts(t, 10);
  return { glitch: t > 25.5 ? .1 + .2 * p : (t > 20 && t < 20.5 ? .5 : 0), chroma: 4 + p * 8 };
}

// ------------------------------------------------ S6 28-36 : face / mouth
function S6(t) {
  const e = env(t), p = pulse(t, 8), [sx, sy] = shk(t, 5 * p);
  const q = seg(t, 28, 36);
  shot({ cx: 880, cy: lerp(470, 430, q), sw: lerp(520, 470, E.io(q)) }, { z: 1 + .03 * p, dx: sx * .3, dy: sy * .3, filter: 'saturate(1.25) contrast(1.12) brightness(.9)' });
  tintK('#FF2E7E', .3, 'soft-light'); tintK('#FFD84A', .12, 'soft-light');
  grad(1050, H, 'rgba(20,4,20,0)', 'rgba(20,4,20,.85)');
  // bottom spectrum
  ctx.save(); const N = 40; for (let i = 0; i < N; i++) { const v = .15 + .85 * hash(Math.floor(t * 18) * .37 + i * 1.7) * (.35 + e * .9 + p * .5); const x = 60 + i * (960 / N), h = v * 220; const g = ctx.createLinearGradient(0, 1830 - h, 0, 1830); g.addColorStop(0, P.gold); g.addColorStop(1, P.pink); ctx.fillStyle = g; ctx.globalAlpha = .85; ctx.fillRect(x, 1830 - h, 960 / N - 6, h); } ctx.restore();
  if (t < 31.4) {
    const w = E.out5(seg(t, 27.9, 28.6)), out = E.in3(seg(t, 30.9, 31.4));
    ctx.save(); ctx.translate(W / 2 + out * W * 1.2, 1300); ctx.rotate(-.06); ctx.fillStyle = P.pink; ctx.fillRect(-W / 2 - 40 + (1 - w) * -W, -100, W + 80, 200); ctx.fillStyle = P.gold; ctx.fillRect(-W / 2 - 40 + (1 - w) * -W, 100, W + 80, 12);
    const tw = seg(t, 28.3, 29.0); ctx.beginPath(); ctx.rect(-W / 2, -120, W * tw, 240); ctx.clip();
    TX('お口をお貸しなさい♡', 0, 0, sty(100, '#fff', '#3a0020', '#3a0020', { maxW: 920, per: (i) => ({ dy: Math.sin(t * 10 + i * .6) * 5 }) })); ctx.restore();
  }
  if (t >= 30.9 && t < 33.7) {
    VX('喉奥まで', 960, 820, { font: FH, size: 132, gap: 1.02, fill: P.gold, stroke: { c: '#1c1608', w: 10 }, ext: { c: P.red, n: 8, dx: 3, dy: 5 }, shadow: { c: 'rgba(0,0,0,.6)', b: 20 },
      per: (i) => { const l = t - (30.9 + i * .28); if (l <= 0) return { a: 0 }; return { a: 1, s: 1 + 1.5 * (1 - E.out5(clamp(l / .22))), dx: shk(t + i, 5 * Math.exp(-l * 6))[0] }; } });
  }
  if (t >= 33.4) {
    const l = t - 33.4;
    for (let k = 4; k >= 1; k--) { const qq = (l * 1.6 + k * .18) % 1; ctx.save(); ctx.globalAlpha = (1 - qq) * .35; ctx.translate(W / 2, 1420); ctx.scale(1 + qq * .5, 1 + qq * .5); ctx.translate(-W / 2, -1420); TX('オナホ執事', W / 2, 1420, { size: 200, maxW: 920, fill: null, stroke: { c: P.pink, w: 6 } }); ctx.restore(); }
    withShine(() => KT('オナホ執事', W / 2, 1420, sty(204, '#fff', P.pink, '#3a0020', { maxW: 920 }), t, 33.4, 'stamp', .06), t, 1.6, 0, 'rgba(255,216,74,.9)', 200);
  }
  sparks(t, 22); hearts(t, 8);
  return { glitch: t > 33.4 ? .25 * Math.exp(-(t - 33.4) * 3) + .05 : 0, chroma: 3 + p * 6 };
}

// ------------------------------------------------ S7 36-44 : gold lock-down
function S7(t) {
  const p = pulse(t, 8);
  let s, dy = 0;
  if (t < 38.9) { s = 'mid'; dy = -(t - 36) * 18; }
  else if (t < 41.2) s = 'full';
  else s = 'bust';
  const lcut = t < 38.9 ? t - 36 : t < 41.2 ? t - 38.9 : t - 41.2;
  const [sx, sy] = t > 38.9 && t < 39.4 ? shk(t, 18 * Math.exp(-(t - 38.9) * 8)) : [0, 0];
  shot(s, { z: (1.03 + lcut * .02) * zp(lcut, 8, .15), dx: sx * .3, dy: dy + sy * .3, filter: G.gold });
  tintK('#FFD84A', .2, 'soft-light'); scan(.12, 6);
  // sweeping gold bars
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 9; i++) { const x = ((i * 140 + t * 90) % (W + 200)) - 100; const g = ctx.createLinearGradient(x - 20, 0, x + 20, 0); g.addColorStop(0, 'rgba(255,216,74,0)'); g.addColorStop(.5, 'rgba(255,216,74,.35)'); g.addColorStop(1, 'rgba(255,216,74,0)'); ctx.fillStyle = g; ctx.fillRect(x - 20, 0, 40, H); } ctx.restore();
  const shineG = (fn) => withShine(fn, t, 1.8, .2, 'rgba(255,255,255,.95)', 200);
  if (t < 38.7) shineG(() => KT('三ヶ月', W / 2, 520, sty(280, P.gold, '#1c1608', '#7a5a00', { maxW: 920 }), t, 36, 'drop', .1));
  else if (t < 41.5) { ring(W / 2, 1440, t - 38.9, '#fff', 900, 24, .6); shineG(() => KT('オナ禁', W / 2, 1440, sty(280, '#fff', P.red, P.red, { maxW: 920 }), t, 38.9, 'stamp', .09)); }
  if (t >= 41.2) {
    grad(1300, H, 'rgba(20,14,0,0)', 'rgba(20,14,0,.8)');
    KT('鍵は、', W / 2, 1520, sty(132, '#fff', '#1c1608', '#1c1608', { maxW: 920 }), t, 41.2, 'rise', .07);
    withShine(() => KT('わたくしの手の中♡', W / 2, 1680, sty(114, P.gold, '#1c1608', '#1c1608', { maxW: 920 }), t, 41.6, 'rise', .05), t, 1.5, .5, 'rgba(255,255,255,.9)', 180);
  }
  sparks(t, 26);
  return { glitch: t > 38.9 && t < 39.2 ? .5 : 0, chroma: 3 + p * 4 };
}

// ------------------------------------------------ S8 44-52 : beat cuts
const CUTS8 = ['low', 'mid', 'thigh', 'balls', 'low', 'mid', 'thigh', 'balls'];
function S8(t) {
  const p = pulse(t, 9);
  const beat = Math.floor((t - 44) / .5), lb = (t - 44) - beat * .5;
  const s = CUTS8[((beat % CUTS8.length) + CUTS8.length) % CUTS8.length];
  const [sx, sy] = shk(t, 8 + 14 * p);
  const strobe = pulse(t, 14) > .6;
  shotSplit(s, { z: zp(lb, 10, .2) * (1.04 + lb * .08), dx: sx * .3, dy: sy * .3 + (beat % 2 ? 1 : -1) * lb * 60, rot: (beat % 2 ? 1 : -1) * .015, filter: strobe ? 'saturate(1.6) contrast(1.4) brightness(1.15)' : G.hot }, 5 + 10 * p);
  tintK(strobe ? '#ff6ea0' : '#FF2E7E', .38, 'soft-light'); tintK('#3a0010', .32, 'multiply');
  typeOverlay(t < 46.2 ? 'ヘコヘコ♡' : 'ぶっぱなし', t, .12, 260);
  if (t >= 46) { ctx.save(); ctx.globalCompositeOperation = 'screen'; speedLines(W / 2, 900, t, 40, '#fff', .5, 260, 520, 7); ctx.restore(); }
  ctx.save(); camT({ x: sx, y: sy, z: 1 + .05 * p });
  if (t < 46.2) {
    const l = t - 44;
    for (let g = 3; g >= 0; g--) {
      const tt = t - g * .04, ph = Math.abs(Math.sin(tt * 11)), dy = -ph * 130, sqz = 1 - .18 * (1 - ph) * (ph < .3 ? 1 : 0);
      ctx.save(); ctx.globalAlpha = g === 0 ? 1 : .2 / g;
      TX('ヘコヘコ♡', W / 2, 820 + dy, sty(275, g === 0 ? '#fff' : P.gold, g === 0 ? P.red : null, '#3a0010', { maxW: 920, ext: g === 0 ? { c: '#3a0010', n: 14, dx: 3, dy: 8 } : null, per: (i) => ({ sy: sqz + (i % 2 ? .04 : 0), sx: 2 - sqz, a: clamp(l * 40 - i * 2), r: Math.sin(tt * 11 + i) * .04 }) }));
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
    KT('ぶっぱなし', W / 2, 740, sty(240, '#fff', P.red, '#3a0010', { maxW: 920 }), t, 49.4, 'stamp', .05, { add: (i, n, ll, tt) => ({ dx: shk(tt + i, 8 * Math.exp(-l * 2))[0], s: sc }) });
    KT('ですわ！！', W / 2, 1030, sty(210, P.gold, '#3a0010', P.red, { maxW: 920 }), t, 49.75, 'stamp', .05, { add: (i, n, ll, tt) => ({ dx: shk(tt + i, 8 * Math.exp(-l * 2))[0], s: sc }) });
  }
  ctx.restore();
  if (t >= 47.9) {
    const idx = t < 48.8 ? 0 : t < 49.7 ? 2 : t < 50.6 ? 4 : 6, l = t - 47.9;
    TX('3・2・1・0', W / 2, 1620, { size: 170, maxW: 920, fill: '#fff', stroke: { c: '#3a0010', w: 10 }, ext: { c: P.pink, n: 8, dx: 3, dy: 6 }, shadow: { c: 'rgba(0,0,0,.6)', b: 20 }, per: (i) => {
      const on = i === idx, t0 = [47.9, 0, 48.8, 0, 49.7, 0, 50.6][i] || 0; return { a: clamp(l * 20) * (on ? 1 : .35), s: on ? 1.3 * (1 + 1.2 * Math.exp(-Math.max(0, t - t0) * 12)) : .9, fill: on ? P.gold : '#fff' };
    } });
  }
  sparks(t, 26);
  return { glitch: t > 49.4 ? .06 + .14 * p : .04 * p, chroma: 3 + p * 8 };
}

// ------------------------------------------------ S9 52-60
function S9(t) {
  const lt = t - 52, q = seg(t, 52, 60);
  shot({ cx: 810, cy: lerp(820, 775, E.io(q)), sw: lerp(640, 760, E.io(q)) }, { filter: G.night });
  tintK('#3a4fa0', .35, 'soft-light'); tintK('#FF2E7E', .18, 'soft-light');
  grad(600, H, 'rgba(8,10,30,0)', 'rgba(8,10,30,.72)');
  lightLeak(t, 'rgba(255,120,190,.35)', .35, .7);
  hearts(t, 12); ctx.save(); ctx.globalCompositeOperation = 'lighter'; particles(t, 40, 8, '#F4B6A6', { sz: 7, sp: 16 }); ctx.restore();
  const fo = 1 - seg(t, 55.0, 55.6);
  ctx.save(); ctx.globalAlpha = fo;
  TX('船は、あと一年', W / 2, 860, { font: FM, weight: 800, size: 120, maxW: 940, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 30 }, per: (i) => { const a = E.out3(seg(t, 52.2 + i * .08, 52.8 + i * .08)); return { a, blur: (1 - a) * 14, dy: (1 - a) * 26, s: 1 + (1 - a) * .15 }; } });
  TX('来ませんわ♡', W / 2, 1050, { font: FM, weight: 800, size: 140, maxW: 940, fill: '#fff', ls: 6, shadow: { c: P.pink, b: 30 }, per: (i) => { const a = E.out3(seg(t, 53.0 + i * .08, 53.6 + i * .08)); return { a, blur: (1 - a) * 14, dy: (1 - a) * 26, s: 1 + (1 - a) * .15 }; } });
  ctx.restore();
  if (t >= 54.6) withShine(() => TX('逃げられませんわよ♡', W / 2, 700, { font: FH, size: 100, maxW: 920, fill: P.pink, stroke: { c: '#fff', w: 5 }, shadow: { c: 'rgba(0,0,0,.6)', b: 24 }, per: (i) => { const l = t - 54.6 - i * .05; return { a: clamp(l * 12), s: 1 + 1.2 * (1 - E.out5(clamp(l / .22))) }; } }), t, 1.8, .3);
  if (t >= 56.4) {
    const l = t - 56.4;
    [['デカふたなりの', 930, 126, '#fff', P.pink, 0], ['お嬢様は', 1075, 146, '#fff', P.pink, .3], ['オナホ執事を', 1230, 136, P.gold, P.red, .6], ['離さない', 1390, 166, P.gold, P.red, .9]].forEach(([s, y, sz, f, ec, off]) => {
      ring(W / 2, y, l - off, ec, 700, 14, .5);
      KT(s, W / 2, y, sty(sz, f, '#3a0010', ec, { maxW: 920 }), t, 56.4 + off, 'stamp', .04);
    });
    TX('CV 山田じぇみ子', W / 2, 1600, { font: FM, weight: 800, size: 58, fill: '#dfe6ff', ls: 6, shadow: { c: '#000', b: 16 }, per: () => ({ a: E.out3(seg(t, 57.5, 58.1)) }) });
  }
  return { chroma: 2 };
}

const V1 = {
  scenes: [{ a: 0, b: 3, fn: S1 }, { a: 3, b: 8, fn: S2 }, { a: 8, b: 14, fn: S3 }, { a: 14, b: 20, fn: S4 }, { a: 20, b: 28, fn: S5 }, { a: 28, b: 36, fn: S6 }, { a: 36, b: 44, fn: S7 }, { a: 44, b: 52, fn: S8 }, { a: 52, b: 60.01, fn: S9 }],
  trans: [{ at: 3, dur: .3, kind: 'zoom' }, { at: 8, dur: .34, kind: 'wipe', col: '#FFD84A' }, { at: 14, dur: .3, kind: 'glitch' }, { at: 20, dur: .3, kind: 'zoom' }, { at: 28, dur: .3, kind: 'whip', dir: 1 }, { at: 36, dur: .3, kind: 'glitch' }, { at: 44, dur: .3, kind: 'zoom' }, { at: 52, dur: .5, kind: 'fade' }],
  draw(t) { return runScenes(this, t); },
  post(t, fx) {
    bloom(.26, 10);
    sliceGlitch(t, fx.glitch || 0, 3);
    chroma((fx.chroma || 3) + (fx.glitch || 0) * 14);
    vignette(.5);
    grain(t, .05);
    flash(t, [1.4, 20.0, 22.4, 25.5, 28.0, 38.9, 44.0, 46.2, 47.9, 49.4], '#fff', 12, .45);
    flash(t, [18.1], '#fff', 8, .9);
    flash(t, [51.4], '#fff', 3.2, 1);
    fadeIO(t, .5, .8);
  }
};
