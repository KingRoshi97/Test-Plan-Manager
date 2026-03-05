# DLR-01 — Data Lifecycle States

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DLR-01                                             |
| Template Type     | Data / Lifecycle                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data lifecycle states    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Lifecycle States Document                         |

## 2. Purpose

Define the canonical lifecycle states for persisted data (e.g., active → archived → deleted), what
each state means, and what system behaviors are allowed in each state. This enables
consistent soft-delete, archival, and retention enforcement.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DGP-02: {{xref:DGP-02}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● RISK-02: {{xref:RISK-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Lifecycle state set (m... | spec         | Yes             |
| State definitions (mea... | spec         | Yes             |
| State transition rules:   | spec         | Yes             |
| ○ allowed transitions     | spec         | Yes             |
| ○ disallowed transitions  | spec         | Yes             |
| ○ who/what triggers tr... | spec         | Yes             |
| Per-entity applicability: | spec         | Yes             |
| ○ which entities have ... | spec         | Yes             |
| Behavioral constraints... | spec         | Yes             |
| ○ readable? writable? ... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Additional states (pending, suspended) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- “Deleted” must define whether it is soft-delete vs hard-delete (pointer to DLR-03).
- Archived data access must be explicitly defined (read-only vs hidden).
- Search and reporting must respect lifecycle constraints.
- Transitions must be auditable for sensitive entities.

## 7. Output Format

### Required Headings (in order)

1. `## 1) States (required)`
2. `## state`
3. `## meaning`
4. `## allowed_access`
5. `## constraints`
6. `## activ`
7. `## ing}}`
8. `## ess}}`
9. `## ints}}`
10. `## es}}`

## 8. Cross-References

- Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:DGP-02}} | OPTIONAL
- Downstream: {{xref:DLR-02}}, {{xref:DLR-03}}, {{xref:SRCH-01}} | OPTIONAL,
- **{{xref:RPT-03}} | OPTIONAL**
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
