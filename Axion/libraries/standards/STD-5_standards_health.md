---
library: standards
doc_id: STD-5_standards_health
title: Standards Health
version: 1.0.0
status: draft
---

# STD-5 — Standards Health

## Purpose

Defines metrics, thresholds, and validation checklists for assessing the overall health of the standards library. Covers coverage analysis, staleness detection, conflict rate monitoring, orphaned standard identification, and a comprehensive validation checklist.

## Health Metrics

### Coverage

Coverage measures how completely the standards library addresses the system's governed contexts.

| Metric | Formula | Target |
|---|---|---|
| Profile coverage | (profiles with ≥1 active standard) / (total profiles) | ≥ 90% |
| Risk class coverage | (risk classes with ≥1 active standard) / (total risk classes) | 100% |
| Domain coverage | (domains with ≥1 active standard) / (total domains) | ≥ 75% |
| Gate coverage | (gates with ≥1 linked standard) / (total gates) | ≥ 80% |

### Staleness

Staleness identifies standards that have not been reviewed or updated within expected intervals.

| Metric | Formula | Threshold |
|---|---|---|
| Stale standard count | Units with `updated_at` > 180 days ago and status `active` | 0 (ideal) |
| Staleness ratio | (stale units) / (active units) | < 10% |
| Review cadence compliance | (units reviewed on schedule) / (units due for review) | ≥ 95% |

A standard is considered stale if:
- Its `updated_at` timestamp exceeds 180 days AND
- No decision report has referenced it in the last 90 days AND
- It has not been explicitly marked as `evergreen`.

### Conflict Rate

Conflict rate tracks how often the resolver encounters conflicts during resolution.

| Metric | Formula | Threshold |
|---|---|---|
| Conflict rate | (reports with conflicts) / (total reports) | < 5% |
| Unresolved conflict rate | (reports with unresolved conflicts) / (total reports) | 0% (target) |
| Override frequency | (overrides applied) / (total resolutions) | < 10% |

### Orphaned Standards

An orphaned standard is one that exists in the registry but has no practical effect.

| Orphan Type | Detection Rule |
|---|---|
| No gate link | Unit has no `gate` dependency edges. |
| No template link | Unit has no `template` dependency edges. |
| No proof link | Unit has no `proof` dependency edges. |
| Unreachable | Unit's applicability predicates match no known context. |
| Superseded without successor | Unit is `superseded` but `superseded_by` target does not exist. |
| Dangling chain | Unit is part of a supersession chain whose head is not `active`. |

## Validation Checklist

### Registry Integrity

- [ ] All `unit_id` values are unique.
- [ ] All `unit_id` values match the pattern `^STDU-[A-Z0-9_\-]+$`.
- [ ] All `version` values are valid SemVer.
- [ ] All `status` values are from the allowed enum.
- [ ] All `created_at` and `updated_at` are valid ISO-8601 timestamps.
- [ ] `updated_at` >= `created_at` for every unit.

### Dependency Integrity

- [ ] All `gate` edge targets exist in the gates registry.
- [ ] All `template` edge targets exist in the template registry.
- [ ] All `proof` edge targets exist in the proof type registry.
- [ ] All `requires` edge targets exist in the standards registry.
- [ ] No circular dependencies exist in `requires` edges.

### Supersession Integrity

- [ ] All supersession chains are acyclic.
- [ ] Every chain terminates at exactly one `active` unit.
- [ ] All `superseded` units have a valid `superseded_by` reference.
- [ ] All `superseded_by` targets exist and are not `retired`.

### Compatibility Integrity

- [ ] All compatibility `target_unit_id` references resolve.
- [ ] All `version_constraint` values are valid SemVer range syntax.
- [ ] No `incompatible` pair is simultaneously active in any resolved set.
- [ ] All `conditional` entries have non-empty `conditions`.

### Cross-Library Integrity

- [ ] All required cross-library dependencies are satisfiable.
- [ ] No cross-library dependency references a retired artifact.

### Health Thresholds

- [ ] Profile coverage ≥ 90%.
- [ ] Risk class coverage = 100%.
- [ ] Staleness ratio < 10%.
- [ ] Conflict rate < 5%.
- [ ] Unresolved conflict rate = 0%.
- [ ] Orphaned standard count = 0 (target).

## Reporting

Health reports SHOULD be generated:
- On every standards index update.
- On every standards registry modification.
- As part of periodic governance reviews (recommended: monthly).

Reports MUST include all metrics above with current values and pass/fail status against thresholds.
