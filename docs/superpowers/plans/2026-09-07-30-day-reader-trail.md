# 30-Day Reader’s Trail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the calendar-year reading goal with a polished, accessible, backward-compatible rolling 30-day reading sprint whose trail, daily activity, library, and controls work consistently on desktop and mobile.

**Architecture:** Put all date, migration, selection, and progress rules in a pure domain module; keep Firebase reads and writes in the existing context; and split the page into focused trail, hero, library, state, and dialog components. Firestore retains the existing collection and `{userId}_{startYear}` document IDs, while legacy records are normalized in memory and upgraded only on their next mutation.

**Tech Stack:** React 18, TypeScript 5.8, React Router 6, Firebase/Firestore 12, Framer Motion 11, Lucide React, route-scoped CSS, Node test runner with `tsx`, Firebase Rules Unit Testing.

**Spec:** `docs/superpowers/specs/2026-09-07-30-day-reader-trail-design.md`

## Global Constraints

- The route remains `/reading-challenge`, but it must be public so the signed-out preview can render.
- One rolling challenge lasts exactly 30 local calendar dates: `startDate` is day 1 and `endDate` is day 30 inclusive.
- Persist date-only values as local `YYYY-MM-DD` strings; do not parse them with `new Date('YYYY-MM-DD')`.
- Keep Firestore collection `reading_challenges` and document IDs `{userId}_{startYear}`.
- Load the current-year and previous-year document in parallel; a still-open cross-year sprint may come from the previous-year document.
- Preserve legacy `booksRead`, invent no legacy `bookCompletions`, and write the complete version-2 shape only on the next user mutation.
- Goal bounds remain `1–1000`; the interface presets are exactly `5`, `10`, and `15`.
- Status precedence is exactly `expired` when the end date has passed, then `completed` when the goal is met, otherwise `active`.
- Progress may exceed 100%; copy shows the real count while visual fills clamp to 100%.
- The current streak ends today when today has activity, otherwise yesterday when yesterday has activity, otherwise it is zero.
- Use Deep Forest `#0B2B22`, Moss `#355B45`, Cream `#F6F0E3`, Parchment `#E8DCC5`, Brass `#C99A46`, and Coral `#B85135`.
- Use Newsreader for display headings, Plus Jakarta Sans for UI/body copy, and `ui-monospace`/SFMono for changing metrics.
- All controls need a minimum `44×44px` hit area, visible keyboard focus, and bottom clearance from the fixed mobile navigation.
- Do not use `transition: all`, `will-change: all`, punitive red missed-day states, or background writes triggered only by loading.
- Respect `prefers-reduced-motion`; disable the today halo and entry motion there.
- Preserve unrelated dirty-worktree changes; stage and commit only files named by each task.

---

### Task 1: Build the pure 30-day challenge model

**Files:**
- Create: `components/reading-challenge/challengeModel.ts`
- Create: `tests/readingChallengeModel.test.ts`

**Interfaces:**
- Consumes: No application state, React, or Firebase APIs.
- Produces:
  - `type DateKey = string`
  - `type ChallengeStatus = 'active' | 'completed' | 'expired'`
  - `interface BookCompletion { bookId: string; completedOn: DateKey }`
  - `interface ReadingChallenge { schemaVersion: 2; userId: string; year: number; goal: number; booksRead: string[]; startDate: DateKey; endDate: DateKey; bookCompletions: BookCompletion[]; createdAt: Date; updatedAt: Date }`
  - `interface ChallengeProgress { current: number; goal: number; percentage: number; clampedPercentage: number; dayNumber: number; daysRemaining: number; completedDays: DateKey[]; streak: number; weeklyPace: number; status: ChallengeStatus }`
  - `toLocalDateKey(date: Date): DateKey`
  - `addCalendarDays(dateKey: DateKey, amount: number): DateKey`
  - `differenceInCalendarDays(from: DateKey, to: DateKey): number`
  - `normalizeReadingChallenge(raw: unknown, userId: string, today: DateKey): ReadingChallenge | null`
  - `createReadingChallenge(userId: string, goal: number, today: DateKey, now?: Date): ReadingChallenge`
  - `deriveChallengeProgress(challenge: ReadingChallenge, today: DateKey): ChallengeProgress`
  - `selectCurrentChallenge(candidates: ReadingChallenge[], today: DateKey): ReadingChallenge | null`
  - `setChallengeGoal(challenge: ReadingChallenge, goal: number, now?: Date): ReadingChallenge`
  - `addBookCompletion(challenge: ReadingChallenge, bookId: string, completedOn: DateKey, now?: Date): ReadingChallenge`
  - `removeBookCompletion(challenge: ReadingChallenge, bookId: string, now?: Date): ReadingChallenge`

- [ ] **Step 1: Write the failing model tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addBookCompletion,
  addCalendarDays,
  createReadingChallenge,
  deriveChallengeProgress,
  normalizeReadingChallenge,
  removeBookCompletion,
  selectCurrentChallenge,
} from '../components/reading-challenge/challengeModel';

test('a sprint spans exactly 30 inclusive calendar dates across month and year boundaries', () => {
  assert.equal(addCalendarDays('2026-01-31', 29), '2026-03-01');
  assert.equal(addCalendarDays('2026-12-15', 29), '2027-01-13');
  assert.equal(addCalendarDays('2028-02-01', 29), '2028-03-01');
  assert.equal(addCalendarDays('2026-03-07', 2), '2026-03-09');
  assert.equal(addCalendarDays('2026-10-31', 2), '2026-11-02');
});

test('day number and remaining days clamp before, during, and after a sprint', () => {
  const challenge = createReadingChallenge('reader-1', 5, '2026-09-07', new Date(0));
  assert.deepEqual(
    [deriveChallengeProgress(challenge, '2026-09-01').dayNumber, deriveChallengeProgress(challenge, '2026-09-01').daysRemaining],
    [1, 29],
  );
  assert.deepEqual(
    [deriveChallengeProgress(challenge, '2026-09-21').dayNumber, deriveChallengeProgress(challenge, '2026-09-21').daysRemaining],
    [15, 15],
  );
  assert.deepEqual(
    [deriveChallengeProgress(challenge, '2026-10-12').dayNumber, deriveChallengeProgress(challenge, '2026-10-12').daysRemaining],
    [30, 0],
  );
});

test('progress clamps day counters but preserves over-target percentage', () => {
  const challenge = createReadingChallenge('reader-1', 5, '2026-09-07', new Date(0));
  const withBooks = ['a', 'b', 'c', 'd', 'e', 'f'].reduce(
    (value, bookId) => addBookCompletion(value, bookId, '2026-09-08', new Date(0)),
    challenge,
  );
  const progress = deriveChallengeProgress(withBooks, '2026-09-08');

  assert.equal(progress.dayNumber, 2);
  assert.equal(progress.current, 6);
  assert.equal(progress.percentage, 120);
  assert.equal(progress.clampedPercentage, 100);
  assert.equal(progress.status, 'completed');
});

