# MDC-02 — Permissions UX Rules (prompts, denial handling)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-02                                             |
| Template Type     | Build / Mobile Capabilities                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring permissions ux rules (prompts, denial handling)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Permissions UX Rules (prompts, denial handling) Document                         |

## 2. Purpose

Define the canonical UX rules for requesting and managing mobile permissions: when to
request, how to explain, how to handle denial, and how to route users to settings. This template
must be consistent with capability inventory and native integration map and must not invent
permissions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDC-01 Capabilities Inventory: {{mdc.capabilities}}
- MOB-03 Native Integration Map: {{mob.native_integrations}} | OPTIONAL
- MDC-04 Capability Failure Handling: {{mdc.failures}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Request timing rules (... | spec         | Yes             |
| Pre-permission rationa... | spec         | Yes             |
| Permission prompt copy... | spec         | Yes             |
| Denial handling rules ... | spec         | Yes             |
| “Go to settings” routi... | spec         | Yes             |
| Retry rules (when to r... | spec         | Yes             |
| Accessibility consider... | spec         | Yes             |

## 5. Optional Fields

Batch permission request rules | OPTIONAL
OS version nuances | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Request least privilege; only ask when needed.
Denial handling MUST provide fallback or clear blocked state per {{xref:MDC-04}} when
applicable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Request Timing
default_timing: {{timing.default}}
on_action_rule: {{timing.on_action_rule}}
never_upfront_for: {{timing.never_upfront_for}} | OPTIONAL
2. Rationale / Copy
rationale_required: {{copy.rationale_required}}
copy_tone: {{copy.tone}}
template_rationale_text: {{copy.template_rationale_text}} | OPTIONAL
3. Denial Handling
temporary_denial_behavior: {{deny.temporary_behavior}}
permanent_denial_behavior: {{deny.permanent_behavior}}
blocked_state_ui_rule: {{deny.blocked_state_ui_rule}} | OPTIONAL
4. Settings Routing
settings_deeplink_supported: {{settings.deeplink_supported}}
settings_route_rule: {{settings.route_rule}}
5. Retry Rules
when_to_retry_prompt: {{retry.when_to_retry_prompt}}
cooldown_ms: {{retry.cooldown_ms}} | OPTIONAL
6. Per-Capability Permission Map
Map
capability_id: {{map[0].capability_id}}
ios_permissions: {{map[0].ios_permissions}} | OPTIONAL
android_permissions: {{map[0].android_permissions}} | OPTIONAL
request_timing_override: {{map[0].timing_override}} | OPTIONAL
rationale_copy: {{map[0].rationale_copy}} | OPTIONAL
(Repeat per capability_id.)
7. Accessibility
announce_permission_dialog: {{a11y.announce_permission_dialog}}
focus_rules: {{a11y.focus_rules}} | OPTIONAL
8. References
Capabilities inventory: {{xref:MDC-01}}
Failure handling: {{xref:MDC-04}} | OPTIONAL
Telemetry: {{xref:MDC-05}} | OPTIONAL

Cross-References
Upstream: {{xref:MDC-01}}, {{xref:MOB-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MDC-04}}, {{xref:MDC-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-A11Y]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define timing + denial handling baseline; use UNKNOWN for OS nuances.
intermediate: Required. Populate per-capability permission map and settings routing.
advanced: Required. Add batching policies and per-OS differences with precise rules.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, never upfront list, template rationale,
blocked state UI, cooldown, per-capability permission details, timing overrides, rationale copy,
focus rules, batching/os nuances, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If timing.on_action_rule is UNKNOWN → block Completeness Gate.
If settings.route_rule is UNKNOWN → block Completeness Gate.
If per-capability map is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MDC
Pass conditions:
required_fields_present == true
timing_and_denial_rules_defined == true
capability_permission_map_defined == true
settings_routing_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MDC-03

MDC-03 — Capability Security Rules (least privilege)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Request least privilege; only ask when needed.**
- **Denial handling MUST provide fallback or clear blocked state per {{xref:MDC-04}} when**
- **applicable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Request Timing`
2. `## Rationale / Copy`
3. `## Denial Handling`
4. `## Settings Routing`
5. `## Retry Rules`
6. `## Per-Capability Permission Map`
7. `## Map`
8. `## (Repeat per capability_id.)`
9. `## Accessibility`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MDC-01}}, {{xref:MOB-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDC-04}}, {{xref:MDC-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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
