// ===== V2 離島の神秘 (v4: illustration-driven) =====
const Q = { silver: '#C9D3E6', gold: '#C8A96A', wine: '#6B1E2E' };
const FM2 = 'Shippori Mincho B1';
const BLUE = 'saturate(.5) contrast(1.08) brightness(.72)';
const rev = (t, t0, d = .7, per = .09, blur = 16) => (i) => { const a = E.out3(seg(t, t0 + i * per, t0 + i * per + d)); return { a, blur: (1 - a) * blur, dy: (1 - a) * 26, s: 1 + (1 - a) * .08 }; };
const revV = (t, t0, d = .8, per = .14) => (i) => { const a = E.out3(seg(t, t0 + i * per, t0 + i * per + d)); return { a, blur: (1 - a) * 16, dy: (1 - a) * -30 }; };
const TS = (c = '#8fb0ff') => ({ c, b: 28 });
function moonGrade(a = 1) { tintK('#2a3f7a', .5 * a, 'soft-light'); tintK('#0a1430', .35 * a, 'multiply'); }
function atmos(t, fogA = .18) {
  fogLayer('navyfog', [150, 175, 220], t, fogA, 3, 14, 2, 0, H, 5);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; particles(t, 40, 3, '#C8A96A', { sz: 7, sp: 18 }); ctx.restore();
}
function rays(t, a = .35) { ctx.save(); ctx.globalCompositeOperation = 'screen'; lightRays(W * .8, -80, t, 9, 'rgba(180,200,255,.4)', a, 2600); ctx.restore(); }
function petals(t, n, seed, alpha = 1, col = '#c04a68') {
  for (let i = 0; i < n; i++) { const x = (hash(i + seed) * W + Math.sin(t * .8 + i) * 80), y = ((hash(i + seed + 3) * H + t * (90 + hash(i + seed + 5) * 140)) % (H + 100)) - 50, r = t * (1.2 + hash(i) * 2) + i; ctx.save(); ctx.globalAlpha = alpha * .8; ctx.translate(x, y); ctx.rotate(r); ctx.scale(1, .5 + .5 * Math.cos(r * 1.3)); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, 7); ctx.fill(); ctx.restore(); }
}
function laceEdge(x0, x1, y, dir, col, prog = 1) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; const n = Math.floor((x1 - x0) / 34 * prog);
  for (let i = 0; i < n; i++) { const x = x0 + i * 34; ctx.beginPath(); ctx.arc(x + 17, y, 17, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 17, y + dir * 6, 5, 0, 7); ctx.stroke(); }
  ctx.restore();
}

