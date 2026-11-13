(() => {
  const model = document.querySelector('[data-wellness-model]');
  if (!model) return;
  model.classList.add('model-enhanced');
  const image = model.querySelector('[data-model-image]');
  const controls = model.querySelector('[data-model-controls]');
  const status = model.querySelector('[data-model-status]');
  const buttons = [...controls.querySelectorAll('[data-model-view]')];
  const views = {
    overview: 'A wellness térbeli illusztrációja: fényfüzéres pihenő, jakuzzi, borostyánszínű sófalak, szauna, két zuhanyzó és két külön WC kézmosóval',
    jakuzzi: 'A jakuzzi helyiségének közeli, illusztratív térbeli nézete',
    piheno: 'A pihenő közeli térbeli illusztrációja: zöld padló, fehér lambéria, függőszék és apró LED-fényfüzérek',
    soszoba: 'A hosszúkás sószoba közeli térbeli illusztrációja, jól látható borostyánszínű sófalakkal, pihenőszékekkel és kis asztalokkal',
    szauna: 'A finn szauna közeli térbeli illusztrációja: L alakú fapadok, kék padvilágítás, kerek szaunakályha és üvegbejárat',
    folyoso: 'A közlekedő és a mellette elhelyezkedő két zuhanyzó, valamint két külön WC kézmosóval, közeli térbeli illusztráción',
  };
  const photoLink = model.querySelector('[data-model-photo]');
  const photoTargets = { jakuzzi: ['#jakuzzi', 'Nézd meg fényképen: jakuzzi'], soszoba: ['#soszoba', 'Nézd meg fényképen: sószoba'], szauna: ['#szauna', 'Nézd meg fényképen: szauna'] };
  const showPhotoLink = view => {
    const target = photoTargets[view];
    photoLink.hidden = !target;
    if (target) {
      photoLink.href = target[0];
      photoLink.setAttribute('aria-label', target[1]);
    }
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('wellness-exploring', entry.isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(model);
    for (const [selector, className] of [['.m2-hero', 'hero-in-view'], ['#szobak', 'rooms-in-view'], ['#erdeklodes', 'contact-in-view']]) {
      const section = document.querySelector(selector);
      if (section) new IntersectionObserver(([entry]) => {
        document.body.classList.toggle(className, entry.isIntersecting);
      }, { rootMargin: '-80px 0px 0px 0px' }).observe(section);
    }
  }
  let request = 0;
  const ready = () => {
    if (!image.naturalWidth) return;
    image.removeEventListener('load', ready);
    controls.hidden = false;
    status.textContent = 'Válassz egy helyiséget, és nézd meg közelebbről.';
  };
  image.addEventListener('load', ready, { once: true });
  image.addEventListener('error', () => {
    controls.hidden = true;
    model.classList.add('model-unavailable');
    status.textContent = 'A térbeli bemutató most nem tölthető be. Fedezd fel a helyiségeket az alábbi fényképeken.';
  }, { once: true });
  if (image.complete) {
    if (image.naturalWidth) ready();
    else image.dispatchEvent(new Event('error'));
  }
  buttons.forEach(button => button.addEventListener('click', async () => {
    const view = button.dataset.modelView;
    if (button.getAttribute('aria-pressed') === 'true') {
      ++request;
      model.removeAttribute('aria-busy');
      status.textContent = `${button.textContent} nézet`;
      return;
    }
    const token = ++request;
    model.setAttribute('aria-busy', 'true');
    status.textContent = 'Nézet betöltése…';
    const next = new Image();
    next.src = `../assets/wellness/model-v3-${view}.webp`;
    try {
      await next.decode();
      if (token !== request) return;
      image.src = next.src;
      image.alt = views[view];
      showPhotoLink(view);
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      status.textContent = `${button.textContent} nézet`;
    } catch {
      if (token !== request) return;
      status.textContent = 'Ez a nézet most nem tölthető be. A többi nézetet és az alábbi fényképeket továbbra is megnézheted.';
    } finally {
      if (token === request) model.removeAttribute('aria-busy');
    }
  }));
})();
