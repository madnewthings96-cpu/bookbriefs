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

test('feedback dialog retains its accessible name and Escape close path in every state', async () => {
  const feedback = await readFile('components/FeedbackModal.tsx', 'utf8');
  assert.match(feedback, /aria-labelledby="feedback-modal-title"/);
  assert.match(feedback, /<h2 id="feedback-modal-title"[^>]*>Send feedback<\/h2>/);
  assert.ok(feedback.indexOf('id="feedback-modal-title"') < feedback.indexOf('{submitSuccess ?'));
  assert.match(feedback, /useModalDialog\(\{ open: isOpen, onClose \}\)/);
  assert.match(feedback, /const handleClose = \(\) => \{\s+if \(!isSubmitting\)/);
  assert.doesNotMatch(feedback, /transition-all/);
  assert.match(feedback, /transition-colors duration-200/);
  assert.match(feedback, /transition-\[background-color,box-shadow,transform\] duration-300/);
});

test('feedback close control has a 44px interactive target', async () => {
  const feedback = await readFile('components/FeedbackModal.tsx', 'utf8');
  assert.match(feedback, /aria-label="Close modal"[\s\S]*className="[^"]*h-11[^"]*w-11/);
});

test('mobile More keeps only its secondary destinations and a visible Tools group', async () => {
  const mobile = await readFile('components/dashboard/DashboardMobileNav.tsx', 'utf8');
  assert.match(mobile, /const moreGroups/);
  assert.match(mobile, /item\.id === 'challenge'/);
  assert.match(mobile, /dashboard-more-drawer-group-label/);
  assert.match(mobile, /dashboardTools/);
  assert.match(mobile, /toolsGroup,\s+utilityGroup/);
  assert.doesNotMatch(mobile, /DASHBOARD_NAVIGATION\.flatMap\(group => group\.items\)/);
});

test('dashboard CSS is scoped, direction-safe, and reduced-motion aware', async () => {
  const css = await readFile('components/dashboard/DashboardShell.css', 'utf8');
  assert.match(css, /--dashboard-sidebar-width:\s*240px/);
  assert.match(css, /\[dir=['"]rtl['"]\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /will-change/);
});
