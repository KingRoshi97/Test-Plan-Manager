---
library: templates
id: TMP-0
schema_version: 1.0.0
status: draft
---

# TMP-0 — templates/ Purpose + Boundaries

## Purpose
`templates/` defines Axion's **document template library system**:
- what a template is (structure + placeholders + required fields)
- how templates are indexed and versioned
- how templates are selected deterministically from the canonical spec + standards snapshot
- how template rendering is validated for completeness

This library is the source of truth for the **533 TMP templates** and the contracts that govern
selection + fill.

## What it governs (in scope)
- Template model (template_id, category, version, placeholders, required inputs)
- Template registry/index (what templates exist, where they live, metadata)
- Template selection rules (deterministic mapping from run context → template set)
- Render envelope contract (rendered output + trace metadata + citations)
- Completeness rules (placeholder coverage, required sections present)
- Template deprecation and replacement mapping (recommended)

## What it does NOT govern (out of scope)
- Template content correctness for a given domain → comes from
canonical/standards/knowledge inputs, not the template system
- Knowledge selection rules → `knowledge/`
- Standards pack content/resolution → `standards/`
- Canonical spec structure → `canonical/`
- Pipeline order/run manifest → `orchestration/`
- Gate DSL semantics → `gates/`
- Risk class meaning/override rules → `policy/`
- Kit packaging rules → `kit/`

## Consumers
- Template selection stage (S5)
- Template fill stage (S7)
- Gate evaluation stage (S8) for completeness verification
- Operator UI (template selection justification, missing placeholders)

## Determinism requirements
- Given pinned inputs (canonical spec + standards snapshot + template registry + selection
rules),
  the selected template set and render results must be reproducible.
- Template IDs are stable; updates require version bumps.
- Selection order is stable and recorded in TEMPLATE_SELECTION artifact.
