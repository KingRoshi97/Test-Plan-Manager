# FPMP-03 — Processing Pipeline Stages (transcode/resize/parse)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-03                                             |
| Template Type     | Build / File Processing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring processing pipeline stages (transcode/resize/parse)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Processing Pipeline Stages (transcode/resize/parse) Document                         |

## 2. Purpose

Define the canonical specification format for file/media processing pipelines, including stage
inventory, stage inputs/outputs, transforms (transcode/resize/parse), error handling, and how
stages map to background jobs. This template must be consistent with upload/storage strategy
and must not invent pipeline stages or job_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}}
- API-06 Background Jobs Spec: {{api.background_jobs}} | OPTIONAL
- JBS-01 Jobs Inventory: {{jbs.jobs_inventory}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Pipeline inventory (pipeline_id list)
Stage inventory (stage_id list per pipeline)
Stage ordering rules (deterministic order)
Stage inputs (object refs + metadata)
Stage outputs (derived artifacts + refs)
Stage type (scan/parse/transcode/resize/thumbnail/extract/UNKNOWN)
Stage execution model (sync/async/job-backed)
Job binding rules (stage → job_id when async)
Failure handling per stage (retry vs fail vs quarantine)
Resource limits (cpu/mem/timeouts)
Observability requirements (per stage metrics/logs)
Security/compliance constraints (PII redaction, sandboxing)

Optional Fields
Conditional stages (type-based routing) | OPTIONAL
Parallel stages policy | OPTIONAL
Caching/dedupe of processing | OPTIONAL
Manual reprocess controls | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new job_ids; bind to {{xref:JBS-01}} when used.
Stage order MUST be deterministic; if conditional, conditions must be explicit.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Failure handling MUST bind to FPMP-04/JBS retry policy if present (or UNKNOWN).
Output Format
1. Pipeline Inventory
Total pipelines: {{pipelines.total}}
pipeline_ids: {{pipelines.pipeline_ids}} | OPTIONAL
2. Pipeline Spec (by pipeline_id)
Pipeline
pipeline_id: {{pipeline[0].pipeline_id}}
name: {{pipeline[0].name}} | OPTIONAL
trigger: {{pipeline[0].trigger}} (upload/event/api/UNKNOWN)
applies_to_types: {{pipeline[0].applies_to_types}} | OPTIONAL
entry_conditions: {{pipeline[0].entry_conditions}} | OPTIONAL
Stages (ordered):
Stage
stage_id: {{pipeline[0].stages[0].stage_id}}
stage_type: {{pipeline[0].stages[0].stage_type}}
order: {{pipeline[0].stages[0].order}}
execution_model: {{pipeline[0].stages[0].execution_model}} (sync/async/UNKNOWN)
job_id: {{pipeline[0].stages[0].job_id}} | OPTIONAL
inputs: {{pipeline[0].stages[0].inputs}}
outputs: {{pipeline[0].stages[0].outputs}}
failure_handling: {{pipeline[0].stages[0].failure_handling}}
resource_limits: {{pipeline[0].stages[0].resource_limits}} | OPTIONAL
observability:
metrics: {{pipeline[0].stages[0].observability.metrics}}
logs_required_fields: {{pipeline[0].stages[0].observability.logs_required_fields}} | OPTIONAL
security: {{pipeline[0].stages[0].security}} | OPTIONAL
notes: {{pipeline[0].stages[0].notes}} | OPTIONAL

(Repeat the “Stage” block for each stage in the pipeline. Repeat the “Pipeline” block for each
pipeline_id.)
3. Stage Ordering Rules
ordering_guarantee: {{ordering.guarantee}}
tie_break_rule: {{ordering.tie_break_rule}} | OPTIONAL
parallelism_policy: {{ordering.parallelism_policy}} | OPTIONAL
4. Job Binding Rules
when_job_required: {{jobs.when_required}}
job_id_source: {{jobs.job_id_source}} (expected: {{xref:JBS-01}})
job_trigger_ref: {{jobs.trigger_ref}} | OPTIONAL
5. Failure Handling Rules
retry_policy_ref: {{failure.retry_policy_ref}} | OPTIONAL
quarantine_policy: {{failure.quarantine_policy}} | OPTIONAL
reprocess_policy: {{failure.reprocess_policy}} | OPTIONAL
6. Security & Compliance
sandboxing_required: {{security.sandboxing_required}}
pii_redaction_policy: {{security.pii_redaction_policy}} | OPTIONAL
artifact_access_control: {{security.artifact_access_control}} | OPTIONAL
7. Observability (Global)
pipeline_metrics: {{obs.pipeline_metrics}}
stage_metrics_minimum: {{obs.stage_metrics_minimum}}
dashboards: {{obs.dashboards}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
8. References
Upload contract: {{xref:FPMP-01}}
Storage strategy: {{xref:FPMP-02}}
Async processing/status model: {{xref:FPMP-04}} | OPTIONAL
CDN/delivery: {{xref:FPMP-05}} | OPTIONAL
Security/compliance: {{xref:FPMP-06}} | OPTIONAL
Observability: {{xref:FPMP-07}} | OPTIONAL
Background jobs: {{xref:API-06}} | OPTIONAL
Jobs inventory: {{xref:JBS-01}} | OPTIONAL
Cross-References
Upstream: {{xref:FPMP-01}}, {{xref:FPMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FPMP-04}}, {{xref:FPMP-06}}, {{xref:FPMP-07}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL, {{standards.rules[STD-OBSERVABILITY]}} |
OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for pipeline specifics if missing; do not invent
job_ids/stages.

intermediate: Required. Define stage order, IO, execution model, and failure handling.
advanced: Required. Add security sandboxing, resource limits, and observability rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, pipeline name, applies_to_types,
entry_conditions, job_id, resource_limits, logs_required_fields, security, notes, tie_break_rule,
parallelism_policy, trigger_ref, retry_policy_ref, quarantine_policy, reprocess_policy,
pii_redaction_policy, artifact_access_control, dashboards, alerts, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If stage ordering is UNKNOWN → block Completeness Gate.
If execution_model == async and job_id is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FPMP
Pass conditions:
required_fields_present == true
pipeline_inventory_defined == true
stage_order_defined == true
async_stages_have_job_ids == true
placeholder_resolution == true
no_unapproved_unknowns == true
○

FPMP-04

FPMP-04 — Async Processing & Status Model (jobs, retries, DLQ)
Header Block

## 5. Optional Fields

Conditional stages (type-based routing) | OPTIONAL
Parallel stages policy | OPTIONAL
Caching/dedupe of processing | OPTIONAL
Manual reprocess controls | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new job_ids; bind to {{xref:JBS-01}} when used.
- **Stage order MUST be deterministic; if conditional, conditions must be explicit.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Failure handling MUST bind to FPMP-04/JBS retry policy if present (or UNKNOWN).**

## 7. Output Format

### Required Headings (in order)

1. `## Pipeline Inventory`
2. `## Pipeline Spec (by pipeline_id)`
3. `## Pipeline`
4. `## Stages (ordered):`
5. `## Stage`
6. `## observability:`
7. `## (Repeat the “Stage” block for each stage in the pipeline. Repeat the “Pipeline” block for each`
8. `## pipeline_id.)`
9. `## Stage Ordering Rules`
10. `## Job Binding Rules`

## 8. Cross-References

- **Upstream: {{xref:FPMP-01}}, {{xref:FPMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FPMP-04}}, {{xref:FPMP-06}}, {{xref:FPMP-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL, {{standards.rules[STD-OBSERVABILITY]}} |
- OPTIONAL

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
