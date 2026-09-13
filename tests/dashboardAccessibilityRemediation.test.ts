import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path: string) => readFile(path, 'utf8');

test('dashboard topbar uses the home-linked brand while the page owns the single h1', async () => {
  const topbar = await read('components/dashboard/DashboardTopbar.tsx');
  const overview = await read('components/dashboard/DashboardOverviewView.tsx');
  const composedSource = `${topbar}\n${overview}`;

  assert.equal((composedSource.match(/<h1\b/g) ?? []).length, 1);
  assert.match(topbar, /to="\/dashboard"/);
  assert.match(topbar, /ta7leel-navbar-logo-mind-leaf\.png/);
  assert.doesNotMatch(topbar, /dashboard-topbar-title|dashboard-topbar-kicker/);
});

test('challenge and focused-reader note dialogs use the shared modal contract', async () => {
  const challenge = await read('pages/ReadingChallengePage.tsx');
  const note = await read('components/AddNoteModal.tsx');

  assert.match(challenge, /useModalDialog/);
  assert.match(challenge, /role="dialog"/);
  assert.match(challenge, /aria-modal="true"/);
  assert.match(challenge, /aria-labelledby="reading-goal-modal-title"/);
  assert.match(challenge, /aria-labelledby="delete-challenge-modal-title"/);
  assert.match(challenge, /onMouseDown=\{\(event\) => event\.target === event\.currentTarget && onClose\(\)\}/);
  assert.match(challenge, /initialFocusRef/);

  assert.match(note, /useModalDialog/);
  assert.match(note, /role="dialog"/);
  assert.match(note, /aria-modal="true"/);
  assert.match(note, /aria-labelledby="add-note-modal-title"/);
  assert.match(note, /onMouseDown=\{\(event\) => event\.target === event\.currentTarget && handleClose\(\)\}/);
  assert.match(note, /initialFocusRef/);
});

test('dashboard tap targets are scoped to the dashboard surface and use logical sizing', async () => {
  const shell = await read('components/dashboard/DashboardShell.css');
  const summaries = await read('pages/SummariesPage.css');
  const calculators = await read('pages/CalculatorsPage.tsx');
  const challenge = await read('pages/ReadingChallengePage.tsx');

  assert.match(shell, /\.dashboard-shell\s+:is\(button, a, input, select, textarea, summary\)[^{]*\{[^}]*min-block-size:\s*44px[^}]*min-inline-size:\s*44px/s);
  assert.match(summaries, /\.dashboard-shell \.summaries-library[\s\S]*min-block-size:\s*44px/);
  assert.match(calculators, /surface === 'dashboard'[\s\S]*min-h-11/);
  assert.match(challenge, /surface === 'dashboard'[\s\S]*min-h-11/);
});

test('focused reader keeps its outer main and makes the dashboard summary content non-main', async () => {
  const reader = await read('components/dashboard/FocusedReaderLayout.tsx');
  const summary = await read('components/SummaryReadingExperience.tsx');
  const detail = await read('pages/SummaryDetailPage.tsx');

  assert.match(reader, /<main id="focused-reader-content"/);
  assert.match(summary, /surface\?: ReadingSurface/);
  assert.match(summary, /const ContentElement = surface === 'dashboard' \? 'div' : 'main';/);
  assert.match(detail, /surface=\{surface\}/);
});

test('dashboard logout awaits sign-out before replacing the route and preserves failure state', async () => {
  const { completeDashboardLogout } = await import('../components/dashboard/dashboardLogout');
  const events: string[] = [];
  let resolveLogout!: (result: boolean) => void;
  const logout = () => new Promise<boolean>((resolve) => {
    events.push('logout-start');
    resolveLogout = (result) => {
      events.push(`logout-${result ? 'success' : 'failure'}`);
      resolve(result);
    };
  });
  const navigate = (path: string) => events.push(`navigate-${path}`);

  const pending = completeDashboardLogout(logout, navigate);
  assert.deepEqual(events, ['logout-start']);
  resolveLogout(true);
  assert.equal(await pending, true);
  assert.deepEqual(events, ['logout-start', 'logout-success', 'navigate-/']);

  const failed = await completeDashboardLogout(async () => false, navigate);
  assert.equal(failed, false);
  assert.deepEqual(events, ['logout-start', 'logout-success', 'navigate-/']);
});

test('ordinary reader user menu does not expose the admin feedback destination', async () => {
  const userMenu = await read('components/UserMenu.tsx');
  assert.doesNotMatch(userMenu, /to="\/feedback"/);
  assert.match(userMenu, /Send Feedback/);
});

test('RTL layout contracts follow live direction changes without React-only state', async () => {
  const shell = await read('components/dashboard/DashboardShell.css');
  const sidebar = await read('components/dashboard/DashboardSidebar.tsx');
  const summaries = await read('pages/SummariesPage.css');
  const calculators = await read('pages/CalculatorsPage.tsx');

  assert.match(shell, /\[dir=['"]rtl['"]\][\s\S]*dashboard/);
  assert.match(shell, /\[dir=['"]rtl['"]\]\s+\.dashboard-sidebar\s+\.dashboard-icon-button\s+svg\s*\{\s*transform:\s*scaleX\(-1\);\s*\}/);
  assert.match(sidebar, /const CollapseIcon = collapsed \? ChevronRight : ChevronLeft;/);
  assert.doesNotMatch(sidebar, /isRtl|languagechange|MutationObserver/);
  assert.match(sidebar, /aria-label=\{collapsed \? 'Expand sidebar' : 'Collapse sidebar'\}/);
  assert.doesNotMatch(summaries, /\bright:\s*|margin-left:/);
  assert.match(summaries, /\.library-sort select \{[^}]*padding-block:\s*10px;[^}]*padding-inline:\s*0\s+22px;/s);
  assert.doesNotMatch(summaries, /\.library-sort select \{[^}]*padding:\s*10px\s+22px\s+10px\s+0/s);
  assert.match(summaries, /\.library-sort svg \{[^}]*inset-inline-end:/s);
  assert.match(calculators, /surface === 'dashboard' \? undefined :/);
});

test('sidebar preference storage and reset are safe when browser storage throws', async () => {
  const source = await read('components/dashboard/sidebarPreference.ts');
  assert.match(source, /try \{/);
  assert.match(source, /catch \{/);
  assert.match(source, /ta7leel_dashboard_sidebar_collapsed/);
  assert.match(source, /dashboard-preference-change/);

  const { readSidebarCollapsed, writeSidebarCollapsed, resetSidebarPreference } = await import('../components/dashboard/sidebarPreference');
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      get localStorage() {
        throw new Error('private mode');
      },
      dispatchEvent() {
        throw new Error('private mode');
      },
    },
  });

  try {
    assert.equal(readSidebarCollapsed(), false);
    assert.doesNotThrow(() => writeSidebarCollapsed(true));
    assert.doesNotThrow(() => resetSidebarPreference());
  } finally {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  }
});

test('dashboard search only controls and announces a listbox while it is open', async () => {
  const search = await read('components/dashboard/DashboardSearch.tsx');
  assert.match(search, /aria-controls=\{isOpen && hasQuery \? RESULTS_ID : undefined\}/);
  assert.match(search, /aria-activedescendant=\{isOpen && hasQuery && activeIndex >= 0/);
});
