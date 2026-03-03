# RLIM-04 — Enforcement Actions Matrix

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-04                                          |
| Template Type     | Build / Rate Limits                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring enforcement actions matri |
| Filled By         | Internal Agent                                   |
| Consumes          | RLIM-01, RLIM-03                                 |
| Produces          | Filled Enforcement Actions Matrix                |

## 2. Purpose

Define the canonical matrix of enforcement actions that can be applied when rate limiting or abuse rules trigger, including throttling, temporary blocks, bans, step-up challenges (captcha), and escalation procedures. This template must be consistent with the rate limit policy and detection rules and must not invent enforcement capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- RLIM-03 Abuse Signals & Detection Rules: {{abuse.rules}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Action catalog (action_id list) | spec | No |
| Action definitions (what the action does) | spec | No |
| Applicability (what surfaces/scopes can apply the action) | spec | No |
| Trigger bindings (which rule severities map to which actions) | spec | No |
| Duration model (fixed/variable/UNKNOWN) | spec | Yes |
| Escalation ladder (repeat offender behavior) | spec | No |
| Reversal/unban policy (who can reverse, audit required) | spec | No |
| User-facing response behavior (status codes + messages mapping) | spec | No |
| Audit/evidence requirements (record what action was applied) | spec | No |
| Safety constraints (avoid lockouts for critical principals) | spec | No |
| Observability requirements (action counts, top keys, outcomes) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Captcha/challenge provider integration notes | spec | OPTIONAL |
| Per-tenant enforcement overrides | spec | OPTIONAL |
| Manual review workflow | spec | OPTIONAL |
| Progressive trust scoring notes | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not define detection rules here; bind to {{xref:RLIM-03}}.
- Actions MUST be deterministic in effect (clear scope + duration + enforcement point).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- User-facing responses MUST map to {{xref:API-03}} | OPTIONAL
- All overrides/unbans MUST be audited (or UNKNOWN flagged).

## 7. Cross-References

- **Upstream**: {{xref:RLIM-01}}, {{xref:RLIM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RLIM-05}}, {{xref:RLIM-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN where action capabilities are not defined; do not invent integrations. | Required. Define actions, durations, and severity bindings consistent with RLIM-03. | Required. Add escalation ladder, reversal process, and safety constraints. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, duration, reversal_who, error_code, message_policy, notes, escalation_on_repeat, repeat_window, reset_rules, audit_policy, reversal_process, protected_principals, max_lockout_duration, bypass_conditions, dashboards, alerts, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If action_id is UNKNOWN → block Completeness Gate.
- If severity→action bindings are UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.RLIM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] all action_ids are unique
  - [ ] all bindings reference existing rule_ids (RLIM-03) and action_ids
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

