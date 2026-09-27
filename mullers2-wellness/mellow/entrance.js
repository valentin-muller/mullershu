(() => {
  'use strict';
  const body = document.body;
  const track = document.querySelector('.entry-journey');
  const stage = document.querySelector('.entry-stage');
  const art = track.querySelector('.house-art');
  const title = track.querySelector('.house-title');
  const enter = track.querySelector('.enter');
  const door = track.querySelector('.entry-door');
  const veil = track.querySelector('.entry-veil');
  const intro = document.querySelector('.private-intro');
  const chapterNav = document.querySelector('.chapters').cloneNode(true);
  chapterNav.classList.add('entry-chapters');
  track.querySelector('.house').append(chapterNav);
  const composition = track.querySelector('.hero-composition');
  const house = track.querySelector('.house');
  const fitComposition = () => {
    const phone = window.matchMedia('(max-width:760px)').matches;
    body.classList.toggle('mobile-fitted', phone);
    if (!phone) { composition.style.removeProperty('transform'); return; }
    // Keep card proportions; let the larger house use the available page width.
    const scale = Math.min(1, (house.clientWidth + 12) / 500, (house.clientHeight - 104) / 980);
    composition.style.transform = `translateX(-50%) scale(${Math.max(.1, scale)})`;
    body.style.setProperty('--hero-scale', scale);
  };
  fitComposition();
  window.addEventListener('resize', fitComposition);
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { const t = clamp(v); return t*t*(3-2*t); };
  let queued = false;
  function draw() {
    queued = false;
    const natural = body.classList.contains('neighborhood-fan');
    body.classList.toggle('entry-natural', natural);
    body.classList.toggle('in-neighborhood', natural && track.getBoundingClientRect().bottom > 80);
    if (!body.classList.contains('motion') || natural) {
      [art,title,enter,door,veil,chapterNav,...art.querySelectorAll('.neighborhood-cards'),track.querySelector('.walking-note')].forEach(node => node.removeAttribute('style'));
      chapterNav.inert = false;
      art.querySelector('.neighborhood-cards').inert = false;
      const introRect = intro.getBoundingClientRect();
      body.classList.toggle('is-entry', introRect.top <= 80 && introRect.bottom > 80);
      return;
    }
    const p = clamp(-track.getBoundingClientRect().top / Math.max(1, track.offsetHeight-stage.offsetHeight));
    const zoom = ease((p-.06)/.65);
    art.style.transformOrigin = '52% 79%';
    art.style.transform = `translateY(${-zoom*20}%) scale(${1+zoom*3.7})`;
    chapterNav.style.opacity = 1-ease(p/.12);
    chapterNav.inert = p>.12;
    title.style.opacity = 1-ease(p/.2);
    enter.style.opacity = 1-ease(p/.12);
    enter.style.visibility = p>.2 ? 'hidden' : '';
    art.querySelector('.neighborhood-cards').inert = p > .2;
    track.querySelector('.walking-note').style.opacity = 1-ease(p/.12);
    art.querySelectorAll('.neighborhood-cards').forEach(node => {
      node.style.opacity = 1-ease(p/.23);
      node.style.visibility = p>.25 ? 'hidden' : '';
    });
    door.style.opacity = ease((p-.32)/.21);
    door.style.transform = `scale(${1+ease((p-.4)/.52)*2.1})`;
    veil.style.opacity = ease((p-.65)/.3);
    const rect = intro.getBoundingClientRect();
    body.classList.toggle('is-entry', (p>.62 && rect.bottom>80));
  }
  const update = () => { if (!queued) { queued=true; requestAnimationFrame(draw); } };
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  window.addEventListener('mellow-motion',update);
  update();
})();
