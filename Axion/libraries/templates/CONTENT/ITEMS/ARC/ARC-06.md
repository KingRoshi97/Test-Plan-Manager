# ARC-06 — Error Model + Reason Codes

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-06                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error model + reason codes    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Model + Reason Codes Document                         |

## 2. Purpose

Define the system-wide error model and reason-code strategy so failures are predictable,
mappable to UX copy, and observable. This provides the canonical failure taxonomy that APIs,
workflows, and realtime systems must follow.

## 3. Inputs Required

- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● DMG-03: {{xref:DMG-03}} | OPTIONAL
- ● DES-07: {{xref:DES-07}} | OPTIONAL
- ● CDX-04: {{xref:CDX-04}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Error class model:        | spec         | Yes             |
| ○ domain/business rule... | spec         | Yes             |
| ○ validation errors       | spec         | Yes             |
| ○ auth/authz errors       | spec         | Yes             |
| ○ dependency/integrati... | spec         | Yes             |
| ○ system/unknown errors   | spec         | Yes             |
| Reason code rules:        | spec         | Yes             |
| ○ rc_* naming convention  | spec         | Yes             |
| ○ uniqueness and owner... | spec         | Yes             |
| ○ stability policy (ne... | spec         | Yes             |
| Mapping rules:            | spec         | Yes             |
| ○ error class → HTTP s... | spec         | Yes             |

## 5. Optional Fields

● Versioning/deprecation policy for reason codes | OPTIONAL
● Domain-specific extensions | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Every user-facing error must have a reason_code OR a policy-defined fallback reason.
- Reason codes must be stable; deprecate, don’t reuse.
- Errors must not leak sensitive internal information.
- Retryability must align to idempotency rules (ERR-05 / WFO-03).
- UX mapping must align to DES-07 and CDX-04.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Error Classes (required)`
2. `## error_cla`
3. `## description`
4. `## examples`
5. `## default_surface`
6. `## default_retryabil`
7. `## ity`
8. `## domain_r`
9. `## ule`
10. `## .desc}}`

## 8. Cross-References

- Upstream: {{xref:DES-07}} | OPTIONAL, {{xref:CDX-04}} | OPTIONAL, {{xref:BRP-01}} |
- OPTIONAL
- Downstream: {{xref:ERR-01}}, {{xref:ERR-02}}, {{xref:ERR-03}}, {{xref:ERR-04}},
- **{{xref:ERR-05}}, {{xref:ERR-06}} | OPTIONAL**
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
