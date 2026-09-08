import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ECONOMIC_CALENDAR_WIDGET_CONFIG,
  ECONOMIC_CALENDAR_WIDGET_URL,
  mountEconomicCalendarWidget,
} from '../pages/newsCalendarWidget';

test('calendar loader mounts the responsive Arabic MQL5 widget and removes it on cleanup', () => {
  const attributes = new Map<string, string>();
  const script = {
    async: false,
    type: '',
    src: '',
    innerHTML: '',
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
  };
  const appended: unknown[] = [];
  const container = {
    innerHTML: '<p>stale widget</p>',
    appendChild(node: unknown) {
      appended.push(node);
      return node;
    },
  };
  const documentRef = {
    createElement(tagName: string) {
      assert.equal(tagName, 'script');
      return script;
    },
  };

  const cleanup = mountEconomicCalendarWidget(container, documentRef);

  assert.equal(container.innerHTML, '');
  assert.deepEqual(appended, [script]);
  assert.equal(script.async, true);
  assert.equal(script.type, 'text/javascript');
  assert.equal(script.src, ECONOMIC_CALENDAR_WIDGET_URL);
  assert.equal(attributes.get('data-type'), 'calendar-widget');
  assert.deepEqual(JSON.parse(script.innerHTML), ECONOMIC_CALENDAR_WIDGET_CONFIG);
  assert.equal(ECONOMIC_CALENDAR_WIDGET_CONFIG.width, '100%');
  assert.equal(ECONOMIC_CALENDAR_WIDGET_CONFIG.lang, 'ar');

  container.innerHTML = '<iframe title="calendar"></iframe>';
  cleanup();
  assert.equal(container.innerHTML, '');
});
