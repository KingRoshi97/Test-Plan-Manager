---
library: intake
id: INT-1-GOV
schema_version: 1.0.0
status: draft
---

# INT-1-GOV — Intake Unit Model

## Purpose

Every intake field is a **governed unit**. This document defines the structure and governance contract for each intake unit, ensuring traceability from raw user input through normalization, canonical mapping, and standards applicability.

## Intake Unit Definition

An intake unit is a single field collected during the intake wizard. Each unit carries:

| Property | Type | Description |
|---|---|---|
| `field_id` | string | Stable identifier matching `^F-[A-Z0-9_]+$` |
| `label` | string | Human-readable field label |
| `field_type` | enum | One of: `text`, `textarea`, `number`, `boolean`, `enum`, `multi_enum`, `date`, `file_ref`, `json` |
| `required` | boolean | Whether the field is mandatory |
| `canonical_mapping` | object | Maps this field to one or more canonical spec fields |
| `standards_applicability` | array | List of standard IDs where this field's value influences resolution |
| `ambiguity_class` | enum | Classification of ambiguity risk for this field |
| `normalization_rule` | string | Reference to the normalization rule applied |
| `enum_ref` | string | Reference to enum registry entry (if applicable) |

## Canonical Mapping Structure

```json
{
  "canonical_field": "canonical.section.field_name",
  "mapping_type": "direct | derived | conditional",
  "transform": "none | lowercase | slug | alias_resolve"
}
```

## Ambiguity Classes

| Class | Code | Description |
|---|---|---|
| Unambiguous | `AMB-0` | Field has a single deterministic interpretation |
| Low Ambiguity | `AMB-1` | Field has aliases that resolve deterministically via enum registry |
| Medium Ambiguity | `AMB-2` | Field value requires normalization or cross-field context |
| High Ambiguity | `AMB-3` | Field value cannot be resolved without operator intervention |

## Governance Rules

1. Every field in the form spec MUST have a corresponding intake unit entry in `intake_registry.v1.json`.
2. Every intake unit MUST declare its `ambiguity_class`.
3. Every intake unit with `ambiguity_class` >= `AMB-2` MUST have a documented resolution strategy.
4. Changes to `field_id` or `canonical_mapping` require a migration entry in INT-4.
5. Intake units are versioned with the form spec version.

## Schema Reference

Validated by: `axion://schemas/intake/intake_unit.v1`
