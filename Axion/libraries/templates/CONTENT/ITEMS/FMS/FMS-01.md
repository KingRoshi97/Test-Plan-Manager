# FMS-01 — Storage Provider Inventory (by provider_id/bucket_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-01                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring storage provider inventory (by provider_id/bucket_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Storage Provider Inventory (by provider_id/bucket_id) Document                         |

## 2. Purpose

Create the single, canonical inventory of file/media storage providers and storage targets
(buckets/containers), indexed by provider_id and bucket_id, including environment scoping,
access modes, and security/compliance flags. This document must not invent provider/bucket
IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Provider registry (pro... | spec         | Yes             |
| Bucket/target registry... | spec         | Yes             |
| provider_id (stable id... | spec         | Yes             |
| bucket_id (stable iden... | spec         | Yes             |
| provider/vendor name      | spec         | Yes             |
| integration_id binding... | spec         | Yes             |
| env scope (dev/stage/p... | spec         | Yes             |
| region/location (if ap... | spec         | Yes             |
| access mode (public/pr... | spec         | Yes             |
| path prefix rules (nam... | spec         | Yes             |
| encryption flags (at r... | spec         | Yes             |
| retention/lifecycle po... | spec         | Yes             |

## 5. Optional Fields

CDN binding (FMS-04) | OPTIONAL
Replication/DR notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Buckets/targets must be environment-scoped and least-privilege.**
- Do not list secret values; reference credential policies only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Provider Entries`
3. `## Provider`
4. `## (Repeat per provider.)`
5. `## Bucket/Target Entries`
6. `## Bucket`
7. `## open_questions:`
8. `## (Repeat per bucket.)`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FMS-02}}, {{xref:FMS-05}}, {{xref:FMS-10}} | OPTIONAL**
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
