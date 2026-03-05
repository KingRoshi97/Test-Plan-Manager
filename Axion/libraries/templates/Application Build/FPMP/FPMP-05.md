# FPMP-05 — CDN/Delivery Rules (cache headers, variants)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-05                                             |
| Template Type     | Build / File Processing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cdn/delivery rules (cache headers, variants)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled CDN/Delivery Rules (cache headers, variants) Document                         |

## 2. Purpose

Define the canonical rules for delivering stored files/media to clients, including CDN integration,
cache headers, access patterns (signed URLs vs proxy), content variants (sizes/transcodes),
and invalidation rules. This template must be consistent with storage strategy and processing
pipelines and must not invent delivery capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.pipeline_stages}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Delivery surface (dire... | spec         | Yes             |
| Public vs private deli... | spec         | Yes             |
| Signed URL delivery ru... | spec         | Yes             |
| Cache header policy (c... | spec         | Yes             |
| Variant model (origina... | spec         | Yes             |
| Variant selection rule... | spec         | Yes             |
| URL/path rules for var... | spec         | Yes             |
| Invalidation/purge pol... | spec         | Yes             |
| Range requests support... | spec         | Yes             |
| Rate limiting/abuse co... | spec         | Yes             |

## 5. Optional Fields

Watermarking rules | OPTIONAL
Hotlink protection | OPTIONAL

Compression rules | OPTIONAL
Cross-region delivery notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Private content MUST not be cacheable in shared caches unless explicitly allowed.**
- **Variant naming MUST be deterministic and must not collide.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Delivery access control MUST align to {{xref:FPMP-02}} and {{xref:API-04}} | OPTIONAL.**

## 7. Output Format

### Required Headings (in order)

1. `## Delivery Surface`
2. `## Public vs Private Policy`
3. `## Signed URL Rules (if used)`
4. `## Cache Header Policy`
5. `## Variant Model`
6. `## Variant Selection Rules`
7. `## class, UNKNOWN)`
8. `## URL/Path Rules`
9. `## Invalidation / Purge Policy`
10. `## Range Requests / Streaming`

## 8. Cross-References

- **Upstream: {{xref:FPMP-02}}, {{xref:FPMP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FPMP-06}}, {{xref:FPMP-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
