---
library: system
id: SYS-6
schema_version: 1.0.0
status: draft
---

# SYS-6 — Policy Engine Hooks

## Purpose
`system/` defines how the runtime **invokes** the policy engine in a deterministic way.
The meaning of policies (risk classes, overrides, etc.) lives in `policy/`.
This library defines:
- the hook points (when policy is consulted)
- the request/response schemas
- how decisions are recorded (evidence + expiry)

## Hook points (minimum)
Policy must be consulted at:
1) Run start (can this run start?)
2) Pin resolution (are run-level overrides allowed?)
3) Adapter selection (is this execution environment allowed?)
4) Quota enforcement (block vs require approval vs degrade)
5) Gate evaluation overrides (is override permitted, who can approve, expiry required)
6) Kit export (internal vs external constraints)

## Determinism requirement
Policy decisions must be:
- computed from explicit inputs (no hidden state)
- recorded in run manifest with decision id + effective policy ids
- stable for the duration of the run
