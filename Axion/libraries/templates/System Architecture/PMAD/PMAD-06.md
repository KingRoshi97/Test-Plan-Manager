# PMAD-06 — Audit Requirements for AuthZ

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PMAD-06                                             |
| Template Type     | Architecture / Authorization                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring audit requirements for authz    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Audit Requirements for AuthZ Document                         |

## 2. Purpose

Define the audit logging requirements specifically for authorization: what decisions and actions
must be logged, what fields are required, how redaction works, retention rules, and how audit
trails support investigations and compliance.

## 3. Inputs Required

- ● PMAD-03: {{xref:PMAD-03}} | OPTIONAL
- ● PMAD-04: {{xref:PMAD-04}} | OPTIONAL
- ● AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● OBS-01: {{xref:OBS-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Audit event categories:   | spec         | Yes             |
| ○ auth decisions (allo... | spec         | Yes             |
| ○ privileged actions      | spec         | Yes             |
| ○ policy changes (if a... | spec         | Yes             |
| ○ access grant/revoke ... | spec         | Yes             |
| Required audit fields:    | spec         | Yes             |
| ○ timestamp               | spec         | Yes             |
| ○ actor (user/service)    | spec         | Yes             |
| ○ actor_role(s)           | spec         | Yes             |
| ○ action                  | spec         | Yes             |
| ○ resource + resource ... | spec         | Yes             |
| ○ decision outcome        | spec         | Yes             |

## 5. Optional Fields

● Export/reporting requirements | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Audit logs must be tamper-evident or protected (pointer to audit system rules).
- Access to audit logs must be least-privilege and itself auditable.
- Reason codes are mandatory for denies and privileged actions.
- Before/after snapshots must avoid storing sensitive fields unnecessarily.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Audit Event Categories (required)`
2. `## 2) Required Fields (required)`
3. `## field`
4. `## required`
5. `## description`
6. `## redaction_rule`
7. `## timestamp`
8. `## true`
9. `## actor_id`
10. `## true`

## 8. Cross-References

- Upstream: {{xref:AUDIT-01}} | OPTIONAL, {{xref:DGP-01}} | OPTIONAL, {{xref:OBS-01}}
- | OPTIONAL
- Downstream: {{xref:ADMIN-03}} | OPTIONAL, {{xref:IRP-*}} | OPTIONAL,
- **{{xref:COMP-02}} | OPTIONAL**
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
