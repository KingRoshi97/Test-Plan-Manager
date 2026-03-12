# ROUTE-06 — Link Validation & Unknown Handling (fallback routes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-06                                             |
| Template Type     | Build / Routing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring link validation & unknown handling (fallback routes)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Link Validation & Unknown Handling (fallback routes) Document                         |

## 2. Purpose

Define the canonical rules for validating links (internal + deep links) and handling unknown
routes/invalid params safely, including fallback routing, safe error screens, and telemetry. This
template must be consistent with route and guard rules and must not invent fallback routes not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-01 Route Contract: {{route.contract}}
- ROUTE-03 Deep Link Map: {{route.deep_link_map}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Internal link validati... | spec         | Yes             |
| Unknown route handling... | spec         | Yes             |
| Invalid param handling... | spec         | Yes             |
| Forbidden route handli... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Security constraints (... | spec         | Yes             |
| User copy policy (safe... | spec         | Yes             |

## 5. Optional Fields

Recovery suggestions UX | OPTIONAL
Per-route custom fallback | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Unknown routes MUST be handled safely and deterministically.
Do not allow open redirects or arbitrary URL navigation.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Internal Link Validation
route_id_check: {{internal.route_id_check}}
params_validation: {{internal.params_validation}}
query_validation: {{internal.query_validation}} | OPTIONAL
2. Deep Link Validation
allowlisted_domains: {{deep.allowlisted_domains}} | OPTIONAL
allowlisted_schemes: {{deep.allowlisted_schemes}} | OPTIONAL
param_parsing_rules: {{deep.param_parsing_rules}}
signature_validation: {{deep.signature_validation}} | OPTIONAL
3. Unknown Route Handling
unknown_route_behavior: {{unknown.behavior}}
not_found_route_id: {{unknown.not_found_route_id}}
4. Invalid Param Handling
invalid_param_behavior: {{invalid.behavior}}
fallback_route_id: {{invalid.fallback_route_id}} | OPTIONAL
5. Forbidden Handling
forbidden_behavior: {{forbidden.behavior}} (403_route/404_hide/UNKNOWN)
forbidden_route_id: {{forbidden.route_id}} | OPTIONAL
6. Telemetry
unknown_route_metric: {{telemetry.unknown_route_metric}}
invalid_param_metric: {{telemetry.invalid_param_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
7. Security Constraints
no_open_redirects_rule: {{security.no_open_redirects_rule}}
external_navigation_policy: {{security.external_navigation_policy}} | OPTIONAL
8. Copy Policy
safe_copy_rules: {{copy.safe_copy_rules}}
support_contact_policy: {{copy.support_contact_policy}} | OPTIONAL
9. References
Route contract: {{xref:ROUTE-01}}
Deep link map: {{xref:ROUTE-03}} | OPTIONAL
Guard rules: {{xref:ROUTE-04}} | OPTIONAL
Back/history: {{xref:ROUTE-05}} | OPTIONAL
Cross-References
Upstream: {{xref:ROUTE-01}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:FE-01}} | OPTIONAL
Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define not_found behavior + telemetry; use UNKNOWN for signature rules.
intermediate: Required. Define deep link param parsing + forbidden handling.
advanced: Required. Add per-route fallbacks and robust security constraints.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, query validation, allowlisted
domains/schemes, signature validation, fallback route, forbidden route id, telemetry fields,
external nav policy, support contact policy, recovery suggestions, per-route custom fallback,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If unknown.not_found_route_id is UNKNOWN → block Completeness Gate.
If telemetry.unknown_route_metric is UNKNOWN → block Completeness Gate.
If security.no_open_redirects_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ROUTE
Pass conditions:
required_fields_present == true
validation_rules_defined == true
unknown_and_invalid_handling_defined == true
telemetry_defined ==

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Unknown routes MUST be handled safely and deterministically.**
- Do not allow open redirects or arbitrary URL navigation.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Internal Link Validation`
2. `## Deep Link Validation`
3. `## Unknown Route Handling`
4. `## Invalid Param Handling`
5. `## Forbidden Handling`
6. `## Telemetry`
7. `## Security Constraints`
8. `## Copy Policy`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:ROUTE-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FE-01}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
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
