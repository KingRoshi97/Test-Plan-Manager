# MOB-01 — Navigation Map (stacks/tabs/modals)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-01                                             |
| Template Type     | Build / Mobile                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring navigation map (stacks/tabs/modals)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Navigation Map (stacks/tabs/modals) Document                         |

## 2. Purpose

Define the canonical mobile navigation structure (React Native / native-style): stacks, tabs,
modals, and their relationships. Includes screen registry, navigator hierarchy, entry points,
modal policy, and back behavior alignment. This template must be consistent with the
route/navigation contracts and must not invent screen_ids/route_ids not present in upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-01 Route Contract: {{route.contract}}
- ROUTE-02 Navigation Map: {{route.nav_map}}
- ROUTE-03 Deep Link Map: {{route.deep_link_map}} | OPTIONAL
- ROUTE-05 Back/History Rules: {{route.back_rules}} | OPTIONAL
- MDL-02 Routing Rules (mobile links): {{mobile.routing_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Navigator registry (navigator_id list)
Navigator types (stack/tab/modal)
Navigator hierarchy (parent → children)
Screen registry (screen_id list)
Screen → route_id bindings (if used)
Entry points (initial route/screen per navigator)
Modal policy (which screens are modal)
Back behavior rules binding (ROUTE-05)
Auth/role gating notes (ROUTE-04 binding)
Deep link handling binding (ROUTE-03/MDL-02)

Optional Fields
Shared screen options (headers, gestures) | OPTIONAL
Per-role navigator variants | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new screen_ids/route_ids; use only existing IDs from SPEC_INDEX/ROUTE
docs.
Navigator hierarchy MUST be deterministic and acyclic.
Back behavior MUST align with {{xref:ROUTE-05}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Navigator Registry
Navigator
navigator_id: {{navs[0].navigator_id}}
type: {{navs[0].type}} (stack/tab/modal/UNKNOWN)
parent_navigator_id: {{navs[0].parent_navigator_id}} | OPTIONAL
initial_screen_id: {{navs[0].initial_screen_id}}
screens: {{navs[0].screens}}
options: {{navs[0].options}} | OPTIONAL
notes: {{navs[0].notes}} | OPTIONAL
(Repeat per navigator_id.)
2. Screen Registry (Mobile)
Screen
screen_id: {{screens[0].screen_id}}
name: {{screens[0].name}} | OPTIONAL
route_id: {{screens[0].route_id}} | OPTIONAL
navigator_id: {{screens[0].navigator_id}}
presentation: {{screens[0].presentation}} (push/modal/transparent_modal/UNKNOWN)
header_shown: {{screens[0].header_shown}} | OPTIONAL
gesture_enabled: {{screens[0].gesture_enabled}} | OPTIONAL
guards:
auth_required: {{screens[0].guards.auth_required}} | OPTIONAL
role_gates: {{screens[0].guards.role_gates}} | OPTIONAL
feature_flag_gate: {{screens[0].guards.feature_flag_gate}} | OPTIONAL
open_questions:
{{screens[0].open_questions[0]}} | OPTIONAL
(Repeat per screen_id.)

3. Entry Points
app_initial_navigator: {{entry.app_initial_navigator}}
app_initial_screen: {{entry.app_initial_screen}}
post_login_landing: {{entry.post_login_landing}} | OPTIONAL
4. Modal Policy
modal_screens: {{modal.screens}}
modal_close_rules_ref: {{modal.close_rules_ref}} (expected: {{xref:ROUTE-05}}) |
OPTIONAL
5. Back Behavior Binding
back_rules_ref: {{back.rules_ref}} (expected: {{xref:ROUTE-05}})
android_back_overrides: {{back.android_overrides}} | OPTIONAL
6. Deep Links Binding
deep_link_map_ref: {{deep.ref}} (expected: {{xref:ROUTE-03}}) | OPTIONAL
mobile_routing_rules_ref: {{deep.mobile_rules_ref}} (expected: {{xref:MDL-02}}) |
OPTIONAL
7. References
Route contract: {{xref:ROUTE-01}}
Navigation map: {{xref:ROUTE-02}}
Back/history rules: {{xref:ROUTE-05}} | OPTIONAL
Deep link map: {{xref:ROUTE-03}} | OPTIONAL
Guard rules: {{xref:ROUTE-04}} | OPTIONAL
Mobile deep link routing: {{xref:MDL-02}} | OPTIONAL
Cross-References
Upstream: {{xref:ROUTE-01}}, {{xref:ROUTE-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MOB-02}}, {{xref:MDL-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define navigator hierarchy and screen registry; use UNKNOWN for
options/guards if missing.
intermediate: Required. Bind modal/back behavior and deep link routing.
advanced: Required. Add per-role variants and deterministic guard bindings for all screens.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, options/notes, screen name, route_id,
presentation, header/gesture flags, guards, post-login landing, modal close rules ref, android
overrides, deep link refs, per-role variants, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If navs list is UNKNOWN → block Completeness Gate.
If screens list is UNKNOWN → block Completeness Gate.
If back.rules_ref is UNKNOWN → block Completeness Gate.

Completeness Gate
Gate ID: TMP-05.PRIMARY.MOB
Pass conditions:
required_fields_present == true
navigator_registry_defined == true
screen_registry_defined == true
back_behavior_bound == true
placeholder_resolution == true
no_unapproved_unknowns == true

MOB-02

MOB-02 — Screen Implementation Spec (per screen binding)
Header Block

## 5. Optional Fields

Shared screen options (headers, gestures) | OPTIONAL
Per-role navigator variants | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new screen_ids/route_ids; use only existing IDs from SPEC_INDEX/ROUTE
- **docs.**
- **Navigator hierarchy MUST be deterministic and acyclic.**
- **Back behavior MUST align with {{xref:ROUTE-05}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Navigator Registry`
2. `## Navigator`
3. `## (Repeat per navigator_id.)`
4. `## Screen Registry (Mobile)`
5. `## Screen`
6. `## guards:`
7. `## open_questions:`
8. `## (Repeat per screen_id.)`
9. `## Entry Points`
10. `## Modal Policy`

## 8. Cross-References

- **Upstream: {{xref:ROUTE-01}}, {{xref:ROUTE-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MOB-02}}, {{xref:MDL-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
