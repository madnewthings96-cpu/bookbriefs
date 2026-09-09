import assert from 'node:assert/strict';
import test from 'node:test';
import {
  UserScopedIdentity,
  readPersonalNotes,
  readUserProgress,
  type StorageLike,
} from '../contexts/userScopedPersistence';

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();
  removed: string[] = [];
  writes: Array<{ key: string; value: string }> = [];

  constructor(entries: Record<string, string> = {}) {
    Object.entries(entries).forEach(([key, value]) => this.values.set(key, value));
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
    this.writes.push({ key, value });
  }

  removeItem(key: string) {
    this.values.delete(key);
    this.removed.push(key);
  }
}

test('malformed progress JSON clears only that user record and falls back safely', () => {
  const storage = new MemoryStorage({
    'bookbriefs_user_stats_a': JSON.stringify({ booksRead: 4, readingHistory: [] }),
    'bookbriefs_book_progress_a': '{not-json',
  });

  const result = readUserProgress(storage, 'a');

  assert.equal(result.progress.length, 0);
  assert.deepEqual(result.stats.readingHistory, []);
  assert.deepEqual(storage.removed, ['bookbriefs_book_progress_a']);
});

test('wrong-shaped notes clear only the notes record without throwing', () => {
  const storage = new MemoryStorage({
    'bookbriefs_personal_notes_a': JSON.stringify({ notes: {}, highlights: [] }),
    'bookbriefs_user_stats_a': JSON.stringify({ booksRead: 2, readingHistory: [] }),
  });

  const result = readPersonalNotes(storage, 'a');

  assert.deepEqual(result, { notes: [], highlights: [] });
  assert.deepEqual(storage.removed, ['bookbriefs_personal_notes_a']);
});

test('valid legacy records preserve user data and normalize persisted dates', () => {
  const storage = new MemoryStorage({
    'bookbriefs_user_stats_a': JSON.stringify({
      booksRead: 3,
      dayStreak: 2,
      totalReadingTime: 25,
      readingHistory: ['2026-09-08T00:00:00.000Z'],
    }),
    'bookbriefs_book_progress_a': JSON.stringify([{
      bookId: 'atomic-habits',
      progress: 40,
      startedAt: '2026-09-01T00:00:00.000Z',
      lastReadAt: '2026-09-08T00:00:00.000Z',
      isCompleted: false,
    }]),
    'bookbriefs_personal_notes_a': JSON.stringify({
      notes: [{
        id: 'note-1',
        bookId: 'atomic-habits',
        content: 'Make it obvious.',
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-08T00:00:00.000Z',
      }],
      highlights: [],
    }),
  });

  const progress = readUserProgress(storage, 'a');
  const notes = readPersonalNotes(storage, 'a');

  assert.equal(progress.stats.booksRead, 3);
  assert.equal(progress.stats.readingHistory[0]?.toISOString(), '2026-09-08T00:00:00.000Z');
  assert.equal(progress.progress[0]?.bookId, 'atomic-habits');
  assert.equal(progress.progress[0]?.lastReadAt.toISOString(), '2026-09-08T00:00:00.000Z');
  assert.equal(notes.notes[0]?.content, 'Make it obvious.');
  assert.equal(notes.notes[0]?.updatedAt.toISOString(), '2026-09-08T00:00:00.000Z');
  assert.deepEqual(storage.removed, []);
});

test('storage access failures degrade to empty scoped state', () => {
  const storage: StorageLike = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
    removeItem() {
      throw new Error('blocked');
    },
  };

  assert.deepEqual(readUserProgress(storage, 'a').progress, []);
  assert.deepEqual(readPersonalNotes(storage, 'a'), { notes: [], highlights: [] });
});

test('identity transitions reset readiness and prevent stale hydration from committing', async () => {
  const identity = new UserScopedIdentity();
  identity.observe('a');
  const staleHydration = identity.hydrate('a', async () => {
    await Promise.resolve();
    return 'A data';
  });

  identity.observe('b');
  assert.equal(identity.canWrite('b'), false);
  assert.equal(await staleHydration, undefined);
  assert.equal(identity.isReady('b'), false);

  const currentHydration = identity.hydrate('b', () => 'B data');
  assert.equal(await currentHydration, 'B data');
  assert.equal(identity.canWrite('b'), true);
  assert.equal(identity.canWrite('a'), false);
});

test('logout invalidates pending hydration and never allows anonymous writes', async () => {
  const identity = new UserScopedIdentity();
  identity.observe('a');
  const hydration = identity.hydrate('a', () => 'A data');

  identity.observe(null);
  assert.equal(identity.canWrite(null), false);
  assert.equal(identity.canWrite('a'), false);
  assert.equal(await hydration, undefined);
  assert.equal(identity.isReady(null), false);
});

test('save gating never redirects hydrated A data to B or an anonymous key', async () => {
  const storage = new MemoryStorage();
  const identity = new UserScopedIdentity();

  identity.observe('a');
  await identity.hydrate('a', () => ({ notes: ['A'] }));
  if (identity.canWrite('a')) storage.setItem('bookbriefs_personal_notes_a', JSON.stringify({ notes: ['A'] }));

  identity.observe('b');
  if (identity.canWrite('b')) storage.setItem('bookbriefs_personal_notes_b', JSON.stringify({ notes: ['A'] }));
  identity.observe(null);
  if (identity.canWrite(null)) storage.setItem('bookbriefs_personal_notes_null', JSON.stringify({ notes: ['A'] }));

  assert.equal(storage.getItem('bookbriefs_personal_notes_a'), JSON.stringify({ notes: ['A'] }));
  assert.equal(storage.getItem('bookbriefs_personal_notes_b'), null);
  assert.equal(storage.getItem('bookbriefs_personal_notes_null'), null);
});
