---
library: canonical
id: CAN-5
schema_version: 1.0.0
status: draft
---

# CAN-5 — Canonical Artifacts (S4 Outputs)

## Purpose
Define the canonical-stage outputs that downstream stages require.

## Required artifacts
S4_CANONICAL_BUILD must produce:

1) **CANONICAL_SPEC** (canonical_spec.v1)
- entity graph representing the target system
- stable IDs and relationships
- minimal metadata for downstream selection/planning

2) **UNKNOWN_ASSUMPTIONS** (unknown_assumptions.v1)
- explicit unknowns and assumptions list
- deterministic IDs and pointers into canonical/spec

## Optional artifacts (recommended)
3) **CANONICAL_BUILD_REPORT** (canonical_build_report.v1)
- a concise report of:
  - how many entities by type
  - how many relationships by type
  - unknowns count by severity
  - any integrity check failures/warnings (if non-fatal in prototype)
