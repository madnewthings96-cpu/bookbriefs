# Trade Analyzer Journal Save Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a signed-in trader explicitly save verified MT5/cTrader closed trades into the existing journal, safely and without duplicate imports or invented trade fields.

**Architecture:** Extend the existing journal trade model only where imported data legitimately differs from manual entries. A pure mapper identifies saveable records and prepares provenance; a Firestore service uses deterministic document IDs and transactional create-only writes. The analyzer dashboard owns the opt-in Save UI, while the public import/analysis flow remains anonymous and read-only.

**Tech Stack:** React 18, TypeScript 5.8, Firebase Auth/Firestore 12, Node test runner, Firebase Rules Emulator.

**Spec:** `docs/superpowers/specs/2026-09-22-multi-platform-trade-analyzer-design.md`

## Global Constraints

- This plan starts only after `2026-09-22-public-trade-analyzer.md` passes its parser, reconciliation, dashboard, build, and real-export release gates.
- Save is an explicit post-verification action. No Firestore write on paste, upload, verification, or Analyze.
- Saveable records require native stable ID, symbol, direction, entry/exit timestamps, entry/exit prices, positive volume, and finite broker net P&L; other records remain analyzable but count as not saveable.
- Do not fabricate stop loss, R multiple, psychology, strategy, or a price-derived P&L.
- Deterministic import key includes platform, locally hashed account identifier when present, native ID, and source timestamps; never persist raw account number or owner name.
- Existing manual trades must never be overwritten. Re-importing an identical trade must be a no-op. A failed subset can be retried without duplicating successes.
- Preserve `users/{uid}/trades` ownership rules; all writes are scoped to the authenticated user's UID.
- Do not log imported rows or send them to analytics. Keep the dashboard intact on save failure.
- Stage only task files; preserve unrelated worktree changes.

## File map and interfaces

- `features/trade-analyzer/journalMapping.ts`: pure saveability check and journal document mapping.
- `features/trade-analyzer/journalSave.ts`: deterministic-key computation, preview and transactional create-only save.
- `utils/tradingUtils.ts`: journal `Trade` receives optional import provenance; `stopLoss` can be `number | null` for imported records.
- `components/trading/TradingReviewDrawer.tsx`, `TradingCommandCenter.tsx`, `AddTradeModal.tsx`, and `pages/TradingJournalPage.tsx`: null-safe stop-loss display/completeness and edit preservation of broker P&L.
- `components/trade-analyzer/Dashboard.tsx` or focused `SaveToJournal.tsx`: save preview/action/status, no persistence logic in presentational components.
- `pages/TradeAnalyzerPage.tsx`: authenticated user wiring through existing `useFirebase()` context.
- `utils/tradingUtils.ts`, `utils/tradingReportModel.ts`, `utils/pdfReportGenerator.ts`, `components/trading/TradeCalendar.tsx`, and `components/trading/TradeTable.tsx`: imported trade results use their close time in P&L groupings while preserving source entry date for detail/editing.
- `tests/tradeAnalyzerJournal*.test.ts(x)`, `tests/firestore.rules.test.mjs`: mapper, retry/idempotency/authorization/date behavior.

---

### Task 1: Saveability and honest journal mapping

**Files:** Create `features/trade-analyzer/journalMapping.ts`, `tests/tradeAnalyzerJournalMapping.test.ts`; modify `utils/tradingUtils.ts`, `components/trading/TradingReviewDrawer.tsx`, `components/trading/TradingCommandCenter.tsx`, `components/trading/AddTradeModal.tsx`, `pages/TradingJournalPage.tsx`.

**Interfaces:** `getSaveability(record: ClosedTradeRecord): { saveable: boolean; reasons: string[] }`; `toJournalDocument(record: ClosedTradeRecord, importKey: string, currency: string, now: Timestamp): Omit<Trade, 'id'>`. `Trade.importSource?` is `{ platform: ImportPlatform; key: string; sourceId: string; importedAt: Timestamp; closeTime: Timestamp; currency: string; grouping: GroupingQuality }`. `Trade.stopLoss` becomes `number | null`.