// T1 0-5 : ornate room, mist
function T1(t) {
  const p = seg(t, 0, 5);
  shot('room', { z: 1.02 + .08 * E.out2(p), dx: 30 * p, dy: -20 * p, filter: 'saturate(.55) contrast(1.25) brightness(' + lerp(.45, 1.05, E.out3(seg(t, 0, 1.8))) + ')' });
  moonGrade(); rays(t, .3); atmos(t, .26);
  grad(0, H, 'rgba(4,8,20,.2)', 'rgba(4,8,20,.55)');
  const gap = lerp(1.6, 1.12, E.out3(seg(t, .4, 3)));
  VX('離れ小島', 830, 380, { font: FM2, weight: 800, size: 168, gap, fill: Q.silver, shadow: TS(), per: revV(t, .5, .9, .24) });
  VX('船は、来ない。', 640, 560, { font: FM2, weight: 800, size: 74, gap: 1.14, fill: Q.gold, shadow: TS(Q.gold), per: revV(t, 2.2, .7, .14) });
  return { chroma: 1.5 };
}
// T2 5-12 : slow reveal tilt up to the face
function T2(t) {
  const p = E.io(seg(t, 5, 12));
  shot(lerpShot({ cx: 880, cy: 1000, sw: 560 }, { cx: 820, cy: 760, sw: 700 }, p), { filter: BLUE });
  moonGrade(); rays(t, .35); atmos(t, .2);
  grad(1250, H, 'rgba(4,8,20,0)', 'rgba(4,8,20,.8)');
  const ls = lerp(40, 16, E.out3(seg(t, 5.1, 6.3)));
  TX('月の下の屋敷', W / 2, 1520, { font: FM2, weight: 800, size: 100, maxW: 940, fill: Q.silver, ls, shadow: TS(), per: rev(t, 5.2, .7, .13) });
  TX('化け物と呼ばれた、ひとり', W / 2, 1660, { font: FM2, weight: 800, size: 70, maxW: 940, fill: Q.gold, ls: lerp(20, 6, E.out3(seg(t, 6.6, 7.8))), shadow: TS(Q.gold), per: rev(t, 6.6, .6, .1) });
  return { chroma: 1.5 };
}
// T3 12-20 : character card
function T3(t) {
  const p = seg(t, 12, 20);
  shot('full', { z: 1.03 + .03 * p, filter: 'saturate(.5) contrast(1.05) brightness(.55)' });
  moonGrade(); atmos(t, .14);
  const pin = E.out3(seg(t, 12, 13));
  const px = 100, pw = 880, py = 440, ph = 1130;
  ctx.save(); camT({ rot: Math.sin(t * .5) * .004 });
  ctx.save(); ctx.globalAlpha = pin; ctx.translate(0, (1 - pin) * 70);
  rr(px, py, pw, ph, 18); ctx.fillStyle = 'rgba(8,14,30,.86)'; ctx.fill();
  const per = 2 * (pw + ph), dr = E.out3(seg(t, 12.1, 13.6)) * per;
  ctx.save(); rr(px, py, pw, ph, 18); ctx.setLineDash([dr, per]); ctx.strokeStyle = Q.gold; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
  rr(px + 16, py + 16, pw - 32, ph - 32, 10); ctx.strokeStyle = 'rgba(201,211,230,.45)'; ctx.lineWidth = 1.5; ctx.stroke();
  const lp = E.out3(seg(t, 12.6, 14.2)); laceEdge(px + 20, px + pw - 20, py + 16, 1, 'rgba(200,169,106,.7)', lp); laceEdge(px + 20, px + pw - 20, py + ph - 16, -1, 'rgba(200,169,106,.7)', lp);
  ctx.restore();
  if (t > 13) {
    const a = E.out3(seg(t, 13, 13.8)); ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * -30);
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 650, 140, 0, 7); ctx.clip(); ctx.filter = 'saturate(.8) contrast(1.05) brightness(.95)'; ctx.drawImage(KEY, 700 * KS, 125 * KS, 320 * KS, 320 * KS, W / 2 - 140, 510, 280, 280); ctx.filter = 'none'; ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(60,90,170,.5)'; ctx.fillRect(W / 2 - 140, 510, 280, 280); ctx.restore();
    ctx.strokeStyle = Q.silver; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, 650, 140, 0, 7); ctx.stroke(); ctx.strokeStyle = Q.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(W / 2, 650, 152 + Math.sin(t * 2) * 2, 0, 7); ctx.stroke(); ctx.restore();
  }
  TX('離れ小島のお嬢様', W / 2, 870, { font: FM2, weight: 800, size: 84, maxW: 780, fill: Q.silver, ls: lerp(30, 6, E.out3(seg(t, 13.3, 14.4))), shadow: TS(), per: rev(t, 13.3, .7, .08) });
  const cvs = 'CV 山田じぇみ子'; const n = Math.floor(clamp((window.FT - 13.9) / .9) * [...cvs].length + .001);
  if (n > 0) TX([...cvs].slice(0, n).join(''), W / 2, 965, { font: FM2, weight: 800, size: 50, fill: Q.gold, ls: 8 });
  TX('化け物と呼ばれた主人', W / 2, 1055, { font: FM2, weight: 800, size: 58, maxW: 780, fill: '#e9c9c0', ls: 6, per: rev(t, 14.3, .7, .06) });
  const tags = [['#二メートルの巨躯', 14.7, 300, 1150], ['#ふたなり', 15.0, 700, 1150], ['#執着', 15.3, 500, 1230]];
  for (const [s, t0, cx, cy] of tags) { const a = E.out3(seg(t, t0, t0 + .6)); if (a <= 0) continue; const w = [...s].length * 38 + 50; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 20); rr(cx - w / 2, cy - 30, w, 60, 30); ctx.strokeStyle = Q.gold; ctx.lineWidth = 2; ctx.stroke(); TX(s, cx, cy + 2, { font: FM2, weight: 800, size: 34, fill: Q.silver }); ctx.restore(); }
  const y = 1400;
  if (t >= 15.7 && t < 18.0) {
    const a = E.out3(seg(t, 15.7, 16.4)), cr = seg(t, 17.1, 17.9), fl = E.io(seg(t, 17.7, 18.0));
    const sh = cr > 0 ? (hash(Math.floor(t * 30)) - .5) * 5 * cr : 0;
    ctx.save(); ctx.globalAlpha = a * (1 - fl); ctx.translate(W / 2, y); ctx.scale(1 - fl, 1); ctx.translate(-W / 2, -y);
    TX('気品ある令嬢', W / 2 + sh, y, { font: FM2, weight: 800, size: 96, maxW: 780, fill: '#fff', ls: 10, shadow: TS(), per: rev(t, 15.7, .7, .07) }); ctx.restore();
    if (cr > 0) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; const r = rnd(9); for (let k = 0; k < 2; k++) { ctx.beginPath(); let x = 300 + k * 50, yy = y - 55 + k * 30; ctx.moveTo(x, yy); const nn = Math.floor(cr * 16); for (let i = 0; i < nn; i++) { x += 18 + r() * 24; yy += (r() - .5) * 60 + (i % 2 ? 22 : -22); ctx.lineTo(x, yy); } ctx.stroke(); } ctx.restore(); }
  }
  if (t >= 18.0) {
    const s = E.io(seg(t, 18.0, 18.45)), l = t - 18.0;
    ring(W / 2, y, l, '#ff5a72', 700, 8, .8, .3);
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(s, 1); ctx.translate(-W / 2, -y);
    TX('二度と、離せない', W / 2, y, { font: FM2, weight: 800, size: 100, maxW: 780, fill: '#ff5a72', ls: 8, shadow: { c: '#a0102a', b: 34 + 10 * Math.sin(t * 4) }, stroke: { c: '#3a0812', w: 3 } }); ctx.restore();
  }
  ctx.restore();
  if (t >= 18) petals(t, 26, 5, E.out3(seg(t, 18, 19)) * (1 - seg(t, 19.6, 20)));
  return { chroma: 1.5 };
}
// T4 20-30 : looming, slow tilt from below to her face
function T4(t) {
  const p = E.io(seg(t, 20, 30));
  shot(lerpShot({ cx: 760, cy: 1000, sw: 560 }, 'full', p), { filter: BLUE });
  moonGrade(); rays(t, .4); atmos(t, .16);
  grad(0, W, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)');
  ctx.save(); const g = ctx.createLinearGradient(0, 0, 420, 0); g.addColorStop(0, 'rgba(4,8,20,.7)'); g.addColorStop(1, 'rgba(4,8,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 420, H); ctx.restore();
  const per1 = revV(t, 21.0, .9, .3), per2 = revV(t, 22.7, .9, .3), fl = Math.sin(t * .9) * 6;
  withShine(() => { VX('跪くまで、', 150, 560 + fl, { font: FM2, weight: 800, size: 118, gap: 1.12, fill: Q.silver, shadow: TS(), per: per1 }); VX('許さない', 300, 650 - fl, { font: FM2, weight: 800, size: 118, gap: 1.12, fill: Q.gold, shadow: TS(Q.gold), per: per2 }); }, t, 4, .1, 'rgba(255,255,255,.55)', 220);
  return { chroma: 1.5 };
}
// T5 30-40 : 熱 / 囁き / 鼓動
function T5(t) {
  const e = env(t);
  if (t < 33.4) {
    const l = t - 30;
    shimmerDraw(() => shot('mid', { z: 1.04 + l * .015, filter: 'saturate(1.2) contrast(1.15) brightness(.8)' }), t, 4 + 3 * e, .02, 5);
    tintK('#e0603a', .5, 'soft-light'); tintK('#3a0c08', .3, 'multiply');
    fogLayer('emberfog', [255, 120, 60], t, .16, 2.6, 6, -60, 0, H, 4);
    for (let i = 0; i < 90; i++) { const x = hash(i) * W, sp = 90 + hash(i + 3) * 200, y = H - ((t * sp + hash(i + 5) * H) % H); ctx.save(); ctx.globalCompositeOperation = 'lighter'; sparkle(x + Math.sin(t * 2 + i) * 24, y, 5 + hash(i + 8) * 10, '#ffb070', (.4 + .6 * Math.abs(Math.sin(t * 6 + i))) * (1 - y / H * .3)); ctx.restore(); }
    const a = E.out3(seg(t, 30, 31.3));
    shimmerDraw(() => TX('熱', W / 2, 900, { font: FM2, weight: 800, size: 760, fill: null, grad: ['#ffe2b0', '#e0603a', '#6B1E2E'], shadow: { c: '#ff6a3a', b: 70 }, per: () => ({ a, s: (1.25 - .25 * a) * (1 + .03 * Math.sin(t * 5)), blur: (1 - a) * 22 }) }), t, 10 + 5 * e, .028, 7);
  } else if (t < 36.6) {
    const l = t - 33.4;
    shot('thigh', { z: 1.04 + l * .02, dy: -l * 10, filter: BLUE }); moonGrade(); atmos(t, .2);
    for (let k = 0; k < 7; k++) { const r = ((l * 240 + k * 150) % 1000); ctx.save(); ctx.globalAlpha = (1 - r / 1000) * .5; ctx.strokeStyle = Q.silver; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(W / 2, 900, r, r * .9, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    for (let g = 4; g >= 0; g--) VX('囁き', W / 2, 480 - g * 6, { font: FM2, weight: 800, size: 340, gap: 1.02, fill: g === 0 ? '#fff' : Q.silver, shadow: g === 0 ? { c: '#8fb0ff', b: 44 } : null, per: (i) => { const a = E.out3(seg(t, 33.5 + i * .25, 34.3 + i * .25)); return { a: a * (g === 0 ? 1 : .18), blur: (1 - a) * 20 + g * 3, dx: g * 14 * Math.sin(t * 1.5 + g), s: 1 + g * .02 * Math.sin(t * 2) }; } });
  } else {
    const l = t - 36.6, bp = (l % .9) / .9, beat = Math.exp(-bp * 9) + .7 * Math.exp(-Math.abs(bp - .22) * 25);
    shot('bust', { z: 1.03 + .035 * beat + l * .01, filter: 'saturate(.8) contrast(1.1) brightness(.72)' });
    tintK('#8a1a30', .5, 'soft-light'); tintK('#1a0610', .3, 'multiply');
    for (let k = 0; k < 4; k++) { const r = ((l * 500 + k * 250) % 1000); ctx.save(); ctx.globalAlpha = (1 - r / 1000) * .6; ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, 1000, 150 + r, 0, 7); ctx.stroke(); ctx.restore(); }
    TX('鼓動', W / 2, 1000, { font: FM2, weight: 800, size: 360, maxW: 980, fill: '#ffdfe4', stroke: { c: '#6B1E2E', w: 6 }, shadow: { c: '#ff2a55', b: 50 + beat * 50 }, per: () => ({ s: (1 + .1 * beat) * (1.3 - .3 * E.out3(seg(t, 36.6, 37.1))), a: E.out3(seg(t, 36.6, 37.1)) }) });
    ctx.save(); ctx.globalAlpha = beat * .18; ctx.fillStyle = '#ff2a55'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  return { chroma: 1.5 + (t > 36.6 ? 3 : 0) };
}
// T6 40-50 : 檻 / 鍵 / 金玉 / ザーメン
function milk(t, t0) {
  const l = t - t0;
  for (let i = 0; i < 10; i++) {
    const y = 460 + i * 110 + Math.sin(t * 1.4 + i) * 22, w = clamp(l * 1.7 - i * .1) * (W + 300), th = 46 + hash(i + 3) * 30;
    if (w <= 0) continue;
    ctx.save(); const g = ctx.createLinearGradient(0, y - th, 0, y + th); g.addColorStop(0, 'rgba(255,252,246,0)'); g.addColorStop(.5, 'rgba(255,252,246,.42)'); g.addColorStop(1, 'rgba(255,252,246,0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-50, y); for (let x = -50; x <= w; x += 20) ctx.lineTo(x, y - th * (.6 + .4 * Math.sin(x * .012 + t * 3 + i)) * (x > w - 200 ? (w - x) / 200 : 1)); for (let x = w; x >= -50; x -= 20) ctx.lineTo(x, y + th * (.6 + .4 * Math.sin(x * .011 - t * 2.4 + i)) * (x > w - 200 ? (w - x) / 200 : 1)); ctx.fill(); ctx.restore();
  }
}
const GOLD2 = 'grayscale(1) sepia(1) saturate(1.6) hue-rotate(-15deg) brightness(.5) contrast(1.25)';
function T6(t) {
  if (t < 43) {
    const l = t - 40;
    shot('low', { z: 1.03 + l * .02, filter: GOLD2 }); tintK('#1a2a50', .3, 'soft-light'); atmos(t, .12);
    TX('檻', W / 2, 900, { font: FM2, weight: 800, size: 700, fill: Q.silver, shadow: { c: '#000', b: 40 }, per: () => ({ a: E.out3(seg(t, 40, 40.9)), blur: (1 - E.out3(seg(t, 40, 40.9))) * 18, s: 1.12 - .12 * E.out3(seg(t, 40, 41)) }) });
    for (let i = 0; i < 13; i++) { const x = 60 + i * 80, g = E.out3(clamp((l - i * .07) / .6)); ctx.fillStyle = Q.gold; ctx.globalAlpha = .85; ctx.fillRect(x - 3, 0, 6, H * g); ctx.globalAlpha = 1; }
  } else if (t < 45.6) {
    const l = t - 43;
    shot('thigh', { z: 1.03 + l * .02, dx: -l * 12, filter: GOLD2 }); tintK('#C8A96A', .25, 'soft-light'); atmos(t, .12);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; lightRays(W / 2, 900, t, 12, 'rgba(255,220,150,.45)', .5, 1600); ctx.restore();
    TX('鍵', W / 2, 900, { font: FM2, weight: 800, size: 620, fill: Q.gold, shadow: { c: '#000', b: 40 }, stroke: { c: '#2a1c06', w: 6 }, per: () => ({ a: E.out3(seg(t, 43, 43.6)), s: 1 + .25 * Math.exp(-l * 8) }) });
    ring(W / 2, 900, l, Q.gold, 900, 8, .8);
  } else if (t < 47.7) {
    const l = t - 45.6;
    shot('balls', { z: 1.03 + .02 * Math.sin(t * 3) + l * .02, filter: GOLD2 }); tintK('#C8A96A', .3, 'soft-light'); atmos(t, .1);
    shimmerDraw(() => TX('金玉', W / 2, 760, { font: FM2, weight: 800, size: 380, maxW: 980, fill: Q.gold, stroke: { c: '#2a1c06', w: 6 }, shadow: { c: '#000', b: 40 }, per: (i) => { const a = E.out3(seg(t, 45.6 + i * .18, 46.2 + i * .18)); return { a, blur: (1 - a) * 16, s: 1.2 - .2 * a }; } }), t, 5, .02, 4);
  } else {
    const l = t - 47.7;
    shot('low', { z: 1.05 + l * .03, filter: BLUE }); moonGrade(); milk(t, 47.7);
    const wp = E.out3(seg(t, 47.8, 48.7));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * wp, H); ctx.clip();
    TX('ザーメン', W / 2, 900, { font: FM2, weight: 800, size: 250, maxW: 980, fill: '#fffaf2', shadow: { c: '#8fb0ff', b: 40 }, stroke: { c: '#0A1020', w: 10 }, per: () => ({ s: 1 + .02 * Math.sin(t * 4) }) }); ctx.restore();
  }
  return { chroma: 1.5 };
}
// T7 50-55.6 : 一年 / あなたはもう、逃げられない
function T7(t) {
  const l = t - 50;
  shot('full', { z: 1.0 + .06 * l / 5.6, filter: BLUE }); moonGrade(); rays(t, .4); atmos(t, .16);
  grad(560, H, 'rgba(4,8,20,.1)', 'rgba(4,8,20,.7)');
  if (t < 52.7) TX('一年', W / 2, 800, { font: FM2, weight: 800, size: 420, maxW: 980, fill: '#fff', ls: 20, shadow: TS(), per: (i) => { const a = E.out3(seg(t, 50.2 + i * .25, 50.9 + i * .25)); return { a: a * (1 - seg(t, 52.4, 52.7)), blur: (1 - a) * 18, s: 1.12 - .12 * a }; } });
  const a2 = 1 - seg(t, 55.2, 55.6); ctx.save(); ctx.globalAlpha = a2;
  TX('あなたはもう、', W / 2, 1180, { font: FM2, weight: 800, size: 100, maxW: 940, fill: Q.silver, ls: lerp(30, 8, E.out3(seg(t, 52.2, 53.4))), shadow: TS(), per: rev(t, 52.2, .7, .1) });
  TX('逃げられない', W / 2, 1330, { font: FM2, weight: 800, size: 140, maxW: 940, fill: '#fff', ls: 8, shadow: TS(), per: rev(t, 53.1, .7, .1) });
  ctx.restore();
  return { chroma: 1.5 };
}
// T8 55.6-60 : title
function T8(t) {
  const q = seg(t, 55.6, 60);
  shot('full', { z: 1.06 - .05 * E.out2(q), filter: BLUE }); moonGrade(); rays(t, .45); atmos(t, .14);
  grad(700, H, 'rgba(4,8,20,.1)', 'rgba(4,8,20,.8)');
  ctx.save(); for (let i = 0; i < 50; i++) { const a = hash(i) * 6.283 + t * .3, r = 250 + hash(i + 4) * 440; ctx.globalCompositeOperation = 'lighter'; sparkle(W / 2 + Math.cos(a) * r, 1200 + Math.sin(a) * r * .8, 5 + hash(i + 8) * 9, '#C8A96A', .5 + .5 * Math.sin(t * 3 + i)); } ctx.restore();
  TX('化け物は、', W / 2, 900, { font: FM2, weight: 800, size: 110, maxW: 940, fill: Q.silver, ls: lerp(40, 10, E.out3(seg(t, 55.7, 57))), shadow: TS(), per: rev(t, 55.7, .7, .1) });
  TX('あなたを離さない。', W / 2, 1035, { font: FM2, weight: 800, size: 94, maxW: 940, fill: '#fff', ls: 8, shadow: TS(), per: rev(t, 56.4, .7, .08) });
  if (t >= 56.8) {
    [['デカふたなりの', 1240, 96, Q.silver, 0], ['お嬢様は', 1350, 96, Q.silver, .25], ['オナホ執事を', 1460, 96, Q.gold, .5], ['離さない', 1570, 96, Q.gold, .75]].forEach(([s, y, sz, f, off]) => {
      withShine(() => TX(s, W / 2, y, { font: FM2, weight: 800, size: sz, maxW: 940, fill: f, ls: 8, shadow: TS(f), per: rev(t, 56.8 + off, .6, .06) }), t, 3, off * .1, 'rgba(255,255,255,.7)', 200);
    });
    TX('CV 山田じぇみ子', W / 2, 1720, { font: FM2, weight: 800, size: 48, fill: '#e9c9c0', ls: 8, shadow: { c: '#000', b: 14 }, per: () => ({ a: E.out3(seg(t, 58.2, 58.9)) }) });
  }
  return { chroma: 1.5 };
}
const V2 = {
  scenes: [{ a: 0, b: 5, fn: T1 }, { a: 5, b: 12, fn: T2 }, { a: 12, b: 20, fn: T3 }, { a: 20, b: 30, fn: T4 }, { a: 30, b: 40, fn: T5 }, { a: 40, b: 50, fn: T6 }, { a: 50, b: 55.6, fn: T7 }, { a: 55.6, b: 60.01, fn: T8 }],
  trans: [{ at: 5, dur: .9, kind: 'blurfade' }, { at: 12, dur: .8, kind: 'blurfade' }, { at: 20, dur: .8, kind: 'blurfade' }, { at: 30, dur: .5, kind: 'dip', col: '#000' }, { at: 33.4, dur: .6, kind: 'blurfade' }, { at: 36.6, dur: .5, kind: 'dip', col: '#000' }, { at: 40, dur: .5, kind: 'dip', col: '#000' }, { at: 50, dur: .8, kind: 'blurfade' }, { at: 55.6, dur: .8, kind: 'fade' }],
  draw(t) { return runScenes(this, t); },
  post(t, fx) {
    bloom(.38, 14);
    chroma(fx.chroma || 1.5);
    vignette(.65);
    grain(t, .05);
    flash(t, [18.0], '#fff', 6, .5);
    fadeIO(t, .6, .8);
  }
};