test('an elapsed challenge is expired even when its goal was reached', () => {
  const challenge = addBookCompletion(
    createReadingChallenge('reader-1', 1, '2026-08-01', new Date(0)),
    'atomic-habits',
    '2026-08-01',
    new Date(0),
  );
  assert.equal(deriveChallengeProgress(challenge, '2026-09-07').status, 'expired');
});

test('an open challenge is active until its target is met', () => {
  const challenge = createReadingChallenge('reader-1', 1, '2026-09-07', new Date(0));
  assert.equal(deriveChallengeProgress(challenge, '2026-09-07').status, 'active');
});

test('challenge creation rejects goals outside the persisted bounds', () => {
  assert.throws(() => createReadingChallenge('reader-1', 0, '2026-09-07'), /between 1 and 1000/);
  assert.throws(() => createReadingChallenge('reader-1', 1001, '2026-09-07'), /between 1 and 1000/);
});

test('streak ends today, falls back to yesterday, ignores duplicate books, and breaks on a gap', () => {
  let challenge = createReadingChallenge('reader-1', 10, '2026-09-01', new Date(0));
  challenge = addBookCompletion(challenge, 'a', '2026-09-04', new Date(0));
  challenge = addBookCompletion(challenge, 'b', '2026-09-05', new Date(0));
  challenge = addBookCompletion(challenge, 'c', '2026-09-05', new Date(0));
  challenge = addBookCompletion(challenge, 'd', '2026-09-06', new Date(0));

  assert.equal(deriveChallengeProgress(challenge, '2026-09-06').streak, 3);
  assert.equal(deriveChallengeProgress(challenge, '2026-09-07').streak, 3);
  assert.equal(deriveChallengeProgress(challenge, '2026-09-08').streak, 0);
});

test('legacy normalization preserves books without fabricating completion dates', () => {
  const normalized = normalizeReadingChallenge({
    userId: 'reader-1', year: 2026, goal: 12, booksRead: ['atomic-habits'],
    createdAt: new Date(0), updatedAt: new Date(1),
  }, 'reader-1', '2026-09-07');

  assert.equal(normalized?.schemaVersion, 2);
  assert.equal(normalized?.startDate, '2026-09-07');
  assert.equal(normalized?.endDate, '2026-10-06');
  assert.deepEqual(normalized?.booksRead, ['atomic-habits']);
  assert.deepEqual(normalized?.bookCompletions, []);
});

test('unmarking removes both the book and its dated completion', () => {
  const complete = addBookCompletion(
    createReadingChallenge('reader-1', 5, '2026-09-07', new Date(0)),
    'atomic-habits',
    '2026-09-07',
    new Date(1),
  );
  assert.deepEqual(removeBookCompletion(complete, 'atomic-habits', new Date(2)).booksRead, []);
  assert.deepEqual(removeBookCompletion(complete, 'atomic-habits', new Date(2)).bookCompletions, []);
});

test('the most recently updated open challenge wins across a year boundary', () => {
  const older = createReadingChallenge('reader-1', 5, '2026-12-20', new Date(1));
  const newer = createReadingChallenge('reader-1', 10, '2027-01-02', new Date(2));
  assert.equal(selectCurrentChallenge([older, newer], '2027-01-03')?.goal, 10);
});
```

- [ ] **Step 2: Run the model test and confirm it fails**

Run: `npx tsx --test tests/readingChallengeModel.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `challengeModel`.

- [ ] **Step 3: Implement the pure model**

Create the exported types and functions with these exact rules:

```ts
const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const dateOrdinal = (key: DateKey) => {
  const match = DATE_KEY.exec(key);
  if (!match) return Number.NaN;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000;
};

export const toLocalDateKey = (date: Date): DateKey =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const addCalendarDays = (dateKey: DateKey, amount: number): DateKey => {
  const ordinal = dateOrdinal(dateKey);
  if (!Number.isFinite(ordinal)) throw new Error(`Invalid date key: ${dateKey}`);
  const date = new Date((ordinal + amount) * 86_400_000);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

export const differenceInCalendarDays = (from: DateKey, to: DateKey) =>
  dateOrdinal(to) - dateOrdinal(from);
```

For `normalizeReadingChallenge`, reject missing ownership/goal/books, deduplicate `booksRead`, accept only valid version-2 dates with `endDate === addCalendarDays(startDate, 29)`, otherwise use `today` and `addCalendarDays(today, 29)`. Preserve only completion records whose `bookId` is still in `booksRead` and whose date key is valid. Convert Firestore timestamps before calling this function; the pure module accepts `Date` values only.

For `deriveChallengeProgress`, use:

```ts
const todayOffset = differenceInCalendarDays(challenge.startDate, today);
const elapsed = differenceInCalendarDays(challenge.endDate, today) > 0;
const current = challenge.booksRead.length;
const percentage = challenge.goal > 0 ? (current / challenge.goal) * 100 : 0;
const completedDays = [...new Set(challenge.bookCompletions.map((item) => item.completedOn))]
  .filter((key) => differenceInCalendarDays(challenge.startDate, key) >= 0)
  .filter((key) => differenceInCalendarDays(key, challenge.endDate) >= 0)
  .sort();
const completedSet = new Set(completedDays);
let cursor = completedSet.has(today) ? today : addCalendarDays(today, -1);
let streak = completedSet.has(cursor) ? 1 : 0;
while (streak > 0 && completedSet.has(addCalendarDays(cursor, -1))) {
  cursor = addCalendarDays(cursor, -1);
  streak += 1;
}
const daysRemaining = clamp(differenceInCalendarDays(today, challenge.endDate), 0, 29);
const remainingBooks = Math.max(challenge.goal - current, 0);

return {
  current,
  goal: challenge.goal,
  percentage,
  clampedPercentage: clamp(percentage, 0, 100),
  dayNumber: clamp(todayOffset + 1, 1, 30),
  daysRemaining,
  completedDays,
  streak,
  weeklyPace: remainingBooks === 0 ? 0 : Math.ceil((remainingBooks / Math.max(daysRemaining + 1, 1)) * 7),
  status: elapsed ? 'expired' : current >= challenge.goal ? 'completed' : 'active',
};
```

