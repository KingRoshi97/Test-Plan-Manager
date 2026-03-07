---
library: intake
id: INT-3-GOV
schema_version: 1.0.0
status: draft
---

# INT-3-GOV — Intake Canonical Mapping

## Purpose

Defines the field-level dependency map from intake fields to canonical spec fields and their standards applicability. This mapping is the authoritative source for how raw intake data flows into the canonical model.

## Mapping Table

| Intake Field | Canonical Target | Mapping Type | Transform | Standards Applicability |
|---|---|---|---|---|
| `F-PROJECT_NAME` | `canonical.meta.project_name` | direct | none | — |
| `F-RUN_PROFILE` | `canonical.meta.run_profile` | direct | alias_resolve | All standards |
| `F-RISK_CLASS` | `canonical.meta.risk_class` | direct | alias_resolve | All standards |
| `F-EXECUTOR_TYPE` | `canonical.meta.executor_type` | direct | alias_resolve | Deployment standards |
| `F-INDUSTRY` | `canonical.meta.industry` | direct | slug | Industry-specific standards |
| `F-TECH_STACK` | `canonical.tech.stack` | direct | lowercase | Tech-specific standards |
| `F-DEPLOYMENT_TARGET` | `canonical.infra.deployment_target` | direct | slug | Infra standards |
| `F-COMPLIANCE_REQS` | `canonical.compliance.requirements` | direct | none | Compliance standards |
| `F-TEAM_SIZE` | `canonical.meta.team_size` | direct | none | Process standards |
| `F-DESCRIPTION` | `canonical.meta.description` | direct | none | — |

## Mapping Types

| Type | Description |
|---|---|
| `direct` | 1:1 mapping from intake field to canonical field |
| `derived` | Canonical field is computed from one or more intake fields |
| `conditional` | Mapping depends on the value of another field |

## Transform Functions

| Transform | Description |
|---|---|
| `none` | Value passes through unchanged |
| `lowercase` | Value is lowercased |
| `slug` | Value is converted to a URL-safe slug |
| `alias_resolve` | Value is resolved through enum registry aliases |

## Standards Applicability Rules

1. Fields with `standards_applicability` of "All standards" influence every standards resolution pass.
2. Fields with specific standard references only affect those standards.
3. Fields with no standards applicability (`—`) are metadata-only and do not influence standards selection.

## Dependency Graph

```
F-RUN_PROFILE ──→ canonical.meta.run_profile ──→ [all standards packs]
F-RISK_CLASS  ──→ canonical.meta.risk_class  ──→ [all standards packs]
F-INDUSTRY    ──→ canonical.meta.industry    ──→ [industry playbooks]
F-TECH_STACK  ──→ canonical.tech.stack       ──→ [tech standards]
F-EXECUTOR_TYPE → canonical.meta.executor    ──→ [deployment standards]
```

## Governance Rules

1. Every intake field MUST have a canonical mapping entry or be explicitly marked as unmapped.
2. Derived mappings MUST document their source fields and derivation logic.
3. Changes to mappings require a migration entry in INT-4.
4. Canonical targets MUST reference valid canonical spec paths.
