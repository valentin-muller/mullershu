(function () {
  'use strict';

  // The browser form and the private-house endpoint accept the same contact details.
  function isNamePart(value) {
    return typeof value === 'string' && value.length <= 60 &&
      /^\p{L}[\p{L}\p{M}]*(?:(?:[. '\u2019\u02bc-]+)[\p{L}\p{M}]+)*\.?$/u.test(value);
  }

  function isPhone(value) {
    if (typeof value !== 'string' || value.length > 40 || !/^\+?[\d(][\d ()./-]*\d$/.test(value)) return false;
    const digits = value.replace(/\D/g, '').replace(/^00/, '');
    if (digits.length < 7 || digits.length > 15) return false;
    const international = value.startsWith('+') || value.startsWith('00');
    const hungarian = international ? digits.startsWith('36') : digits.startsWith('06');
    return !hungarian || (digits.length >= 10 && digits.length <= 11);
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

  const fields = {isNamePart, isPhone, isEmail};
  if (typeof module !== 'undefined' && module.exports) module.exports = fields;
  else window.MullersInquiryFields = fields;
}());
