(() => {
  'use strict';
  const picker = document.querySelector('#idopont');
  const dialog = document.querySelector('#inquiry');
  const details = dialog.querySelector('#details');
  const contact = dialog.querySelector('#contact-step');
  const success = dialog.querySelector('#success');
  const close = dialog.querySelector('.close');
  const send = details.querySelector('[type="submit"]');
  const fallback = details.querySelector('.fallback');
  const error = details.querySelector('.error');
  const status = details.querySelector('.mail-status');
  const arrival = picker.elements.arrivalDate;
  const departure = picker.elements.departureDate;
  const endpoint = '/api/mellow-inquiry';
  const fields = window.MullersInquiryFields;
  const validators = {
    familyName: [fields.isNamePart, 'Adj meg érvényes vezetéknevet.'],
    givenName: [fields.isNamePart, 'Adj meg érvényes keresztnevet.'],
    phone: [fields.isPhone, fields.phoneError],
    email: [fields.isEmail, 'Adj meg teljes e-mail-címet, például nev@pelda.hu.']
  };
  let session;
  let sessionStarted = 0;
  let unavailable = false;
  let pending = false;
  let lastPayload;
  let requestId;

  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Budapest'}).format(new Date());
  const first = new Date(today + 'T00:00:00Z');
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 12, 0));
  const day = 86400000;
  function dateKey(ms) { return new Date(ms).toISOString().slice(0, 10); }
  arrival.min = today;
  arrival.max = dateKey(+last - day);
  departure.max = dateKey(last);
  function updateDeparture() {
    const earliestArrival = arrival.validity.valid ? arrival.value : today;
    departure.min = dateKey(Date.parse(earliestArrival + 'T00:00:00Z') + day);
    if (departure.value && departure.value < departure.min) departure.value = '';
  }
  updateDeparture();
  arrival.addEventListener('input', updateDeparture);

  function showMessage(element, text) {
    element.textContent = text;
    element.hidden = !text;
  }
  function resetFallback() {
    fallback.hidden = true;
    fallback.removeAttribute('href');
    showMessage(error, '');
  }
  function validate(input) {
    const rule = validators[input.name];
    if (rule) input.setCustomValidity(!input.value || rule[0](input.value.trim()) ? '' : rule[1]);
  }
  details.addEventListener('input', event => {
    validate(event.target);
    resetFallback();
  });
  const offlineNote = 'Az ajánlatkérést most a saját leveleződből tudod elküldeni. Előkészítjük hozzá a levelet.';
  function updateChannel() {
    if (pending) return;
    send.textContent = unavailable ? 'E-mail előkészítése' : 'Ajánlatkérés elküldése';
    showMessage(status, unavailable ? offlineNote : '');
  }
  function prepareSession() {
    if (!session || Date.now() - sessionStarted > 3300000) {
      sessionStarted = Date.now();
      session = fetch(endpoint, {cache:'no-store', signal:AbortSignal.timeout(12000)})
        .then(async response => {
          if (!response.ok) throw new Error();
          const config = await response.json();
          return config.enabled && config.token ? {token:config.token, ready:Date.now() + 2100} : null;
        }).catch(() => null).then(config => {
          unavailable = !config;
          updateChannel();
          return config;
        });
    }
    return session;
  }
  picker.addEventListener('focusin', prepareSession);
  picker.addEventListener('submit', event => {
    event.preventDefault();
    if (!picker.reportValidity()) return;
    if (unavailable) session = null;
    prepareSession();
    const fmt = new Intl.DateTimeFormat('hu-HU', {dateStyle:'medium', timeZone:'UTC'});
    dialog.querySelector('.summary').textContent = fmt.format(arrival.valueAsDate) + ' – ' +
      fmt.format(departure.valueAsDate) + ' · ' + picker.elements.guests.value + ' fő';
    resetFallback();
    updateChannel();
    contact.hidden = false;
    success.hidden = true;
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    dialog.showModal();
    details.elements.familyName.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.querySelector('.done').addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => { if (pending) event.preventDefault(); });
  dialog.addEventListener('close', () => picker.querySelector('button').focus({preventScroll:true}));

  function offerEmail(data) {
    const body = ['Sziasztok!', '', 'Szeretnék ajánlatot kérni a teljes Müller’s 2 apartmanházra.',
      '', 'Érkezés: ' + data.arrivalDate, 'Távozás: ' + data.departureDate, 'Létszám: ' + data.guests + ' fő',
      '', 'Név: ' + data.familyName + ' ' + data.givenName, 'Telefonszám: ' + data.phone, 'E-mail: ' + data.email].join('\r\n');
    fallback.href = 'mailto:mullers106@gmail.com?subject=' + encodeURIComponent('Müller’s 2 – ajánlatkérés') +
      '&body=' + encodeURIComponent(body);
    fallback.hidden = false;
    fallback.focus();
  }
  details.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    for (const name of Object.keys(validators)) validate(details.elements[name]);
    if (!details.reportValidity()) return;
    resetFallback();
    if (details.elements.website.value) {
      showMessage(error, 'Az adatlap lejárt. Nyisd meg újra az ajánlatkérőt.');
      return;
    }
    const data = {...Object.fromEntries(new FormData(picker)), ...Object.fromEntries(new FormData(details)),
      source:'mullers2-privat', intent:'offer'};
    data.guests = Number(data.guests);
    for (const name of Object.keys(validators)) data[name] = data[name].trim();
    const signature = JSON.stringify(data);
    if (lastPayload !== signature) {
      requestId = crypto.randomUUID();
      lastPayload = signature;
    }
    pending = true;
    close.disabled = send.disabled = true;
    for (const name of Object.keys(validators)) details.elements[name].readOnly = true;
    send.textContent = unavailable ? 'E-mail előkészítése…' : 'Küldés…';
    try {
      const config = await prepareSession();
      if (!config) { offerEmail(data); return; }
      const wait = config.ready - Date.now();
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...data, requestId, token:config.token}), signal:AbortSignal.timeout(25000)});
      const result = await response.json();
      if (!response.ok || result.inquiryId !== requestId) {
        if (response.status === 400) session = null;
        if (response.status === 503) { unavailable = true; session = null; }
        showMessage(error, Object.values(result.fields || {})[0] || result.error || 'A küldést nem sikerült megerősíteni.');
        if (response.status !== 422) offerEmail(data);
        return;
      }
      contact.hidden = true;
      success.hidden = false;
      dialog.setAttribute('aria-labelledby', 'success-title');
      dialog.querySelector('#success-title').focus();
      picker.reset();
      updateDeparture();
      details.reset();
      resetFallback();
      dialog.querySelector('.summary').textContent = '';
      lastPayload = null;
      requestId = null;
    } catch {
      showMessage(error, 'A küldést nem sikerült megerősíteni. Próbáld újra, vagy küldd el az ajánlatkérést e-mailben.');
      offerEmail(data);
    } finally {
      pending = false;
      close.disabled = send.disabled = false;
      for (const name of Object.keys(validators)) details.elements[name].readOnly = false;
      updateChannel();
    }
  });
})();
