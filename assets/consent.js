(() => {
  const CONSENT_KEY = "mullers_cookie_consent_v1";
  const CONSENT_ACCEPTED = "accepted";
  const CONSENT_DECLINED = "declined";
  const BANNER_ID = "consent-banner";
  const GTM_ID = "GTM-MF6W4DVF";

  const storage = {
    get() {
      try {
        return window.localStorage.getItem(CONSENT_KEY);
      } catch (error) {
        return null;
      }
    },
    set(value) {
      try {
        window.localStorage.setItem(CONSENT_KEY, value);
      } catch (error) {
        // Ignore storage failures.
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(CONSENT_KEY);
      } catch (error) {
        // Ignore storage failures.
      }
    },
  };

  const loadGtm = () => {
    if (window.__mullersGtmLoaded) {
      return;
    }
    window.__mullersGtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

    const script = document.createElement("script");
    script.async = true;
    script.id = "mullers-gtm";
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    const head = document.head || document.getElementsByTagName("head")[0];
    head.appendChild(script);
  };

  const resolveStatusLabel = (status) => {
    if (status === CONSENT_ACCEPTED) {
      return "Elfogadva";
    }
    if (status === CONSENT_DECLINED) {
      return "Elutasítva";
    }
    return "Nincs megadva";
  };

  const updateStatusLabels = (status) => {
    const label = resolveStatusLabel(status);
    document.querySelectorAll("[data-consent-status]").forEach((el) => {
      el.textContent = label;
    });
  };

  const hideBanner = () => {
    const banner = document.getElementById(BANNER_ID);
    if (banner) {
      banner.hidden = true;
    }
  };

  const showBanner = () => {
    const banner = ensureBanner();
    banner.hidden = false;
  };

  const acceptConsent = () => {
    storage.set(CONSENT_ACCEPTED);
    updateStatusLabels(CONSENT_ACCEPTED);
    hideBanner();
    loadGtm();
  };

  const declineConsent = () => {
    storage.set(CONSENT_DECLINED);
    updateStatusLabels(CONSENT_DECLINED);
    hideBanner();
  };

  const resetConsent = () => {
    storage.clear();
    updateStatusLabels(null);
    showBanner();
  };

  const bindControls = (root) => {
    root.querySelectorAll("[data-consent-accept]").forEach((btn) => {
      if (btn.dataset.consentBound) {
        return;
      }
      btn.dataset.consentBound = "true";
      btn.addEventListener("click", acceptConsent);
    });

    root.querySelectorAll("[data-consent-decline]").forEach((btn) => {
      if (btn.dataset.consentBound) {
        return;
      }
      btn.dataset.consentBound = "true";
      btn.addEventListener("click", declineConsent);
    });

    root.querySelectorAll("[data-consent-reset]").forEach((btn) => {
      if (btn.dataset.consentBound) {
        return;
      }
      btn.dataset.consentBound = "true";
      btn.addEventListener("click", resetConsent);
    });
  };

  const ensureBanner = () => {
    let banner = document.getElementById(BANNER_ID);
    if (banner) {
      return banner;
    }

    banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = `
      <div class="consent-banner__inner">
        <p class="consent-banner__text">
          Segítesz, hogy jobb legyen az oldal? Statisztikai sütiket használunk (GA4, Clarity).
          Nem adunk el adatot!
          <a href="/cookie.html">Sütikezelési tájékoztató</a>
        </p>
        <div class="consent-banner__actions">
          <button type="button" class="consent-btn consent-btn--primary" data-consent-accept>Elfogadom</button>
          <button type="button" class="consent-btn" data-consent-decline>Elutasítom</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    bindControls(banner);
    return banner;
  };

  const init = () => {
    const currentStatus = storage.get();
    updateStatusLabels(currentStatus);
    bindControls(document);

    if (currentStatus === CONSENT_ACCEPTED) {
      loadGtm();
      return;
    }

    if (currentStatus !== CONSENT_DECLINED) {
      showBanner();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
