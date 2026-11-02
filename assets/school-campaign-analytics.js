(() => {
  if (window.__mullersSchoolCampaignAnalytics) return;
  window.__mullersSchoolCampaignAnalytics = true;
  const CONSENT_KEY = 'mullers_cookie_consent_v1';
  const CONTEXT_KEY = 'mullers_school_campaign_v1';
  // Existing Google tag in the published GTM-MF6W4DVF container.
  const MEASUREMENT_ID = 'G-HLJ3B6551Z';
  const PATHS = ['/blog/osztalykirandulas/', '/blog/programajanlo/'];
  const pagePath = window.location.pathname.replace(/index\.html$/, '');
  if (!PATHS.includes(pagePath)) return;
  const pageKind = pagePath === PATHS[0] ? 'offer' : 'program';
  const consented = () => {
    try { return window.localStorage.getItem(CONSENT_KEY) === 'accepted'; }
    catch { return false; }
  };
  const validContext = (value) => value && value.utm_source === 'mullers'
    && value.utm_medium === 'email' && value.utm_campaign === 'osztalykirandulas_2027'
    && /^sc27_b\d{2}_\d{2,4}$/.test(value.utm_id ?? '')
    && /^v[1-9]\d*_(offer|program)$/.test(value.utm_content ?? '');
  const context = () => {
    if (!consented()) return null;
    const query = new URL(window.location.href).searchParams;
    const candidate = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content'].map(key => [key, query.get(key)]));
    if (validContext(candidate)) return candidate;
    // An explicit, invalid/new campaign must not inherit another school's attribution.
    if (['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content'].some(key => query.has(key))) return null;
    try { const saved = JSON.parse(window.sessionStorage.getItem(CONTEXT_KEY)); return validContext(saved) ? saved : null; }
    catch { return null; }
  };
  const clarity = (...args) => {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    window.clarity(...args);
  };
  const prepareContext = () => {
    if (!consented()) return;
    const campaign = context();
    clarity('set', 'school_page', pageKind);
    if (!campaign) {
      try { window.sessionStorage.removeItem(CONTEXT_KEY); }
      catch { /* Invalid attribution is ignored even when storage is unavailable. */ }
      return;
    }
    try { window.sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(campaign)); }
    catch { /* URL attribution still works without session storage. */ }
    clarity('set', 'school_campaign', campaign.utm_campaign);
    clarity('set', 'school_message', campaign.utm_id);
    clarity('set', 'school_copy', campaign.utm_content);
    document.querySelectorAll('a[href]').forEach(link => {
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || !PATHS.includes(target.pathname.replace(/index\.html$/, ''))) return;
      for (const [key, value] of Object.entries(campaign)) target.searchParams.set(key, value);
      link.href = target.toString();
    });
  };
  const emit = (name) => {
    if (!consented()) return;
    const campaign = context();
    const parameters = { send_to: MEASUREMENT_ID, school_page: pageKind, transport_type: 'beacon' };
    if (campaign) {
      parameters.campaign_id = campaign.utm_id;
      parameters.campaign_name = campaign.utm_campaign;
      parameters.campaign_source = campaign.utm_source;
      parameters.campaign_medium = campaign.utm_medium;
      parameters.campaign_content = campaign.utm_content;
    }
    // Use the existing Google tag; never inject another tracker or send before consent.
    if (typeof window.gtag === 'function') window.gtag('event', name, parameters);
    else {
      window.dataLayer = window.dataLayer || [];
      (function () { window.dataLayer.push(arguments); })('event', name, parameters);
    }
    clarity('event', name);
  };
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-consent-decline], [data-consent-reset]')) {
      try { window.sessionStorage.removeItem(CONTEXT_KEY); }
      catch { /* No tracking is permitted without the current consent either way. */ }
      return;
    }
    if (event.target.closest('[data-consent-accept]')) { prepareContext(); return; }
    const link = event.target.closest('a[href]');
    if (!link || !consented()) return;
    prepareContext();
    const target = new URL(link.href, window.location.href);
    if (target.protocol === 'tel:') emit('school_phone_click');
    else if (target.protocol === 'mailto:') emit('school_email_click');
    else if (target.origin === window.location.origin) {
      const path = target.pathname.replace(/index\.html$/, '');
      if (path === PATHS[1]) emit('school_program_click');
      else if (path === PATHS[0]) emit('school_offer_click');
      else if (/\.pdf$/i.test(path)) emit('school_pdf_download');
    }
  });
  prepareContext();
})();
