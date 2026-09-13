import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('modal focus wraps at both edges and enters from the dialog container', async () => {
  let focusTrap: typeof import('../components/modalFocusTrap');

  try {
    focusTrap = await import('../components/modalFocusTrap');
  } catch {
    assert.fail('the modal focus helper must exist');
  }

  assert.equal(focusTrap.getModalFocusWrapTarget(-1, 4, false), 0);
  assert.equal(focusTrap.getModalFocusWrapTarget(-1, 4, true), 3);
  assert.equal(focusTrap.getModalFocusWrapTarget(0, 4, true), 3);
  assert.equal(focusTrap.getModalFocusWrapTarget(3, 4, false), 0);
  assert.equal(focusTrap.getModalFocusWrapTarget(1, 4, false), null);
  assert.equal(focusTrap.getModalFocusWrapTarget(0, 0, false), null);
});

test('shared modal dialog keeps focus on its container with no tabbable descendants', async () => {
  const hook = await readFile('hooks/useModalDialog.ts', 'utf8');
  assert.match(hook, /if \(focusable\.length === 0\) \{\s+event\.preventDefault\(\);\s+dialogRef\.current\.focus\(\);\s+return;/);
});
