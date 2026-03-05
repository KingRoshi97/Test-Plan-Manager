---
library: intake
id: INT-0
schema_version: 1.0.0
status: draft
---

# INT-0 — intake/ Purpose + Boundaries

## Purpose
`intake/` defines the **Intake Wizard contract**: the schemas, enums, validation rules, and
determinism rules that govern how Axion collects inputs and turns them into a stable submission
record.

This library is the single source of truth for:
- the intake form spec (pages/sections/fields)
- allowed values (enums, controlled vocabularies)
- validation rules (field-level + cross-field)
- submission record format (raw + normalized)
- determinism rules (normalization, stable ordering, id generation)

## What it governs (in scope)
- **Form spec**: page order, field definitions, dependencies/visibility rules
- **Field types**: text/enum/multi-select/file refs/etc.
- **Field enums**: canonical allowed values and aliases
- **Validation rules**:
  - required fields
  - cross-field constraints
  - conditional requirements
- **Submission artifacts**:
  - submission record (raw answers)
  - normalized input (canonical form for downstream stages)
- **Determinism rules**:
  - normalization rules (case, whitespace, canonical slugs)
  - stable sorting of lists
  - stable IDs for submissions and attachments
## What it does NOT govern (out of scope)
- Canonical spec structure/relationships and unknowns handling → `canonical/`
- Standards packs and standards resolution → `standards/`
- Templates registry/selection/render rules → `templates/`
- Knowledge selection rules → `knowledge/`
- Gate DSL semantics → `gates/`
- Pipeline stage order and run manifest → `orchestration/`
- Workspace/pins/adapters/quotas/policy hook plumbing → `system/`
- Risk class meaning and override rules → `policy/`

## Consumers
- Wizard UI (to render the form deterministically)
- Ingest/normalize stage (S1) for normalization
- Intake validation stage (S2) for enforcement + reporting
- Orchestrator (to block/pause on invalid intake)

## Determinism requirements
- Same user answers → same normalized output (stable ordering, stable slugs).
- Form spec version is pinned and recorded in run manifest.
- Enum resolution is deterministic (alias → canonical).
- Validation produces stable error codes and pointers.
