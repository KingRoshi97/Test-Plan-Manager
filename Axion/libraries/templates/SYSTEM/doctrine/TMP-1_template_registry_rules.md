---
library: templates
id: TMP-1-GOV
section: template_registry_rules
schema_version: 1.0.0
status: draft
---

# TMP-1 — Template Registry Rules

## Overview
This document defines the governance rules for how templates are registered, identified,
versioned, and owned within the Axion template library. Every template in the system must
have a stable, unique identity and follow explicit lifecycle rules from creation through
deprecation.

## Template ID Rules

| Rule | Description |
|---|---|
| Uniqueness | Every template_id must be globally unique within the registry |
| Stability | A template_id, once assigned, must never be reassigned to a different template |
| Format | IDs follow the pattern `TMP-{category}-{sequence}` (e.g., `TMP-SRS-001`) |
| Immutability | The ID is immutable; content changes require a version bump, not an ID change |

## Registration Requirements

A template must satisfy the following before it may be registered:

1. **Unique template_id** — validated against the registry for uniqueness
2. **Category assignment** — mapped to a valid template category from the taxonomy
3. **Version** — initial version set to `1.0.0` following semver
4. **Owner** — an assigned owner (team or individual) responsible for the template
5. **Status** — initial status must be `draft`
6. **Placeholder manifest** — all placeholders declared with types and provenance sources
7. **Required inputs** — list of canonical/standards/intake fields consumed
8. **Applicability rules** — conditions under which this template is selected

## Versioning Policy

- Templates follow semantic versioning: `major.minor.patch`
- **Major**: Breaking changes to placeholder structure, required inputs, or output schema
- **Minor**: New optional sections, additional placeholders, expanded applicability
- **Patch**: Typo fixes, wording improvements, no structural changes
- Version history must be maintained in the registry entry

## Status Lifecycle

```
draft → active → deprecated → archived
```

| Status | Meaning |
|---|---|
| `draft` | Under development, not available for selection |
| `active` | Available for selection in pipeline runs |
| `deprecated` | Superseded by a newer template; still selectable with warning |
| `archived` | No longer selectable; retained for audit trail |

## Owner Assignment

- Every template must have exactly one owner
- Owner is responsible for freshness, accuracy, and responding to drift alerts
- Ownership transfer must be recorded in the registry with timestamp
- Unowned templates are flagged as governance violations

## Registry Integrity Rules

- The registry is the single source of truth for template metadata
- All registry mutations must be versioned and auditable
- Duplicate template_ids are rejected at registration time
- Templates referenced by active pipeline runs cannot be archived without a replacement mapping

## Relationship to Other Sections

- **TMP-0 (Purpose)**: Defines the overall scope that registry rules enforce
- **TMP-2 (Applicability & Selection)**: Selection rules depend on registry metadata
- **TMP-5 (Backcompat & Migrations)**: Version changes follow backcompat tiers
- **TMP-6 (Template Health)**: Health metrics are computed from registry data