`createReadingChallenge` and `setChallengeGoal` throw `new RangeError('Goal must be between 1 and 1000.')` unless the goal is an integer from 1 through 1000. Creation sets `endDate` with `addCalendarDays(today, 29)`, empty progress arrays, `year` from the first four date characters, and both timestamps to `now`. `addBookCompletion` is idempotent, appends one `{bookId, completedOn}` entry only for a new book, and updates `updatedAt`. `removeBookCompletion` removes all matching IDs from both arrays. `selectCurrentChallenge` prefers non-expired candidates and then sorts by `updatedAt.getTime()` descending; when all candidates are expired it returns the most recently updated candidate.

- [ ] **Step 4: Run the model tests**

Run: `npx tsx --test tests/readingChallengeModel.test.ts`

Expected: 10 tests PASS.

- [ ] **Step 5: Commit the domain model**

```bash
git add components/reading-challenge/challengeModel.ts tests/readingChallengeModel.test.ts
git commit -m "feat: add rolling reading challenge model"
```

### Task 2: Upgrade the Firestore context without eager migration writes

**Files:**
- Create: `contexts/readingChallengeStore.ts`
- Modify: `contexts/ReadingChallengeContext.tsx`
- Modify: `pages/ReadingChallengePage.tsx` (temporary API compatibility; Task 8 replaces the page)
- Create: `tests/readingChallengeStore.test.ts`

**Interfaces:**
- Consumes: Every type and helper from Task 1.
- Produces:
  - `getChallengeDocumentId(userId: string, startDate: DateKey): string`
  - `getCandidateChallengeDocumentIds(userId: string, today: DateKey): [string, string]`
  - `getChallengeWriteFields(challenge: ReadingChallenge): Omit<ReadingChallenge, 'createdAt' | 'updatedAt'>`
  - Context methods exactly matching the approved `ReadingChallengeContextType` in the spec.

- [ ] **Step 1: Write the failing store and source-contract tests**

```ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  getCandidateChallengeDocumentIds,
  getChallengeDocumentId,
  getChallengeWriteFields,
} from '../contexts/readingChallengeStore';
import { createReadingChallenge } from '../components/reading-challenge/challengeModel';

test('document IDs use the sprint start year and include the previous year candidate', () => {
  assert.equal(getChallengeDocumentId('reader-1', '2026-12-20'), 'reader-1_2026');
  assert.deepEqual(getCandidateChallengeDocumentIds('reader-1', '2027-01-03'), [
    'reader-1_2027',
    'reader-1_2026',
  ]);
});

test('write fields always contain a complete version-2 shape and no client timestamps', () => {
  const fields = getChallengeWriteFields(createReadingChallenge('reader-1', 5, '2026-09-07'));
  assert.deepEqual(Object.keys(fields).sort(), [
    'bookCompletions', 'booksRead', 'endDate', 'goal', 'schemaVersion', 'startDate', 'userId', 'year',
  ]);
  assert.equal(fields.schemaVersion, 2);
});

test('the context loads both candidates in parallel and exposes explicit lifecycle methods', async () => {
  const source = await readFile(new URL('../contexts/ReadingChallengeContext.tsx', import.meta.url), 'utf8');
  assert.match(source, /Promise\.all\(/);
  assert.match(source, /startChallenge:/);
  assert.match(source, /updateGoal:/);
  assert.match(source, /restartChallenge:/);
  assert.doesNotMatch(source, /setGoal:/);
});
```

- [ ] **Step 2: Run the store test and confirm it fails**

Run: `npx tsx --test tests/readingChallengeStore.test.ts`

Expected: FAIL because `readingChallengeStore.ts` does not exist and the old context exposes `setGoal`.

- [ ] **Step 3: Add store helpers and rewrite the context**

Implement `readingChallengeStore.ts` as a Firebase-free mapper:

```ts
import { DateKey, ReadingChallenge } from '../components/reading-challenge/challengeModel';

export const getChallengeDocumentId = (userId: string, startDate: DateKey) =>
  `${userId}_${startDate.slice(0, 4)}`;

export const getCandidateChallengeDocumentIds = (userId: string, today: DateKey): [string, string] => {
  const year = Number(today.slice(0, 4));
  return [`${userId}_${year}`, `${userId}_${year - 1}`];
};

export const getChallengeWriteFields = ({ createdAt: _createdAt, updatedAt: _updatedAt, ...fields }: ReadingChallenge) => fields;
```

Rewrite the context to:

1. Compute `todayKey = toLocalDateKey(new Date())` inside each load or mutation, not once at module scope.
2. Use `getCandidateChallengeDocumentIds`, `doc`, and `Promise.all(ids.map((id) => getDoc(...)))`.
3. Convert `createdAt` and `updatedAt` with `value?.toDate?.() ?? new Date()` before `normalizeReadingChallenge`.
4. Ignore a legacy previous-year candidate because it has no dates proving a cross-year sprint; normalize only current-year legacy data. Call `selectCurrentChallenge` after removing missing documents.
5. Track the selected challenge only; loading performs no `setDoc`/`updateDoc`.
6. Implement a private `writeMutation(next: ReadingChallenge, mode: 'create' | 'update')` helper. For an existing document, call `updateDoc(ref, { ...getChallengeWriteFields(next), updatedAt: serverTimestamp() })`; for a new document, call `setDoc(ref, { ...getChallengeWriteFields(next), createdAt: serverTimestamp(), updatedAt: serverTimestamp() })`.
7. `startChallenge(goal)` creates empty progress at today and writes to the current-year ID.
8. `updateGoal(goal)` applies `setChallengeGoal`; it never changes dates or completed books.
9. `restartChallenge(goal)` creates empty progress at today. If that year’s document already exists, update it while preserving its `createdAt`; otherwise create it.
10. `markBookAsRead(bookId)` applies `addBookCompletion(challenge, bookId, todayKey)`. `unmarkBookAsRead(bookId)` applies `removeBookCompletion`.
11. `deleteGoal()` deletes `getChallengeDocumentId(user.id, challenge.startDate)`.
12. Update local React state only after the Firestore promise resolves; throw failures so the page can preserve state and show retry copy.

Keep the current page compiling during this refactor: replace its `setGoal` destructuring with `startChallenge` and `updateGoal`, and replace `await setGoal(goal)` with `await (challenge ? updateGoal(goal) : startChallenge(goal))`. Task 8 will then replace the annual UI completely.

Expose this exact context surface:

```ts
interface ReadingChallengeContextType {
  challenge: ReadingChallenge | null;
  loading: boolean;
  startChallenge: (goal: number) => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  restartChallenge: (goal: number) => Promise<void>;
  deleteGoal: () => Promise<void>;
  markBookAsRead: (bookId: string) => Promise<void>;
  unmarkBookAsRead: (bookId: string) => Promise<void>;
  isBookRead: (bookId: string) => boolean;
  progress: ChallengeProgress;
}
```

