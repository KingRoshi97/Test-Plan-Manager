# DSYS-02 — Component Variants Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DSYS-02                                             |
| Template Type     | Design / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring component variants spec    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Component Variants Spec Document                         |

## 2. Purpose

Define the design-system component contract: which components exist, what variants they
support, what states they must handle, and what props/inputs they accept at a conceptual level.
This enables FE/MOB to implement consistently without inventing component behavior.

## 3. Inputs Required

- ● DSYS-01: {{xref:DSYS-01}}
- ● DES-04: {{xref:DES-04}} | OPTIONAL
- ● IXD-01: {{xref:IXD-01}} | OPTIONAL
- ● IXD-04: {{xref:IXD-04}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● A11YD-02: {{xref:A11YD-02}} | OPTIONAL
- ● A11YD-05: {{xref:A11YD-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Component list (minimum 12 for non-trivial products)
● For each component:
○ dsys_component_id (or component_id alignment to DES-04)
○ name
○ purpose
○ supported variants (e.g., size, style, intent)
○ required states (default/hover/active/focus/disabled/loading/error)
○ props/inputs (conceptual; name + meaning)
○ output events (onClick/onChange/etc.)
○ accessibility contract (keyboard, focus, labels, SR semantics)
○ content rules (label length, wrapping, truncation policy)
○ motion hooks (if any; reference IXD)
● Variant consistency rules (what “primary/secondary/destructive” means across
components)
● State precedence rules (disabled overrides hover, etc.)

Optional Fields
● Platform-specific differences (web/mobile) | OPTIONAL
● Deprecation/compat notes | OPTIONAL
● Notes | OPTIONAL

Rules
● Each component must declare its required states; missing states are not allowed.
● “Focus” behavior must be explicit and align with A11Y focus specs.
● Variants must be semantic (intent-driven), not “random style names.”
● Any motion hooks must respect IXD reduce-motion rules.
● Props must be stable; changes require versioning notes.

Output Format
1) Variant Semantics (required)
Define shared meaning for common variant names.
variant_
name

meaning

do

dont

primary

{{variant_semantics.primary. {{variant_semantics.pri
meaning}}
mary.do}}

{{variant_semantics.prim
ary.dont}}

seconda
ry

{{variant_semantics.second
ary.meaning}}

{{variant_semantics.sec
ondary.do}}

{{variant_semantics.seco
ndary.dont}}

destructi
ve

{{variant_semantics.destruc
tive.meaning}}

{{variant_semantics.des
tructive.do}}

{{variant_semantics.destr
uctive.dont}}

2) State Precedence Rules (required)

● disabled overrides hover/active/focus: {{state_precedence.disabled}}
● loading overrides interaction (unless cancel): {{state_precedence.loading}}
● error overrides success feedback: {{state_precedence.error}} | OPTIONAL

3) Component Contract Catalog (canonical)
co
mp
one
nt_i
d

nam
e

purp
ose

varia
nts

requi
red_
state
s

prop
s_in
puts

outp
ut_ev
ents

a11y
_con
tract

conte motio
nt_ru n_ho
les
oks

platfo
rm_n
otes

note
s

{{co
mpo
nent
s[0].
id}}

{{co
mpon
ents[
0].na
me}}

{{com
ponen
ts[0].p
urpos
e}}

{{com
ponen
ts[0].v
ariant
s}}

{{co
mpon
ents[
0].sta
tes}}

{{co
mpon
ents[
0].pr
ops}}

{{com
pone
nts[0]
.even
ts}}

{{co
mpo
nent
s[0].
a11y
}}

{{com
pone
nts[0].
conte
nt}}

{{com
pone
nts[0].
motio
n}}

{{com
ponen
ts[0].p
latfor
m}}

{{co
mpo
nents
[0].n
otes}
}

{{co
mpo
nent
s[1].
id}}

{{co
mpon
ents[
1].na
me}}

{{com
ponen
ts[1].p
urpos
e}}

{{com
ponen
ts[1].v
ariant
s}}

{{co
mpon
ents[
1].sta
tes}}

