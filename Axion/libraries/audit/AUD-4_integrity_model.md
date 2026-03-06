---
library: audit
id: AUD-4
schema_version: 1.0.0
status: draft
---

# AUD-4 — Integrity Rules (Tamper-Evidence)

## Purpose
Define how audit records can be trusted as unchanged after recording.

## Integrity goals
- detect silent edits to audit events
- detect deleted/reordered events
- support optional tamper-evident verification without changing audit semantics

## Integrity levels
### Level 0 — Append-only only
- events are append-only
- no hash chain required

### Level 1 — File hash
- the serialized audit log has a recorded hash
- detects file changes but not per-event history structure

### Level 2 — Hash chain
- each event contributes to a rolling chain hash
- detects edits, deletions, and reordering

## Design rule
Tamper-evidence is optional but strongly recommended for:
- compliance runs
- override-heavy workflows
- external exports
