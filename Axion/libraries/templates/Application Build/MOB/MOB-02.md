# MOB-02 — Platform Adaptation Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-02                                           |
| Template Type     | Build / Mobile                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring platform adaptation rules |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Platform Adaptation Rules                 |

## 2. Purpose

Define the canonical per-screen implementation binding for mobile: route/params, data dependencies, UI state handling, forms, permissions, and navigation actions. This template must be consistent with mobile navigation map and frontend state/data binding rules and must not invent screen_ids not present in upstream inputs.

## 3. Inputs Required

- MOB-01: `{{mob.nav_map}}`
- FE-03: `{{fe.state_model}}` | OPTIONAL
- FE-04: `{{fe.data_binding}}` | OPTIONAL
- FE-05: `{{fe.a11y_notes}}` | OPTIONAL
- FORM-01: `{{forms.inventory}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| screen_id (existing) | MOB-01 | No |
| route_id binding | ROUTE-01 | Yes |
| params schema ref | ROUTE-01 | Yes |
| layout shell/presentation | MOB-01 | No |
| data bindings (endpoint_ids and timing) | API | No |
| UI state handling (loading/empty/error/success) | FE-03 | No |
| primary user actions | spec | No |
| navigation actions | MOB-01 | No |
| form bindings (form_id if present) | FORM-01 | Yes |
| analytics/telemetry hooks | spec | Yes |
| accessibility notes | FE-05 | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Offline behavior notes | OFS | If offline support applies |
| Realtime subscription notes | spec | If realtime needed |
| Open questions | agent | Enrichment only |

## 6. Rules

- Must comply with MOB-01 screen registry.
- Do not introduce new screen_ids; must exist in `{{xref:MOB-01}}`/SPEC_INDEX.
- Data bindings MUST reference existing endpoint_ids (API-01/02).
- State handling MUST conform to `{{xref:FE-03}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Screen Identity` — screen_id, name, route_id, presentation, params_schema_ref
2. `## Layout & Navigation` — navigator_id, header_shown, gesture_enabled, back_behavior_ref
3. `## Data Bindings` — Per binding: endpoint_id, call_timing, params_source, cache_policy
4. `## UI State Handling` — state_model_ref, loading_ui, empty_ui, error_ui, success_ui
5. `## Primary Actions` — List of user actions
6. `## Navigation Actions` — List of navigation targets
7. `## Form Bindings` — form_ids
8. `## Accessibility Notes` — a11y_notes
9. `## Telemetry` — analytics_id, events

## 8. Cross-References

- **Upstream**: MOB-01, SPEC_INDEX
- **Downstream**: MOB-03, OFS-01
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Screen identity + state handling | Required | Required | Required |
| Endpoint bindings + navigation + forms | Optional | Required | Required |
| Offline/realtime + params schemas | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, screen name, route id, params schema ref, header/gesture/back ref, binding params/cache, empty/success UI, secondary actions, form ids, telemetry, offline/realtime notes, open_questions
- If screen.screen_id is UNKNOWN → block Completeness Gate.
- If ui.error_ui is UNKNOWN → block Completeness Gate.
- If bindings list is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] screen_ids_reference_existing == true
- [ ] data_bindings_defined == true
- [ ] ui_state_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
