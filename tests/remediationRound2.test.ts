import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  getBrowserStorage,
  safeReadItem,
  safeRemoveItem,
  safeWriteItem,
} from '../contexts/userScopedPersistence';

test('storage helpers survive a throwing global localStorage getter', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });

    const storage = getBrowserStorage();
    assert.equal(storage, null);
    assert.equal(safeReadItem(storage, 'finance-language'), null);
    assert.doesNotThrow(() => safeWriteItem(storage, 'finance-language', 'ar'));
    assert.doesNotThrow(() => safeRemoveItem(storage, 'finance-language'));

    const throwingMethods = {
      getItem() {
        throw new Error('SecurityError');
      },
      setItem() {
        throw new Error('SecurityError');
      },
      removeItem() {
        throw new Error('SecurityError');
      },
    };
    assert.equal(safeReadItem(throwingMethods, 'finance-language'), null);
    assert.doesNotThrow(() => safeWriteItem(throwingMethods, 'finance-language', 'ar'));
    assert.doesNotThrow(() => safeRemoveItem(throwingMethods, 'finance-language'));
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete (globalThis as { localStorage?: unknown }).localStorage;
  }
});

test('Finance and Favorites use the shared guarded storage path', async () => {
  const finance = await readFile(new URL('../pages/FinanceTrackerPage.tsx', import.meta.url), 'utf8');
  const favorites = await readFile(new URL('../contexts/FavoritesContext.tsx', import.meta.url), 'utf8');
  const trading = await readFile(new URL('../pages/TradingJournalPage.tsx', import.meta.url), 'utf8');

  assert.match(finance, /getBrowserStorage/);
  assert.match(finance, /safeReadItem/);
  assert.match(finance, /safeWriteItem/);
  assert.doesNotMatch(finance, /window\.localStorage/);
  assert.match(favorites, /getBrowserStorage/);
  assert.match(favorites, /safeReadItem/);
  assert.match(favorites, /safeRemoveItem/);
  assert.doesNotMatch(favorites, /typeof localStorage/);

  const identityEffects = [...trading.matchAll(/useEffect\(\(\) => \{([\s\S]*?scopedStore\.capture[\s\S]*?)\n    \}, \[currentUserId\]\);/g)];
  assert.ok(identityEffects.length >= 3);
  identityEffects.forEach(([, effect]) => assert.match(effect, /scopedStore\.activate\(currentUserId\)/));
});
