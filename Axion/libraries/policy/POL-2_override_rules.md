---
library: policy
id: POL-2a
section: override_rules
schema_version: 1.0.0
status: draft
---

# POL-2a — Override Rules

## Expiry required
- Every approved override must include expiry.expires_at.
- Default max expiry windows (policy defaults):
  - PROTOTYPE: up to 30 days
  - PROD: up to 7 days
  - COMPLIANCE: up to 24 hours (or disallow entirely, per policy set)

## Scope required
- Override scope.type must match hook_point.
- Gate overrides must specify gate_id (and optionally predicate_id).

## Recording required
On approval:
- record override_decision in run manifest runtime.policy_decisions (or a dedicated overrides
array)
- emit audit event (who/what/why/expiry)
- emit notification (approval granted)

## No silent reuse
Overrides apply only to the run_id unless explicitly defined as a project-level policy exception
(separate mechanism).
