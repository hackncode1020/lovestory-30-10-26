/* Our Love Story 📖 — a 3D storybook in plain HTML/CSS/JS + canvas. Made by @hack.n.code */
(() => {
'use strict';
const Q = new URLSearchParams(location.search);
const clean = s => (s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
let NAME = clean(Q.get('name')).slice(0, 22) || 'my love';
let LINE = clean(Q.get('line')).slice(0, 90) || 'Thank you for being my favourite chapter.';
const DEMO = Q.get('demo') === '1';
const $ = id => document.getElementById(id);

const cv = $('scene'), ctx = cv.getContext('2d');
let VW = 0, VH = 0, DPR = 1;
const B = { x: 0, y: 0, w: 300, h: 500 };
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const eOut = k => 1 - Math.pow(1 - clamp(k), 3);
const eInOut = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const eBack = k => { k = clamp(k); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mix(c1, c2, k) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const r = Math.round(lerp(a >> 16, b >> 16, k)), g = Math.round(lerp(a >> 8 & 255, b >> 8 & 255, k)), bl = Math.round(lerp(a & 255, b & 255, k));
  return `rgb(${r},${g},${bl})`;
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function heart(c, x, y, s) {
  const h = s * .5; c.beginPath(); c.moveTo(x, y + h * .9);
  c.bezierCurveTo(x - s * .9, y + h * .1, x - s * .55, y - h * 1.1, x, y - h * .35);
  c.bezierCurveTo(x + s * .55, y - h * 1.1, x + s * .9, y + h * .1, x, y + h * .9); c.closePath();
}
function wrap(c, text, maxW) {
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
const F = {
  title: s => `900 ${s}px "Playfair Display", Georgia, serif`,
  ital: s => `italic 700 ${s}px "Playfair Display", Georgia, serif`,
  body: s => `600 ${s}px Poppins, system-ui, sans-serif`,
  bold: s => `800 ${s}px Poppins, system-ui, sans-serif`,
  script: s => `${s}px "Great Vibes", cursive`,
  hand: s => `700 ${s}px Caveat, cursive`
};

/* ---------------- story ---------------- */
const CH = [
  null,
  { t: 'The day I first saw you', b: 'An ordinary day… until you walked in. My heart just knew. ✨' },
  { t: 'Our first talk', b: 'One “hi” became hours. I kept smiling at my phone like a fool. 📱' },
  { t: 'Late night calls', b: '“You hang up first.” “No, you.” 3 AM never felt so short. 🌙' },
  { t: 'Our first fight… and the hug after', b: 'We fought over something silly. Your hug fixed everything. 🌈' },
  { t: 'Little things you do', b: 'Your laugh, your good-morning texts, my stolen hoodie. 🥹' },
  { t: 'Every day with you', b: 'Every single day, I would still choose you. Again and again. 📅' },
  { t: 'The last page', b: '' }
];
const NPAGES = 7;

/* ---------------- textures ---------------- */
let noisePat = null, leatherPat = null;
function makePatterns() {
  const n = document.createElement('canvas'); n.width = n.height = 160; const nc = n.getContext('2d'); const R = rng(7);
  const id = nc.createImageData(160, 160);
  for (let i = 0; i < id.data.length; i += 4) { const v = 200 + R() * 55; id.data[i] = v; id.data[i + 1] = v * .96; id.data[i + 2] = v * .88; id.data[i + 3] = R() * 34; }
  nc.putImageData(id, 0, 0); noisePat = ctx.createPattern(n, 'repeat');
  const l = document.createElement('canvas'); l.width = l.height = 160; const lc = l.getContext('2d'); const R2 = rng(11);
  for (let i = 0; i < 900; i++) { lc.fillStyle = `rgba(0,0,0,${R2() * .22})`; lc.beginPath(); lc.ellipse(R2() * 160, R2() * 160, 1 + R2() * 3, 1 + R2() * 2, R2() * 3, 0, TAU); lc.fill(); }
  for (let i = 0; i < 300; i++) { lc.fillStyle = `rgba(255,200,200,${R2() * .06})`; lc.fillRect(R2() * 160, R2() * 160, 2, 2); }
  leatherPat = ctx.createPattern(l, 'repeat');
}
const texA = document.createElement('canvas'), texB = document.createElement('canvas'), texBack = document.createElement('canvas'), texEnd = document.createElement('canvas');

const STARS = (() => { const R = rng(3), a = []; for (let i = 0; i < 170; i++) a.push({ x: R(), y: R(), r: .5 + R() * 1.6, p: R() * TAU, s: .6 + R() * 2 }); return a; })();
const PETALS = (() => { const R = rng(5), a = []; for (let i = 0; i < 22; i++) a.push({ x: R(), y: R(), s: 7 + R() * 9, vx: -.02 + R() * .04, vy: .03 + R() * .04, rot: R() * TAU, vr: -1 + R() * 2, sw: R() * TAU, front: i % 3 === 0, hue: R() }); return a; })();
const BULBS = ['#ffcf6b', '#ff8fb8', '#fff1b3', '#ffb36b', '#ff6f9a'];

/* ---------------- state ---------------- */
const S = {
  phase: 'splash', cur: 0, flip: null, pageT0: {}, final: false,
  sealT: -1, burstT: [], confettiT: -1, shakeT: -1, splashT0: 0, endT0: -1
};
let NOW = 0;

/* ---------------- audio (WebAudio, created on first tap) ---------------- */
const A = { ctx: null, on: true, master: null, music: null, timer: 0, step: 0, next: 0 };
function audioInit() {
  if (A.ctx || DEMO) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    A.ctx = new AC(); A.master = A.ctx.createGain(); A.master.gain.value = .9; A.master.connect(A.ctx.destination);
    A.music = A.ctx.createGain(); A.music.gain.value = .32; A.music.connect(A.master);
    const d = A.ctx.createDelay(); d.delayTime.value = .33; const fb = A.ctx.createGain(); fb.gain.value = .28; const wet = A.ctx.createGain(); wet.gain.value = .35;
    A.music.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(A.master);
    A.next = A.ctx.currentTime + .1; A.timer = setInterval(schedule, 90);
  } catch (e) { A.ctx = null; }
}
const CHORDS = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function note(m, t, len, vol, type) {
  const o = A.ctx.createOscillator(), g = A.ctx.createGain(), o2 = A.ctx.createOscillator(), g2 = A.ctx.createGain();
  o.type = type || 'triangle'; o.frequency.value = mtof(m); o2.type = 'sine'; o2.frequency.value = mtof(m) * 2; g2.gain.value = .25;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + len);
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(A.music); o.start(t); o2.start(t); o.stop(t + len + .05); o2.stop(t + len + .05);
}
function schedule() {
  if (!A.ctx) return; const spb = 60 / 76 / 2;
  while (A.next < A.ctx.currentTime + .25) {
    if (A.on) {
      const bar = Math.floor(A.step / 8) % 4, k = A.step % 8, ch = CHORDS[bar];
      const pat = [0, 2, 1, 3, 2, 1, 3, 2];
      note(ch[pat[k]] + 12, A.next, 1.6, .16);
      if (k === 0) { note(ch[0] - 12, A.next, 3.2, .2, 'sine'); note(ch[2] - 12, A.next, 3.2, .1, 'sine'); }
      if (k === 4 && bar % 2 === 1) note(ch[3] + 24, A.next, 1.2, .06, 'sine');
    }
    A.step++; A.next += spb;
  }
}
function noiseBuf(len) { const b = A.ctx.createBuffer(1, Math.floor(A.ctx.sampleRate * len), A.ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
function sfxFlip() {
  if (!A.ctx || !A.on) return; const t = A.ctx.currentTime;
  const s = A.ctx.createBufferSource(); s.buffer = noiseBuf(.6); const f = A.ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .8;
  f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(700, t + .45);
  const g = A.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.55, t + .05); g.gain.exponentialRampToValueAtTime(.001, t + .5);
  s.connect(f); f.connect(g); g.connect(A.master); s.start(t);
  const o = A.ctx.createOscillator(), og = A.ctx.createGain(); o.frequency.setValueAtTime(140, t + .38); o.frequency.exponentialRampToValueAtTime(60, t + .55);
  og.gain.setValueAtTime(0, t + .37); og.gain.linearRampToValueAtTime(.25, t + .39); og.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(og); og.connect(A.master); o.start(t + .36); o.stop(t + .65);
}
function sfxPen(dur) {
  if (!A.ctx || !A.on) return; const t = A.ctx.currentTime;
  const s = A.ctx.createBufferSource(); s.buffer = noiseBuf(dur + .1); const f = A.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500;
  const g = A.ctx.createGain(); g.gain.setValueAtTime(0, t);
  for (let i = 0; i < dur * 9; i++) { g.gain.linearRampToValueAtTime(.05 + Math.random() * .08, t + i / 9 + .05); g.gain.linearRampToValueAtTime(.01, t + i / 9 + .1); }
  g.gain.linearRampToValueAtTime(0, t + dur); s.connect(f); f.connect(g); g.connect(A.master); s.start(t);
}
function sfxChime(base) {
  if (!A.ctx || !A.on) return; const t = A.ctx.currentTime;
  [0, 4, 7, 12, 16].forEach((d, i) => { const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = 'sine'; o.frequency.value = mtof(base + d);
    g.gain.setValueAtTime(0, t + i * .07); g.gain.linearRampToValueAtTime(.16, t + i * .07 + .01); g.gain.exponentialRampToValueAtTime(.001, t + i * .07 + 1.4); o.connect(g); g.connect(A.master); o.start(t + i * .07); o.stop(t + i * .07 + 1.5); });
}
function sfxThud() {
  if (!A.ctx || !A.on) return; const t = A.ctx.currentTime; const o = A.ctx.createOscillator(), g = A.ctx.createGain();
  o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + .35); g.gain.setValueAtTime(.7, t); g.gain.exponentialRampToValueAtTime(.001, t + .45);
  o.connect(g); g.connect(A.master); o.start(t); o.stop(t + .5); sfxChime(76);
}

/* ---------------- layout ---------------- */
let layoutCache = {};
function resize() {
  VW = innerWidth; VH = innerHeight; DPR = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  const top = $('top').getBoundingClientRect().bottom || 80;
  const bot = VH - ($('bottom').getBoundingClientRect().top || VH - 104);
  const avail = VH - top - bot;
  B.w = Math.round(VW * .89); B.x = Math.round(VW * .065);
  B.h = Math.round(Math.min(avail - 14, B.w * 1.85)); B.y = Math.round(top + (avail - B.h) / 2);
  for (const t of [texA, texB, texBack, texEnd]) { t.width = Math.round(B.w * DPR); t.height = Math.round(B.h * DPR); }
  layoutCache = {}; staticTex();
}
function staticTex() {
  if (!noisePat) return;
  let c = texBack.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0); drawPaperBack(c, B.w, B.h);
  c = texEnd.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0); drawEndpaper(c, B.w, B.h);
}

/* ---------------- page drawing ---------------- */
function pageLayout(c, idx, w, h) {
  const key = idx + ':' + w + 'x' + h; if (layoutCache[key]) return layoutCache[key];
  const m = 10, inner = w - 2 * m - 34; const L = { m };
  const ts = w > 370 ? 36 : 34; c.font = F.title(ts); L.ts = ts;
  L.title = wrap(c, CH[idx].t, inner); L.titleY = m + 70; L.titleLH = ts * 1.16;
  L.titleBottom = L.titleY + (L.title.length - 1) * L.titleLH + 16;
  const bs = w > 370 ? 22 : 20; L.bs = bs; c.font = F.body(bs);
  L.body = CH[idx].b ? wrap(c, CH[idx].b, w - 2 * m - 60) : [];
  L.bodyLH = bs * 1.42; L.panelH = L.body.length ? L.body.length * L.bodyLH + 30 : 0;
  L.panelY = h - m - 14 - L.panelH;
  L.r0 = L.titleBottom + 6; L.r1 = L.body.length ? L.panelY - 8 : h - m - 10;
  if (L.r1 - L.r0 < h * .3) L.r1 = Math.min(h - m - 10, L.r0 + h * .3);
  layoutCache[key] = L; return L;
}
function paper(c, w, h, tint) {
  c.fillStyle = tint || '#f8eedb'; c.fillRect(0, 0, w, h);
  c.fillStyle = noisePat; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, 26, 0); g.addColorStop(0, 'rgba(90,50,20,.35)'); g.addColorStop(1, 'rgba(90,50,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 26, h);
  const g2 = c.createLinearGradient(w - 8, 0, w, 0); g2.addColorStop(0, 'rgba(90,50,20,0)'); g2.addColorStop(1, 'rgba(90,50,20,.18)'); c.fillStyle = g2; c.fillRect(w - 8, 0, 8, h);
}
function drawPage(c, idx, t, w, h, variant) {
  c.save();
  if (idx === 0) { drawCover(c, t, w, h, variant); c.restore(); return; }
  paper(c, w, h, idx === 7 ? '#fbf3e2' : null);
  const L = pageLayout(c, idx, w, h), m = L.m;
  if (idx !== 7) {
    c.save(); rr(c, m, m, w - 2 * m, h - 2 * m, 16); c.clip();
    SCENES[idx](c, t, w, h, L);
    const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,5,20,.45)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
    const tg = c.createLinearGradient(0, m, 0, L.titleBottom + 30); tg.addColorStop(0, 'rgba(10,3,25,.62)'); tg.addColorStop(1, 'rgba(10,3,25,0)');
    c.fillStyle = tg; c.fillRect(0, 0, w, L.titleBottom + 30);
    c.restore();
    c.strokeStyle = 'rgba(160,110,40,.55)'; c.lineWidth = 2; rr(c, m, m, w - 2 * m, h - 2 * m, 16); c.stroke();
    const ka = eOut((t - .15) / .5);
    c.globalAlpha = ka; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.font = F.bold(20); c.fillStyle = '#ffd77a'; try { c.letterSpacing = '4px'; } catch (e) {}
    c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6; c.fillText('CHAPTER ' + idx, w / 2 + 2, m + 34);
    try { c.letterSpacing = '0px'; } catch (e) {}
    c.font = F.title(L.ts); c.fillStyle = '#fff6e4'; c.shadowColor = 'rgba(255,170,90,.75)'; c.shadowBlur = 14;
    L.title.forEach((ln, i) => c.fillText(ln, w / 2, L.titleY + i * L.titleLH + (1 - ka) * 10));
    c.shadowBlur = 0; c.globalAlpha = 1;
    if (L.body.length) {
      const pa = eOut((t - .85) / .35);
      c.globalAlpha = pa; const px = m + 14, pw = w - 2 * m - 28;
      c.fillStyle = 'rgba(255,249,236,.95)'; rr(c, px, L.panelY + (1 - pa) * 14, pw, L.panelH, 18); c.fill();
      c.strokeStyle = 'rgba(214,160,60,.9)'; c.lineWidth = 2.5; c.stroke();
      c.font = F.body(L.bs); c.fillStyle = '#4a2416'; c.textAlign = 'left';
      const total = L.body.reduce((s, l) => s + [...l].length + 1, 0); const shown = Math.floor(clamp((t - 1.05) * 46, 0, total));
      let k = 0; const tx = px + 16;
      L.body.forEach((ln, i) => {
        const chars = [...ln]; const n = clamp(shown - k, 0, chars.length); k += chars.length + 1;
        const y = L.panelY + 15 + L.bs + i * L.bodyLH - 2 + (1 - pa) * 14;
        const part = chars.slice(0, n).join('');
        c.fillText(part, tx, y);
        if (n > 0 && n < chars.length) { const xw = c.measureText(part).width; c.fillStyle = '#d9822b'; c.fillRect(tx + xw + 2, y - L.bs + 3, 3, L.bs); c.fillStyle = '#4a2416'; }
      });
      c.globalAlpha = 1;
    }
  } else drawLastPage(c, t, w, h, L);
  c.restore();
}

