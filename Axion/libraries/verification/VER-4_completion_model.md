---
library: verification
id: VER-4
schema_version: 1.0.0
status: draft
---

# VER-4 — Completion Criteria Model

## Purpose
Define what "done" means at two levels:
1) **Unit done**: a work item / acceptance criterion is complete
2) **Run done**: the overall run is complete and releasable

## Inputs
- Acceptance map (required acceptance criteria + evidence requirements)
- Proof ledger (what proofs exist)
- Gate reports (which gates passed/failed)
- Standards snapshot (may introduce required proofs)

## Key concept
Completion is enforceable only if it is:
- explicit (rules not vague)
- measurable (proof requirements and artifact contract IDs)
- deterministic (no subjective evaluation unless manual_attestation is used)
