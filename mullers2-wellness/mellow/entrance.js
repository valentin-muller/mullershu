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
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { const t = clamp(v); return t*t*(3-2*t); };
  let queued = false;
  function draw() {
    queued = false;
    if (!body.classList.contains('motion')) {
      [art,title,enter,door,veil,chapterNav,...art.querySelectorAll('.landmark,.landmark-label')].forEach(node => node.removeAttribute('style'));
      chapterNav.inert = false;
      body.classList.remove('is-entry');
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
    art.querySelectorAll('.landmark,.landmark-label').forEach(node => {
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