When `challenge` is null, return a stable zero progress object: current/goal/percentage/clampedPercentage/dayNumber/daysRemaining/streak/weeklyPace all `0`, `completedDays: []`, and `status: 'active'`.

- [ ] **Step 4: Run focused tests and the TypeScript production build**

Run: `npx tsx --test tests/readingChallengeModel.test.ts tests/readingChallengeStore.test.ts`

Expected: 13 tests PASS.

Run: `npm run build`

Expected: build and SEO prerender complete without a TypeScript error.

- [ ] **Step 5: Commit the persistence layer when the build is green**

```bash
git add contexts/readingChallengeStore.ts contexts/ReadingChallengeContext.tsx pages/ReadingChallengePage.tsx tests/readingChallengeStore.test.ts
git commit -m "feat: persist versioned 30-day challenges"
```

### Task 3: Permit valid version-2 documents and legacy upgrades in Firestore rules

**Files:**
- Modify: `firestore.rules`
- Modify: `tests/firestore.rules.test.mjs`

**Interfaces:**
- Consumes: The version-2 write shape from `getChallengeWriteFields` plus server `createdAt` and `updatedAt` timestamps.
- Produces: Rule validation that accepts new creates and full legacy-to-v2 updates while preserving ownership and immutable metadata.

- [ ] **Step 1: Add failing version-2 rule cases**

Add this payload next to `challengePayload`:

```js
const challengeV2Payload = (uid = 'reader-1') => ({
  schemaVersion: 2,
  userId: uid,
  year: 2026,
  goal: 10,
  booksRead: ['atomic-habits'],
  startDate: '2026-09-07',
  endDate: '2026-10-06',
  bookCompletions: [{ bookId: 'atomic-habits', completedOn: '2026-09-07' }],
  createdAt: timestamp(),
  updatedAt: timestamp(),
});
```

Add these tests under `describe('reading challenges')`:

```js
it('accepts a complete version-2 challenge and an owner legacy upgrade', async () => {
  await assertSucceeds(authContext().firestore()
    .collection('reading_challenges').doc('reader-1_2026').set(challengeV2Payload()));

  await seedDocument('reading_challenges/reader-1_2025', {
    userId: 'reader-1', year: 2025, goal: 12, booksRead: ['legacy-book'],
    createdAt: storedTimestamp(), updatedAt: storedTimestamp(),
  });
  await assertSucceeds(authContext().firestore()
    .collection('reading_challenges').doc('reader-1_2025').update({
      schemaVersion: 2,
      goal: 10,
      startDate: '2026-09-07',
      endDate: '2026-10-06',
      bookCompletions: [],
      updatedAt: timestamp(),
    }));
});

it('rejects incomplete, mistyped, spoofed, and oversized version-2 writes', async () => {
  const db = authContext().firestore().collection('reading_challenges');
  const { startDate: _missing, ...withoutStart } = challengeV2Payload();
  await assertFails(db.doc('missing').set(withoutStart));
  await assertFails(db.doc('bad-version').set({ ...challengeV2Payload(), schemaVersion: 3 }));
  await assertFails(db.doc('bad-date').set({ ...challengeV2Payload(), startDate: 20260907 }));
  await assertFails(db.doc('spoofed').set(challengeV2Payload('reader-2')));
  await assertFails(db.doc('too-many-completions').set({
    ...challengeV2Payload(),
    bookCompletions: Array.from({ length: 1001 }, (_, index) => ({ bookId: String(index), completedOn: '2026-09-07' })),
  }));
});
```

- [ ] **Step 2: Run the rules tests and confirm they fail**

Run: `npm run test:rules`

Expected: existing legacy cases pass; the new version-2 create and legacy upgrade fail.

- [ ] **Step 3: Split legacy and version-2 validation**

Replace `isValidReadingChallenge` with three helpers:

```rules
function hasValidChallengeBase(data) {
  return data.userId == request.auth.uid &&
         data.year is int && data.year >= 2020 && data.year <= 2100 &&
         data.goal is int && data.goal > 0 && data.goal <= 1000 &&
         data.booksRead is list && data.booksRead.size() <= 1000 &&
         data.createdAt is timestamp && data.updatedAt is timestamp;
}

function isValidLegacyReadingChallenge(data) {
  return data.keys().hasOnly(['userId', 'year', 'goal', 'booksRead', 'createdAt', 'updatedAt']) &&
         data.keys().hasAll(['userId', 'year', 'goal', 'booksRead', 'createdAt', 'updatedAt']) &&
         hasValidChallengeBase(data);
}

function isValidV2ReadingChallenge(data) {
  return data.keys().hasOnly([
           'schemaVersion', 'userId', 'year', 'goal', 'booksRead', 'startDate',
           'endDate', 'bookCompletions', 'createdAt', 'updatedAt'
         ]) &&
         data.keys().hasAll([
           'schemaVersion', 'userId', 'year', 'goal', 'booksRead', 'startDate',
           'endDate', 'bookCompletions', 'createdAt', 'updatedAt'
         ]) &&
         hasValidChallengeBase(data) &&
         data.schemaVersion == 2 &&
         data.startDate is string && data.startDate.size() == 10 &&
         data.endDate is string && data.endDate.size() == 10 &&
         data.bookCompletions is list && data.bookCompletions.size() <= 1000;
}
```

Use `(isValidLegacyReadingChallenge(request.resource.data) || isValidV2ReadingChallenge(request.resource.data))` for create so existing clients remain compatible. Use `isValidV2ReadingChallenge(request.resource.data)` for update so every mutation upgrades legacy data. Keep `userId`, `year`, and `createdAt` immutable and require `updatedAt == request.time`.

Firestore rules cannot reliably validate every nested map in a list, so primitive list shape, total size, ownership, version, and date-string presence are enforced server-side; exact `bookId`/`completedOn` normalization remains in the trusted client model.

- [ ] **Step 4: Run the full rules suite**

Run: `npm run test:rules`

Expected: all feedback and reading-challenge rule tests PASS.

- [ ] **Step 5: Commit the rule upgrade**

```bash
git add firestore.rules tests/firestore.rules.test.mjs
git commit -m "feat: validate versioned reading challenges"
```

### Task 4: Build the signature 30-stop Reader’s Trail

**Files:**
- Create: `components/reading-challenge/ReaderTrail.tsx`
- Create: `tests/readerTrail.test.tsx`

**Interfaces:**
- Consumes: `ReadingChallenge` and `ChallengeProgress` from Task 1.
- Produces: `ReaderTrail({ challenge, progress }: { challenge: ReadingChallenge | null; progress: ChallengeProgress | null }): JSX.Element`.

- [ ] **Step 1: Write the failing trail structure test**

