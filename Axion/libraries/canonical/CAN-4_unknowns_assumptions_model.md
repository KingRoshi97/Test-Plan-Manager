---
library: canonical
id: CAN-4
schema_version: 1.0.0
status: draft
---

# CAN-4 — Unknowns / Assumptions Model

## Purpose
Capture uncertainty explicitly so the system does not:
- silently invent missing details
- bury assumptions in prose
- break determinism across reruns

Unknowns are first-class artifacts that can drive:
- gate failures (canonical integrity)
- template placeholders (mark as TBD)
- planning tasks (resolve unknowns)
- operator approvals (accept assumptions)

## Definitions
- **Unknown**: a missing or ambiguous fact required to proceed correctly.
- **Assumption**: a provisional chosen value used to proceed, which must be recorded and
reviewable.
- **Resolution**: a confirmed value replacing an unknown/assumption.

## Where unknowns come from
- intake missing fields
- intake conflicts (two values)
- standards gaps (standard requires something not provided)
- canonical dedupe conflicts (CAN-2)
