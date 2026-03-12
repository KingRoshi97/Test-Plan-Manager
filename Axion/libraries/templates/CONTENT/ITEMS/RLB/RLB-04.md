# RLB-04 — Touch Target & Density Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLB-04                                             |
| Template Type     | Design / Responsive Layout                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring touch target & density rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Touch Target & Density Rules Document                         |

## 2. Purpose

Define the rules for touch target sizing, spacing, and density modes across devices so UI
remains usable on touch and pointer inputs. This prevents overly dense layouts that break
usability and accessibility.

## 3. Inputs Required

- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- ● RLB-01: {{xref:RLB-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Minimum touch target s... | spec         | Yes             |
| Minimum spacing betwee... | spec         | Yes             |
| Density modes:            | spec         | Yes             |
| ○ comfortable             | spec         | Yes             |
| ○ compact (optional)      | spec         | Yes             |
| Rules for when compact... | spec         | Yes             |
| Pointer vs touch diffe... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Per-component exceptions | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **Header Block**
- template_id: RLB-04
- title: Touch Target & Density Rules
- type: responsive_layout_breakpoints
- template_version: 1.0.0
- output_path: 10_app/responsive/RLB-04_Touch_Target_Density_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE
- upstream_dependencies: ["A11YD-01", "DSYS-03", "RLB-01"]
- inputs_required: ["A11YD-01", "DSYS-03", "RLB-01", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the rules for touch target sizing, spacing, and density modes across devices so UI**
- **remains usable on touch and pointer inputs. This prevents overly dense layouts that break**
- **usability and accessibility.**
- **Inputs Required**
- A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- RLB-01: {{xref:RLB-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Minimum touch target size rule (width/height)
- Minimum spacing between interactive targets
- Density modes:
- **○ comfortable**
- **○ compact (optional)**
- Rules for when compact mode is allowed
- Pointer vs touch differences (hover availability, hit slop)
- Verification checklist
- **Optional Fields**
- Per-component exceptions | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Touch target minimums apply regardless of theme.
- If compact mode is enabled, it must not reduce touch targets below minimum.
- Provide hit slop guidance on mobile where targets are visually small.
- Must align with DSYS spacing rules.
- **Output Format**
- **1) Minimum Target Rules (required)**
- Minimum target size: {{targets.min_size}}
- Minimum spacing: {{targets.min_spacing}}
- Hit slop guidance (mobile): {{targets.hit_slop}} | OPTIONAL
- **2) Density Modes (required)**
- **mode**
- **description**
- **allowed_surfaces**
- **constraints**
- **comforta**
- **ble**
- **{{density.comfortable.d**
- **esc}}**
- **{{density.comfortable.surf**
- **aces}}**
- **{{density.comfortable.constr**
- **aints}}**
- **compact**
- **{{density.compact.desc**
- **}}**
- **{{density.compact.surface**
- **s}}**
- **{{density.compact.constraint**
- **s}}**
- **3) Pointer vs Touch Rules (required)**
- Hover availability assumption: {{input.hover_assumption}}
- Tap vs click equivalence: {{input.tap_click_equivalence}}
- Long-press rules (if used): {{input.long_press}} | OPTIONAL
- **4) Exceptions (optional)**
- **excepti**
- **on_id**
- **component_or_**
- **screen**
- **exception**
- **rationale**
- **mitigation**
- **ex_01**
- **{{exceptions[0].t**
- **arget}}**
- **{{exceptions[0].exc**
- **eption}}**
- **{{exceptions[0].rati**
- **onale}}**
- **{{exceptions[0].mitig**
- **ation}}**
- **5) Verification Checklist (required)**
- {{verify[0]}}
- {{verify[1]}}
- {{verify[2]}}
- {{verify[3]}} | OPTIONAL
- **Cross-References**
- Upstream: {{xref:A11YD-01}} | OPTIONAL, {{xref:DSYS-03}} | OPTIONAL,
- **{{xref:RLB-01}} | OPTIONAL**
- Downstream: {{xref:RLB-05}}, {{xref:FE-}} | OPTIONAL, {{xref:MOB-}} | OPTIONAL,
- **{{xref:QA-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
- **{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- **Skill Level Requiredness Rules**
- beginner: Required. Min target + spacing + density definition.
- intermediate: Required. Add pointer vs touch rules and verification.
- advanced: Required. Add exception governance and hit slop guidance.
- **Unknown Handling**
- UNKNOWN_ALLOWED: compact_mode, exceptions, long_press_rules, notes
- If minimum target size is UNKNOWN → block Completeness Gate.
- **Completeness Gate**
- Gate ID: TMP-05.PRIMARY.RESPONSIVE
- Pass conditions:
- **○ required_fields_present == true**
- **○ min_target_rules_present == true**
- **○ density_modes_present == true**
- **○ verification_present == true**
- **○ placeholder_resolution == true**
- **○ no_unapproved_unknowns == true**
- **RLB-04**
- **RLB-04 — Touch Target & Density Rules**
- **Header Block**
- template_id: RLB-04
- title: Touch Target & Density Rules
- type: responsive_layout_breakpoints
- template_version: 1.0.0
- output_path: 10_app/responsive/RLB-04_Touch_Target_Density_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE
- upstream_dependencies: ["A11YD-01", "DSYS-03", "RLB-01"]
- inputs_required: ["A11YD-01", "DSYS-03", "RLB-01", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the rules for touch target sizing, spacing, and density modes across devices so UI**
- **remains usable on touch and pointer inputs. This prevents overly dense layouts that break**
- **usability and accessibility.**
- **Inputs Required**
- A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- RLB-01: {{xref:RLB-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Minimum touch target size rule (width/height)
- Minimum spacing between interactive targets
- Density modes:
- **○ comfortable**
- **○ compact (optional)**
- Rules for when compact mode is allowed
- Pointer vs touch differences (hover availability, hit slop)
- Verification checklist
- **Optional Fields**
- Per-component exceptions | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Touch target minimums apply re

## 7. Output Format

### Required Headings (in order)

1. `## 1) Minimum Target Rules (required)`
2. `## 2) Density Modes (required)`
3. `## mode`
4. `## description`
5. `## allowed_surfaces`
6. `## constraints`
7. `## comforta`
8. `## ble`
9. `## esc}}`
10. `## aces}}`

## 8. Cross-References

- Upstream: {{xref:A11YD-01}} | OPTIONAL, {{xref:DSYS-03}} | OPTIONAL,
- **{{xref:RLB-01}} | OPTIONAL**
- Downstream: {{xref:RLB-05}}, {{xref:FE-}} | OPTIONAL, {{xref:MOB-}} | OPTIONAL,
- **{{xref:QA-02}} | OPTIONAL**
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
