const test = require('node:test');
const assert = require('node:assert/strict');
const {createHandler, validateInquiry, makeMail} = require('../../../api/mellow-inquiry.js');
const now = Date.parse('2026-10-03T10:00:00Z');
const valid = {arrivalDate:'2026-10-09', departureDate:'2026-10-11', fullName:'Teszt Vendég', address:'0000 Tesztváros, Példa utca 1.', phone:'+36 20 000 0000', email:'teszt@example.com', guests:12, source:'mullers2-mellow', website:'', requestId:'d2167162-dc92-4a97-a78d-9e82732b9fba'};
function fixture(sendMail = async () => ({accepted:['mullers106@gmail.com']}), env={GMAIL_APP_PASSWORD:'abcdefghijklmnop'}) {
  let clock=now, calls=0, mail, options;
  const handler=createHandler({env,now:()=>clock,transportFactory:config=>{
    options=config;
    return {sendMail:async message=>{calls++; mail=message; return sendMail(message);}};
  }});
  async function call(method,body,headers={}) {
    let status, data; const responseHeaders={};
    await handler({method,body,headers:{origin:'https://www.mullerssiofok.hu','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.1',...headers}},
      {setHeader:(k,v)=>responseHeaders[k]=v,status:code=>{status=code;return {json:body=>{data=body;}};}});
    return {status,data,headers:responseHeaders};
  }
  async function payload() { const response=await call('GET');clock+=3000;return {...valid,token:response.data.token}; }
  return {call,payload,advance:ms=>clock+=ms,get calls(){return calls;},get mail(){return mail;},get options(){return options;}};
}
test('requires every guest field and both dates independently on the server',()=>{
  assert.deepEqual(validateInquiry(valid,now).errors,{});
  for(const field of ['fullName','address','phone','email','guests','arrivalDate','departureDate']) {
    const body={...valid};delete body[field];
    assert.ok(Object.keys(validateInquiry(body,now).errors).length,field);
  }
});
test('rejects invalid dates, past arrival, reversed and over-horizon ranges',()=>{
  for(const values of [{arrivalDate:'2026-02-30'},{arrivalDate:'2026-10-02'}, {departureDate:'2026-10-09'},{departureDate:'2027-10-01'}]) assert.ok(validateInquiry({...valid,...values},now).errors.dates);
});
test('rejects header injection, oversized values, fractions and malformed types',()=>{
  for(const values of [{email:'guest@example.com\r\nBcc: bad@example.com'}, {fullName:'Name\nBcc: bad'}, {fullName:'n'.repeat(121)}, {address:'a'.repeat(301)}, {phone:'123\n456789'}, {email:{}}, {guests:'12'}, {guests:1.5}, {guests:0}]) assert.ok(Object.keys(validateInquiry({...valid,...values},now).errors).length);
});
test('missing credentials fail closed and are never disclosed',async()=>{
  const f=fixture(undefined,{});
  assert.deepEqual((await f.call('GET')).data,{enabled:false});
  assert.equal((await f.call('POST',valid)).status,503);
  assert.equal(f.calls,0);
});
test('only same approved origin can post; methods, content type and size are bounded',async()=>{
  const f=fixture();const body=await f.payload();
  assert.equal((await f.call('POST',body,{origin:'https://attacker.example'})).status,403);
  assert.equal((await f.call('POST',body,{origin:''})).status,403);
  assert.equal((await f.call('POST',body,{'sec-fetch-site':'cross-site'})).status,403);
  assert.equal((await f.call('PUT',body)).status,405);
  assert.equal((await f.call('POST',body,{'content-type':'text/plain'})).status,415);
  assert.equal((await f.call('POST',body,{'content-length':'8193'})).status,413);
  assert.equal((await f.call('POST','{')).status,400);
  assert.equal(f.calls,0);
});
test('signed session, honeypot and complete fields are required before any send',async()=>{
  const f=fixture();const body=await f.payload();
  assert.equal((await f.call('POST',{...body,token:'bad'})).status,400);
  assert.equal((await f.call('POST',{...body,website:'spam'})).status,400);
  assert.equal((await f.call('POST',{...body,address:''})).status,422);
  f.advance(3600000);
  assert.equal((await f.call('POST',body)).status,400);
  assert.equal(f.calls,0);
});
test('Gmail acceptance produces acknowledgement and exact owner recipient, guest reply-to',async()=>{
  const f=fixture();const body=await f.payload();const response=await f.call('POST',body);
  assert.equal(response.status,200);assert.equal(response.data.inquiryId,valid.requestId);
  assert.equal(f.calls,1);assert.equal(f.mail.to,'mullers106@gmail.com');
  assert.equal(f.mail.from.address,'mullers106@gmail.com');assert.equal(f.mail.replyTo.address,valid.email);
  for(const text of [valid.fullName,valid.address,valid.phone,valid.email,'12 fő','Érkezés:','Távozás:']) assert.ok(f.mail.text.includes(text),text);
  assert.equal(f.options.secure,true);assert.equal(f.options.auth.user,'mullers106@gmail.com');
  assert.equal(response.headers['Cache-Control'],'no-store');
});
test('duplicate concurrent warm-instance requests share one delivery',async()=>{
  const f=fixture();const body=await f.payload();
  const responses=await Promise.all([f.call('POST',body),f.call('POST',body)]);
  assert.ok(responses.every(r=>r.status===200));assert.equal(f.calls,1);
  assert.equal((await f.call('POST',{...body,guests:13})).status,409);
});
test('throttles repeated distinct sends from one IP in a warm instance',async()=>{
  const f=fixture();const body=await f.payload();
  for(let i=0;i<3;i++) assert.equal((await f.call('POST',{...body,requestId:`d2167162-dc92-4a97-a78d-9e82732b9fb${i}`})).status,200);
  assert.equal((await f.call('POST',{...body,requestId:'d2167162-dc92-4a97-a78d-9e82732b9fb9'})).status,429);
  assert.equal(f.calls,3);
});
test('transport failure and recipient rejection never produce false success or leak errors',async()=>{
  for(const send of [async()=>{throw new Error('SECRET and PII');},async()=>({accepted:[]})]) {
    const f=fixture(send);const response=await f.call('POST',await f.payload());
    assert.equal(response.status,502);assert.equal(response.data.inquiryId,undefined);
    assert.ok(!JSON.stringify(response).includes('SECRET'));
  }
});
test('mail is plain text with attachments and remote content access disabled',()=>{
  const mail=makeMail(valid);assert.equal(mail.html,undefined);assert.equal(mail.attachments,undefined);
  assert.equal(mail.disableFileAccess,true);assert.equal(mail.disableUrlAccess,true);
});

