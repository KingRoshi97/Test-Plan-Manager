# NOTIF-05 — Deliverability Rules (bounces, spam, suppression lists)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-05                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring deliverability rules (bounces, spam, suppression lists)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Deliverability Rules (bounces, spam, suppression lists) Document                         |

## 2. Purpose

Define the canonical deliverability controls for notifications (primarily email/SMS): bounce
handling, spam complaints, suppression lists, sender reputation safeguards, and re-enable
policies. This template must be consistent with provider setup and send policy, and must not
invent deliverability capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- NOTIF-04 Send Policy: {{notif.send_policy}} | OPTIONAL
- WHCP-01 Webhook Catalog (bounce/complaint events): {{whcp.catalog}} | OPTIONAL
- WHCP-03 Webhook Consumer Spec: {{whcp.inbound}} | OPTIONAL
- RLIM-03 Abuse Signals & Detection: {{rlim.signals}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Supported deliverability signals list (hard bounce, soft bounce, complaint)
Signal ingestion method (webhook/polling/UNKNOWN)
Suppression list model (global/per-channel)
Suppression triggers (what adds to suppression)
Suppression duration policy (permanent/ttl/UNKNOWN)
Re-enable policy (how user can be re-enabled)
Sender identity policy (from domains/numbers)
Content policy pointers (avoid spam patterns)
Telemetry requirements (bounce rate, complaint rate)
Alert thresholds (bounce spike)

Optional Fields
Warm-up/ramp policy | OPTIONAL
Dedicated IP policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Hard bounces/complaints must result in suppression per policy.
Deliverability events must not leak PII beyond what is needed.
Alert thresholds must be actionable and tied to runbooks.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Signals
signals_supported: {{signals.supported}}
ingestion_method: {{signals.ingestion_method}} (webhook/polling/UNKNOWN)
webhook_ref: {{signals.webhook_ref}} (expected: {{xref:WHCP-01}}) | OPTIONAL
2. Suppression Lists
model: {{suppression.model}} (global/per_channel/UNKNOWN)
list_location: {{suppression.location}} | OPTIONAL
3. Suppression Triggers
on_hard_bounce: {{suppression.on_hard_bounce}}
on_soft_bounce: {{suppression.on_soft_bounce}} | OPTIONAL
on_complaint: {{suppression.on_complaint}}
4. Suppression Duration
duration_policy: {{suppression.duration_policy}} (permanent/ttl/UNKNOWN)
ttl_days: {{suppression.ttl_days}} | OPTIONAL
5. Re-Enable Policy
reenable_supported: {{reenable.supported}}
reenable_process: {{reenable.process}}
6. Sender Identity
from_domain_policy: {{sender.from_domain_policy}} | OPTIONAL
sms_sender_policy: {{sender.sms_sender_policy}} | OPTIONAL
7. Content Policy
content_rules: {{content.rules}}
unsubscribe_requirements: {{content.unsubscribe_requirements}} | OPTIONAL
8. Telemetry
bounce_rate_metric: {{telemetry.bounce_rate_metric}}
complaint_rate_metric: {{telemetry.complaint_rate_metric}} | OPTIONAL
suppression_add_metric: {{telemetry.suppression_add_metric}} | OPTIONAL
9. Alerts
bounce_spike_alert: {{alerts.bounce_spike_alert}}
complaint_spike_alert: {{alerts.complaint_spike_alert}} | OPTIONAL

10.References
Provider inventory: {{xref:NOTIF-02}} | OPTIONAL
Send policy: {{xref:NOTIF-04}} | OPTIONAL
Preference center: {{xref:NOTIF-06}} | OPTIONAL
Failure handling: {{xref:NOTIF-09}} | OPTIONAL
Observability/runbooks: {{xref:NOTIF-10}} | OPTIONAL
Cross-References
Upstream: {{xref:NOTIF-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-06}}, {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define signals, suppression triggers, duration, and bounce rate metric.
intermediate: Required. Define re-enable process and alert thresholds and sender identity.
advanced: Required. Add warm-up/dedicated IP policy and stricter content rules and metrics.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, webhook ref, list location, soft bounce, ttl
days, sender policies, unsubscribe requirements, optional metrics, complaint alert, warm-up/ip
policy, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If signals.supported is UNKNOWN → block Completeness Gate.
If suppression.on_hard_bounce is UNKNOWN → block Completeness Gate.
If suppression.on_complaint is UNKNOWN → block Completeness Gate.
If reenable.process is UNKNOWN → block Completeness Gate.
If telemetry.bounce_rate_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
signals_and_ingestion_defined == true
suppression_rules_defined == true
reenable_defined == true
telemetry_and_alerts_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

NOTIF-06

NOTIF-06 — Preference Center & Opt-Out Rules (global/per-type)
Header Block

## 5. Optional Fields

Warm-up/ramp policy | OPTIONAL
Dedicated IP policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Hard bounces/complaints must result in suppression per policy.**
- **Deliverability events must not leak PII beyond what is needed.**
- **Alert thresholds must be actionable and tied to runbooks.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Signals`
2. `## Suppression Lists`
3. `## Suppression Triggers`
4. `## Suppression Duration`
5. `## Re-Enable Policy`
6. `## Sender Identity`
7. `## Content Policy`
8. `## Telemetry`
9. `## Alerts`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:NOTIF-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:NOTIF-06}}, {{xref:NOTIF-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
