---
doc_id: MNT-8
title: "Library Health Contract"
library: maintenance
version: "0.1.0"
status: active
---

# MNT-8: Library Health Contract

## Purpose

Defines the health contract that every Axion library must satisfy. A library health report captures structural completeness, doctrine compliance, schema validity, registry integrity, and documentation coverage for each library unit.

## Health Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| structural_completeness | 0.20 | Required directories, index files, and schemas present |
| doctrine_compliance | 0.20 | All doctrine docs have valid frontmatter and required fields |
| schema_validity | 0.20 | All JSON schemas parse, resolve $refs, and pass meta-validation |
| registry_integrity | 0.20 | Registry entries reference existing assets; no orphans or dangling refs |
| documentation_coverage | 0.20 | Purpose doc exists; all public contracts documented |

## Scoring Model

- Each dimension yields a score from 0.0 to 1.0.
- The composite health score is the weighted sum across all dimensions.
- A library is **healthy** when its composite score meets or exceeds its declared `target_score`.
- A library is **degraded** when its composite score falls below `target_score` but remains above 0.5.
- A library is **critical** when its composite score falls below 0.5.

## Health Report Contract

Every health assessment produces a report conforming to `library_health_report.schema.json`. Reports are stored in the library health registry (`library_health_registry.v1.json`).

## Assessment Triggers

| Trigger | Mode |
|---------|------|
| Manual health check | MM-01 |
| Post-upgrade validation | MM-05, MM-08 |
| CI sanity run | MM-19 |
| Scheduled nightly | MM-01 (when enabled) |

## Remediation

When a library falls below its target score, a remediation finding is raised per MNT-12. The finding must identify the failing dimensions and propose corrective actions.
