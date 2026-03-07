---
library: audit
id: AUD-5-GOV
title: Audit Health
schema_version: 1.0.0
status: draft
---

# AUD-5 — Audit Health

## Purpose

This doctrine defines metrics, verification procedures, and validation checklists for assessing audit system health including coverage, integrity, retention compliance, and gap detection.

## Audit Coverage

### Coverage Definition

Audit coverage measures the percentage of governance-significant actions that produce a corresponding audit event.

### Coverage Targets

| Scope | Target | Measurement |
|---|---|---|
| Run lifecycle events | 100% | Every run start/pause/resume/cancel has a matching audit event. |
| Gate override decisions | 100% | Every override request/approval/denial is recorded. |
| Export approvals | 100% | Every export request and decision is recorded. |
| Policy decisions | 100% | Every policy decision application is recorded. |
| Manual attestations | 100% | Every operator attestation is recorded. |
| Schema mutations | 100% | Every schema create/revise/supersede/deprecate/retire is recorded. |

### Coverage Measurement

1. Compare the count of governance actions in source libraries against audit ledger entries.
2. Coverage gaps are identified by correlating `run_id` and `gate_id` across source and audit records.
3. Coverage is reported as a percentage per action type per reporting period.

## Integrity Verification Success Rate

### Verification Process

1. Hash chain verification: Recompute the hash chain for the audit ledger and compare against stored hashes.
2. Schema conformance: Validate each audit event against its declared schema version.
3. Reference integrity: Verify that all `refs` in audit events point to existing artifacts.
4. Sequence integrity: Confirm monotonic ordering of events per `run_id`.

### Success Rate Targets

| Verification Type | Target | Failure Threshold |
|---|---|---|
| Hash chain | 100% | Any single hash mismatch triggers an integrity alert. |
| Schema conformance | 100% | Non-conforming events are quarantined. |
| Reference integrity | 99.9% | Missing references are flagged for resolution. |
| Sequence integrity | 100% | Out-of-order events trigger sequencing repair. |

## Retention Compliance

### Compliance Checks

1. No events deleted before minimum retention period for their risk class.
2. Events past maximum retention are archived or deleted per policy.
3. Redacted events retain structural integrity and hash chain linkage.
4. Retention class assignments match the originating run's risk class.

### Compliance Reporting

- Retention compliance is assessed on a weekly schedule.
- Non-compliant events are flagged with `retention_violation: true`.
- Compliance reports include: total events, events within policy, events in violation, violation details.

## Gap Detection

### Gap Types

| Gap Type | Detection Method | Remediation |
|---|---|---|
| Missing event | Cross-reference source actions against audit ledger. | Backfill from source if within recovery window. |
| Orphaned event | Audit event references a non-existent run or artifact. | Flag for manual review. |
| Sequence gap | Monotonic sequence number has a skip within a run. | Investigate and document. |
| Schema drift | Event conforms to an unknown or retired schema version. | Re-validate against current schema; flag for migration. |
| Producer gap | A producer library performed actions without emitting events. | Alert producer library maintainer. |

### Gap Detection Schedule

- Real-time: Sequence gaps and schema conformance checked at write time.
- Hourly: Cross-reference coverage checks for active runs.
- Daily: Full orphan detection and retention compliance scan.
- Weekly: Comprehensive gap report generated and reviewed.

## Validation Checklist

Before each audit health report is finalized, the following checklist must pass:

- [ ] Hash chain integrity verified for the reporting period.
- [ ] Schema conformance validated for all events in the reporting period.
- [ ] Coverage percentage computed per action type.
- [ ] No events below minimum retention have been deleted.
- [ ] Events past maximum retention have been processed (archived/deleted).
- [ ] All redacted events retain structural integrity.
- [ ] Sequence integrity confirmed for all active runs.
- [ ] Reference integrity verified (all refs resolve).
- [ ] Gap detection scan completed with findings documented.
- [ ] Producer coverage verified (all producer libraries emitting events).
- [ ] Consumer access patterns validated (no unauthorized ledger writes).
- [ ] Audit health metrics published to the operator dashboard.