function person(c, x, base, h, girl, walk, face, col) {
  const r = h * .105, hy = base - h + r; c.save(); c.translate(x, 0); c.scale(face || 1, 1);
  c.fillStyle = col || '#1b0a2a'; c.strokeStyle = col || '#1b0a2a'; c.lineCap = 'round';
  const sw = Math.sin(walk) * .38;
  c.lineWidth = h * .075;
  const hip = base - h * .44;
  [sw, -sw].forEach(a => { c.beginPath(); c.moveTo(0, hip); c.lineTo(Math.sin(a) * h * .44, base); c.stroke(); });
  if (girl) { c.beginPath(); c.moveTo(-h * .07, hy + r * 1.6); c.lineTo(h * .07, hy + r * 1.6); c.lineTo(h * .19, base - h * .26); c.lineTo(-h * .19, base - h * .26); c.closePath(); c.fill(); }
  else { rr(c, -h * .095, hy + r * 1.5, h * .19, hip - hy - r * 1.3, h * .06); c.fill(); }
  c.lineWidth = h * .06; [-sw * .8, sw * .8].forEach((a, i) => { c.beginPath(); c.moveTo(0, hy + r * 2); c.lineTo(Math.sin(a) * h * .3 + (i ? 1 : -1) * h * .03, hy + r * 2 + h * .3); c.stroke(); });
  c.beginPath(); c.arc(0, hy, r, 0, TAU); c.fill();
  if (girl) { c.beginPath(); c.ellipse(-r * .35, hy + r * .9, r * .95, r * 1.5, .15, 0, TAU); c.fill(); }
  c.restore();
}
function sparkleStar(c, x, y, r, a) { c.save(); c.translate(x, y); c.rotate(a || 0); c.beginPath(); for (let i = 0; i < 8; i++) { const rad = i % 2 ? r * .28 : r; const an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); } c.closePath(); c.fill(); c.restore(); }
function stars(c, w, h, t, n, ymax, seed) { const R = rng(seed || 9); for (let i = 0; i < n; i++) { const x = R() * w, y = R() * ymax, r = .6 + R() * 1.5, p = R() * TAU, sp = 1 + R() * 2; c.globalAlpha = .35 + .65 * Math.abs(Math.sin(t * sp + p)); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } c.globalAlpha = 1; }
function floatHearts(c, cx, cy, t, n, spread, size, seed, col) {
  const R = rng(seed); for (let i = 0; i < n; i++) { const ph = R(), sp = .5 + R() * .6, ox = R() - .5, ss = .7 + R() * .6; const k = ((t * sp * .35 + ph) % 1 + 1) % 1; const x = cx + ox * spread + Math.sin(t * 2 + i) * 8; const y = cy - k * spread * 1.1;
    c.globalAlpha = Math.sin(k * Math.PI) * .9 * clamp(t * 2); c.fillStyle = col || (i % 2 ? '#ff4f8b' : '#ff9cc0'); heart(c, x, y, size * ss); c.fill(); } c.globalAlpha = 1;
}

