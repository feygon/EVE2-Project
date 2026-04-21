# Design: Reduce BurnRate First-Load Recalculation

## Current Flow

### Server

`GET /BurnRate/`

- router middleware loads sidebar scenarios
- `getScenarios()` loads scenario overview rows
- page renders with `window.scenarioData`

### Client

On document ready:

- `initializeCards()` derives `currentTriggerYear`
- `initializeCards()` calls `updateCardsForTriggerYear(currentTriggerYear)`
- `updateCardsForTriggerYear()` posts `/BurnRate/scenario/:id/update-ltc` for all three scenarios
- each update persists the same trigger year and recalculates projections
- after those updates, `loadMetricsForAllCards()` posts `/BurnRate/scenarios/metrics`
- metrics recalculates projections again for all three scenarios

## Root Cause

The first-load client initializer mixes two concerns:

1. syncing UI to already-loaded scenario state
2. mutating backend scenario state

Because those are coupled, the page treats initial render like a user-triggered update even when nothing changed.

## Proposed Design

### 1. Separate initialization from mutation

Add a first-load path that:

- reads the initial trigger year from `window.scenarioData`
- assigns scenario IDs to the cards
- updates slider UI and timeline text
- loads metrics once

without calling the update endpoint.

### 2. Keep explicit mutation for real user changes

Retain `updateCardsForTriggerYear(year)` for actual button or slider changes after first load.

### 3. Avoid first-load writes for unchanged state

No write endpoint should be invoked during first-load initialization unless the client is intentionally reconciling missing or invalid server state. That case is not expected in the normal overview path.

### 4. Preserve current metrics contract

This first pass does not require API changes to `/BurnRate/scenarios/metrics`.

The optimization comes from avoiding the earlier update round, not from rewriting metrics.

## Alternatives Considered

### A. Pre-render all metrics server-side

Pros:

- avoids the initial metrics request

Cons:

- pushes more projection work into the initial GET
- mixes rendering and heavy projection calculation
- larger change surface

Decision:

- not chosen for the first pass

### B. Add bulk projection caching immediately

Pros:

- larger long-term reduction in query count

Cons:

- broader refactor
- more risk in a sensitive financial projection path

Decision:

- defer until after the simpler redundant-write removal lands

## Verification Strategy

### Functional

- `/BurnRate/` still renders all three cards
- initial metrics still appear without manual interaction
- changing trigger year after load still updates all cards correctly

### Efficiency

- first browser load should no longer hit `/scenario/:id/update-ltc` automatically
- first browser load should no longer perform initial write-backed recalculation
- query/write counts should be reduced from the current baseline

## Future Work

If the first pass is successful, the next optimization candidate is shared data loading inside the three-scenario metrics calculation path so common tables are not re-read for each scenario projection.
