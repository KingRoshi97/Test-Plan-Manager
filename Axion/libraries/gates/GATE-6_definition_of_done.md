---
library: gates
id: GATE-6
section: definition_of_done
schema_version: 1.0.0
status: draft
---

# GATE-6 — Definition of Done

## Overview
A gate library implementation is "done" when all of the following criteria are met.
This checklist is used to verify completeness of the gates/ library itself.

## Documentation Complete
- [ ] GATE-0: Purpose and boundary checklist documented
- [ ] GATE-1: Gate definition model, determinism rules, and validation checklist documented
- [ ] GATE-2: DSL grammar, expression validation, determinism rules, and validation checklist documented
- [ ] GATE-3: Evaluation runtime, evidence collection, determinism rules, and validation checklist documented
- [ ] GATE-4: Gate report model, determinism rules, and validation checklist documented
- [ ] GATE-5: Determinism/replay rules, evidence requirements, and validation checklist documented
- [ ] GATE-6: Minimum viable set, definition of done, and minimal tree documented

## Schemas Complete
- [ ] `gate_definition.v1.schema.json` — gate definition schema
- [ ] `gate_registry.v1.schema.json` — gate registry schema
- [ ] `gate_eval_request.v1.schema.json` — evaluation request schema
- [ ] `gate_eval_trace.v1.schema.json` — evaluation trace schema
- [ ] `gate_report.v1.schema.json` — gate report schema
- [ ] `gate_replay_request.v1.schema.json` — replay request schema

## Registries Complete
- [ ] DSL function registry with all 6 functions
- [ ] Gate registry with all 8 pipeline gates

## Templates Complete
- [ ] Example gate report template

## Runtime Integration
- [ ] Loader module loads all gates library assets
- [ ] API endpoints serve gates library data
- [ ] UI page displays gates library content
- [ ] Assets registered in schema_registry and library_index

## Determinism Verified
- [ ] All determinism rules documented per section
- [ ] Replay contract defined and documented
- [ ] Evidence requirements for replay specified
