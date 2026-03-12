# CER-01 — Error Boundary Strategy (global vs local)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-01                                             |
| Template Type     | Build / Client Error Recovery                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error boundary strategy (global vs local)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Boundary Strategy (global vs local) Document                         |

## 2. Purpose

Define the canonical error boundary strategy for the client: where boundaries exist (global vs
per-route vs per-component), what fallback UIs are used, what gets logged, and how
recovery/reset works. This template must be consistent with the error handling UX rules and
must not invent boundary scopes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-01 Route Map + Layout Spec: {{fe.route_layout}} | OPTIONAL
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Boundary layers (globa... | spec         | Yes             |
| Placement rules (where... | spec         | Yes             |
| Fallback UI rules (wha... | spec         | Yes             |
| Reset/retry rules (how... | spec         | Yes             |
| Logging rules (what to... | spec         | Yes             |
| User messaging/copy po... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Escalation/reporting p... | spec         | Yes             |

## 5. Optional Fields

Per-route override rules | OPTIONAL
Dev-mode diagnostics | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Error boundaries MUST not leak sensitive details in UI.
Fallback UIs MUST align with {{xref:FE-07}} policies.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Boundary Layers
global_boundary: {{layers.global_boundary}}
shell_boundaries: {{layers.shell_boundaries}} | OPTIONAL
route_boundaries: {{layers.route_boundaries}} | OPTIONAL
component_boundaries: {{layers.component_boundaries}} | OPTIONAL
2. Placement Rules
global_placement_rule: {{placement.global_rule}}
route_placement_rule: {{placement.route_rule}}
component_placement_rule: {{placement.component_rule}} | OPTIONAL
3. Fallback UI Rules
global_fallback_ui: {{fallback.global_ui}}
route_fallback_ui: {{fallback.route_ui}} | OPTIONAL
component_fallback_ui: {{fallback.component_ui}} | OPTIONAL
4. Reset / Recovery
reset_supported: {{recovery.reset_supported}}
reset_mechanism: {{recovery.reset_mechanism}}
(reload/reset_state/navigate_home/UNKNOWN)
user_actions: {{recovery.user_actions}} | OPTIONAL
5. Logging Rules
log_required_fields: {{logs.required_fields}}
redaction_policy: {{logs.redaction_policy}} | OPTIONAL
6. Messaging / Copy Policy
copy_policy: {{copy.policy}}
no_stacktrace_rule: {{copy.no_stacktrace_rule}} | OPTIONAL
7. Telemetry
boundary_hit_metric: {{telemetry.boundary_hit_metric}}
fields: {{telemetry.fields}} | OPTIONAL
8. Reporting / Escalation (Optional)
report_button_supported: {{report.supported}} | OPTIONAL
report_payload_fields: {{report.payload_fields}} | OPTIONAL
9. References
Error UX: {{xref:FE-07}} | OPTIONAL
Retry/recovery patterns: {{xref:CER-02}} | OPTIONAL
Client logging/crash reporting: {{xref:CER-05}} | OPTIONAL

Cross-References
Upstream: {{xref:FE-01}} | OPTIONAL, {{xref:FE-07}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:CER-02}}, {{xref:CER-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define global boundary + fallback UI; use UNKNOWN for
reporting/diagnostics.
intermediate: Required. Define placement rules and reset mechanism and telemetry metric.
advanced: Required. Add per-route overrides and strict redaction/logging policy.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, shell/route/component boundaries,
component placement, route/component fallback, user actions, redaction policy, no stacktrace
rule, telemetry fields, reporting fields, per-route overrides, dev diagnostics, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If layers.global_boundary is UNKNOWN → block Completeness Gate.
If fallback.global_ui is UNKNOWN → block Completeness Gate.
If telemetry.boundary_hit_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.CER
Pass conditions:
required_fields_present == true
boundary_layers_defined == true
fallback_rules_defined == true
logging_and_telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

CER-02

CER-02 — Retry & Recovery Patterns (per error class)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Error boundaries MUST not leak sensitive details in UI.**
- **Fallback UIs MUST align with {{xref:FE-07}} policies.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Boundary Layers`
2. `## Placement Rules`
3. `## Fallback UI Rules`
4. `## Reset / Recovery`
5. `## (reload/reset_state/navigate_home/UNKNOWN)`
6. `## Logging Rules`
7. `## Messaging / Copy Policy`
8. `## Telemetry`
9. `## Reporting / Escalation (Optional)`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FE-01}} | OPTIONAL, {{xref:FE-07}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:CER-02}}, {{xref:CER-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
