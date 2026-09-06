import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getActiveNavigationGroup,
  getNextNavigationMenu,
  isCompactHeader,
} from '../components/headerNavigation';

test('nested content routes activate the correct navigation group', () => {
  assert.equal(getActiveNavigationGroup('/summary/atomic-habits'), 'library');
  assert.equal(getActiveNavigationGroup('/book-summaries'), 'library');
  assert.equal(getActiveNavigationGroup('/ar/book-summaries'), 'library');
  assert.equal(getActiveNavigationGroup('/categories/psychology'), 'library');
  assert.equal(getActiveNavigationGroup('/ar/categories/psychology'), 'library');
  assert.equal(getActiveNavigationGroup('/calculators/compound-interest'), 'tools');
  assert.equal(getActiveNavigationGroup('/ar/tools/compound-interest-calculator'), 'tools');
  assert.equal(getActiveNavigationGroup('/blog/how-to-read-more'), 'learn');
  assert.equal(getActiveNavigationGroup('/'), null);
  assert.equal(getActiveNavigationGroup('/summaryish'), null);
  assert.equal(getActiveNavigationGroup('/ar/toolsmith'), null);
});

test('selecting an open menu closes it while selecting another switches menus', () => {
  assert.equal(getNextNavigationMenu(null, 'library'), 'library');
  assert.equal(getNextNavigationMenu('library', 'library'), null);
  assert.equal(getNextNavigationMenu('library', 'tools'), 'tools');
});

test('the reading ribbon compacts only after the scroll threshold', () => {
  assert.equal(isCompactHeader(20), false);
  assert.equal(isCompactHeader(21), true);
});
