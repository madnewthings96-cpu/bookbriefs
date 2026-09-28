import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = readFileSync('public/opening-book.js', 'utf8');
function setup({ seen = false, blocked = false, path = '/' } = {}) {
  const timers = new Map<number, () => void>();
  const events = new Map<string, () => void>();
  const elements = new Map<string, any>();
  let nextTimer = 0;
  let saved = false;
  const root = { inert: false };
  const loader = {
    hidden: true, removed: false,
    remove() { this.removed = true; },
    removeAttribute() {}, setAttribute() {}, contains() { return false; },
    classList: { add() {} },
    querySelector(selector: string) {
      if (!elements.has(selector)) elements.set(selector, { textContent: '', addEventListener(_event: string, fn: () => void) { this.click = fn; } });
      return elements.get(selector);
    },
  };
  runInNewContext(source, {
    document: { getElementById: (id: string) => id === 'root' ? root : loader, activeElement: null },
    location: { pathname: path },
    sessionStorage: { getItem() { if (blocked) throw Error('Blocked'); return seen ? '1' : null; }, setItem() { saved = true; } },
    window: { addEventListener: (name: string, fn: () => void) => events.set(name, fn), removeEventListener: (name: string) => events.delete(name) },
    setTimeout: (fn: () => void) => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout: (id: number) => timers.delete(id),
  });
  return { root, loader, timers, events, elements, saved };
}
test('first visit shows loader and readiness releases content without a minimum wait', () => {
  const s = setup();
  assert.equal(s.loader.hidden, false);
  assert.equal(s.saved, true);
  assert.equal(s.root.inert, true);
  s.events.get('ta7leel:page-ready')!();
  assert.equal(s.root.inert, false);
  assert.equal(s.events.size, 0);
  for (const fn of s.timers.values()) fn();
  assert.equal(s.loader.removed, true);
});
test('repeat visits do not mask or disable the page', () => {
  const s = setup({ seen: true });
  assert.equal(s.loader.removed, true);
  assert.equal(s.root.inert, false);
  assert.equal(s.timers.size, 0);
});
test('blocked storage still permits dismissal', () => {
  const s = setup({ blocked: true });
  s.elements.get('.opening-skip').click();
  assert.equal(s.root.inert, false);
});
test('timeout releases content when the application fails to become ready', () => {
  const s = setup();
  s.timers.get(1)!();
  assert.equal(s.root.inert, false);
  assert.equal(s.events.size, 0);
});
test('Arabic entry routes show Arabic loading and skip labels', () => {
  const s = setup({ path: '/ar/summary/atomic-habits' });
  assert.match(s.elements.get('.opening-heading').textContent, /بانتظارك/);
  assert.match(s.elements.get('.opening-skip').textContent, /المتابعة/);
});
