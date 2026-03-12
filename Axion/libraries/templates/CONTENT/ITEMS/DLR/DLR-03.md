# DLR-03 — Deletion & Erasure Procedures

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DLR-03                                             |
| Template Type     | Data / Lifecycle                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring deletion & erasure procedures    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Deletion & Erasure Procedures Document                         |

## 2. Purpose

Define the deterministic procedures for data deletion and erasure: soft delete, hard delete,
anonymization, cascading delete behaviors across relationships, and verification steps. This
ensures privacy compliance and prevents partial/failed deletions.

## 3. Inputs Required

- ● DLR-01: {{xref:DLR-01}} | OPTIONAL
- ● DLR-02: {{xref:DLR-02}} | OPTIONAL
- ● DGP-02: {{xref:DGP-02}} | OPTIONAL
- ● DGP-04: {{xref:DGP-04}} | OPTIONAL
- ● DATA-02: {{xref:DATA-02}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Deletion types supported: | spec         | Yes             |
| ○ soft delete (tombstone) | spec         | Yes             |
| ○ hard delete (physica... | spec         | Yes             |
| ○ anonymize/pseudonymi... | spec         | Yes             |
| Deletion triggers:        | spec         | Yes             |
| ○ user request            | spec         | Yes             |
| ○ retention expiry        | spec         | Yes             |
| ○ admin action            | spec         | Yes             |
| Procedure definitions ... | spec         | Yes             |
| Entity deletion matrix... | spec         | Yes             |
| ○ entity_id               | spec         | Yes             |
| ○ deletion_type(s) all... | spec         | Yes             |

## 5. Optional Fields

● Secure deletion verification methods | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Hard delete must be final; define irreversibility.
- Cascades must align with DATA-02 relationships; no ad-hoc cascades.
- Legal hold overrides deletion; must be checked first.
- Deletion must include index/cache invalidation.
- Backups: define policy for delete propagation (cannot claim immediate delete from
- **immutable backups; must specify retention window).**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Deletion Types (required)`
2. `## 2) Triggers (required)`
3. `## 3) Procedures (required)`
4. `## Soft Delete Procedure`
5. `## Hard Delete Procedure`
6. `## Anonymize Procedure (optional)`
7. `## 4) Entity Deletion Matrix (canonical)`
8. `## entity_id`
9. `## allowed_`
10. `## deletion`

## 8. Cross-References

- Upstream: {{xref:DLR-02}} | OPTIONAL, {{xref:DATA-02}} | OPTIONAL, {{xref:DGP-04}} |
- OPTIONAL
- Downstream: {{xref:DLR-04}} | OPTIONAL, {{xref:SRCH-03}} | OPTIONAL,
- **{{xref:CACHE-02}} | OPTIONAL, {{xref:BDR-*}} | OPTIONAL**
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
