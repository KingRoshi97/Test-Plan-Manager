# DLR-04 — Legal Holds & Exceptions

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DLR-04                                             |
| Template Type     | Data / Lifecycle                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring legal holds & exceptions    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Legal Holds & Exceptions Document                         |

## 2. Purpose

Define how legal holds and retention exceptions work: when holds apply, what data is frozen,
how deletion is blocked, who can apply/release holds, and how holds are audited. This ensures
compliance and prevents accidental deletion.

## 3. Inputs Required

- ● DLR-02: {{xref:DLR-02}} | OPTIONAL
- ● COMP-01: {{xref:COMP-01}} | OPTIONAL
- ● DGP-02: {{xref:DGP-02}} | OPTIONAL
- ● GOVOPS-03: {{xref:GOVOPS-03}} | OPTIONAL
- ● AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Legal hold definition ... | spec         | Yes             |
| Hold triggers (lawsuit... | spec         | Yes             |
| Who can place/release ... | spec         | Yes             |
| Hold effects:             | spec         | Yes             |
| ○ block deletion          | spec         | Yes             |
| ○ block anonymization ... | spec         | Yes             |
| ○ allow read-only access  | spec         | Yes             |
| ○ export rules            | spec         | Yes             |
| Exceptions policy:        | spec         | Yes             |
| ○ when retention can b... | spec         | Yes             |
| ○ when retention can b... | spec         | Yes             |

## 5. Optional Fields

● Jurisdiction-specific rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Holds override deletion procedures (DLR-03) and retention timers (DLR-02).
- Any hold action must be auditable with reason and approver.
- Hold release must be explicit and recorded.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Legal Hold Policy (required if applies)`
3. `## 3) Roles & Approval (required if applies)`
4. `## 4) Exceptions Policy (required if applies)`
5. `## 5) Tracking Fields (required if applies)`
6. `## field`
7. `## meaning`
8. `## required`
9. `## hold_id`
10. `## true`

## 8. Cross-References

- Upstream: {{xref:DLR-02}} | OPTIONAL, {{xref:COMP-01}} | OPTIONAL
- Downstream: {{xref:DLR-03}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL
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
