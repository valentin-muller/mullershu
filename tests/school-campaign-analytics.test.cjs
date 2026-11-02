const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync('assets/school-campaign-analytics.js','utf8');
const query='?utm_source=mullers&utm_medium=email&utm_campaign=osztalykirandulas_2027&utm_id=sc27_b01_01&utm_content=v4_offer';
function fixture({consent='accepted',url='https://www.mullerssiofok.hu/blog/osztalykirandulas/'+query,saved=null,storageError=false}={}){
 let current=consent;const session=new Map(saved?[['mullers_school_campaign_v1',JSON.stringify(saved)]]:[]),listeners=[];
 const internal={href:'https://www.mullerssiofok.hu/blog/programajanlo/'},external={href:'https://external.test/program/'},email={href:'mailto:hotel@example.test?subject=Hello'};
 const window={location:new URL(url),localStorage:{getItem:()=>{if(storageError)throw Error('blocked');return current}},sessionStorage:{getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},dataLayer:[]};
 const document={querySelectorAll:()=>[internal,external,email],addEventListener:(type,fn)=>listeners.push(fn)};
 const context=vm.createContext({window,document,URL,Object,JSON});vm.runInContext(source,context);
 function click(href,control=null){const link=href?{href}:null;const event={target:{closest:selector=>selector==='a[href]'?link:control&&selector.includes(control)?{}:null}};listeners.forEach(fn=>fn(event));}
 return{window,session,internal,external,email,click,setConsent:v=>{current=v},repeat:()=>vm.runInContext(source,context),events:()=>window.dataLayer.map(x=>Array.from(x))};
}
test('unknown, refused and unreadable consent never emit or persist campaign data',()=>{
 for(const opts of [{consent:null},{consent:'declined'},{storageError:true}]){const f=fixture(opts);f.click('tel:+36200000000');f.click('mailto:hotel@example.test');assert.equal(f.events().length,0);assert.equal(f.session.size,0);assert.equal(f.window.clarity,undefined);assert.equal(new URL(f.internal.href).search,'');}
});
test('consented phone/mail intent is distinct from a submitted inquiry and carries no recipient data',()=>{
 const f=fixture();f.click('tel:+36200000000');f.click('mailto:teacher@example.test?body=Private');const events=f.events();assert.deepEqual(events.map(e=>e[1]),['school_phone_click','school_email_click']);
 for(const event of events){assert.equal(event[2].campaign_id,'sc27_b01_01');assert.equal(event[2].send_to,'G-HLJ3B6551Z');assert.doesNotMatch(JSON.stringify(event),/teacher@|Private|\+3620|generate_lead|form_submit/);}
});
test('attribution follows only the two school pages, preserving direct and external contact links',()=>{
 const f=fixture();assert.equal(new URL(f.internal.href).searchParams.get('utm_id'),'sc27_b01_01');assert.equal(f.external.href,'https://external.test/program/');assert.equal(f.email.href,'mailto:hotel@example.test?subject=Hello');f.click(f.internal.href);assert.equal(f.events()[0][1],'school_program_click');
 const saved=JSON.parse(f.session.get('mullers_school_campaign_v1'));const next=fixture({url:'https://www.mullerssiofok.hu/blog/programajanlo/',saved});next.click('tel:+36200000000');assert.equal(next.events()[0][2].campaign_id,'sc27_b01_01');
});
test('accepting consent enables measurement; revocation disables it and clears attribution',()=>{
 const f=fixture({consent:null});f.setConsent('accepted');f.click(null,'data-consent-accept');f.click('tel:+36200000000');assert.equal(f.events().length,1);f.setConsent('declined');f.click(null,'data-consent-decline');f.click('tel:+36200000000');assert.equal(f.events().length,1);assert.equal(f.session.size,0);
});
test('malformed campaign parameters cannot leak into telemetry or inherit an old school identity',()=>{
 const saved={utm_source:'mullers',utm_medium:'email',utm_campaign:'osztalykirandulas_2027',utm_id:'sc27_b01_02',utm_content:'v4_offer'};
 const f=fixture({url:'https://www.mullerssiofok.hu/blog/osztalykirandulas/?utm_id=private%40example.test',saved});f.click('tel:+36200000000');const e=f.events()[0];assert.equal(e[2].campaign_id,undefined);assert.doesNotMatch(JSON.stringify(e),/private|sc27_b01_02/);assert.equal(f.session.size,0);
});
test('loading twice never duplicates listeners or click events, and unrelated pages are ignored',()=>{
 const f=fixture();f.repeat();f.click('mailto:hotel@example.test');assert.equal(f.events().length,1);const other=fixture({url:'https://www.mullerssiofok.hu/'});other.click('tel:+36200000000');assert.equal(other.events().length,0);
});
