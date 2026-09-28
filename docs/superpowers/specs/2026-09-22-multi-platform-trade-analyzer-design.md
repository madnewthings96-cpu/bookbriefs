# Multi-Platform Trade Analyzer Design

**Status:** Proposed design for user review

**Date:** 2026-09-22

**Surface:** Public `/trade-analyzer` page, with optional import into the existing authenticated trading journal

## Context

Ta7leel already has a trading journal, trading statistics, breakdown panels, a calendar, and a PDF report. Entering historical trades manually is the main friction. This feature lets traders paste or upload an MT5 or cTrader export, verify the interpretation, and immediately inspect a useful dashboard. Saving is optional.

The approved visual direction is an editorial “analysis desk”: a focused import form, a clearly labeled ad in the right column on desktop and below the form on mobile, followed by an ad-free results dashboard. The short import instructions remain beside the form. The existing AdSense component can supply the ad when configured; otherwise a neutral reserved slot appears.

## Goals

- Let a trader see a useful performance review without creating an account or connecting a broker.
- Support MT5 and cTrader through explicit platform-specific import adapters.
- Allow CSV/HTML file upload and pasted tabular trade history where the headers identify the columns.
- Require a verification step before calculating or saving anything.
- Distinguish reliable observations from weak-sample patterns.
- Allow signed-in users to save verified imported trades to the existing journal without duplicates.
- Keep import parsing and calculations deterministic in the browser, with no AI model call.

## Non-goals for Version 1

- Broker login, OAuth, account synchronization, trading execution, or real-time data.
- Arbitrary broker formats, MT4, screenshots, PDFs, OCR, or password-protected statements.
- Market-data enrichment or intratrade equity reconstruction.
- AI-generated financial advice, predictions, or recommendations to enter trades.
- Replacing the existing manual journal.

## Product Flow

1. **Import:** The public page offers MT5 and cTrader tabs, drag-and-drop file upload, and paste. The selected platform guides format detection but does not silently force a mismatched parser.
2. **Verify:** Show detected platform, input type, account currency if present, source timezone if known, date range, imported closed records, excluded rows, cost totals, and summed net P&L. A preview table shows representative records and specific warnings. The user confirms or corrects account currency, source timezone, and starting balance when needed.
3. **Analyze:** The dashboard shows net P&L, profit factor, win rate, average trade result, expectancy, a closed-trade balance curve, closed-trade drawdown, calendar, and breakdowns by symbol, direction, weekday, and hour where data exists. Plain-language observations cite the contributing numbers and sample size.
4. **Save, optionally:** An authenticated user can save verified trades into the existing journal. A signed-out user sees a non-blocking sign-up option. Importing does not write to Firestore until the user chooses Save.
5. **Export:** A local report export can follow the existing PDF report style, but the initial release need only provide a printable dashboard. PDF export is a follow-on if it would delay reliable imports.

The page has empty, reading, unsupported-format, verification, analyzed, and save-success/error states. Changing the selected platform or replacing the input resets unconfirmed analysis.

## Input Support and Parsing

### Supported initial formats

| Platform | Preferred input | Secondary input | Notes |
| --- | --- | --- | --- |
| MT5 | HTML account/history report | Pasted tab-separated History rows with recognizable headers | Parse positions directly when the report provides them; otherwise group exit deals by position identifier where possible. |
| cTrader | CSV account statement | Pasted tab-separated History rows with recognizable headers | Prefer the statement because its columns are more complete than an ad hoc clipboard copy. |

The importer rejects a format it cannot identify, rather than silently guessing. It reports exact missing columns. Accept only text-like HTML/CSV, enforce a bounded file size and row count, and parse HTML as data without rendering imported markup. CSV handling must support quoted fields, embedded delimiters, decimal separators, and common date variants without silently changing numeric meaning.

MT5 and cTrader both distinguish orders, deals, and positions. Deposits, withdrawals, credits, open positions, cancelled orders, and non-trading balance operations are excluded from closed-trade metrics. Partial closes and multi-fill positions are grouped using native position IDs when available. If a pasted format omits identifiers needed to reconstruct a position, mark the result as **closure-level** rather than claiming position-level statistics. Ambiguous rows are excluded with a reason and count. Never infer an entry or stop loss from incomplete data.

### Normalized analysis record

The platform adapters produce an internal `ClosedTradeRecord` independent of the existing journal `Trade` type:

- source platform and stable source trade/position identifier, when available;
- symbol and direction;
- entry and exit timestamps, with the original source timezone retained;
- entry and exit prices and traded volume when available;
- gross P&L, commissions, swaps, fees, and net P&L in account currency;
- optional source labels/comments and provenance of each field;
- grouping quality: `position`, `closure`, or `incomplete`.

The dashboard operates on net P&L. It never recomputes broker P&L from price change times lots because contract sizes and conversions vary. Missing costs are shown as unknown, not zero. When imported data cannot support a metric, show an explanation rather than a fabricated value.

## Analytics and Insight Rules

