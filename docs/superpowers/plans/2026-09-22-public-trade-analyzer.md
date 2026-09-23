# Public Trade Analyzer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, browser-only MT5/cTrader history importer with verification and a useful, honest performance dashboard.

**Architecture:** Keep the platform adapters and analytics as pure TypeScript modules under `features/trade-analyzer`; the page owns the import → verify → analyze state machine. The ad is rendered only in the import state, using the existing AdSense component and a dedicated slot configuration. This plan does not write trades to Firestore; the companion journal-save plan adds that after the public analyzer is independently working.

**Tech Stack:** React 18, TypeScript 5.8, Vite 6, Recharts 3, Tailwind/CSS, Node's test runner via `node --import tsx --test`.

**Spec:** `docs/superpowers/specs/2026-09-22-multi-platform-trade-analyzer-design.md`

## Global Constraints

- Public route: `/trade-analyzer`; import, parsing, calculations, and printing remain client-side.
- Initial inputs: MT5 HTML report or recognizable pasted tabular History; cTrader CSV statement or recognizable pasted tabular History.
- Reject unrecognized formats and name missing columns; cap file size at 5 MiB and data rows at 20,000.
- No broker login, AI call, screenshot/OCR/PDF import, trading advice, or server upload.
- Closed records only; exclude deposits, withdrawals, credits, cancelled/open orders, and ambiguous rows with visible counts and reasons.
- Use broker-provided net P&L; never derive it from price/volume. Unknown costs remain unknown.
- Position-level grouping only with usable native position IDs; otherwise label closure-level statistics.
- Verify currency, timezone, date span, record count, exclusions, costs, and net P&L before analysis.
- With no positive starting balance, show cumulative realized P&L, not balance or percentage return.
- Label drawdown `closed-trade balance drawdown`; weekday/hour use the selected source timezone.
- The desktop ad belongs beside the import form; on mobile it follows the form; no ad in verification/results.
- Do not display/store account owner names or raw account numbers. Do not send trade content to logs, analytics, URLs, or the ad component.
- Existing unrelated dirty-worktree changes must remain untouched. Stage only task files for commits.

## File map and interfaces

- `features/trade-analyzer/types.ts`: `ClosedTradeRecord`, `ImportReport`, `ImportIssue`, `ImportPlatform`, and analysis types. A record uses `entryTime`/`exitTime` ISO strings or `null`, nullable prices/volume/costs, finite broker net P&L, and `grouping: 'position' | 'closure' | 'incomplete'`.
- `features/trade-analyzer/delimited.ts`: CSV/TSV lexer, locale-aware monetary parsing, and bounded text input.
- `features/trade-analyzer/mt5.ts`, `ctrader.ts`: platform-specific adapters returning `ImportReport`; no DOM rendering or persistence.
- `features/trade-analyzer/importHistory.ts`: file/paste dispatch, unsupported-format messages, verification reconciliation.
- `features/trade-analyzer/analyze.ts`: deterministic metrics, close-time series, segment tables, and cautiously worded observations.
- `components/trade-analyzer/{ImportPanel,VerifyPanel,Dashboard}.tsx`: presentational sections with explicit typed props; no parsing hidden in JSX.
- `pages/TradeAnalyzerPage.tsx` and `.css`: accessible state machine and responsive layout.
- `tests/tradeAnalyzer*.test.ts(x)`: redacted fixtures and behavioral tests using the existing Node test pattern.

---

### Task 1: Bounded delimited input and normalized contract

**Files:** Create `features/trade-analyzer/types.ts`, `features/trade-analyzer/delimited.ts`, `tests/tradeAnalyzerDelimited.test.ts`.

**Interfaces:** Produce `parseDelimited(text: string, delimiter: ',' | ';' | '\t', maxRows?: number): string[][]`, `parseMoney(value: string, decimal: '.' | ','): number | null`, and the exported types named above. `ImportReport` contains `platform`, `format`, `records`, `issues`, `excludedCount`, `currency`, `sourceTimezone`, `declaredNetPnl`, and `reconciled` (`true | false | null`). `ClosedTradeRecord` contains `sourceId`, `accountHash?`, `symbol`, `direction`, `entryTime`, `exitTime`, `entryPrice`, `exitPrice`, `volume`, `grossPnl`, `commission`, `swap`, `fees`, `netPnl`, `grouping`, and `provenance`.

