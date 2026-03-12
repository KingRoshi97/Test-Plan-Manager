# VAP-03 — Brand Usage Rules (do/don’t,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | VAP-03                                             |
| Template Type     | Design / Visual Assets                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring brand usage rules (do/don’t,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Brand Usage Rules (do/don’t, Document                         |

## 2. Purpose

Define the enforceable rules for brand asset usage across the product so logos and brand
visuals remain consistent, legible, and compliant. This includes clearspace, minimum sizes,
acceptable backgrounds, and do/don’t examples.

## 3. Inputs Required

- ● VAP-01: {{xref:VAP-01}} | OPTIONAL
- ● DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- ● DSYS-05: {{xref:DSYS-05}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Logo variants list (pr... | spec         | Yes             |
| For each logo variant:    | spec         | Yes             |
| ○ variant_id              | spec         | Yes             |
| ○ file reference (asse... | spec         | Yes             |
| ○ minimum size rules      | spec         | Yes             |
| ○ clearspace rules        | spec         | Yes             |
| ○ acceptable backgroun... | spec         | Yes             |
| ○ forbidden usage rules   | spec         | Yes             |
| Brand color usage rule... | spec         | Yes             |
| Typography usage rules... | spec         | Yes             |
| Do/Don’t examples (min... | spec         | Yes             |
| Approval workflow (who... | spec         | Yes             |

## 5. Optional Fields

● Co-branding rules | OPTIONAL
● Legal trademark notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Brand asset usage must not break accessibility (contrast, legibility).
- Logo must not be stretched, skewed, recolored outside allowed variants.
- Clearspace must be maintained in all placements.
- Any exception requires approval and must be logged (STK).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Logo Variants (required)`
2. `## varia`
3. `## nt_id`
4. `## asset_id`
5. `## min_size`
6. `## clearspace_`
7. `## rule`
8. `## allowed_bac`
9. `## kgrounds`
10. `## forbidden_`

## 8. Cross-References

- Upstream: {{xref:VAP-01}} | OPTIONAL, {{xref:DSYS-01}} | OPTIONAL, {{xref:DSYS-05}}
- | OPTIONAL
- Downstream: {{xref:VAP-04}} | OPTIONAL
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
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
