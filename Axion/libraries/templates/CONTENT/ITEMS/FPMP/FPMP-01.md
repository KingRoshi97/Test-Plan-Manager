# FPMP-01 — Upload Contract (types, limits, auth, scanning)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-01                                             |
| Template Type     | Build / File Processing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring upload contract (types, limits, auth, scanning)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Upload Contract (types, limits, auth, scanning) Document                         |

## 2. Purpose

Define the canonical upload contract for files/media, including accepted types, size limits,
authentication/authorization, scanning/validation, upload flow (direct vs signed URL), error
mapping, and observability. This template must be consistent with API security policies and
must not invent upload capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-03 Error & Status Code Policy: {{api.error_policy}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Upload surface(s) (end... | spec         | Yes             |
| Authentication require... | spec         | Yes             |
| Authorization requirem... | spec         | Yes             |
| Accepted file types (m... | spec         | Yes             |
| Size limits (max bytes... | spec         | Yes             |
| Count limits (max file... | spec         | Yes             |
| Integrity checks (chec... | spec         | Yes             |
| Scanning policy (malwa... | spec         | Yes             |
| PII/compliance classif... | spec         | Yes             |
| Error mapping (validat... | spec         | Yes             |
| Rate limiting policy f... | spec         | Yes             |

## 5. Optional Fields

Chunking/resumable upload rules | OPTIONAL
Client-side prevalidation rules | OPTIONAL
Encryption requirements | OPTIONAL
Quarantine behavior | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Accepted types MUST be allowlisted (no “any file” unless explicitly allowed).**
- If scanning is required, files MUST NOT be made available until scan passes (or explicit policy).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **AuthZ MUST bind to {{xref:API-04}}; rate limits bind to {{xref:RLIM-01}}.**
- **Errors MUST map to {{xref:API-03}}.**

## 7. Output Format

### Required Headings (in order)

1. `## Upload Surfaces`
2. `## AuthN/AuthZ`
3. `## Accepted Types`
4. `## mime_allowlist:`
5. `## extension_allowlist:`
6. `## Limits`
7. `## Upload Flow`
8. `## Integrity & Validation`
9. `## Scanning & Quarantine`
10. `## Compliance & PII`

## 8. Cross-References

- **Upstream: {{xref:API-01}}, {{xref:API-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FPMP-02}}, {{xref:FPMP-03}}, {{xref:FPMP-04}}, {{xref:FPMP-06}},**
- **{{xref:FPMP-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL

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
