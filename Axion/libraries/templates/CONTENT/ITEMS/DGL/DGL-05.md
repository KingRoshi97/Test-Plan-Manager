# DGL-05 — Auditability Requirements

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DGL-05                                             |
| Template Type     | Data / Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring auditability requirements    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Auditability Requirements Document                         |

## 2. Purpose

Define what data actions must be traceable end-to-end: create/update/delete, access, exports,
transformations, and administrative repairs. This consolidates audit requirements into a
concrete checklist and event catalog.

## 3. Inputs Required

- ● PMAD-06: {{xref:PMAD-06}} | OPTIONAL
- ● AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL
- ● DGL-04: {{xref:DGL-04}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● OBS-01: {{xref:OBS-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Traceability event cat... | spec         | Yes             |
| For each event:           | spec         | Yes             |
| ○ event_id                | spec         | Yes             |
| ○ entity_id/dataset_id    | spec         | Yes             |
| ○ action                  | spec         | Yes             |
| ○ who (actor types: us... | spec         | Yes             |
| ○ redaction rules         | spec         | Yes             |
| ○ retention window for... | spec         | Yes             |
| ○ access controls for ... | spec         | Yes             |
| Required trace linkage:   | spec         | Yes             |
| ○ correlation_id / tra... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Evidence pack requirements for compliance audits | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- Any export and any privileged data repair must be auditable.
- Before/after must be stored in a safe form (redacted) or as pointers to snapshots.
- Audit logs must be tamper-evident or protected (system pointer).
- Viewing audit logs is itself an auditable action.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Audit Event Catalog (canonical)`
2. `## categor`
3. `## entity`
4. `## _or_d`
5. `## ataset`
6. `## action`
7. `## actor_`
8. `## types`
9. `## requir`
10. `## ed_fiel`

## 8. Cross-References

- Upstream: {{xref:PMAD-06}} | OPTIONAL, {{xref:AUDIT-01}} | OPTIONAL,
- **{{xref:DGL-04}} | OPTIONAL**
- Downstream: {{xref:COMP-02}} | OPTIONAL, {{xref:GOVOPS-05}} | OPTIONAL,
- **{{xref:ADMIN-03}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