- [ ] **Step 1: Write red mapper tests.** Cover complete trade, missing native ID, closure with no entry time, absent price/volume, and broker net P&L preservation. The complete case must assert `stopLoss === null`, no `rr`, and blank setup/emotions/notes:

```ts
const mapped = toJournalDocument(completeRecord, 'import_abc123', 'USD', Timestamp.fromMillis(1));
assert.equal(mapped.pnl, completeRecord.netPnl);
assert.equal(mapped.stopLoss, null);
assert.equal(mapped.rr, undefined);
assert.deepEqual([mapped.setup, mapped.emotions, mapped.notes], ['', '', '']);
assert.equal(getSaveability({ ...completeRecord, entryTime: null }).saveable, false);
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerJournalMapping.test.ts`; expect missing mapper.
- [ ] **Step 3: Implement strict mapping and null-safe journal display.** Map `entryDate` from source entry time and `createdAt` from `now`; retain broker `netPnl` in `pnl`. Set status from the sign of net P&L. `stopLoss=null` means unknown in the imported document, not zero. Show `Not provided` in the review drawer and treat null as incomplete in command-center checks. `AddTradeModal` already initializes edits in manual-P&L mode; preserve that for imports. In `TradingJournalPage.handleSaveTrade`, an imported edit with an empty stop-loss field retains `null` and omits `rr` instead of writing `0`, while a manual trade keeps its existing behavior. Keep `importSource` unchanged during edits.

```ts
export function getSaveability(record: ClosedTradeRecord): { saveable: boolean; reasons: string[] };
export function toJournalDocument(record: ClosedTradeRecord, importKey: string, currency: string, now: Timestamp): Omit<Trade, 'id'>;
```

- [ ] **Step 4: Confirm green.** Run mapper tests, `tests/tradingReportModel.test.ts`, `tests/pdfReportGenerator.test.ts`, and `npx tsc --noEmit`; expect pass.
- [ ] **Step 5: Commit.** `git add features/trade-analyzer/journalMapping.ts tests/tradeAnalyzerJournalMapping.test.ts utils/tradingUtils.ts components/trading/TradingReviewDrawer.tsx components/trading/TradingCommandCenter.tsx components/trading/AddTradeModal.tsx pages/TradingJournalPage.tsx && git commit -m "feat: map verified broker trades into journal"`.

### Task 2: Deterministic preview and create-only Firestore save

**Files:** Create `features/trade-analyzer/journalSave.ts`, `tests/tradeAnalyzerJournalSave.test.ts`; modify `tests/firestore.rules.test.mjs` only if extra provenance validation is introduced.

**Interfaces:** `makeImportKey(record: ClosedTradeRecord): Promise<string>` uses SHA-256 over platform + optional account hash + source ID + source entry/exit timestamps and returns `import_` plus hex digest. `JournalWriter` is `{ read(uid: string, id: string): Promise<Trade | null>; createIfAbsent(uid: string, id: string, document: Omit<Trade, 'id'>): Promise<'created' | 'existing' | 'collision'> }`. `SavePreview` is `{ newCount: number; existingCount: number; unsaveableCount: number; reasons: string[] }`. `previewJournalSave(writer: JournalWriter, uid: string, records: ClosedTradeRecord[]): Promise<SavePreview>` performs reads only. `saveJournalTrades(writer, uid, records, currency): Promise<SaveResult>` creates each saveable record transactionally only if its deterministic doc ID does not exist.

- [ ] **Step 1: Write red idempotency/retry tests.** Use an injected `JournalWriter` adapter in unit tests, then an emulator test for cross-user denial. Assert the first save creates, the second returns existing with no writes, a document at the deterministic ID with no matching `importSource.key` is never overwritten, and a one-record transient failure leaves other successes retryable:

