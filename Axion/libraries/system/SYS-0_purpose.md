---
library: system
id: SYS-0
schema_version: 1.0.0
status: draft
---

# SYS-0 — system/ Purpose + Boundaries

## Purpose
`system/` is the **control-plane configuration and runtime contracts** for Axion. It defines the
stable "operating environment" that every run depends on:
- how workspaces/projects are represented
- how pins/locks are applied for deterministic resolution
- how adapters declare capabilities (local/Replit/CI)
- how quotas and rate limits are enforced
- how notifications are routed
- how policy engine hooks are invoked
- how system-level state and operator actions are represented

## What it governs (in scope)
- **Workspace / project model**: namespaces, org/project boundaries, permissions, keys
- **Pin + lock policies**: rules for selecting and freezing library versions, standards snapshots,
templates, knowledge selections
- **Adapter manager**: runtime environment capability discovery (what tools/commands are
allowed where)
- **Quota + rate limits**: per project/profile constraints on runs, tokens, storage, compute
- **Notification routing**: gate failures, approvals, policy violations, run status events
- **System-level state contracts**: stable identifiers and required metadata for system actions

## What it does NOT govern (out of scope)
- Pipeline stage order and stage IO contracts → `orchestration/`
- Gate DSL language and evaluation semantics → `gates/`
- Risk classes and override policies (the meaning of "prototype/prod/compliance") → `policy/`
- Intake forms and submission normalization → `intake/`
- Canonical spec structure and unknown handling → `canonical/`
- Standards packs content and standards resolution → `standards/`
- Templates library + rendering rules → `templates/`
- Knowledge library content, taxonomy, selection rules → `knowledge/`
- Proof ledger and verification completion criteria → `verification/`
- Kit packaging structure and export rules → `kit/`
- Telemetry event schemas and sinks → `telemetry/`
- Ops standards (SLO/alerts/logging budgets) → `ops/`
- Audit ledger rules (operator action tracking) → `audit/`

## Consumers (what reads system/)
- Control plane runtime (orchestrator + state machine)
- Gate evaluator (for policy hooks and notification emission)
- Adapter manager (capability discovery and enforcement)
- Run launcher (quota checks, pins, workspace permissions)

## Determinism and stability requirements
- IDs are stable and not reused.
- Pins/locks are explicit and recorded in the run manifest.
- Capability and quota policies are resolved deterministically from:
 workspace → project → profile → run context.

## Outputs (what system/ produces)
- System configuration snapshots used at runtime
- Enforcement decisions (allowed/blocked actions) referenced in run logs and gate reports
- Notification events for operators
