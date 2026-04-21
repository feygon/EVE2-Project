# Requirements Review: BurnRate Idempotent Parametric Test Coverage

## Executive Summary

- Overall Readiness: Ready
- Overall Score: 42/45
- Critical Issues: 0
- Key Strengths: clear testing target, explicit shelve/unshelve workflow, parametric coverage requirement, reuse of existing temp-DB integration pattern
- Primary Gaps: exact baseline artifact format is still open, no-op explicit update coverage is still deferred

## Detailed Scores

| Dimension | Score (1-5) | Justification |
|-----------|-------------|---------------|
| Clarity & Precision | 5 | The PRD clearly defines idempotency as non-mutation under repeated reads and names the initial fields to compare. |
| Completeness | 5 | It now covers route targets, DB snapshot strategy, full adjustable-field coverage, response stability, scenario coverage, and shelve/unshelve workflow. |
| Testability | 5 | The requirements are directly testable through temp-DB integration tests and before/after row snapshots. |
| Consistency | 5 | Goals, stories, and requirements all align around non-mutating overview and metrics reads. |
| Traceability | 4 | The work is tied to the BurnRate first-load optimization, though the PRD could later link to the OpenSpec change explicitly. |
| Feasibility | 5 | The existing BurnRate test harness already supports the needed temp-DB and router setup. |
| User Experience | 4 | This is mostly developer-facing, but the PRD still protects user-facing stability indirectly. |
| Security & Compliance | 4 | The tests reduce hidden-mutation risk and use isolated temp DB copies. |
| Maintainability | 5 | Parametric test structure is explicitly required, which will keep future scenario additions cheaper to cover. |

## Critical Issues (Must Fix Before Implementation)

None.

## Major Recommendations (Should Fix)

1. Put the new tests in a dedicated file.
   Rationale: idempotency concerns are distinct from the current route-smoke checks and will stay easier to maintain if separated.

2. Add a reusable snapshot helper for scenario fields.
   Rationale: the parametric requirement is easiest to satisfy cleanly with one helper that takes scenario IDs and field names.

## Minor Suggestions (Nice to Have)

1. Add a comment in the test file explaining that the baseline shelved branch is expected to fail the strict idempotency contract.
2. Record one sample baseline run result in a short companion note after execution.

## Missing Sections / Elements

- Exact baseline-report artifact choice
- Whether no-op explicit update calls are included in phase one

## Open Questions Requiring Clarification

- Should a no-op explicit update call also be included in phase one, or remain phase two?
