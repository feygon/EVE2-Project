# Proposal: Reduce BurnRate First-Load Recalculation

## Summary

The BurnRate overview page currently performs unnecessary database work on first browser load. The server renders the page, then the client immediately issues write-backed trigger updates for all three scenarios and recalculates projections before requesting metrics and recalculating projections again.

This change removes redundant first-load recalculation and establishes a measured, reviewable path to lower first-load query volume without changing BurnRate scenario outcomes.

## Problem

The current first-load overview path does the following:

1. Server renders `/BurnRate/`
2. Client initializes cards
3. Client calls `updateCardsForTriggerYear(currentTriggerYear)` even when the loaded trigger year is already current
4. That updates all three scenarios through `/scenario/:id/update-ltc`
5. Each update recalculates projections
6. The client then calls `/scenarios/metrics`
7. Metrics recalculates all three scenarios again

Observed cost on first load:

- Server render only: `2` reads
- Full browser first load: `59` reads and `3` writes

The majority of that work is redundant.

## Goals

- Reduce first-load query volume on `/BurnRate/`
- Eliminate unnecessary first-load writes for unchanged trigger values
- Preserve current scenario outputs and page behavior
- Make the optimization measurable with explicit acceptance criteria

## Non-Goals

- Rewriting the BurnRate projection engine
- Changing scenario math or BurnRate business rules
- Replacing the current metrics API contract
- Optimizing all parameter-update flows in this change

## Proposed Approach

1. Treat the server-rendered scenario state as authoritative on first load.
2. Do not call `update-ltc` on initial page load when the trigger year is already current.
3. Perform at most one first-load metrics fetch for the visible cards.
4. Keep later explicit user-triggered updates working through the existing update endpoints.
5. Add instrumentation or a clear verification method so first-load query reduction can be confirmed.

## Expected Outcome

Minimum expected improvement:

- Remove the initial `3` writes
- Remove one full round of three-scenario projection recalculation

Expected first-load cost after the first pass:

- roughly `32` reads and `0` writes

Potential later improvement, outside this first pass:

- shared projection data loading or per-request caching to reduce the remaining repeated reads in `/scenarios/metrics`

## Risks

- The overview page currently relies on client initialization side effects; skipping them may leave some UI state unsynchronized if initialization is not carefully separated from mutation.
- Metrics and displayed trigger-year state must stay aligned after the change.
- Tests may need to be expanded because current suites focus more on correctness than startup efficiency.
