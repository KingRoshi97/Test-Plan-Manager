# ROUTE-06 — Link Validation & Unknown Handling

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-06                                         |
| Template Type     | Build / Routing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring link validation & unknown |
| Filled By         | Internal Agent                                   |
| Consumes          | ROUTE-01, ROUTE-03, ROUTE-04                     |
| Produces          | Filled Link Validation & Unknown Handling        |

## 2. Purpose

Define the canonical rules for validating links (internal + deep links) and handling unknown routes/invalid params safely, including fallback routing, safe error screens, and telemetry. This template must be consistent with route and guard rules and must not invent fallback routes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- ROUTE-01 Route Contract: `{{route.contract}}`
- ROUTE-03 Deep Link Map: `{{route.deep_link_map}}` | OPTIONAL
- ROUTE-04 Guard Rules: `{{route.guard_rules}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Internal link validation rules | route_id validity, params |
| Deep link validation rules | Scheme/domain allowlist, param parsing |
| Unknown route handling behavior | not_found route |
| Invalid param handling behavior | Fallback or error |
| Forbidden route handling behavior | 403/404/hide |
| Telemetry requirements | Unknown route hits, invalid params |
| Security constraints | No open redirects |
| User copy policy | Safe messaging |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Recovery suggestions UX | OPTIONAL |
| Per-route custom fallback | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Unknown routes MUST be handled safely and deterministically.
- Do not allow open redirects or arbitrary URL navigation.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:ROUTE-01}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:FE-01}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define not_found behavior + telemetry; use UNKNOWN for signature rules. |
| intermediate | Required. Define deep link param parsing + forbidden handling. |
| advanced | Required. Add per-route fallbacks and robust security constraints. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, query validation, allowlisted domains/schemes, signature validation, fallback route, forbidden route id, telemetry fields, external nav policy, support contact policy, recovery suggestions, per-route custom fallback, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If unknown.not_found_route_id is UNKNOWN → block Completeness Gate.
- If telemetry.unknown_route_metric is UNKNOWN → block Completeness Gate.
- If security.no_open_redirects_rule is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.ROUTE
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] validation_rules_defined == true
- [ ] unknown_and_invalid_handling_defined == true
- [ ] telemetry_defined == true
- [ ] security_constraints_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

