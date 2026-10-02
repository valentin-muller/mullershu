/* Optional adapter contract is documented alongside the Mellow surface brief.
 * With no adapter, this is an explicit demo: no personal data is transmitted or saved. */
(() => {
  'use strict';
  const DAY = 86400000;
  function keyOf(date) { return date.toISOString().slice(0, 10); }
  function dateOf(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const date = new Date(`${key}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && keyOf(date) === key ? date : null;
  }
  function shiftDay(key, count) { return keyOf(new Date(dateOf(key).getTime() + count * DAY)); }
  function monthOf(key) { const date = dateOf(key); return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)); }
  function shiftMonth(date, count) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1)); }
  function gridDays(month) {
    const offset = (month.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
    const count = Math.ceil((offset + days) / 7) * 7;
    return Array.from({length: count}, (_, i) => keyOf(new Date(month.getTime() + (i - offset) * DAY)));
  }
  function budapestToday() {
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Budapest', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const value = type => parts.find(part => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  }
  function validateFields(values) {
    const errors = {};
    if (values.name.trim().length < 2) errors.name = 'Adjátok meg a teljes nevet.';
    if (values.address.trim().length < 8) errors.address = 'Adjátok meg a teljes lakcímet.';
    const digits = values.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15 || !/^[+\d\s()./-]+$/.test(values.phone.trim())) errors.phone = 'Adjátok meg a hívható telefonszámot.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Adjátok meg az e-mail-címet.';
    const guests = Number(values.guests);
    if (!/^\d+$/.test(values.guests) || !Number.isSafeInteger(guests) || guests < 1 || guests > 999) errors.guests = 'Adjátok meg az érkezők számát egész számmal.';
    return errors;
  }
  async function withinDeadline(operation, controller, milliseconds = 20000) {
    let timer;
    let onAbort;
    const aborted = new Promise((resolve, reject) => {
      onAbort = () => { const error = new Error('Request aborted'); error.name = 'AbortError'; reject(error); };
      controller.signal.addEventListener('abort', onAbort, {once:true});
      timer = setTimeout(() => controller.abort(), milliseconds);
    });
    try { return await Promise.race([operation(controller.signal), aborted]); }
    finally { clearTimeout(timer); controller.signal.removeEventListener('abort', onAbort); }
  }
  // Node-only export for date/validation checks; no browser global containing guest data.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {dateOf, shiftDay, monthOf, shiftMonth, gridDays, validateFields, withinDeadline};
    return;
  }
  const section = document.querySelector('.booking-ending');
  if (!section) return;
  const calendar = section.querySelector('.booking-calendar');
  const grid = calendar.querySelector('.booking-days');
  const monthLabel = calendar.querySelector('#booking-month');
  const status = calendar.querySelector('.booking-status');
  const dataNote = section.querySelector('.booking-data-note');
  const previous = calendar.querySelector('[data-month="-1"]');
  const next = calendar.querySelector('[data-month="1"]');
  const retry = calendar.querySelector('.booking-retry');
  const dialog = document.querySelector('#booking-dialog');
  const form = dialog.querySelector('.inquiry-form');
  const resultPanel = dialog.querySelector('.inquiry-result');
  const feedback = dialog.querySelector('.inquiry-feedback');
  const submit = form.querySelector('.inquiry-submit');
  const fields = ['name', 'address', 'phone', 'email', 'guests'];
  const today = budapestToday();
  const firstMonth = monthOf(today);
  const lastMonth = shiftMonth(firstMonth, 11);
  const lastDate = keyOf(new Date(Date.UTC(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth() + 1, 0)));
  const adapter = window.MullersBookingAdapter;
  const demo = !adapter;
  calendar.querySelector('.booking-demo-label').hidden = !demo;
  const hasAdapter = adapter && typeof adapter.loadAvailability === 'function' && typeof adapter.createInquiry === 'function';
  const monthFormat = new Intl.DateTimeFormat('hu-HU', {timeZone:'UTC', year:'numeric', month:'long'});
  const dateFormat = new Intl.DateTimeFormat('hu-HU', {timeZone:'UTC', year:'numeric', month:'long', day:'numeric', weekday:'long'});
  let month = firstMonth;
  let selected = null;
  let activeDay = null;
  let available = new Set();
  let sending = false;
  let loadAttempt = 0;
  let loadController;
  let sendController;
  let sendAttempt = 0;

  function selectable(key) { return key >= today && key <= lastDate && available.has(key); }
  function dayButton(key) { return grid.querySelector(`[data-date="${key}"]`); }
  function focusDay(key) {
    if (grid.querySelector('[tabindex="0"]')) grid.querySelector('[tabindex="0"]').tabIndex = -1;
    const button = dayButton(key);
    if (button && !button.disabled) { activeDay = key; button.tabIndex = 0; button.focus({preventScroll:true}); }
  }
  function render() {
    monthLabel.textContent = monthFormat.format(month);
    grid.setAttribute('aria-label', `${monthLabel.textContent} – választható érkezési napok`);
    previous.disabled = month <= firstMonth;
    next.disabled = month >= lastMonth;
    const keys = gridDays(month);
    const inMonth = key => dateOf(key).getUTCMonth() === month.getUTCMonth();
    const focusKey = [activeDay, selected].find(key => key && inMonth(key) && selectable(key)) || keys.find(key => inMonth(key) && selectable(key));
    const fragment = document.createDocumentFragment();
    for (const key of keys) {
      const date = dateOf(key);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.date = key;
      button.textContent = String(date.getUTCDate());
      button.className = 'booking-day';
      button.disabled = !inMonth(key) || !selectable(key);
      button.tabIndex = key === focusKey ? 0 : -1;
      button.setAttribute('aria-pressed', String(key === selected));
      if (!inMonth(key)) { button.classList.add('is-outside'); button.setAttribute('aria-hidden', 'true'); }
      else if (key < today) button.setAttribute('aria-label', `${dateFormat.format(date)} – elmúlt nap`);
      else {
        const state = selectable(key) ? 'választható érkezés' : 'nem választható';
        button.setAttribute('aria-label', `${dateFormat.format(date)} – ${state}${demo ? ' (minta)' : ''}`);
        if (!selectable(key)) button.classList.add('is-unavailable');
      }
      if (key === today) { button.classList.add('is-today'); button.setAttribute('aria-current', 'date'); }
      fragment.append(button);
    }
    grid.replaceChildren(fragment);
  }
  function monthChange(count, focus = false) {
    const target = shiftMonth(month, count);
    if (target < firstMonth || target > lastMonth) return;
    month = target;
    activeDay = null;
    render();
    if (focus) grid.querySelector('[tabindex="0"]')?.focus({preventScroll:true});
  }
  function openInquiry(key) {
    if (!selectable(key)) return;
    selected = key;
    activeDay = key;
    render();
    dialog.querySelector('.inquiry-date-label').textContent = `Érkezés: ${dateFormat.format(dateOf(key))}`;
    dialog.querySelector('.inquiry-demo-note').hidden = !demo;
    submit.querySelector('span').textContent = demo ? 'Űrlap kipróbálása' : 'Érdeklődés küldése';
    document.documentElement.classList.add('booking-modal-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    // Focus the title first, avoiding an unsolicited iPhone keyboard on opening.
    dialog.querySelector('h2').focus({preventScroll:true});
  }
  async function load() {
    const attempt = ++loadAttempt;
    loadController?.abort();
    loadController = new AbortController();
    calendar.classList.add('is-unavailable');
    calendar.setAttribute('aria-busy', 'true');
    retry.hidden = true;
    section.querySelector('.booking-no-script').hidden = true;
    previous.disabled = next.disabled = true;
    status.textContent = demo ? '' : 'Az elérhető érkezési napok betöltése…';
    dataNote.textContent = demo ? 'Minta naptár. A jelölt napok nem valós elérhetőségek; az érdeklődést még nem továbbítjuk.' : 'A dátumválasztás érdeklődés. A foglalást személyes egyeztetés után véglegesítjük.';
    try {
      if (demo) {
        available = new Set();
        for (let key = today; key <= lastDate; key = shiftDay(key, 1)) {
          if (![9, 10, 23, 24].includes(dateOf(key).getUTCDate())) available.add(key);
        }
      } else {
        if (!hasAdapter) throw new Error('Incomplete booking adapter');
        const data = await withinDeadline(signal => adapter.loadAvailability({from:today, to:lastDate, signal}), loadController);
        if (attempt !== loadAttempt) return;
        if (!Array.isArray(data?.availableArrivalDates)) throw new Error('Invalid availability response');
        if (data.availableArrivalDates.some(key => typeof key !== 'string' || !dateOf(key))) throw new Error('Invalid arrival date');
        available = new Set(data.availableArrivalDates.filter(key => key >= today && key <= lastDate));
      }
      calendar.classList.remove('is-unavailable');
      status.textContent = available.size ? '' : 'Jelenleg nincs választható érkezési nap. Keressetek bennünket telefonon, és egyeztetünk veletek.';
      section.querySelector('.booking-no-script').hidden = available.size > 0;
      render();
    } catch (error) {
      if (attempt !== loadAttempt) return;
      available.clear();
      section.querySelector('.booking-no-script').hidden = false;
      status.textContent = 'Az elérhetőségeket most nem tudtuk betölteni. Próbáljátok újra, vagy keressetek bennünket telefonon.';
      retry.hidden = false;
    } finally {
      if (attempt === loadAttempt) calendar.setAttribute('aria-busy', 'false');
    }
  }
  function clearErrors() {
    fields.forEach(name => {
      form.elements[name].removeAttribute('aria-invalid');
      dialog.querySelector(`#inquiry-error-${name}`).textContent = '';
    });
    feedback.textContent = '';
  }
  function showErrors(errors) {
    fields.forEach(name => {
      if (errors[name]) {
        form.elements[name].setAttribute('aria-invalid', 'true');
        dialog.querySelector(`#inquiry-error-${name}`).textContent = errors[name];
      }
    });
    const first = fields.find(name => errors[name]);
    if (first) form.elements[first].focus();
  }
  async function send(event) {
    event.preventDefault();
    if (sending) return;
    clearErrors();
    const values = Object.fromEntries(fields.map(name => [name, String(form.elements[name].value).trim()]));
    const errors = validateFields(values);
    if (!form.elements.email.validity.valid) errors.email = 'Ellenőrizzétek az e-mail-címet.';
    if (Object.keys(errors).length) { showErrors(errors); return; }
    if (!selected || !selectable(selected)) { feedback.textContent = 'Válasszatok egy elérhető érkezési napot a naptárban.'; return; }
    const payload = {arrivalDate:selected, fullName:values.name, address:values.address, phone:values.phone, email:values.email, guests:Number(values.guests), source:'mullers2-mellow'};
    if (demo) {
      // Validate the complete flow without sending or persisting personal details.
      form.reset();
      form.hidden = true;
      resultPanel.hidden = false;
      resultPanel.querySelector('h3').textContent = 'Az adatlap rendben van.';
      resultPanel.querySelector('p').textContent = 'Ez még bemutató: az adatokat nem küldtük el és nem tároltuk. A kész változatban innen érkezik majd hozzánk az érdeklődés.';
      resultPanel.querySelector('h3').focus({preventScroll:true});
      resultPanel.scrollIntoView({block:'nearest', behavior:'instant'});
      return;
    }
    sending = true;
    submit.disabled = true;
    submit.querySelector('span').textContent = 'Érdeklődés küldése…';
    const attempt = ++sendAttempt;
    sendController = new AbortController();
    try {
      const response = await withinDeadline(signal => adapter.createInquiry(payload, {signal}), sendController);
      if (attempt !== sendAttempt || !dialog.open) return;
      if (!response || typeof response.inquiryId !== 'string' || !response.inquiryId) throw new Error('No inquiry acknowledgement');
      form.reset();
      form.hidden = true;
      resultPanel.hidden = false;
      resultPanel.querySelector('h3').textContent = 'Köszönjük az érdeklődéseteket.';
      resultPanel.querySelector('p').textContent = 'Megkaptuk az adatokat. Személyesen felvesszük veletek a kapcsolatot, és egyeztetjük a hétvégétek részleteit. A foglalás még nem végleges.';
      resultPanel.querySelector('h3').focus({preventScroll:true});
      resultPanel.scrollIntoView({block:'nearest', behavior:'instant'});
    } catch (error) {
      if (attempt !== sendAttempt || !dialog.open) return;
      feedback.textContent = 'Nem tudtuk megerősíteni az érdeklődés fogadását. Az adataitok itt maradtak; próbáljátok újra, vagy keressetek bennünket telefonon.';
    } finally {
      if (attempt === sendAttempt) {
        sending = false;
        submit.disabled = false;
        submit.querySelector('span').textContent = 'Érdeklődés küldése';
      }
    }
  }
  calendar.hidden = false;
  section.querySelector('.booking-no-script').hidden = true;
  if (typeof dialog.showModal !== 'function') {
    calendar.hidden = true;
    section.querySelector('.booking-no-script').hidden = false;
    return;
  }
  previous.addEventListener('click', () => monthChange(-1));
  next.addEventListener('click', () => monthChange(1));
  retry.addEventListener('click', load);
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-date]');
    if (button && !button.disabled) openInquiry(button.dataset.date);
  });
  grid.addEventListener('keydown', event => {
    const button = event.target.closest('[data-date]');
    if (!button || button.disabled) return;
    const key = button.dataset.date;
    const weekday = (dateOf(key).getUTCDay() + 6) % 7;
    const offsets = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7, Home:-weekday, End:6-weekday};
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      monthChange(event.key === 'PageUp' ? -1 : 1, true);
    } else if (Object.hasOwn(offsets, event.key)) {
      event.preventDefault();
      let target = shiftDay(key, offsets[event.key]);
      const direction = offsets[event.key] < 0 ? -1 : 1;
      while (target >= today && target <= lastDate && !selectable(target)) target = shiftDay(target, direction);
      if (!selectable(target)) return;
      const targetMonth = monthOf(target);
      if (targetMonth.getTime() !== month.getTime()) { month = targetMonth; activeDay = target; render(); }
      focusDay(target);
    }
  });
  dialog.querySelector('.booking-close').addEventListener('click', () => dialog.close());
  resultPanel.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    ++sendAttempt;
    sendController?.abort();
    sending = false;
    submit.disabled = false;
    form.reset();
    form.hidden = false;
    resultPanel.hidden = true;
    clearErrors();
    document.documentElement.classList.remove('booking-modal-open');
    if (selected) focusDay(selected);
  });
  form.addEventListener('submit', send);
  load();
})();
