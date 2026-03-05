# SSO-01 — Provider Inventory (by provider_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-01                                             |
| Template Type     | Integration / SSO & Identity                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring provider inventory (by provider_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Provider Inventory (by provider_id) Document                         |

## 2. Purpose

Create the single, canonical inventory of all third-party auth/SSO providers, indexed by
provider_id, including protocol type, environments enabled, and which flows/features depend on
each provider. This document must not invent provider_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- API-04 AuthZ Rules (roles/claims): {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Provider registry (pro... | spec         | Yes             |
| provider_id (stable id... | spec         | Yes             |
| provider name/vendor      | spec         | Yes             |
| protocol (OIDC/SAML/LD... | spec         | Yes             |
| tenant model (single-t... | spec         | Yes             |
| login entrypoints supp... | spec         | Yes             |
| environments enabled (... | spec         | Yes             |
| scopes/claims expected... | spec         | Yes             |
| user provisioning mode... | spec         | Yes             |
| criticality (low/med/h... | spec         | Yes             |
| owner (team/role)         | spec         | Yes             |
| security notes pointer... | spec         | Yes             |

## 5. Optional Fields

Branding/custom UI notes | OPTIONAL

SLA/uptime notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new provider_ids; use only {{spec.sso_providers_by_id}} if present, else mark
- **UNKNOWN and flag.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Provider Entries (by provider_id)`
3. `## Provider`
4. `## open_questions:`
5. `## (Repeat per provider_id.)`
6. `## References`
7. `## Cross-References`
8. `## OPTIONAL`
9. `## Skill Level Requiredness Rules`
10. `## beginner: Required. Populate provider registry and core fields; do not invent provider_ids.`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:SSO-02}}, {{xref:SSO-03}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
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
