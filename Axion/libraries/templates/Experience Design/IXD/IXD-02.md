# IXD-02 — Motion Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXD-02                                             |
| Template Type     | Design / Interaction                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring motion rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Motion Rules Document                         |

## 2. Purpose

Define the system-wide motion contract: when motion is used, what it communicates, and hard
constraints to keep motion accessible, performant, and consistent. This is not a style guide for
“cool animations”—it is a behavior rulebook.

## 3. Inputs Required

- ● IXD-01: {{xref:IXD-01}}
- ● DES-05: {{xref:DES-05}} | OPTIONAL
- ● DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Motion principles (3–8)   | spec         | Yes             |
| Motion constraints:       | spec         | Yes             |
| ○ reduced motion polic... | spec         | Yes             |
| ○ duration bounds (min... | spec         | Yes             |
| ○ easing rules (allowe... | spec         | Yes             |
| Motion semantics mappi... | spec         | Yes             |
| Prohibited motion patt... | spec         | Yes             |
| Fallback behavior when... | spec         | Yes             |

## 5. Optional Fields

● Platform-specific constraints (web vs mobile) | OPTIONAL
● Component-specific motion rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(when/why/constraints)**
- **Header Block**
- template_id: IXD-02
- title: Motion Rules (when/why/constraints)
- type: interaction_design_motion
- template_version: 1.0.0
- output_path: 10_app/design/IXD-02_Motion_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.IXD
- upstream_dependencies: ["IXD-01", "DES-05", "DSYS-01", "A11YD-01"]
- inputs_required: ["IXD-01", "DES-05", "DSYS-01", "A11YD-01", "A11YD-05",
- **"STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the system-wide motion contract: when motion is used, what it communicates, and hard**
- **constraints to keep motion accessible, performant, and consistent. This is not a style guide for**
- **“cool animations”—it is a behavior rulebook.**
- **Inputs Required**
- IXD-01: {{xref:IXD-01}}
- DES-05: {{xref:DES-05}} | OPTIONAL
- DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Motion principles (3–8)
- Motion use cases (minimum: navigation transitions, state changes, feedback/affordance)
- Motion constraints:
- **○ reduced motion policy (must)**
- **○ duration bounds (min/max)**
- **○ easing rules (allowed set)**
- **○ performance constraints (avoid layout thrash, GPU-friendly guidance)**
- Motion semantics mapping (what motion means)
- Prohibited motion patterns (at least 5)
- Fallback behavior when motion is disabled
- **Optional Fields**
- Platform-specific constraints (web vs mobile) | OPTIONAL
- Component-specific motion rules | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Motion must always communicate one of: relationship, change, feedback, focus,
- **state.**
- Motion must never be the only indicator of state; pair with non-motion cues.
- Reduced-motion users must get functional equivalence (no missing affordances).
- Any motion that could induce vestibular discomfort must be disabled in reduced motion
- **mode.**
- If a rule conflicts with accessibility requirements, accessibility wins.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Motion Principles (required)`
2. `## 2) Motion Semantics (required)`
3. `## semanti`
4. `## meaning`
5. `## relations`
6. `## hip`
7. `## meaning}}`
8. `## amples}}`
9. `## not_for}}`
10. `## state_ch`

## 8. Cross-References

- Upstream: {{xref:IXD-01}}, {{xref:DES-05}} | OPTIONAL
- Downstream: {{xref:IXD-03}}, {{xref:IXD-04}}, {{xref:DSYS-02}} | OPTIONAL, {{xref:FE-}}
- **| OPTIONAL, {{xref:MOB-}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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
