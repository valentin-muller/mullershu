/* Inquiry dates are requests, not a live inventory or confirmed reservation. */
(() => {
  'use strict';
  const endpoint = '/api/mellow-inquiry';
  let token;
  async function settings(signal) {
    const response = await fetch(endpoint, {signal, cache:'no-store', credentials:'same-origin'});
    if (!response.ok) throw new Error('Inquiry service unavailable');
    const data = await response.json();
    token = data.token;
    return data;
  }
  window.MullersBookingAdapter = {
    prepareInquiry: settings,
    async loadAvailability({from, to, signal}) {
      const config = await settings(signal);
      const dates = [];
      for (let date = new Date(`${from}T00:00:00Z`); date.toISOString().slice(0,10) <= to; date.setUTCDate(date.getUTCDate() + 1)) dates.push(date.toISOString().slice(0,10));
      return {availableArrivalDates:dates.slice(0,-1), availableNights:dates, enabled:config.enabled};
    },
    async createInquiry(payload, {signal}) {
      const response = await fetch(endpoint, {method:'POST', signal, credentials:'same-origin',
        headers:{'Content-Type':'application/json'}, body:JSON.stringify({...payload, token})});
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || 'Nem sikerült a küldés. Próbáljátok újra később.');
        error.fields = data.fields;
        throw error;
      }
      return data;
    }
  };
})();
