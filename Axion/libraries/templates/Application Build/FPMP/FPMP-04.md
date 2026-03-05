# FPMP-04 — Async Processing & Status Model (jobs, retries, DLQ)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-04                                             |
| Template Type     | Build / File Processing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring async processing & status model (jobs, retries, dlq)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Async Processing & Status Model (jobs, retries, DLQ) Document                         |

## 2. Purpose

Define the canonical async processing model and status contract for file/media workflows,
including job lifecycle states, status endpoints/fields, retry/DLQ bindings,
idempotency/concurrency rules, and user-visible progress semantics. This template must be
consistent with background job specs and processing pipeline stages and must not invent job
capabilities not present in upstream inputs.

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
| Status object schema (... | spec         | Yes             |
| Lifecycle states (queu... | spec         | Yes             |
| State transition rules... | spec         | Yes             |
| Progress fields (perce... | spec         | Yes             |
| Status access control ... | spec         | Yes             |
| Retry policy binding (... | spec         | Yes             |
| DLQ/quarantine binding... | spec         | Yes             |
| Idempotency rules (ded... | spec         | Yes             |
| Concurrency rules (per... | spec         | Yes             |
| Status endpoints contr... | spec         | Yes             |
| Error mapping (to API-03) | spec         | Yes             |

## 5. Optional Fields

Push updates (WS/events) | OPTIONAL
Partial success semantics | OPTIONAL
Cancellation semantics | OPTIONAL
Backfill/reprocess rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Status schema MUST be stable and MUST be used by all async file pipelines.**
- **Retries/DLQ MUST follow {{xref:JBS-04}} when present.**
- **Idempotency/concurrency MUST follow {{xref:JBS-05}} when present.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Status endpoints MUST map errors to {{xref:API-03}} and enforce access via {{xref:API-04}} |**
- **OPTIONAL.**

## 7. Output Format

### Required Headings (in order)

1. `## Async Status Model`
2. `## Status Object Schema`
3. `## Lifecycle States`
4. `## states:`
5. `## State Transition Rules`
6. `## Progress Semantics`
7. `## Access Control`
8. `## Retry & DLQ Binding`
9. `## Idempotency & Concurrency`
10. `## Status Endpoints Contract`

## 8. Cross-References

- **Upstream: {{xref:FPMP-01}}, {{xref:FPMP-03}}, {{xref:API-06}} | OPTIONAL,**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FPMP-05}}, {{xref:FPMP-06}}, {{xref:FPMP-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
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
