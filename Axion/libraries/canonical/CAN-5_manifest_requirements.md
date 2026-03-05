---
library: canonical
id: CAN-5a
schema_version: 1.0.0
status: draft
---

# CAN-5a — Manifest Requirements (Canonical Outputs)

When S4 completes successfully, the run manifest must include artifact entries for:

- contract_id: CANONICAL_SPEC
- contract_id: UNKNOWN_ASSUMPTIONS
- (optional) contract_id: CANONICAL_BUILD_REPORT

Each artifact entry must include:
- path
- produced_by_stage: S4_CANONICAL_BUILD
- hash if hashing enabled
