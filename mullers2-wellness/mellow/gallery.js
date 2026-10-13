(() => {
  'use strict';
  const links = [...document.querySelectorAll('.mellow-gallery-item a')];
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'mellow-gallery-viewer';
  dialog.setAttribute('aria-labelledby', 'gallery-caption');
  dialog.innerHTML = `
    <button class="gallery-close" type="button" aria-label="Kép bezárása" autofocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <img alt="">
    <p class="gallery-caption" id="gallery-caption"></p>
    <p class="gallery-count" aria-live="polite" aria-atomic="true"></p>
    <p class="gallery-load-error" role="status" hidden>A képet nem sikerült betölteni. Próbáljatok egy másik képre lépni.</p>
    <button class="gallery-prev" type="button" aria-label="Előző kép"><svg aria-hidden="true"><use href="#arrow"/></svg></button>
    <button class="gallery-next" type="button" aria-label="Következő kép"><svg aria-hidden="true"><use href="#arrow"/></svg></button>`;
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('.gallery-caption');
  const count = dialog.querySelector('.gallery-count');
  const error = dialog.querySelector('.gallery-load-error');
  let index = 0, oldOverflow = '', start = null, opener = null;
  function show(nextIndex) {
    index = (nextIndex + links.length) % links.length;
    const link = links[index];
    const thumb = link.querySelector('img');
    error.hidden = true;
    image.alt = thumb.alt;
    image.src = link.href;
    caption.textContent = link.closest('figure').querySelector('figcaption').textContent;
    count.textContent = `${index + 1} / ${links.length}`;
  }
  image.addEventListener('error', () => { error.hidden = false; });
  links.forEach((link, i) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      show(i);
      opener = link;
      oldOverflow = document.body.style.overflow;
      dialog.showModal();
      dialog.querySelector('.gallery-close').focus({preventScroll:true});
      document.body.style.overflow = 'hidden';
    });
  });
  dialog.querySelector('.gallery-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.gallery-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.gallery-next').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('close', () => {
    document.body.style.overflow = oldOverflow;
    start = null;
    opener?.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  image.addEventListener('pointerdown', event => { start = {x:event.clientX, y:event.clientY}; });
  image.addEventListener('pointercancel', () => { start = null; });
  image.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx > 0 ? -1 : 1));
  });
})();
