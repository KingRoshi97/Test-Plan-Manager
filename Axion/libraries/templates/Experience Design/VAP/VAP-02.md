# VAP-02 — Export Spec (formats, sizes,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | VAP-02                                             |
| Template Type     | Design / Visual Assets                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring export spec (formats, sizes,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Export Spec (formats, sizes, Document                         |

## 2. Purpose

Define deterministic export and delivery rules for visual assets: formats, sizes, densities, naming
conventions, and folder layout. This ensures implementation can consume assets without
manual guessing or inconsistent exports.

## 3. Inputs Required

- ● VAP-01: {{xref:VAP-01}}
- ● DSYS-04: {{xref:DSYS-04}} | OPTIONAL
- ● RLB-05: {{xref:RLB-05}} | OPTIONAL
- ● DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Naming convention rule... | spec         | Yes             |
| Export formats by asse... | spec         | Yes             |
| Size rules:               | spec         | Yes             |
| ○ base size(s)            | spec         | Yes             |
| ○ responsive variants     | spec         | Yes             |
| ○ max size constraints    | spec         | Yes             |
| Density rules:            | spec         | Yes             |
| ○ which densities requ... | spec         | Yes             |
| ○ when to omit densiti... | spec         | Yes             |
| Theme variant rules (l... | spec         | Yes             |
| Verification checklist... | spec         | Yes             |

## 5. Optional Fields

● CDN/hosting notes | OPTIONAL
● Source-of-truth tool notes (Figma) | OPTIONAL
● Notes | OPTIONAL

Rules
● Export rules must match responsive media rules (RLB-05).
● SVG assets must be optimized and sanitized (no embedded raster unless allowed).
● Raster assets must meet compression targets.
● Filenames must be deterministic and consistent with asset_id mapping.

Output Format
1) Naming Rules (required)
● File naming convention: {{naming.convention}} (e.g.,
<asset_id><variant><size>@<density>.<ext>)
● Casing: {{naming.casing}}
● Separator rules: {{naming.separators}}
● Theme suffix rules: {{naming.theme_suffix}} | OPTIONAL

2) Folder Organization (required)
● Base folder: {{folders.base}}
● By type: {{folders.by_type}}
● By theme: {{folders.by_theme}} | OPTIONAL
● By feature/screen: {{folders.by_feature}} | OPTIONAL

3) Export Formats (required)
asset_t
ype
icon

preferred_formats

allowed_formats

notes

{{formats.icon.preferred}}

{{formats.icon.allowed}}

{{formats.icon.notes}}

illustrati
on

{{formats.illustration.preferr
ed}}

{{formats.illustration.allow
ed}}

{{formats.illustration.not
es}}

photo

{{formats.photo.preferred}}

{{formats.photo.allowed}}

{{formats.photo.notes}}

animatio
n

{{formats.animation.preferr
ed}}

{{formats.animation.allowe
d}}

{{formats.animation.note
s}}

4) Sizes & Densities (required)
● Base sizes policy: {{sizes.base_policy}}
● Responsive variants policy: {{sizes.responsive_policy}} | OPTIONAL
● Densities required: {{densities.required}}
● When to omit densities: {{densities.omit_when}}

5) Theme Variants (required)
● When light/dark exports required: {{themes.when_required}}
● Naming mapping for theme: {{themes.naming_mapping}} | OPTIONAL

6) Optimization Rules (required)
● Compression targets: {{opt.compression_targets}}
● Metadata stripping: {{opt.strip_metadata}}
● SVG sanitization: {{opt.svg_sanitize}} | OPTIONAL

7) Verification Checklist (required)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}}

● {{verify[3]}} | OPTIONAL

Cross-References
● Upstream: {{xref:VAP-01}}, {{xref:RLB-05}} | OPTIONAL, {{xref:DSYS-04}} | OPTIONAL
● Downstream: {{xref:VAP-04}}, {{xref:FE-*}} | OPTIONAL
● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Naming + formats + densities + folder layout.
● intermediate: Required. Add optimization rules and theme variants.
● advanced: Required. Add verification checklist and responsive variant guidance.

Unknown Handling
● UNKNOWN_ALLOWED: cdn_notes, source_tool_notes,
responsive_variants, notes
● If naming convention is UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.ASSETS
● Pass conditions:
○ required_fields_present == true
○ naming_rules_present == true
○ formats_present == true

○ densities_rules_present == true
○ optimization_rules_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

VAP-03

VAP-03 — Brand Usage Rules (do/don’t,
clearspace)
Header Block
● template_id: VAP-03
● title: Brand Usage Rules (do/don’t, clearspace)
● type: visual_asset_production
● template_version: 1.0.0
● output_path: 10_app/assets/VAP-03_Brand_Usage_Rules.md
● compliance_gate_id: TMP-05.PRIMARY.ASSETS
● upstream_dependencies: ["VAP-01", "DSYS-01", "DSYS-05"]
● inputs_required: ["VAP-01", "DSYS-01", "DSYS-05", "CDX-01", "STANDARDS_INDEX"]
● required_by_skill_le

## 6. Rules

- Export rules must match responsive media rules (RLB-05).
- SVG assets must be optimized and sanitized (no embedded raster unless allowed).
- Raster assets must meet compression targets.
- Filenames must be deterministic and consistent with asset_id mapping.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Naming Rules (required)`
2. `## <asset_id><variant><size>@<density>.<ext>)`
3. `## 2) Folder Organization (required)`
4. `## 3) Export Formats (required)`
5. `## asset_t`
6. `## ype`
7. `## icon`
8. `## preferred_formats`
9. `## allowed_formats`
10. `## notes`

## 8. Cross-References

- Upstream: {{xref:VAP-01}}, {{xref:RLB-05}} | OPTIONAL, {{xref:DSYS-04}} | OPTIONAL
- Downstream: {{xref:VAP-04}}, {{xref:FE-*}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
