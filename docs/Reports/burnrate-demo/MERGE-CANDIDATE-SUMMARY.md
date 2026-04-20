# BurnRate Demo Merge Candidate Summary

## Candidate shape

The BurnRate merge candidate was extracted as a clean additive delta.

Included at a high level:

- BurnRate router
- BurnRate database connector
- BurnRate callbacks
- required planner engine modules
- BurnRate views and client-side scripts
- BurnRate demo database copy
- BurnRate route and sequestration tests
- one additive `main.js` modification to register the route

## Exclusions enforced during candidate preparation

- no Nickerson callback file
- no extra planner files outside the proven dependency set
- no nested duplicate directories
- no transient SQLite sidecar files
- no helper materialization included in the candidate

## Candidate verification

- merge-candidate verifier: `PASS`
- clean-host BurnRate-focused suite: `26 passing`
- Ubuntu VM BurnRate-focused suite: `26 passing`

## Candidate
