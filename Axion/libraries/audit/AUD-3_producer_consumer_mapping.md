---
library: audit
id: AUD-3-GOV
title: Producer-Consumer Mapping
schema_version: 1.0.0
status: draft
---

# AUD-3 — Producer-Consumer Mapping

## Purpose

This doctrine defines which libraries produce audit events, which consume them, and how events are routed between producers and consumers.

## Producers

Libraries that emit audit events into the audit ledger:

| Producer Library | Event Types Emitted | Trigger |
|---|---|---|
| `gates/` | `override_requested`, `override_approved`, `override_denied` | Gate evaluation with operator intervention. |
| `intake/` | `run_started`, `run_paused`, `run_resumed`, `run_cancelled` | Run lifecycle transitions. |
| `canonical/` | `policy_decision_applied` | Policy engine renders a decision on a canonical artifact. |
| `kit/` | `export_requested`, `export_approved`, `export_denied` | Export bundle generation and approval. |
| `audit/` (self) | `manual_attestation_recorded` | Operator manually attests to a fact or override. |
| `verification/` | `stage_rerun_requested` | Verification triggers a stage re-evaluation. |

## Consumers

Libraries and subsystems that read audit events:

| Consumer | Purpose | Access Pattern |
|---|---|---|
| `gates/` | Reads prior approvals/overrides to inform gate re-evaluation. | Query by `run_id` + `gate_id`. |
| `canonical/` | References audit trail for provenance of policy decisions. | Query by `policy_decision_id`. |
| Operator UI | Displays audit timeline for runs, overrides, and approvals. | Query by `run_id`, paginated. |
| Compliance Export | Generates compliance-ready audit reports for external review. | Full scan with filters on date range and risk class. |
| Policy Engine | Reads audit history to evaluate cumulative override counts and patterns. | Aggregate query by `actor_id` + `action_type`. |

## Event Routing

### Routing Rules

1. All audit events are written to the append-only audit ledger before any consumer is notified.
2. Events are indexed by `audit_event_id`, `run_id`, `actor_id`, and `action_type`.
3. Cross-library consumers access audit events via stable references (paths or IDs), never by direct ledger position.
4. Event ordering is preserved per `run_id` using monotonic sequence numbers.

### Routing Topology

```
Producer (gates/, intake/, canonical/, kit/, verification/)
    │
    ▼
┌──────────────────┐
│  Audit Ledger    │  (append-only, hash-chained)
│  (audit/)        │
└──────────────────┘
    │
    ├──► gates/          (query by run_id + gate_id)
    ├──► canonical/      (query by policy_decision_id)
    ├──► Operator UI     (query by run_id, paginated)
    ├──► Compliance      (full scan, filtered)
    └──► Policy Engine   (aggregate by actor + action)
```

### Cross-Library Contract

- Producers MUST emit events that conform to `audit_action.v1` schema.
- Consumers MUST NOT assume field ordering within events.
- Consumers MUST tolerate additive schema changes (new optional fields).
- Consumers MUST NOT write to the audit ledger; only `audit/` controls write access.

## Event Lifecycle

| Phase | Owner | Action |
|---|---|---|
| Emit | Producer library | Constructs event payload conforming to `audit_action.v1`. |
| Validate | `audit/` | Validates event against schema, rejects malformed events. |
| Persist | `audit/` | Appends event to ledger with hash chain linkage. |
| Index | `audit/` | Updates indexes for consumer query patterns. |
| Consume | Consumer library | Reads events via indexed queries. |
