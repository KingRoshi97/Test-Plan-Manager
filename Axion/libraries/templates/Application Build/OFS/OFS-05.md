# OFS-05 — Offline Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-05                                           |
| Template Type     | Build / Offline                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring offline observability     |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Offline Observability                     |

## 2. Purpose

Define the canonical telemetry requirements for offline features: sync metrics, queue depth, conflict counts, storage usage, and error tracking. This template must be consistent with client observability and logging/redaction rules and must not invent telemetry that violates privacy constraints.

## 3. Inputs Required

- OFS-01: `{{ofs.scope}}`
- OFS-02: `{{ofs.sync_model}}` | OPTIONAL
- SMD-06: `{{smd.observability}}` | OPTIONAL
- CER-05: `{{cer.logging}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Sync metrics (drain success/fail, duration) | OFS-02 | No |
| Queue depth metrics (pending ops count) | OFS-02 | No |
| Conflict metrics (count, resolution type) | OFS-02 | No |
| Storage usage metrics (bytes used) | OFS-03 | No |
| Error metrics (sync failures, queue overflow) | spec | No |
| Log field requirements (queue_id, op_type) | CER-05 | No |
| Redaction/privacy constraints | CER-05 | No |
| Dashboards minimum panels | spec | No |
| Alerts (queue depth spikes, sync failures) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Sampling policy for queue telemetry | spec | Volume control |
| Background sync telemetry | MBAT-01 | If background syncs |
| Open questions | agent | Enrichment only |

## 6. Rules

- No sensitive data in telemetry.
- Metrics MUST use stable identifiers and avoid high-cardinality labels.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Sync Metrics` — drain_success, drain_failure, drain_duration_ms
2. `## Queue Depth` — pending_ops_count, queue_overflow_count
3. `## Conflict Metrics` — conflict_count, resolution_type_breakdown
4. `## Storage Usage` — bytes_used_total, per_store_breakdown
5. `## Error Metrics` — sync_error_count, queue_overflow_alert
6. `## Logs — Required Fields` — timestamp, queue_id, op_type, result, error_type, redaction_applied
7. `## Privacy / Redaction` — no_pii_rule, field_allowlist
8. `## Dashboards` — offline_health_dashboard, minimum_panels
9. `## Alerts` — queue_depth_spike, sync_failure_rate, threshold_model, routing_policy

## 8. Cross-References

- **Upstream**: OFS-01, OFS-02, SPEC_INDEX
- **Downstream**: OPS-OBS
- **Standards**: STD-PII-REDACTION, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Sync + queue depth metrics | Required | Required | Required |
| Dashboards + alerts baseline | Optional | Required | Required |
| Sampling + bg sync telemetry | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, drain duration, per-store breakdown, error optional fields, field allowlist, routing policy, sampling/bg sync telemetry, open_questions
- If sync.drain_success is UNKNOWN → block Completeness Gate.
- If queue.pending_ops_count is UNKNOWN → block Completeness Gate.
- If privacy.no_pii_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] sync_metrics_defined == true
- [ ] queue_depth_metrics_defined == true
- [ ] privacy_constraints_defined == true
- [ ] dashboard_minimum_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
