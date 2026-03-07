---
library: canonical
id: CAN-3-GOV
title: Provenance Class Model
schema_version: 1.0.0
status: draft
---

# CAN-3 — Provenance Class Model

## Purpose

This document defines the provenance taxonomy used to classify every canonical entity. It establishes the three provenance classes, rules for promotion and demotion between classes, and the evidence requirements for each class.

## Provenance Taxonomy

### hard_fact

- **Definition**: Data sourced directly from validated intake input or an authoritative standard with no transformation or inference.
- **Evidence requirement**: Direct reference to an intake field path or standard clause.
- **Examples**: User-provided project name, explicit technology choice declared in intake, regulatory requirement from a referenced standard.
- **Trust level**: Highest. Downstream consumers may rely on hard facts without qualification.

### inferred_fact

- **Definition**: Data derived through deterministic, documented rules from one or more hard facts. The inference chain is fully traceable.
- **Evidence requirement**: Reference to the inference rule applied AND the hard facts (or other inferred facts) used as inputs.
- **Examples**: Default database choice derived from declared stack, implied authentication method from selected framework, computed relationship between declared entities.
- **Trust level**: High, but qualified. Downstream consumers should note the inference source.

### unresolved_unknown

- **Definition**: Data that cannot be classified as either hard_fact or inferred_fact. The value is missing, ambiguous, or requires operator/stakeholder input.
- **Evidence requirement**: Documentation of why the value cannot be resolved, what inputs are missing, and what would be needed to resolve it.
- **Examples**: Unspecified deployment target, ambiguous performance requirement, missing integration credential type.
- **Trust level**: None. Downstream consumers MUST treat these as blocking or qualified gaps.

## Promotion Rules

Promotion moves an entity from a lower-trust class to a higher-trust class.

| From | To | Trigger | Requirements |
|---|---|---|---|
| `unresolved_unknown` | `inferred_fact` | Inference rule becomes applicable | Valid inference chain from existing facts; documented rule reference |
| `unresolved_unknown` | `hard_fact` | Operator provides authoritative input | Direct intake field or standard reference added |
| `inferred_fact` | `hard_fact` | Operator confirms inferred value | Explicit confirmation recorded; intake updated with direct reference |

## Demotion Rules

Demotion moves an entity from a higher-trust class to a lower-trust class.

| From | To | Trigger | Requirements |
|---|---|---|---|
| `hard_fact` | `inferred_fact` | Source intake field retracted or invalidated | Original source removed; value now depends on inference only |
| `hard_fact` | `unresolved_unknown` | Source fully invalidated with no fallback | No remaining evidence supports the value |
| `inferred_fact` | `unresolved_unknown` | Inference chain broken (input fact removed/changed) | Dependent facts no longer support the inference |

## Evidence Requirements Per Class

| Class | Minimum Evidence | Evidence Format |
|---|---|---|
| `hard_fact` | 1 direct source reference | `{ "type": "intake_field" \| "standard_clause", "ref": "<path>" }` |
| `inferred_fact` | 1 inference rule + 1 source fact | `{ "type": "inference_rule", "rule_id": "<id>", "inputs": ["<fact_refs>"] }` |
| `unresolved_unknown` | 1 gap description | `{ "type": "gap", "reason": "<why>", "needed": "<what_resolves_it>" }` |

## Governance Rules

1. Every provenance class change MUST be recorded in a Canonical Decision Report (CAN-2-GOV).
2. Promotion and demotion MUST follow the rules defined in this document; no ad-hoc class changes.
3. Evidence requirements are mandatory; an entity without sufficient evidence for its class MUST be demoted.
4. Batch class changes (e.g., during re-resolution) MUST produce individual decision report entries per entity.
