---
library: audit
id: AUD-3
schema_version: 1.0.0
status: draft
---

# AUD-3 — Audit Index + Query Keys

## Purpose
Provide a deterministic index so the system and Operator UI can query audit history without
scanning entire ledgers.

## Index responsibilities
- map audit_log scopes → storage locations
- provide query keys for fast filtering:
 - by run_id
 - by stage_id
 - by gate_id
 - by action_type
 - by actor_id
 - by policy_decision_id / override_request_id / proof_id
 - by time window (occurred_at)

## Design rules
- The index is a registry of references, not a copy of events.
- The index must never contain sensitive payloads; only ids/refs.