```ts
const first = await saveJournalTrades(fakeWriter, 'user-a', [completeRecord], 'USD');
const second = await saveJournalTrades(fakeWriter, 'user-a', [completeRecord], 'USD');
assert.deepEqual(first, { created: 1, existing: 0, unsaveable: 0, failed: 0 });
assert.deepEqual(second, { created: 0, existing: 1, unsaveable: 0, failed: 0 });
assert.equal(fakeWriter.createdIds.length, 1);
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerJournalSave.test.ts`; expect missing service.
- [ ] **Step 3: Implement key, read-only preview, and transaction.** Define `JournalWriter` with `read(uid, id)` and `createIfAbsent(uid, id, document)`; production adapter uses `runTransaction` and `doc(db, 'users', uid, 'trades', id)`. The transaction returns `existing` only when the stored `importSource.key` matches; any other existing document is a collision error. Process records sequentially or with bounded concurrency to avoid Firestore throttling. Report per-record errors by code/count only, never source row content. Check `auth.currentUser?.uid === uid` in the page before calling, and rely on Firestore rules for enforcement. Recompute key at save time rather than trusting a UI-supplied ID. Pass the verified currency into `toJournalDocument`.

```ts
export type SaveResult = { created: number; existing: number; unsaveable: number; failed: number };
export type SavePreview = { newCount: number; existingCount: number; unsaveableCount: number; reasons: string[] };
export type JournalWriter = {
  read(uid: string, id: string): Promise<Trade | null>;
  createIfAbsent(uid: string, id: string, document: Omit<Trade, 'id'>): Promise<'created' | 'existing' | 'collision'>;
};
export async function makeImportKey(record: ClosedTradeRecord): Promise<string>;
export async function previewJournalSave(writer: JournalWriter, uid: string, records: ClosedTradeRecord[]): Promise<SavePreview>;
export async function saveJournalTrades(writer: JournalWriter, uid: string, records: ClosedTradeRecord[], currency: string): Promise<SaveResult>;
```

- [ ] **Step 4: Confirm green and rules.** Run journal-save tests, `npm run test:rules` if emulator binaries are available, and `npx tsc --noEmit`. If emulator cannot start locally, record that verification gap and do not declare authorization tested.
- [ ] **Step 5: Commit.** `git add features/trade-analyzer/journalSave.ts tests/tradeAnalyzerJournalSave.test.ts tests/firestore.rules.test.mjs && git commit -m "feat: save imported trades without duplicates"`.

### Task 3: Opt-in save UI

**Files:** Create `components/trade-analyzer/SaveToJournal.tsx`, `tests/tradeAnalyzerSaveUi.test.tsx`; modify `components/trade-analyzer/Dashboard.tsx`, `pages/TradeAnalyzerPage.tsx`, `pages/TradeAnalyzerPage.css`.

**Interfaces:** `SaveToJournal` receives `signedIn`, `preview`, `saving`, `result`, `onSave`; the page computes preview only after Analyze. Signed-out users get a non-blocking `/signup` link; signed-in users see new/existing/unsaveable counts before a clearly labeled `Save to journal` button.

- [ ] **Step 1: Write red UI tests.** Assert no save control before analysis, no write when a signed-out user analyzes, preview labels, disabled Save for zero new records, progress state, success link to `/trading-journal`, failure count/retry, and that ad never returns in results:

```tsx
const html = renderToStaticMarkup(<SaveToJournal signedIn={true} preview={{ newCount: 2, existingCount: 1, unsaveableCount: 1, reasons: [] }} saving={false} result={null} onSave={() => {}} />);
assert.match(html, /2 new/);
assert.match(html, /1 already imported/);
assert.match(html, /1 not saveable/);
assert.match(html, /Save to journal/);
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerSaveUi.test.tsx`; expect missing component.
- [ ] **Step 3: Wire Save only after verified analysis.** Resolve current user via `useFirebase()`. Preview reads may occur only when the signed-in user opens the Save section; do not auto-write. `onSave` revalidates authenticated UID and uses the production writer. Preserve current dashboard if preview/save fails, show counts and a retry action, and link to the journal on success. Do not set up redirect that discards unsaved analysis.

```tsx
{phase === 'analyzed' && <SaveToJournal signedIn={Boolean(currentUser)} preview={preview} saving={saving} result={saveResult} onSave={handleSave} />}
```

