# PMAD-03 — Enforcement Points Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PMAD-03                                             |
| Template Type     | Architecture / Authorization                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring enforcement points map    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Enforcement Points Map Document                         |

## 2. Purpose

Define where authorization is enforced across the stack: UI gating, API gateway checks,
service-layer checks, and data-layer guards. This prevents “security gaps” where a permission
is enforced in one layer but bypassable in another.

## 3. Inputs Required

- ● PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● API-01: {{xref:API-01}} | OPTIONAL
- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● IAN-05: {{xref:IAN-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Enforcement layer definitions (UI/API/service/DB)
● Enforcement point inventory (minimum 20 for non-trivial products)
● For each enforcement point:
○ ep_id
○ layer (ui/api/service/db)
○ resource_id
○ action_id(s)
○ where_in_code (module/route/service name) | OPTIONAL placeholder
○ decision function (policy check method)
○ required inputs (subject, resource, context)
○ deny behavior (status, reason_code, UX surface pointer)
○ logging/audit requirement
○ test requirement (unit/contract/e2e)
● Consistency rule: API and service enforcement cannot rely on UI-only checks
● Coverage check: every PMAD-02 policy appears in at least one enforcement point

## 5. Optional Fields

● Caching policy for authz decisions | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- UI gating is for UX only; real enforcement must occur server-side.
- DB-level guards (if used) must align with service-level policies; do not create conflicting
- **logic.**
- Deny responses must map to reason codes and avoid leakage.
- Each enforcement point must specify test coverage expectation.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Layer Rules (required)`
2. `## 2) Enforcement Points Inventory (canonical)`
3. `## layer`
4. `## resour`
5. `## action`
6. `## decisio`
7. `## n_met`
8. `## hod`
9. `## requir`
10. `## ed_in`

## 8. Cross-References

- Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:IAN-05}} | OPTIONAL
- Downstream: {{xref:PMAD-04}}, {{xref:PMAD-06}} | OPTIONAL, {{xref:QA-02}} |
- **OPTIONAL, {{xref:TINF-*}} | OPTIONAL**
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
