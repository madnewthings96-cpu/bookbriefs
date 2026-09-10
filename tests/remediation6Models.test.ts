import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const load = async <T>(path: string): Promise<T> => {
  try {
    return await import(path) as T;
  } catch {
    assert.fail(`Expected production module: ${path}`);
  }
};

test('unknown dashboard paths stay inside the protected dashboard branch', async () => {
  const source = await readFile('App.tsx', 'utf8');
  const dashboardStart = source.indexOf('<Route path="/dashboard" element={<DashboardLayout />}>');
  const protectedStart = source.indexOf('<Route element={<ProtectedRoute />}>');
  const publicWildcard = source.lastIndexOf('<Route path="*" element={<NotFoundPage />} />');

  assert.ok(dashboardStart > protectedStart);
  assert.ok(publicWildcard > dashboardStart);
  assert.match(source, /<Route path="\*" element={<DashboardNotFoundPage \/>} \/>/);
  assert.ok(source.indexOf('<Route path="*" element={<DashboardNotFoundPage />} />') < publicWildcard);
  assert.match(source, /import DashboardNotFoundPage from ['"]\.\/components\/dashboard\/DashboardNotFoundPage['"]/);
  for (const knownPath of ['discover', 'library', 'trading', 'settings']) {
    assert.match(source, new RegExp(`<Route path="${knownPath}"`));
  }
});

test('auth observer errors clear prior identity, expose failure, and permit recovery', async () => {
  const model = await load<typeof import('../contexts/authStateModel')>('../contexts/authStateModel');
  const prior = {
    user: { id: 'user-a', email: 'a@example.com', name: 'A' },
    isAuthReady: true,
    authError: null,
  };
  const failed = model.applyAuthObserverError(prior, new Error('observer failed'));
  assert.equal(failed.user, null);
  assert.equal(failed.isAuthReady, true);
  assert.match(failed.authError ?? '', /observer failed/);

  const recovered = model.applyAuthObserverUser(failed, prior.user);
  assert.deepEqual(recovered, { ...prior });
});

test('auth provider handles observer failure and exposes a resubscription path', async () => {
  const source = await readFile('contexts/AuthContext.tsx', 'utf8');
  assert.match(source, /authError/);
  assert.match(source, /user: null/);
  assert.match(source, /setAuthSubscriptionKey|retryAuth/);
  assert.match(source, /onAuthStateChanged\(auth/);
});

test('Trading Journal overlays use the shared dialog contract and labelled controls', async () => {
  for (const path of [
    'components/trading/AddTradeModal.tsx',
    'components/trading/AddGoalModal.tsx',
    'components/trading/StartingBalanceModal.tsx',
    'components/trading/TradingReviewDrawer.tsx',
  ]) {
    const source = await readFile(path, 'utf8');
    assert.match(source, /useModalDialog/, path);
    assert.match(source, /role="dialog"/, path);
    assert.match(source, /aria-modal="true"/, path);
    assert.match(source, /aria-labelledby=/, path);
    assert.match(source, /aria-label="Close/, path);
    assert.match(source, /focus-visible:/, path);
  }

  const trade = await readFile('components/trading/AddTradeModal.tsx', 'utf8');
  const goal = await readFile('components/trading/AddGoalModal.tsx', 'utf8');
  const balance = await readFile('components/trading/StartingBalanceModal.tsx', 'utf8');
  assert.match(trade, /htmlFor="trade-symbol"/);
  assert.match(trade, /id="trade-symbol"/);
  assert.match(trade, /htmlFor="trade-entry-date"/);
  assert.match(goal, /htmlFor="goal-target"/);
  assert.match(goal, /id="goal-target"/);
  assert.match(balance, /htmlFor="starting-balance"/);
  assert.match(balance, /id="starting-balance"/);

  const drawer = await readFile('components/trading/TradingReviewDrawer.tsx', 'utf8');
  assert.match(drawer, /inset-inline-end|end-0/);
  assert.match(drawer, /useReducedMotion/);
});

test('blob PDF opening is guarded and revokes URLs after the navigation attempt', async () => {
  const module = await load<typeof import('../utils/pdfDownloadGuard')>('../utils/pdfDownloadGuard');
  const events: string[] = [];
  const opened: string[] = [];
  const ok = module.openPdfBlobUrl(new Blob(['pdf']), {
    canCommit: () => true,
    createObjectURL: () => 'blob:test',
    open: (url) => { events.push('open'); opened.push(url); },
    revokeObjectURL: (url) => { events.push(`revoke:${url}`); },
    schedule: (callback) => callback(),
  });
  assert.equal(ok, true);
  assert.deepEqual(opened, ['blob:test']);
  assert.deepEqual(events, ['open', 'revoke:blob:test']);

  const staleEvents: string[] = [];
  const stale = module.openPdfBlobUrl(new Blob(['pdf']), {
    canCommit: () => false,
    createObjectURL: () => { staleEvents.push('create'); return 'blob:stale'; },
    open: () => staleEvents.push('open'),
    revokeObjectURL: () => staleEvents.push('revoke'),
    schedule: (callback) => callback(),
  });
  assert.equal(stale, false);
  assert.deepEqual(staleEvents, []);

  let checks = 0;
  const staleAfterCreateEvents: string[] = [];
  const staleAfterCreate = module.openPdfBlobUrl(new Blob(['pdf']), {
    canCommit: () => {
      checks += 1;
      return checks === 1;
    },
    createObjectURL: () => { staleAfterCreateEvents.push('create'); return 'blob:stale-after-create'; },
    open: () => staleAfterCreateEvents.push('open'),
    revokeObjectURL: () => staleAfterCreateEvents.push('revoke'),
    schedule: (callback) => callback(),
  });
  assert.equal(staleAfterCreate, false);
  assert.deepEqual(staleAfterCreateEvents, ['create', 'revoke']);
});

test('summary PDF handlers use the production guard and blob revocation utility', async () => {
  const source = await readFile('pages/SummaryDetailPage.tsx', 'utf8');
  assert.match(source, /pdfGuard|summaryPdfGuard/);
  assert.match(source, /openPdfBlobUrl/);
  assert.match(source, /canCommit:/);
  const guard = await load<typeof import('../utils/pdfDownloadGuard')>('../utils/pdfDownloadGuard');
  assert.equal(typeof guard.openPdfBlobUrl, 'function');
});

test('More closes when the desktop breakpoint matches and removes its listener', async () => {
  const module = await load<typeof import('../components/dashboard/dashboardMobileNavModel')>('../components/dashboard/dashboardMobileNavModel');
  assert.equal(module.DESKTOP_BREAKPOINT_QUERY, '(min-width: 1024px)');
  let matches = false;
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  let removed = false;
  const media = {
    get matches() { return matches; },
    addEventListener: (_type: 'change', next: (event: MediaQueryListEvent) => void) => { listener = next; },
    removeEventListener: () => { removed = true; },
  };
  const observed: boolean[] = [];
  const unsubscribe = module.subscribeToDesktopBreakpoint(media, (isDesktop) => observed.push(isDesktop));
  assert.deepEqual(observed, [false]);
  matches = true;
  listener?.({ matches: true } as MediaQueryListEvent);
  assert.deepEqual(observed, [false, true]);
  unsubscribe();
  assert.equal(removed, true);

  let requestedQuery = '';
  const fromWindowObserved: boolean[] = [];
  const fromWindowCleanup = module.subscribeToDesktopBreakpointFromWindow((query) => {
    requestedQuery = query;
    return media;
  }, (isDesktop) => fromWindowObserved.push(isDesktop));
  assert.equal(requestedQuery, module.DESKTOP_BREAKPOINT_QUERY);
  assert.deepEqual(fromWindowObserved, [true]);
  fromWindowCleanup();
});

test('desktop breakpoint helper keeps a legacy listener fallback', async () => {
  const module = await load<typeof import('../components/dashboard/dashboardMobileNavModel')>('../components/dashboard/dashboardMobileNavModel');
  let matches = false;
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  let removed = false;
  const media = {
    get matches() { return matches; },
    addListener: (next: (event: MediaQueryListEvent) => void) => { listener = next; },
    removeListener: () => { removed = true; },
  };
  const observed: boolean[] = [];
  const unsubscribe = module.subscribeToDesktopBreakpoint(media, (isDesktop) => observed.push(isDesktop));
  matches = true;
  listener?.({ matches: true } as MediaQueryListEvent);
  assert.deepEqual(observed, [false, true]);
  unsubscribe();
  assert.equal(removed, true);
});

test('mobile navigation wires the production breakpoint subscription to close More', async () => {
  const source = await readFile('components/dashboard/DashboardMobileNav.tsx', 'utf8');
  assert.match(source, /subscribeToDesktopBreakpoint/);
  assert.match(source, /onOpenChange\(false\)/);
  assert.match(source, /return unsubscribe|return \(\) => unsubscribe/);
});