/* ---------------- chapter scenes ---------------- */
const SCENES = [null,
// 1 — the day I first saw you
(c, t, w, h, L) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1d0b45'); g.addColorStop(.5, '#6b2a7a'); g.addColorStop(.78, '#ff8b7b'); g.addColorStop(1, '#ffc29a');
  c.fillStyle = g; c.fillRect(0, 0, w, h); stars(c, w, h, t, 40, h * .45, 21);
  const gy = L.r1 - 4, rh = L.r1 - L.r0;
  const sun = c.createRadialGradient(w * .5, gy, 4, w * .5, gy, w * .6); sun.addColorStop(0, 'rgba(255,220,150,.85)'); sun.addColorStop(1, 'rgba(255,150,120,0)'); c.fillStyle = sun; c.fillRect(0, 0, w, h);
  const R = rng(4);
  for (let x = -5; x < w;) { const bw = 18 + R() * 30, bh = rh * (.18 + R() * .35); c.fillStyle = '#3b1450'; c.fillRect(x, gy - bh, bw, bh + 2);
    for (let wy = gy - bh + 8; wy < gy - 8; wy += 11) for (let wx = x + 5; wx < x + bw - 5; wx += 9) { if (R() > .55) { c.fillStyle = `rgba(255,214,120,${.5 + .5 * Math.sin(t * 2 + wx + wy)})`; c.fillRect(wx, wy, 4, 5); } }
    x += bw + 3; }
  c.fillStyle = '#250b33'; c.fillRect(0, gy, w, h - gy);
  const lx = w * .12; c.strokeStyle = '#1b0a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(lx, gy); c.lineTo(lx, gy - rh * .62); c.quadraticCurveTo(lx, gy - rh * .7, lx + 14, gy - rh * .7); c.stroke();
  const lg = c.createRadialGradient(lx + 14, gy - rh * .67, 2, lx + 14, gy - rh * .67, rh * .5); lg.addColorStop(0, 'rgba(255,230,160,.95)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = lg; c.beginPath(); c.arc(lx + 14, gy - rh * .67, rh * .5, 0, TAU); c.fill();
  const ph = Math.min(rh * .62, 140), k = eOut(t / 1.8);
  const bx = lerp(-w * .15, w * .37, k), gx = lerp(w * 1.15, w * .63, k), walking = k < .995;
  const glow = c.createRadialGradient(w / 2, gy - ph * .5, 4, w / 2, gy - ph * .5, ph); glow.addColorStop(0, 'rgba(255,190,220,.35)'); glow.addColorStop(1, 'rgba(255,190,220,0)'); c.fillStyle = glow; c.fillRect(0, 0, w, h);
  c.shadowColor = 'rgba(255,170,200,.9)'; c.shadowBlur = 10;
  person(c, bx, gy, ph, false, walking ? t * 9 : 0, 1); person(c, gx, gy, ph * .93, true, walking ? t * 9 + 1 : 0, -1); c.shadowBlur = 0;
  const st = t - 1.85;
  if (st > 0) {
    const sx = w / 2, sy = gy - ph * .82, pulse = 1 + .15 * Math.sin(st * 8);
    const rg = c.createRadialGradient(sx, sy, 0, sx, sy, 60 * pulse); rg.addColorStop(0, 'rgba(255,255,230,1)'); rg.addColorStop(.25, 'rgba(255,215,120,.8)'); rg.addColorStop(1, 'rgba(255,140,180,0)');
    c.fillStyle = rg; c.globalAlpha = clamp(st * 4); c.beginPath(); c.arc(sx, sy, 60 * pulse, 0, TAU); c.fill();
    c.fillStyle = '#fffbe0'; sparkleStar(c, sx, sy, 26 * eBack(st * 3) * pulse, st * 1.5);
    const R2 = rng(8); for (let i = 0; i < 26; i++) { const a = R2() * TAU, sp = 40 + R2() * 90, sz = 5 + R2() * 4, kk = clamp(st / 1.2), d = sp * eOut(kk); c.globalAlpha = (1 - kk) * .95; c.fillStyle = i % 2 ? '#ffe28a' : '#ffb3d1'; sparkleStar(c, sx + Math.cos(a) * d, sy + Math.sin(a) * d, sz, st * 3); }
    c.globalAlpha = 1; if (st > .4) floatHearts(c, sx, sy - 10, st - .4, 7, Math.min(120, rh * .6), 18, 31);
  }
},
// 2 — our first talk
(c, t, w, h, L) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2a0f4f'); g.addColorStop(.55, '#7a2f8f'); g.addColorStop(1, '#ff7eb3'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const R = rng(12); for (let i = 0; i < 14; i++) { const x = R() * w, y = R() * h, r = 10 + R() * 30; c.globalAlpha = .08 + .08 * Math.sin(t + i); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + Math.sin(t * .5 + i) * 8, y, r, 0, TAU); c.fill(); } c.globalAlpha = 1;
  const MSG = [['L', 'hey 👋'], ['R', 'hi! 🙂'], ['L', 'you have a cute smile'], ['R', 'stoppp 🙈'], ['L', 'coffee tomorrow? ☕'], ['R', "it's a date ❤️"]];
  const fs = 20, pad = 15, bh = fs + 26, gap = 10, x0 = 26, x1 = w - 26;
  c.font = F.body(fs);
  const at = i => .25 + i * .5; let n = 0; for (let i = 0; i < MSG.length; i++) if (t >= at(i)) n = i + 1;
  const typing = n < MSG.length && t > at(n) - .3 ? MSG[n][0] : null;
  const total = n * (bh + gap) + (typing ? bh + gap : 0), avail = L.r1 - L.r0 - 8;
  const scroll = Math.max(0, total - avail);
  c.save(); c.beginPath(); c.rect(0, L.r0 - 4, w, L.r1 - L.r0 + 8); c.clip();
  let y = L.r0 + 4 - scroll;
  const draw = (side, txt, k, isTyping) => {
    const tw = isTyping ? 64 : Math.min(c.measureText(txt).width, x1 - x0 - 60) + pad * 2;
    const bx = side === 'L' ? x0 : x1 - tw; const s = eBack(k); const ax = side === 'L' ? bx : bx + tw;
    c.save(); c.translate(ax, y + bh); c.scale(s, s); c.translate(-ax, -(y + bh));
    c.shadowColor = 'rgba(0,0,0,.28)'; c.shadowBlur = 10; c.shadowOffsetY = 3;
    if (side === 'L') c.fillStyle = '#ffffff'; else { const bg = c.createLinearGradient(bx, 0, bx + tw, 0); bg.addColorStop(0, '#ff4f8b'); bg.addColorStop(1, '#ff8a5c'); c.fillStyle = bg; }
    rr(c, bx, y, tw, bh, bh / 2); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
    if (isTyping) { for (let d = 0; d < 3; d++) { c.fillStyle = side === 'L' ? '#9a8aa8' : '#fff'; c.beginPath(); c.arc(bx + 20 + d * 12, y + bh / 2 + Math.sin(t * 12 - d) * 3, 4.5, 0, TAU); c.fill(); } }
    else { c.fillStyle = side === 'L' ? '#2c1838' : '#fff'; c.textAlign = 'left'; c.fillText(txt, bx + pad, y + bh / 2 + fs * .36); }
    c.restore(); y += bh + gap;
  };
  for (let i = 0; i < n; i++) draw(MSG[i][0], MSG[i][1], (t - at(i)) / .3, false);
  if (typing) draw(typing, '', (t - at(n) + .3) / .2, true);
  c.restore();
  if (n === MSG.length) floatHearts(c, w * .72, L.r1, t - at(5), 6, Math.min(110, (L.r1 - L.r0) * .7), 18, 41);
},
// 3 — late night calls
(c, t, w, h, L) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#030722'); g.addColorStop(.6, '#101b55'); g.addColorStop(1, '#2a1a5c'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  stars(c, w, h, t, 70, h, 33);
  const ss = (t * .5) % 1.6; if (ss < .5) { const k = ss / .5; c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.lineWidth = 2.5; c.beginPath(); const sx = w * (.15 + k * .5), sy = L.r0 + 10 + k * 40; c.moveTo(sx, sy); c.lineTo(sx - 46, sy - 18); c.stroke(); }
  const rh = L.r1 - L.r0, mr = Math.min(w * .15, rh * .17), mx = w * .78, my = L.r0 + mr + 6;
  const mg = c.createRadialGradient(mx, my, mr * .6, mx, my, mr * 3); mg.addColorStop(0, 'rgba(255,245,200,.55)'); mg.addColorStop(1, 'rgba(255,245,200,0)'); c.fillStyle = mg; c.beginPath(); c.arc(mx, my, mr * 3, 0, TAU); c.fill();
  c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fill();
  c.fillStyle = 'rgba(200,185,140,.5)'; [[-.3, -.2, .22], [.25, .15, .16], [-.05, .4, .12]].forEach(([a, b, r]) => { c.beginPath(); c.arc(mx + a * mr, my + b * mr, r * mr, 0, TAU); c.fill(); });
  const pH = Math.min(rh * .74, 270), pW = pH * .56, px = w * .4, py = L.r1 - pH / 2 - 8; const tilt = -.08 + Math.sin(t * 1.3) * .03;
  for (let i = 0; i < 3; i++) { const k = ((t * .7 + i / 3) % 1); c.strokeStyle = `rgba(255,170,220,${(1 - k) * .8})`; c.lineWidth = 3; c.beginPath(); c.arc(px, py, pW * .6 + k * pW * .9, -.8, .8); c.stroke(); c.beginPath(); c.arc(px, py, pW * .6 + k * pW * .9, Math.PI - .8, Math.PI + .8); c.stroke(); }
  c.save(); c.translate(px, py); c.rotate(tilt);
  c.shadowColor = 'rgba(160,200,255,.9)'; c.shadowBlur = 30; c.fillStyle = '#111'; rr(c, -pW / 2, -pH / 2, pW, pH, pW * .16); c.fill(); c.shadowBlur = 0;
  const sg = c.createLinearGradient(0, -pH / 2, 0, pH / 2); sg.addColorStop(0, '#3b2a8a'); sg.addColorStop(1, '#ff6fa5'); c.fillStyle = sg; rr(c, -pW / 2 + 6, -pH / 2 + 6, pW - 12, pH - 12, pW * .12); c.fill();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `${Math.round(pW * .3)}px sans-serif`; c.fillText('❤️', 0, -pH * .17);
  c.font = F.bold(Math.max(18, Math.round(pW * .14))); c.fillText('on call', 0, pH * .06);
  const secs = 10792 + Math.floor(t); const hh = String(Math.floor(secs / 3600)).padStart(2, '0'), mm = String(Math.floor(secs / 60) % 60).padStart(2, '0'), s2 = String(secs % 60).padStart(2, '0');
  c.font = F.bold(Math.max(20, Math.round(pW * .16))); c.fillStyle = '#ffe28a'; c.fillText(`${hh}:${mm}:${s2}`, 0, pH * .26);
  c.restore();
  c.font = F.hand(30); c.fillStyle = 'rgba(255,240,200,.95)'; c.textAlign = 'center'; c.fillText('3:00 AM 🌙', w * .76, my + mr + 36);
},
// 4 — first fight and the hug after
(c, t, w, h, L) => {
  const k = eInOut((t - 1.6) / 1.1);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, mix('#1c2333', '#6fb7ff', k)); g.addColorStop(.6, mix('#3a4456', '#ffc6dd', k)); g.addColorStop(1, mix('#28303c', '#ffe3b5', k)); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const gy = L.r1 - 4, rh = L.r1 - L.r0;
  const lf = t - .75; if (lf > 0 && lf < .35) { c.fillStyle = `rgba(255,255,255,${(1 - lf / .35) * .55})`; c.fillRect(0, 0, w, h); c.strokeStyle = '#fffbe0'; c.lineWidth = 3; c.beginPath(); let x = w * .7, y = L.r0; c.moveTo(x, y); for (let i = 0; i < 5; i++) { x += (i % 2 ? 14 : -18); y += rh * .1; c.lineTo(x, y); } c.stroke(); }
  const rp = eOut((t - 2.0) / 1.2); if (rp > 0) { const cols = ['#ff4d4d', '#ff9a3d', '#ffe14d', '#5fd35f', '#4db8ff', '#6b6bff', '#b36bff'], R0 = Math.min(w * .44, rh * .95);
    cols.forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = .85; c.lineWidth = 7; c.beginPath(); c.arc(w / 2, gy + 10, R0 - i * 7, Math.PI, Math.PI + Math.PI * rp); c.stroke(); }); c.globalAlpha = 1; }
  if (k > 0) { c.globalAlpha = k; const sg = c.createRadialGradient(w * .2, L.r0 + 30, 4, w * .2, L.r0 + 30, 80); sg.addColorStop(0, 'rgba(255,240,170,1)'); sg.addColorStop(.3, 'rgba(255,220,120,.7)'); sg.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = sg; c.beginPath(); c.arc(w * .2, L.r0 + 30, 80, 0, TAU); c.fill(); c.globalAlpha = 1; }
  const R = rng(14); for (let i = 0; i < 6; i++) { const cx0 = R() * w, cy = L.r0 - 30 + R() * rh * .3, s = 30 + R() * 30, dir = cx0 < w / 2 ? -1 : 1; const cx = cx0 + dir * k * w * .55 + Math.sin(t * .6 + i) * 6;
    c.fillStyle = mix('#4b5466', '#ffffff', k); c.globalAlpha = .95 - k * .25; [[0, 0, 1], [-.7, .2, .7], [.7, .2, .75], [.3, -.35, .7]].forEach(([a, b, r]) => { c.beginPath(); c.arc(cx + a * s, cy + b * s, r * s, 0, TAU); c.fill(); }); }
  c.globalAlpha = 1;
  if (k < 1) { c.strokeStyle = `rgba(190,215,255,${.7 * (1 - k)})`; c.lineWidth = 2; const R3 = rng(15); c.beginPath(); for (let i = 0; i < 70; i++) { const x = R3() * w, sp = 380 + R3() * 200, y0 = R3() * h, y = (y0 + t * sp) % h; c.moveTo(x, y); c.lineTo(x - 5, y + 16); } c.stroke(); }
  c.fillStyle = mix('#1e2530', '#6fbf73', k); c.beginPath(); c.moveTo(0, gy); c.quadraticCurveTo(w / 2, gy - 18, w, gy); c.lineTo(w, h); c.lineTo(0, h); c.fill();
  const ph = Math.min(rh * .6, 130), hk = eInOut((t - 1.9) / .9);
  const bx = lerp(w * .27, w * .45, hk), gx = lerp(w * .73, w * .555, hk);
  c.shadowColor = k > .5 ? 'rgba(255,190,220,.9)' : 'rgba(0,0,0,0)'; c.shadowBlur = 10;
  person(c, bx, gy - 6, ph, false, 0, hk < .5 ? -1 : 1, '#1b0a2a'); person(c, gx, gy - 6, ph * .93, true, 0, hk < .5 ? 1 : -1, '#1b0a2a'); c.shadowBlur = 0;
  if (hk > .9) { c.strokeStyle = '#1b0a2a'; c.lineWidth = ph * .06; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, gy - 6 - ph * .68); c.quadraticCurveTo(w * .5, gy - ph * .52, gx + ph * .05, gy - 6 - ph * .64); c.stroke(); }
  const hy = gy - ph * 1.3;
  if (hk < .2) { const sep = 7 + Math.sin(t * 10) * 1.5; c.fillStyle = '#ff4f6d'; c.save(); c.beginPath(); c.rect(0, 0, w / 2 - 1, h); c.clip(); heart(c, w / 2 - sep, hy, 44); c.fill(); c.restore(); c.save(); c.beginPath(); c.rect(w / 2 + 1, 0, w, h); c.clip(); heart(c, w / 2 + sep, hy, 44); c.fill(); c.restore(); }
  else if (hk >= 1) { const s = 48 * eBack((t - 2.8) / .4) * (1 + .08 * Math.sin(t * 6)); c.fillStyle = '#ff3d7f'; c.shadowColor = '#ff8fb8'; c.shadowBlur = 18; heart(c, w / 2, hy, s); c.fill(); c.shadowBlur = 0; floatHearts(c, w / 2, hy, t - 2.8, 6, Math.min(100, rh * .5), 16, 51); }
},
// 5 — little things you do
(c, t, w, h, L) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffd6e5'); g.addColorStop(1, '#ffeccf'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(255,120,160,.18)'; for (let y = 8; y < h; y += 22) for (let x = 8 + (y / 22 % 2) * 11; x < w; x += 22) { c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(60,14,50,.6)'; c.fillRect(0, 0, w, L.titleBottom + 6);
  const CAP = ['your laugh 😂', 'stealing my hoodie', 'good morning texts', 'chai dates ☕'];
  const rh = L.r1 - L.r0, cw = Math.min(w * .43, (rh - 16) / 1.2), chh = cw * 1.2, SW = 1.95;
  const slot = [[.28, .5, -.1], [.72, .5, .09]];
  [0, 1, 2, 3].forEach(i => {
    const pair = i < 2 ? 0 : 1, sIdx = i % 2, tin = pair ? SW + .15 + sIdx * .32 : .2 + sIdx * .38;
    const k = (t - tin) / .55; if (k <= 0) return; const e = eBack(k);
    const out = pair === 0 ? eInOut((t - SW - sIdx * .08) / .45) : 0; if (out >= 1) return;
    const [px, py, rot] = slot[sIdx];
    const cx = w * px + out * (sIdx ? 1 : -1) * w * .8, cy = L.r0 + rh * py + (1 - eOut(k)) * h * .6 - out * 60 + Math.sin(t * 1.8 + i) * 3, a = rot * e + (1 - eOut(k)) * 1.2 + out * (sIdx ? .8 : -.8) + Math.sin(t * 1.4 + i) * .02;
    c.save(); c.translate(cx, cy); c.rotate(a);
    c.shadowColor = 'rgba(80,20,40,.35)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = '#fffdf8'; c.fillRect(-cw / 2, -chh / 2, cw, chh); c.shadowBlur = 0; c.shadowOffsetY = 0;
    const ix = -cw / 2 + cw * .07, iy = -chh / 2 + cw * .07, iw = cw * .86, ih = cw * .8;
    const pg = c.createLinearGradient(0, iy, 0, iy + ih); const pal = [['#ffb86b', '#ff6f91'], ['#7f7fd5', '#91eae4'], ['#ffd86b', '#ff9a6b'], ['#c58bff', '#ff8fb8']][i];
    pg.addColorStop(0, pal[0]); pg.addColorStop(1, pal[1]); c.fillStyle = pg; c.fillRect(ix, iy, iw, ih);
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round'; const dx = ix + iw / 2, dy = iy + ih / 2, u = iw * .3;
    c.beginPath();
    if (i === 0) { c.arc(dx, dy, u, 0, TAU); c.moveTo(dx - u * .2, dy - u * .25); c.arc(dx - u * .35, dy - u * .25, u * .15, 0, Math.PI, true); c.moveTo(dx + u * .5, dy - u * .25); c.arc(dx + u * .35, dy - u * .25, u * .15, 0, Math.PI, true); c.moveTo(dx - u * .5, dy + u * .15); c.quadraticCurveTo(dx, dy + u * .85, dx + u * .5, dy + u * .15); c.closePath(); }
    else if (i === 1) { c.moveTo(dx - u * .5, dy - u * .6); c.lineTo(dx - u, dy - u * .2); c.lineTo(dx - u * .75, dy + u * .1); c.lineTo(dx - u * .55, dy); c.lineTo(dx - u * .55, dy + u * .85); c.lineTo(dx + u * .55, dy + u * .85); c.lineTo(dx + u * .55, dy); c.lineTo(dx + u * .75, dy + u * .1); c.lineTo(dx + u, dy - u * .2); c.lineTo(dx + u * .5, dy - u * .6); c.quadraticCurveTo(dx, dy - u * .1, dx - u * .5, dy - u * .6); c.moveTo(dx - u * .25, dy + u * .4); c.lineTo(dx + u * .25, dy + u * .4); }
    else if (i === 2) { c.moveTo(dx + u * .45, dy); c.arc(dx, dy, u * .45, 0, TAU); for (let r = 0; r < 8; r++) { const an = r * Math.PI / 4 + t; c.moveTo(dx + Math.cos(an) * u * .65, dy + Math.sin(an) * u * .65); c.lineTo(dx + Math.cos(an) * u * .95, dy + Math.sin(an) * u * .95); } }
    else { c.moveTo(dx - u * .6, dy - u * .2); c.lineTo(dx - u * .45, dy + u * .7); c.lineTo(dx + u * .45, dy + u * .7); c.lineTo(dx + u * .6, dy - u * .2); c.closePath(); c.moveTo(dx + u * .58, dy); c.arc(dx + u * .75, dy + u * .2, u * .2, -1.4, 1.4); for (let s = -1; s <= 1; s++) { c.moveTo(dx + s * u * .25, dy - u * .4); c.quadraticCurveTo(dx + s * u * .25 + Math.sin(t * 3 + s) * 6, dy - u * .7, dx + s * u * .25, dy - u); } }
    c.stroke();
    let fsz = Math.max(18, Math.round(cw * .17)); c.font = F.hand(fsz); while (c.measureText(CAP[i]).width > cw * .94 && fsz > 15) { fsz--; c.font = F.hand(fsz); }
    c.fillStyle = '#5a2040'; c.textAlign = 'center'; c.fillText(CAP[i], 0, iy + ih + (chh / 2 - iy - ih) / 2 + fsz * .35);
    c.fillStyle = ['rgba(255,140,180,.8)', 'rgba(140,200,255,.8)', 'rgba(255,214,110,.85)', 'rgba(190,150,255,.8)'][i]; c.fillRect(-cw * .2, -chh / 2 - 9, cw * .4, 18);
    c.restore();
  });
},
// 6 — every day with you
(c, t, w, h, L) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a1150'); g.addColorStop(.45, '#b04a7a'); g.addColorStop(1, '#ffc9a0'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  floatHearts(c, w / 2, L.r1 + 20, t + 3, 12, w * .9, 16, 61, 'rgba(255,220,235,.75)');
  const V = ['1', '2', '7', '14', '30', '100', '200', '365', '∞'], M = ['JAN', 'JAN', 'JAN', 'JAN', 'FEB', 'APR', 'JUL', 'DEC', 'ALWAYS'];
  const step = .3, t0 = .35, tc = i => t0 + i * step;
  const ci = clamp(Math.floor((t - t0) / step) + 1, 0, V.length - 1);
  const rh = L.r1 - L.r0, cw = Math.min(w * .64, rh * .8), chh = cw * 1.05, cx = w / 2, cy = L.r0 + rh / 2 + 8;
  const drawCal = (i, x, y, a, al) => {
    c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha = al;
    c.shadowColor = 'rgba(60,10,40,.35)'; c.shadowBlur = 16; c.shadowOffsetY = 6; c.fillStyle = '#fffaf2'; rr(c, -cw / 2, -chh / 2 + chh * .18, cw, chh * .82, 12); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
    const last = i === V.length - 1;
    c.fillStyle = last ? '#ff3d7f' : '#3a1d2e'; c.textAlign = 'center'; c.font = F.title(Math.round(cw * (V[i].length > 2 ? .36 : .46)));
    if (last) { c.shadowColor = '#ff8fb8'; c.shadowBlur = 20; }
    c.fillText(V[i], 0, chh * .2); c.shadowBlur = 0;
    c.font = F.bold(Math.max(20, Math.round(cw * .1))); c.fillStyle = last ? '#ff3d7f' : '#a0526e'; c.fillText(last ? 'FOREVER ❤️' : 'DAY', 0, chh * .42);
    c.restore(); c.globalAlpha = 1;
  };
  drawCal(ci, cx, cy, 0, 1);
  for (const j of [ci - 1, ci - 2]) { if (j < 0) continue; const k = (t - tc(j)) / .6; if (k >= 0 && k < 1) drawCal(j, cx + eOut(k) * w * .75, cy - Math.sin(k * Math.PI) * 70 - k * 30, k * 1.3, 1 - k * k); }
  c.save(); c.translate(cx, cy); c.fillStyle = '#d6335f'; c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 8; rr(c, -cw / 2, -chh / 2, cw, chh * .24, 12); c.fill(); c.shadowBlur = 0;
  c.fillStyle = '#fff'; c.font = F.bold(Math.max(20, Math.round(cw * .11))); c.textAlign = 'center'; c.fillText(M[ci], 0, -chh / 2 + chh * .16);
  c.fillStyle = '#3a1d2e'; for (let r = -2; r <= 2; r++) { rr(c, r * cw * .18 - 4, -chh / 2 - 10, 8, 22, 4); c.fill(); }
  c.restore();
  if (ci === V.length - 1) floatHearts(c, cx, cy - chh * .1, t - tc(V.length - 2), 8, cw, 18, 71);
}
];

