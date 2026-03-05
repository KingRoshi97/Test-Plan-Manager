# FMS-07 — Access Control Model (ACLs, signed access, tenancy)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-07                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring access control model (acls, signed access, tenancy)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Access Control Model (ACLs, signed access, tenancy) Document                         |

## 2. Purpose

Define the canonical access control model for files/media: tenancy boundaries, ACL semantics,
signed access rules, who can read/write/delete, and how authorization is enforced across API,
storage, and CDN. This template must be consistent with AuthZ rules and secure deep link
handling.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}} | OPTIONAL
- FMS-02 Upload/Download Spec: {{fms.upload_download}}
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- CSec-05 Secure Link Handling: {{csec.deep_link_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Tenancy model (single/... | spec         | Yes             |
| Object ownership rule ... | spec         | Yes             |
| Access modes (private/... | spec         | Yes             |
| ACL model (owner, shar... | spec         | Yes             |
| Read permission rule (... | spec         | Yes             |
| Write permission rule ... | spec         | Yes             |
| Delete permission rule... | spec         | Yes             |
| Signed access issuance... | spec         | Yes             |
| Signed token TTL and s... | spec         | Yes             |
| Cross-tenant access pr... | spec         | Yes             |
| Audit requirements (ac... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Share links (time-bound) | OPTIONAL
Admin override rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Cross-tenant access must be impossible by default.**
- **Signed access must be scoped and short-lived; never grant blanket bucket access.**
- **ACL changes must be auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Tenancy & Ownership`
2. `## Access Modes`
3. `## ACL Model`
4. `## Permissions`
5. `## Signed Access`
6. `## Cross-Tenant Prevention`
7. `## Audit`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:FMS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FMS-10}} | OPTIONAL**
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