- [ ] **Step 1: Write the failing lexer/numeric tests.** Put this concrete case in `tests/tradeAnalyzerDelimited.test.ts` and add cases for CRLF, escaped quotes, 20,001 rows, blank numeric cells, `1,234.56`, and `1.234,56`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDelimited, parseMoney } from '../features/trade-analyzer/delimited';
test('quoted CSV keeps commas and line breaks inside cells', () => {
  assert.deepEqual(parseDelimited('Symbol,Comment,Profit\nEURUSD,"a,b\nsecond line",12.50', ','),
    [['Symbol', 'Comment', 'Profit'], ['EURUSD', 'a,b\nsecond line', '12.50']]);
  assert.equal(parseMoney('1.234,56', ','), 1234.56);
  assert.equal(parseMoney('1,234.56', '.'), 1234.56);
});
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerDelimited.test.ts`; expect module-not-found.
- [ ] **Step 3: Implement the contract and finite-state lexer.** Export the exact signatures above. Reject unclosed quotes, excessive rows, and non-finite/ambiguous amounts with a typed `ImportIssue` whose `code` is `invalid_csv | too_many_rows | ambiguous_number`; allow Unicode BOM and semicolon delimiter. Do not interpret `1,234` without a known decimal convention.

```ts
export type ImportPlatform = 'mt5' | 'ctrader';
export type GroupingQuality = 'position' | 'closure' | 'incomplete';
export type ImportIssue = { code: string; message: string; row?: number; count?: number };
export type ClosedTradeRecord = {
  platform: ImportPlatform; sourceId: string | null; accountHash?: string;
  symbol: string; direction: 'LONG' | 'SHORT'; entryTime: string | null; exitTime: string;
  entryPrice: number | null; exitPrice: number | null; volume: number | null;
  grossPnl: number | null; commission: number | null; swap: number | null;
  fees: number | null; netPnl: number; grouping: GroupingQuality;
  provenance: Record<string, string>;
};
export type ImportReport = {
  platform: ImportPlatform; format: 'html' | 'csv' | 'paste'; records: ClosedTradeRecord[];
  issues: ImportIssue[]; excludedCount: number; currency: string | null;
  sourceTimezone: string | null; declaredNetPnl: number | null;
  reconciled: true | false | null;
};
export function parseMoney(value: string, decimal: '.' | ','): number | null;
export function parseDelimited(text: string, delimiter: ',' | ';' | '\t', maxRows?: number): string[][];
```

- [ ] **Step 4: Confirm green and typecheck.** Run `node --import tsx --test tests/tradeAnalyzerDelimited.test.ts` and `npx tsc --noEmit`; expect both pass.
- [ ] **Step 5: Commit only these files.** `git add features/trade-analyzer/types.ts features/trade-analyzer/delimited.ts tests/tradeAnalyzerDelimited.test.ts && git commit -m "feat: define bounded trade import input"`.

### Task 2: MT5 and cTrader adapters

**Files:** Create `features/trade-analyzer/mt5.ts`, `features/trade-analyzer/ctrader.ts`, `tests/fixtures/trade-analyzer/mt5-positions.html`, `tests/fixtures/trade-analyzer/mt5-deals.html`, `tests/fixtures/trade-analyzer/ctrader-statement.csv`, `tests/tradeAnalyzerMt5.test.ts`, `tests/tradeAnalyzerCtrader.test.ts`.

**Interfaces:** Produce `parseMt5History(text: string, format: 'html' | 'paste'): Promise<ImportReport>` and `parseCTraderHistory(text: string, format: 'csv' | 'paste'): Promise<ImportReport>`. Use `parseDelimited`/`parseMoney` from Task 1. Fixtures must be synthetic/redacted and include source statement totals for reconciliation.

- [ ] **Step 1: Add red adapter tests and fixtures.** At minimum include a closed position with commission and swap, a deposit row, partial exit deals sharing one position ID, a multi-fill position, a row with malformed date, an open order, a missing cost column, and an unsupported header. The test must assert native-ID grouping and source-net reconciliation, not just row count:

```ts
const report = await parseMt5History(mt5Fixture, 'html');
assert.equal(report.records.length, 2);
assert.equal(report.records[0].grouping, 'position');
assert.equal(report.records.reduce((sum, row) => sum + row.netPnl, 0), report.declaredNetPnl);
assert.equal(report.reconciled, true);
assert.ok(report.issues.some((issue) => issue.code === 'excluded_balance_operation'));
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerMt5.test.ts tests/tradeAnalyzerCtrader.test.ts`; expect module-not-found.
- [ ] **Step 3: Implement exact header-driven adapters.** MT5 HTML: use `DOMParser` in browser-facing code, read text from recognized report tables only, never mount source markup; for Node tests use a fixture-compatible table extractor or a small DOM-free extractor tested against escaped cells. Distinguish MT5 Positions from Deals sections; group exit deals only when position ID and direction are available. cTrader: accept recognized statement headers, use CSV lexer for quoted cells, and mark missing native IDs as closure-level. For both, read broker `Net P&L` where present; otherwise calculate net only if gross and *all* cost fields are explicitly present. Identify the date/time format or exclude the row. Normalize account currency from report metadata. If a native account identifier is available, hash it in memory with Web Crypto before adding only its digest to `accountHash`; discard the raw identifier and never add it to issues or UI.

```ts
export async function parseMt5History(text: string, format: 'html' | 'paste'): Promise<ImportReport>;
export async function parseCTraderHistory(text: string, format: 'csv' | 'paste'): Promise<ImportReport>;
```

- [ ] **Step 4: Confirm green and reconcile fixtures.** Run both adapter tests and `npx tsc --noEmit`; expect pass. Check source total versus sum of imported net P&L with a currency-sized rounding tolerance (0.01 per report, not per row); set `reconciled=false` on mismatch and retain an actionable issue.
- [ ] **Step 5: Commit adapter files and fixtures.** `git add features/trade-analyzer/mt5.ts features/trade-analyzer/ctrader.ts tests/fixtures/trade-analyzer tests/tradeAnalyzerMt5.test.ts tests/tradeAnalyzerCtrader.test.ts && git commit -m "feat: parse MT5 and cTrader closed history"`.

### Task 3: Import gate, verification, and deterministic analytics

**Files:** Create `features/trade-analyzer/importHistory.ts`, `features/trade-analyzer/analyze.ts`, `tests/tradeAnalyzerImport.test.ts`, `tests/tradeAnalyzerAnalytics.test.ts`.

**Interfaces:** Produce `importHistory(input: { platform: ImportPlatform; name?: string; text: string }): Promise<ImportReport>`, `canAnalyze(report: ImportReport): boolean`, `analyzeTrades(input: { report: ImportReport; currency: string; timezone: string; startingBalance: number | null }): AnalysisModel`. `AnalysisModel` exposes `metrics`, `curve`, `calendar`, `bySymbol`, `byDirection`, `byWeekday`, `byHour`, `observations`, and `quality`.

- [ ] **Step 1: Write red gate/analytics tests.** Cover empty/oversize input, wrong selected platform, missing headers, unreconciled source total, no closed records, close-time ordering, wins/losses/breakeven, zero-loss profit factor as unavailable, no starting balance, negative starting balance, timezone day/hour, and insight threshold (`n >= 10` for directional segment language). Example:

```ts
assert.equal(canAnalyze({ ...report, reconciled: false }), false);
const model = analyzeTrades({ report, currency: 'USD', timezone: 'UTC', startingBalance: null });
assert.deepEqual(model.curve.map((point) => point.cumulativePnl), [-20, 80]);
assert.equal(model.metrics.balanceReturnPercent, null);
assert.equal(model.quality.drawdownLabel, 'Closed-trade balance drawdown');
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerImport.test.ts tests/tradeAnalyzerAnalytics.test.ts`; expect missing exports.
- [ ] **Step 3: Implement gate and pure analysis.** `importHistory` dispatches only recognized combinations; file size is checked by UTF-8 byte count for paste and `File.size` in UI. `canAnalyze` requires at least one complete closed record and no known reconciliation failure. `analyzeTrades` sorts by `exitTime` then `sourceId`, sums net P&L, computes profit factor from positive/negative net sums, expectancy as mean net, and drawdown from realized close-time peaks. Build weekday/hour from `Intl.DateTimeFormat` with the selected IANA timezone; invalid timezone prevents analysis. If starting balance is null/non-positive, the curve is cumulative realized P&L and balance-return percentage is null. Segment observations require 10 records in the cited segment and include value, comparison, and sample size; do not claim prediction or cause.

```ts
export async function importHistory(input: { platform: ImportPlatform; name?: string; text: string }): Promise<ImportReport>;
export function canAnalyze(report: ImportReport): boolean;
export function analyzeTrades(input: { report: ImportReport; currency: string; timezone: string; startingBalance: number | null }): AnalysisModel;
```

- [ ] **Step 4: Confirm green.** Run the four parser/analysis test files and `npx tsc --noEmit`; expect pass.
- [ ] **Step 5: Commit.** `git add features/trade-analyzer/importHistory.ts features/trade-analyzer/analyze.ts tests/tradeAnalyzerImport.test.ts tests/tradeAnalyzerAnalytics.test.ts && git commit -m "feat: verify imports and calculate trade analysis"`.

### Task 4: Accessible import and verification page, with ad placement

**Files:** Create `pages/TradeAnalyzerPage.tsx`, `pages/TradeAnalyzerPage.css`, `components/trade-analyzer/ImportPanel.tsx`, `components/trade-analyzer/VerifyPanel.tsx`, `tests/tradeAnalyzerPage.test.tsx`; modify `components/AdSenseSlot.tsx`, `.env.example`.

**Interfaces:** `ImportPanel` accepts `platform`, `busy`, `error`, `onPlatformChange`, `onSubmit({ name, text })`; `VerifyPanel` accepts `report`, editable `currency`, `timezone`, `startingBalance`, `onBack`, `onAnalyze`. Page state union is `empty | reading | unsupported | verifying | analyzed`. No journal save in this task.

- [ ] **Step 1: Write red page/config tests.** Server-render import and verification sections to assert labeled tabs/file picker/paste area, issue counts, preview, accessible buttons, and that the ad appears once in import and zero times in verification. Assert `readTradeAnalyzerAdSenseConfig` returns empty config until both dedicated IDs are present:

```tsx
assert.deepEqual(readTradeAnalyzerAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-1' }), { client: '', slot: '' });
assert.match(renderToStaticMarkup(<ImportPanel {...validProps} />), /Upload history/);
assert.doesNotMatch(renderToStaticMarkup(<VerifyPanel {...verifyProps} />), /adsbygoogle/);
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerPage.test.tsx`; expect missing components/config.
- [ ] **Step 3: Build the form/state machine.** Upload accepts `.html,.htm,.csv,.tsv,.txt` only after text-like MIME/extension and size checks; paste supports tabular rows. Reset verification/results whenever platform or input changes. Show exact missing headers and excluded reasons, preview 5 representative closed records, net P&L and cost totals. Require explicit verification of currency and source timezone before Analyze. Make drag/drop an enhancement to a normal labeled file input. Put `<AdSenseSlot config={readTradeAnalyzerAdSenseConfig(import.meta.env)} />` in the import-only right rail; mobile CSS places it after the form. Add `VITE_ADSENSE_TRADE_ANALYZER_SLOT_ID=` to `.env.example`; no fallback to the calculator slot. Include copy that analysis remains on this device until Save is chosen and avoid absolute claims about third-party scripts.

```ts
export const readTradeAnalyzerAdSenseConfig = (env: Record<string, string | undefined>): AdSenseConfig => {
  const client = env.VITE_ADSENSE_CLIENT_ID?.trim() ?? '';
  const slot = env.VITE_ADSENSE_TRADE_ANALYZER_SLOT_ID?.trim() ?? '';
  return client && slot ? { client, slot } : { client: '', slot: '' };
};
```

- [ ] **Step 4: Confirm green.** Run page tests and `npx tsc --noEmit`; expect pass. Test keyboard-only tab order manually at 390 px and 1280 px widths.
- [ ] **Step 5: Commit.** `git add pages/TradeAnalyzerPage.tsx pages/TradeAnalyzerPage.css components/trade-analyzer/ImportPanel.tsx components/trade-analyzer/VerifyPanel.tsx components/AdSenseSlot.tsx .env.example tests/tradeAnalyzerPage.test.tsx && git commit -m "feat: add trade import and verification experience"`.

### Task 5: Dashboard, print, route, navigation, and SEO

**Files:** Create `components/trade-analyzer/Dashboard.tsx`, `tests/tradeAnalyzerDashboard.test.tsx`; modify `pages/TradeAnalyzerPage.tsx`, `pages/TradeAnalyzerPage.css`, `App.tsx`, `components/Header.tsx`, `components/headerNavigation.ts`, `scripts/generate-seo-sitemaps.ts`, `scripts/prerender-seo.ts`, `tests/headerNavigation.test.ts`, `tests/seoOutput.test.ts`.

**Interfaces:** `Dashboard` accepts `model: AnalysisModel`, `report: ImportReport`, `onStartOver: () => void`; renders monetary KPI cards, balance/P&L curve, drawdown, calendar and symbol/direction/weekday/hour tables, observations, grouping quality, a printable layout, and text/tabular alternatives to charts. No Save action until the companion plan.

- [ ] **Step 1: Write red dashboard/navigation/SEO tests.** Assert inaccessible metrics render as `Not available` with reason; observations include `n`; `window.print()` is called only from Print action; no ad in result markup; `/trade-analyzer` activates Tools; sitemap contains public route and static HTML after build:

```ts
assert.equal(getActiveNavigationGroup('/trade-analyzer'), 'tools');
assert.match(renderToStaticMarkup(<Dashboard model={model} report={report} onStartOver={() => {}} />), /Closed-trade balance drawdown/);
```

- [ ] **Step 2: Confirm red.** Run `node --import tsx --test tests/tradeAnalyzerDashboard.test.tsx tests/headerNavigation.test.ts`; expect failed assertions/missing component.
- [ ] **Step 3: Implement dashboard and discovery.** Use Recharts for a line chart but always render a readable summary and a data table. Keep the dashboard ad-free and show the parser quality banner. Add lazy `/trade-analyzer` route in `App.tsx`, a Tools menu item in `Header.tsx`, a route entry in `headerNavigation.ts`, and the public route in `scripts/generate-seo-sitemaps.ts`. Add a dedicated `PrerenderPage` to the `pages` array in `scripts/prerender-seo.ts` with a useful static heading, description, and linkable import explanation; this route is public, not part of `PRIVATE_SEO_ROUTES`. Set matching title/description/canonical through `useSEO` in page. Print CSS hides navigation, controls, and ad, and retains metric definitions/quality notes.

```tsx
const TradeAnalyzerPage = lazy(() => import('./pages/TradeAnalyzerPage'));
<Route path="/trade-analyzer" element={<TradeAnalyzerPage />} />
```

- [ ] **Step 4: Verify end to end.** Run `node --import tsx --test tests/tradeAnalyzer*.test.ts tests/tradeAnalyzer*.test.tsx tests/headerNavigation.test.ts`, `npm run build`, and `npm run test:seo`; expect pass. Inspect 390/768/1280 px, MT5 and cTrader fixtures, reset behavior, print preview, and network requests for absence of trade rows/account identifiers. Do not claim real-platform compatibility until a redacted genuine export is reconciled.
- [ ] **Step 5: Commit only feature/SEO files.** `git add components/trade-analyzer/Dashboard.tsx pages/TradeAnalyzerPage.tsx pages/TradeAnalyzerPage.css App.tsx components/Header.tsx components/headerNavigation.ts scripts/generate-seo-sitemaps.ts scripts/prerender-seo.ts tests/tradeAnalyzerDashboard.test.tsx tests/headerNavigation.test.ts tests/seoOutput.test.ts && git commit -m "feat: publish trade analysis dashboard"`.

## Release gate

- Reconcile both synthetic fixtures and at least one redacted real export per platform before describing the formats as fully supported. If genuine exports are unavailable, publish as a labeled beta or hold the route from navigation.
- No save side effect exists after this plan. The separate `2026-09-22-trade-analyzer-journal-save.md` adds opt-in persistence.
