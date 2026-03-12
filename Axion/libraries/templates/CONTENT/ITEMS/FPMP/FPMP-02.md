# FPMP-02 — Storage Strategy (buckets, paths, access modes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-02                                             |
| Template Type     | Build / File Processing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring storage strategy (buckets, paths, access modes)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Storage Strategy (buckets, paths, access modes) Document                         |

## 2. Purpose

Define the canonical storage strategy for uploaded files/media, including bucket/container
layout, object key/path conventions, access modes, signed URL policies, encryption, retention,
and lifecycle rules. This template must be consistent with the upload contract and must not
invent storage capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Storage provider/surfa... | spec         | Yes             |
| Bucket/container inven... | spec         | Yes             |
| Path/key naming conven... | spec         | Yes             |
| Tenant scoping in path... | spec         | Yes             |
| Access modes (private/... | spec         | Yes             |
| Signed URL policy (who... | spec         | Yes             |
| Encryption policy (at ... | spec         | Yes             |
| Retention and lifecycl... | spec         | Yes             |
| Metadata model (what m... | spec         | Yes             |
| Versioning policy (ove... | spec         | Yes             |
| Audit requirements for... | spec         | Yes             |
| Observability requirem... | spec         | Yes             |

## 5. Optional Fields

Multi-region replication | OPTIONAL
CDN integration pointer | OPTIONAL

Cold storage tiers | OPTIONAL
Legal hold policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Paths MUST include tenant scope identifiers if multi-tenant.**
- **Access MUST default to private unless explicitly allowed.**
- **Signed URL minting MUST obey AuthZ policy ({{xref:API-04}}) | OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not store secrets; store references only.

## 7. Output Format

### Required Headings (in order)

1. `## Storage Provider`
2. `## Buckets/Containers Inventory`
3. `## Bucket`
4. `## (Repeat for each bucket_id.)`
5. `## Path / Key Naming Convention`
6. `## examples:`
7. `## Tenant Scoping`
8. `## Access Modes`
9. `## (bucket_policy/app_enforced/UNKNOWN)`
10. `## Signed URL Policy`

## 8. Cross-References

- **Upstream: {{xref:FPMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:FPMP-03}}, {{xref:FPMP-05}}, {{xref:FPMP-06}}, {{xref:FPMP-07}} |**
- OPTIONAL
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECRETS]}} | OPTIONAL, {{standards.rules[STD-SECURITY]}} |
- OPTIONAL

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