{{co
mpon
ents[
1].pr
ops}}

{{com
pone
nts[1]
.even
ts}}

{{co
mpo
nent
s[1].
a11y
}}

{{com
pone
nts[1].
conte
nt}}

{{com
pone
nts[1].
motio
n}}

{{com
ponen
ts[1].p
latfor
m}}

{{co
mpo
nents
[1].n
otes}
}

4) Coverage Checks (required)
● Components cover DES-04 inventory: {{coverage.covers_des04}} | OPTIONAL
● Required states present for all components: {{coverage.states_complete}}
● A11y contract present for all interactive components: {{coverage.a11y_complete}}

Cross-References
● Upstream: {{xref:DSYS-01}}, {{xref:DES-04}} | OPTIONAL

● Downstream: {{xref:FE-02}} | OPTIONAL, {{xref:FE-06}} | OPTIONAL, {{xref:MOB-*}} |
OPTIONAL, {{xref:QA-02}} | OPTIONAL
● Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Define component list + variants + required states.
● intermediate: Required. Add props/events and state precedence.
● advanced: Required. Add a11y contracts, content rules, and motion hooks.

Unknown Handling
● UNKNOWN_ALLOWED: platform_notes, deprecation_notes, notes,
motion_hooks (if none)
● If any interactive component lacks a11y_contract → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.DSYS
● Pass conditions:
○ required_fields_present == true
○ components_count >= 12
○ required_states_complete == true
○ a11y_contract_complete == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

DSYS-03

DSYS-03 — Layout Grid & Spacing Rules
Header Block
● template_id: DSYS-03
● title: Layout Grid & Spacing Rules
● type: design_system_tokens
● template_version: 1.0.0
● output_path: 10_app/design_system/DSYS-03_Layout_Grid_Spacing_Rules.md
● compliance_gate_id: TMP-05.PRIMARY.DSYS
● upstream_dependencies: ["DSYS-01", "RLB-01"]
● inputs_required: ["DSYS-01", "RLB-01", "RLB-02", "A11YD-01", "STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the system-wide layout and spacing rules so screens and components align to a
consistent grid and density model across breakpoints. This prevents arbitrary spacing and
ensures predictable responsive behavior.

Inputs Required
● DSYS-01: {{xref:DSYS-01}}
● RLB-01: {{xref:RLB-01}} | OPTIONAL
● RLB-02: {{xref:RLB-02}} | OPTIONAL
● A11YD-01: {{xref:A11YD-01}} | OPTIONAL

● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Grid model definition (web and/or mobile)
○ columns (if applicable)
○ gutters
○ margins/containers
○ baseline spacing unit
● Spacing scale usage rules (tie to DSYS-01 spacing tokens)
● Density rules (comfortable/compact) if applicable
● Alignment rules (edges, baselines, centers) and when to use each
● Common layout patterns (list/detail, cards, forms, dashboards)
● Touch target spacing rules (must align with A11Y/touch guidance)
● Exceptions policy (when breaking grid is allowed)

## 5. Optional Fields

● Platform-specific differences (web/mobile) | OPTIONAL
● Deprecation/compat notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Each component must declare its required states; missing states are not allowed.
- “Focus” behavior must be explicit and align with A11Y focus specs.
- Variants must be semantic (intent-driven), not “random style names.”
- Any motion hooks must respect IXD reduce-motion rules.
- Props must be stable; changes require versioning notes.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Variant Semantics (required)`
2. `## Define shared meaning for common variant names.`
3. `## variant_`
4. `## name`
5. `## meaning`
6. `## dont`
7. `## primary`
8. `## meaning}}`
9. `## mary.do}}`
10. `## ary.dont}}`

## 8. Cross-References

- Upstream: {{xref:DSYS-01}}, {{xref:DES-04}} | OPTIONAL
- Downstream: {{xref:FE-02}} | OPTIONAL, {{xref:FE-06}} | OPTIONAL, {{xref:MOB-*}} |
- **OPTIONAL, {{xref:QA-02}} | OPTIONAL**
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
