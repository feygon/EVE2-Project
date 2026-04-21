# Tasks: Reduce BurnRate First-Load Recalculation

## Task 1: Separate first-load UI setup from trigger mutation

- Update `public/js/burnrate-scenarios.js`
- Introduce a non-mutating first-load initialization path for overview cards
- Ensure the initial path does not call `/scenario/:id/update-ltc`

Acceptance criteria:

- On first load of `/BurnRate/`, no `update-ltc` request is issued automatically
- Card scenario IDs, trigger year UI, and timeline summary still initialize correctly
- Existing user-triggered updates still use the mutation path

## Task 2: Preserve one-pass first-load metrics loading

- Keep `loadMetricsForAllCards()` for initial metrics hydration
- Verify it runs once on first load after UI setup
- Ensure metrics still populate all three cards

Acceptance criteria:

- First load of `/BurnRate/` performs at most one initial metrics request
- First load performs zero writes in the normal path
- Metrics and labels still populate correctly on the overview page

## Task 3: Add regression coverage for initial-load behavior

- Add or extend tests around the overview initialization flow
- Cover the distinction between initial render and explicit user-triggered trigger-year changes

Acceptance criteria:

- There is a test or equivalent verification proving no first-load `update-ltc` request is issued
- Existing BurnRate route/integration tests still pass
- No new helper-test regressions are introduced

## Task 4: Document measured performance delta

- Record before/after first-load behavior in development docs or change notes
- Capture the reduced read/write count and remaining known hotspot

Acceptance criteria:

- Before/after query/write counts are documented
- Remaining projection-query hotspot is called out for future work
