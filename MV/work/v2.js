// ===== V2 離島の神秘 =====
const Q = { navy: '#0A1020', silver: '#C9D3E6', gold: '#C8A96A', teal: '#1F3A4D', wine: '#6B1E2E' };
const FM2 = 'Shippori Mincho B1';

function fog(t, a = .12, col = '150,170,200') {
  for (let i = 0; i < 6; i++) {
    const x = ((i * 260 + t * (10 + i * 3)) % (W + 600)) - 300, y = 900 + i * 130 + Math.sin(t * .3 + i) * 40;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 420);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - 420, y - 420, 840, 840);
  }
}
function stars(t, n = 90, ymax = 1000) {
  const r = rnd(21);
  for (let i = 0; i < n; i++) { const x = r() * W, y = r() * ymax, s = .5 + r() * 1.6, ph = r() * 6.28; const tw = .4 + .6 * Math.abs(Math.sin(t * (.6 + r()) + ph)); ctx.fillStyle = `rgba(220,230,255,${tw * .8})`; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); }
}
function moon(x, y, r, a = 1) {
  glowCircle(x, y, r * 3.6, 'rgba(160,185,235,.55)', a);
  const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
  g.addColorStop(0, '#f6f8ff'); g.addColorStop(1, '#b5c3e0');
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(120,140,180,.25)'; [[-.3, -.1, .22], [.25, .2, .3], [.05, -.4, .12], [-.2, .35, .15]].forEach(([dx, dy, k]) => { ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, k * r, 0, 7); ctx.fill(); });
  ctx.restore();
}
function manor(cx, base, s, col, lit, t) {
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s); ctx.fillStyle = col;
  // island rock
  ctx.beginPath(); ctx.moveTo(-620, 0); ctx.bezierCurveTo(-520, -60, -420, -50, -340, -70); ctx.lineTo(340, -70); ctx.bezierCurveTo(420, -50, 520, -60, 620, 0); ctx.closePath(); ctx.fill();
  // main hall
  ctx.fillRect(-260, -330, 520, 262);
  // wings
  ctx.fillRect(-380, -250, 130, 180); ctx.fillRect(250, -250, 130, 180);
  // roof
  ctx.beginPath(); ctx.moveTo(-290, -330); ctx.lineTo(0, -450); ctx.lineTo(290, -330); ctx.closePath(); ctx.fill();
  // towers
  [[-220, 90, 240], [220, 90, 240], [0, 70, 420]].forEach(([x, w, h]) => {
    ctx.fillRect(x - w / 2, -70 - h, w, h);
    ctx.beginPath(); ctx.moveTo(x - w / 2 - 10, -70 - h); ctx.lineTo(x, -70 - h - w * 1.3); ctx.lineTo(x + w / 2 + 10, -70 - h); ctx.closePath(); ctx.fill();
  });
  // trees
  for (let i = 0; i < 9; i++) { const x = -560 + i * 140 + (i % 2) * 20; ctx.beginPath(); ctx.ellipse(x, -70, 40, 90 - (i % 3) * 20, 0, 0, 7); ctx.fill(); }
  // windows
  const w = [[-300, -200], [-330, -140], [-230, -260], [-190, -170], [-120, -250], [-60, -190], [60, -190], [120, -250], [190, -170], [230, -260], [300, -190], [330, -130], [0, -330], [0, -400], [-220, -330], [220, -330]];
  w.forEach(([x, y], i) => {
    const fl = .65 + .35 * Math.sin(t * 3 + i * 1.7) * (i % 3 === 0 ? 1 : .4);
    ctx.fillStyle = lit; ctx.globalAlpha = fl * .95; ctx.beginPath(); ctx.roundRect(x - 9, y - 16, 18, 32, [9, 9, 0, 0]); ctx.fill();
  });
  ctx.restore();
}
function bgV2(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#040712'); g.addColorStop(.55, '#0A1020'); g.addColorStop(1, '#14283a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  stars(t);
  fog(t, .1);
  particles(t, 46, 3, '#C8A96A', { sz: 7, sp: 20 });
}
const rev = (t, t0, d = .55, per = .08, blur = 14) => (i) => { const a = E.out3(seg(t, t0 + i * per, t0 + i * per + d)); return { a, blur: (1 - a) * blur, dy: (1 - a) * 22 }; };
const revV = (t, t0, d = .6, per = .12) => (i) => { const a = E.out3(seg(t, t0 + i * per, t0 + i * per + d)); return { a, blur: (1 - a) * 14, dy: (1 - a) * -26 }; };

