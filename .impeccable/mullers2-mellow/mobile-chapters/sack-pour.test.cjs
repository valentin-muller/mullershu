const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../../mullers2-wellness/mellow/sack-pour.js'), 'utf8');

function scene({reducedMotion = false, motion = true} = {}) {
  const listeners = {}, frames = new Map();
  let next = 0, observer, resize;
  const reduced = {matches: reducedMotion, addEventListener: (_, fn) => { listeners.reduced = fn; }};
  const operations = [];
  const context = new Proxy({}, {get: (_, name) => (...args) => { operations.push([name, ...args]); }});
  const sack = {style: {}, clientWidth: 122, clientHeight: 210, offsetLeft: 0, offsetTop: 17,
    addEventListener: (_, fn) => { listeners.load = fn; }};
  const copy = {style: {}, getBoundingClientRect: () => ({left: 140, top: 90, width: 218, bottom: 155})};
  const canvas = {getContext: () => context};
  const stage = {clientWidth: 358, clientHeight: 245, getBoundingClientRect: () => ({left: 0, top: 0}),
    querySelector: selector => ({'.parajd-sack': sack, p: copy, '.sack-salt': canvas})[selector]};
  const body = {classList: {contains: () => motion}};
  const document = {hidden: false, body, querySelector: () => stage,
    addEventListener: (name, fn) => { listeners[name] = fn; }};
  vm.runInNewContext(source, {document, devicePixelRatio: 3, matchMedia: () => reduced,
    window: {addEventListener: (name, fn) => { listeners[name] = fn; }},
    IntersectionObserver: class {constructor(fn) { observer = fn; } observe() {}},
    ResizeObserver: class {constructor(fn) { resize = fn; } observe() {}},
    requestAnimationFrame: fn => { const id = ++next; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id)});
  let clock = 100;
  return {sack, canvas, copy, frames, operations,
    enter: () => observer([{isIntersecting: true, intersectionRatio: .8}]),
    leave: () => observer([{isIntersecting: false, intersectionRatio: 0}]),
    step: (count = 1) => { for (let i = 0; i < count; i++) {clock += 16; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(clock));} },
    hidden: value => { document.hidden = value; listeners.visibilitychange(); },
    reduce: value => { reduced.matches = value; listeners.reduced(); },
    toggle: value => { motion = value; listeners['mellow-motion'](); },
    resize,
  };
}

test('plays once, stops scheduling frames, retains the pose and heap on reverse scroll', () => {
  const s = scene();
  assert.equal(s.frames.size, 0);
  s.enter(); s.step(400);
  assert.equal(s.frames.size, 0);
  assert.match(s.sack.style.transform, /rotate\(72deg\)/);
  const pose = s.sack.style.transform;
  s.leave(); s.enter(); s.step(10);
  assert.equal(s.sack.style.transform, pose);
  assert.equal(s.frames.size, 0);
  assert.deepEqual(s.copy.style, {});
  assert.ok(s.operations.some(([name]) => name === 'fillRect'));
});

test('pauses offscreen and in hidden tabs; resumes without restarting', () => {
  const s = scene(); s.enter(); s.step(45);
  s.leave(); assert.equal(s.frames.size, 0);
  const pose = s.sack.style.transform;
  s.step(100); assert.equal(s.sack.style.transform, pose);
  s.enter(); s.step(15); assert.notEqual(s.sack.style.transform, pose);
  s.hidden(true); assert.equal(s.frames.size, 0);
  s.hidden(false); assert.equal(s.frames.size, 1);
});

test('reduced motion and page toggle preserve text without spatial motion or a frame loop', () => {
  const s = scene({reducedMotion: true}); s.enter(); s.step(100);
  assert.equal(s.frames.size, 0);
  assert.match(s.sack.style.transform, /rotate\(0deg\)/);
  assert.deepEqual(s.copy.style, {});
  s.reduce(false); s.step(20); s.toggle(false);
  assert.equal(s.frames.size, 0);
  assert.match(s.sack.style.transform, /rotate\(0deg\)/);
});

test('caps canvas pixel density and preserves the settled composition on resize', () => {
  const s = scene(); s.enter(); s.step(400);
  assert.equal(s.canvas.width, 716);
  assert.equal(s.canvas.height, 490);
  const pose = s.sack.style.transform;
  s.resize();
  assert.equal(s.sack.style.transform, pose);
  assert.equal(s.frames.size, 0);
});