/* ---------------- the last page: gold ink ---------------- */
const inkDur = () => Math.min(2.6, .9 + NAME.length * .14);
const INK0 = 1.1;
function drawLastPage(c, t, w, h, L) {
  const m = L.m;
  c.strokeStyle = '#c99a2e'; c.lineWidth = 2.5; rr(c, m + 8, m + 8, w - 2 * m - 16, h - 2 * m - 16, 14); c.stroke();
  c.lineWidth = 1.2; rr(c, m + 15, m + 15, w - 2 * m - 30, h - 2 * m - 30, 10); c.stroke();
  [[m + 15, m + 15, 0], [w - m - 15, m + 15, Math.PI / 2], [w - m - 15, h - m - 15, Math.PI], [m + 15, h - m - 15, -Math.PI / 2]].forEach(([x, y, a]) => { c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = '#c99a2e'; c.lineWidth = 2; c.beginPath(); c.arc(22, 22, 14, Math.PI, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(10, 10, 6, 0, TAU); c.stroke(); c.restore(); });
  const ka = eOut((t - .15) / .5); c.globalAlpha = ka; c.textAlign = 'center';
  c.font = F.bold(20); c.fillStyle = '#b07d1e'; try { c.letterSpacing = '4px'; } catch (e) {} c.fillText('CHAPTER 7', w / 2 + 2, m + 56); try { c.letterSpacing = '0px'; } catch (e) {}
  c.font = F.ital(L.ts); c.fillStyle = '#5a2d16'; c.fillText('The last page', w / 2, m + 56 + L.ts + 8); c.globalAlpha = 1;
  const R = rng(77); for (let i = 0; i < 26; i++) { const x = R() * w, y0 = R() * h, sp = 8 + R() * 14, sz = 2 + R() * 3, y = ((y0 - t * sp) % h + h) % h; c.globalAlpha = .25 + .45 * Math.abs(Math.sin(t * 2 + i)); c.fillStyle = '#e6b94a'; sparkleStar(c, x, y, sz, t + i); } c.globalAlpha = 1;
  const nm = NAME, dur = inkDur(), k = clamp((t - INK0) / dur);
  let fs = Math.min(w * .27, 104); c.font = F.script(fs); while (c.measureText(nm).width > w - 2 * m - 56 && fs > 34) { fs -= 2; c.font = F.script(fs); }
  const tw = c.measureText(nm).width, ny = h * .45, nx0 = w / 2 - tw / 2 - fs * .15, span = tw + fs * .4;
  if (k > 0) {
    c.save(); c.beginPath(); c.rect(nx0 - 10, ny - fs * 1.2, span * eInOut(k) + 10, fs * 1.8); c.clip();
    const sh = (t * 80) % (tw + 200) - 100;
    const gg = c.createLinearGradient(nx0 + sh - 80, 0, nx0 + sh + 80, 0); gg.addColorStop(0, '#c08a17'); gg.addColorStop(.5, '#fff4c2'); gg.addColorStop(1, '#c08a17');
    c.textAlign = 'center'; c.shadowColor = 'rgba(230,170,40,.75)'; c.shadowBlur = 18; c.fillStyle = '#d9a425'; c.fillText(nm, w / 2, ny); c.shadowBlur = 0;
    c.globalAlpha = .75; c.fillStyle = gg; c.fillText(nm, w / 2, ny); c.globalAlpha = 1;
    c.restore();
    if (k < 1) {
      const ex = nx0 + span * eInOut(k), ey = ny - fs * .25 + Math.sin(t * 22) * fs * .14;
      const ng = c.createRadialGradient(ex, ey, 0, ex, ey, 30); ng.addColorStop(0, 'rgba(255,250,210,1)'); ng.addColorStop(.3, 'rgba(255,210,90,.8)'); ng.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = ng; c.beginPath(); c.arc(ex, ey, 30, 0, TAU); c.fill();
      const R2 = rng(Math.floor(t * 30)); for (let i = 0; i < 7; i++) { const a = R2(), b = R2(), s = R2(), r = R2(); c.fillStyle = '#ffd659'; sparkleStar(c, ex - a * 34, ey + b * 44 - 10, 2 + s * 4, r * 3); }
      c.save(); c.translate(ex, ey); c.rotate(-.6); const qg = c.createLinearGradient(0, 0, 0, -100); qg.addColorStop(0, '#fff8e6'); qg.addColorStop(1, 'rgba(255,240,220,.7)'); c.fillStyle = qg; c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(24, -44, 8, -104); c.quadraticCurveTo(-16, -54, 0, 0); c.fill(); c.shadowBlur = 0; c.strokeStyle = '#c9a24a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(6, -98); c.stroke(); c.restore();
    }
  }
  const t1 = INK0 + dur, bt = t - t1;
  if (bt > 0 && bt < 1.4) { const R3 = rng(91); for (let i = 0; i < 24; i++) { const a = R3() * TAU, dd = 40 + R3() * 120, sz = 12 + R3() * 12, d = dd * eOut(bt / 1.1); c.globalAlpha = clamp(1.3 - bt); c.fillStyle = ['#ff3d7f', '#ff8fb8', '#ffcf5a'][i % 3]; heart(c, w / 2 + Math.cos(a) * d * 1.3, ny - fs * .3 + Math.sin(a) * d, sz); c.fill(); } c.globalAlpha = 1; }
  const f2 = [...'…is my forever ❤️'], fsh = Math.floor(clamp((bt - .3) * 20, 0, f2.length));
  const fz = w > 370 ? 36 : 32;
  if (fsh > 0) { c.font = F.ital(fz); c.fillStyle = '#8a1e40'; c.textAlign = 'center'; c.fillText(f2.slice(0, fsh).join(''), w / 2, ny + fs * .55 + fz + 6); }
  const la = eOut((bt - 1.4) / .6);
  if (la > 0) { c.globalAlpha = la; c.font = F.body(L.bs); c.fillStyle = '#6b4a3a'; const ls = wrap(c, '“' + LINE + '”', w - 2 * m - 64); ls.forEach((ln, i) => c.fillText(ln, w / 2, ny + fs * .55 + fz + 56 + i * L.bs * 1.42)); c.globalAlpha = 1;
    c.fillStyle = '#ff3d7f'; heart(c, w / 2, h - m - 54, 30 * (1 + .1 * Math.sin(t * 5))); c.fill(); }
}

function drawCover(c, t, w, h, variant) {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#7c1224'); g.addColorStop(.5, '#5a0b1a'); g.addColorStop(1, '#3a0610'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = leatherPat; c.fillRect(0, 0, w, h);
  const sg = c.createLinearGradient(0, 0, 30, 0); sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(.6, 'rgba(255,255,255,.06)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sg; c.fillRect(0, 0, 30, h);
  const gold = c.createLinearGradient(0, 0, w, h); gold.addColorStop(0, '#c8951f'); gold.addColorStop(.45, '#ffe08a'); gold.addColorStop(.55, '#fff3c4'); gold.addColorStop(1, '#d4a12a');
  c.strokeStyle = gold; c.lineWidth = 3; rr(c, 22, 18, w - 40, h - 36, 12); c.stroke(); c.lineWidth = 1.5; rr(c, 30, 26, w - 56, h - 52, 8); c.stroke();
  [[30, 26, 0], [w - 26, 26, Math.PI / 2], [w - 26, h - 26, Math.PI], [30, h - 26, -Math.PI / 2]].forEach(([x, y, a]) => { c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = gold; c.lineWidth = 2.2; c.beginPath(); c.arc(24, 24, 16, Math.PI, Math.PI * 1.95); c.stroke(); c.beginPath(); c.arc(12, 12, 6, 0, TAU); c.stroke(); c.restore(); });
  const pulse = .5 + .5 * Math.sin(t * 2.2);
  c.textAlign = 'center'; c.fillStyle = gold; c.shadowColor = `rgba(255,200,90,${.5 + .4 * pulse})`; c.shadowBlur = 18;
  const ts = Math.min(58, w * .155); c.font = F.ital(ts);
  c.fillText('Our Love', w / 2, h * .17 + ts * .3); c.fillText('Story', w / 2, h * .17 + ts * 1.42);
  c.shadowBlur = 0;
  const hy = h * .53;
  if (!variant) {
    const hs = w * .32 * (1 + .04 * pulse); const hg = c.createRadialGradient(w / 2, hy, 4, w / 2, hy, hs * 1.4); hg.addColorStop(0, `rgba(255,200,120,${.35 + .25 * pulse})`); hg.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = hg; c.beginPath(); c.arc(w / 2, hy, hs * 1.4, 0, TAU); c.fill();
    c.strokeStyle = gold; c.lineWidth = 4; heart(c, w / 2, hy, hs); c.stroke(); c.lineWidth = 1.5; heart(c, w / 2, hy, hs * .8); c.stroke();
    c.font = `${Math.round(hs * .36)}px sans-serif`; c.fillText('📖', w / 2, hy + hs * .12);
    c.font = F.body(w > 370 ? 22 : 20); c.fillStyle = '#ffe3b0'; c.fillText('A story written only for', w / 2, h * .76);
    let fs = 54; c.font = F.script(fs); while (c.measureText(NAME).width > w - 80 && fs > 28) { fs -= 2; c.font = F.script(fs); }
    c.fillStyle = gold; c.shadowColor = 'rgba(255,200,90,.8)'; c.shadowBlur = 12; c.fillText(NAME, w / 2, h * .76 + fs + 4); c.shadowBlur = 0;
  } else {
    c.fillStyle = '#b3123a'; c.fillRect(0, hy - 20, w, 40); c.fillStyle = 'rgba(255,215,120,.75)'; c.fillRect(0, hy - 20, w, 3); c.fillRect(0, hy + 17, w, 3);
    let fs = 56; c.font = F.script(fs); while (c.measureText(NAME).width > w - 80 && fs > 28) { fs -= 2; c.font = F.script(fs); }
    c.fillStyle = gold; c.shadowColor = 'rgba(255,200,90,.8)'; c.shadowBlur = 12; c.fillText(NAME, w / 2, h * .78); c.shadowBlur = 0;
    c.font = F.ital(w > 370 ? 32 : 28); c.fillStyle = '#ffe3b0'; c.fillText('…is my forever ❤️', w / 2, h * .78 + 46);
    if (S.sealT >= 0) drawSeal(c, w / 2, hy, w * .34, NOW - S.sealT);
  }
}
function drawSeal(c, x, y, s, st) {
  if (st < 0) return; const k = clamp(st / .5); const sc = lerp(2.8, 1, eOut(k)) * (k >= 1 ? 1 + .04 * Math.sin(st * 4) : 1);
  c.save(); c.globalAlpha = clamp(st * 4); c.translate(x, y); c.scale(sc, sc);
  const glow = c.createRadialGradient(0, 0, s * .2, 0, 0, s * 1.2); glow.addColorStop(0, 'rgba(255,215,110,.6)'); glow.addColorStop(1, 'rgba(255,215,110,0)'); c.fillStyle = glow; c.beginPath(); c.arc(0, 0, s * 1.2, 0, TAU); c.fill();
  c.strokeStyle = '#e8b53a'; c.lineWidth = s * .09; c.beginPath(); c.arc(0, -s * .36, s * .22, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
  const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, '#fff1b0'); g.addColorStop(.35, '#f5c842'); g.addColorStop(.7, '#d4991f'); g.addColorStop(1, '#8a5a07');
  c.fillStyle = g; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 5; heart(c, 0, 0, s); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
  c.strokeStyle = '#8a5a07'; c.lineWidth = 2.5; heart(c, 0, 0, s); c.stroke(); c.strokeStyle = 'rgba(255,250,220,.7)'; c.lineWidth = 2; heart(c, 0, -2, s * .78); c.stroke();
  c.fillStyle = '#4a2a05'; c.beginPath(); c.arc(0, -s * .02, s * .07, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-s * .035, 0); c.lineTo(s * .035, 0); c.lineTo(s * .055, s * .17); c.lineTo(-s * .055, s * .17); c.closePath(); c.fill();
  c.restore();
  if (st > .5 && st < 1.3) { const r = (st - .5) / .8; c.strokeStyle = `rgba(255,225,140,${1 - r})`; c.lineWidth = 6 * (1 - r) + 1; c.beginPath(); c.arc(x, y, s * .5 + r * s * 1.6, 0, TAU); c.stroke(); }
}
function drawEndpaper(c, w, h) {
  c.fillStyle = '#5a0b1a'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,200,120,.18)';
  for (let y = 20; y < h; y += 46) for (let x = 20 + (Math.round(y / 46) % 2) * 23; x < w; x += 46) { heart(c, x, y, 16); c.fill(); }
}
function drawPaperBack(c, w, h) {
  paper(c, w, h, '#f1e5cc'); c.fillStyle = 'rgba(80,50,30,.07)'; for (let y = 90; y < h - 60; y += 30) c.fillRect(40, y, w - 80 - (y * 7 % 60), 7);
}

/* ---------------- 3D page flip with a real curl ---------------- */
function renderTex(tex, idx, t, variant) {
  const c = tex.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, B.w, B.h); drawPage(c, idx, t, B.w, B.h, variant);
}
function pageTime(idx) { return S.pageT0[idx] === undefined ? 0 : NOW - S.pageT0[idx]; }
function drawFlip(front, back, p) {
  // page curl: the page wraps around a moving cylinder (axis vertical), its back side shows as it folds over
  const W = B.w, H = B.h, x0 = B.x, cy = B.y + H / 2, D = W * 3.2, N = 90;
  const e = p, r = W * (.1 + .13 * Math.sin(e * Math.PI));
  const f = lerp(W + 2, -r - 40, e);
  const sa = Math.sin(Math.min(1, e * 1.3) * Math.PI / 2) * (1 - e * .6);
  // shadow on the page beneath, just right of the curl
  if (f + r < W) { const sx = x0 + Math.max(0, f + r); const g = ctx.createLinearGradient(sx, 0, sx + 60, 0); g.addColorStop(0, `rgba(30,10,0,${.45 * sa + .1})`); g.addColorStop(1, 'rgba(30,10,0,0)'); ctx.fillStyle = g; ctx.fillRect(sx, B.y, Math.min(60, x0 + W - sx), H); }
  // flat front part
  if (f > 0) { const fw = Math.min(f, W); ctx.drawImage(front, 0, 0, Math.ceil(fw * DPR), front.height, x0, B.y, fw, H); }
  const sw = W / N;
  let lastLeft = null;
  for (let i = 0; i < N; i++) {
    const u0 = i * sw, u1 = u0 + sw; if (u1 <= f) continue;
    const map = u => { const s = u - f; if (s <= 0) return { x: u, z: 0, a: 0 }; if (s < Math.PI * r) { const a = s / r; return { x: f + r * Math.sin(a), z: r * (1 - Math.cos(a)), a }; } return { x: f - (s - Math.PI * r), z: 2 * r, a: Math.PI }; };
    const A0 = map(Math.max(u0, f)), A1 = map(u1);
    const s0 = D / (D - A0.z), s1 = D / (D - A1.z), sc = (s0 + s1) / 2, hh = H * sc, yt = cy - hh / 2;
    const X0 = x0 + A0.x, X1 = x0 + A1.x; const am = (A0.a + A1.a) / 2;
    const su = Math.max(u0, f), sww = u1 - su;
    let l, wd;
    if (X1 - X0 > .02) { l = X0; wd = X1 - X0 + .8; ctx.drawImage(front, Math.floor(su * DPR), 0, Math.max(1, Math.ceil(sww * DPR)), front.height, l, yt, wd, hh); }
    else if (X0 - X1 > .02) { l = X1; wd = X0 - X1 + .8; ctx.drawImage(back, Math.max(0, Math.floor((W - u1) * DPR)), 0, Math.max(1, Math.ceil(sww * DPR)), back.height, l, yt, wd, hh); lastLeft = l; }
    else continue;
    // lighting on the curl
    const lit = am < Math.PI / 2 ? Math.cos(am) : -Math.cos(am);
    ctx.fillStyle = `rgba(25,10,0,${(1 - lit) * .55})`; ctx.fillRect(l, yt, wd, hh);
    const spec = Math.exp(-Math.pow((am - Math.PI * .72) / .25, 2)); if (spec > .02) { ctx.fillStyle = `rgba(255,252,240,${spec * .45})`; ctx.fillRect(l, yt, wd, hh); }
  }
  // soft shadow the folded-back flap casts on the page under it
  if (lastLeft !== null && lastLeft > x0 - 10) { const g = ctx.createLinearGradient(lastLeft, 0, lastLeft - 26, 0); g.addColorStop(0, 'rgba(30,10,0,.32)'); g.addColorStop(1, 'rgba(30,10,0,0)'); ctx.fillStyle = g; ctx.fillRect(Math.max(x0, lastLeft - 26), B.y, Math.min(26, lastLeft - x0), H); }
}

