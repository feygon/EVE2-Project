# PRD: BurnRate Idempotent Parametric Test Coverage

## Introduction / Overview

The BurnRate overview performance work changed how the public demo initializes scenario cards and loads metrics on first page load. The key behavioral requirement is not just correctness of the rendered output. It is also idempotency: rendering or fetching metrics repeatedly without user-driven parameter changes must not mutate persisted scenario state.

This PRD defines the test plan needed to verify that behavior in a durable, repeatable way. The tests must be both:

- **idempotent-focused**, so repeated reads can be proven non-mutating
- **parametric**, so the same assertions apply across the BurnRate scenario set instead of being hard-coded to one scenario

The resulting tests should let us:

1. shelve the optimization changes
2. gather baseline behavior and expected failures against the old flow
3. unshelve the optimization
4. rerun the same tests to prove the idempotency improvement

## Goals

- Add automated tests that detect whether BurnRate overview loads mutate DB state.
- Add automated tests that detect whether repeated metrics requests mutate DB state.
- Make the tests parametric across the BurnRate scenarios:
  - `ScA_Baseline`
  - `ScA_NoTrust`
  - `ScA_MAPT`
- Preserve the current temporary-demo-DB-copy test pattern so tests do not mutate the working demo DB.
- Make the before/after optimization comparison explicit enough to support a shelve/unshelve validation loop.

## User Stories

1. As a developer, I can run a BurnRate idempotency suite and see whether repeated overview loads change persisted scenario state.
2. As a developer, I can run the same idempotency assertions across all BurnRate scenarios without duplicating test logic.
3. As a developer, I can shelve the first-load optimization, run the tests to characterize baseline behavior, unshelve the change, and rerun the same tests to confirm the improvement.
4. As a maintainer, I can detect future regressions where first page load silently reintroduces write-backed initialization.

## Functional Requirements

1. Add an integration-level test that loads `/BurnRate/` and verifies that scenario state does not change as a side effect of rendering the overview page.
2. The overview idempotency test must compare relevant persisted fields before and after the request.
3. The compared fields must include the timeline fields:
   - `ltc_trigger_year`
   - `memory_care_year`
   - `year_of_passing`
4. The compared fields must also include all adjustable persisted scenario parameters currently exposed through the BurnRate route family.
5. This first phase must explicitly include high-risk booleans and toggles such as:
   - `sell_condo_upfront`
   - `roommate_enabled`
   - `optimizer_enabled`
   - `trust_type`
6. The test design must allow adding more persisted fields later without rewriting the entire assertion structure.
7. Add an integration-level test that calls `/BurnRate/scenarios/metrics` twice and verifies that persisted scenario state does not change as a side effect.
8. The repeated metrics test must also verify that the response payload is identical across repeated calls when inputs are unchanged.
9. Add a parametric test structure that iterates over the BurnRate scenario IDs rather than hard-coding repeated assertions separately per scenario.
10. The parametric test inputs must cover:
   - single-scenario checks
   - all-scenarios checks where appropriate
11. The tests must continue to run against a temporary copy of `burnrate_demo.db`.
12. The tests must avoid depending on browser-only tooling so they can run in the normal test suite.
13. The tests must seed distinct non-default values into the tracked fields so silent resets or normalization are detectable.
14. The tests must be written so that the old pre-optimization flow is expected to fail the non-mutation contract, while the optimized flow is expected to pass.
15. The PRD must support a baseline characterization workflow:
   - shelve optimization
   - run tests and capture failures/observations
   - unshelve optimization
   - rerun tests and compare results

## Non-Goals

- Rewriting the BurnRate UI test stack around a browser test framework
- Replacing the existing BurnRate route integration suite
- Measuring exact SQL query counts in this first test pass
- Refactoring the financial projection engine for testability beyond what is needed to assert non-mutation

## Design & Technical Considerations

- The existing integration tests in `test/integration/burnrate-routes.test.js` already create a temp DB copy and mount the BurnRate router in a test app. The new idempotency tests should build on that pattern.
- The tests should use helpers to snapshot scenario rows from the temp DB before and after requests.
- The test data shape should be parameter-driven, for example:
  - an array of scenario IDs
  - an array of persisted fields to compare
- The seeded test values should be distinct enough across scenarios and fields to make accidental mutation obvious.
- The assertions should avoid coupling to presentation text and focus on persisted DB state plus route success.
- If needed, the tests may be placed in a new file such as:
  - `test/integration/burnrate-idempotency.test.js`
  rather than crowding the current route suite.
- The shelve/unshelve comparison is an execution workflow, not something the tests themselves must automate.
- The optimized first-load path should satisfy the idempotency contract without requiring browser-network instrumentation inside the test suite.

## Success Metrics

- We have an automated test suite that fails on the old write-backed first-load behavior and passes on the new non-mutating first-load behavior.
- The tests cover all three BurnRate scenarios through parameterized inputs.
- The tests can be rerun repeatedly without mutating the source demo DB.
- Future regressions in BurnRate overview or metrics idempotency are caught in CI/test runs.

## Open Questions

- Should a no-op explicit update test also be included now, or treated as a second-phase enhancement?
- Do you want the baseline characterization results stored in a companion markdown note, or is console/test output sufficient?
