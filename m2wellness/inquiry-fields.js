(function () {
  'use strict';

  // The browser form and the private-house endpoint accept the same contact details.
  function isNamePart(value) {
    return typeof value === 'string' && value.length <= 60 &&
      /^\p{L}[\p{L}\p{M}]*(?:(?:[. '\u2019\u02bc-]+)[\p{L}\p{M}]+)*\.?$/u.test(value);
  }

  const phoneError = 'Magyar mobilszámot adj meg, például +36301234567 vagy 06301234567.';
  function isPhone(value) {
    return typeof value === 'string' && value.length <= 40 &&
      /^(?:06|\+36)(?:20|30|31|50|70)\d{7}$/.test(value.replace(/[ \u00a0\u202f]/g, ''));
  }

  function isEmail(value) {
    if (typeof value !== 'string' || value.length > 254) return false;
    const parts = value.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || local.length > 64 || !/^[a-z\d.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) ||
        local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    const labels = domain.split('.');
    return labels.length > 1 && labels.every(label => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label)) &&
      /^(?:[a-z]{2,63}|xn--[a-z\d-]+)$/i.test(labels[labels.length - 1]);
  }

  const fields = {isNamePart, isPhone, isEmail, phoneError};
  if (typeof module !== 'undefined' && module.exports) module.exports = fields;
  else window.MullersInquiryFields = fields;
}());
