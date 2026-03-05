# SSO-05 — SCIM Provisioning Spec (users/groups lifecycle)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-05                                             |
| Template Type     | Integration / SSO & Identity                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring scim provisioning spec (users/groups lifecycle)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled SCIM Provisioning Spec (users/groups lifecycle) Document                         |

## 2. Purpose

Define the canonical SCIM provisioning implementation: supported resources (Users/Groups),
lifecycle operations (create/update/deactivate), attribute mapping, authentication, rate limits,
idempotency, and failure handling. This template must be consistent with role/claim mapping
and AuthZ rules and must not invent endpoints/resources beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-03 Claim/Role Mapping: {{sso.claim_mapping}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| provider_id binding       | spec         | Yes             |
| SCIM enabled (true/fal... | spec         | Yes             |
| Supported resources (U... | spec         | Yes             |
| Supported operations (... | spec         | Yes             |
| Auth method for SCIM (... | spec         | Yes             |
| Attribute mapping (SCI... | spec         | Yes             |
| Group membership handl... | spec         | Yes             |
| Idempotency rules (ext... | spec         | Yes             |
| Deprovisioning rules (... | spec         | Yes             |
| Rate limit policy (for... | spec         | Yes             |
| Failure handling (retr... | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |

## 5. Optional Fields

Multi-tenant partitioning rules | OPTIONAL
Schema extensions supported | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **SCIM changes MUST be auditable and least-privilege.**
- **Idempotency MUST be enforced for create/update operations.**
- **Deprovisioning MUST not orphan privileged access.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## SCIM Enablement`
2. `## Resources Supported`
3. `## Operations Supported`
4. `## Auth`
5. `## Attribute Mapping`
6. `## Group Membership Handling`
7. `## Idempotency`
8. `## Deprovisioning`
9. `## Rate Limits`
10. `## Failure Handling`

## 8. Cross-References

- **Upstream: {{xref:SSO-01}}, {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SSO-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
