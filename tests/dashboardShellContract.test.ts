import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard shell owns landmarks and accessible mobile overlay semantics', async () => {
  const layout = await readFile('components/dashboard/DashboardLayout.tsx', 'utf8');
  const mobile = await readFile('components/dashboard/DashboardMobileNav.tsx', 'utf8');
  const feedback = await readFile('components/FeedbackModal.tsx', 'utf8');
  assert.match(layout, /href="#dashboard-content"/);
  assert.match(layout, /<main[^>]*id="dashboard-content"/);
  assert.match(mobile, /aria-modal="true"/);
  assert.match(mobile, /aria-current|NavLink/);
  assert.match(feedback, /role="dialog"/);
  assert.match(feedback, /useModalDialog/);
});

test('dashboard CSS is scoped, direction-safe, and reduced-motion aware', async () => {
  const css = await readFile('components/dashboard/DashboardShell.css', 'utf8');
  assert.match(css, /--dashboard-sidebar-width:\s*240px/);
  assert.match(css, /\[dir=['"]rtl['"]\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /will-change/);
});
