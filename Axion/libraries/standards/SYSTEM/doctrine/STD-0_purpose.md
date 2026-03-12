---
library: standards
id: STD-0
schema_version: 1.0.0
status: draft
---

# STD-0 — standards/ Purpose + Boundaries

## Purpose
`standards/` defines Axion's **standards pack system**:
- what a standards pack is (structure + metadata)
- how packs are indexed
- how applicability is determined
- how standards are resolved deterministically into a snapshot
- how snapshots are versioned and pinned for reproducibility

Standards are the "rules of build" that shape canonical build, template selection, planning, and
verification.

## What it governs (in scope)
- Standards pack model (pack_id, scope, rules, constraints)
- Standards index/registry (what packs exist, where they live)
- Applicability mapping (which packs apply to which contexts)
- Resolver order rules (deterministic precedence)
- Resolved standards snapshot format (the output of S3)
- Deprecation rules for packs/standards (optional, recommended)

## What it does NOT govern (out of scope)
- The pipeline stage order and stage IO contracts → `orchestration/`
- Gate DSL semantics → `gates/`
- Risk class definitions and overrides → `policy/`
- Intake wizard schema/enums → `intake/`
- Canonical spec schema and unknown handling → `canonical/`
- Templates themselves and render rules → `templates/`
- Knowledge items and selection rules → `knowledge/`
- Verification proof types and completion criteria → `verification/`
- System pins/locks/adapters/quotas → `system/`

## Consumers
- Standards resolution stage (S3)
- Canonical builder (S4)
- Template selection (S5)
- Planning (S6)
- Gate evaluation (S8) for standards compliance checks

## Determinism requirements
- A standards snapshot is a pure function of:
  - NORMALIZED_INPUT
  - pinned standards index + packs
  - deterministic resolver order rules
  - pinned risk class + profile context
- Snapshots are pinned and recorded in run manifest before downstream stages.