```tsx
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createReadingChallenge, addBookCompletion, deriveChallengeProgress } from '../components/reading-challenge/challengeModel';
import ReaderTrail from '../components/reading-challenge/ReaderTrail';

test('the trail exposes 30 labelled days, today, completion, and four milestones', () => {
  const challenge = addBookCompletion(
    createReadingChallenge('reader-1', 5, '2026-09-07', new Date(0)),
    'atomic-habits', '2026-09-07', new Date(1),
  );
  const markup = renderToStaticMarkup(React.createElement(ReaderTrail, {
    challenge,
    progress: deriveChallengeProgress(challenge, '2026-09-08'),
  }));

  assert.match(markup, /role="region"[^>]*aria-label="30-day reading trail"/);
  assert.equal((markup.match(/data-trail-day=/g) || []).length, 30);
  assert.equal((markup.match(/data-milestone="true"/g) || []).length, 4);
  assert.match(markup, /aria-label="Day 1, completed"/);
  assert.match(markup, /aria-label="Day 2, today, not completed"/);
  assert.match(markup, /Day 2 of 30/);
});
```

- [ ] **Step 2: Run the trail test and confirm it fails**

Run: `npx tsx --test tests/readerTrail.test.tsx`

Expected: FAIL because `ReaderTrail.tsx` does not exist.

- [ ] **Step 3: Implement the semantic trail**

Render a named `<section role="region" aria-label="30-day reading trail">`, a concise screen-reader summary, and an ordered list created with `Array.from({ length: 30 }, (_, index) => index + 1)`. When challenge or progress is null, render all 30 markers as `future` with labels such as “Day 1, not started.” Otherwise determine each marker’s date with `addCalendarDays(challenge.startDate, day - 1)` and state with this precedence:

```ts
const completed = progress.completedDays.includes(dateKey);
const isToday = day === progress.dayNumber && progress.status !== 'expired';
const isPast = day < progress.dayNumber || progress.status === 'expired';
const state = completed ? 'completed' : isToday ? 'today' : isPast ? 'missed' : 'future';
const milestone = [7, 14, 21, 30].includes(day);
const ariaLabel = `Day ${day}${isToday ? ', today' : ''}, ${completed ? 'completed' : 'not completed'}`;
```

Use `<Check>` inside completed markers and `<Flag>` for milestone markers with icons `aria-hidden="true"`. Give connectors `aria-hidden="true"`. Do not make trail markers buttons because they have no action.

- [ ] **Step 4: Run the trail test**

Run: `npx tsx --test tests/readerTrail.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the trail**

```bash
git add components/reading-challenge/ReaderTrail.tsx tests/readerTrail.test.tsx
git commit -m "feat: add accessible 30-day reader trail"
```

### Task 5: Build the challenge hero and resilient page states

**Files:**
- Create: `components/reading-challenge/ChallengeHero.tsx`
- Create: `components/reading-challenge/ChallengeStates.tsx`
- Create: `tests/readingChallengeHero.test.tsx`

**Interfaces:**
- Consumes: `ReadingChallenge`, `ChallengeProgress`, `ReaderTrail`, React Router `Link`, and optional `Book` for today’s mission.
- Produces:
  - `ChallengeHero({ challenge, progress, nextBook, onStart, onUpdate, onRestart, onDelete }: ChallengeHeroProps)`
  - `SignedOutChallengeState(): JSX.Element`
  - `ChallengeLoadingState(): JSX.Element`

```ts
interface ChallengeHeroProps {
  challenge: ReadingChallenge | null;
  progress: ChallengeProgress | null;
  nextBook: Book | null;
  onStart(goal: number): void;
  onUpdate(): void;
  onRestart(): void;
  onDelete(): void;
}
```

- [ ] **Step 1: Write the failing hero and state tests**

```tsx
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { createReadingChallenge, deriveChallengeProgress } from '../components/reading-challenge/challengeModel';
import ChallengeHero from '../components/reading-challenge/ChallengeHero';
import { ChallengeLoadingState, SignedOutChallengeState } from '../components/reading-challenge/ChallengeStates';

const render = (node: React.ReactElement) => renderToStaticMarkup(
  React.createElement(StaticRouter, { location: '/reading-challenge' }, node),
);

test('the active hero makes status, day, goal presets, mission, and controls explicit', () => {
  const challenge = createReadingChallenge('reader-1', 10, '2026-09-07', new Date(0));
  const markup = render(React.createElement(ChallengeHero, {
    challenge,
    progress: deriveChallengeProgress(challenge, '2026-09-08'),
    nextBook: {
      id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear',
      category: 'Habits', coverImageUrl: '/atomic.jpg', arabicSlug: 'atomic-habits',
    },
    onStart: () => undefined, onUpdate: () => undefined,
    onRestart: () => undefined, onDelete: () => undefined,
  }));
  assert.match(markup, /30-day reading sprint/i);
  assert.match(markup, /Day 02/);
  assert.match(markup, /Today’s mission/);
  assert.match(markup, /Atomic Habits/);
  assert.match(markup, /Update goal/);
});

test('empty and expired heroes present one clear next action', () => {
  const empty = render(React.createElement(ChallengeHero, {
    challenge: null, progress: null, nextBook: null,
    onStart: () => undefined, onUpdate: () => undefined,
    onRestart: () => undefined, onDelete: () => undefined,
  }));
  assert.equal((empty.match(/data-goal-preset=/g) || []).length, 3);
  assert.equal((empty.match(/data-trail-day=/g) || []).length, 30);
  assert.match(empty, />5 summaries</);
  assert.match(empty, />10 summaries</);
  assert.match(empty, />15 summaries</);

  const expiredChallenge = createReadingChallenge('reader-1', 5, '2026-08-01', new Date(0));
  const expired = render(React.createElement(ChallengeHero, {
    challenge: expiredChallenge,
    progress: deriveChallengeProgress(expiredChallenge, '2026-09-07'),
    nextBook: null,
    onStart: () => undefined, onUpdate: () => undefined,
    onRestart: () => undefined, onDelete: () => undefined,
  }));
  assert.match(expired, /Start a new 30 days/);
});

test('a completed sprint celebrates the goal without hiding continued progress', () => {
  const challenge = { ...createReadingChallenge('reader-1', 1, '2026-09-07', new Date(0)), booksRead: ['a'] };
  const markup = render(React.createElement(ChallengeHero, {
    challenge,
    progress: deriveChallengeProgress(challenge, '2026-09-08'),
    nextBook: null,
    onStart: () => undefined, onUpdate: () => undefined,
    onRestart: () => undefined, onDelete: () => undefined,
  }));
  assert.match(markup, /Goal reached/);
  assert.match(markup, /1 of 1/);
});

