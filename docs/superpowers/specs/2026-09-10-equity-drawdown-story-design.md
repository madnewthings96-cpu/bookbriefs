# Equity and Drawdown Story Design

**Status:** Approved

**Date:** 2026-09-10

**Surface:** `/dashboard/trading`

## Subject, Audience, and Job

This is a decision journal for active traders. The equity panel's single job is to explain both account direction and recovery risk, rather than showing a balance line without context.

## Approved Direction

Replace the stretched equity card and its duplicated Record/Today/Week summary with one compact performance story:

1. A primary equity curve with win/loss trade markers, start balance, balance goals, and the existing detailed tooltip.
2. A `1W / 1M / 3M / All` range selector. `All` is the initial selection.
3. A synchronized drawdown-depth band directly below the equity curve. It shares the visible time range and tooltip context with the equity chart.
4. A concise narrative insight followed by four metrics: Peak equity, Current drawdown, Worst drawdown, and Recovery.
5. The card must size to its own content instead of stretching to the height of the adjacent insight column.

## Metric Semantics

- Peak equity is the highest balance in the complete equity ledger.
- Current drawdown is the final ledger point's percentage below its running peak.
- Worst drawdown is the largest percentage drawdown in the complete ledger.
- Recovery counts trade-bearing points after the worst-drawdown trough until the prior peak is met or exceeded.
- If the worst drawdown has not recovered, Recovery reads `In progress`.
- If there is no drawdown, Recovery reads `At peak`.
- Range selection changes the visible charts only; account-level headline and footer metrics remain stable.
- A time range includes the latest point before its cutoff when one exists, preserving visual continuity into the selected period.

## Visual System

- Paper: `#fffdf7`.
- Ink: `#16231e`.
- Forest: `#102e24`.
- Profit: `#2f8a67`.
- Loss and drawdown: `#c65b50`.
- Goal and small emphasis: `#c89a49`.
- Rules and chart grid: `rgba(16, 46, 36, 0.12)`, represented by the existing `--fieldbook-line` token in CSS and an equivalent valid chart stroke.
- Use the existing Newsreader/Georgia editorial face for the card title and insight; use the existing sans-serif stack for controls, axes, tooltips, and metrics.

The signature element is the synchronized underwater drawdown band. No extra decorative cards, gradients, or animation loops are added.

## Interaction and Accessibility

- Range options are real buttons with `aria-pressed` state and at least a 44px target.
- Chart wrappers expose concise accessible labels.
- Charts keep chronological left-to-right plotting even when the surrounding dashboard is tested in RTL.
- Layout uses logical properties and collapses to a two-column metric grid on narrow screens without document-level horizontal scrolling.
- Recharts animation is disabled so the panel respects reduced-motion expectations.

## Empty and Sparse Data

- Preserve the existing honest empty state when no points are supplied.
- A single starting-balance point reports no drawdown and `At peak`; it does not invent a recovery duration.

## Non-goals

- No database, Firestore, trade schema, or route changes.
- No replacement of the surrounding Discipline, Next Best Action, or Session Risk cards.
- No benchmark comparison, projection, or fabricated analytics.
- No new package dependency.
