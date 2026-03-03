# MDC-02 — Permission Request Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-02                                           |
| Template Type     | Build / Device Capabilities                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring permission request spec   |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Permission Request Spec                   |

## 2. Purpose

Define the canonical UX rules for requesting and managing mobile permissions: when to request, how to explain, how to handle denial, and how to route users to settings. This template must be consistent with capability inventory and native integration map and must not invent permissions not present in upstream inputs.

## 3. Inputs Required

- MDC-01: `{{mdc.capabilities}}`
- MOB-03: `{{mob.native_integrations}}` | OPTIONAL
- MDC-04: `{{mdc.failures}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Request timing rules (on action vs upfront) | MDC-01 | No |
| Pre-permission rationale rules | spec | No |
| Permission prompt copy policy (tone) | spec | No |
| Denial handling rules (temporary vs permanent) | spec | No |
| "Go to settings" routing rules | spec | No |
| Retry rules (when to re-ask) | spec | No |
| Per-capability permission mapping | MDC-01 | No |
| Accessibility considerations | FE-05 | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Batch permission request rules | spec | If multiple perms at once |
| OS version nuances | spec | Platform-specific differences |
| Open questions | agent | Enrichment only |

## 6. Rules

- Request least privilege; only ask when needed.
- Denial handling MUST provide fallback or clear blocked state per `{{xref:MDC-04}}` when applicable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Request Timing` — default_timing, on_action_rule, never_upfront_for
2. `## Rationale / Copy` — rationale_required, copy_tone, template_rationale_text
3. `## Denial Handling` — temporary_denial_behavior, permanent_denial_behavior, blocked_state_ui_rule
4. `## Settings Routing` — settings_deeplink_supported, settings_route_rule
5. `## Retry Rules` — when_to_retry_prompt, cooldown_ms
6. `## Per-Capability Permission Map` — Per capability: capability_id, ios_permissions, android_permissions, timing_override, rationale_copy
7. `## Accessibility` — announce_permission_dialog, focus_rules

## 8. Cross-References

- **Upstream**: MDC-01, MOB-03, SPEC_INDEX
- **Downstream**: MDC-04, MDC-05
- **Standards**: STD-UNKNOWN-HANDLING, STD-A11Y

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Timing + denial handling baseline | Required | Required | Required |
| Per-capability map + settings routing | Optional | Required | Required |
| Batching + per-OS differences | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, never upfront list, template rationale, blocked state UI, cooldown, per-capability permission details, timing overrides, rationale copy, focus rules, batching/os nuances, open_questions
- If timing.on_action_rule is UNKNOWN → block Completeness Gate.
- If settings.route_rule is UNKNOWN → block Completeness Gate.
- If per-capability map is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] timing_and_denial_rules_defined == true
- [ ] capability_permission_map_defined == true
- [ ] settings_routing_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
