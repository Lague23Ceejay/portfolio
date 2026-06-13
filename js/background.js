/* FILE: portfolio/js/background.js */

/* ============================================================
   background.js — Animated canvas background
   Reads window.themeOrbColor (set by theme.js) for accent tinting
   ============================================================ */

const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');

let W, H;
const mouse = { x: 0, y: 0 };

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

// ── Orbs ──
const orbs = [
  { x: 0.75, y: 0.20, r: 0.38, speed: 0.00018, angle: 0,   drift: 0.06, opacity: 0.08 },
  { x: 0.15, y: 0.70, r: 0.28, speed: 0.00013, angle: 2.1, drift: 0.08, opacity: 0.06 },
  { x: 0.50, y: 0.50, r: 0.20, speed: 0.00022, angle: 4.5, drift: 0.04, opacity: 0.04 },
  { x: 0.85, y: 0.80, r: 0.15, speed: 0.00030, angle: 1.0, drift: 0.10, opacity: 0.05 },
];

// ── Particles ──
const isMobile     = window.innerWidth < 600;
const particleCount = isMobile ? 30 : 80;
const particles = Array.from({ length: particleCount }, () => ({
  x:            Math.random(),
  y:            Math.random(),
  size:         Math.random() * 1.2 + 0.3,
  speed:        Math.random() * 0.00008 + 0.00003,
  angle:        Math.random() * Math.PI * 2,
  opacity:      Math.random() * 0.35 + 0.05,
  twinkle:      Math.random() * Math.PI * 2,
  twinkleSpeed: Math.random() * 0.02 + 0.005,
}));

let t = 0;

function getOrbColor() {
  return window.themeOrbColor || [255, 255, 255];
}

function draw() {
  t++;
  ctx.clearRect(0, 0, W, H);

  // Get theme bg color from CSS variable
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--black').trim() || '#0a0a0a';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const [or, og, ob] = getOrbColor();

  // Aurora band
  const auroraY = H * 0.45 + Math.sin(t * 0.0005) * H * 0.08;
  const aurora  = ctx.createLinearGradient(0, auroraY - H * 0.25, 0, auroraY + H * 0.25);
  const aAlpha1 = 0.02 + Math.sin(t * 0.0008) * 0.01;
  const aAlpha2 = 0.015 + Math.cos(t * 0.0011) * 0.008;
  aurora.addColorStop(0,   'rgba(0,0,0,0)');
  aurora.addColorStop(0.3, `rgba(${or},${og},${ob},${aAlpha1})`);
  aurora.addColorStop(0.5, `rgba(${or},${og},${ob},${aAlpha2})`);
  aurora.addColorStop(0.7, `rgba(${or},${og},${ob},${aAlpha1})`);
  aurora.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = aurora;
  ctx.fillRect(0, auroraY - H * 0.25, W, H * 0.5);
  ctx.restore();

  // Mouse spotlight
  const spot = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, W * 0.28);
  spot.addColorStop(0,   `rgba(${or},${og},${ob},0.05)`);
  spot.addColorStop(0.4, `rgba(${or},${og},${ob},0.015)`);
  spot.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Orbs
  orbs.forEach(o => {
    o.angle    += o.speed * t * 0.01 + o.speed;
    const cx    = (o.x + Math.cos(o.angle) * o.drift) * W;
    const cy    = (o.y + Math.sin(o.angle * 0.7) * o.drift * 0.6) * H;
    const r     = o.r * Math.min(W, H);
    const g     = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const pulse = o.opacity + Math.sin(t * 0.0015 + o.angle) * o.opacity * 0.3;
    g.addColorStop(0,   `rgba(${or},${og},${ob},${pulse})`);
    g.addColorStop(0.4, `rgba(${or},${og},${ob},${pulse * 0.25})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Particles
  particles.forEach(p => {
    p.angle   += p.speed;
    p.twinkle += p.twinkleSpeed;
    const px   = ((p.x + Math.cos(p.angle) * 0.03) % 1 + 1) % 1 * W;
    const py   = ((p.y + Math.sin(p.angle * 0.8) * 0.025) % 1 + 1) % 1 * H;
    const alpha = p.opacity * (0.6 + Math.sin(p.twinkle) * 0.4);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(${or},${og},${ob},${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  requestAnimationFrame(draw);
}

draw();