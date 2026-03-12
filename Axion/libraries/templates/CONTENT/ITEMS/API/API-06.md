# API-06 — Background Jobs Spec (API-triggered + system jobs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-06                                             |
| Template Type     | Build / API                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring background jobs spec (api-triggered + system jobs)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Background Jobs Spec (API-triggered + system jobs) Document                         |

## 2. Purpose

Define the canonical specification format for background jobs that are initiated by API
actions or run as system jobs, including triggers, inputs/outputs, idempotency, concurrency,
retries, DLQ handling, status surfaces, and observability requirements. This template must be
consistent with the Endpoint Catalog and per-endpoint specs and must not invent job IDs,
triggers, or behavior not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-03 Error & Status Code Policy: {{api.error_policy}}
- API-05 Rate Limit & Abuse Controls: {{api.ratelimit_policy}} | OPTIONAL
- JBS-01 Jobs Inventory: {{jbs.jobs_inventory}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Job linkage model (how... | spec         | Yes             |
| Trigger types (API-tri... | spec         | Yes             |
| Trigger definition for... | spec         | Yes             |
| Job lifecycle model (s... | spec         | Yes             |
| Inputs contract (schem... | spec         | Yes             |
| Outputs contract (resu... | spec         | Yes             |
| Idempotency rules (job... | spec         | Yes             |
| Concurrency rules (per... | spec         | Yes             |
| Cancellation policy (i... | spec         | Yes             |
| Timeouts/SLO fields (t... | spec         | Yes             |

## 5. Optional Fields

Job priority classes | OPTIONAL
Backfill/replay rules | OPTIONAL
Manual operator controls | OPTIONAL
Rate-limit coupling rules (job-trigger throttles) | OPTIONAL
Feature-flag enablement rules per env | OPTIONAL
Resource cost hints (CPU/mem/queue) | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new job_ids; use: {{jbs.jobs_inventory[job_*].job_id}} as given.
- **Every background job referenced by an API endpoint MUST have a job spec entry using this**
- **template OR be explicitly marked UNKNOWN (with pointer).**
- **Every job MUST be traceable to its trigger source (endpoint, scheduler, event, operator action).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- All status surfaces MUST map errors to: {{xref:API-03}}
- All access to job artifacts/status MUST obey: {{xref:API-04}} | OPTIONAL
- **Retries/DLQ MUST follow: {{xref:JBS-04}} | OPTIONAL**
- If idempotency is required, bind to: {{xref:JBS-05}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Job Linkage Model (API → Job)`
2. `## Binding rule:`
3. `## exists.`
4. `## Canonical job binding block (for API-02):`
5. `## job:`
6. `## UNKNOWN)`
7. `## Job Identifier Rules`
8. `## Trigger Types`
9. `## Trigger Definition Format`
10. `## Trigger fields:`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:API-01}}, {{xref:API-02}}, {{xref:JBS-01}} |**
- **OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL**
- **Downstream: {{xref:JBS-02}}, {{xref:JBS-03}}, {{xref:JBS-04}}, {{xref:JBS-05}} | OPTIONAL**
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
