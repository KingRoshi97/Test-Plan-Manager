# MPUSH-05 — Deep Link Routing (notif tap behavior)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-05                                             |
| Template Type     | Build / Push Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring deep link routing (notif tap behavior)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Deep Link Routing (notif tap behavior) Document                         |

## 2. Purpose

Define the canonical behavior when a user taps a push notification: how the payload routing
fields are parsed, how deep link routing is invoked, and how cold start vs warm start behavior
differs. This template must be consistent with payload contract and mobile routing rules and
must not invent notification targets not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MPUSH-02 Payload Contract: {{mpush.payload_contract}}
- MDL-02 Routing Rules: {{mobile.routing_rules}}
- MDL-04 Fallback Behavior: {{mobile.fallback}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Tap handling entrypoin... | spec         | Yes             |
| Routing field extracti... | spec         | Yes             |
| Cold start tap behavio... | spec         | Yes             |
| Warm start tap behavio... | spec         | Yes             |
| Auth gating on tap (lo... | spec         | Yes             |
| Invalid routing handli... | spec         | Yes             |
| Telemetry (tap events,... | spec         | Yes             |
| Analytics event fields... | spec         | Yes             |

## 5. Optional Fields

Action buttons behavior (if supported) | OPTIONAL
Badge clearing rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Tap routing MUST use MDL routing rules and deep link allowlists.
Invalid/unknown routes MUST follow MDL-04 fallback.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Handler Entrypoint
handler_module: {{handler.module}}
handler_function: {{handler.function}}
2. Routing Extraction
routing_fields_rule: {{extract.routing_fields_rule}}
campaign_fields_rule: {{extract.campaign_fields_rule}} | OPTIONAL
3. Cold Start Behavior
cold_start_flow: {{cold.flow}}
init_order: {{cold.init_order}} | OPTIONAL
4. Warm Start Behavior
warm_flow: {{warm.flow}}
navigation_mode: {{warm.navigation_mode}} (push/reset/UNKNOWN)
preserve_state: {{warm.preserve_state}} | OPTIONAL
5. Auth Gating
logged_out_behavior: {{auth.logged_out_behavior}}
return_to_rule: {{auth.return_to_rule}} | OPTIONAL
6. Invalid Routing Fallback
fallback_rule_ref: {{fallback.rule_ref}} (expected: {{xref:MDL-04}}) | OPTIONAL
invalid_payload_behavior: {{fallback.invalid_payload_behavior}}
7. Telemetry / Analytics
tap_metric: {{telemetry.tap_metric}}
route_success_metric: {{telemetry.route_success_metric}} | OPTIONAL
route_failure_metric: {{telemetry.route_failure_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
8. References
Notification catalog: {{xref:MPUSH-01}}
Payload contract: {{xref:MPUSH-02}}
Mobile routing rules: {{xref:MDL-02}}
Fallback behavior: {{xref:MDL-04}} | OPTIONAL
Cross-References
Upstream: {{xref:MPUSH-01}}, {{xref:MPUSH-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MPUSH-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define handler + cold/warm behavior + telemetry.
advanced: Required. Add action buttons/badge behavior and detailed analytics fields.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, campaign fields, init order, preserve
state, return to rule, fallback rule ref, route success/fail metrics, telemetry fields, action buttons,
badge clearing, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If handler.function is UNKNOWN → block Completeness Gate.
If extract.routing_fields_rule is UNKNOWN → block Completeness Gate.
If fallback.invalid_payload_behavior is UNKNOWN → block Completeness Gate.
If telemetry.tap_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MPUSH
Pass conditions:
required_fields_present == true
tap_handling_defined == true
routing_and_fallback_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MPUSH-06

MPUSH-06 — Abuse/Spam Controls for Notifications
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Tap routing MUST use MDL routing rules and deep link allowlists.**
- **Invalid/unknown routes MUST follow MDL-04 fallback.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Handler Entrypoint`
2. `## Routing Extraction`
3. `## Cold Start Behavior`
4. `## Warm Start Behavior`
5. `## Auth Gating`
6. `## Invalid Routing Fallback`
7. `## Telemetry / Analytics`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:MPUSH-01}}, {{xref:MPUSH-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MPUSH-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Not required.**
- **intermediate: Required. Define handler + cold/warm behavior + telemetry.**
- **advanced: Required. Add action buttons/badge behavior and detailed analytics fields.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, campaign fields, init order, preserve**
- state, return to rule, fallback rule ref, route success/fail metrics, telemetry fields, action buttons,
- badge clearing, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If handler.function is UNKNOWN → block

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