test('signed-out and loading states explain the product without a generic spinner', () => {
  const signedOut = render(React.createElement(SignedOutChallengeState));
  const loading = render(React.createElement(ChallengeLoadingState));
  assert.match(signedOut, /Start your sprint/);
  assert.match(signedOut, /href="\/login"/);
  assert.match(loading, /aria-label="Loading your reading challenge"/);
  assert.doesNotMatch(loading, /animate-spin/);
});
```

- [ ] **Step 2: Run the hero tests and confirm they fail**

Run: `npx tsx --test tests/readingChallengeHero.test.tsx`

Expected: FAIL because the hero and state modules do not exist.

- [ ] **Step 3: Implement the hero and states**

`ChallengeHero` must render exactly one page-level `<h1>`, status copy derived from `progress.status`, a monospaced `DAY NN / 30` metric, the `ReaderTrail`, and these branches:

- Null challenge: inline preset buttons with `data-goal-preset="5|10|15"` calling `onStart(preset)`.
- Active/completed: today’s mission links to `/summary/${nextBook.arabicSlug || nextBook.id}`; if no unread book exists, link to `/summaries` with “Browse the full library”.
- Expired: final count plus one primary `Start a new 30 days` button calling `onRestart()`; the page retains `challenge.goal` as the dialog’s initial value.
- All non-null states: calm statistics for completed count, target, streak, weekly pace, plus secondary Update goal, Restart sprint, and Delete challenge controls. `Restart sprint` always calls `onRestart`; the page decides whether confirmation is required.

Use visible labels in addition to icons. Give the statistics rail `role="region"`, `aria-label="Challenge statistics"`, and `tabIndex={0}` so overflowed mobile statistics are keyboard-scrollable.

`SignedOutChallengeState` renders a six-marker miniature trail, one `<h1>`, a primary `/signup` link labelled “Start your sprint”, and a secondary `/login` link. `ChallengeLoadingState` renders a static 30-marker skeleton with `aria-label="Loading your reading challenge"` and `aria-busy="true"`.

- [ ] **Step 4: Run the hero tests**

Run: `npx tsx --test tests/readingChallengeHero.test.tsx tests/readerTrail.test.tsx`

Expected: all tests PASS.

- [ ] **Step 5: Commit the hero and states**

```bash
git add components/reading-challenge/ChallengeHero.tsx components/reading-challenge/ChallengeStates.tsx tests/readingChallengeHero.test.tsx
git commit -m "feat: add reader trail hero states"
```

### Task 6: Build the primary library workspace and completed shelf

**Files:**
- Create: `components/reading-challenge/ChallengeLibrary.tsx`
- Create: `tests/readingChallengeLibrary.test.tsx`

**Interfaces:**
- Consumes: `Book[]`, `query`, `categoryFilter`, `pendingBookId`, and mark/unmark callbacks supplied by the page.
- Produces: `ChallengeLibrary(props: ChallengeLibraryProps): JSX.Element` with labelled filters, two-column minimum phone layout, completed shelf, and milestone support.

- [ ] **Step 1: Write the failing library test**

```tsx
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import ChallengeLibrary from '../components/reading-challenge/ChallengeLibrary';

const books = [
  { id: 'a', title: 'Atomic Habits', author: 'James Clear', category: 'Habits', coverImageUrl: '/atomic.jpg' },
  { id: 'b', title: 'Deep Work', author: 'Cal Newport', category: 'Productivity', coverImageUrl: '/deep.jpg' },
];

test('the library prioritizes unread books and keeps completed books reversible', () => {
  const markup = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/' }, React.createElement(ChallengeLibrary, {
    books,
    readBookIds: ['a'],
    completedDays: [],
    query: '',
    categoryFilter: 'All',
    pendingBookId: 'b',
    onQueryChange: () => undefined,
    onCategoryChange: () => undefined,
    onMarkRead: () => undefined,
    onUnmarkRead: () => undefined,
  })));

  assert.match(markup, /<section[^>]*aria-labelledby="challenge-library-title"/);
  assert.match(markup, /<label[^>]*for="challenge-book-search"/);
  assert.match(markup, /<label[^>]*for="challenge-category-filter"/);
  assert.match(markup, /Choose your next summary/);
  assert.match(markup, /Completed shelf/);
  assert.match(markup, /aria-label="Mark Atomic Habits as unread"/);
  assert.match(markup, /aria-label="Mark Deep Work as read"[^>]*disabled/);
  assert.match(markup, /alt="Atomic Habits book cover"/);
});
```

- [ ] **Step 2: Run the library test and confirm it fails**

Run: `npx tsx --test tests/readingChallengeLibrary.test.tsx`

Expected: FAIL because `ChallengeLibrary.tsx` does not exist.

- [ ] **Step 3: Implement the library workspace**

Export this prop contract:

```ts
interface ChallengeLibraryProps {
  books: Book[];
  readBookIds: string[];
  completedDays: DateKey[];
  query: string;
  categoryFilter: string;
  pendingBookId: string | null;
  onQueryChange(value: string): void;
  onCategoryChange(value: string): void;
  onMarkRead(bookId: string): void;
  onUnmarkRead(bookId: string): void;
}
```

Inside the component, derive sorted unique categories and filter unread books by lowercased title, author, and category. The primary section contains explicit `<label>` elements, not placeholder-only labels. Each card links to the summary, uses alt text `${book.title} book cover`, and disables its mark button when `pendingBookId === book.id`. The completed shelf uses the last six read books in reverse library order, and every item keeps a 44px unmark control.

When no unread books match, render `role="status"` with “Clear the search or choose another category.” When the completed shelf is empty, render “Mark your first summary as read to begin the trail.” Add milestone badges for days 7, 14, 21, and 30 as quiet secondary content; their unlocked state is based on whether that day is in `completedDays`, passed as an additional `completedDays: DateKey[]` prop.

- [ ] **Step 4: Run the library test**

Run: `npx tsx --test tests/readingChallengeLibrary.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the library**

```bash
git add components/reading-challenge/ChallengeLibrary.tsx tests/readingChallengeLibrary.test.tsx
git commit -m "feat: add challenge reading workspace"
```

### Task 7: Replace the goal and deletion overlays with accessible lifecycle dialogs

**Files:**
- Create: `components/reading-challenge/ChallengeDialogs.tsx`
- Create: `tests/readingChallengeDialogs.test.tsx`
- Reuse: `components/modalFocusTrap.ts`

**Interfaces:**
- Consumes: `getModalFocusWrapTarget` and controlled values/callbacks from the page.
- Produces: `ChallengeDialog` supporting `mode: 'start' | 'update' | 'restart' | 'delete'`, preset goal selection, loading states, Escape close, focus trap, and focus restoration.

