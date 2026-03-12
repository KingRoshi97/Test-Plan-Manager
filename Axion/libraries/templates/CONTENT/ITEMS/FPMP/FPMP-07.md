# FPMP-07 — Media Observability (latency, failure rates, QoS)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-07                                             |
| Template Type     | Build / File Processing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring media observability (latency, failure rates, qos)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Media Observability (latency, failure rates, QoS) Document                         |

## 2. Purpose

Define the canonical observability requirements for file/media upload, processing, storage, and
delivery, including required metrics, logs, traces, dashboards, alerts, and QoS/SLO hooks. This
template must be consistent with pipeline and delivery semantics and must not invent
instrumentation that contradicts upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.pipeline_stages}}
- FPMP-04 Async Status Model: {{fpmp.async_status}} | OPTIONAL
- FPMP-05 CDN/Delivery Rules: {{fpmp.delivery_rules}} | OPTIONAL
- FPMP-06 Security/Compliance: {{fpmp.security_compliance}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Core metric set (upload/process/delivery)
Latency definitions (upload latency, processing duration, delivery latency)
Success/failure rate definitions (by stage, by pipeline, by delivery surface)
Scan/quarantine metrics (if applicable)
Variant generation metrics (if applicable)
Cache metrics (if CDN)
Storage error metrics
Log field requirements (correlation + redaction)
Trace propagation requirements (request_id/trace_id/file_id)
Dashboard minimum panels
Alert requirements (failure spikes, latency regressions, stuck jobs, scan failures)
QoS/SLO hooks (targets by class if defined)

Optional Fields
Per-type metrics (image/video/pdf/etc.) | OPTIONAL
Sampling policy | OPTIONAL
Cost controls/cardinality limits | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Metrics MUST be keyed by stable identifiers (pipeline_id, stage_id, variant_type) and avoid
unbounded labels.
PII MUST be redacted in logs/traces per: {{standards.rules[STD-PII-REDACTION]}} |
OPTIONAL
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Alerts MUST be actionable and map to operational procedures where available.
Output Format
1. Observability Scope
surfaces: {{obs.surfaces}} (upload/process/storage/delivery/UNKNOWN)
coverage_model: {{obs.coverage_model}} (per pipeline/stage/type/UNKNOWN)
notes: {{obs.notes}} | OPTIONAL
2. Metrics — Upload
upload_attempts: {{metrics.upload.attempts}}
upload_success: {{metrics.upload.success}}
upload_failures: {{metrics.upload.failures}}
upload_latency_ms: {{metrics.upload.latency_ms}} | OPTIONAL
bytes_uploaded: {{metrics.upload.bytes}} | OPTIONAL
3. Metrics — Processing
jobs_started: {{metrics.processing.jobs_started}}
jobs_succeeded: {{metrics.processing.jobs_succeeded}}
jobs_failed: {{metrics.processing.jobs_failed}}
stage_duration_ms: {{metrics.processing.stage_duration_ms}} | OPTIONAL
pipeline_duration_ms: {{metrics.processing.pipeline_duration_ms}} | OPTIONAL
stuck_jobs: {{metrics.processing.stuck_jobs}} | OPTIONAL
4. Metrics — Security/Scanning (if applicable)
scan_pass: {{metrics.scan.pass}} | OPTIONAL
scan_fail: {{metrics.scan.fail}} | OPTIONAL
quarantine_count: {{metrics.scan.quarantine_count}} | OPTIONAL
5. Metrics — Variants/CDN/Delivery
variant_generated: {{metrics.delivery.variant_generated}} | OPTIONAL
delivery_latency_ms: {{metrics.delivery.latency_ms}}
cache_hit_rate: {{metrics.delivery.cache_hit_rate}} | OPTIONAL
status_4xx: {{metrics.delivery.status_4xx}} | OPTIONAL

status_5xx: {{metrics.delivery.status_5xx}} | OPTIONAL
bytes_served: {{metrics.delivery.bytes_served}} | OPTIONAL
6. Metrics — Storage
storage_put_failures: {{metrics.storage.put_failures}} | OPTIONAL
storage_get_failures: {{metrics.storage.get_failures}} | OPTIONAL
storage_latency_ms: {{metrics.storage.latency_ms}} | OPTIONAL
7. Logs — Required Fields
timestamp: {{logs.fields.timestamp}}
file_id: {{logs.fields.file_id}} | OPTIONAL
pipeline_id: {{logs.fields.pipeline_id}} | OPTIONAL
stage_id: {{logs.fields.stage_id}} | OPTIONAL
variant_type: {{logs.fields.variant_type}} | OPTIONAL
request_id: {{logs.fields.request_id}} | OPTIONAL
trace_id: {{logs.fields.trace_id}} | OPTIONAL
result: {{logs.fields.result}} (success/failure)
error_code: {{logs.fields.error_code}} | OPTIONAL
redaction_applied: {{logs.fields.redaction_applied}} | OPTIONAL
8. Tracing — Propagation & Attributes
tracing_required: {{tracing.required}}
propagation_headers: {{tracing.propagation_headers}} | OPTIONAL
span_attributes_required:
file_id: {{tracing.attrs.file_id}} | OPTIONAL
pipeline_id: {{tracing.attrs.pipeline_id}} | OPTIONAL
stage_id: {{tracing.attrs.stage_id}} | OPTIONAL
variant_type: {{tracing.attrs.variant_type}} | OPTIONAL
sampling_policy: {{tracing.sampling_policy}} | OPTIONAL
9. Dashboards (Minimum)
overview_dashboard: {{dashboards.overview}}
processing_dashboard: {{dashboards.processing}} | OPTIONAL
delivery_dashboard: {{dashboards.delivery}} | OPTIONAL
security_dashboard: {{dashboards.security}} | OPTIONAL
minimum_panels: {{dashboards.minimum_panels}}
10.Alerts
upload_failure_spike: {{alerts.upload_failure_spike}}
processing_failure_spike: {{alerts.processing_failure_spike}}
delivery_latency_regression: {{alerts.delivery_latency_regression}}
stuck_jobs_alert: {{alerts.stuck_jobs_alert}} | OPTIONAL
scan_fail_spike: {{alerts.scan_fail_spike}} | OPTIONAL
threshold_model: {{alerts.threshold_model}} (static/baseline/UNKNOWN)
routing_policy: {{alerts.routing_policy}} | OPTIONAL
runbook_ref: {{alerts.runbook_ref}} | OPTIONAL
11.QoS/SLO Hooks (Optional)
slo_doc_ref: {{obs.slo_doc_ref}} | OPTIONAL
slo_targets: {{obs.slo_targets}} | OPTIONAL

12.Cardinality & Cost Controls (Optional)
label_allowlist: {{cost.label_allowlist}} | OPTIONAL
disallowed_labels: {{cost.disallowed_labels}} | OPTIONAL
sampling_controls: {{cost.sampling_controls}} | OPTIONAL
13.References
Upload contract: {{xref:FPMP-01}}
Pipeline stages: {{xref:FPMP-03}}
Async status model: {{xref:FPMP-04}} | OPTIONAL
CDN/delivery rules: {{xref:FPMP-05}} | OPTIONAL
Security/compliance: {{xref:FPMP-06}} | OPTIONAL
Cross-References
Upstream: {{xref:FPMP-01}}, {{xref:FPMP-03}}, {{xref:FPMP-04}} | OPTIONAL,
{{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define core metric/log fields and minimum dashboards; use UNKNOWN for
tooling specifics.
intermediate: Required. Add stage/pipeline metrics and alert triggers.
advanced: Required. Add cardinality controls, sampling, and QoS/SLO bindings.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, upload latency, stage/pipeline duration,
stuck jobs, scan metrics, cache metrics, storage metrics,
file_id/pipeline_id/stage_id/variant_type, tracing propagation/sampling, dashboards.*, alerts
routing/runbook, slo hooks, cost controls, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If logs required fields are UNKNOWN → block Completeness Gate.
If alerts.threshold_model is UNKNOWN → flag in Open Questions.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FPMP
Pass conditions:
required_fields_present == true
metric_set_defined == true
log_fields_defined == true
dashboard_minimum_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Admin & Internal Tools APIs (ADMIN)

Admin & Internal Tools APIs (ADMIN)
ADMIN-01 Admin Capabilities Matrix
ADMIN-02 Moderation/Support Tools Spec (queues, actions)
ADMIN-03 Audit Trail Spec (actions + retention)
ADMIN-04 Data Repair Procedures (safe backfills)
ADMIN-05 Privileged API Surface Catalog (endpoints + authz)
ADMIN-06 Admin Observability & Safeguards (rate limits, alerts)

ADMIN-01

ADMIN-01 — Admin Capabilities Matrix
Header Block

## 5. Optional Fields

Per-type metrics (image/video/pdf/etc.) | OPTIONAL
Sampling policy | OPTIONAL
Cost controls/cardinality limits | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Metrics MUST be keyed by stable identifiers (pipeline_id, stage_id, variant_type) and avoid**
- **unbounded labels.**
- **PII MUST be redacted in logs/traces per: {{standards.rules[STD-PII-REDACTION]}} |**
- **OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Alerts MUST be actionable and map to operational procedures where available.**

## 7. Output Format

### Required Headings (in order)

1. `## Observability Scope`
2. `## Metrics — Upload`
3. `## Metrics — Processing`
4. `## Metrics — Security/Scanning (if applicable)`
5. `## Metrics — Variants/CDN/Delivery`
6. `## Metrics — Storage`
7. `## Logs — Required Fields`
8. `## Tracing — Propagation & Attributes`
9. `## span_attributes_required:`
10. `## Dashboards (Minimum)`

## 8. Cross-References

- **Upstream: {{xref:FPMP-01}}, {{xref:FPMP-03}}, {{xref:FPMP-04}} | OPTIONAL,**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

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
