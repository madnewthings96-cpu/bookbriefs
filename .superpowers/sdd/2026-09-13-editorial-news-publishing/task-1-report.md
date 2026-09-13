# Task 1 Report — News Domain Model

Status: DONE_WITH_CONCERNS

Implemented the news domain types, constants, draft factory, slugging, validation, featured/related selection, date formatting, published fixture, and frozen development-only sample draft. Added focused model tests covering the required editorial rules and TDD red/green cycle.

Commit: `53ec64d2db4f7630e4e6c6d9addd2c2f05b20cf9` — `feat: add news article domain model`

Tests: `node --import tsx --test tests/newsModel.test.ts` — 9 passed, 0 failed.

Targeted TypeScript check passed for all Task 1 files. Full `npx tsc --noEmit` remains blocked by pre-existing unrelated errors in downloads/UI, scripts/library, and PDF utilities; no errors point to Task 1 files.

Files: `components/news/newsModel.ts`, `components/news/newsFixtures.ts`, `tests/newsModel.test.ts`

## Fix round 1

Changed source validation to require the exact literal `https://` prefix before URL parsing, rejecting parser-normalized forms such as `https:example.com`.

Added regression test: `source validation requires the literal https:// URL prefix`.

Verification: `node --import tsx --test tests/newsModel.test.ts` — 10 passed, 0 failed (Node DEP0205 warning only).