test('private-house offer accepts the three contact fields and preserves the Mellow address requirement', async () => {
  const f = fixture();
  const body = await f.payload();
  delete body.address;
  assert.equal((await f.call('POST', body)).status, 422);
  body.source = 'mullers2-privat';
  body.intent = 'offer';
  assert.equal((await f.call('POST', body)).status, 200);
  assert.equal(f.mail.to, 'mullers106@gmail.com');
  assert.match(f.mail.subject, /ajánlatkérés/);
  assert.doesNotMatch(f.mail.text, /Lakcím/);
  assert.match(f.mail.text, /Érkezés:/);
  assert.equal(f.mail.replyTo.address, body.email);
});

test('private-house visitor names, phone and full email domain are checked before delivery', () => {
  const form = {...valid, source:'mullers2-privat', intent:'offer', familyName:"O’Connor-Nagy", givenName:"Éva Mária", email:'eva+hetvege@example.co.uk'};
  delete form.fullName;
  const result = validateInquiry(form, now);
  assert.deepEqual(result.errors, {});
  assert.equal(result.values.fullName, 'O’Connor-Nagy Éva Mária');
  for (const [name,value] of [
    ['familyName',''], ['givenName',''], ['familyName','N4gy'], ['givenName','Éva\nTeszt'],
    ['phone','12345'], ['phone','06 30 123'], ['phone','+36 1 234'], ['phone','06 20 ABC 4567'],
    ['phone','+36 1 234 5678'], ['phone','0036 20 123 4567'], ['phone','063012345678'],
    ['phone','+1 (202) 555-0147'], ['phone','+36401234567'], ['phone','0630-123-4567'],
    ['email','vendeg@localhost'], ['email','vendeg@example.c'], ['email','vendeg@example..hu'],
    ['email','vendeg@-example.com'], ['email','vendeg@example.123']
  ]) assert.ok(validateInquiry({...form,[name]:value},now).errors[name], name + ': ' + value);
  for (const phone of ['06301234567', '+36301234567', '06 20 123 4567', '+36311234567', '+36501234567', '06701234567']) {
    assert.deepEqual(validateInquiry({...form,phone},now).errors,{});
  }
  assert.deepEqual(validateInquiry({...form,familyName:'李',givenName:'明'},now).errors,{});
  assert.deepEqual(validateInquiry({...valid,phone:'+1 (202) 555-0147'},now).errors,{});
});

test('a preview accepts submissions from its own deployment origin; other preview origins are refused', async () => {
  const domain='mullershu-own-deployment.example';
  const f=fixture(undefined,{GMAIL_APP_PASSWORD:'abcdefghijklmnop',VERCEL_ENV:'preview',VERCEL_URL:domain});
  const body={...await f.payload(),source:'mullers2-privat',intent:'offer',familyName:'Minta',givenName:'Vendég'};
  assert.equal((await f.call('POST',body,{origin:'https://another-preview.example'})).status,403);
  assert.equal((await f.call('POST',body,{origin:'https://'+domain})).status,200);
  assert.equal(f.mail.replyTo.name,'Minta Vendég');
});
