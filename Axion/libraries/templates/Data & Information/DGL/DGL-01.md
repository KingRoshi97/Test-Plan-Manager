# DGL-01 — Data Ownership Map (owner

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DGL-01                                             |
| Template Type     | Data / Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data ownership map (owner    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Ownership Map (owner Document                         |

## 2. Purpose

Define who “owns” each entity/dataset: the accountable party for correctness, schema changes,
access controls, retention policy alignment, and incident response. This prevents orphaned data
with unclear decision rights.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● STK-03: {{xref:STK-03}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Ownership registry entries (minimum: all DATA-01 entities + key derived datasets)
● For each entry:
○ entity_id or dataset_id
○ owner_role/team
○ steward (optional second owner)
○ change approver (who approves schema changes)
○ access approver (who approves access/export)
○ oncall/escalation contact (role, not person) | OPTIONAL
○ sensitivity class (PII level)
○ criticality (P0/P1/P2)
● Ownership change procedure

## 5. Optional Fields

● Data product classification | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Every entity must have exactly one primary owner.
- High-sensitivity entities require explicit access approver.
- Ownership must align with boundary ownership (ARC-01); if mismatch, justify.
- Ownership changes must be auditable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Ownership Registry (canonical)`
2. `## kind`
3. `## (entit`
4. `## y/dat`
5. `## aset)`
6. `## owne`
7. `## stewa`
8. `## schema_`
9. `## approver`
10. `## access_a`

## 8. Cross-References

- Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:STK-03}} | OPTIONAL, {{xref:DGP-01}} |
- OPTIONAL
- Downstream: {{xref:DGL-04}} | OPTIONAL, {{xref:DLR-02}} | OPTIONAL,
- **{{xref:DQV-04}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
