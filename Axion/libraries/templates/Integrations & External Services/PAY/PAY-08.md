# PAY-08 — Fraud & Abuse Controls (risk checks, velocity limits)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-08                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring fraud & abuse controls (risk checks, velocity limits)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Fraud & Abuse Controls (risk checks, velocity limits) Document                         |

## 2. Purpose

Define the canonical fraud and abuse controls for payments: risk checks before/after charges,
velocity limits, blocklists/allowlists, manual review workflows, and enforcement actions. This
template must be consistent with general abuse detection/enforcement matrices and must not
invent enforcement capabilities not present upstream.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- PAY-04 Webhook Handling: {{pay.webhooks}} | OPTIONAL
- RLIM-03 Abuse Signals & Detection: {{rlim.signals}} | OPTIONAL
- RLIM-04 Enforcement Actions Matrix: {{rlim.actions}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Risk checks list (pre-charge/post-charge)
Velocity limits (per user/card/ip)
Provider risk signals used (AVS/CVV/3DS) if applicable
Decision outcomes (allow/deny/review)
Manual review workflow (queue, actions)
Enforcement actions (throttle/ban/disable payments)
Kill switch rules (global payments off)
False positive handling (override)
Telemetry requirements (fraud blocks, review rate)
Audit logging requirements (overrides/blocks)

Optional Fields
3DS policy | OPTIONAL
Machine risk scoring notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Fraud decisions must be explainable via reason codes (where possible).
Overrides must be permissioned and auditable.
Kill switch must exist for incident response.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Risk Checks
pre_charge_checks: {{risk.pre_charge_checks}}
post_charge_checks: {{risk.post_charge_checks}} | OPTIONAL
2. Velocity Limits
limits: {{velocity.limits}}
window_rule: {{velocity.window_rule}} | OPTIONAL
3. Provider Signals
signals_used: {{signals.used}} | OPTIONAL
3ds_policy: {{signals.threeds_policy}} | OPTIONAL
4. Decision Outcomes
outcomes: {{decision.outcomes}} (allow/deny/review/UNKNOWN)
reason_code_policy: {{decision.reason_code_policy}} | OPTIONAL
5. Manual Review
review_supported: {{review.supported}}
review_queue: {{review.queue}} | OPTIONAL
review_actions: {{review.actions}} | OPTIONAL
6. Enforcement
enforcement_ref: {{enforce.ref}} (expected: {{xref:RLIM-04}}) | OPTIONAL
payment_disable_rule: {{enforce.payment_disable_rule}}
override_allowed: {{enforce.override_allowed}} | OPTIONAL
7. Kill Switch
kill_switch_flag_ref: {{kill.flag_ref}} (expected: {{xref:FFCFG-01}}) | OPTIONAL
kill_switch_behavior: {{kill.behavior}}
8. False Positives
override_process: {{fp.override_process}} | OPTIONAL
appeals_process: {{fp.appeals_process}} | OPTIONAL
9. Telemetry
fraud_block_metric: {{telemetry.fraud_block_metric}}
review_rate_metric: {{telemetry.review_rate_metric}} | OPTIONAL
override_metric: {{telemetry.override_metric}} | OPTIONAL

10.Audit
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
11.References
Payment flows: {{xref:PAY-02}} | OPTIONAL
Webhook handling: {{xref:PAY-04}} | OPTIONAL
Abuse signals: {{xref:RLIM-03}} | OPTIONAL
Enforcement matrix: {{xref:RLIM-04}} | OPTIONAL
Feature flags: {{xref:FFCFG-01}} | OPTIONAL
Support tools: {{xref:ADMIN-02}} | OPTIONAL
Cross-References
Upstream: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define velocity limits, decision outcomes, and kill switch behavior.
intermediate: Required. Define manual review workflow and enforcement rules and telemetry.
advanced: Required. Add 3DS policy, risk scoring notes, and override/appeals rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, post-charge checks, window rule,
provider signals, 3ds policy, reason code policy, review queue/actions, enforcement ref, override
allowed, kill switch flag ref, false positive processes, optional metrics, audit fields, risk scoring,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If velocity.limits is UNKNOWN → block Completeness Gate.
If decision.outcomes is UNKNOWN → block Completeness Gate.
If enforce.payment_disable_rule is UNKNOWN → block Completeness Gate.
If kill.behavior is UNKNOWN → block Completeness Gate.
If telemetry.fraud_block_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
risk_and_velocity_defined == true
enforcement_and_kill_switch_defined == true
telemetry_defined == true
audit_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PAY-09

PAY-09 — Security & PCI Boundaries (tokenization, SAQ scope)
Header Block

## 5. Optional Fields

3DS policy | OPTIONAL
Machine risk scoring notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Fraud decisions must be explainable via reason codes (where possible).**
- **Overrides must be permissioned and auditable.**
- **Kill switch must exist for incident response.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Risk Checks`
2. `## Velocity Limits`
3. `## Provider Signals`
4. `## Decision Outcomes`
5. `## Manual Review`
6. `## Enforcement`
7. `## Kill Switch`
8. `## False Positives`
9. `## Telemetry`
10. `## Audit`

## 8. Cross-References

- **Upstream: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
