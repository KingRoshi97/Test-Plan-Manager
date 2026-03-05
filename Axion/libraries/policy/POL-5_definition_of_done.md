---
library: policy
id: POL-5a
section: definition_of_done
schema_version: 1.0.0
status: draft
---

# POL-5a — policy/ Definition of Done

policy/ is "done" when:

## Schemas + registries
- [ ] All policy schemas validate (JSON Schema check)
- [ ] risk_classes registry validates and covers PROTOTYPE/PROD/COMPLIANCE
- [ ] policy_sets registry validates and includes at least one baseline set

## Runtime behavior (contract-level)
- [ ] Policy engine can resolve effective policy via precedence rules (POL-3)
- [ ] Each enforcement hook point produces a decision record (POL-4)
- [ ] Override requests require reason + approver + expiry
- [ ] Override duration limits enforced per risk class

## Determinism
- [ ] Decisions are a pure function of pinned policy_set + explicit request context
- [ ] Non-comparable conflicts resolve via deny_by_default (or require_approval when configured)
- [ ] All decisions are recorded in run manifest before actions are taken
