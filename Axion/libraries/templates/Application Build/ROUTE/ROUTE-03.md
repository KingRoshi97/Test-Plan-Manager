# ROUTE-03 — Deep Link Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-03                                         |
| Template Type     | Build / Routing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring deep link map             |
| Filled By         | Internal Agent                                   |
| Consumes          | ROUTE-01, ROUTE-02                               |
| Produces          | Filled Deep Link Map                             |

## 2. Purpose

Define the canonical deep link mapping from external URLs/schemes into in-app routes/screens/actions, including parameter extraction, auth gating, safety validation, and fallback behavior. This template must be consistent with route contracts and mobile deep link rules (if applicable) and must not invent route IDs or URL patterns not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- ROUTE-01 Route Contract: `{{route.contract}}`
- ROUTE-02 Navigation Map: `{{route.nav_map}}`
- MDL-01 Link Scheme & Domains: `{{mobile.links}}` | OPTIONAL
- MDL-02 Routing Rules: `{{mobile.routing_rules}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Deep link entry registry | link_id list |
| URL pattern / scheme | https/app scheme |
| Match rules | Path params, query params |
| Target route_id/screen_id/action | Where link navigates |
| Param mapping | url → route params |
| Auth gating behavior | Logged out vs logged in |
| Safety validation | Allowlist, signature checks |
| Fallback behavior | Unknown/invalid/expired |
| Telemetry requirements | Link opens, failures |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| UTM/campaign param handling | OPTIONAL |
| Link expiry rules | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not introduce new route_ids; targets MUST exist in `{{xref:ROUTE-01}}`.
- Deep link safety MUST follow MDL rules when present.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:ROUTE-01}}`, `{{xref:ROUTE-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:ROUTE-04}}`, `{{xref:ROUTE-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define link registry skeleton; use UNKNOWN for signatures/telemetry specifics. |
| intermediate | Required. Define auth gating and safety validation and fallback behavior. |
| advanced | Required. Add signed link rules, expiry handling, and telemetry rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, scheme, target_action, telemetry, notes, allowlisted domains, signed links/signature rules, invalid param behavior, link expiry/utm handling, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If links registry is UNKNOWN → block Completeness Gate.
- If any link has UNKNOWN url_pattern or target_route_id → block Completeness Gate.
- If safety_validation is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.ROUTE
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] all target_route_ids exist in ROUTE-01
- [ ] safety_validation_defined == true
- [ ] fallback_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

