import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('workspace pages provide a single page heading and purposeful empty states', async () => {
  const library = await readFile('pages/DashboardLibraryPage.tsx', 'utf8');
  const notes = await readFile('pages/DashboardNotesPage.tsx', 'utf8');
  const settings = await readFile('pages/DashboardSettingsPage.tsx', 'utf8');
  assert.match(library, /<h1/);
  assert.match(library, /aria-live="polite"/);
  assert.match(notes, /Highlights/);
  assert.match(notes, /dashboard\/summary/);
  assert.match(settings, /ta7leel_dashboard_sidebar_collapsed/);
  assert.doesNotMatch(settings, /Dark mode|Arabic|Theme/);
});
