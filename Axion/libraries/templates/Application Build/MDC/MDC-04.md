# MDC-04 — Hardware Integration Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-04                                           |
| Template Type     | Build / Device Capabilities                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring hardware integration spec |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Hardware Integration Spec                 |

## 2. Purpose

Define the canonical failure handling and fallback behaviors for mobile device capabilities, including permission denial, hardware unavailability, OS restrictions, and transient errors. This template must be consistent with permissions UX rules and offline/degraded mode UX and must not invent fallback behaviors not present in upstream inputs.

## 3. Inputs Required

- MDC-01: `{{mdc.capabilities}}`
- MDC-02: `{{mdc.permissions_ux}}` | OPTIONAL
- CER-03: `{{cer.offline_mode}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Failure types taxonomy (denied/unavailable/offline/error) | spec | No |
| Per-capability fallback rules | MDC-01 | No |
| Permission denied behavior | MDC-02 | No |
| Hardware unavailable behavior | spec | No |
| Offline behavior (if network dependent) | CER-03 | Yes |
| User messaging/copy policy | spec | No |
| Retry rules (when to retry) | spec | No |
| Telemetry requirements | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-screen fallback variants | spec | Screen-specific overrides |
| Support contact policy | spec | Escalation rules |
| Open questions | agent | Enrichment only |

## 6. Rules

- Fallbacks MUST be safe and should preserve core app usability when possible.
- Permission denial handling MUST align to `{{xref:MDC-02}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Failure Types` — denied, unavailable, offline, error
2. `## Per-Capability Fallbacks` — Per capability: capability_id, on_temp_denied, on_perm_denied, on_unavailable, on_offline, retry_rule, copy_policy, notes, open_questions
3. `## User Messaging` — tone, safe_message_rules
4. `## Retry Rules` — retry_allowed, retry_trigger, cooldown_ms
5. `## Telemetry` — denial_metric, unavailable_metric, fields

## 8. Cross-References

- **Upstream**: MDC-01, MDC-02, SPEC_INDEX
- **Downstream**: MDC-05
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Denied/unavailable fallback basics | Required | Required | Required |
| Retry rules + telemetry mapping | Optional | Required | Required |
| Support escalation + per-screen variants | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, offline type, perm denied behavior, on_offline, retry rules, copy policy, notes, safe message rules, retry trigger/cooldown, telemetry optional metrics/fields, per-screen variants, support policy, open_questions
- If fail.error is UNKNOWN → block Completeness Gate.
- If fallbacks list is UNKNOWN → block Completeness Gate.
- If telemetry.denial_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] failure_types_defined == true
- [ ] per_capability_fallbacks_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
