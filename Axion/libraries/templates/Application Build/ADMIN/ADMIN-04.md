# ADMIN-04 — Data Repair Procedures (safe backfills)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-04                                             |
| Template Type     | Build / Admin Tools                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data repair procedures (safe backfills)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Repair Procedures (safe backfills) Document                         |

## 2. Purpose

Define the canonical procedures and constraints for performing safe data repairs (manual fixes,
backfills, replays, reconciliations), including approvals, dry runs, idempotency, rate limits, audit
logging, and rollback/verification. This template must be consistent with audit/AuthZ rules and
must not invent repair capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ADMIN-01 Capabilities Matrix: {{admin.capabilities}}
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- EVT-07 Failure Handling (replay/backfill): {{evt.failure_handling}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jbs.retry_dlq}} | OPTIONAL
- JBS-05 Idempotency & Concurrency: {{jbs.idempotency_concurrency}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Eligibility rules (wha... | spec         | Yes             |
| Approval policy (requi... | spec         | Yes             |
| Safety checklist (pre-... | spec         | Yes             |
| Dry-run policy (requir... | spec         | Yes             |
| Execution method (scri... | spec         | Yes             |
| Idempotency requiremen... | spec         | Yes             |
| Concurrency/rate limit... | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |
| Rollback/compensation ... | spec         | Yes             |
| Verification steps (ho... | spec         | Yes             |
| Communication policy (... | spec         | Yes             |

## 5. Optional Fields

Feature-flag gated repairs | OPTIONAL
Quarantine mode | OPTIONAL
Incident/ticket linkage | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- All repair actions MUST be auditable per {{xref:ADMIN-03}}.
- **AuthZ for repairs MUST bind to {{xref:API-04}}.**
- **Repairs that replay events MUST respect {{xref:EVT-07}} semantics.**
- **Job-based repairs MUST respect {{xref:JBS-04}} and {{xref:JBS-05}} when applicable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Repair Action Types`
2. `## Eligibility Rules`
3. `## Approval Policy`
4. `## Safety Checklist (Pre-Flight)`
5. `## checklist:`
6. `## Dry-Run Policy`
7. `## Execution Method`
8. `## Idempotency & Concurrency`
9. `## Audit Logging`
10. `## Rollback / Compensation`

## 8. Cross-References

- **Upstream: {{xref:ADMIN-01}}, {{xref:ADMIN-03}}, {{xref:API-04}} | OPTIONAL,**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-06}} | OPTIONAL, {{xref:RUNBOOK-REPAIR}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL

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
