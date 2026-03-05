# DATA-05 — Seed Data Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-05                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring seed data spec    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Seed Data Spec Document                         |

## 2. Purpose

Define deterministic seed data required for the system to run in dev/stage (and sometimes
prod): default roles, permissions, system settings, reference tables, feature flags defaults, and
any canonical lookup sets.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● PMAD-01: {{xref:PMAD-01}} | OPTIONAL
- ● DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- ● ENV-01: {{xref:ENV-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each seed set:        | spec         | Yes             |
| ○ seed_id                 | spec         | Yes             |
| ○ target entity/table     | spec         | Yes             |
| ○ environment applicab... | spec         | Yes             |
| ○ records definition (... | spec         | Yes             |
| ○ idempotency rule (sa... | spec         | Yes             |
| ○ dependencies (must e... | spec         | Yes             |
| ○ owner                   | spec         | Yes             |
| ○ verification query (... | spec         | Yes             |
| Secrets exclusion rule... | spec         | Yes             |
| Environment safety rul... | spec         | Yes             |

## 5. Optional Fields

● Data generator rules (synthetic data) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Seed data must be idempotent and safe to rerun.
- Seed IDs must be stable; don’t rely on auto-increment values.
- Never seed secrets; reference ENV secrets management.
- Production seeding must be explicit and approval-gated.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Seed Sets (canonical)`
2. `## seed`
3. `## _id`
4. `## table/en`
5. `## tity`
6. `## envs`
7. `## records_`
8. `## keying`
9. `## depend`
10. `## encies`

## 8. Cross-References

- Upstream: {{xref:PMAD-01}} | OPTIONAL, {{xref:ENV-01}} | OPTIONAL
- Downstream: {{xref:IMP-01}} | OPTIONAL, {{xref:DX-01}} | OPTIONAL, {{xref:QA-03}} |
- OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