/* ---------------- background & book ---------------- */
function drawBackground(t) {
  const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#060318'); g.addColorStop(.5, '#170a38'); g.addColorStop(1, '#2a0f3c'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (const s of STARS) { ctx.globalAlpha = .25 + .75 * Math.abs(Math.sin(t * s.s * .7 + s.p)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x * VW, s.y * VH * .8, s.r, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  for (let sI = 0; sI < 2; sI++) {
    const y0 = 12 + sI * 24, sag = 30 + sI * 14, n = 12;
    ctx.strokeStyle = 'rgba(60,30,40,.9)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40; ctx.lineTo(-10 + u * (VW + 20), y0 + sag * 4 * u * (1 - u)); } ctx.stroke();
    for (let i = 0; i < n; i++) { const u = (i + .5 + sI * .5) / (n + .5); const x = -10 + u * (VW + 20), y = y0 + sag * 4 * u * (1 - u) + 6; const tw = .55 + .45 * Math.sin(t * 2.4 + i * 1.7 + sI); const col = BULBS[(i + sI * 2) % BULBS.length];
      const bg = ctx.createRadialGradient(x, y, 0, x, y, 18); bg.addColorStop(0, col); bg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.globalAlpha = tw; ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, 3.6, 4.8, 0, 0, TAU); ctx.fill(); }
  }
  const ty = B.y + B.h * .8; const tg = ctx.createLinearGradient(0, ty, 0, VH); tg.addColorStop(0, '#4a2414'); tg.addColorStop(1, '#170905'); ctx.fillStyle = tg; ctx.fillRect(0, ty + 20, VW, VH - ty);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(VW / 2 + i * VW * .09, ty + 20); ctx.lineTo(VW / 2 + i * VW * .3, VH); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,190,120,.25)'; ctx.fillRect(0, ty + 20, VW, 2);
  const pulse = .5 + .5 * Math.sin(t * 1.6);
  const bg = ctx.createRadialGradient(B.x + B.w / 2, B.y + B.h / 2, B.w * .2, B.x + B.w / 2, B.y + B.h / 2, B.h * .85);
  bg.addColorStop(0, `rgba(255,190,110,${.3 + .12 * pulse})`); bg.addColorStop(1, 'rgba(255,120,170,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, VW, VH);
}
function drawPetals(t, front) {
  for (const p of PETALS) { if (p.front !== front) continue; const x = (((p.x + p.vx * t + Math.sin(t * .8 + p.sw) * .03) % 1) + 1) % 1 * VW, y = ((p.y + p.vy * t) % 1) * (VH + 40) - 20; const s = front ? p.s * 1.2 : p.s;
    ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot + p.vr * t); ctx.scale(1, .55 + .45 * Math.sin(t * 2 + p.sw)); ctx.globalAlpha = front ? .8 : .9;
    ctx.fillStyle = p.hue > .5 ? '#ff4f7b' : '#ff8fab'; ctx.beginPath(); ctx.moveTo(0, -s); ctx.bezierCurveTo(s * .9, -s * .6, s * .7, s * .7, 0, s); ctx.bezierCurveTo(-s * .7, s * .7, -s * .9, -s * .6, 0, -s); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(-s * .2, -s * .2, s * .18, s * .45, .3, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.globalAlpha = 1;
}
function drawBookBody(closed) {
  const { x, y, w, h } = B;
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.filter = 'blur(14px)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 8, w * .56, 24, 0, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#4a0814'; rr(ctx, x - 10, y - 8, w + 22, h + 18, 10); ctx.fill();
  for (let i = 6; i >= 1; i--) { ctx.fillStyle = i % 2 ? '#efe2c6' : '#d9c9a6'; ctx.fillRect(x + i, y + i * .6, w, h); }
  const sg = ctx.createLinearGradient(x - 12, 0, x + 8, 0); sg.addColorStop(0, '#2a0409'); sg.addColorStop(1, closed ? '#4a0814' : '#6b0f20'); ctx.fillStyle = sg; rr(ctx, x - 12, y - 8, 20, h + 18, 8); ctx.fill();
}
function gutter() { const g = ctx.createLinearGradient(B.x, 0, B.x + 34, 0); g.addColorStop(0, 'rgba(40,15,0,.35)'); g.addColorStop(1, 'rgba(40,15,0,0)'); ctx.fillStyle = g; ctx.fillRect(B.x, B.y, 34, B.h); }
function flipP() { const f = S.flip; if (f.manual) return f.p; const k = clamp((NOW - f.t0) / f.dur); return lerp(f.p0, f.p1, eInOut(k)); }
function drawBook() {
  const sh = S.shakeT >= 0 ? clamp(1 - (NOW - S.shakeT) / .35) : 0; const ox = sh ? Math.sin(NOW * 90) * 6 * sh : 0, oy = sh ? Math.cos(NOW * 70) * 5 * sh : 0;
  ctx.save(); ctx.translate(ox, oy);
  const f = S.flip; drawBookBody(!f && S.cur === 0);
  if (f) {
    const p = flipP();
    renderTex(texA, f.bIdx, pageTime(f.bIdx), f.bIdx === 0 && S.final); ctx.drawImage(texA, B.x, B.y, B.w, B.h); gutter();
    renderTex(texB, f.tIdx, pageTime(f.tIdx), f.tIdx === 0 && S.final);
    ctx.save(); ctx.beginPath(); ctx.rect(B.x - 12, 0, VW, VH); ctx.clip(); drawFlip(texB, f.tIdx === 0 ? texEnd : texBack, p); ctx.restore();
  } else {
    renderTex(texA, S.cur, pageTime(S.cur), S.cur === 0 && S.final); ctx.drawImage(texA, B.x, B.y, B.w, B.h); if (S.cur) gutter();
  }
  ctx.restore();
}
function drawBursts() {
  for (const b of S.burstT) { const bt = NOW - b.t; if (bt < 0 || bt > 2.4) continue; const R = rng(b.seed);
    for (let i = 0; i < b.n; i++) { const a = R() * TAU, v = b.v * (.4 + R() * .8), s = (10 + R() * 18) * b.sz; const x = b.x + Math.cos(a) * v * bt, y = b.y + Math.sin(a) * v * bt + 300 * bt * bt;
      ctx.globalAlpha = clamp(1.6 - bt * .8); ctx.fillStyle = ['#ff3d7f', '#ff8fb8', '#ffd35a', '#ffffff', '#ff6f61'][i % 5]; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(bt * 4 + i) * .4); heart(ctx, 0, 0, s); ctx.fill(); ctx.restore(); } }
  ctx.globalAlpha = 1;
  if (S.confettiT >= 0) { const ct = NOW - S.confettiT; const R = rng(222);
    for (let i = 0; i < 90; i++) { const x0 = R() * VW, d = R() * 1.4, sp = 140 + R() * 170, s = 12 + R() * 18; const tt = ct - d; if (tt < 0) continue; const y = -30 + ((tt * sp) % (VH + 60)); const x = x0 + Math.sin(tt * 2 + i) * 24;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(tt * 3 + i) * .6); ctx.globalAlpha = .92; ctx.fillStyle = ['#ff3d7f', '#ff8fb8', '#ffd35a', '#fff', '#c58bff'][i % 5]; heart(ctx, 0, 0, s); ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = 1; }
}

