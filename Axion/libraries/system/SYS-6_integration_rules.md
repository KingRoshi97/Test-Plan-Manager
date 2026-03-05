---
library: system
id: SYS-6a
schema_version: 1.0.0
status: draft
---

# SYS-6a — Policy Hook Integration Rules

## Rule: consult + record
- For each hook point, runtime must:
  1) build a policy_hook_request
  2) evaluate policy (engine)
  3) obtain policy_hook_decision
  4) record decision in run manifest

## Rule: stable during run
- Once a decision is recorded for a hook point, it must not change mid-run.
- If expiry is reached mid-run:
  - default behavior is "deny further actions requiring this decision"
  - record a policy_expired event

## Rule: outcomes
- allow: proceed
- deny: hard stop
- require_approval: pause run and emit APPROVAL_REQUIRED notification
- degrade: apply constraints and continue (must record what changed)

## Gate overrides
- Gate overrides must use GATE_OVERRIDE hook point and must record:
  - gate_id
  - override reason
  - approver identity (when approved)
  - expiry
