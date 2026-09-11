# Equity and Drawdown Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the trading journal's stretched equity card into a synchronized equity-and-drawdown story with useful recovery metrics and time-range controls.

**Architecture:** Keep the Recharts presentation in `EquityCurve.tsx`, move deterministic range and recovery derivation into a small pure model module, and extend the existing range utility with an injectable clock plus one pre-cutoff continuity point. Component-specific styling stays inside the fieldbook stylesheet so the public site is untouched.

**Tech Stack:** React 18, TypeScript, Recharts 3, Tailwind utilities, existing fieldbook CSS tokens, Node's built-in test runner via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-10-equity-drawdown-story-design.md`

## Global Constraints

- Reuse fieldbook paper `#fffdf7`, ink `#16231e`, forest `#102e24`, profit `#2f8a67`, loss `#c65b50`, brass `#c89a49`, and the existing `--fieldbook-line` rule token.
- Use the existing Newsreader/Georgia editorial face for the card title and insight; use the existing sans-serif stack for controls, axes, tooltips, and metrics.
- The range selector contains exactly `1W`, `1M`, `3M`, and `All`; `All` is initially active.
- Range selection changes only visible chart points. Peak equity, current drawdown, worst drawdown, recovery, headline equity, and headline return use the complete ledger.
- A non-`ALL` time range includes the latest point before its cutoff when one exists.
- Recovery counts trade-bearing points after the worst-drawdown trough until the prior peak is met or exceeded; unrecovered drawdowns read `In progress`, and no drawdown reads `At peak`.
- Range controls are buttons with `aria-pressed` and a minimum 44px target.
- Charts remain chronological left-to-right under RTL, use accessible labels, and disable Recharts animation.
- No route, persistence, Firebase, trade schema, or dependency changes.
- The equity card sizes to its content rather than stretching to match the adjacent column.

---

### Task 1: Build the Equity and Drawdown Story

**Files:**
- Create: `components/trading/equityCurveModel.ts`
- Modify: `utils/tradingUtils.ts`
- Modify: `components/trading/EquityCurve.tsx`
- Modify: `components/trading/TradingCommandCenter.tsx`
- Modify: `pages/TradingJournalPage.css`
- Create: `tests/equityCurveModel.test.ts`

**Interfaces:**
- Consumes: `EquityPoint`, `TimeRange`, `Goal`, `calculateDrawdown`, and `filterEquityByTimeRange` from `utils/tradingUtils.ts`.
- Produces: `EQUITY_CURVE_RANGES`, `EquityCurveRange`, `EquityChartPoint`, and `buildEquityCurveStory(data, range, now?)` from `components/trading/equityCurveModel.ts`.
- `buildEquityCurveStory` returns visible chart points plus `currentEquity`, `startingEquity`, `totalReturn`, `returnPercent`, `peakEquity`, `currentDrawdownPercent`, `maxDrawdownPercent`, `recoveryTrades`, `recoveryLabel`, and `insight`.
- Extends `filterEquityByTimeRange(equityPoints, range, now?)` without breaking existing two-argument callers.

- [ ] **Step 1: Write the failing model tests**

Create `tests/equityCurveModel.test.ts` with literal equity ledgers that verify:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildEquityCurveStory } from '../components/trading/equityCurveModel';
import { filterEquityByTimeRange, type EquityPoint } from '../utils/tradingUtils';

const DAY = 24 * 60 * 60 * 1000;
const point = (timestamp: number, cumulativePnL: number, tradeNumber: number): EquityPoint => ({
  date: tradeNumber === 0 ? 'Start' : `Trade ${tradeNumber}`,
  timestamp,
  cumulativePnL,
  tradeNumber,
});

test('equity story aligns underwater drawdown and reports recovery from the worst trough', () => {
  const data = [
    point(0, 10_000, 0),
    point(1, 9_500, 1),
    point(2, 9_000, 2),
    point(3, 9_600, 3),
    point(4, 10_100, 4),
  ];
  const story = buildEquityCurveStory(data, 'ALL', new Date(10 * DAY));

  assert.deepEqual(story.points.map(item => item.drawdownDepth), [0, -5, -10, -4, 0]);
  assert.equal(story.peakEquity, 10_100);
  assert.equal(story.currentDrawdownPercent, 0);
  assert.equal(story.maxDrawdownPercent, 10);
  assert.equal(story.recoveryTrades, 2);
  assert.equal(story.recoveryLabel, '2 trades');
  assert.equal(story.insight, 'The account recovered from its largest drawdown in 2 trades.');
});

