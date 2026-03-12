---
library: templates
id: TMP-3-GOV
section: placeholder_provenance
schema_version: 1.0.0
status: draft
---

# TMP-3 — Placeholder Provenance

## Overview
Every placeholder in a template must have a declared provenance — the source from which its
value is derived during rendering. This document defines the provenance taxonomy, validation
rules, and forbidden guessing zones that ensure template fills are traceable and auditable.

## Provenance Types

| Provenance Type | Source | Description |
|---|---|---|
| `canonical` | Canonical spec | Value comes directly from the canonical project specification |
| `standards` | Standards pack | Value comes from a resolved standards rule or requirement |
| `intake` | Intake form | Value comes from operator-provided intake data |
| `knowledge` | Knowledge library | Value comes from a selected knowledge unit (KID) |
| `derived` | Computation | Value is computed from other placeholder values via a declared derivation rule |
| `static` | Template itself | Value is a constant defined within the template (e.g., boilerplate text) |
| `operator` | Operator input | Value requires explicit operator input at render time |

## Placeholder Declaration

Each placeholder in a template must declare:

| Field | Type | Required | Description |
|---|---|---|---|
| `placeholder_id` | string | yes | Unique identifier within the template (e.g., `{{project_name}}`) |
| `provenance_type` | enum | yes | One of the provenance types above |
| `source_path` | string | yes | Dot-path to the source field (e.g., `canonical.project.name`) |
| `required` | boolean | yes | Whether the placeholder must be filled for completeness |
| `default_value` | any | no | Default value if source is unavailable (only for non-required placeholders) |
| `validation_rule` | string | no | Regex or type constraint for the filled value |

## Forbidden Guessing Zones

The following categories of placeholders must NEVER be filled by inference, interpolation,
or AI generation. They must come from an authoritative source or be explicitly marked as
unfilled:

1. **Legal and compliance text** — regulatory citations, compliance statements, legal disclaimers
2. **Security requirements** — authentication methods, encryption standards, access control rules
3. **Financial figures** — cost estimates, budget numbers, pricing
4. **Identity fields** — organization names, contact information, license identifiers
5. **Dates and deadlines** — contractual dates, compliance deadlines, SLA windows
6. **Version numbers** — software versions, API versions, schema versions

Violation: If a forbidden-zone placeholder cannot be resolved from its declared source, it
must be left as `UNFILLED` with a trace record explaining why.

## Provenance Chain

For `derived` placeholders, the derivation rule must declare:
- Input placeholders (by placeholder_id)
- Derivation function (named, deterministic, auditable)
- Output type

The full provenance chain must be traceable from any filled value back to its ultimate
authoritative source.

## Validation Rules

- Every placeholder must have a declared provenance_type before the template enters `active` status
- Placeholder source_paths must resolve to valid fields in their respective source schemas
- `derived` placeholders must have a valid derivation rule referencing existing placeholders
- Templates with undeclared placeholders are rejected at registration time
- Provenance declarations are validated against the source schemas at template registration

## Provenance Report

Template rendering produces a provenance report containing:
- Template ID and version
- For each placeholder: placeholder_id, provenance_type, source_path, resolved_value (or UNFILLED), confidence
- Forbidden-zone violations (if any)
- Derivation chain traces (for derived placeholders)

## Relationship to Other Sections

- **TMP-1 (Registry Rules)**: Placeholder manifests are part of the registration requirements
- **TMP-2 (Applicability & Selection)**: Selected templates' placeholders must have valid provenance
- **TMP-4 (Completeness & Proofs)**: Completeness is evaluated against placeholder fill rates
- **TMP-6 (Template Health)**: Unfilled rates and provenance violations feed into health metrics
