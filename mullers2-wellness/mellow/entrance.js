(() => {
  'use strict';
  const body = document.body;
  const track = document.querySelector('.entry-journey');
  const intro = document.querySelector('.private-intro');
  const chapterNav = document.querySelector('.chapters').cloneNode(true);
  chapterNav.classList.add('entry-chapters');
  track.querySelector('.house').append(chapterNav);
  let queued = false;

  // The hero and introduction stay in normal flow. Only header colours track
  // the current surface; no camera, opacity choreography or custom anchor jump.
  function draw() {
    queued = false;
    body.classList.toggle('in-neighborhood', track.getBoundingClientRect().bottom > 80);
    const rect = intro.getBoundingClientRect();
    body.classList.toggle('is-entry', rect.top<=80 && rect.bottom>80);
  }
  const update = () => {
    if (!queued) { queued=true; requestAnimationFrame(draw); }
  };
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  window.addEventListener('mellow-motion',update);
  draw();
})();
