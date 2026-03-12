# IXD-05 — Accessibility-Safe Motion Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXD-05                                             |
| Template Type     | Design / Interaction                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring accessibility-safe motion rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Accessibility-Safe Motion Rules Document                         |

## 2. Purpose

Define the enforceable ruleset for “reduce motion” support so motion never blocks
understanding or interaction. This document turns accessibility expectations into concrete
constraints that can be implemented and tested.

## 3. Inputs Required

- ● IXD-02: {{xref:IXD-02}}
- ● IXD-03: {{xref:IXD-03}} | OPTIONAL
- ● IXD-04: {{xref:IXD-04}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Reduce-motion policy s... | spec         | Yes             |
| Detection sources (OS ... | spec         | Yes             |
| Rules for disabling/re... | spec         | Yes             |
| ○ parallax                | spec         | Yes             |
| ○ large-scale movement    | spec         | Yes             |
| ○ continuous looping a... | spec         | Yes             |
| ○ auto-play transitions   | spec         | Yes             |
| ○ motion used as feedb... | spec         | Yes             |
| Test checklist (how to... | spec         | Yes             |
| Exceptions policy (rar... | spec         | Yes             |

## 5. Optional Fields

● Per-platform implementation notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(reduce motion compliance)**
- **Header Block**
- template_id: IXD-05
- title: Accessibility-Safe Motion Rules (reduce motion compliance)
- type: interaction_design_motion
- template_version: 1.0.0
- output_path: 10_app/design/IXD-05_Reduce_Motion_Compliance.md
- compliance_gate_id: TMP-05.PRIMARY.IXD
- upstream_dependencies: ["IXD-02", "A11YD-01", "A11YD-05"]
- inputs_required: ["IXD-02", "IXD-03", "IXD-04", "A11YD-01", "A11YD-05",
- **"STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the enforceable ruleset for “reduce motion” support so motion never blocks**
- **understanding or interaction. This document turns accessibility expectations into concrete**
- **constraints that can be implemented and tested.**
- **Inputs Required**
- IXD-02: {{xref:IXD-02}}
- IXD-03: {{xref:IXD-03}} | OPTIONAL
- IXD-04: {{xref:IXD-04}} | OPTIONAL
- A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Reduce-motion policy statement (system-wide)
- Detection sources (OS setting, app toggle) and precedence
- Rules for disabling/replacing motion types:
- **○ parallax**
- **○ large-scale movement**
- **○ continuous looping animation**
- **○ auto-play transitions**
- **○ motion used as feedback (must provide alternate)**
- Allowed motion under reduce-motion (minimal fades, instant swaps, etc.)
- Test checklist (how to validate reduce-motion)
- Exceptions policy (rare, must be justified)
- **Optional Fields**
- Per-platform implementation notes | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Reduce-motion mode must preserve:
- **○ navigation clarity**
- **○ state change visibility**
- **○ feedback visibility**
- Any disallowed animation must have an explicit replacement behavior.
- If app has its own toggle, it must not override OS reduce-motion by default.
- Exceptions must be documented and mapped to approver (STK).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Policy (required)`
2. `## 2) Detection (required)`
3. `## source`
4. `## how_detected`
5. `## precedenc`
6. `## notes`
7. `## os_setting`
8. `## app_toggl`
9. `## 3) Disallowed Motion Types (required)`
10. `## motion_type`

## 8. Cross-References

- Upstream: {{xref:IXD-02}}, {{xref:A11YD-01}} | OPTIONAL
- Downstream: {{xref:QA-02}} | OPTIONAL, {{xref:RJT-*}} | OPTIONAL, {{xref:DSYS-01}} |
- OPTIONAL
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
