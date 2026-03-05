# PMAD-01 — Permission Model Overview

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PMAD-01                                             |
| Template Type     | Architecture / Authorization                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring permission model overview    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Permission Model Overview Document                         |

## 2. Purpose

Define the canonical permission model: roles, resources, actions, and high-level policy
principles. This is the system-wide authorization vocabulary and structure that all enforcement
points must follow.

## 3. Inputs Required

- ● PRD-03: {{xref:PRD-03}} | OPTIONAL
- ● BRP-02: {{xref:BRP-02}} | OPTIONAL
- ● DMG-02: {{xref:DMG-02}} | OPTIONAL
- ● IAM-03: {{xref:IAM-03}} | OPTIONAL
- ● ARC-04: {{xref:ARC-04}} | OPTIONAL
- ● STK-01: {{xref:STK-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Role model:               | spec         | Yes             |
| ○ role_id list (canoni... | spec         | Yes             |
| ○ role descriptions       | spec         | Yes             |
| ○ role hierarchy/inher... | spec         | Yes             |
| Resource model:           | spec         | Yes             |
| ○ resource_id list (ca... | spec         | Yes             |
| ○ resource ownership/t... | spec         | Yes             |
| Action model:             | spec         | Yes             |
| ○ action semantics (wh... | spec         | Yes             |
| Permission expression ... | spec         | Yes             |
| ○ RBAC and/or ABAC sta... | spec         | Yes             |
| Default-deny policy st... | spec         | Yes             |

## 5. Optional Fields

● Multi-tenant model notes | OPTIONAL
● “Guest/Visitor” access rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Do not invent roles/resources/actions that conflict with PRD-03/DMG.
- Every permission rule must be expressible using the defined action/resource vocabulary.
- Default-deny applies when policy cannot be evaluated.
- Sensitive operations must require explicit permissions and audit logging.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Roles (canonical)`
2. `## role_id`
3. `## name`
4. `## description`
5. `## inherits_from`
6. `## notes`
7. `## scope`
8. `## (user/org/globa`
9. `## tenancy_key`
10. `## notes`

## 8. Cross-References

- Upstream: {{xref:PRD-03}} | OPTIONAL, {{xref:BRP-02}} | OPTIONAL, {{xref:IAM-03}} |
- OPTIONAL
- Downstream: {{xref:PMAD-02}}, {{xref:PMAD-03}}, {{xref:PMAD-05}} | OPTIONAL,
- **{{xref:ERR-04}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- beginner: Required. Roles/resources/actions tables + default deny.
- intermediate: Required. Add expression model and scope/tenancy rules.
- advanced: Required. Add sensitive ops classification and separation of duties (if used).
- Unknown Handling
- UNKNOWN_ALLOWED: role_inheritance, multi_tenant_notes,
- guest_access_rules, notes
- If default_deny policy is UNKNOWN → block

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