- [ ] **Step 4: Verify complete flow.** Run `node --import tsx --test tests/tradeAnalyzer*.test.ts tests/tradeAnalyzer*.test.tsx`, `npm run build`, `npm run test:seo`, and `npm run test:rules`. Manually test signed-out analysis, first save, repeat save, mixed saveability, retry after simulated failure, and journal detail display. Inspect network requests to confirm import data is sent only during explicit Save, not import/analysis.
- [ ] **Step 5: Commit.** `git add components/trade-analyzer/SaveToJournal.tsx components/trade-analyzer/Dashboard.tsx pages/TradeAnalyzerPage.tsx pages/TradeAnalyzerPage.css tests/tradeAnalyzerSaveUi.test.tsx && git commit -m "feat: add opt-in journal save to trade analyzer"`.

### Task 4: Journal date consistency and full regression gate

**Files:** Modify `utils/tradingUtils.ts`, `utils/tradingReportModel.ts`, `utils/pdfReportGenerator.ts`, `components/trading/TradeCalendar.tsx`, `components/trading/TradeTable.tsx`, `pages/TradingJournalPage.tsx`; create `tests/tradeAnalyzerJournalDates.test.ts`.

**Interfaces:** Export `getTradeResultTime(trade: Trade): number` from `utils/tradingUtils.ts`. It returns `trade.importSource?.closeTime.toMillis()` for imported trades and `trade.entryDate.toMillis()` for manual trades. Keep `entryDate` unchanged as the actual entry timestamp; show an imported close date separately in detail/table.

- [ ] **Step 1: Write red mixed-source date tests.** An imported trade entered on January 31 and closed February 1 must contribute to February P&L/calendar/report; a manual trade dated January 31 stays in January. Include a timezone-edge case with exact timestamps.

```ts
assert.equal(getTradeResultTime(importedTrade), Timestamp.fromDate(new Date('2026-02-01T01:00:00Z')).toMillis());
assert.equal(getTradeResultTime(manualTrade), manualTrade.entryDate.toMillis());
assert.deepEqual(filterTradesByMonth([importedTrade, manualTrade], 1, 2026).map((trade) => trade.id), ['imported']);
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerJournalDates.test.ts`; expect missing helper and the imported trade landing in January.
- [ ] **Step 3: Use the result time in P&L aggregations.** Replace direct `entryDate` use in `calculateEquityCurve`, calendar grouping, report filtering, and PDF month selection with `getTradeResultTime`. Keep entry-date display labeled as such; add a separate `Closed` timestamp for imported table/detail rows. In `TradingJournalPage`, sort imported results by close time after snapshot load; do not change Firestore's storage schema or manual date behavior.

```ts
export function getTradeResultTime(trade: Trade): number {
  return trade.importSource?.closeTime?.toMillis?.() ?? trade.entryDate.toMillis();
}
```

- [ ] **Step 4: Run final verification.** Run `node --import tsx --test tests/tradeAnalyzer*.test.ts tests/tradeAnalyzer*.test.tsx tests/tradingReportModel.test.ts tests/pdfReportGenerator.test.ts`, `npm run build`, `npm run test:seo`, and `npm run test:rules`. Manually compare a cross-month imported trade in analyzer and journal, first/repeat save, signed-out flow, and print. If rules emulator is unavailable, report the gap before release.
- [ ] **Step 5: Commit.** `git add utils/tradingUtils.ts utils/tradingReportModel.ts utils/pdfReportGenerator.ts components/trading/TradeCalendar.tsx components/trading/TradeTable.tsx pages/TradingJournalPage.tsx tests/tradeAnalyzerJournalDates.test.ts && git commit -m "fix: align imported journal results with close dates"`.

## Release gate

- The public analyzer remains usable without authentication even when Firebase is unavailable.
- Do not enable Save for an import whose reconciliation failed or whose currency/timezone verification is incomplete.
- Repeat import/save of the same verified statement must add zero documents; any collision with a manual document must report an error and preserve that document.
