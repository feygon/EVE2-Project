# Spec: BurnRate Overview First-Load Efficiency

## Goal

The BurnRate overview page must avoid redundant write-backed recalculation on first browser load while preserving current displayed scenario behavior.

## Requirements

### R1. First-load initialization must not mutate scenario state

When a user opens `/BurnRate/` and the page is rendering the current stored scenario state:

- the client must not automatically call `/BurnRate/scenario/:id/update-ltc`
- the client must not automatically perform other write-backed scenario mutations as part of overview initialization

### R2. First-load metrics hydration must remain functional

When `/BurnRate/` first loads:

- all visible scenario cards must still receive metrics without requiring manual user interaction
- the metrics load must use the current stored scenario state

### R3. Explicit user changes must still propagate normally

After the first load completes:

- if the user changes the trigger year through the existing controls, the app may call the current update endpoints
- all scenario cards must continue to update consistently after that explicit change

### R4. Query and write volume must improve measurably

The implementation must reduce first-load backend work compared to the current baseline.

Minimum expected improvement:

- remove the initial automatic write round
- remove the projection recalculation round caused only by that write round

### R5. Behavior must remain visually consistent

The optimization must not break:

- scenario card visibility
- trigger-year display
- timeline summary display
- metrics population on the overview page
