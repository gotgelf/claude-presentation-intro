// ── State ──
const slides = document.querySelectorAll('.slide');
const sidebar = document.getElementById('sidebar');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const promptText = document.getElementById('promptText');
const copyBtn = document.getElementById('copyBtn');
let current = 0;

// PROMPTS is injected by build.js from config.json
const prompts = typeof PROMPTS !== 'undefined' ? PROMPTS : [];

// ── Build sidebar ──
slides.forEach((s, i) => {
  const t = document.createElement('div');
  t.className = 'thumb' + (i === 0 ? ' active' : '');
  t.innerHTML = '<div class="thumb-num">' + String(i + 1).padStart(2, '0') + '</div><div class="thumb-title">' + s.dataset.title + '</div>';
  t.onclick = () => goTo(i);
  sidebar.appendChild(t);
});

// ── Navigation ──
function goTo(i) {
  if (i < 0 || i >= slides.length) return;
  slides[current].classList.remove('active');
  sidebar.children[current].classList.remove('active');
  current = i;
  slides[current].classList.add('active');
  sidebar.children[current].classList.add('active');
  sidebar.children[current].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  counter.textContent = (current + 1) + ' / ' + slides.length;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;
  promptText.textContent = prompts[current];
  copyBtn.textContent = 'Copy';
  copyBtn.classList.remove('copied');
}

function navigate(d) { goTo(current + d); }

function copyPrompt() {
  navigator.clipboard.writeText(prompts[current]).then(() => {
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1500);
  });
}

// ── Keyboard ──
document.addEventListener('keydown', e => {
  // Don't navigate if intro is visible
  if (!document.getElementById('introOverlay').classList.contains('hidden')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); navigate(1); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); navigate(-1); }
  if (e.key === 'f' || e.key === 'F') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }
});

goTo(0);

// ── Terminal typing animation ──
(function terminalAnim() {
  const lines = [
    { el: 'termLine1', text: '\u2591 Scanning project...', delay: 400 },
    { el: 'termLine2', text: '\u2591 Found CLAUDE.md', delay: 1200 },
    { el: 'termLine3', text: '\u2591 3 skills loaded', delay: 2000 },
    { el: 'termReady', text: 'Ready. What are we building?', delay: 2800 }
  ];
  lines.forEach(l => {
    const el = document.getElementById(l.el);
    if (!el) return;
    setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        el.textContent = l.text.substring(0, i + 1);
        i++;
        if (i >= l.text.length) clearInterval(iv);
      }, 25);
    }, l.delay);
  });
})();

// ── Intro particle system (brand shapes) ──
(function introParticles() {
  const canvas = document.getElementById('introCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  // Brand: monochromatic particles per background. Navy bg = Electric Blue shades
  const COLORS = ['#0061FF', '#3381FF', '#0050D4', '#4D9AFF', '#0061FF'];
  const SHAPES = ['triangle', 'square', 'circle', 'diamond', 'pentagon', 'hexagon'];
  let particles = [];
  let mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create particles
  for (let i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * 2000 - 200,
      y: Math.random() * 1200 - 100,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.45 + 0.15,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      px: 0, py: 0
    });
  }

  canvas.parentElement.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function drawShape(x, y, r, shape, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (shape === 'triangle') {
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.87, r * 0.5); ctx.lineTo(-r * 0.87, r * 0.5); ctx.closePath();
    } else if (shape === 'square') {
      ctx.rect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
    } else if (shape === 'diamond') {
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.7, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.7, 0); ctx.closePath();
    } else if (shape === 'pentagon') {
      for (let s = 0; s < 5; s++) { const a = (s * 2 * Math.PI / 5) - Math.PI / 2; ctx[s === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath();
    } else if (shape === 'hexagon') {
      for (let s = 0; s < 6; s++) { const a = (s * 2 * Math.PI / 6) - Math.PI / 2; ctx[s === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath();
    } else {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;
      p.rot += p.rotSpeed;

      if (p.x < -30) p.x = W + 30;
      if (p.x > W + 30) p.x = -30;
      if (p.y < -30) p.y = H + 30;
      if (p.y > H + 30) p.y = -30;

      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140 && dist > 0) {
        const f = (140 - dist) / 140 * 0.2;
        p.vx += (dx / dist) * f;
        p.vy += (dy / dist) * f;
      }
      p.vx *= 0.997;
      p.vy *= 0.997;

      const pa = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

      // Glow
      drawShape(p.x, p.y, p.r * 1.6, p.shape, p.rot, p.color, pa * 0.12);
      // Core
      drawShape(p.x, p.y, p.r, p.shape, p.rot, p.color, pa);

      p.px = p.x;
      p.py = p.y;
    });

    if (!document.getElementById('introOverlay').classList.contains('hidden')) {
      requestAnimationFrame(draw);
    }
  }
  draw();

  // Dismiss intro
  function dismiss() {
    document.getElementById('introOverlay').classList.add('hidden');
  }
  document.getElementById('introOverlay').addEventListener('click', dismiss);
  document.addEventListener('keydown', function ik(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      dismiss();
      document.removeEventListener('keydown', ik);
    }
  });
})();
