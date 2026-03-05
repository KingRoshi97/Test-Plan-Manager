# FMS-10 — Observability & Cost Controls (storage growth, egress)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-10                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability & cost controls (storage growth, egress)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability & Cost Controls (storage growth, egress) Document                         |

## 2. Purpose

Define the canonical observability and cost controls for files/media: storage growth tracking,
egress/CDN costs, alerts for abnormal patterns, lifecycle enforcement verification, and operator
runbooks to control spend. This template must be consistent with retention/CDN rules and
integration observability baselines.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}}
- FMS-04 CDN/Delivery Rules: {{fms.cdn_delivery}} | OPTIONAL
- FMS-05 Retention/Lifecycle Rules: {{fms.retention}} | OPTIONAL
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- RLIM-01 Rate Limit Policy (egress throttles if any): {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Core metrics (total bytes, object count)
Growth metrics (daily/weekly delta)
Egress/CDN metrics (bytes out, hit rate)
Per-bucket breakdown policy (allowed dimensions)
Cost alert thresholds (growth spike, egress spike)
Lifecycle enforcement checks (TTL actually applied)
Abuse signals (hotlinking, download storms)
Operator actions (tighten TTL, disable public access, purge)
Runbook location and format
Telemetry requirements (cost anomalies surfaced)

Optional Fields
Budget caps by env/tenant | OPTIONAL
Auto-mitigation rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Cost controls must not weaken security (no opening access to reduce costs).
Alerts must be actionable and mapped to operator actions.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Core Metrics
total_bytes_metric: {{metrics.total_bytes_metric}}
object_count_metric: {{metrics.object_count_metric}}
2. Growth
daily_growth_metric: {{growth.daily_metric}}
weekly_growth_metric: {{growth.weekly_metric}} | OPTIONAL
3. Egress / CDN
egress_bytes_metric: {{egress.bytes_metric}}
cdn_hit_rate_metric: {{egress.hit_rate_metric}} | OPTIONAL
4. Breakdown Policy
allowed_dimensions: {{breakdown.allowed_dimensions}}
per_bucket_allowed: {{breakdown.per_bucket_allowed}}
5. Cost Alerts
growth_spike_alert: {{alerts.growth_spike_alert}}
egress_spike_alert: {{alerts.egress_spike_alert}} | OPTIONAL
routing: {{alerts.routing}} | OPTIONAL
6. Lifecycle Enforcement Checks
ttl_enforcement_check: {{lifecycle.ttl_enforcement_check}}
archive_check: {{lifecycle.archive_check}} | OPTIONAL
7. Abuse Signals
hotlinking_signal: {{abuse.hotlinking_signal}} | OPTIONAL
download_storm_signal: {{abuse.download_storm_signal}} | OPTIONAL
8. Operator Actions
actions: {{ops.actions}}
permissions_ref: {{ops.permissions_ref}} (expected: {{xref:API-04}}/{{xref:ADMIN-01}}) |
OPTIONAL
9. Runbooks
runbook_location: {{runbooks.location}}
format: {{runbooks.format}} (md/wiki/UNKNOWN) | OPTIONAL
10.References
Storage inventory: {{xref:FMS-01}}
CDN/delivery: {{xref:FMS-04}} | OPTIONAL

Retention/lifecycle: {{xref:FMS-05}} | OPTIONAL
Security/compliance: {{xref:FMS-06}} | OPTIONAL
Cross-References
Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define core metrics, one alert, and runbook location.
intermediate: Required. Define egress metrics and lifecycle checks and operator actions.
advanced: Required. Add budgets/auto-mitigation and abuse signals with strict dimension
policy.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, weekly growth, hit rate, routing, archive
check, abuse signals, permissions ref, runbook format, budgets/auto-mitigation, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If metrics.total_bytes_metric is UNKNOWN → block Completeness Gate.
If growth.daily_metric is UNKNOWN → block Completeness Gate.
If egress.bytes_metric is UNKNOWN → block Completeness Gate.
If lifecycle.ttl_enforcement_check is UNKNOWN → block Completeness Gate.
If runbooks.location is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true

## 5. Optional Fields

Budget caps by env/tenant | OPTIONAL
Auto-mitigation rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Cost controls must not weaken security (no opening access to reduce costs).**
- **Alerts must be actionable and mapped to operator actions.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Core Metrics`
2. `## Growth`
3. `## Egress / CDN`
4. `## Breakdown Policy`
5. `## Cost Alerts`
6. `## Lifecycle Enforcement Checks`
7. `## Abuse Signals`
8. `## Operator Actions`
9. `## OPTIONAL`
10. `## Runbooks`

## 8. Cross-References

- **Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
