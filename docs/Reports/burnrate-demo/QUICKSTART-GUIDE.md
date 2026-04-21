# BurnRate Demo Quickstart Guide

## What this is

BurnRate is a demo of a private financial estate planning app for elder trust, retirement, and real estate assets with dynamic budget optimization. It was anonymized and sanitized in a Virtual Machine to empirically ensure sequestration from its original source.

## What was validated

- BurnRate route works as an additive demo route
- BurnRate merge candidate was extracted cleanly
- BurnRate-focused suite passed in development, clean-host, and Ubuntu VM environments
- Ubuntu VM sequestration test passed without relying on a mounted host share during execution

## Fast result summary

- BurnRate-focused suite: `26 passing`
- Ubuntu VM BurnRate-focused suite: `26 passing`
- Full Ubuntu VM public suite: `147 passing`, `3 failing`

The 3 failing tests are broader shared-helper follow-ups, not BurnRate sequestration failures.

## Key artifacts

- [All Reports](./INDEX.md)
- [Validation Summary](./VALIDATION-SUMMARY.md)
- [VM Sequestration Result](./VM-SEQUESTRATION-RESULT.md)
- [Merge Candidate Summary](./MERGE-CANDIDATE-SUMMARY.md)

## Merge candidate

A stable `2.6.0` baseline was identified first, then the BurnRate work was extracted and validated as an additive delta against that baseline. The result was a clean sequestered BurnRate candidate.

## Practical conclusion

The BurnRate demo passed its focused validation stack and its Ubuntu VM sequestration test. It is ready to be treated as a validated merge candidate for the BurnRate demo route work sample.
