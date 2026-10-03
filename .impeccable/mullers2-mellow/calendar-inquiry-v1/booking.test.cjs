const test = require('node:test');
const assert = require('node:assert/strict');
const {dateOf, shiftDay, monthOf, shiftMonth, gridDays, validateFields, withinDeadline, stayAvailable} = require('../../../mullers2-wellness/mellow/booking.js');
const valid = {name:'Teszt Vendég', address:'0000 Tesztváros, Példa utca 1.', phone:'+36 20 000 0000', email:'teszt@example.com', guests:'12'};
test('rejects calendar rollover and accepts leap day', () => {
 assert.equal(dateOf('2026-02-29'), null);
 assert.equal(dateOf('2026-13-01'), null);
 assert.equal(dateOf('2026-2-01'), null);
 assert.equal(dateOf('2028-02-29').toISOString(),'2028-02-29T00:00:00.000Z');
});
test('day movement across Hungarian daylight-saving boundaries remains a calendar day', () => {
 assert.equal(shiftDay('2026-03-29',1),'2026-03-30');
 assert.equal(shiftDay('2026-10-25',-1),'2026-10-24');
 assert.equal(shiftDay('2026-12-31',1),'2027-01-01');
});
test('calendar weeks start Monday and cover entire month', () => {
 for (const month of ['2026-10-01','2027-02-01','2028-02-01']) {
  const days=gridDays(monthOf(month));
  assert.equal(dateOf(days[0]).getUTCDay(),1);
  assert.equal(days.length%7,0);
  assert.ok(days.includes(month));
  assert.equal(new Set(days).size,days.length);
 }
 assert.ok(gridDays(monthOf('2028-02-01')).includes('2028-02-29'));
});
test('month movement handles year rollover',()=>assert.equal(shiftMonth(monthOf('2026-12-01'),1).toISOString(),'2027-01-01T00:00:00.000Z'));
test('accepts requested complete enquiry fields',()=>assert.deepEqual(validateFields(valid),{}));
test('returns every missing field and rejects fractional or negative guests',()=>{
 assert.deepEqual(Object.keys(validateFields({name:'',address:'',phone:'',email:'',guests:''})),['name','address','phone','email','guests']);
 for(const guests of ['0','-1','1.5','abc','1000']) assert.ok(validateFields({...valid,guests}).guests);
 assert.ok(validateFields({...valid,email:'invalid',phone:'phone'}).email);
 assert.ok(validateFields({...valid,email:'invalid',phone:'phone'}).phone);
});
test('request timeout rejects even if adapter ignores cancellation',async()=>{
 const controller=new AbortController();
 await assert.rejects(withinDeadline(()=>new Promise(()=>{}),controller,5),{name:'AbortError'});
 assert.equal(controller.signal.aborted,true);
});
test('closing cancels in-flight request and does not affect a subsequent request',async()=>{
 const first=new AbortController();
 const request=withinDeadline(()=>new Promise(()=>{}),first,500);
 first.abort();
 await assert.rejects(request,{name:'AbortError'});
 const second=new AbortController();
 assert.deepEqual(await withinDeadline(()=>Promise.resolve({inquiryId:'test-only'}),second),{inquiryId:'test-only'});
 assert.equal(second.signal.aborted,false);
});

test('stay requires a later departure and every occupied night, but not the checkout day',()=>{
 const nights=new Set(['2026-10-07','2026-10-08']);
 assert.equal(stayAvailable('2026-10-07','2026-10-09',nights),true);
 assert.equal(stayAvailable('2026-10-08','2026-10-09',nights),true);
 assert.equal(stayAvailable('2026-10-07','2026-10-10',nights),false);
 for(const end of ['2026-10-07','2026-10-06','invalid']) assert.equal(stayAvailable('2026-10-07',end,nights),false);
});
test('stay range crosses month, year and DST boundaries without skipping unavailable nights',()=>{
 const nights=new Set(['2026-12-31','2027-01-01']);
 assert.equal(stayAvailable('2026-12-31','2027-01-02',nights),true);
 assert.equal(stayAvailable('2026-12-31','2027-01-03',nights),false);
 assert.equal(stayAvailable('2026-10-25','2026-10-27',new Set(['2026-10-25','2026-10-26'])),true);
});
