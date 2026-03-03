# ROUTE-01 — Route Contract

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-01                                         |
| Template Type     | Build / Routing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring route contract            |
| Filled By         | Internal Agent                                   |
| Consumes          | SPEC_INDEX                                       |
| Produces          | Filled Route Contract                            |

## 2. Purpose

Define the canonical route contract for the application: how routes are named, how paths are structured, how params and query params are typed/validated, and how route changes interact with guards. This template must be consistent with the Canonical Spec and must not invent route IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Route identifier format | route_id naming rule |
| Path format rules | Leading slash, kebab-case, nesting |
| Param naming rules | Param keys |
| Param typing rules | string/int/uuid |
| Query param rules | Allowed keys, typing |
| Optional vs required params rules | When params required |
| Route versioning/alias rules | If paths change |
| Validation rules | Reject unknown params, sanitize |
| Reserved routes | home, auth, not_found |
| Unknown route handling policy binding | ROUTE-06 |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Locale prefixes | OPTIONAL |
| Multi-tenant prefixes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Routes MUST be deterministic and parseable.
- Unknown routes MUST follow ROUTE-06 policy.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:ROUTE-02}}`, `{{xref:ROUTE-03}}`, `{{xref:ROUTE-04}}`, `{{xref:ROUTE-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-NAMING]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Use UNKNOWN for optional alias rules; define path/param rules. |
| intermediate | Required. Define query allowlist model and validation policies. |
| advanced | Required. Add versioning/deprecation and multi-tenant/locale prefix rules if applicable. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, ids examples, nesting/trailing slash rules, optional param rule, unknown query key policy, default values policy, alias rules/deprecation policy, sanitize rules, auth/forbidden route IDs, locale/tenant prefixes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If ids.route_id_format is UNKNOWN → block Completeness Gate.
- If path.case_style is UNKNOWN → block Completeness Gate.
- If unknown.policy_ref is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.ROUTE
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] route_id_and_path_rules_defined == true
- [ ] param_and_query_rules_defined == true
- [ ] unknown_route_policy_bound == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

