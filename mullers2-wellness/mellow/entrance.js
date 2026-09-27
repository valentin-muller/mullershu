(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const track = document.querySelector('.entry-journey');
  const stage = track.querySelector('.entry-stage');
  const art = track.querySelector('.house-art');
  const building = art.querySelector('.fan-house');
  const cards = art.querySelector('.neighborhood-cards');
  const title = track.querySelector('.house-title');
  const sideCopy = track.querySelector('.hero-sidecopy');
  const enter = track.querySelector('.enter');
  const note = track.querySelector('.walking-note');
  const door = track.querySelector('.entry-door');
  const veil = track.querySelector('.entry-veil');
  const intro = document.querySelector('.private-intro');
  const chapterNav = document.querySelector('.chapters').cloneNode(true);
  chapterNav.classList.add('entry-chapters');
  track.querySelector('.house').append(chapterNav);
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { const t = clamp(v); return t*t*(3-2*t); };
  let queued = false;
  let geometry = {width:0,height:0,x:0,y:0};

  function measure() {
    // CSS owns the starting size. Only camera offsets are measured here.
    art.style.setProperty('--entry-zoom', '1');
    art.style.setProperty('--entry-pan-x', '0px');
    art.style.setProperty('--entry-pan-y', '0px');
    const room = stage.getBoundingClientRect();
    const photo = building.getBoundingClientRect();
    const doorX = photo.left + photo.width * .585;
    const doorY = photo.top + photo.height * .765;
    art.style.transformOrigin = `${building.offsetLeft + building.offsetWidth * .085}px ${building.offsetTop + building.offsetHeight * .765}px`;
    geometry = {width:room.width,height:room.height,x:room.left + room.width*.5-doorX,y:room.top + Math.min(room.height,innerHeight)*.55-doorY};
  }
  function draw() {
    queued = false;
    const active = root.classList.contains('entry-animated');
    body.classList.toggle('in-neighborhood', track.getBoundingClientRect().bottom > 80);
    const p = active ? clamp(-track.getBoundingClientRect().top / Math.max(1,track.offsetHeight-stage.offsetHeight)) : 0;
    const camera = ease((p-.035)/.66);
    art.style.setProperty('--entry-zoom', String(1+camera*4.6));
    art.style.setProperty('--entry-pan-x', `${geometry.x*camera}px`);
    art.style.setProperty('--entry-pan-y', `${geometry.y*camera}px`);
    const fade = 1-ease(p/.18);
    [title,sideCopy,enter,note,chapterNav].forEach(node => { node.style.opacity=String(fade); });
    enter.inert = p>.18;
    chapterNav.inert = p>.18;
    cards.style.opacity=String(1-ease((p-.04)/.25));
    cards.inert=p>.18;
    art.querySelectorAll('.hero-foliage').forEach(node => { node.style.opacity=String(1-ease((p-.08)/.28)); });
    door.style.opacity=String(ease((p-.38)/.23));
    door.style.transform=`scale(${1+ease((p-.45)/.43)*1.7})`;
    veil.style.opacity=String(ease((p-.74)/.22));
    const introRect=intro.getBoundingClientRect();
    body.classList.toggle('is-entry', (p>.58 || introRect.top<=80) && introRect.bottom>80);
  }
  const update = () => { if (!queued) { queued=true; requestAnimationFrame(draw); } };
  const resize = () => {
    // Safari toolbar expansion changes innerHeight, but not the CSS small viewport.
    // Do not refit or move the camera when the underlying stage is unchanged.
    if (stage.clientWidth!==geometry.width || Math.abs(stage.clientHeight-geometry.height)>1) measure();
    update();
  };
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',resize);
  window.addEventListener('mellow-motion',() => {
    root.classList.toggle('entry-animated',body.classList.contains('motion'));
    measure();
    update();
  });
  measure();
  draw();
})();
