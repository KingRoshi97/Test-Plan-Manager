# RLB-01 — Breakpoint Definitions (sizes +

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLB-01                                             |
| Template Type     | Design / Responsive Layout                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring breakpoint definitions (sizes +    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Breakpoint Definitions (sizes + Document                         |

## 2. Purpose

Define the canonical breakpoint system (names + pixel ranges) used across web and
responsive surfaces. This document ensures consistent responsive behavior and prevents
ad-hoc breakpoint usage.

## 3. Inputs Required

- ● DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- ● DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Required Fields
- ● Breakpoint list (minimum 4 for responsive web; justify if fewer)
- ● For each breakpoint:
- ○ bp_id
- ○ name
- ○ min_width_px
- ○ max_width_px (or open-ended)
- ○ intended devices/use cases
- ● Naming convention and stability rules
- ● Orientation notes (if applicable)
- ● Density scaling policy (if applicable)
- Optional Fields
- ● Container query notes | OPTIONAL
- ● Notes | OPTIONAL
- Rules
- ● Breakpoint names must be stable; do not change semantics mid-project.
- ● Breakpoints must not overlap (except boundary edges).
- ● If mobile-native only, breakpoints may be N/A; mark explicitly.
- Output Format
- 1) Breakpoints (canonical)
- bp_id
- name
- min_width_p
- x
- max_width_p
- x
- intended_us
- e
- notes
- bp_xs
- {{bps.xs.name}}
- {{bps.xs.min}}
- {{bps.xs.max}}
- {{bps.xs.use}}
- {{bps.xs.notes}}
- bp_s
- m
- {{bps.sm.name}
- }
- {{bps.sm.min}}
- {{bps.sm.max}} {{bps.sm.use}
- }
- {{bps.sm.notes}
- }
- bp_m
- d
- {{bps.md.name}
- }
- {{bps.md.min}}
- {{bps.md.max}
- }
- {{bps.md.use}
- }
- {{bps.md.notes}
- }
- bp_lg
- {{bps.lg.name}}
- {{bps.lg.min}}
- {{bps.lg.max}}
- {{bps.lg.use}}
- {{bps.lg.notes}}
- 2) Naming & Stability Rules (required)
- ● Naming convention: {{rules.naming}}
- ● Change policy: {{rules.change_policy}}
- 3) Orientation / Density Policy (optional)
- ● Orientation handling: {{rules.orientation}} | OPTIONAL
- ● Density scaling: {{rules.density}} | OPTIONAL
- Cross-References
- ● Upstream: {{xref:DSYS-03}} | OPTIONAL
- ● Downstream: {{xref:RLB-02}}, {{xref:DSYS-05}} | OPTIONAL, {{xref:FE-01}} |
- OPTIONAL, {{xref:VAP-02}} | OPTIONAL
- ● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- ● beginner: Required. Define at least 4 breakpoints with clear ranges.
- ● intermediate: Required. Add intended use and stability rules.
- ● advanced: Required. Add orientation/density policy where relevant.
- Unknown Handling
- ● UNKNOWN_ALLOWED: orientation_policy, density_policy,
- container_query_notes, notes
- ● If breakpoint ranges overlap → block Completeness Gate.
- Completeness Gate
- ● Gate ID: TMP-05.PRIMARY.RESPONSIVE
- ● Pass conditions:
- ○ required_fields_present == true
- ○ breakpoints_count >= 4 (or justified)
- ○ breakpoint_ranges_non_overlapping == true
- ○ naming_rules_present == true
- ○ placeholder_resolution == true
- ○ no_unapproved_unknowns == true
- RLB-02
- RLB-02 — Layout Adaptation Rules (per
- breakpoint)
- Header Block
- ● template_id: RLB-02
- ● title: Layout Adaptation Rules (per breakpoint)
- ● type: responsive_layout_breakpoints
- ● template_version: 1.0.0
- ● output_path: 10_app/responsive/RLB-02_Layout_Adaptation_Rules.md
- ● compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE
- ● upstream_dependencies: ["RLB-01", "DSYS-03", "DES-03"]
- ● inputs_required: ["RLB-01", "DSYS-03", "DES-03", "IAN-01", "STANDARDS_INDEX"]
- ● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- Purpose
- Define deterministic layout adaptation rules across breakpoints: how navigation, grids, density,
- and content hierarchy change as screen size changes. This ensures responsive behavior is
- predictable and implementation-ready.
- Inputs Required
- ● RLB-01: {{xref:RLB-01}}
- ● DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- ● DES-03: {{xref:DES-03}} | OPTIONAL
- ● IAN-01: {{xref:IAN-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each breakpoint:      | spec         | Yes             |
| ○ bp_id                   | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ min_width_px            | spec         | Yes             |
| ○ max_width_px (or ope... | spec         | Yes             |
| ○ intended devices/use... | spec         | Yes             |
| Naming convention and ... | spec         | Yes             |
| Orientation notes (if ... | spec         | Yes             |
| Density scaling policy... | spec         | Yes             |

## 5. Optional Fields

● Container query notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **RLB-05 Responsive Media Rules (images/video scaling)**
- **RLB-01**
- **RLB-01 — Breakpoint Definitions (sizes +**
- **names)**
- **Header Block**
- template_id: RLB-01
- title: Breakpoint Definitions (sizes + names)
- type: responsive_layout_breakpoints
- template_version: 1.0.0
- output_path: 10_app/responsive/RLB-01_Breakpoint_Definitions.md
- compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE
- upstream_dependencies: ["DSYS-03", "DSYS-01"]
- inputs_required: ["DSYS-01", "DSYS-03", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the canonical breakpoint system (names + pixel ranges) used across web and**
- **responsive surfaces. This document ensures consistent responsive behavior and prevents**
- **ad-hoc breakpoint usage.**
- **Inputs Required**
- DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Breakpoint list (minimum 4 for responsive web; justify if fewer)
- For each breakpoint:
- **○ bp_id**
- **○ name**
- **○ min_width_px**
- **○ max_width_px (or open-ended)**
- **○ intended devices/use cases**
- Naming convention and stability rules
- Orientation notes (if applicable)
- Density scaling policy (if applicable)
- **Optional Fields**
- Container query notes | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Breakpoint names must be stable; do not change semantics mid-project.
- Breakpoints must not overlap (except boundary edges).
- If mobile-native only, breakpoints may be N/A; mark explicitly.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Breakpoints (canonical)`
2. `## bp_id`
3. `## name`
4. `## min_width_p`
5. `## max_width_p`
6. `## intended_us`
7. `## notes`
8. `## bp_xs`
9. `## bp_s`
10. `## bp_m`

## 8. Cross-References

- Upstream: {{xref:DSYS-03}} | OPTIONAL
- Downstream: {{xref:RLB-02}}, {{xref:DSYS-05}} | OPTIONAL, {{xref:FE-01}} |
- **OPTIONAL, {{xref:VAP-02}} | OPTIONAL**
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
