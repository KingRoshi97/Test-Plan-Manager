# DQV-05 — Bad Data Handling (quarantine,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DQV-05                                             |
| Template Type     | Data / Quality                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring bad data handling (quarantine,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Bad Data Handling (quarantine, Document                         |

## 2. Purpose

Define how the system handles bad data when detected: quarantine, repair workflows, backfills,
reconciliation, and safe reprocessing. This prevents silent corruption and ensures deterministic
remediation.

## 3. Inputs Required

- ● DQV-02: {{xref:DQV-02}} | OPTIONAL
- ● DQV-04: {{xref:DQV-04}} | OPTIONAL
- ● PIPE-04: {{xref:PIPE-04}} | OPTIONAL
- ● WFO-05: {{xref:WFO-05}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● OBS-04: {{xref:OBS-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Bad data classificatio... | spec         | Yes             |
| ○ schema invalid          | spec         | Yes             |
| ○ semantic invalid        | spec         | Yes             |
| ○ referential broken      | spec         | Yes             |
| ○ duplicate               | spec         | Yes             |
| ○ stale/out-of-order      | spec         | Yes             |
| Quarantine model:         | spec         | Yes             |
| ○ what data is quarant... | spec         | Yes             |
| ○ where it is stored      | spec         | Yes             |
| ○ required quarantine ... | spec         | Yes             |
| ○ retention policy        | spec         | Yes             |
| Repair workflow defini... | spec         | Yes             |

## 5. Optional Fields

● Auto-repair rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Quarantine must preserve enough context to debug but respect privacy/redaction.
- Repairs and backfills must be idempotent and observable.
- Any repair that changes user-visible outcomes must be auditable.
- Backfills must be throttled and safe for production.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Bad Data Types (required)`
2. `## 2) Quarantine Model (required)`
3. `## 3) Repair Workflows (canonical, min 6)`
4. `## rep`
5. `## air_`
6. `## trigger`
7. `## steps`
8. `## approvals`
9. `## idempot`
10. `## ency_rul`

## 8. Cross-References

- Upstream: {{xref:DQV-04}} | OPTIONAL, {{xref:WFO-05}} | OPTIONAL, {{xref:PIPE-04}} |
- OPTIONAL
- Downstream: {{xref:DQV-06}} | OPTIONAL, {{xref:RELIA-05}} | OPTIONAL, {{xref:IRP-*}}
- | OPTIONAL
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
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
