---
library: templates
id: TMP-4-GOV
section: completeness_and_proofs
schema_version: 1.0.0
status: draft
---

# TMP-4 — Completeness & Proofs

## Overview
This document defines the section-level completion rules, required proofs, and evidence
requirements for template rendering. A rendered template is only considered complete when
all mandatory sections are present, all required placeholders are filled, and the required
proof artifacts are produced.

## Section-Level Completion Rules

Each template defines sections with completion requirements:

| Field | Type | Description |
|---|---|---|
| `section_id` | string | Unique section identifier within the template |
| `section_name` | string | Human-readable section name |
| `required` | boolean | Whether this section must be present in the rendered output |
| `min_placeholders_filled` | number | Minimum percentage of placeholders that must be filled (0-100) |
| `required_placeholders` | string[] | Specific placeholders that must be filled for this section |
| `proof_required` | boolean | Whether this section requires an associated proof artifact |

## Completeness Tiers

| Tier | Placeholder Fill Rate | Section Coverage | Description |
|---|---|---|---|
| `complete` | 100% required filled | All required sections present | Fully rendered, ready for gate evaluation |
| `substantial` | ≥90% required filled | All required sections present | Minor gaps acceptable for low-risk runs |
| `partial` | ≥70% required filled | ≥80% required sections present | Requires operator review and justification |
| `incomplete` | <70% required filled | <80% required sections present | Cannot proceed; requires remediation |

## Risk-Class Thresholds

| Risk Class | Minimum Tier | Action on Below-Threshold |
|---|---|---|
| `critical` | `complete` | Pipeline halt; no override allowed |
| `high` | `complete` | Pipeline halt; operator override with justification |
| `medium` | `substantial` | Warning; operator may proceed with acknowledgment |
| `low` | `partial` | Warning logged; pipeline continues |

## Required Proofs

Templates may require proof artifacts to validate their rendered content:

| Proof Type | Description | When Required |
|---|---|---|
| `standards_trace` | Mapping from template sections to governing standards | All risk classes |
| `placeholder_provenance` | Provenance report for all filled placeholders | All risk classes |
| `completeness_report` | Section-by-section fill status | All risk classes |
| `operator_review` | Operator sign-off on rendered content | `critical` and `high` risk classes |
| `domain_validation` | Domain expert validation of domain-specific sections | When domain-specific templates are used |

## Evidence Requirements

Each proof artifact must contain:

1. **Artifact ID** — unique identifier linked to the run
2. **Template reference** — template_id and version that was rendered
3. **Timestamp** — ISO 8601 timestamp of proof generation
4. **Verdict** — `pass`, `fail`, or `conditional`
5. **Details** — structured data supporting the verdict
6. **Signers** — list of entities (automated or human) that produced or approved the proof

## Completeness Evaluation Process

1. **Section scan** — verify all required sections are present in rendered output
2. **Placeholder audit** — count filled vs. unfilled required placeholders per section
3. **Tier assignment** — assign completeness tier based on fill rates
4. **Risk check** — compare tier against risk-class threshold
5. **Proof collection** — gather required proof artifacts
6. **Verdict** — emit completeness verdict with supporting evidence

## Relationship to Other Sections

- **TMP-2 (Applicability & Selection)**: Selected templates define the completeness scope
- **TMP-3 (Placeholder Provenance)**: Provenance report is a required proof artifact
- **TMP-5 (Backcompat & Migrations)**: Section changes in new versions must maintain completeness
- **TMP-6 (Template Health)**: Completeness rates feed into health metrics
