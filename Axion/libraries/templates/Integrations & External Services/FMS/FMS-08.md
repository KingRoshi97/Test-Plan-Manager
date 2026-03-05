# FMS-08 — Metadata & Indexing (search, tags, EXIF policy)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-08                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring metadata & indexing (search, tags, exif policy)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Metadata & Indexing (search, tags, EXIF policy) Document                         |

## 2. Purpose

Define the canonical metadata model for files/media and how that metadata is
indexed/searchable: tag fields, searchable facets, EXIF extraction/stripping policy, and privacy
constraints. This template must be consistent with canonical schemas and query contracts.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-02 Upload/Download Spec: {{fms.upload_download}}
- DATA-06 Canonical Schemas (file metadata): {{data.schemas}} | OPTIONAL
- PFS-01 Query Contract (filters/sorts): {{pfs.query_contract}} | OPTIONAL
- FPMP-03 Processing Stages (metadata extraction): {{fpmp.stages}} | OPTIONAL
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Metadata entity/schema... | spec         | Yes             |
| Tagging model (user ta... | spec         | Yes             |
| Search/index fields li... | spec         | Yes             |
| EXIF policy (strip/ret... | spec         | Yes             |
| Derived metadata extra... | spec         | Yes             |
| PII policy for metadat... | spec         | Yes             |
| Index update rules (on... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Full-text search support | OPTIONAL

Versioning of metadata schema | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **EXIF and other embedded metadata must be handled explicitly; default to stripping sensitive**
- **fields unless approved.**
- **Only allow filtering/sorting on indexed fields per PFS contract; reject unsupported queries.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Schema Binding`
2. `## Core Fields`
3. `## Tags`
4. `## Search / Index`
5. `## EXIF & Embedded Metadata`
6. `## Derived Metadata Extraction`
7. `## Index Update Rules`
8. `## PII Policy`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FMS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FMS-09}}, {{xref:FMS-10}} | OPTIONAL**
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
