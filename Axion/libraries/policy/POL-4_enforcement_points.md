---
library: policy
id: POL-4
section: enforcement_points
schema_version: 1.0.0
status: draft
---

# POL-4 — Enforcement Points

## Purpose
Define where policy is enforced and what decisions must be produced.
(Invocation plumbing is in SYS-6; this defines *what must be decided*.)

## Enforcement points (minimum)
1) **Run start** (RUN_START)
  - allow/deny run initiation
  - enforce risk class defaults
  - enforce external executor permission (if chosen)

2) **Pin resolution** (PIN_RESOLUTION)
  - allow/deny run-level pin overrides
  - enforce lock_mode rules
  - enforce which targets must be pinned

3) **Adapter selection** (ADAPTER_SELECTION)
  - allow/deny adapter profile based on risk class and project constraints

4) **Quota check** (QUOTA_CHECK)
  - block / require approval / degrade when limits exceeded

5) **Gate override** (GATE_OVERRIDE)
  - allow/deny override requests
  - enforce expiry limits and required approver roles

6) **Kit export** (KIT_EXPORT)
  - allow/deny exporting kits externally
  - enforce no restricted content leakage (policy overlay, in addition to kit rules)

## Output requirement
Each enforcement point must result in a policy decision record:
- decision_id
- hook_point
- outcome
- expiry (even for allow; could be end-of-run)
- evidence refs (policy_set_id + evaluated rule ids)
