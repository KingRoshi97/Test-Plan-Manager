---
library: policy
id: POL-2
section: override_policy_model
schema_version: 1.0.0
status: draft
---

# POL-2 — Override Policy Model

## Purpose
Overrides allow Axion to proceed when a hard rule would block progress, but only under
controlled conditions:
- explicit reason
- explicit approver identity/role
- explicit expiry
- recorded evidence
- reproducible record in run manifest + audit log

## Where overrides apply (minimum)
- Gate failures (GATE_OVERRIDE hook)
- Quota exceed decisions (QUOTA_CHECK hook)
- Pin/lock exceptions (PIN_RESOLUTION hook)
- Adapter exceptions (ADAPTER_SELECTION hook)
- Kit export exceptions (KIT_EXPORT hook)

## Non-negotiables
- Every override must expire.
- Every override must specify scope (what it applies to).
- Overrides must be replay-safe (recorded as immutable facts in the run).
