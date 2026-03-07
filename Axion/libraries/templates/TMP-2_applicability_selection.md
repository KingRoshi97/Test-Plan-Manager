---
library: templates
id: TMP-2-GOV
section: applicability_selection
schema_version: 1.0.0
status: draft
---

# TMP-2 — Applicability & Selection Rules

## Overview
This document defines how templates are selected for a given pipeline run based on project
type, risk class, domain, and other contextual factors. Selection must be deterministic:
identical inputs must always produce the identical template set in the same order.

## Applicability Model

Each template declares its applicability via structured rules:

| Field | Type | Description |
|---|---|---|
| `project_types` | string[] | Project types this template applies to (e.g., `web_app`, `api_service`) |
| `risk_classes` | string[] | Risk classes this template is relevant for (e.g., `high`, `medium`, `low`) |
| `domains` | string[] | Industry/domain tags (e.g., `healthcare`, `fintech`, `general`) |
| `required_standards` | string[] | Standards that must be present for this template to be selected |
| `excludes` | string[] | Template IDs that are mutually exclusive with this template |
| `priority` | integer | Selection priority when multiple templates match (lower = higher priority) |

## Selection Algorithm

1. **Filter by project type** — retain only templates whose `project_types` includes the run's project type, or templates with `project_types: ["*"]`
2. **Filter by risk class** — retain only templates whose `risk_classes` includes the run's risk class, or templates with `risk_classes: ["*"]`
3. **Filter by domain** — retain only templates whose `domains` intersects with the run's domain tags, or templates with `domains: ["*"]`
4. **Filter by required standards** — retain only templates whose `required_standards` are all present in the resolved standards pack
5. **Apply exclusion rules** — remove templates excluded by higher-priority selections
6. **Sort by priority** — stable sort by `priority` field (ascending)
7. **Record selection** — emit a TEMPLATE_SELECTION artifact with the ordered list

## Determinism Rules

- Selection is a pure function of: canonical spec + standards snapshot + template registry + selection rules
- No randomness, no external state, no timestamp-dependent logic
- The selection algorithm version is recorded in the TEMPLATE_SELECTION artifact
- Tie-breaking uses lexicographic order on template_id for stability

## Conflict Resolution

| Scenario | Resolution |
|---|---|
| Two templates cover the same document section | Higher priority (lower number) wins; loser is recorded as "suppressed" |
| Mutual exclusion conflict | Template with lower priority value is selected; other is excluded |
| No templates match | Selection report records an empty set with reason; pipeline may halt or warn depending on risk class |
| All templates filtered out by standards | Selection report records "no standards match" with the missing standards list |

## Override Policy

- Operators may pin specific template versions via run configuration
- Pinned templates bypass applicability filtering but must still satisfy status = `active` or `deprecated`
- All overrides are recorded in the TEMPLATE_SELECTION artifact with `override: true`

## Selection Report

Every selection produces a structured report containing:
- Run context (project type, risk class, domains, standards snapshot version)
- Candidate count (before filtering)
- Filter funnel (count after each filter stage)
- Final selection (ordered template list with versions)
- Suppressed templates (with reasons)
- Overrides applied

## Relationship to Other Sections

- **TMP-1 (Registry Rules)**: Selection reads from the governed registry
- **TMP-3 (Placeholder Provenance)**: Selected templates' placeholders must have valid provenance
- **TMP-4 (Completeness & Proofs)**: Selected templates must satisfy completeness rules
- **TMP-0 (Purpose)**: Determinism requirements originate from the purpose doc
