# MDL-02 — Routing Rules (link → screen/action mapping)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-02                                             |
| Template Type     | Build / Deep Links                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring routing rules (link → screen/action mapping)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Routing Rules (link → screen/action mapping) Document                         |

## 2. Purpose

Define the canonical routing rules for mobile deep links: how matched URLs/schemes map to
screens/actions, how navigation state is constructed, and how to handle cold start vs warm
start. This template must be consistent with route/deep link maps and mobile navigation
structure and must not invent link targets not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDL-01 Scheme & Domains: {{mobile.links}}
- ROUTE-03 Deep Link Map: {{route.deep_link_map}}
- MOB-01 Mobile Navigation Map: {{mob.nav_map}}
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Routing evaluation ord... | spec         | Yes             |
| Match result format (l... | spec         | Yes             |
| Cold start routing rul... | spec         | Yes             |
| Warm start routing rul... | spec         | Yes             |
| Param mapping rules (u... | spec         | Yes             |
| Guard application (aut... | spec         | Yes             |
| Fallback handling (inv... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Deferred deep links (install then open) | OPTIONAL
Campaign param handling | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Routing MUST only navigate to allowlisted targets defined in ROUTE-03.
Guarding MUST follow ROUTE-04; do not bypass auth/role checks.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Evaluation Order
order:
{{eval.order[0]}}
{{eval.order[1]}}
{{eval.order[2]}} | OPTIONAL
2. Match Result
result_fields: {{match.result_fields}} (link_id, target_route_id, params, action/UNKNOWN)
resolution_rule: {{match.resolution_rule}} | OPTIONAL
3. Cold Start Routing
cold_start_rule: {{cold.rule}}
initial_stack_build: {{cold.initial_stack_build}} | OPTIONAL
4. Warm Start Routing
warm_start_rule: {{warm.rule}}
navigation_mode: {{warm.navigation_mode}} (push/reset/modal/UNKNOWN)
preserve_current_state: {{warm.preserve_current_state}} | OPTIONAL
5. Param Mapping
param_mapping_rule: {{params.mapping_rule}}
type_validation_rule: {{params.type_validation_rule}} | OPTIONAL
6. Guard Application
apply_auth_guard: {{guards.apply_auth_guard}}
apply_role_guard: {{guards.apply_role_guard}} | OPTIONAL
logged_out_behavior: {{guards.logged_out_behavior}} | OPTIONAL
7. Fallback Handling
unknown_link_rule: {{fallback.unknown_link_rule}}
invalid_param_rule: {{fallback.invalid_param_rule}} | OPTIONAL
8. Telemetry
routing_success_metric: {{telemetry.success_metric}}
routing_failure_metric: {{telemetry.failure_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
9. References
Scheme/domains: {{xref:MDL-01}}
Deep link map: {{xref:ROUTE-03}}
Mobile nav: {{xref:MOB-01}}
Guard rules: {{xref:ROUTE-04}} | OPTIONAL
Unknown handling: {{xref:ROUTE-06}} | OPTIONAL

Cross-References
Upstream: {{xref:MDL-01}}, {{xref:ROUTE-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MDL-03}}, {{xref:MDL-04}} | OPTIONAL
Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define eval order + cold/warm routing rules + guard application.
advanced: Required. Add deferred deep link rules and robust telemetry fields.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, eval order extras, resolution rule, initial
stack build, preserve state, type validation, role guard, logged out behavior, invalid param rule,
telemetry fields, deferred/campaign handling, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If cold.rule is UNKNOWN → block Completeness Gate.
If params.mapping_rule is UNKNOWN → block Completeness Gate.
If telemetry.success_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MDL
Pass conditions:
required_fields_present == true
routing_rules_defined == true
guards_applied == true
fallback_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MDL-03

MDL-03 — Auth Gating & Safety (signed links, validation)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Routing MUST only navigate to allowlisted targets defined in ROUTE-03.**
- **Guarding MUST follow ROUTE-04; do not bypass auth/role checks.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Evaluation Order`
2. `## order:`
3. `## Match Result`
4. `## Cold Start Routing`
5. `## Warm Start Routing`
6. `## Param Mapping`
7. `## Guard Application`
8. `## Fallback Handling`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MDL-01}}, {{xref:ROUTE-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDL-03}}, {{xref:MDL-04}} | OPTIONAL**
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
