(() => {
  'use strict';
  const body = document.body;
  const journey = document.querySelector('.journey');
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = false, userStatic = false, queued = false;
  const reveal = node => node.classList.add('revealed');
  const copyBlocks = [...document.querySelectorAll('.reveal-copy')];
  copyBlocks.forEach(node => node.classList.add('reveal-ready'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); }
    });
  }, {threshold:.25});
  copyBlocks.forEach(node => observer.observe(node));

  // Every chapter follows normal document scrolling, including rooms and lounge.
  function draw() {
    queued = false;
    if (!enabled) return;
    const rect = journey.getBoundingClientRect();
    body.classList.toggle('is-room', rect.top <= 0);
    body.classList.toggle('at-end', rect.bottom < innerHeight * .6);
  }
  function requestDraw() {
    if (!queued && enabled) { queued = true; requestAnimationFrame(draw); }
  }
  function setMode() {
    enabled = !reduced.matches && !userStatic;
    body.classList.toggle('motion', enabled);
    toggle.textContent = enabled ? 'Animáció kikapcsolása' : 'Animáció bekapcsolása';
    toggle.hidden = reduced.matches;
    if (!enabled) {
      body.classList.remove('is-room', 'at-end');
      copyBlocks.forEach(reveal);
    }
    window.dispatchEvent(new Event('mellow-motion'));
    draw();
  }
  toggle.addEventListener('click', () => { userStatic = !userStatic; setMode(); });
  reduced.addEventListener('change', setMode);
  window.addEventListener('scroll', requestDraw, {passive:true});
  window.addEventListener('resize', requestDraw);
  setMode();
})();