/* ---------------- timers on the animation clock ---------------- */
const TIMERS = [];
function after(sec, fn) { TIMERS.push({ at: NOW + sec, fn }); }
function runTimers() { for (let i = 0; i < TIMERS.length; i++) { if (TIMERS[i].at <= NOW) { const f = TIMERS[i].fn; TIMERS.splice(i, 1); i--; f(); } } }

/* ---------------- UI ---------------- */
const bar = $('bar'); for (let i = 0; i < NPAGES; i++) { const s = document.createElement('i'); s.appendChild(document.createElement('b')); bar.appendChild(s); }
function ui(target) {
  const p = target === undefined ? S.cur : target;
  [...bar.children].forEach((s, i) => { s.firstChild.style.width = (S.phase === 'end' || S.phase === 'sealed' || S.final || i < p) ? '100%' : '0%'; });
  $('chapLabel').textContent = (S.final || S.phase === 'end') ? 'The End ❤️' : p === 0 ? 'Cover' : `Chapter ${p} / ${NPAGES}`;
  const bot = $('bottom'); bot.classList.toggle('cover', S.phase === 'cover');
  bot.classList.toggle('hide', !(S.phase === 'cover' || S.phase === 'read'));
  $('hint').textContent = p >= NPAGES ? 'Tap › to close the book' : 'Tap or swipe to turn the page';
}
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); after(1.8, () => t.classList.add('hidden')); }
let tapFx = null;
function tapAt(x, y) { tapFx = { x, y, t0: NOW }; }
function tapEl(el) { const r = el.getBoundingClientRect(); tapAt(r.left + r.width / 2, r.top + r.height / 2); }

