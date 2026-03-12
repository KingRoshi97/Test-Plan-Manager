---
library: templates
id: TMP-6-GOV
section: template_health
schema_version: 1.0.0
status: draft
---

# TMP-6 — Template Health

## Overview
This document defines the health metrics, drift detection rules, staleness policies, and
validation checklists that ensure the template library remains accurate, current, and
governance-compliant over time.

## Health Metrics

| Metric | Description | Target | Alert Threshold |
|---|---|---|---|
| `registry_coverage` | Percentage of templates with complete registry entries | 100% | <95% |
| `provenance_coverage` | Percentage of placeholders with declared provenance | 100% | <90% |
| `active_ratio` | Ratio of `active` templates to total templates | >80% | <70% |
| `deprecated_with_consumers` | Count of deprecated templates still consumed by active pipelines | 0 | >5 |
| `avg_completeness_tier` | Average completeness tier across recent renders | `complete` | below `substantial` |
| `unfilled_rate` | Percentage of required placeholders left unfilled across renders | <5% | >10% |
| `staleness_count` | Number of templates exceeding their freshness window | 0 | >10 |
| `owner_coverage` | Percentage of templates with an assigned owner | 100% | <95% |

## Drift Detection

Drift occurs when a template's assumptions diverge from its governing sources:

| Drift Type | Detection Method | Remediation |
|---|---|---|
| Standards drift | Standards pack updated but template not re-validated | Re-validate template against new standards; update if needed |
| Schema drift | Source schema changed but placeholder source_paths not updated | Update placeholder declarations and re-validate provenance |
| Knowledge drift | Referenced knowledge units updated or superseded | Review template sections that consume the changed KIDs |
| Registry drift | Template file on disk diverges from registry metadata | Reconcile registry entry with actual template content |

## Staleness Policy

| Template Status | Freshness Window | Action on Expiry |
|---|---|---|
| `active` | 180 days since last review | Flag for review; owner notified |
| `deprecated` | 90 days since deprecation | Escalate to archival review |
| `draft` | 60 days since creation | Flag for promotion or deletion |

## Validation Checklist

Before a template can be promoted to `active` status, it must pass:

- [ ] Unique template_id registered in the registry
- [ ] All required fields present in registry entry (owner, version, status, category)
- [ ] All placeholders declared with provenance type and source_path
- [ ] No forbidden-zone placeholders without authoritative sources
- [ ] Applicability rules defined (project_types, risk_classes, domains)
- [ ] Required sections marked with completion requirements
- [ ] Required proofs specified per section
- [ ] Template renders successfully with test inputs
- [ ] Completeness tier meets minimum threshold for target risk class
- [ ] No unresolved drift alerts
- [ ] Owner assigned and acknowledged

## Definition of Done

A template is considered "done" (governance-complete) when:

1. It is registered in the governed registry with all required metadata
2. All placeholders have declared and validated provenance
3. Applicability rules are defined and tested
4. Section-level completion requirements are specified
5. Required proofs are defined and producible
6. Backward compatibility tier is assigned
7. Health metrics are within target thresholds
8. The validation checklist passes completely
9. At least one successful render with test inputs has been recorded

## Minimum Viable Template Set

For any Axion pipeline run, the minimum viable template set is:
- At least one template selected per required document output
- All selected templates at `active` status (or `deprecated` with explicit override)
- All selected templates at `complete` or `substantial` completeness tier
- Provenance reports generated for all rendered templates
- Completeness reports generated for all rendered templates

## Relationship to Other Sections

- **TMP-1 (Registry Rules)**: Health metrics are computed from registry data
- **TMP-3 (Placeholder Provenance)**: Provenance coverage is a key health metric
- **TMP-4 (Completeness & Proofs)**: Completeness rates feed into health scoring
- **TMP-5 (Backcompat & Migrations)**: Deprecated template counts affect health
