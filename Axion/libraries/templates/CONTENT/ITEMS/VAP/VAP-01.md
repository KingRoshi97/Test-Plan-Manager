# VAP-01 — Asset Inventory (logos, icons,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | VAP-01                                             |
| Template Type     | Design / Visual Assets                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring asset inventory (logos, icons,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Asset Inventory (logos, icons, Document                         |

## 2. Purpose

Create the canonical inventory of visual assets required for the product (logos, icons,
illustrations, images, animations). This inventory drives deterministic production, export, naming,
and handoff so implementation does not invent assets.

## 3. Inputs Required

- ● DSYS-04: {{xref:DSYS-04}} | OPTIONAL
- ● CDX-03: {{xref:CDX-03}} | OPTIONAL
- ● DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- ● IAN-01: {{xref:IAN-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Asset list (minimum 20 for non-trivial products; justify if smaller)
● For each asset:
○ asset_id
○ asset_type (logo/icon/illustration/photo/animation)
○ name
○ purpose/where used (screen_id/component_id)
○ required sizes (px) and densities (1x/2x/3x) if applicable
○ format (svg/png/webp/mp4/etc.)
○ theme variants needed (light/dark) (if applicable)
○ accessibility classification (decorative/informative)
○ alt text requirement (if informative)
○ ownership (who produces/approves)
○ status (needed/in_progress/done)
○ delivery path (output location) | OPTIONAL

## 5. Optional Fields

● Source file pointers (figma links, source repo) | OPTIONAL
● Licensing notes (for photos/icons) | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- Asset IDs must be stable and unique (asset_<slug>).
- If an asset is informative, alt text requirement must be specified.
- If multiple themes exist, required theme variants must be specified for relevant assets.
- Formats must align with DSYS-04 style rules and responsive rules (RLB-05/VAP-02).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Asset Inventory (canonical)`
2. `## typ`
3. `## used`
4. `## _in`
5. `## size`
6. `## dens`
7. `## ities`
8. `## for`
9. `## mat`
10. `## the`

## 8. Cross-References

- Upstream: {{xref:DSYS-04}} | OPTIONAL, {{xref:CDX-03}} | OPTIONAL
- Downstream: {{xref:VAP-02}}, {{xref:VAP-04}} | OPTIONAL, {{xref:RLB-05}} | OPTIONAL,
- **{{xref:FE-*}} | OPTIONAL**
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
