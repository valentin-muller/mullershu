(() => {
  'use strict';
  const body = document.body;
  const journey = document.querySelector('.journey');
  const stage = document.querySelector('.stage');
  const scenes = [...journey.querySelectorAll('.scene')];
  const art = document.querySelector('.house-art');
  const houseTitle = document.querySelector('.house-title');
  const enter = document.querySelector('.enter');
  const bedroom = scenes[0];
  const lounge = scenes[1];
  const chapterLinks = [...journey.querySelectorAll('.chapters a')];
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = false, userStatic = false, queued = false, lastProgress = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const anchors = [0, .88];
  const reveal = node => node?.classList.add('revealed');
  const copyBlocks = [...document.querySelectorAll('.reveal-copy')];
  copyBlocks.forEach(node => node.classList.add('reveal-ready'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); } });
  }, {threshold:.25});
  copyBlocks.filter(node => !node.closest('.scene')).forEach(node => observer.observe(node));
  const range = () => Math.max(1, journey.offsetHeight - stage.offsetHeight);
  function draw() {
    queued = false;
    if (!enabled) return;
    const top = journey.getBoundingClientRect().top;
    const p = clamp(-top / range());
    lastProgress = p;
    const passing = smooth((p - .35) / .38);
    bedroom.style.clipPath = 'none';
    lounge.style.clipPath = `inset(0 0 0 ${(1 - passing) * 100}%)`;
    bedroom.querySelector('.room-photo').style.transform = `translateX(${-passing * 4}%) scale(${1.02 + clamp((p - .34) / .3) * .04})`;
    lounge.querySelector('.room-photo').style.transform = `translateX(${(1 - passing) * 4}%) scale(1.05)`;
    const bedroomText = 1 - smooth((p - .3) / .15);
    const loungeText = smooth((p - .68) / .08);
    bedroom.querySelector('.room-next').style.opacity = bedroomText;
    if (journey.getBoundingClientRect().top < innerHeight * .6) reveal(bedroom.querySelector('.reveal-copy'));
    lounge.querySelector('.room-next').style.opacity = loungeText;
    if (p >= .73) reveal(lounge.querySelector('.reveal-copy'));
    const current = p < .6 ? 0 : 1;
    scenes.forEach((scene, i) => { scene.inert = i !== current; });
    chapterLinks.forEach((link, i) => { if (Number(link.dataset.chapter) === current + 1) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    body.classList.toggle('is-room', top <= 0);
    body.classList.toggle('at-end', -top > range() + stage.offsetHeight * .4);
  }
  function requestDraw() { if (!queued && enabled) { queued = true; requestAnimationFrame(draw); } }
  function chapter(index, behavior = 'smooth') {
    if (!enabled) { scenes[index].scrollIntoView({behavior: reduced.matches ? 'auto' : behavior}); return; }
    const origin = window.scrollY + journey.getBoundingClientRect().top;
    window.scrollTo({top: origin + anchors[index] * range(), behavior});
  }
  document.querySelectorAll('[data-chapter]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!enabled) return;
    event.preventDefault();
    chapter(Number(link.dataset.chapter) - 1);
    history.replaceState(null, '', link.getAttribute('href'));
  }));
  function setMode() {
    enabled = !reduced.matches && !userStatic;
    const current = Math.max(0, Number(chapterLinks.find(link => link.hasAttribute('aria-current'))?.dataset.chapter || 1) - 1);
    body.classList.toggle('motion', enabled);
    window.dispatchEvent(new Event('mellow-motion'));
    toggle.textContent = enabled ? 'Animáció kikapcsolása' : 'Animáció bekapcsolása';
    toggle.hidden = reduced.matches;
    if (!enabled) {
      body.classList.remove('is-room', 'at-end');
      copyBlocks.forEach(reveal);
      scenes.forEach(scene => { scene.inert = false; scene.removeAttribute('style'); });
      document.querySelectorAll('.room-title,.room-next,.room-photo,.house-art,.house-title,.enter').forEach(node => node.removeAttribute('style'));
    }
    return current;
  }
  toggle.addEventListener('click', () => { const outside = journey.getBoundingClientRect().bottom <= 0; const anchor = outside ? document.elementFromPoint(innerWidth/2, innerHeight/2)?.closest('section') : null; userStatic = !userStatic; const current = setMode(); if (outside) anchor?.scrollIntoView({behavior:'instant'}); else chapter(current, 'auto'); draw(); });
  reduced.addEventListener('change', () => { const current = setMode(); chapter(current, 'auto'); draw(); });
  window.addEventListener('scroll', requestDraw, {passive:true});
  window.addEventListener('resize', () => {
    if (enabled && journey.getBoundingClientRect().top <= 0 && !body.classList.contains('at-end')) {
      const origin = window.scrollY + journey.getBoundingClientRect().top;
      window.scrollTo({top:origin + lastProgress * range(), behavior:'instant'});
    }
    requestDraw();
  });
  window.addEventListener('hashchange', () => { const index = scenes.findIndex(scene => `#${scene.id}` === location.hash); if (index >= 0) chapter(index, 'auto'); });
  Promise.all([...document.querySelectorAll('.scene img')].map(img => img.decode().catch(() => new Promise(resolve => requestAnimationFrame(resolve)).then(() => img.decode())))).then(() => {
    setMode();
    const index = scenes.findIndex(scene => `#${scene.id}` === location.hash);
    if (index >= 0) chapter(index, 'instant');
    else if (location.hash==='#elmeny') window.dispatchEvent(new CustomEvent('mellow-intro',{detail:'instant'}));
    else if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'});
    draw();
  }).catch(() => {
    userStatic = true;
    setMode();
    toggle.hidden = true;
  });
})();
