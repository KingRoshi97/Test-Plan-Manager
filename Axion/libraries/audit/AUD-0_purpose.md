---
library: audit
id: AUD-0
schema_version: 1.0.0
status: draft
---

# AUD-0 — audit/ Purpose + Boundaries

## Purpose
`audit/` defines Axion's **operator action tracking**:
- what actions are recorded (who/what/when/why)
- how actions are written (append-only ledger)
- how actions link to runs, stages, gates, and policy decisions

Audit is for accountability and traceability, not telemetry analytics.

## What it governs (in scope)
- Audit event schema (operator actions)
- Audit log/ledger schema (per run / per workspace)
- Required fields for traceability (actor, reason, references)
- Tamper-evident hooks (hash chaining optional)

## What it does NOT govern (out of scope)
- Gate evaluation semantics → `gates/`
- Proof ledger semantics → `verification/`
- Telemetry events/metrics → `telemetry/`
- Permissions/authn/authz models → `system/` (audit just records results)

## Consumers
- Operator UI (who approved what, overrides, reruns)
- Compliance/audit review
- Policy engine (reads approvals/overrides to justify outcomes)

## Determinism requirements
- Audit events are append-only.
- Ordering for serialization is deterministic.
- References are stable ids/paths (not embedded content).
