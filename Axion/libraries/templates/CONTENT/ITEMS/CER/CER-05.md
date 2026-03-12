# CER-05 — Client Logging & Crash Reporting (fields, redaction)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-05                                             |
| Template Type     | Build / Client Error Recovery                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring client logging & crash reporting (fields, redaction)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Client Logging & Crash Reporting (fields, redaction) Document                         |

## 2. Purpose

Define the canonical client logging and crash reporting requirements: what events are logged,
required fields, redaction rules (PII/secrets), sampling, and how crash reports are linked to
server requests and user sessions. This template must be consistent with error UX and
audit/redaction standards and must not invent logging systems not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- CER-01 Error Boundary Strategy: {{cer.boundaries}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Logging scope (what is... | spec         | Yes             |
| Event types (error, wa... | spec         | Yes             |
| Correlation rules (lin... | spec         | Yes             |
| Redaction policy (PII,... | spec         | Yes             |
| Crash reporting enable... | spec         | Yes             |
| Sampling policy (volum... | spec         | Yes             |
| Storage/transport poli... | spec         | Yes             |
| User privacy policy (o... | spec         | Yes             |
| Alerting integration n... | spec         | Yes             |

## 5. Optional Fields

Breadcrumbs (user actions) | OPTIONAL

Offline log buffering | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not log secrets/tokens or raw PII.
- **Crash reports MUST be redacted and privacy-safe.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Logging Scope`
2. `## Event Types`
3. `## Required Fields`
4. `## Correlation Rules`
5. `## Redaction Policy`
6. `## Crash Reporting`
7. `## Sampling / Volume Controls`
8. `## Storage / Transport`
9. `## Privacy`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FE-07}}, {{xref:CER-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,**
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
