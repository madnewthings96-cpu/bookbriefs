# Remediation 2 report

- Status: complete; account-scoped progress/notes persistence and dashboard catalog states are implemented.
- Files: `contexts/UserProgressContext.tsx`, `contexts/PersonalNotesContext.tsx`, new `contexts/userScopedPersistence.ts`, overview/library/notes pages and view/CSS, plus `tests/userScopedDataPersistence.test.ts` and `tests/dashboardCatalogState.test.ts`.
- TDD red: the new persistence test initially failed on the missing helper; catalog tests failed because the view/pages had no catalog error/loading/retry behavior.
- TDD green: focused persistence tests passed 7/7; catalog tests passed 3/3; existing overview/workspace tests passed unchanged.
- Race-safety model: `UserScopedIdentity` versions every observed user ID, invalidates readiness on logout/switch, captures the user ID for reads/writes, and ignores cancelled/stale hydration results. Providers reset exposed state immediately and gate every mutation/save on the hydrated non-null captured identity.
- Storage compatibility: existing per-user keys and JSON shapes remain unchanged; JSON/access failures are caught; malformed top-level records are removed only from their own user key; valid legacy dates/items are normalized while invalid array items are filtered safely.
- Catalog behavior: BooksContext `loading`, `error`, and `refreshBooks` now reach all three dashboard surfaces. Loading uses local status/skeleton states; failures use retryable alerts without replacing challenge, notes, stale library, or other usable state; true emptiness is shown only without loading/error.
- Verification: `node --import tsx --test tests/dashboard*.test.ts` passed 35/35; full `node --import tsx --test tests/*.test.ts tests/*.test.tsx` passed 132/132; `npm run build` passed sitemap, Vite, prerender, and SEO tests; `git diff --check` passed.
- Commit: `f4d7069` (`fix: isolate dashboard user data and catalog failure states`).
- Concern: repository-wide `npx tsc --noEmit` still reports pre-existing errors in downloads/UI command, library scripts, and PDF typing; no errors originate in this remediation. The first sandboxed build attempt hit tsx IPC `EPERM`; the approved rerun passed.

## Fix round 1

- Scope: closed review gaps in `UserScopedStore` provider orchestration, `SummaryDetailPage`, `SummaryVisitTracker`, strict persistence validation, catalog surface modeling, Library/Notes wiring, and rendered catalog retry behavior.
- TDD red: new tests first failed for missing store/model modules, the unguarded overview retry button, and permissive malformed scalar/child normalization; all are now green.
- TDD green: focused context/catalog/summary tests passed 17/17; dashboard plus remediation tests passed 49/49; full TS/TSX suite passed 139/139.
- Race-safety model: providers reset the shared store during render on identity change, hydrate with versioned captured IDs, publish only current ready data, and expose `persist`/`update` gates used by effects and actions. Summary visits wait for `isUserDataReady` and are idempotent per identity/book across StrictMode-like repeats while allowing logout/A→B transitions.
- Storage compatibility: scoped keys and JSON shapes are unchanged; malformed scalars, dates, optional fields, arrays, or child items invalidate/remove only that user record, while valid legacy records normalize dates and remain intact. Access/parse/write failures degrade safely.
- Catalog behavior: Library and Notes consume the pure catalog surface model; stale usable content wins over loading/error banners, while true empty/error/loading states remain distinct. Overview retry controls render only when a callback is supplied; retry handlers call `refreshBooks`.
- Verification: `npm run build` passed (sitemap, Vite, prerender, SEO tests); `git diff --check` passed. `npx tsc --noEmit` still reports only the pre-existing downloads/UI command, library-script, and PDF typing errors.
- Commit: pending for this fix round.
