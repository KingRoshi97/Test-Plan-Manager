# FORM-06 — Anti-Abuse for Forms

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-06                                          |
| Template Type     | Build / Forms                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring anti-abuse for forms      |
| Filled By         | Internal Agent                                   |
| Consumes          | FORM-01, RLIM-01, RLIM-02, RLIM-03, RLIM-04      |
| Produces          | Filled Anti-Abuse for Forms                      |

## 2. Purpose

Define the canonical anti-abuse controls for forms and form-backed endpoints, including rate limits, spam/bot defenses, validation hardening, abuse signal detection, and enforcement actions. This template must be consistent with rate limit and abuse policy and must not invent defenses not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FORM-01 Forms Inventory: `{{forms.inventory}}`
- API-01 Endpoint Catalog: `{{api.endpoint_catalog}}` | OPTIONAL
- API-02 Endpoint Specs: `{{api.endpoint_specs}}` | OPTIONAL
- RLIM-01 Rate Limit Policy: `{{rlim.policy}}`
- RLIM-02 Rate Limit Catalog: `{{rlim.catalog}}` | OPTIONAL
- RLIM-03 Abuse Signals & Detection: `{{rlim.abuse_signals}}` | OPTIONAL
- RLIM-04 Enforcement Actions: `{{rlim.actions}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Threat model summary | Spam, bots, credential stuffing if applicable |
| Rate limit bindings | Per form submit endpoints |
| Bot defense model | captcha/challenge/UNKNOWN |
| Honeypot/hidden field policy | Optional |
| Input validation hardening | Length, encoding |
| Abuse signal bindings | Which rules apply |
| Enforcement actions | Throttle/ban/challenge |
| User experience rules for anti-abuse | Copy, retries |
| Logging/audit fields for abuse events | Required fields |
| Observability requirements | Spam rate, challenge pass rate |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Per-form stricter controls | OPTIONAL |
| Geo/IP restrictions | OPTIONAL |
| Email/phone verification gating | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Anti-abuse MUST bind to RLIM policy and action matrix.
- Form submit endpoints MUST have explicit limits (or approved UNKNOWN).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FORM-01}}`, `{{xref:RLIM-01}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:ADMIN-02}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-SECURITY]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define rate limit bindings skeleton; use UNKNOWN for captcha details. |
| intermediate | Required. Bind abuse rules/actions and define validation hardening. |
| advanced | Required. Add escalation policies, per-form stricter controls, and observability/alerts rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, notes, submit_endpoint_id, limit_id_ref, scope, bot trigger/fallback rules, honeypot fields, encoding/payload limits, abuse refs, escalation policy, UX copy policies, pii redaction, dashboards, alerts, per-form controls, geo restrictions, verification gating, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If threats.list is UNKNOWN → block Completeness Gate.
- If hardening.max_field_lengths is UNKNOWN → block Completeness Gate.
- If logs.abuse_event_fields is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FORM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] rate_limit_bindings_defined == true
- [ ] validation_hardening_defined == true
- [ ] abuse_actions_bound == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

