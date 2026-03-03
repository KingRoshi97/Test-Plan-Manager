# CER-01 — Error Classification

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-01                                           |
| Template Type     | Build / Error Handling                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring error classification      |
| Filled By         | Internal Agent                                   |
| Consumes          | FE-01, FE-07                                     |
| Produces          | Filled Error Classification                      |

## 2. Purpose

Define the canonical error boundary strategy for the client: where boundaries exist (global vs per-route vs per-component), what fallback UIs are used, what gets logged, and how recovery/reset works. This template must be consistent with the error handling UX rules and must not invent boundary scopes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FE-01 Route Map + Layout Spec: `{{fe.route_layout}}` | OPTIONAL
- FE-07 Error Handling UX: `{{fe.error_ux}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Boundary layers | global/app, shell, route, component |
| Placement rules | Where boundaries must be applied |
| Fallback UI rules | What is shown at each layer |
| Reset/retry rules | How user recovers |
| Logging rules | What to log on boundary hit |
| User messaging/copy policy | Safe messaging |
| Telemetry requirements | Boundary hit metrics |
| Escalation/reporting pathway | Optional |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Per-route override rules | OPTIONAL |
| Dev-mode diagnostics | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Error boundaries MUST not leak sensitive details in UI.
- Fallback UIs MUST align with `{{xref:FE-07}}` policies.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FE-01}}` | OPTIONAL, `{{xref:FE-07}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:CER-02}}`, `{{xref:CER-05}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-SECURITY]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define global boundary + fallback UI; use UNKNOWN for reporting/diagnostics. |
| intermediate | Required. Define placement rules and reset mechanism and telemetry metric. |
| advanced | Required. Add per-route overrides and strict redaction/logging policy. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, shell/route/component boundaries, component placement, route/component fallback, user actions, redaction policy, no stacktrace rule, telemetry fields, reporting fields, per-route overrides, dev diagnostics, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If layers.global_boundary is UNKNOWN → block Completeness Gate.
- If fallback.global_ui is UNKNOWN → block Completeness Gate.
- If telemetry.boundary_hit_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.CER
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] boundary_layers_defined == true
- [ ] fallback_rules_defined == true
- [ ] logging_and_telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

