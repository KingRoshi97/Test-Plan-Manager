# DSYS-01 — Token Spec (color, type,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DSYS-01                                             |
| Template Type     | Design / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring token spec (color, type,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Token Spec (color, type, Document                         |

## 2. Purpose

Define the canonical design tokens used across UI implementation so styling is consistent,
themeable, and accessible. Tokens are the source of truth for UI values (not component rules),
enabling FE/MOB to implement without inventing new visual constants.

## 3. Inputs Required

- ● CDX-01: {{xref:CDX-01}} | OPTIONAL
- ● A11YD-04: {{xref:A11YD-04}} | OPTIONAL
- ● RLB-01: {{xref:RLB-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ● Existing brand palette: {{inputs.brand_palette}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Color tokens:             | spec         | Yes             |
| ○ states (hover/active... | spec         | Yes             |
| ○ theme variants (ligh... | spec         | Yes             |
| Spacing scale tokens (... | spec         | Yes             |
| Radius tokens (corner ... | spec         | Yes             |
| Focus tokens (focus ri... | spec         | Yes             |
| Token naming rules and... | spec         | Yes             |

## 5. Optional Fields

● Motion tokens (durations/easing) | OPTIONAL (may reference IXD)
● Component alias tokens (e.g., button padding) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **DSYS-04 Iconography & Illustration Rules**
- **DSYS-05 Theming Rules (light/dark, brand constraints)**
- **DSYS-01**
- **DSYS-01 — Token Spec (color, type,**
- **spacing, radius, elevation)**
- **Header Block**
- template_id: DSYS-01
- title: Token Spec (color, type, spacing, radius, elevation)
- type: design_system_tokens
- template_version: 1.0.0
- output_path: 10_app/design_system/DSYS-01_Token_Spec.md
- compliance_gate_id: TMP-05.PRIMARY.DSYS
- upstream_dependencies: ["CDX-01", "A11YD-04"]
- inputs_required: ["CDX-01", "A11YD-04", "RLB-01", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the canonical design tokens used across UI implementation so styling is consistent,**
- **themeable, and accessible. Tokens are the source of truth for UI values (not component rules),**
- **enabling FE/MOB to implement without inventing new visual constants.**
- **Inputs Required**
- CDX-01: {{xref:CDX-01}} | OPTIONAL
- A11YD-04: {{xref:A11YD-04}} | OPTIONAL
- RLB-01: {{xref:RLB-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing brand palette: {{inputs.brand_palette}} | OPTIONAL
- **Required Fields**
- Token namespaces (color/type/space/radius/elevation/border/shadow/zindex)
- Color tokens:
- **○ semantic roles (bg/surface/text/border/primary/success/warn/error)**
- **○ states (hover/active/disabled/focus)**
- **○ theme variants (light/dark if applicable)**
- Typography tokens (font families, sizes, weights, line heights)
- Spacing scale tokens (consistent step scale)
- Radius tokens (corner radii scale)
- Elevation tokens (shadows/surfaces) OR depth scale definition
- Focus tokens (focus ring width/offset/semantic color)
- Token naming rules and stability rules
- **Optional Fields**
- Motion tokens (durations/easing) | OPTIONAL (may reference IXD)
- Component alias tokens (e.g., button padding) | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Tokens must be semantic-first (meaning-based), not “random values.”
- Token names must be stable; changes are versioned and should avoid breaking
- **downstream.**
- All text and interactive tokens must meet contrast requirements (A11YD-04).
- If multiple themes exist, every semantic token must have values in each theme.
- No “magic numbers” in implementation: all UI values should reference tokens unless
- **explicitly exempt.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Token Naming Rules (required)`
2. `## 2) Color Tokens (required)`
3. `## token`
4. `## semantic`
5. `## _role`
6. `## light_valu`
7. `## dark_valu`
8. `## states`
9. `## contrast_no`
10. `## tes`

## 8. Cross-References

- Upstream: {{xref:A11YD-04}} | OPTIONAL, {{xref:RLB-01}} | OPTIONAL
- Downstream: {{xref:DSYS-02}}, {{xref:FE-06}} | OPTIONAL, {{xref:MOB-*}} | OPTIONAL
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- beginner: Required. Define core semantic tokens (primary/bg/text/border/status) +
- spacing/radius.
- intermediate: Required. Add typography and elevation; define naming rules.
- advanced: Required. Add theme coverage + focus tokens + contrast verification notes.
- Unknown Handling
- UNKNOWN_ALLOWED: motion_tokens, component_alias_tokens, notes,
- dark_theme_values (if only light theme)
- If contrast_notes are UNKNOWN for text tokens → block

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
