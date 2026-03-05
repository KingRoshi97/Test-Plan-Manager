---
library: planning
id: PLAN-0
schema_version: 1.0.0
status: draft
---

# PLAN-0 — planning/ Purpose + Boundaries

## Purpose
`planning/` defines Axion's **work planning mechanics**:
- how work is broken down into tasks (WBS)
- how requirements map to acceptance criteria (acceptance map)
- how a build plan sequences work deterministically (build plan)
- what "coverage" means for a plan (completeness rules)

Planning is the bridge between the canonical spec/templates and execution/verification.

## What it governs (in scope)
- Work Breakdown Structure (WBS) format
- Acceptance map format (requirements → artifacts/tests)
- Build plan format (sequence, dependencies, milestones)
- Sequencing policies (deterministic task ordering)
- Coverage rules (what must be covered for a run to be "complete")

## What it does NOT govern (out of scope)
- Stage ordering and run manifest → `orchestration/`
- Gate DSL evaluation → `gates/`
- Risk classes/overrides → `policy/`
- Intake form schemas → `intake/`
- Canonical spec schema → `canonical/`
- Standards resolution → `standards/`
- Template registry/selection/render rules → `templates/`
- Proof ledger and verification commands → `verification/`

## Consumers
- Plan generation stage (S6)
- Template fill stage (S7) (uses plan to know what to generate)
- Gate evaluation (S8) (uses plan coverage rules)
- Operator UI (shows task list, sequencing, coverage gaps)

## Determinism requirements
- Plans are a pure function of:
  - CANONICAL_SPEC
  - TEMPLATE_SELECTION
  - STANDARDS_SNAPSHOT
  - planning policies (this library, pinned)
- Sequencing is deterministic and recorded.
