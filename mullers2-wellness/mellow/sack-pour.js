(() => {
  'use strict';
  const stage = document.querySelector('.courtyard-detail');
  const sack = stage?.querySelector('.parajd-sack');
  const copy = stage?.querySelector('p');
  const canvas = stage?.querySelector('.sack-salt');
  const ctx = canvas?.getContext('2d');
  if (!sack || !copy || !ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => 1 - Math.pow(1 - clamp(n), 3);
  const duration = 5.8;
  const angle = 72 * Math.PI / 180;
  const moving = () => document.body.classList.contains('motion') && !reduced.matches;
  let visible = false, started = false, frame = 0, previous = 0, time = 0;
  let geometry;
  // Seeded grains keep the settled heap stable on resize and reverse scroll.
  const grains = Array.from({length: 170}, (_, i) => ({
    phase: (i * 67 % 173) / 173,
    spread: (i * 43 % 179) / 179 - .5,
    size: .7 + (i % 5) * .23,
    shade: i % 3,
  }));

  function measure() {
    const r = stage.getBoundingClientRect();
    const t = copy.getBoundingClientRect();
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height) return;
    // Read the untransformed image slot; object-fit preserves the original 3:4 render.
    const scale = Math.min(sack.clientWidth / 600, sack.clientHeight / 800);
    const iw = 600 * scale, ih = 800 * scale;
    const cx = sack.offsetLeft + sack.clientWidth / 2;
    const cy = sack.offsetTop + sack.clientHeight / 2;
    const shrink = .82;
    const halfWidth = (ih * Math.sin(angle) + iw * Math.cos(angle)) * shrink / 2;
    const shiftX = Math.max(0, halfWidth + 4 - cx);
    const halfHeight = (iw * Math.sin(angle) + ih * Math.cos(angle)) * shrink / 2;
    const shift = Math.max(0, height + 8 - halfHeight - cy);
    const mx = iw * .32, my = -ih * .38;
    const sourceX = cx + shiftX + (mx * Math.cos(angle) - my * Math.sin(angle)) * shrink;
    const sourceY = cy + shift + (mx * Math.sin(angle) + my * Math.cos(angle)) * shrink;
    const textLeft = t.left - r.left, textBottom = t.bottom - r.top;
    const pileWidth = Math.min(t.width * .74, 180);
    const pileX = Math.min(width - pileWidth / 2 - 8, textLeft + t.width * .48);
    // Keep all resting salt below the paragraph, never over its glyphs.
    const floor = height - 5;
    const pileHeight = Math.max(3, Math.min(13, floor - textBottom - 9));
    geometry = {width, height, cx, cy, iw, ih, shrink, shift, shiftX, sourceX, sourceY, pileX, pileWidth, pileHeight, floor};
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function heap(amount) {
    if (amount <= 0) return;
    const g = geometry, w = g.pileWidth * Math.sqrt(amount), h = g.pileHeight * amount;
    // A low bed of salt with uneven crystalline shoulders, rather than a powder cloud.
    ctx.fillStyle = 'rgba(255,250,237,.88)';
    ctx.beginPath();
    ctx.moveTo(g.pileX - w / 2, g.floor);
    for (let i = 0; i <= 24; i++) {
      const f = i / 24;
      const y = g.floor - Math.pow(Math.sin(f * Math.PI), .8) * h - (i % 3) * .45;
      ctx.lineTo(g.pileX - w / 2 + f * w, y);
    }
    ctx.lineTo(g.pileX + w / 2, g.floor);
    ctx.closePath(); ctx.fill();
    grains.forEach(q => {
      const x = g.pileX + q.spread * w;
      const mound = Math.pow(Math.cos(q.spread * Math.PI), .8) * h;
      const y = g.floor - q.phase * mound;
      ctx.fillStyle = ['rgba(177,154,120,.52)', 'rgba(255,255,250,.95)', 'rgba(220,205,175,.8)'][q.shade];
      ctx.fillRect(x, y, q.size, q.size * .7);
    });
  }

  function draw() {
    if (!geometry) return;
    const g = geometry;
    ctx.clearRect(0, 0, g.width, g.height);
    const active = moving();
    const tilt = active ? ease((time - .25) / 1.25) : 0;
    const size = 1 + (g.shrink - 1) * tilt;
    sack.style.transform = `translate(${g.shiftX * tilt}px, ${g.shift * tilt}px) rotate(${72 * tilt}deg) scale(${size})`;
    const poured = active ? clamp((time - 1.35) / 3.7) : 1;
    heap(poured);
    if (!active || time < 1.35 || time > 5.2) return;
    const fade = clamp((time - 1.35) / .25) * clamp((5.2 - time) / .4);
    grains.slice(0, 96).forEach(q => {
      const flight = (q.phase + time * 1.3) % 1;
      const x = g.sourceX + (g.pileX - g.sourceX) * flight + q.spread * g.pileWidth * flight * .42;
      const y = g.sourceY + (g.floor - g.sourceY) * flight * flight;
      ctx.fillStyle = `rgba(${q.shade ? '250,244,227' : '168,145,110'},${fade * .85})`;
      ctx.fillRect(x, y, q.size, q.size * 1.15);
    });
  }

  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || !moving()) { previous = 0; draw(); return; }
    if (previous) time += Math.min((now - previous) / 1000, .06);
    previous = now;
    draw();
    if (time < duration) frame = requestAnimationFrame(tick);
    else { previous = 0; sack.style.willChange = ''; }
  }

  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    const run = visible && started && !document.hidden && moving() && time < duration;
    sack.style.willChange = run ? 'transform' : '';
    if (run) frame = requestAnimationFrame(tick);
    else draw();
  }
  new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting && e.intersectionRatio >= .4);
    if (visible) started = true;
    sync();
  }, {threshold: [0, .4]}).observe(stage);
  new ResizeObserver(measure).observe(stage);
  sack.addEventListener('load', measure);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('mellow-motion', sync);
  reduced.addEventListener('change', sync);
  measure();
})();
