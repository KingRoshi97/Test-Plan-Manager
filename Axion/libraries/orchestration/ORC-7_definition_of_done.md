---
library: orchestration
id: ORC-7a
schema_version: 1.0.0
status: draft
---

# ORC-7a — orchestration/ Definition of Done

orchestration/ is "done" when:

## Schemas + registries
- [ ] All orchestration schemas validate (JSON Schema check)
- [ ] pipeline_definition registry validates and matches expected stage order
- [ ] stage_io_registry validates and covers all consumes/produces used by pipeline_definition
- [ ] rerun_policies registry validates

## Runtime behavior (contract-level)
- [ ] A run produces a valid run_manifest with:
  - pipeline_ref pinned
  - pins.pin_set_ref present before stage execution
  - stage_timeline entries aligned with stage reports
  - artifact entries aligned with stage outputs
- [ ] Each executed stage produces exactly one stage_report
- [ ] Stage consumes are validated before execution (ORC-GATE-02)
- [ ] Stage produces are validated after success (ORC-GATE-03)

## Rerun/resume
- [ ] Resume does not change pins/pipeline_ref
- [ ] Stage rerun invalidates downstream artifacts deterministically and records events
- [ ] Partial runs require pinned substitute inputs and record manifest events

## Gates
- [ ] ORC-GATE-01..06 are runnable and produce evidence reports on failure
