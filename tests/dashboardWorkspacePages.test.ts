import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('workspace pages provide a single page heading and purposeful empty states', async () => {
  const library = await readFile('pages/DashboardLibraryPage.tsx', 'utf8');
  const notes = await readFile('pages/DashboardNotesPage.tsx', 'utf8');
  const libraryView = await readFile('components/dashboard/DashboardLibraryView.tsx', 'utf8');
  const notesView = await readFile('components/dashboard/DashboardNotesView.tsx', 'utf8');
  const settings = await readFile('pages/DashboardSettingsPage.tsx', 'utf8');
  const settingsView = await readFile('components/dashboard/DashboardSettingsView.tsx', 'utf8');
  const sidebarPreference = await readFile('components/dashboard/sidebarPreference.ts', 'utf8');
  assert.match(library, /DashboardLibraryView/);
  assert.match(libraryView, /<h1/);
  assert.match(libraryView, /aria-live="polite"/);
  assert.match(notes, /DashboardNotesView/);
  assert.match(notesView, /Highlights/);
  assert.match(notesView, /getBookSummaryHref\(\{ id: group\.bookSlug \}, 'dashboard'\)/);
  assert.match(sidebarPreference, /ta7leel_dashboard_sidebar_collapsed/);
  assert.doesNotMatch(`${settings}\n${settingsView}`, /Dark mode|Arabic|Theme/);
});

test('workspace styles apply root page layouts and accessible filter and summary targets', async () => {
  const styles = await readFile('pages/DashboardPages.css', 'utf8');

  assert.match(styles, /\.dashboard-page\.dashboard-workspace-page\s*\{[^}]*max-inline-size:\s*1160px/s);
  assert.match(styles, /\.dashboard-page \.dashboard-settings-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
  assert.match(styles, /\.dashboard-page \.dashboard-settings-primary-action,[\s\S]*min-block-size:\s*44px/s);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*\.dashboard-page \.dashboard-settings-grid,[\s\S]*grid-template-columns:\s*1fr/s);
  assert.match(styles, /\.dashboard-segmented-control button\s*\{[^}]*min-block-size:\s*44px/s);
  assert.match(styles, /\.dashboard-knowledge-group > a\s*\{[^}]*min-block-size:\s*44px[^}]*align-items:\s*center/s);
  assert.match(styles, /\.dashboard-page :focus-visible\s*\{/);
});
