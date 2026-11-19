(() => {
  'use strict';

  const picker = document.querySelector('#idopont');
  const dialog = document.querySelector('#stay-dates');
  if (typeof dialog.showModal !== 'function') return;

  const {arrivalDate, departureDate, guests} = picker.elements;
  const heading = dialog.querySelector('h2');
  const modes = [...dialog.querySelectorAll('[data-field]')];
  const prev = dialog.querySelector('[data-month="-1"]');
  const next = dialog.querySelector('[data-month="1"]');
  const monthLabel = dialog.querySelector('.stay-date-month p');
  const days = dialog.querySelector('.stay-date-days');
  const monthFormat = new Intl.DateTimeFormat('hu-HU', {month:'long', year:'numeric', timeZone:'UTC'});
  const fullDate = new Intl.DateTimeFormat('hu-HU', {dateStyle:'full', timeZone:'UTC'});
  const shortDate = new Intl.DateTimeFormat('hu-HU', {month:'short', day:'numeric', timeZone:'UTC'});
  const dayMs = 86400000;
  const dateOf = key => new Date(key + 'T00:00:00Z');
  const dateKey = date => date.toISOString().slice(0, 10);
  const monthOf = key => key.slice(0, 7) + '-01';
  const monthShift = (month, amount) => {
    const date = dateOf(month);
    date.setUTCMonth(date.getUTCMonth() + amount);
    return dateKey(date);
  };

  let field;
  let month;

  function render(focusKey) {
    heading.textContent = field === arrivalDate ? 'Válassz érkezési napot' : 'Válassz távozási napot';
    for (const button of modes) {
      const input = picker.elements[button.dataset.field];
      button.setAttribute('aria-pressed', String(input === field));
      button.disabled = input === departureDate && !arrivalDate.validity.valid;
      button.querySelector('span').textContent = input.value ? shortDate.format(dateOf(input.value)) : '';
    }
    prev.disabled = month <= monthOf(field.min);
    next.disabled = month >= monthOf(field.max);
    const start = dateOf(month);
    monthLabel.textContent = monthFormat.format(start);
    const cells = document.createDocumentFragment();
    const offset = (start.getUTCDay() + 6) % 7;
    const count = dateOf(monthShift(month, 1)).getTime() - start.getTime();
    const focusDate = focusKey || (monthOf(field.value) === month ? field.value : '');
    let active;
    let firstAvailable;
    for (let index = -offset; index < count / dayMs; index++) {
      if (index < 0) {
        const gap = document.createElement('span');
        gap.setAttribute('aria-hidden','true');
        cells.append(gap);
        continue;
      }
      const date = new Date(start.getTime() + index * dayMs);
      const key = dateKey(date);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.dataset.date = key;
      cell.textContent = date.getUTCDate();
      cell.disabled = key < field.min || key > field.max;
      cell.tabIndex = -1;
      cell.setAttribute('aria-label', fullDate.format(date));
      cell.setAttribute('aria-pressed', String(key === field.value));
      if (!cell.disabled) {
        firstAvailable ||= cell;
        if (key === focusDate) active = cell;
      }
      cells.append(cell);
    }
    active ||= firstAvailable;
    active.tabIndex = 0;
    days.replaceChildren(cells);
    return active;
  }

  function selectField(input) {
    field = input;
    month = monthOf(field.validity.valid ? field.value : field.min);
    return render();
  }

  for (const link of document.querySelectorAll('a[href="#idopont"]')) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const active = selectField(arrivalDate.validity.valid ? departureDate : arrivalDate);
      link.focus({preventScroll:true});
      dialog.showModal();
      active.focus({preventScroll:true});
    });
  }
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  for (const button of modes) {
    button.addEventListener('click', () => selectField(picker.elements[button.dataset.field]).focus({preventScroll:true}));
  }
  for (const button of [prev, next]) {
    button.addEventListener('click', () => {
      month = monthShift(month, Number(button.dataset.month));
      const active = render();
      if (button.disabled) active.focus({preventScroll:true});
    });
  }
  days.addEventListener('click', event => {
    const cell = event.target.closest('button[data-date]');
    if (!cell || cell.disabled) return;
    field.value = cell.dataset.date;
    field.dispatchEvent(new Event('input', {bubbles:true}));
    if (field === arrivalDate) {
      selectField(departureDate).focus({preventScroll:true});
      return;
    }
    dialog.close();
    picker.scrollIntoView({block:'center',behavior:'instant'});
    guests.focus({preventScroll:true});
  });
  days.addEventListener('keydown', event => {
    const delta = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7}[event.key];
    if (!delta || !event.target.dataset.date) return;
    event.preventDefault();
    const key = dateKey(new Date(+dateOf(event.target.dataset.date) + delta * dayMs));
    if (key < field.min || key > field.max) return;
    month = monthOf(key);
    render(key).focus({preventScroll:true});
  });
})();