test('equity story identifies an active recovery without inventing a duration', () => {
  const story = buildEquityCurveStory([
    point(0, 10_000, 0),
    point(1, 10_200, 1),
    point(2, 9_900, 2),
  ], 'ALL', new Date(10 * DAY));

  assert.equal(story.currentDrawdownPercent, 2.94);
  assert.equal(story.maxDrawdownPercent, 2.94);
  assert.equal(story.recoveryTrades, null);
  assert.equal(story.recoveryLabel, 'In progress');
  assert.equal(story.insight, 'Equity is 2.94% below its latest peak; protect the recovery.');
});

test('time ranges preserve the point before the cutoff for chart continuity', () => {
  const now = new Date('2026-09-10T12:00:00Z');
  const data = [
    point(now.getTime() - 40 * DAY, 10_000, 0),
    point(now.getTime() - 10 * DAY, 10_100, 1),
    point(now.getTime() - 5 * DAY, 9_900, 2),
    point(now.getTime(), 10_200, 3),
  ];

  assert.deepEqual(
    filterEquityByTimeRange(data, '1W', now).map(item => item.tradeNumber),
    [1, 2, 3],
  );
});

test('a flat starting ledger reports an honest at-peak state', () => {
  const story = buildEquityCurveStory([point(0, 10_000, 0)], 'ALL');

  assert.equal(story.maxDrawdownPercent, 0);
  assert.equal(story.recoveryTrades, 0);
  assert.equal(story.recoveryLabel, 'At peak');
  assert.equal(story.insight, 'The account is at its equity high with no recorded drawdown.');
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --import tsx --test tests/equityCurveModel.test.ts
```

Expected: FAIL because `components/trading/equityCurveModel.ts` does not exist.

- [ ] **Step 3: Implement deterministic range and story derivation**

Create `components/trading/equityCurveModel.ts` as a pure module. It must:

- Export `EQUITY_CURVE_RANGES` as `['1W', '1M', '3M', 'ALL']` and the range type derived from that tuple.
- Calculate drawdown from the complete ledger before selecting visible points, then map drawdown values back by timestamp.
- Emit `drawdownDepth` as zero or a negative percentage for the underwater band.
- Find the worst trough, its prior running peak, and the first later point that meets or exceeds that peak.
- Count only later points with `tradeNumber > 0` when producing `recoveryTrades`.
- Round displayed percentages to two decimals.
- Produce the exact tested insight and recovery strings.

Update `filterEquityByTimeRange` to accept `now: Date = new Date()`. For non-`ALL` ranges, return points at or after the cutoff and prepend exactly one immediately preceding point when available. If no point is in range, retain the latest known point.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
node --import tsx --test tests/equityCurveModel.test.ts
```

Expected: 4 tests pass with no failures.

- [ ] **Step 5: Build the synchronized visual story**

Refactor `EquityCurve.tsx` to consume the pure model and render:

- A Newsreader title, account-level equity/return headline, and four-button range selector with `aria-pressed`.
- A primary 270px equity chart using `#2f8a67` or `#c65b50`, existing win/loss markers, starting-balance and brass goal lines, and a shared detailed tooltip.
- A labelled `Drawdown depth` band in a second 112px `ComposedChart`, using negative `drawdownDepth`, loss color `#c65b50`, an area fill, a zero reference line, and the visible time-axis labels.
- The same nonempty `syncId` on both charts, matching horizontal margins/Y-axis width, and `isAnimationActive={false}` on plotted areas and scatter marks.
- Chronological chart wrappers with `dir="ltr"`, `role="img"`, and useful `aria-label` text.
- A narrative insight and a semantic `dl` containing Peak equity, Current drawdown, Worst drawdown, and Recovery.
- The existing honest empty state for an empty `data` array.

Update `TradingCommandCenter.tsx` by adding `items-start` to the equity/right-column grid so the left card cannot inherit the right column's height.

Add scoped rules in `TradingJournalPage.css` for `.equity-story-*` hooks. Use only existing fieldbook tokens, logical properties, a minimum 44px range-button height, a two-column narrow-screen metric layout, visible focus, and no `transition: all`.

- [ ] **Step 6: Verify focused behavior, full tests, build, and diff hygiene**

Run:

```bash
node --import tsx --test tests/equityCurveModel.test.ts tests/tradingJournalDesign.test.ts tests/tradingTabNavigation.test.ts tests/tradingReportModel.test.ts
node --import tsx --test tests/*.test.ts tests/*.test.tsx
npm run build
git diff --check
```

Expected: all test files pass, the production build exits 0, and `git diff --check` exits 0.

- [ ] **Step 7: Commit the complete task**

```bash
git add components/trading/equityCurveModel.ts components/trading/EquityCurve.tsx components/trading/TradingCommandCenter.tsx utils/tradingUtils.ts pages/TradingJournalPage.css tests/equityCurveModel.test.ts docs/superpowers/specs/2026-09-10-equity-drawdown-story-design.md docs/superpowers/plans/2026-09-10-equity-drawdown-story.md
git commit -m "feat: enhance trading equity story"
```
