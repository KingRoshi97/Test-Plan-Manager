---
library: canonical
id: CAN-7a
schema_version: 1.0.0
status: draft
---

# CAN-7a — canonical/ Definition of Done

canonical/ is "done" when:

## Schemas + registries
- [ ] canonical_spec schema validates
- [ ] unknown_assumptions schema validates
- [ ] canonical_build_report schema validates
- [ ] relationship_constraints registry exists and validates
- [ ] id rules are pinned (if used)
## Runtime behavior (contract-level)
- [ ] S4 produces CANONICAL_SPEC and UNKNOWN_ASSUMPTIONS deterministically
- [ ] IDs are stable across reruns (no random IDs)
- [ ] Relationship integrity enforced (no dangling refs)
- [ ] Type compatibility enforced via relationship_constraints
- [ ] Dedupe conflicts become unknown/assumption items (no silent overwrite)

## Gates
- [ ] CAN-GATE-01..06 implemented and mapped to G2_CANONICAL_INTEGRITY
- [ ] Blocking unknown behavior follows risk class + policy decisions
- [ ] Failures include actionable pointers and remediation steps
