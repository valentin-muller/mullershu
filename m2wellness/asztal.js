const occasion = document.querySelector('.occasion');
const ribbonTrack = occasion.querySelector('.ribbon-track');
// Each full set is 1880+ px at its base font size, so four sets also cover a 4K viewport while looping.
for (let copy = 0; copy < 3; copy++) {
  const repeatedOccasions = ribbonTrack.firstElementChild.cloneNode(true);
  repeatedOccasions.setAttribute('aria-hidden', 'true');
  ribbonTrack.append(repeatedOccasions);
}
occasion.classList.add('is-moving');

const picker = document.querySelector('#idopont');
const offerDock = document.querySelector('.offer-dock');
const closingOffer = document.querySelector('.ending-actions a[href="#idopont"]');

// On phones the floating action takes over after the date button scrolls past the top.
if ('IntersectionObserver' in window) {
  const mobile = window.matchMedia('(max-width: 760px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dateOffer = picker.querySelector('button');
  const initialAnchor = document.getElementById(location.hash.slice(1));
  let arrivingBelowOffer = initialAnchor !== null &&
    Boolean(dateOffer.compareDocumentPosition(initialAnchor) & Node.DOCUMENT_POSITION_FOLLOWING);
  let dateOfferPassed = dateOffer.getBoundingClientRect().bottom <= 0;
  let dateOfferMeasured = false;
  let scrollFrame = 0;
  let closingOfferVisible = false;

  function updateOfferDock(drop = false) {
    const hideDock = closingOfferVisible || (mobile.matches && !dateOfferPassed);
    const wasHidden = offerDock.hidden;
    offerDock.hidden = hideDock && !offerDock.matches(':focus-within');
    if (offerDock.hidden || !mobile.matches || reduceMotion.matches) offerDock.classList.remove('is-dropping');
    else if (drop && wasHidden) offerDock.classList.add('is-dropping');
  }

  function measureDateOffer() {
    const passed = dateOffer.getBoundingClientRect().bottom <= 0;
    const drop = dateOfferMeasured && !arrivingBelowOffer && !dateOfferPassed && passed && mobile.matches;
    if (passed) arrivingBelowOffer = false;
    dateOfferPassed = passed;
    dateOfferMeasured = true;
    updateOfferDock(drop);
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === closingOffer) closingOfferVisible = entry.intersectionRatio >= 0.99;
    }
    measureDateOffer();
  }, {threshold: [0, 0.99, 1]});
  observer.observe(closingOffer);
  observer.observe(dateOffer);
  updateOfferDock();
  // A fast jump can move the inline button from below to above the viewport without intersecting it.
  window.addEventListener('scroll', () => {
    if (mobile.matches && !scrollFrame) {
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        measureDateOffer();
      });
    }
  }, {passive: true});
  mobile.addEventListener('change', measureDateOffer);
  reduceMotion.addEventListener('change', () => updateOfferDock());
  offerDock.addEventListener('focusout', () => requestAnimationFrame(() => updateOfferDock()));
  offerDock.addEventListener('animationend', event => {
    if (event.animationName === 'offer-drop') offerDock.classList.remove('is-dropping');
  });
}

const photos = [...document.querySelectorAll('.photo-open')];
const photoDialog = document.querySelector('#photo-dialog');
const previewImage = document.querySelector('#photo-preview');
const previewCaption = document.querySelector('#photo-caption');
const viewerCount = photoDialog.querySelector('.viewer-count');
let currentPhoto = 0;

function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const button = photos[currentPhoto];
  const image = button.querySelector('img');
  previewImage.src = image.currentSrc || image.src;
  previewImage.classList.toggle('is-city-print', button.parentElement.classList.contains('city-print'));
  viewerCount.textContent = (currentPhoto + 1) + ' / ' + photos.length;
  previewCaption.textContent = button.dataset.photoTitle || button.nextElementSibling.textContent;
}

function openPhoto(index) {
  showPhoto(index);
  photoDialog.showModal();
}

photos.forEach((button, index) => {
  button.addEventListener('click', () => openPhoto(index));
});

const galleryInvite = document.querySelector('.gallery-invite');
galleryInvite.addEventListener('click', () => {
  galleryInvite.focus({ preventScroll: true });
  openPhoto(0);
});
galleryInvite.hidden = false;
photoDialog.querySelector('.photo-close').addEventListener('click', () => photoDialog.close());
photoDialog.querySelector('.photo-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
photoDialog.querySelector('.photo-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
photoDialog.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
});