function T1(t) {
  moon(300, 560, 125);
  // sea
  waves(t, 1420, 14, (l) => ['#0b1a2c', '#0d2033', '#10283c'][l], .8, 3, 1);
  // moon reflection
  ctx.save(); ctx.globalAlpha = .35; for (let i = 0; i < 16; i++) { const y = 1440 + i * 26, w = 200 - i * 8 + Math.sin(t * 2 + i) * 20; ctx.fillStyle = '#c9d3e6'; ctx.fillRect(300 - w / 2 + Math.sin(t + i) * 12, y, w, 4); } ctx.restore();
  // tiny boat leaving
  const bx = 520 + t * 22, by = 1405 + Math.sin(t * 1.6) * 3, ba = 1 - seg(t, 2.6, 4.6);
  if (ba > 0) { ctx.save(); ctx.globalAlpha = ba; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(bx - 34, by); ctx.lineTo(bx + 34, by); ctx.lineTo(bx + 22, by + 12); ctx.lineTo(bx - 22, by + 12); ctx.fill(); ctx.fillRect(bx - 1, by - 42, 3, 42); ctx.beginPath(); ctx.moveTo(bx + 4, by - 40); ctx.lineTo(bx + 28, by - 6); ctx.lineTo(bx + 4, by - 6); ctx.fill(); ctx.restore(); }
  VX('離れ小島', 830, 380, { font: FM2, weight: 800, size: 168, gap: 1.12, fill: Q.silver, shadow: { c: '#8fb0ff', b: 30 }, per: revV(t, .5, .8, .22) });
  VX('船は、来ない。', 640, 560, { font: FM2, weight: 800, size: 74, gap: 1.14, fill: Q.gold, shadow: { c: Q.gold, b: 16 }, per: revV(t, 2.2, .6, .13) });
}
function T2(t) {
  const lt = t - 5;
  const zoom = 1 + lt * .012, px = -lt * 8;
  moon(790, 700, 125);
  ctx.save(); ctx.translate(W / 2 + px, 1300); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -1300);
  manor(W / 2, 1330, 1.55, '#02050c', '#e8c46e', t);
  ctx.restore();
  fog(t + 20, .12);
  waves(t, 1460, 16, (l) => ['#0a1828', '#0c2032', '#10283c'][l], .9, 3, 1);
  TX('月の下の屋敷', W / 2, 330, { font: FM2, weight: 800, size: 100, maxW: 940, fill: Q.silver, ls: 16, shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 5.2, .6, .12) });
  TX('化け物と呼ばれた、ひとり', W / 2, 470, { font: FM2, weight: 800, size: 70, maxW: 940, fill: Q.gold, ls: 6, shadow: { c: Q.gold, b: 14 }, per: rev(t, 6.6, .5, .09) });
}
function laceEdge(x0, x1, y, dir, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2;
  for (let x = x0; x < x1; x += 34) { ctx.beginPath(); ctx.arc(x + 17, y, 17, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 17, y + dir * 6, 5, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function T3(t) {
  const pa = E.out3(seg(t, 12, 13));
  const px = 100, pw = 880, py = 400, ph = 1130;
  ctx.save(); ctx.globalAlpha = pa; ctx.translate(0, (1 - pa) * 40);
  rr(px, py, pw, ph, 18); ctx.fillStyle = 'rgba(8,14,30,.88)'; ctx.fill();
  rr(px, py, pw, ph, 18); ctx.strokeStyle = Q.gold; ctx.lineWidth = 2.5; ctx.stroke();
  rr(px + 16, py + 16, pw - 32, ph - 32, 10); ctx.strokeStyle = 'rgba(201,211,230,.45)'; ctx.lineWidth = 1.5; ctx.stroke();
  laceEdge(px + 20, px + pw - 20, py + 16, 1, 'rgba(200,169,106,.7)');
  laceEdge(px + 20, px + pw - 20, py + ph - 16, -1, 'rgba(200,169,106,.7)');
  ctx.restore();
  if (t > 13) {
    const a = E.out3(seg(t, 13, 13.7));
    ctx.save(); ctx.globalAlpha = a;
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 610, 125, 0, 7); ctx.clip();
    const g = ctx.createRadialGradient(W / 2, 610, 10, W / 2, 610, 150); g.addColorStop(0, '#2b3f6a'); g.addColorStop(1, '#0a1020'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 140, 470, 280, 280);
    figure(ctx, W / 2, 520, 820, { col: '#000', gown: true, rim: '#C9D3E6', rimA: .8 });
    ctx.restore();
    ctx.strokeStyle = Q.silver; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, 610, 125, 0, 7); ctx.stroke();
    ctx.strokeStyle = Q.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(W / 2, 610, 136, 0, 7); ctx.stroke();
    ctx.restore();
  }
  TX('離れ小島のお嬢様', W / 2, 810, { font: FM2, weight: 800, size: 84, maxW: 780, fill: Q.silver, ls: 6, shadow: { c: '#8fb0ff', b: 18 }, per: rev(t, 13.3, .6, .08) });
  const cvs = 'CV 山田じぇみ子'; const n = Math.floor(clamp((t - 13.9) / .9) * [...cvs].length + .001);
  if (n > 0) TX([...cvs].slice(0, n).join(''), W / 2, 905, { font: FM2, weight: 800, size: 50, fill: Q.gold, ls: 8 });
  TX('化け物と呼ばれた主人', W / 2, 995, { font: FM2, weight: 800, size: 58, maxW: 780, fill: '#e9c9c0', ls: 6, per: rev(t, 14.3, .6, .06) });
  const tags = [['#二メートルの巨躯', 14.7, 300, 1090], ['#ふたなり', 15.0, 700, 1090], ['#執着', 15.3, 500, 1170]];
  for (const [s, t0, cx, cy] of tags) {
    const a = E.out3(seg(t, t0, t0 + .6)); if (a <= 0) continue;
    const w = [...s].length * 38 + 50;
    ctx.save(); ctx.globalAlpha = a; rr(cx - w / 2, cy - 30, w, 60, 30); ctx.strokeStyle = Q.gold; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = a; TX(s, cx, cy + 2, { font: FM2, weight: 800, size: 34, fill: Q.silver }); ctx.restore();
  }
  // face-turn: front -> crack -> back
  const y = 1345;
  if (t >= 15.7 && t < 18.0) {
    const a = E.out3(seg(t, 15.7, 16.4));
    const cr = seg(t, 17.1, 17.9);
    const sh = cr > 0 ? (hash(Math.floor(t * 30)) - .5) * 5 * cr : 0;
    ctx.save(); ctx.globalAlpha = a * (1 - seg(t, 17.7, 18.0));
    ctx.translate(W / 2, y); ctx.scale(1 - E.io(seg(t, 17.7, 18.0)), 1); ctx.translate(-W / 2, -y);
    TX('気品ある令嬢', W / 2 + sh, y, { font: FM2, weight: 800, size: 96, maxW: 780, fill: '#fff', ls: 10, shadow: { c: '#8fb0ff', b: 22 } });
    ctx.restore();
    if (cr > 0) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); const nn = Math.floor(cr * 16); let x = 300, yy = 1290; ctx.moveTo(x, yy); const r = rnd(9); for (let i = 0; i < nn; i++) { x += 18 + r() * 24; yy += (r() - .5) * 60 + (i % 2 ? 22 : -22); ctx.lineTo(x, yy); } ctx.stroke(); ctx.restore(); }
  }
  if (t >= 18.0) {
    const s = E.io(seg(t, 18.0, 18.4)), l = t - 18.0;
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(s, 1); ctx.translate(-W / 2, -y);
    TX('二度と、離せない', W / 2, y, { font: FM2, weight: 800, size: 100, maxW: 780, fill: '#ff5a72', ls: 8, shadow: { c: '#a0102a', b: 34 }, stroke: { c: '#3a0812', w: 3 } });
    ctx.restore();
  }
}
function T4(t) {
  const lt = t - 20;
  const top = lerp(-60, -560, E.io(seg(t, 20, 30)));
  moon(540, 300 + top * .5, 170, .95);
  figure(ctx, W / 2, top + 40, 2500, { col: '#01030a', gown: true, rim: '#C9D3E6', rimA: .75 });
  // gown lace shimmer: silver lines along lower skirt
  ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = Q.silver; ctx.lineWidth = 1.5;
  for (let i = 0; i < 26; i++) { const x = 60 + i * 40; ctx.beginPath(); ctx.moveTo(W / 2 + (x - W / 2) * .15, 1150); ctx.quadraticCurveTo(x, 1500, x + (x - W / 2) * .2, 1920); ctx.stroke(); }
  ctx.restore();
  butler(ctx, 300, 1890 + Math.max(0, top + 560) * 0, 150, '#000', 'bow');
  fog(t, .1);
  const per1 = revV(t, 21.0, .8, .28), per2 = revV(t, 22.6, .8, .28);
  const fl = Math.sin(t * .9) * 6;
  VX('跪くまで、', 890, 330 + fl, { font: FM2, weight: 800, size: 118, gap: 1.12, fill: Q.silver, shadow: { c: '#8fb0ff', b: 26 }, per: per1 });
  VX('許さない', 730, 420 - fl, { font: FM2, weight: 800, size: 118, gap: 1.12, fill: Q.gold, shadow: { c: Q.gold, b: 20 }, per: per2 });
}
function T5(t) {
  if (t < 33.2) {
    const l = t - 30;
    // ember haze
    glowCircle(W / 2, 900, 700, 'rgba(180,50,50,.5)', .8 + .2 * Math.sin(t * 3));
    for (let i = 0; i < 70; i++) { const x = hash(i) * W, sp = 90 + hash(i + 3) * 160, y = (H - ((t * sp + hash(i + 5) * H) % H)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; sparkle(x + Math.sin(t * 2 + i) * 20, y, 6 + hash(i + 8) * 8, '#ff9a5a', .5 + .5 * Math.sin(t * 6 + i)); ctx.restore(); }
    shimmerDraw(() => TX('熱', W / 2, 900, { font: FM2, weight: 800, size: 760, fill: null, grad: ['#ffd9a0', '#e0603a', '#6B1E2E'], shadow: { c: '#ff6a3a', b: 60 }, per: () => ({ a: E.out3(seg(t, 30, 31.2)), s: 1 + .05 * Math.sin(t * 5), blur: (1 - E.out3(seg(t, 30, 31.2))) * 20 }) }), t, 10 + 4 * env(t), .028, 7);
  } else if (t < 36.6) {
    const l = t - 33.2;
    for (let k = 0; k < 6; k++) { const r = ((l * 260 + k * 170) % 900); ctx.save(); ctx.globalAlpha = (1 - r / 900) * .5; ctx.strokeStyle = Q.silver; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(W / 2, 900, r, r * .9, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    for (let g = 2; g >= 0; g--) {
      VX('囁き', W / 2 + g * 8 * Math.sin(t * 2), 500 - g * 4, { font: FM2, weight: 800, size: 340, gap: 1.02, fill: g === 0 ? '#fff' : Q.silver, shadow: g === 0 ? { c: '#8fb0ff', b: 40 } : null,
        per: (i) => { const a = E.out3(seg(t, 33.3 + i * .25, 34.1 + i * .25)); return { a: a * (g === 0 ? 1 : .22), blur: (1 - a) * 18 + g * 2.2 }; } });
    }
  } else {
    const l = t - 36.6, bp = (l % .9) / .9;
    const beat = Math.exp(-bp * 9) + .7 * Math.exp(-Math.abs(bp - .22) * 25);
    ctx.save(); ctx.fillStyle = `rgba(107,30,46,${.25 + .15 * beat})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    for (let k = 0; k < 4; k++) { const r = ((l * 500 + k * 250) % 1000); ctx.save(); ctx.globalAlpha = (1 - r / 1000) * .7; ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, 900, 150 + r, 0, 7); ctx.stroke(); ctx.restore(); }
    TX('鼓動', W / 2, 900, { font: FM2, weight: 800, size: 360, maxW: 980, fill: '#ffdfe4', stroke: { c: '#6B1E2E', w: 6 }, shadow: { c: '#ff2a55', b: 50 + beat * 40 }, per: () => ({ s: 1 + .08 * beat, a: E.out3(seg(t, 36.6, 37.1)) }) });
  }
}
function T6(t) {
  if (t < 43) {
    const l = t - 40;
    TX('檻', W / 2, 900, { font: FM2, weight: 800, size: 700, fill: Q.silver, shadow: { c: '#8fb0ff', b: 30 }, per: () => ({ a: E.out3(seg(t, 40, 40.8)), blur: (1 - E.out3(seg(t, 40, 40.8))) * 16 }) });
    for (let i = 0; i < 13; i++) { const x = 60 + i * 80, g = E.out3(clamp((l - i * .07) / .6)); ctx.fillStyle = Q.gold; ctx.globalAlpha = .9; ctx.fillRect(x - 3, 0, 6, H * g); ctx.globalAlpha = 1; }
    ctx.fillStyle = Q.gold; ctx.globalAlpha = .9 * E.out3(clamp((l - 1) / .5)); ctx.fillRect(0, 700, W, 6); ctx.fillRect(0, 1100, W, 6); ctx.globalAlpha = 1;
  } else if (t < 45.5) {
    const l = t - 43;
    glowCircle(W / 2, 900, 520, 'rgba(200,169,106,.45)', 1);
    ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(-.5 + E.out3(clamp(l / 1)) * .5); ctx.shadowColor = Q.gold; ctx.shadowBlur = 40; keyShape(ctx, 0, -120, 520, 'rgba(200,169,106,.35)', 0); ctx.restore();
    TX('鍵', W / 2, 900, { font: FM2, weight: 800, size: 620, fill: Q.gold, shadow: { c: Q.gold, b: 50 }, per: () => ({ a: E.out3(seg(t, 43, 43.6)), s: punchS(l, 8, .25) }) });
  } else if (t < 47.6) {
    const l = t - 45.5;
    for (const x of [400, 680]) { const y = 1300 + Math.sin(t * 2 + x) * 10; const g = ctx.createRadialGradient(x - 30, y - 30, 8, x, y, 130); g.addColorStop(0, '#fff2c8'); g.addColorStop(.5, '#C8A96A'); g.addColorStop(1, '#3a2a10'); ctx.save(); ctx.globalAlpha = E.out3(seg(t, 45.8, 46.5)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 130, 0, 7); ctx.fill(); ctx.restore(); }
    shimmerDraw(() => TX('金玉', W / 2, 800, { font: FM2, weight: 800, size: 380, maxW: 980, fill: Q.gold, shadow: { c: Q.gold, b: 40 }, per: (i) => ({ a: E.out3(seg(t, 45.5 + i * .18, 46.1 + i * .18)), blur: (1 - E.out3(seg(t, 45.5 + i * .18, 46.1 + i * .18))) * 16 }) }), t, 5, .02, 4);
  } else {
    const l = t - 47.6;
    // milky flow bands
    for (let i = 0; i < 9; i++) { const y = 500 + i * 130 + Math.sin(t * 1.5 + i) * 30; const w = clamp(l * 1.6 - i * .12) * W * 1.2; const g = ctx.createLinearGradient(0, y - 40, 0, y + 40); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,250,245,.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, y - 40, w, 80); }
    const wp = seg(t, 47.7, 48.6);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * wp, H); ctx.clip();
    TX('ザーメン', W / 2, 900, { font: FM2, weight: 800, size: 250, maxW: 980, fill: '#fffaf2', shadow: { c: '#fff', b: 40 }, per: () => ({ s: 1 + .02 * Math.sin(t * 4) }) });
    ctx.restore();
  }
}
function T7(t) {
  const l = t - 50;
  moon(W / 2, 760, 200 + l * 14, 1);
  waves(t, 1500, 14, (k) => ['#0a1828', '#0c2032', '#10283c'][k], .9, 3, 1);
  if (t < 52.6) TX('一年', W / 2, 760, { font: FM2, weight: 800, size: 420, maxW: 980, fill: '#0A1020', ls: 20, stroke: { c: '#dfe8ff', w: 5 }, per: (i) => { const a = E.out3(seg(t, 50.2 + i * .25, 50.9 + i * .25)); return { a: a * (1 - seg(t, 52.3, 52.6)), blur: (1 - a) * 18 }; } });
  const a2 = 1 - seg(t, 55.2, 55.6);
  ctx.save(); ctx.globalAlpha = a2;
  TX('あなたはもう、', W / 2, 1120, { font: FM2, weight: 800, size: 100, maxW: 940, fill: Q.silver, ls: 8, shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 52.2, .6, .1) });
  TX('逃げられない', W / 2, 1270, { font: FM2, weight: 800, size: 140, maxW: 940, fill: '#fff', ls: 8, shadow: { c: '#8fb0ff', b: 30 }, per: rev(t, 53.1, .6, .1) });
  ctx.restore();
}
function T8(t) {
  const l = t - 55.6;
  moon(W / 2, 900, 140, 1);
  ctx.save(); ctx.globalAlpha = .9; for (let i = 0; i < 60; i++) { const a = hash(i) * 6.283 + t * .3, r = 250 + hash(i + 4) * 420; sparkle(W / 2 + Math.cos(a) * r, 900 + Math.sin(a) * r * .8, 5 + hash(i + 8) * 8, '#C8A96A', .5 + .5 * Math.sin(t * 3 + i)); } ctx.restore();
  TX('化け物は、', W / 2, 430, { font: FM2, weight: 800, size: 120, maxW: 940, fill: Q.silver, ls: 10, shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 55.7, .5, .09) });
  TX('あなたを離さない。', W / 2, 590, { font: FM2, weight: 800, size: 100, maxW: 940, fill: '#fff', ls: 8, shadow: { c: '#8fb0ff', b: 26 }, per: rev(t, 56.4, .5, .07) });
  if (t >= 56.8) {
    const k = t - 56.8;
    [['デカふたなりの', 1170, 104, Q.silver, 0], ['お嬢様は', 1290, 104, Q.silver, .25], ['オナホ執事を', 1410, 104, Q.gold, .5], ['離さない', 1530, 104, Q.gold, .75]].forEach(([s, y, sz, f, off]) => {
      TX(s, W / 2, y, { font: FM2, weight: 800, size: sz, maxW: 940, fill: f, ls: 8, shadow: { c: f, b: 20 }, per: rev(t, 56.8 + off, .5, .06) });
    });
    TX('CV 山田じぇみ子', W / 2, 1690, { font: FM2, weight: 800, size: 48, fill: '#e9c9c0', ls: 8, per: () => ({ a: E.out3(seg(t, 58, 58.6)) }) });
  }
}
const V2 = {
  draw(t) {
    bgV2(t);
    if (t < 5) T1(t); else if (t < 12) T2(t); else if (t < 20) T3(t); else if (t < 30) T4(t); else if (t < 40) T5(t); else if (t < 50) T6(t); else if (t < 55.6) T7(t); else T8(t);
    return { glitch: 0, chroma: 1.5 };
  },
  post(t, fx) {
    bloom(.42, 14);
    chroma(fx.chroma);
    vignette(.7);
    grain(t, .05);
    flash(t, [5, 12, 20, 30, 33.2, 36.6, 40, 43, 45.5, 47.6, 50, 55.6], '#c9d3ff', 6, .3);
    flash(t, [18.0], '#fff', 6, .5);
    fadeIO(t, .6, .8);
  }
};
