# 30-Day Reader’s Trail Design

**Status:** Approved direction, implementation pending

**Date:** 2026-09-07

**Surface:** `/reading-challenge`

## Context

The navigation promises a “30-day challenge,” but the current page stores and presents a calendar-year reading target. The page is functional, yet its generic cards, annual countdown, and orange progress ring do not match the name or Ta7leel’s newer forest-and-cream visual identity.

This redesign turns the feature into a genuine rolling 30-day reading sprint. Its single job is to make today’s next reading action obvious while showing momentum without guilt or visual noise.

## Goals

- Give every challenge a real 30-day start and end date.
- Make daily momentum and the next useful action visible at a glance.
- Preserve existing completed-book counts during migration without inventing completion dates.
- Keep marking and unmarking summaries as read simple and reversible.
- Support active, completed, expired, empty, loading, error, and signed-out states.
- Match the Ta7leel forest, cream, and brass design language across desktop and mobile.
- Meet keyboard, screen-reader, reduced-motion, and touch-target requirements.

## Non-goals

- Challenge history, social leaderboards, reminders, push notifications, and streak freezes.
- Multiple simultaneous challenges.
- A new news, books, or recommendation API.
- Changing how book summaries themselves are read.

## Product Model

### Challenge lifecycle

1. **No challenge:** The reader chooses a goal of 5, 10, or 15 summaries and starts a 30-day sprint.
2. **Active:** Day 1 through day 30. The reader can mark books as read, change the target, or delete the sprint.
3. **Completed:** The target has been reached before the end date. The trail remains interactive so the reader can continue beyond the target.
4. **Expired:** The end date has passed. The result is summarized and the reader can start a fresh sprint.
5. **Deleted:** The active document is removed after confirmation.

Changing the target does not reset dates or completed books. Starting a new sprint resets the active sprint’s dates and progress after an explicit confirmation when prior progress exists.

Status precedence is deterministic: an elapsed end date is `expired`; otherwise meeting the target is `completed`; otherwise the sprint is `active`.

### Progress semantics

- A summary counts toward the goal once its book ID appears in `booksRead`.
- A trail day is complete when at least one new summary was marked read on that local calendar date.
- Unmarking a book removes its completion record and may change the corresponding day marker.
- The current streak counts consecutive active calendar days ending today when today has activity, or ending yesterday when today is still incomplete. It is zero when neither today nor yesterday has activity.
- Legacy books remain in the total count and completed shelf, but they do not mark trail days because no historical completion date exists.
- Progress can exceed 100%; visual bars clamp at 100%, while copy may report the over-target count.

## Data Architecture

### Firestore document

The existing collection remains `reading_challenges`. Documents continue to use the start year in their ID: `{userId}_{startYear}`. This avoids an immediate collection migration and preserves existing ownership rules.

The client reads the current-year and previous-year documents in parallel. A previous-year document is used only when its 30-day window crosses into the current year and remains active.

Version 2 extends the existing document:

```ts
interface ReadingChallenge {
  schemaVersion: 2;
  userId: string;
  year: number;              // local calendar year of startDate
  goal: number;              // 1–1000; UI presets are 5, 10, 15
  booksRead: string[];
  startDate: string;         // local YYYY-MM-DD, inclusive
  endDate: string;           // local YYYY-MM-DD, inclusive; day 30
  bookCompletions: Array<{
    bookId: string;
    completedOn: string;     // local YYYY-MM-DD
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Date-only strings are deliberate: the challenge is based on the reader’s perceived calendar days, not rolling 24-hour intervals. Pure date helpers will parse and compare these values without UTC date drift.

### Legacy migration

Existing documents contain `year`, `goal`, and `booksRead` but no sprint dates or completion records.

- Loading a legacy document normalizes it in memory to schema version 2 with today as day 1 and day 30 as the inclusive end date.
- Existing `booksRead` values remain intact.
- `bookCompletions` begins empty so the interface does not fabricate a daily history.
- The normalized fields are persisted on the next user mutation. Loading alone causes no background write.
- If both a current-year and a still-active previous-year document exist, the most recently updated active document wins.

### Context API

`ReadingChallengeContext` will expose:

```ts
interface ReadingChallengeContextType {
  challenge: ReadingChallenge | null;
  loading: boolean;
  startChallenge(goal: number): Promise<void>;
  updateGoal(goal: number): Promise<void>;
  restartChallenge(goal: number): Promise<void>;
  deleteGoal(): Promise<void>;
  markBookAsRead(bookId: string): Promise<void>;
  unmarkBookAsRead(bookId: string): Promise<void>;
  isBookRead(bookId: string): boolean;
  progress: ChallengeProgress;
}
```

Pure helpers will calculate date keys, day number, days remaining, status, streak, completed trail days, and pace. UI components will consume these derived values rather than repeat date arithmetic.

### Security rules

`isValidReadingChallenge` will allow the four version-2 fields while preserving user ownership, immutable `userId`, immutable `createdAt`, valid goal bounds, and list-size limits. Version-2 writes must include all new fields and validate their primitive types. Legacy documents remain readable; client updates convert them to a complete version-2 shape.

## Experience Design

### Visual direction: The Reader’s Trail

The signature is a 30-stop path inspired by a trail map in a field journal. It communicates real state rather than decorating the page:

- completed day: solid forest marker with check;
- today: brass marker with a restrained pulse;
- future day: cream outline;
- inactive past day: muted open marker, never a punitive red;
- days 7, 14, 21, and 30: milestone flags.

The interface uses one bold visual moment—the trail. Supporting cards stay calm and editorial.

### Visual tokens

- Deep Forest `#0B2B22`: hero, key actions, primary text.
- Moss `#355B45`: completed progress and secondary emphasis.
- Cream `#F6F0E3`: page atmosphere.
- Parchment `#E8DCC5`: quiet surfaces and dividers.
- Brass `#C99A46`: today, milestones, and positive focus.
- Coral `#B85135`: destructive or urgent actions only.

