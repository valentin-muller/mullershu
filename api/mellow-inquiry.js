'use strict';

const {createHmac, timingSafeEqual, randomUUID} = require('node:crypto');
const nodemailer = require('nodemailer');
const MAILBOX = 'mullers106@gmail.com';
const ORIGINS = new Set([
  'https://www.mullerssiofok.hu', 'https://mullerssiofok.hu',
  'https://www.xn--mllers-3ya.hu', 'https://xn--mllers-3ya.hu',
  'https://mullershotelsiofok.hu', 'https://www.mullershotelsiofok.hu'
]);
const DAY = 86400000;
const safeText = value => typeof value === 'string' && !/[\u0000-\u001f\u007f]/.test(value);
function dateOf(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(+date) && date.toISOString().slice(0, 10) === value ? date : null;
}
function todayKey(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Budapest', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date(now));
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}
function validateInquiry(body, now) {
  const errors = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {errors:{form:'Hiányos adatlap.'}};
  const values = {};
  for (const field of ['fullName', 'address', 'phone', 'email']) {
    values[field] = typeof body[field] === 'string' ? body[field].trim() : '';
  }
  if (!safeText(values.fullName) || values.fullName.length < 2 || values.fullName.length > 120) errors.name = 'Adjátok meg a teljes nevet.';
  if (!values.address || values.address.length < 8 || values.address.length > 300 || /[\u0000-\u0009\u000b-\u001f\u007f]/.test(values.address)) errors.address = 'Adjátok meg a teljes lakcímet.';
  const digits = values.phone.replace(/\D/g, '');
  if (!safeText(values.phone) || values.phone.length > 40 || digits.length < 7 || digits.length > 15 || !/^[+\d ()./-]+$/.test(values.phone)) errors.phone = 'Adjátok meg a hívható telefonszámot.';
  if (!safeText(values.email) || values.email.length > 254 || !/^[^\s@<>(),;:\\"]+@[^\s@<>(),;:\\"]+\.[^\s@<>(),;:\\"]+$/.test(values.email)) errors.email = 'Adjátok meg az e-mail-címet.';
  if (!Number.isSafeInteger(body.guests) || body.guests < 1 || body.guests > 999) errors.guests = 'Adjátok meg az érkezők számát egész számmal.';
  const arrival = dateOf(body.arrivalDate);
  const departure = dateOf(body.departureDate);
  const today = todayKey(now);
  const first = dateOf(today);
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 12, 0)).toISOString().slice(0, 10);
  if (!arrival || !departure || body.arrivalDate < today || body.departureDate > last || departure <= arrival) errors.dates = 'Válasszatok érvényes érkezési és távozási dátumot.';
  if (body.source !== 'mullers2-mellow' || typeof body.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)) errors.form = 'Nyissátok meg újra az adatlapot.';
  return {errors, values:{...values, guests:body.guests, arrivalDate:body.arrivalDate, departureDate:body.departureDate, requestId:body.requestId}};
}
function makeMail(values) {
  const format = key => new Intl.DateTimeFormat('hu-HU', {timeZone:'UTC', year:'numeric', month:'long', day:'numeric'}).format(dateOf(key));
  const nights = (dateOf(values.departureDate) - dateOf(values.arrivalDate)) / DAY;
  return {
    from:{name:"Müller's 2 – webes érdeklődés", address:MAILBOX}, to:MAILBOX,
    replyTo:{name:values.fullName, address:values.email},
    subject:`Müller's 2 érdeklődés – ${values.arrivalDate} → ${values.departureDate} – ${values.guests} fő`,
    messageId:`<mellow-${values.requestId}@mullerssiofok.hu>`,
    text:["Új érdeklődés a Müller's 2 weboldaláról.", '',
      `Érkezés: ${format(values.arrivalDate)}`, `Távozás: ${format(values.departureDate)}`,
      `Éjszakák: ${nights}`, `Létszám: ${values.guests} fő`, '',
      `Teljes név: ${values.fullName}`, `Lakcím: ${values.address}`,
      `Telefonszám: ${values.phone}`, `E-mail-cím: ${values.email}`, '',
      'Ez érdeklődés, nem végleges foglalás. Az időpont és a részletek manuális egyeztetésre várnak.',
      'A levélre válaszolva közvetlenül a vendéget éritek el.', `Azonosító: ${values.requestId}`].join('\n'),
    disableFileAccess:true, disableUrlAccess:true
  };
}
function createHandler({env=process.env, now=Date.now, transportFactory=options => nodemailer.createTransport(options)} = {}) {
  // Best-effort warm-instance protection only; production firewall rate limits remain necessary.
  const rate = new Map();
  const submissions = new Map();
  function password() { return (env.GMAIL_APP_PASSWORD || '').replace(/\s/g, ''); }
  function signature(value) { return createHmac('sha256', password()).update(value).digest('hex'); }
  function token() { const data = `${now()}.${randomUUID()}`; return `${data}.${signature(data)}`; }
  function validToken(value) {
    if (typeof value !== 'string' || value.length > 160) return false;
    const match = /^(\d{13})\.([0-9a-f-]{36})\.([0-9a-f]{64})$/.exec(value);
    if (!match) return false;
    const age = now() - Number(match[1]);
    return age >= 2000 && age < 3600000 && timingSafeEqual(Buffer.from(match[3]), Buffer.from(signature(`${match[1]}.${match[2]}`)));
  }
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const reply = (status, data) => res.status(status).json(data);
    const enabled = /^[a-z]{16}$/i.test(password());
    if (req.method === 'GET') return reply(200, {enabled, ...(enabled ? {token:token()} : {})});
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(405, {error:'Nem támogatott kérés.'}); }
    let origin;
    try { origin = new URL(req.headers.origin).origin; } catch { return reply(403, {error:'Nyissátok meg az adatlapot a weboldalon.'}); }
    const preview = env.VERCEL_ENV === 'preview' && env.VERCEL_URL && origin === `https://${env.VERCEL_URL}`;
    const local = !env.VERCEL && ['http://127.0.0.1:8003', 'http://localhost:8003'].includes(origin);
    if ((!ORIGINS.has(origin) && !preview && !local) || req.headers['sec-fetch-site'] === 'cross-site') return reply(403, {error:'Nyissátok meg az adatlapot a weboldalon.'});
    if (!enabled) return reply(503, {error:'Az online küldés még nem elérhető. Keressetek bennünket telefonon vagy e-mailben.'});
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reply(415, {error:'Érvénytelen adatlap.'});
    let body = req.body;
    if (Number(req.headers['content-length'] || 0) > 8192) return reply(413, {error:'Túl hosszú adatlap.'});
    try {
      if (typeof body === 'string' || Buffer.isBuffer(body)) body = JSON.parse(body.toString());
      if (Buffer.byteLength(JSON.stringify(body) || '') > 8192) return reply(413, {error:'Túl hosszú adatlap.'});
    } catch { return reply(400, {error:'Érvénytelen adatlap.'}); }
    if (!body || body.website !== '' || !validToken(body.token)) return reply(400, {error:'Az adatlap lejárt. Zárjátok be, majd nyissátok meg újra.'});
    const {errors, values} = validateInquiry(body, now());
    if (Object.keys(errors).length) return reply(422, {error:'Ellenőrizzétek az adatlapot.', fields:errors});
    const key = signature(values.requestId);
    const fingerprint = signature(JSON.stringify(values));
    for (const [id, entry] of submissions) if (now() - entry.time > 600000) submissions.delete(id);
    const existing = submissions.get(key);
    if (existing && existing.fingerprint !== fingerprint) return reply(409, {error:'Nyissátok meg újra az adatlapot.'});
    if (!existing) {
      const ip = signature(String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0]);
      for (const [id, entry] of rate) if (now() - entry.start >= 900000) rate.delete(id);
      const entry = rate.get(ip) || {start:now(), count:0};
      if (entry.count >= 3 || submissions.size >= 500 || rate.size >= 5000) { res.setHeader('Retry-After', '900'); return reply(429, {error:'Túl sok küldési kísérlet. Próbáljátok meg később, vagy hívjatok bennünket.'}); }
      entry.count++; rate.set(ip, entry);
      const work = (async () => {
        const transport = transportFactory({host:'smtp.gmail.com', port:465, secure:true,
          auth:{user:MAILBOX, pass:password()}, connectionTimeout:5000, greetingTimeout:5000, socketTimeout:10000});
        const sent = await transport.sendMail(makeMail(values));
        if (!sent.accepted?.some(address => String(address).toLowerCase() === MAILBOX)) throw new Error('Recipient not accepted');
        return {inquiryId:values.requestId};
      })();
      submissions.set(key, {time:now(), fingerprint, work});
    }
    try { return reply(200, await submissions.get(key).work); }
    catch {
      submissions.delete(key);
      // Never return/log provider errors, credentials or guest data.
      return reply(502, {error:'A küldést nem tudtuk megerősíteni. Próbáljátok újra később, vagy keressetek bennünket telefonon.'});
    }
  };
}
module.exports = createHandler();
module.exports.createHandler = createHandler;
module.exports.validateInquiry = validateInquiry;
module.exports.makeMail = makeMail;