/* ---------------- flow ---------------- */
function startFlip(tIdx, bIdx, p0, p1, dur, done) { S.flip = { tIdx, bIdx, p0, p1, t0: NOW, dur, done }; sfxFlip(); }
function pageShown(idx) {
  S.cur = idx; ui();
  if (DEMO) { window.__demo = 'ch' + idx; const DW = [0, 3.15, 3.25, 3.0, 3.45, 3.55, 3.1, 5.65];
    after(DW[idx] - .25, () => tapAt(B.x + B.w * .8, B.y + B.h * .5)); after(DW[idx], () => idx < NPAGES ? next() : closeBook()); }
}
function next() {
  if (S.phase === 'cover') return openBook();
  if (S.phase !== 'read' || S.flip) return;
  if (S.cur >= NPAGES) return closeBook();
  const to = S.cur + 1; S.pageT0[to] = NOW; inkSfx(to);
  startFlip(S.cur, to, 0, 1, .95, () => pageShown(to)); ui(to);
}
function prev() {
  if (S.phase !== 'read' || S.flip || S.cur <= 1) return;
  const to = S.cur - 1; S.pageT0[to] = NOW - 30;
  startFlip(to, S.cur, 1, 0, .95, () => pageShown(to)); ui(to);
}
function inkSfx(idx) { if (idx === NPAGES) { after(INK0, () => sfxPen(inkDur())); after(INK0 + inkDur(), () => sfxChime(72)); } }
function openBook() {
  if (S.phase !== 'cover' || S.flip) return; audioInit(); S.phase = 'read'; S.pageT0[1] = NOW;
  startFlip(0, 1, 0, 1, 1.2, () => pageShown(1)); ui(1);
}
function closeBook() {
  if (S.flip) return; S.phase = 'closing'; S.final = true; S.pageT0[0] = NOW; window.__demo = 'close';
  startFlip(0, NPAGES, 1, 0, 1.2, () => { S.cur = 0; S.phase = 'sealed'; ui(); after(.35, seal); }); ui(0);
}
function seal() {
  S.sealT = NOW; window.__demo = 'seal';
  after(.5, () => { S.shakeT = NOW; sfxThud(); S.burstT.push({ t: NOW, x: B.x + B.w / 2, y: B.y + B.h * .53, n: 46, v: 420, sz: 1.1, seed: 5 }); });
  after(1.9, showEnd);
}
function showEnd() {
  S.phase = 'end'; S.endT0 = NOW; ui(); $('end').classList.remove('hidden'); $('ask').classList.remove('hidden'); $('after').classList.add('hidden'); window.__demo = 'end';
  if (DEMO) { after(1.45, () => tapEl($('yes2'))); after(1.65, sayYes); after(1.65 + 2.4, () => { window.__demo = 'done'; }); }
}
function sayYes() {
  if (S.yesT >= 0) return; S.yesT = NOW; S.confettiT = NOW; sfxChime(67);
  S.burstT.push({ t: NOW, x: VW / 2, y: VH * .42, n: 40, v: 380, sz: 1, seed: 9 });
  $('ask').classList.add('hidden'); $('after').classList.remove('hidden'); $('nm2').textContent = NAME; window.__demo = 'yes';
}
function replay() {
  Object.assign(S, { phase: 'cover', cur: 0, flip: null, pageT0: { 0: NOW }, final: false, sealT: -1, burstT: [], confettiT: -1, shakeT: -1, endT0: -1, yesT: -1 });
  TIMERS.length = 0; $('end').classList.add('hidden'); ui();
}
function hideSplash() {
  if (S.phase !== 'splash') return; audioInit(); S.phase = 'cover'; S.pageT0[0] = NOW; S.splashOut = NOW;
  $('top').classList.remove('hide'); ui(); window.__demo = 'cover';
}

