# MOB-01 — Mobile Navigation Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-01                                           |
| Template Type     | Build / Mobile                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mobile navigation spec    |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Mobile Navigation Spec                    |

## 2. Purpose

Define the canonical mobile navigation structure (React Native / native-style): stacks, tabs, modals, and their relationships. Includes screen registry, navigator hierarchy, entry points, modal policy, and back behavior alignment. This template must be consistent with the route/navigation contracts and must not invent screen_ids/route_ids not present in upstream inputs.

## 3. Inputs Required

- ROUTE-01: `{{route.contract}}`
- ROUTE-02: `{{route.nav_map}}`
- ROUTE-03: `{{route.deep_link_map}}` | OPTIONAL
- ROUTE-05: `{{route.back_rules}}` | OPTIONAL
- MDL-02: `{{mobile.routing_rules}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Navigator registry (navigator_id list) | ROUTE | No |
| Navigator types (stack/tab/modal) | ROUTE | No |
| Navigator hierarchy (parent → children) | ROUTE | No |
| Screen registry (screen_id list) | ROUTE/SPEC | No |
| Screen → route_id bindings | ROUTE-01 | Yes |
| Entry points (initial route/screen) | ROUTE | No |
| Modal policy | ROUTE-05 | Yes |
| Back behavior rules binding | ROUTE-05 | No |
| Auth/role gating notes | ROUTE-04 | Yes |
| Deep link handling binding | ROUTE-03/MDL-02 | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Shared screen options (headers, gestures) | spec | Per-navigator styling defaults |
| Per-role navigator variants | spec | If multi-role nav needed |
| Open questions | agent | Enrichment only |

## 6. Rules

- Must comply with ROUTE-01 and ROUTE-02 contracts.
- Do not introduce new screen_ids/route_ids; use only existing IDs from SPEC_INDEX/ROUTE docs.
- Navigator hierarchy MUST be deterministic and acyclic.
- Back behavior MUST align with `{{xref:ROUTE-05}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Navigator Registry` — Per navigator: navigator_id, type, parent, initial_screen_id, screens, options, notes
2. `## Screen Registry (Mobile)` — Per screen: screen_id, name, route_id, navigator_id, presentation, header_shown, gesture_enabled, guards, open_questions
3. `## Entry Points` — app_initial_navigator, app_initial_screen, post_login_landing
4. `## Modal Policy` — modal_screens, modal_close_rules_ref
5. `## Back Behavior Binding` — back_rules_ref, android_back_overrides
6. `## Deep Links Binding` — deep_link_map_ref, mobile_routing_rules_ref

## 8. Cross-References

- **Upstream**: ROUTE-01, ROUTE-02, SPEC_INDEX
- **Downstream**: MOB-02, MDL-02
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Navigator hierarchy + screens | Required | Required | Required |
| Modal/back + deep link binding | Optional | Required | Required |
| Per-role variants + guards | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, options/notes, screen name, route_id, presentation, header/gesture flags, guards, post-login landing, modal close rules ref, android overrides, deep link refs, per-role variants, open_questions
- If navs list is UNKNOWN → block Completeness Gate.
- If screens list is UNKNOWN → block Completeness Gate.
- If back.rules_ref is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] navigator_registry_defined == true
- [ ] screen_registry_defined == true
- [ ] back_behavior_bound == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
