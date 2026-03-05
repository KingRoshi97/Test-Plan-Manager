# MOB-02 — Screen Implementation Spec (per screen binding)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-02                                             |
| Template Type     | Build / Mobile                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring screen implementation spec (per screen binding)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Screen Implementation Spec (per screen binding) Document                         |

## 2. Purpose

Define the canonical per-screen implementation binding for mobile: route/params, data
dependencies, UI state handling, forms, permissions, and navigation actions. This template
must be consistent with mobile navigation map and frontend state/data binding rules and must
not invent screen_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MOB-01 Navigation Map: {{mob.nav_map}}
- FE-03 UI State Model: {{fe.state_model}} | OPTIONAL
- FE-04 Data Binding Rules: {{fe.data_binding}} | OPTIONAL
- FE-05 Accessibility Notes: {{fe.a11y_notes}} | OPTIONAL
- FORM-01 Forms Inventory: {{forms.inventory}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

screen_id (existing)
route_id binding (if any)
params schema ref (ROUTE-01 types)
layout shell/presentation (from MOB-01)
data bindings (endpoint_ids and timing)
UI state handling (loading/empty/error/success)
primary user actions (buttons/gestures)
navigation actions (where it goes next)
form bindings (form_id if present)
analytics/telemetry hooks (optional)
accessibility notes (screen-specific)

Optional Fields
Offline behavior notes | OPTIONAL
Realtime subscription notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new screen_ids; must exist in {{xref:MOB-01}}/SPEC_INDEX.
Data bindings MUST reference existing endpoint_ids (API-01/02).
State handling MUST conform to {{xref:FE-03}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Screen Identity
screen_id: {{screen.screen_id}}
name: {{screen.name}} | OPTIONAL
route_id: {{screen.route_id}} | OPTIONAL
presentation: {{screen.presentation}}
params_schema_ref: {{screen.params_schema_ref}} | OPTIONAL
2. Layout & Navigation
navigator_id: {{screen.navigator_id}}
header_shown: {{screen.header_shown}} | OPTIONAL
gesture_enabled: {{screen.gesture_enabled}} | OPTIONAL
back_behavior_ref: {{screen.back_behavior_ref}} | OPTIONAL
3. Data Bindings
Binding
endpoint_id: {{bindings[0].endpoint_id}}
call_timing: {{bindings[0].call_timing}}
params_source: {{bindings[0].params_source}} | OPTIONAL
cache_policy: {{bindings[0].cache_policy}} | OPTIONAL
(Repeat per binding.)
4. UI State Handling
state_model_ref: {{ui.state_model_ref}} (expected: {{xref:FE-03}}) | OPTIONAL
loading_ui: {{ui.loading_ui}}
empty_ui: {{ui.empty_ui}} | OPTIONAL
error_ui: {{ui.error_ui}}
success_ui: {{ui.success_ui}} | OPTIONAL
5. Primary Actions
actions:
{{actions[0]}}
{{actions[1]}} | OPTIONAL

6. Navigation Actions
nav_actions:
{{nav_actions[0]}}
{{nav_actions[1]}} | OPTIONAL
7. Form Bindings (Optional)
form_ids: {{forms.form_ids}} | OPTIONAL
8. Accessibility Notes
a11y_notes: {{a11y.notes}}
9. Telemetry (Optional)
analytics_id: {{telemetry.analytics_id}} | OPTIONAL
events: {{telemetry.events}} | OPTIONAL
10.References
Mobile nav map: {{xref:MOB-01}}
UI state model: {{xref:FE-03}} | OPTIONAL
Data bindings: {{xref:FE-04}} | OPTIONAL
A11y notes: {{xref:FE-05}} | OPTIONAL
Forms inventory: {{xref:FORM-01}} | OPTIONAL
Cross-References
Upstream: {{xref:MOB-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MOB-03}}, {{xref:OFS-01}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define screen identity + state handling; use UNKNOWN for telemetry.
intermediate: Required. Bind endpoints and define navigation actions and form bindings.
advanced: Required. Add offline/realtime notes and consistent params schema refs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, screen name, route id, params schema
ref, header/gesture/back ref, binding params/cache, empty/success UI, secondary actions, form
ids, telemetry, offline/realtime notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If screen.screen_id is UNKNOWN → block Completeness Gate.
If ui.error_ui is UNKNOWN → block Completeness Gate.
If bindings list is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MOB
Pass conditions:
required_fields_present == true
screen_ids_reference_existing == true
data_bindings_defined == true
ui_state_defined == true

placeholder_resolution == true
no_unapproved_unknowns == true

MOB-03

MOB-03 — Native Integration Map (bridges, permissions)
Header Block

## 5. Optional Fields

Offline behavior notes | OPTIONAL
Realtime subscription notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new screen_ids; must exist in {{xref:MOB-01}}/SPEC_INDEX.
- **Data bindings MUST reference existing endpoint_ids (API-01/02).**
- **State handling MUST conform to {{xref:FE-03}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Screen Identity`
2. `## Layout & Navigation`
3. `## Data Bindings`
4. `## Binding`
5. `## (Repeat per binding.)`
6. `## UI State Handling`
7. `## Primary Actions`
8. `## actions:`
9. `## Navigation Actions`
10. `## nav_actions:`

## 8. Cross-References

- **Upstream: {{xref:MOB-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MOB-03}}, {{xref:OFS-01}} | OPTIONAL**
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
