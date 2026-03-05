# FORM-06 — Anti-Abuse for Forms (spam, throttles, bot defense)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-06                                             |
| Template Type     | Build / Forms                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring anti-abuse for forms (spam, throttles, bot defense)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Anti-Abuse for Forms (spam, throttles, bot defense) Document                         |

## 2. Purpose

Define the canonical anti-abuse controls for forms and form-backed endpoints, including rate
limits, spam/bot defenses, validation hardening, abuse signal detection, and enforcement
actions. This template must be consistent with rate limit and abuse policy and must not invent
defenses not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FORM-01 Forms Inventory: {{forms.inventory}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- RLIM-02 Rate Limit Catalog: {{rlim.catalog}} | OPTIONAL
- RLIM-03 Abuse Signals & Detection: {{rlim.abuse_signals}} | OPTIONAL
- RLIM-04 Enforcement Actions: {{rlim.actions}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Threat model summary (spam, bots, credential stuffing if applicable)
Rate limit bindings (per form submit endpoints)
Bot defense model (captcha/challenge/UNKNOWN)
Honeypot/hidden field policy (optional)
Input validation hardening (length, encoding)
Abuse signal bindings (which rules apply)
Enforcement actions (throttle/ban/challenge)
User experience rules for anti-abuse (copy, retries)
Logging/audit fields for abuse events
Observability requirements (spam rate, challenge pass rate)

Optional Fields
Per-form stricter controls | OPTIONAL
Geo/IP restrictions | OPTIONAL
Email/phone verification gating | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Anti-abuse MUST bind to RLIM policy and action matrix.
Form submit endpoints MUST have explicit limits (or approved UNKNOWN).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Threat Model
threats: {{threats.list}}
notes: {{threats.notes}} | OPTIONAL
2. Rate Limit Bindings
Binding
form_id: {{bindings[0].form_id}}
submit_endpoint_id: {{bindings[0].submit_endpoint_id}} | OPTIONAL
limit_id_ref: {{bindings[0].limit_id_ref}} (expected: {{xref:RLIM-02}}) | OPTIONAL
scope: {{bindings[0].scope}} | OPTIONAL
notes: {{bindings[0].notes}} | OPTIONAL
(Repeat per form_id.)
3. Bot Defense Model
captcha_supported: {{bot.captcha_supported}}
challenge_type: {{bot.challenge_type}} (captcha/proof_of_work/UNKNOWN)
trigger_rules: {{bot.trigger_rules}} | OPTIONAL
fallback_behavior: {{bot.fallback_behavior}} | OPTIONAL
4. Honeypot Policy (Optional)
honeypot_enabled: {{honeypot.enabled}} | OPTIONAL
honeypot_field_rules: {{honeypot.field_rules}} | OPTIONAL
5. Validation Hardening
max_field_lengths: {{hardening.max_field_lengths}}
encoding_rules: {{hardening.encoding_rules}} | OPTIONAL
payload_size_limits: {{hardening.payload_size_limits}} | OPTIONAL
6. Abuse Signals & Actions
abuse_rule_refs: {{abuse.rule_refs}} (expected: {{xref:RLIM-03}}) | OPTIONAL
action_refs: {{abuse.action_refs}} (expected: {{xref:RLIM-04}}) | OPTIONAL
escalation_policy: {{abuse.escalation_policy}} | OPTIONAL

7. User Experience Rules
challenge_copy_policy: {{ux.challenge_copy_policy}}
retry_after_copy_policy: {{ux.retry_after_copy_policy}} | OPTIONAL
lockout_copy_policy: {{ux.lockout_copy_policy}} | OPTIONAL
8. Logging / Audit
abuse_event_fields: {{logs.abuse_event_fields}}
pii_redaction: {{logs.pii_redaction}} | OPTIONAL
9. Observability Requirements
metrics:
submit_rate: {{obs.metrics.submit_rate}}
blocked_rate: {{obs.metrics.blocked_rate}} | OPTIONAL
challenge_rate: {{obs.metrics.challenge_rate}} | OPTIONAL
challenge_pass_rate: {{obs.metrics.challenge_pass_rate}} | OPTIONAL
dashboards: {{obs.dashboards}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
10.References
Forms inventory: {{xref:FORM-01}}
Rate limit policy: {{xref:RLIM-01}}
Limits catalog: {{xref:RLIM-02}} | OPTIONAL
Abuse signals: {{xref:RLIM-03}} | OPTIONAL
Actions matrix: {{xref:RLIM-04}} | OPTIONAL
Cross-References
Upstream: {{xref:FORM-01}}, {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define rate limit bindings skeleton; use UNKNOWN for captcha details.
intermediate: Required. Bind abuse rules/actions and define validation hardening.
advanced: Required. Add escalation policies, per-form stricter controls, and observability/alerts
rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, submit_endpoint_id, limit_id_ref,
scope, bot trigger/fallback rules, honeypot fields, encoding/payload limits, abuse refs, escalation
policy, UX copy policies, pii redaction, dashboards, alerts, per-form controls, geo restrictions,
verification gating, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If threats.list is UNKNOWN → block Completeness Gate.
If hardening.max_field_lengths is UNKNOWN → block Completeness Gate.
If logs.abuse_event_fields is UNKNOWN → block Completeness Gate.

Completeness Gate
Gate ID: TMP-05.PRIMARY.FORM
Pass conditions:
required_fields_present == true
rate_limit_bindings_defined == true
validation_hardening_defined == true
abuse_actions_bound == true
placeholder_resolution == true
no_unapproved_unknowns == true

Client Routing & Deep Links (ROUTE)

Client Routing & Deep Links (ROUTE)
ROUTE-01 Route Contract (paths, params, types)
ROUTE-02 Navigation Map (flows, entry points)
ROUTE-03 Deep Link Map (URLs → screens/actions)
ROUTE-04 Guard Rules (auth gating, role gating)
ROUTE-05 Back/History Rules (expected behavior)
ROUTE-06 Link Validation & Unknown Handling (fallback routes)

ROUTE-01

ROUTE-01 — Route Contract (paths, params, types)
Header Block

## 5. Optional Fields

Per-form stricter controls | OPTIONAL
Geo/IP restrictions | OPTIONAL
Email/phone verification gating | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Anti-abuse MUST bind to RLIM policy and action matrix.**
- **Form submit endpoints MUST have explicit limits (or approved UNKNOWN).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Threat Model`
2. `## Rate Limit Bindings`
3. `## Binding`
4. `## (Repeat per form_id.)`
5. `## Bot Defense Model`
6. `## Honeypot Policy (Optional)`
7. `## Validation Hardening`
8. `## Abuse Signals & Actions`
9. `## User Experience Rules`
10. `## Logging / Audit`

## 8. Cross-References

- **Upstream: {{xref:FORM-01}}, {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-02}} | OPTIONAL**
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
