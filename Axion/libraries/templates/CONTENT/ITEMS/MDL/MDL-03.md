# MDL-03 — Auth Gating & Safety (signed links, validation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-03                                             |
| Template Type     | Build / Deep Links                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring auth gating & safety (signed links, validation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Auth Gating & Safety (signed links, validation) Document                         |

## 2. Purpose

Define the canonical auth gating and safety rules for mobile deep links, including how signed
links are validated (if supported), how auth-required targets behave when logged out, and how
to prevent unsafe actions via links. This template must be consistent with secure deep link
handling and route guard rules and must not invent security mechanics not present in upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}}
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- MDL-02 Routing Rules: {{mobile.routing_rules}} | OPTIONAL
- CER-04 Session Expiry Handling: {{cer.session_expiry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Auth-required target r... | spec         | Yes             |
| Logged-out behavior (l... | spec         | Yes             |
| Signed link support (t... | spec         | Yes             |
| Signature validation r... | spec         | Yes             |
| Expiry rules (if signe... | spec         | Yes             |
| Sensitive action prote... | spec         | Yes             |
| Replay protection rule... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Error UX rules (safe m... | spec         | Yes             |

## 5. Optional Fields

Device binding rules | OPTIONAL

Multi-tenant context rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Signed link failures MUST not leak verification details.**
- **Auth gating MUST align with {{xref:ROUTE-04}} and session rules with {{xref:CER-04}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Auth-Required Targets`
2. `## Logged-Out Behavior`
3. `## Signed Links`
4. `## Expiry`
5. `## Sensitive Actions`
6. `## Replay / One-Time Links`
7. `## Telemetry`
8. `## Error UX`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:CSec-05}}, {{xref:MDL-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDL-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
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