Typography:

- **Newsreader:** hero and major section headings.
- **Plus Jakarta Sans:** body copy, buttons, and form controls.
- **ui-monospace / SFMono:** day number, countdown, and progress data.

### Authenticated layout

```text
┌──────────────────────────────────────────────────────────────┐
│ 30-DAY READING SPRINT                         DAY 08 / 30    │
│ Build momentum, one useful idea at a time.                   │
│                                                              │
│ ●—●—●—●—●—●—⚑                                               │
│                ╲                                             │
│                 ●—◉—○—○—○—○—⚑                              │
│                                                              │
│ [Today’s mission / continue book] [Progress and streak]      │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌──────────────────────────────┐
│ Choose the next summary     │ │ Milestones                   │
│ Search + category filters   │ │ Completed shelf              │
│ Responsive book cards       │ │ Challenge controls           │
└─────────────────────────────┘ └──────────────────────────────┘
```

The hero starts with the challenge’s status, day number, and remaining time. “Today’s mission” selects the first unread filtered book as a practical next step. The progress panel shows summaries completed, target, current streak, and weekly pace.

The library remains the primary working area. Milestones and completed books support it rather than competing with it.

### Signed-out and loading states

The signed-out page previews a miniature trail so readers understand the product before creating an account. It offers clear “Start your sprint” and “Log in” actions.

The loading state uses a trail-marker skeleton rather than a generic spinner. Reduced-motion users receive a static state.

### Empty and expired states

- No challenge: a goal chooser sits inside the trail hero, with 5, 10, and 15-summary presets.
- No matching books: explain how to clear the search or category filter.
- Empty completed shelf: direct the reader to mark the first summary.
- Expired challenge: show the final count and a single “Start a new 30 days” action.

### Dialogs

Goal, restart, and delete dialogs use `role="dialog"`, `aria-modal="true"`, labelled titles, announced errors, focus trapping, Escape-to-close, focus restoration, and disabled states while saving. Delete remains visually secondary until the confirmation step.

## Responsive Behavior

- Desktop: hero trail and progress panel share a wide asymmetric grid.
- Tablet: progress moves below the trail; book library remains multi-column.
- Mobile: the path becomes a vertically wrapping sequence, with today kept visible near the top. Statistics become a horizontally scrollable, keyboard-focusable rail only when they cannot fit.
- Book cards remain at least two columns on common phone widths.
- All controls have at least a 44×44px hit area.
- The fixed mobile navigation must not cover the final controls; the page reserves bottom space.

## Motion and Interaction

- On initial entry, the hero label, heading, trail, and mission appear in a short staggered sequence.
- The today marker uses a low-amplitude brass halo, disabled under `prefers-reduced-motion`.
- Hover and active states use interruptible transitions; press feedback uses `scale(0.96)`.
- Progress width changes animate only the width property.
- No `transition: all` or broad `will-change` declarations.

## Accessibility

- A single page `h1` and correctly nested section headings.
- Trail is a named region with a concise screen-reader summary; decorative connectors are hidden.
- Today and completed states are communicated through text and accessible labels, not color alone.
- Dynamic success and error feedback uses a polite live region.
- Images retain descriptive alternative text and pure-black/white subtle outlines.
- Headings use balanced wrapping, body copy uses pretty wrapping, and changing metrics use tabular numerals.
- Keyboard focus is clearly visible across filters, book cards, challenge controls, and dialogs.

## Error Handling

- Failed challenge mutations keep the current in-memory state and show a specific retry message.
- Mark/unmark buttons disable while their book is being updated to prevent duplicate writes.
- A failed migration write does not discard legacy progress.
- Invalid or malformed date fields fall back to a fresh in-memory 30-day window and surface no broken arithmetic.

## Testing Strategy

### Pure model tests

- Inclusive 30-day date range across month, year, leap-year, and daylight-saving boundaries.
- Day number and remaining-days clamping before, during, and after a sprint.
- Active, completed, and expired status derivation.
- Streak behavior for today, yesterday, gaps, and multiple books on one day.
- Legacy normalization preserves `booksRead` without inventing `bookCompletions`.
- Previous-year crossover selection.

### Component and accessibility tests

- Authenticated, signed-out, empty, completed, and expired structures.
- One `h1`, named trail region, dialog semantics, and labelled filters.
- Challenge controls remain disabled during writes.
- CSS contract for responsive breakpoints, reduced motion, tabular numerals, focus states, exact transitions, and image outlines.

### Integration verification

- Firestore rules tests for valid version-2 create/update/delete and rejected ownership/schema violations.
- Production build and SEO prerender.
- Browser QA at phone, tablet, and desktop widths, including no page-level horizontal overflow.

## Rollout

The feature ships as a backward-compatible client and rules update. No destructive batch migration is required. Legacy progress is upgraded lazily on the reader’s next mutation. If the new fields are missing or malformed, the UI falls back to a valid in-memory sprint while retaining completed books.
