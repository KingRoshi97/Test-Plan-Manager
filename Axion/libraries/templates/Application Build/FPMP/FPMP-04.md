# FPMP-04 — Async Processing & Status Model (jobs, retries, DLQ)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-04                                          |
| Template Type     | Build / File Processing                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring async processing & status |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-01, FPMP-03, API-06                         |
| Produces          | Filled Async Processing & Status Model (jobs, ret|

## 2. Purpose

Define the canonical async processing model and status contract for file/media workflows, including job lifecycle states, status endpoints/fields, retry/DLQ bindings, idempotency/concurrency rules, and user-visible progress semantics. This template must be consistent with background job specs and processing pipeline stages and must not invent job capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.pipeline_stages}}
- API-06 Background Jobs Spec: {{api.background_jobs}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jbs.retry_dlq}} | OPTIONAL
- JBS-05 Idempotency & Concurrency for Jobs: {{jbs.idempotency_concurrency}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Status model statement (h | spec         | No              |
| Status object schema (sta | spec         | No              |
| Lifecycle states (queued/ | spec         | No              |
| State transition rules (w | spec         | No              |
| Progress fields (percent/ | spec         | No              |
| Status access control (wh | spec         | No              |
| Retry policy binding (to  | spec         | No              |
| DLQ/quarantine binding ru | spec         | No              |
| Idempotency rules (dedupe | spec         | No              |
| Concurrency rules (per fi | spec         | No              |
| Status endpoints contract | spec         | No              |
| Error mapping (to API-03) | spec         | No              |
| Observability requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Push updates (WS/events)  | spec         | Enrichment only, no new truth  |
| Partial success semantics | spec         | Enrichment only, no new truth  |
| Cancellation semantics    | spec         | Enrichment only, no new truth  |
| Backfill/reprocess rules  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Status schema MUST be stable and MUST be used by all async file pipelines.
- Retries/DLQ MUST follow {{xref:JBS-04}} when present.
- Idempotency/concurrency MUST follow {{xref:JBS-05}} when present.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Status endpoints MUST map errors to {{xref:API-03}} and enforce access via {{xref:API-04}} |
- OPTIONAL.

## 7. Output Format

### Required Headings (in order)

1. `## Async Processing & Status Model (jobs, retries, DLQ)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FPMP-01}}, {{xref:FPMP-03}}, {{xref:API-06}} | OPTIONAL,
- {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FPMP-05}}, {{xref:FPMP-06}}, {{xref:FPMP-07}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, pipeline_id, job_id, stage_id, progress,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If lifecycle.states is UNKNOWN → block Completeness Gate.
- If idempotency_key_rule is UNKNOWN → block Completeness Gate.
- If max_inflight is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FPMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] status_schema_defined == true
- [ ] lifecycle_defined == true
- [ ] idempotency_concurrency_defined == true
- [ ] error_mapping_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FPMP-05
