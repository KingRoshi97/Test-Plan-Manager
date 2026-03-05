# DLR-05 — Archival & Cold Storage

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DLR-05                                             |
| Template Type     | Data / Lifecycle                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring archival & cold storage    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Archival & Cold Storage Document                         |

## 2. Purpose

Define how archived data is stored, accessed, and restored: what moves to cold storage, when
it moves, how it is indexed (if at all), how access is controlled, and how archival impacts
reporting, search, and cost.

## 3. Inputs Required

- ● DLR-01: {{xref:DLR-01}} | OPTIONAL
- ● DLR-02: {{xref:DLR-02}} | OPTIONAL
- ● STORE-01: {{xref:STORE-01}} | OPTIONAL
- ● RPT-04: {{xref:RPT-04}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Archival candidates li... | spec         | Yes             |
| Storage tiers and loca... | spec         | Yes             |
| Access policy for arch... | spec         | Yes             |
| ○ who can access          | spec         | Yes             |
| ○ how it’s requested (... | spec         | Yes             |
| ○ latency expectation     | spec         | Yes             |
| Indexing/search policy... | spec         | Yes             |
| Reporting impact polic... | spec         | Yes             |
| Restore procedure (hig... | spec         | Yes             |
| Cost control notes (qu... | spec         | Yes             |

## 5. Optional Fields

● Rehydration policy (bring back to hot) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Archived data access must respect permissions and privacy.
- Restore must be auditable for sensitive data.
- Search and reporting policies must explicitly state whether archived data is included.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Archival Candidates (required if applies)`
3. `## entity_or`
4. `## _dataset`
5. `## trigger_r`
6. `## ule`
7. `## storage`
8. `## _tier`
9. `## access_`
10. `## mode`

## 8. Cross-References

- Upstream: {{xref:STORE-01}} | OPTIONAL, {{xref:DLR-02}} | OPTIONAL
- Downstream: {{xref:STORE-02}} | OPTIONAL, {{xref:STORE-03}} | OPTIONAL,
- **{{xref:SRCH-03}} | OPTIONAL, {{xref:RPT-03}} | OPTIONAL**
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
