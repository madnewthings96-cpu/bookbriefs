import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DASHBOARD_NAVIGATION,
  LEGACY_DASHBOARD_REDIRECTS,
  getDashboardPageTitle,
  isDashboardNavItemActive,
} from '../components/dashboard/dashboardNavigation';

test('reading destinations lead and tools remain a secondary group', () => {
  assert.deepEqual(DASHBOARD_NAVIGATION.map(group => group.id), ['reading', 'tools', 'utility']);
  assert.deepEqual(DASHBOARD_NAVIGATION[0].items.map(item => item.href), [
    '/dashboard', '/dashboard/discover', '/dashboard/library', '/dashboard/notes', '/dashboard/challenge',
  ]);
  assert.equal(DASHBOARD_NAVIGATION[1].items[0].href, '/dashboard/downloads');
  assert.equal(DASHBOARD_NAVIGATION.flatMap(group => group.items).some(item => item.href.includes('admin')), false);
});

test('overview matching is exact while nested destinations stay active', () => {
  const overview = DASHBOARD_NAVIGATION[0].items[0];
  const library = DASHBOARD_NAVIGATION[0].items[2];
  assert.equal(isDashboardNavItemActive(overview, '/dashboard'), true);
  assert.equal(isDashboardNavItemActive(overview, '/dashboard/library'), false);
  assert.equal(isDashboardNavItemActive(library, '/dashboard/library/saved'), true);
  assert.equal(getDashboardPageTitle('/dashboard/finance'), 'Finance Tracker');
});

test('legacy protected routes have deterministic replacements', () => {
  assert.equal(LEGACY_DASHBOARD_REDIRECTS['/profile'], '/dashboard/settings');
  assert.equal(LEGACY_DASHBOARD_REDIRECTS['/feedback'], '/dashboard/admin/feedback');
});
