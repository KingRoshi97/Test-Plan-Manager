# ROUTE-02 — Navigation Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-02                                         |
| Template Type     | Build / Routing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring navigation map            |
| Filled By         | Internal Agent                                   |
| Consumes          | ROUTE-01, SPEC_INDEX                             |
| Produces          | Filled Navigation Map                            |

## 2. Purpose

Define the canonical navigation map of the app: primary entry points, user flows, navigation graph between screens/routes, and how navigation is structured (tabs/stacks/modals). This template must be consistent with the route contract and must not invent routes/screens not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- ROUTE-01 Route Contract: `{{route.contract}}`
- FE-01 Route Map + Layout: `{{fe.route_layout}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Entry points list | route_id list |
| Primary navigation structure | tabs/sidebar/stacks |
| Flow registry | flow_id list |
| Flow steps | Ordered route_id/screen_id sequence |
| Transitions | push/replace/modal per step |
| Back behavior expectations per flow | Per flow |
| Role-based nav differences | If applicable |
| Guarded transitions | Auth required |
| Deep link entry references | ROUTE-03 |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Alternative flows (error/recovery) | OPTIONAL |
| Cross-domain shortcuts | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not introduce new route_ids/screen_ids; use only those in SPEC_INDEX / FE-01.
- Flow steps MUST be ordered and deterministic.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:ROUTE-01}}`, `{{xref:FE-01}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:ROUTE-03}}`, `{{xref:ROUTE-05}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define entry points and at least the primary flows; use UNKNOWN if role variants unclear. |
| intermediate | Required. Define transitions, back behavior, and guard notes for each step. |
| advanced | Required. Add alternative/recovery flows and role-based navigation variants with traceability. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, entry notes, nav regions, role variants, primary user, exit route, step screen_id, guard/back behavior, modal back rules, role gating rules, deep link ref, alternative flows, shortcuts, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If entry.routes is UNKNOWN → block Completeness Gate.
- If flows registry is UNKNOWN → block Completeness Gate.
- If any step route_id is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.ROUTE
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] entry_points_defined == true
- [ ] flows_defined == true
- [ ] all route_ids reference existing IDs
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