- Sort realized outcomes by close time for the closed-trade balance curve.
- If a reliable starting balance is not provided, show cumulative realized P&L instead of an account-balance curve or percentage return.
- Label drawdown as **closed-trade balance drawdown**; intratrade floating drawdown cannot be inferred from history alone.
- Keep deposits and withdrawals out of trading P&L. If they are present and an account-balance view is offered later, account for them separately.
- Display account currency on all money values. Never mix currencies without explicit conversion data.
- Calculate hour and weekday patterns in the selected source timezone and label it visibly.
- Only promote a segment to an insight after a minimum sample threshold; otherwise show the raw breakdown with “too few trades to conclude.”
- Explain every observation with the actual metric, comparison, and sample size. Use “investigate” language, not causal or predictive claims.
- Show the parser quality summary on the dashboard so a trader knows whether some rows were excluded or grouped at closure level.

The existing pure journal statistic helpers can be reused where their definitions match this normalized model. Differences in cost treatment, close-time ordering, and account-balance semantics require dedicated pure analysis functions rather than forcing imported data into the manual-journal `Trade` shape prematurely.

## Save-to-Journal Design

Saving is an explicit action after verification. The adapter maps complete normalized records into the journal shape and marks the import provenance. Records lacking required journal fields are not saved until the mapping is valid. The existing manual-trade fields `setup`, `emotions`, and `notes` remain blank or “Unlabeled”; the importer does not invent psychology labels.

For idempotency, generate a deterministic import key from platform, available account identifier hashed locally, native position/deal ID, and source timestamps. Do not persist the raw account number or owner name. Use the key to create or update only the user’s matching imported record, never overwrite a manually entered trade. Before writing, show **new**, **already imported**, and **not saveable** counts. A failed batch leaves the dashboard intact and gives a retry path. Existing Firestore ownership rules remain in force; add validation only if the new persisted fields require it.

## Advertising and Privacy

- The import state uses the existing labeled ad treatment in a desktop right rail. On mobile it follows the form, never interrupting the upload, preview, or primary action.
- Verification and result states do not render an ad slot, preserving focus and preventing imported values from being visually adjacent to sponsored content.
- The application does not deliberately send the file, pasted rows, parsed trades, or analysis results to the ad component, analytics events, URLs, or logs.
- Parsing and analysis run client-side. Nothing is uploaded to Ta7leel unless the user explicitly saves to the journal.
- Do not claim that third-party ad scripts have no access to the page. The existing AdSense script runs in the page context and its data practices are covered by the site's privacy policy. Privacy copy must say what Ta7leel does, not promise absolute isolation.
- The UI never displays or stores account-owner names or raw account numbers. Errors and telemetry contain format names and counts only, not trade contents.

If the product later requires a stronger guarantee that no third-party script can observe import data, move the importer to an ad-free, isolated document or use a first-party sponsorship creative instead of AdSense. That isolation is outside Version 1.

## Layout and Accessibility

- Desktop: hero and two-column import area, with import form dominant and ad in the narrower right column; analysis spans the page width.
- Mobile: single-column order of form, ad, then analysis. The ad never appears between verification controls or dashboard sections.
- Clear `h1`, labeled platform tabs, drag/drop alternative file picker, labeled paste field, keyboard-operable verification controls, readable chart summaries, and visible focus states.
- Charts have textual metric summaries and tabular data alternatives. Color is not the only indicator of gain or loss.
- Preserve Ta7leel’s forest/cream/brass visual language; avoid the look of a broker order-entry terminal.

## Testing and Verification

- Parser fixtures: MT5 positions, MT5 deal history, cTrader CSV, copied tabular rows, quoted CSV, locale variations, partial closes, multi-fills, deposits/withdrawals, blank rows, malformed dates, and unsupported formats.
- Reconciliation tests compare parsed net P&L and closed record count against sample source statements. A discrepancy blocks silent analysis and is shown to the user.
- Pure-statistic tests cover cost treatment, profit factor, expectancy, closed-balance drawdown, timezone grouping, zero/negative starting balance, and insufficient-sample insights.
- Save tests cover no duplicate imports, no manual-trade overwrite, partial failures, and authorization rules.
- UI tests cover anonymous flow, verification warnings, accessible file/paste controls, responsive ad placement, empty/large datasets, and no unintended network request containing trade data.
- Manual browser QA at phone, tablet, and desktop sizes with representative MT5 and cTrader exports. Use redacted fixtures only.

## Rollout

Ship behind a dedicated public route and add it to the Tools navigation once fixture reconciliation passes. Start with file and paste input, verification, and the core dashboard; enable Save to Journal only after deduplication tests pass. Measure import starts, parse success/failure by platform, verification completion, dashboard views, and opt-in saves without logging trade details.

## Open Configuration

The site already has an AdSense component. A dedicated ad slot ID for this page is preferred for reporting; until one is configured, show a neutral reserved block rather than reusing another page’s slot without a decision. This is configuration, not a blocker for building or testing the tool.