```ts
export type DialogMode = 'start' | 'update' | 'restart' | 'delete';

interface ChallengeDialogProps {
  mode: DialogMode;
  goal: string;
  error: string | null;
  isSubmitting: boolean;
  onGoalChange(value: string): void;
  onClose(): void;
  onConfirm(): void;
}
```

- [ ] **Step 1: Write the failing dialog semantics test**

```tsx
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ChallengeDialog from '../components/reading-challenge/ChallengeDialogs';

test('goal and destructive dialogs are labelled, announced, and disabled while saving', () => {
  const update = renderToStaticMarkup(React.createElement(ChallengeDialog, {
    mode: 'update', goal: '10', error: 'Try again.', isSubmitting: true,
    onGoalChange: () => undefined, onClose: () => undefined, onConfirm: () => undefined,
  }));
  assert.match(update, /role="dialog"/);
  assert.match(update, /aria-modal="true"/);
  assert.match(update, /aria-labelledby="challenge-dialog-title"/);
  assert.match(update, /aria-live="polite"/);
  assert.match(update, /<label[^>]*for="challenge-goal-input"/);
  assert.match(update, /disabled/);

  const remove = renderToStaticMarkup(React.createElement(ChallengeDialog, {
    mode: 'delete', goal: '10', error: null, isSubmitting: false,
    onGoalChange: () => undefined, onClose: () => undefined, onConfirm: () => undefined,
  }));
  assert.match(remove, /Delete this sprint/);
  assert.match(remove, /cannot be undone/i);
});
```

- [ ] **Step 2: Run the dialog test and confirm it fails**

Run: `npx tsx --test tests/readingChallengeDialogs.test.tsx`

Expected: FAIL because `ChallengeDialogs.tsx` does not exist.

- [ ] **Step 3: Implement lifecycle dialogs using the established modal pattern**

Copy the focus-management structure from `components/SignUpPromptModal.tsx`: save `document.activeElement` in a ref on mount, focus the first control, query `button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]`, use `getModalFocusWrapTarget` on Tab, close on Escape when not submitting, and restore the prior focus in cleanup.

Use these exact visible titles:

```ts
const titles = {
  start: 'Start your 30-day sprint',
  update: 'Update your summary goal',
  restart: 'Start a fresh 30 days',
  delete: 'Delete this sprint?',
} as const;
```

Start/update/restart render presets 5/10/15 and a numeric input with min 1, max 1000. Restart copy says progress and dates will reset. Delete renders no input and uses Coral only for the final confirm button. Every close/confirm control is disabled while saving, errors live inside `role="status" aria-live="polite"`, and the backdrop has z-index 80.

- [ ] **Step 4: Run dialog and shared focus tests**

Run: `npx tsx --test tests/readingChallengeDialogs.test.tsx tests/modalFocusTrap.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit the dialogs**

```bash
git add components/reading-challenge/ChallengeDialogs.tsx tests/readingChallengeDialogs.test.tsx
git commit -m "feat: add accessible challenge dialogs"
```

### Task 8: Compose the page, add the forest-and-cream visual system, and expose the signed-out preview

**Files:**
- Rewrite: `pages/ReadingChallengePage.tsx`
- Create: `pages/ReadingChallengePage.css`
- Modify: `App.tsx`
- Create: `tests/readingChallengePage.test.tsx`

**Interfaces:**
- Consumes: Context API from Task 2 and all UI components from Tasks 4–7.
- Produces: The complete `/reading-challenge` experience for signed-out, loading, empty, active, completed, expired, error, and in-flight mutation states.

- [ ] **Step 1: Write the failing page integration and CSS-contract test**

```tsx
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the route is public and lazy-loads route-scoped challenge styles', async () => {
  const app = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  assert.match(app, /Promise\.all\(\s*\[\s*import\('\.\/pages\/ReadingChallengePage\.css'\),\s*import\('\.\/pages\/ReadingChallengePage'\),?\s*\]\s*\)/);
  assert.doesNotMatch(app, /path="\/reading-challenge"[\s\S]{0,120}<ProtectedRoute>/);
});

test('the page orchestrates explicit lifecycle methods and guards duplicate book writes', async () => {
  const page = await readFile(new URL('../pages/ReadingChallengePage.tsx', import.meta.url), 'utf8');
  assert.match(page, /startChallenge/);
  assert.match(page, /updateGoal/);
  assert.match(page, /restartChallenge/);
  assert.match(page, /pendingBookId/);
  assert.match(page, /aria-live="polite"/);
  assert.doesNotMatch(page, /endOfYear|monthsLeft|monthlyPace/);
});

