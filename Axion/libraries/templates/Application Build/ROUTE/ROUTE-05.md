# ROUTE-05 — Back/History Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-05                                         |
| Template Type     | Build / Routing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring back/history rules        |
| Filled By         | Internal Agent                                   |
| Consumes          | ROUTE-02, FE-01, UICP-05                         |
| Produces          | Filled Back/History Rules                        |

## 2. Purpose

Define the canonical back/history behavior across navigation stacks, tabs, and modals (web and mobile), including when back closes modals vs navigates, how deep links affect history, and how to handle edge cases like first screen back. This template must be consistent with navigation map and interaction patterns and must not invent navigation behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- ROUTE-02 Navigation Map: `{{route.nav_map}}`
- FE-01 Route Map + Layout: `{{fe.route_layout}}` | OPTIONAL
- UICP-05 Interaction Patterns: `{{ui.interaction_patterns}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Global back behavior statement | Principles |
| Modal back behavior | Close vs pop |
| Tab back behavior | Per-tab history vs reset |
| Stack back behavior | Pop rules |
| Deep link entry back behavior | How deep links affect history |
| First-screen back behavior | Exit app / confirm / go home |
| Browser back behavior (web) | Web-specific |
| Android back behavior (mobile) | Mobile-specific |
| Unsaved changes handling | Confirm on back |
| Telemetry requirements | Back events, exit events |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Custom per-route back overrides | OPTIONAL |
| Gesture back rules | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Back behavior MUST be deterministic and consistent across shells.
- Unsaved changes confirmation MUST prevent data loss.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:ROUTE-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:ROUTE-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define modal/stack/tab basics; use UNKNOWN for platform-specific details if missing. |
| intermediate | Required. Define deep-link and first-screen back behavior and unsaved changes confirmation. |
| advanced | Required. Add per-route overrides, gesture rules, and telemetry fields. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, modal stack rule, tab reselect/reset rules, root back rule, deep initial stack, confirm copy, web/android rules, confirm copy policy, telemetry fields, overrides/gesture rules, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If first.back_behavior is UNKNOWN → block Completeness Gate.
- If unsaved.confirm_on_back is UNKNOWN → block Completeness Gate.
- If telemetry.back_event_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.ROUTE
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] global_principles_defined == true
- [ ] modal_tab_stack_rules_defined == true
- [ ] unsaved_changes_rules_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

