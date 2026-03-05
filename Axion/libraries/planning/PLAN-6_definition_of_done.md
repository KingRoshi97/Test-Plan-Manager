---
library: planning
id: PLAN-6a
schema_version: 1.0.0
status: draft
---

# PLAN-6a — planning/ Definition of Done

planning/ is "done" when:

## Schemas + registries
- [ ] All planning schemas validate (JSON Schema check)
- [ ] coverage rules registry validates and is pinned

## Runtime behavior (contract-level)
- [ ] S6 produces WORK_BREAKDOWN, ACCEPTANCE_MAP, BUILD_PLAN deterministically
- [ ] Work items have stable IDs and valid dependency references
- [ ] Build plan respects dependencies and has no cycles
- [ ] Acceptance map includes evidence requirements per acceptance criterion
- [ ] Coverage can be evaluated deterministically from pinned artifacts

## Gates
- [ ] PLAN-GATE-01..06 implemented and mapped to G6_PLAN_COVERAGE
- [ ] Coverage gaps handled per risk class + policy decisions
- [ ] Plan artifacts pinned in run manifest
