# FMS-03 — Media Processing Integration (transcode/resize/scan vendors)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-03                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring media processing integration (transcode/resize/scan vendors)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Media Processing Integration (transcode/resize/scan vendors) Document                         |

## 2. Purpose

Define the canonical integration spec for media/file processing: which processing stages exist
(transcode/resize/scan/parse), which vendors or internal services perform them, job triggers,
inputs/outputs, retries, and security constraints. This template must be consistent with file
processing pipeline stages and async status models.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Provider Inventory: {{fms.storage_inventory}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.stages}}
- FPMP-04 Async Processing & Status Model: {{fpmp.async_status}} | OPTIONAL
- FPMP-06 File Security/Compliance: {{fpmp.security}} | OPTIONAL
- JBS-01 Jobs Inventory: {{jobs.inventory}} | OPTIONAL
- JBS-02 Job Specs: {{jobs.specs}} | OPTIONAL
- EVT-01 Event Catalog (processing events): {{evt.catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Processing stage registry (stage_id list)
Stage definitions (input → output)
Which stages use vendor vs internal service
Job trigger rules (upload complete, manual, cron)
Job IDs involved (JBS binding)
Storage IO paths (source bucket, output bucket)
Retry/DLQ binding (JBS-04)
Idempotency rules (per file hash/version)
Security constraints (scan before publish)
Telemetry requirements (latency, failure rate per stage)

Optional Fields
Parallelization rules | OPTIONAL
Resource limits (CPU/memory) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Files must not be publicly served until required security scanning passes.
Stage outputs must be deterministic and versioned (input hash → output variant).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Stage Registry
total_stages: {{stages.total}}
stage_ids: {{stages.ids}}
2. Stage Definitions (repeat per stage_id)
Stage
stage_id: {{items[0].stage_id}}
name: {{items[0].name}}
processor_type: {{items[0].processor_type}} (vendor/internal/UNKNOWN)
job_id_ref: {{items[0].job_id_ref}} (expected: {{xref:JBS-01}}) | OPTIONAL
trigger: {{items[0].trigger}}
inputs: {{items[0].inputs}}
outputs: {{items[0].outputs}}
source_path_rule: {{items[0].source_path_rule}} | OPTIONAL
output_path_rule: {{items[0].output_path_rule}} | OPTIONAL
retry_ref: {{items[0].retry_ref}} (expected: {{xref:JBS-04}}) | OPTIONAL
idempotency_rule: {{items[0].idempotency_rule}}
security_gate: {{items[0].security_gate}} | OPTIONAL
telemetry:
latency_metric: {{items[0].telemetry.latency_metric}}
failure_metric: {{items[0].telemetry.failure_metric}} | OPTIONAL
(Repeat per stage.)
3. Storage IO
source_bucket_id: {{io.source_bucket_id}}
output_bucket_id: {{io.output_bucket_id}} | OPTIONAL
4. Security
scan_before_publish_rule: {{security.scan_before_publish_rule}}
required_scans: {{security.required_scans}} | OPTIONAL
5. Telemetry (Global)
pipeline_success_metric: {{telemetry.pipeline_success_metric}}
pipeline_failure_metric: {{telemetry.pipeline_failure_metric}} | OPTIONAL

6. References
Storage inventory: {{xref:FMS-01}}
Pipeline stages: {{xref:FPMP-03}}
Async status model: {{xref:FPMP-04}} | OPTIONAL
File security: {{xref:FPMP-06}} | OPTIONAL
Jobs specs: {{xref:JBS-02}} | OPTIONAL
Cross-References
Upstream: {{xref:FPMP-03}}, {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-06}}, {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define stage registry and inputs/outputs and idempotency rule.
intermediate: Required. Bind job refs, retry refs, and scan-before-publish security gate.
advanced: Required. Add parallelization/resource limits and strict output versioning rules.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, job refs, path rules, retry refs, security
gate, optional telemetry metrics, output bucket id, required scans, global failure metric,
parallel/resource limits, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If stages.ids is UNKNOWN → block Completeness Gate.
If items[*].idempotency_rule is UNKNOWN → block Completeness Gate.
If security.scan_before_publish_rule is UNKNOWN → block Completeness Gate.
If telemetry.pipeline_success_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
stages_defined == true
idempotency_defined == true
security_gates_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

FMS-04

FMS-04 — CDN & Delivery Rules (cache headers, variants)
Header Block

## 5. Optional Fields

Parallelization rules | OPTIONAL
Resource limits (CPU/memory) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Files must not be publicly served until required security scanning passes.**
- **Stage outputs must be deterministic and versioned (input hash → output variant).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Stage Registry`
2. `## Stage Definitions (repeat per stage_id)`
3. `## Stage`
4. `## telemetry:`
5. `## (Repeat per stage.)`
6. `## Storage IO`
7. `## Security`
8. `## Telemetry (Global)`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:FPMP-03}}, {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FMS-06}}, {{xref:FMS-10}} | OPTIONAL**
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