test('the stylesheet encodes the approved responsive, accessible visual system', async () => {
  const css = await readFile(new URL('../pages/ReadingChallengePage.css', import.meta.url), 'utf8');
  assert.match(css, /--trail-forest:\s*#0b2b22/i);
  assert.match(css, /--trail-moss:\s*#355b45/i);
  assert.match(css, /--trail-cream:\s*#f6f0e3/i);
  assert.match(css, /--trail-brass:\s*#c99a46/i);
  assert.match(css, /font-family:\s*['"]Newsreader/i);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/i);
  assert.match(css, /min-height:\s*44px/i);
  assert.match(css, /outline:\s*1px solid/i);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/i);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /transition:\s*all/i);
  assert.doesNotMatch(css, /will-change:\s*all/i);
});
```

- [ ] **Step 2: Run the page test and confirm it fails**

Run: `npx tsx --test tests/readingChallengePage.test.tsx`

Expected: FAIL because the route still uses `ProtectedRoute`, the old annual API remains, and the stylesheet does not exist.

- [ ] **Step 3: Rewrite the page as the state and mutation orchestrator**

The page owns only transient UI state:

```ts
const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
const [goalInput, setGoalInput] = useState('10');
const [query, setQuery] = useState('');
const [categoryFilter, setCategoryFilter] = useState('All');
const [pendingBookId, setPendingBookId] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
```

Branch in this order: `!isAuthenticated` → `SignedOutChallengeState`; `loading` → `ChallengeLoadingState`; otherwise render `<ChallengeHero>` and, when a challenge is not expired, `<ChallengeLibrary>`. Pass the first unread filtered book as `nextBook`.

For goal submit, parse and validate `1–1000`, set `isSubmitting`, call the context method matching `dialogMode`, close on success, and use “Couldn’t save your challenge. Try again.” on failure. For mark/unmark, set `pendingBookId` before awaiting and clear it in `finally`; do not optimistically change state. Use “Couldn’t mark this summary as read. Try again.” and “Couldn’t return this summary to your list. Try again.” for those failures. Render feedback in one persistent `<div role="status" aria-live="polite">` so mutation results are announced.

Open restart confirmation when prior progress exists; when there is no progress, the expired hero may restart directly with its current goal. Keep delete inaccessible from the empty state.

- [ ] **Step 4: Implement the route-scoped CSS and route loading**

Wrap the page in `.reader-challenge` and declare all six approved colors as custom properties. Use a deep-forest hero with an asymmetric cream trail panel and a subtle radial brass highlight. Build the trail with CSS grid and zig-zag row direction on desktop; switch to a compact wrapping sequence below `720px`, keeping `.reader-trail__marker--today` ordered near the visible start.

Required CSS contracts:

```css
.reader-challenge {
  --trail-forest: #0b2b22;
  --trail-moss: #355b45;
  --trail-cream: #f6f0e3;
  --trail-parchment: #e8dcc5;
  --trail-brass: #c99a46;
  --trail-coral: #b85135;
  min-height: 100vh;
  padding-bottom: calc(6.5rem + env(safe-area-inset-bottom));
  background: var(--trail-cream);
  color: var(--trail-forest);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.reader-challenge h1,
.reader-challenge h2 { font-family: 'Newsreader', Georgia, serif; text-wrap: balance; }
.reader-challenge p { text-wrap: pretty; }
.reader-challenge__metric { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
.reader-challenge button,
.reader-challenge a,
.reader-challenge input,
.reader-challenge select { min-height: 44px; }
.reader-challenge :focus-visible { outline: 3px solid var(--trail-brass); outline-offset: 3px; }
.reader-trail__marker--today { animation: reader-trail-halo 2.4s ease-in-out infinite; }
.reader-challenge__progress-fill { transition: width 420ms cubic-bezier(.2,.8,.2,1); }

@media (max-width: 720px) {
  .reader-challenge__dashboard { grid-template-columns: 1fr; }
  .reader-challenge__book-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .reader-challenge__stats { overflow-x: auto; scroll-snap-type: x proximity; }
}

@media (prefers-reduced-motion: reduce) {
  .reader-trail__marker--today { animation: none; }
  .reader-challenge__enter,
  .reader-challenge__progress-fill { transition-duration: 0.01ms; }
}
```

Use Framer Motion only for the hero label, heading, trail, and mission stagger. Each animation starts no farther than `translateY(8px)` with an explicit duration/ease; render static elements when `useReducedMotion()` is true. Add pure-black/white `1px` image outlines and restrained shadows. Use Coral only in destructive confirmation UI.

In `App.tsx`, replace the lazy import with:

```ts
const ReadingChallengePage = lazy(async () => {
  const [, pageModule] = await Promise.all([
    import('./pages/ReadingChallengePage.css'),
    import('./pages/ReadingChallengePage'),
  ]);
  return pageModule;
});
```

Render `<Route path="/reading-challenge" element={<ReadingChallengePage />} />` without `ProtectedRoute`; authentication is now a designed page state.

- [ ] **Step 5: Run all feature tests**

Run:

```bash
npx tsx --test \
  tests/readingChallengeModel.test.ts \
  tests/readingChallengeStore.test.ts \
  tests/readerTrail.test.tsx \
  tests/readingChallengeHero.test.tsx \
  tests/readingChallengeLibrary.test.tsx \
  tests/readingChallengeDialogs.test.tsx \
  tests/readingChallengePage.test.tsx \
  tests/modalFocusTrap.test.ts
```

Expected: all tests PASS with no React rendering warnings.

- [ ] **Step 6: Run the production build**

Run: `npm run build`

Expected: sitemap, Vite build, and SEO prerender all complete. Confirm the output includes a separate ReadingChallengePage CSS asset rather than adding challenge styles to the global stylesheet.

- [ ] **Step 7: Commit the composed experience**

```bash
git add App.tsx pages/ReadingChallengePage.tsx pages/ReadingChallengePage.css tests/readingChallengePage.test.tsx
git commit -m "feat: redesign the 30-day reading challenge"
```

### Task 9: Perform final rules, regression, accessibility, and responsive QA

**Files:**
- Modify only if a verified issue is found: files from Tasks 1–8.
- Do not modify: unrelated dirty-worktree files.

**Interfaces:**
- Consumes: Complete feature implementation.
- Produces: Evidence that the feature works at the data, build, keyboard, motion, and responsive layers.

- [ ] **Step 1: Run the rules suite and all challenge tests from a clean command**

Run:

```bash
npm run test:rules
npx tsx --test tests/readingChallenge*.test.ts tests/readerTrail.test.tsx tests/modalFocusTrap.test.ts
```

Expected: every test PASS.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: exit code 0 with successful SEO prerender.

- [ ] **Step 3: Start the local app for visual QA**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL, normally `http://127.0.0.1:5173/`.

- [ ] **Step 4: Verify signed-out and authenticated lifecycle states**

At `/reading-challenge`, check:

- Signed out: miniature trail, one `h1`, working Sign up and Log in links.
- No challenge: 5/10/15 presets create day 1 through day 30 inclusive.
- Active: mark and unmark update count, today marker, shelf, and streak; rapid double-click cannot issue duplicate writes.
- Completed: real over-target count remains visible while the fill stays at 100%.
- Expired: final count and one “Start a new 30 days” primary action.
- Failed write: previous visual state remains and specific retry copy is announced.

- [ ] **Step 5: Verify layout at three widths**

Use 390×844, 820×1180, and 1440×1000 viewports. At each width confirm no page-level horizontal overflow, no clipped trail markers, at least two book columns on the phone, readable statistics, 44px controls, and final controls above the fixed mobile navbar.

- [ ] **Step 6: Verify keyboard and reduced motion**

Tab through goal presets, mission link, statistics rail, search, category filter, book cards, and challenge controls. Open each dialog, confirm focus enters it, Tab/Shift+Tab wrap, Escape closes when idle, saving disables controls, and focus returns to the trigger. Emulate `prefers-reduced-motion: reduce` and confirm the halo and entry movement stop.

- [ ] **Step 7: Inspect the final diff and commit only QA fixes**

Run: `git diff --check`

Expected: no whitespace errors.

If QA required fixes, stage only the exact challenge files changed and commit:

```bash
git add App.tsx components/reading-challenge contexts/ReadingChallengeContext.tsx contexts/readingChallengeStore.ts firestore.rules pages/ReadingChallengePage.tsx pages/ReadingChallengePage.css tests/readingChallengeModel.test.ts tests/readingChallengeStore.test.ts tests/readerTrail.test.tsx tests/readingChallengeHero.test.tsx tests/readingChallengeLibrary.test.tsx tests/readingChallengeDialogs.test.tsx tests/readingChallengePage.test.tsx tests/firestore.rules.test.mjs
git commit -m "fix: polish reader trail interactions"
```

If QA found no issues, do not create an empty commit.