/* ---------------- share, card, create ---------------- */
function linkFor(name, line) { let u = location.origin + location.pathname + '?name=' + encodeURIComponent(name); if (line) u += '&line=' + encodeURIComponent(line); return u; }
function waOpen(text) { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); }
function share() { waOpen(`I wrote our love story for you 📖❤️ Open it: ${linkFor(NAME, Q.get('line') ? LINE : '')}`); }
function downloadCard() {
  const c0 = document.createElement('canvas'); c0.width = 1080; c0.height = 1350; const c = c0.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, '#0b0624'); g.addColorStop(1, '#3a0f3f'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
  stars(c, 1080, 1350, 1, 120, 1350, 5);
  const gl = c.createRadialGradient(540, 700, 100, 540, 700, 640); gl.addColorStop(0, 'rgba(255,190,110,.45)'); gl.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = gl; c.fillRect(0, 0, 1080, 1350);
  c.textAlign = 'center'; c.fillStyle = '#ffe08a'; c.font = F.ital(72); c.shadowColor = 'rgba(255,190,90,.8)'; c.shadowBlur = 20; c.fillText('Our Love Story 📖', 540, 120); c.shadowBlur = 0;
  c.save(); c.translate(190, 175); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40; c.fillStyle = '#4a0814'; rr(c, -14, -12, 728, 1004, 16); c.fill(); c.shadowBlur = 0;
  c.scale(700 / 400, 980 / 560); drawPage(c, NPAGES, 99, 400, 560, false); c.restore();
  c.font = F.bold(34); c.fillStyle = '#ffd98a'; c.fillText('Made by @hack.n.code', 540, 1305);
  c0.toBlob(b => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'our-love-story.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
  toast('Story card saved 💌');
}
function openCreate() { $('create').classList.remove('hidden'); $('fName').value = ''; $('fLine').value = ''; $('linkBox').classList.add('hidden'); $('formPart').classList.remove('hidden'); }
let made = '';
$('makeLink').onclick = () => { const n = clean($('fName').value).slice(0, 22) || 'my love'; const l = clean($('fLine').value).slice(0, 90); made = linkFor(n, l); $('linkOut').value = made; $('linkBox').classList.remove('hidden'); $('formPart').classList.add('hidden'); };
$('editLink').onclick = () => { $('formPart').classList.remove('hidden'); $('linkBox').classList.add('hidden'); };
$('copyLink').onclick = () => { const done = () => toast('Link copied ✅'); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(made).then(done, () => { $('linkOut').select(); try { document.execCommand('copy'); } catch (e) {} done(); }); else { $('linkOut').select(); try { document.execCommand('copy'); } catch (e) {} done(); } };
$('waLink').onclick = () => waOpen(`I wrote our love story for you 📖❤️ Open it: ${made}`);
$('openLink').onclick = () => { location.href = made; };
$('closeCreate').onclick = () => $('create').classList.add('hidden');

/* ---------------- input ---------------- */
let drag = null;
cv.addEventListener('pointerdown', e => { audioInit(); drag = { x: e.clientX, y: e.clientY, moved: false }; });
cv.addEventListener('pointermove', e => {
  if (!drag || S.phase !== 'read') return; const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) > 14) {
    if (dx < 0 && S.cur < NPAGES && !S.flip) { drag.moved = 'f'; const to = S.cur + 1; S.pageT0[to] = NOW; S.flip = { tIdx: S.cur, bIdx: to, manual: true, p: 0 }; sfxFlip(); }
    else if (dx > 0 && S.cur > 1 && !S.flip) { drag.moved = 'b'; const to = S.cur - 1; S.pageT0[to] = NOW - 30; S.flip = { tIdx: to, bIdx: S.cur, manual: true, p: 1 }; sfxFlip(); }
  }
  if (drag.moved && S.flip && S.flip.manual) S.flip.p = drag.moved === 'f' ? clamp(-dx / (B.w * .9)) : clamp(1 - dx / (B.w * .9));
});
function endDrag(e) {
  if (!drag) return; const d = drag; drag = null;
  if (d.moved && S.flip && S.flip.manual) {
    const f = S.flip, p = f.p;
    if (d.moved === 'f') { if (p > .22) { const to = f.bIdx; inkSfx(to); S.flip = { ...f, manual: false, p0: p, p1: 1, t0: NOW, dur: .2 + (1 - p) * .7, done: () => pageShown(to) }; ui(to); } else S.flip = { ...f, manual: false, p0: p, p1: 0, t0: NOW, dur: .25, done: null }; }
    else { if (p < .78) { const to = f.tIdx; S.flip = { ...f, manual: false, p0: p, p1: 0, t0: NOW, dur: .2 + p * .7, done: () => pageShown(to) }; ui(to); } else S.flip = { ...f, manual: false, p0: p, p1: 1, t0: NOW, dur: .25, done: null }; }
    return;
  }
  if (d.moved) return;
  const x = e.clientX, y = e.clientY; if (y < B.y - 20 || y > B.y + B.h + 20) return;
  if (S.phase === 'cover') return openBook();
  if (S.phase === 'read') { if (x > B.x + B.w * .4) next(); else prev(); }
}
cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', () => { drag = null; if (S.flip && S.flip.manual) S.flip = { ...S.flip, manual: false, p0: S.flip.p, p1: S.flip.bIdx > S.flip.tIdx && S.cur === S.flip.tIdx ? 0 : 1, t0: NOW, dur: .25, done: null }; });
addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === ' ') next(); if (e.key === 'ArrowLeft') prev(); });
$('nextBtn').onclick = next; $('prevBtn').onclick = prev; $('openBtn').onclick = openBook; $('startBtn').onclick = hideSplash;
$('musicBtn').onclick = () => { audioInit(); A.on = !A.on; $('musicBtn').classList.toggle('off', !A.on); toast(A.on ? 'Music on 🎵' : 'Music off 🔇'); };
$('yes1').onclick = sayYes; $('yes2').onclick = sayYes; $('cardBtn').onclick = downloadCard; $('shareBtn').onclick = share; $('createBtn').onclick = openCreate; $('replayBtn').onclick = replay;
addEventListener('resize', () => { resize(); });

/* ---------------- main loop ---------------- */
const SPL = 'A story written only for you…';
function frame() {
  NOW = performance.now() / 1000; runTimers();
  if (S.flip && !S.flip.manual && NOW - S.flip.t0 >= S.flip.dur) { const d = S.flip.done; S.flip = null; if (d) d(); }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBackground(NOW); drawPetals(NOW, false); drawBook(); drawPetals(NOW, true); drawBursts();
  // splash
  const sp = $('splash');
  if (S.phase === 'splash' || (S.splashOut && NOW - S.splashOut < .5)) {
    const st = NOW - S.splashT0; const n = Math.floor(clamp((st - .2) * 19, 0, SPL.length)); $('stext').textContent = SPL.slice(0, n);
    $('sname').style.opacity = eOut((st - 1.8) / .5); $('startBtn').style.opacity = DEMO ? 0 : eOut((st - 2.0) / .5);
    sp.style.opacity = S.splashOut ? 1 - clamp((NOW - S.splashOut) / .45) : 1; sp.classList.remove('hidden');
  } else if (!sp.classList.contains('hidden')) sp.classList.add('hidden');
  const en = $('end'); if (S.endT0 >= 0) { en.style.opacity = eOut((NOW - S.endT0) / .5); const card = S.yesT >= 0 ? $('after') : $('ask'); const k = eBack((NOW - (S.yesT >= 0 ? S.yesT : S.endT0)) / .5); card.style.transform = `scale(${.85 + .15 * k})`; }
  const tp = $('tap'); if (tapFx && NOW - tapFx.t0 < .6) { const k = (NOW - tapFx.t0) / .6; tp.classList.remove('hidden'); tp.style.left = tapFx.x + 'px'; tp.style.top = tapFx.y + 'px'; tp.style.opacity = String(1 - k * k); tp.style.transform = `scale(${.7 + .6 * k})`; } else tp.classList.add('hidden');
  requestAnimationFrame(frame);
}
window.__api = { phase: () => S.phase, cur: () => S.cur, book: () => ({ ...B }), next, prev, openBook, closeBook, sayYes, replay, hideSplash };
window.__demo = 'splash';
const fontList = ['900 36px "Playfair Display"', 'italic 700 36px "Playfair Display"', '600 20px Poppins', '800 20px Poppins', '48px "Great Vibes"', '700 20px Caveat'];
Promise.race([Promise.all(fontList.map(f => document.fonts.load(f, 'Aa❤').catch(() => null))), new Promise(r => setTimeout(r, 3500))]).then(() => {
  $('sname').textContent = 'for ' + NAME + ' ❤️';
  makePatterns(); resize(); NOW = performance.now() / 1000; S.splashT0 = NOW; S.pageT0[0] = NOW;
  if (DEMO) { after(2.8, hideSplash); after(4.0, () => tapEl($('openBtn'))); after(4.2, openBook); }
  requestAnimationFrame(frame); window.__ready = true;
});
})();
