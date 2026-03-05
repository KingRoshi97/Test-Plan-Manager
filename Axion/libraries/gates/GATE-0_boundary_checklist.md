---
library: gates
id: GATE-0
section: boundary_checklist
schema_version: 1.0.0
status: draft
---

# GATE-0 — Boundary Checklist

Use this checklist to verify that a change belongs in `gates/` and not in another library.

## Belongs in gates/ if:
- [ ] It defines a new gate or modifies an existing gate definition
- [ ] It adds or modifies a DSL predicate function
- [ ] It changes how predicates are composed (and/or/not logic)
- [ ] It changes evaluation semantics (short-circuit, trace, error handling)
- [ ] It modifies evidence collection or referencing rules
- [ ] It changes the gate report format or fields
- [ ] It changes determinism or replay rules for gate evaluation
- [ ] It adds or removes a gate from the minimum viable set

## Does NOT belong in gates/ if:
- [ ] It changes pipeline stage order or stage IO → `orchestration/`
- [ ] It defines risk classes or override policies → `policy/`
- [ ] It modifies workspace/project/pin configuration → `system/`
- [ ] It changes intake form structure → `intake/`
- [ ] It modifies canonical spec handling → `canonical/`
- [ ] It changes standards packs or resolution → `standards/`
- [ ] It changes template selection or rendering → `templates/`
- [ ] It modifies knowledge selection rules → `knowledge/`
- [ ] It changes verification proof ledger → `verification/`
- [ ] It changes kit packaging → `kit/`

## Cross-library touchpoints
| Touchpoint | gates/ owns | Other library owns |
|---|---|---|
| Gate predicates reference artifacts | Predicate evaluation logic | Artifact schema (orchestration/) |
| Gate results feed audit | Report format and emission | Audit ledger schema (audit/) |
| Override hooks invoke policy | Override hook interface | Override policy rules (policy/) |
| Evidence references | Evidence ref format | Evidence content (stage executors) |
| Gate placement in pipeline | Gate definition (gate_id, stage_id) | Stage ordering (orchestration/) |
