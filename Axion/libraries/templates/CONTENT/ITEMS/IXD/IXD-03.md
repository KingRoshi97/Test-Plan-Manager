# IXD-03 — Transition Map (screen

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXD-03                                             |
| Template Type     | Design / Interaction                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring transition map (screen    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Transition Map (screen Document                         |

## 2. Purpose

Define the canonical transition behavior between screens and navigation contexts. This ensures
consistent mental model, supports accessibility (reduced motion), and avoids ad-hoc transition
choices in implementation.

## 3. Inputs Required

- ● DES-02: {{xref:DES-02}}
- ● IAN-01: {{xref:IAN-01}} | OPTIONAL
- ● IAN-02: {{xref:IAN-02}} | OPTIONAL
- ● IXD-02: {{xref:IXD-02}}
- ● DSYS-01: {{xref:DSYS-01}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Default transition per... | spec         | Yes             |
| Per-transition mapping:   | spec         | Yes             |
| ○ from_screen_id          | spec         | Yes             |
| ○ to_screen_id            | spec         | Yes             |
| ○ transition_type         | spec         | Yes             |
| ○ intent (why this tra... | spec         | Yes             |
| ○ duration_ms (must be... | spec         | Yes             |
| ○ reduced_motion behavior | spec         | Yes             |
| ○ interactive gesture ... | spec         | Yes             |

## 5. Optional Fields

● Platform-specific variants | OPTIONAL
● Notes | OPTIONAL

Rules
● Transition durations must comply with IXD-02 min/max.
● Reduced motion must have an equivalent (instant or minimal) transition.
● “Replace” navigation must not look like “back” navigation (avoid confusion).
● Modal transitions must respect focus rules and dismissal patterns (IXD-01).
● If DES-02 route is unknown, still map via screen_id; route mapping can be filled later.

Output Format
1) Navigation Context Defaults (required)
conte
xt

default_transiti
on_type

duration_ms

reduced_motion_beha
vior

notes

stack_ {{defaults.stack_
push
push.type}}

{{defaults.stack_pu
sh.duration}}

{{defaults.stack_push.re {{defaults.stack_
duced_motion}}
push.notes}}

stack_ {{defaults.stack_
pop
pop.type}}

{{defaults.stack_po
p.duration}}

{{defaults.stack_pop.re
duced_motion}}

{{defaults.stack_
pop.notes}}

modal
_open

{{defaults.modal
_open.type}}

{{defaults.modal_o
pen.duration}}

{{defaults.modal_open.r
educed_motion}}

{{defaults.modal_
open.notes}}

modal {{defaults.modal
_close _close.type}}

{{defaults.modal_cl
ose.duration}}

{{defaults.modal_close.r {{defaults.modal_
educed_motion}}
close.notes}}

tab_s
witch

{{defaults.tab_sw {{defaults.tab_switc
itch.type}}
h.duration}}

{{defaults.tab_switch.re
duced_motion}}

{{defaults.tab_swi
tch.notes}}

deep_
link

{{defaults.deep_l
ink.type}}

{{defaults.deep_link.red
uced_motion}}

{{defaults.deep_li
nk.notes}}

{{defaults.deep_lin
k.duration}}

2) Transition Map (required)
from_
scree
n_id

to_s
cree
n_id

contex
t

transi
tion_t
ype

intent

duratio
n_ms

reduced_
motion_be
havior

gestur
e

gestur
e_fallb
ack

notes

{{map[ {{ma
0].fro
p[0].t
m}}
o}}

{{map[
0].cont
ext}}

{{map
[0].typ
e}}

{{map[
0].inte
nt}}

{{map[0
].durati
on}}

{{map[0].re
duced_mot
ion}}

{{map[
0].gest
ure}}

{{map[0 {{map[
].fallbac 0].not
k}}
es}}

3) Exceptions (required if any)
excepti
on_id

scope
(context/route/sc
reen_pair)

description

rationale

replacement_rule

ex_01

{{exceptions[0].sc
ope}}

{{exceptions[0].des
cription}}

{{exceptions[0].ra
tionale}}

{{exceptions[0].repl
acement}}

4) Compliance Checks (required)
● All durations within bounds: {{checks.durations_within_bounds}}
● Reduced motion defined for all transitions: {{checks.reduced_motion_complete}}
● Gesture fallbacks present where gestures exist: {{checks.gesture_fallbacks_complete}}

Cross-References
● Upstream: {{xref:DES-02}}, {{xref:IXD-02}}, {{xref:IXD-01}} | OPTIONAL
● Downstream: {{xref:MOB-01}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL,
{{xref:ROUTE-*}} | OPTIONAL
● Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Define defaults per context and basic map rows.
● intermediate: Required. Add intent, reduced motion behavior, and exceptions.
● advanced: Required. Add gesture interaction and enforce compliance checks.

Unknown Handling
● UNKNOWN_ALLOWED: platform_variants, notes, exceptions (if none,
explicitly state none)
● If any transition lacks reduced_motion_behavior → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.IXD
● Pass conditions:
○ required_fields_present == true
○ defaults_present_for_all_contexts == true
○ transition_map_present == true
○ durations_within_bounds == true
○ reduced_motion_complete == true
○ gesture_fallbacks_complete == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

IXD-04

IXD-04 — Micro-interactions Spec
(hover/press/drag/feedback)
Header Block
● template_id: IXD-04
● title: Micro-interactions Spec (hover/press/drag/feedback)
● type: interaction_design_motion
● template_version: 1.0.0
● output_path: 10_app/design/IXD-04_Micro_Interactions_Spec.md
● compliance_gate_id: TMP-05.PRIMARY.IXD
● upstream_dependencies: ["IXD-01", "IXD-02", "DES-05", "DES-06", "A11YD-01"]
● inputs_required: ["IXD-01", "IXD-02", "DES-05", "DES-06", "DSYS-02", "A11YD-01",
"A11YD-02", "STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the small, repeatable interaction feedback behaviors (micro-interactions) that
communicate system state and affordances: hover, press, focus, drag, loading spinners,
success confirmations, and subtle error feedback. These must be accessible, consistent, and
implementable across platforms.

Inputs Required
● IXD-01: {{xref:IXD-01}} | OPTIONAL
● IXD-02: {{xref:IXD-02}} | OPTIONAL

● DES-05: {{xref:DES-05}} | OPTIONAL
● DES-06: {{xref:DES-06}} | OPTIONAL
● DSYS-02: {{xref:DSYS-02}} | OPTIONAL
● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
● A11YD-02: {{xref:A11YD-02}} | OPTIONAL
● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Interaction types covered (minimum: hover, press/tap, focus, drag, disabled, loading,
success, error)
● For each interaction:
○ interaction_id
○ target element types (button, list item, input, card, icon, etc.)
○ trigger (what user does / what system state)
○ visual feedback description (non-visual wording, no colors)
○ motion behavior (if any) + duration bounds compliance
○ haptic/audio (if mobile) + default off policy
○ accessibility behavior (focus, SR announcement if applicable)
○ do/don’t rules
○ reduced motion behavior
● Consistency rules (priority order if multiple micro-interactions apply)

Optional Fields

● Component-specific overrides | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Transition durations must comply with IXD-02 min/max.
- Reduced motion must have an equivalent (instant or minimal) transition.
- “Replace” navigation must not look like “back” navigation (avoid confusion).
- Modal transitions must respect focus rules and dismissal patterns (IXD-01).
- If DES-02 route is unknown, still map via screen_id; route mapping can be filled later.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Navigation Context Defaults (required)`
2. `## conte`
3. `## default_transiti`
4. `## on_type`
5. `## duration_ms`
6. `## reduced_motion_beha`
7. `## vior`
8. `## notes`
9. `## push`
10. `## push.type}}`

## 8. Cross-References

- Upstream: {{xref:DES-02}}, {{xref:IXD-02}}, {{xref:IXD-01}} | OPTIONAL
- Downstream: {{xref:MOB-01}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL,
- **{{xref:ROUTE-*}} | OPTIONAL**
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
