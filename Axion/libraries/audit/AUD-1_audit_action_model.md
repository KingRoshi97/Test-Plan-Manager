---
library: audit
id: AUD-1
schema_version: 1.0.0
status: draft
---

# AUD-1 — Audit Action Model

## Purpose
Define the canonical structure of an audit action so Axion can record:
- who did something
- what they did
- when they did it
- why they did it
- what object/run/stage/gate/policy it affected

## What counts as an audit action
Minimum action types:
- run_started
- run_paused
- run_resumed
- run_cancelled
- stage_rerun_requested
- override_requested
- override_approved
- override_denied
- export_requested
- export_approved
- export_denied
- policy_decision_applied
- manual_attestation_recorded

## Required fields (minimum)
Every audit action must include:
- audit_event_id
- action_type
- actor
- occurred_at
- target
- reason
- refs

## Design rules
- Audit actions are human-accountability records, not telemetry analytics.
- "reason" is required for sensitive actions:
  - overrides
  - reruns
  - exports
  - manual attestations
- References must use stable ids/paths, not embedded content.
