# NOTIF-09 — Failure Handling (retries, fallback channels, DLQ)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-09                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring failure handling (retries, fallback channels, dlq)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Failure Handling (retries, fallback channels, DLQ) Document                         |

## 2. Purpose

Define the canonical failure handling for notification delivery across channels/providers: retry
eligibility, backoff, DLQ/quarantine, fallback channel rules, and operator recovery actions. This
template must be consistent with send policy, integration error handling, and job DLQ policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- NOTIF-04 Send Policy: {{notif.send_policy}} | OPTIONAL
- IXS-06 Integration Error Handling: {{ixs.error_recovery}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jobs.retry_dlq}} | OPTIONAL
- RLIM-04 Enforcement Actions Matrix: {{rlim.actions}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Failure taxonomy (provider reject, bounce, throttled, network)
Retry eligibility rules (by channel/failure)
Backoff policy + max attempts
DLQ/quarantine supported (yes/no/UNKNOWN)
DLQ trigger rules
Fallback channel rules (if primary fails)
Suppression interaction rules (do not retry suppressed)
Operator actions (resend, disable provider, rotate creds)
User impact rules (silent vs surfaced)
Telemetry requirements (retry count, DLQ depth)

Optional Fields
Per-notif-type overrides | OPTIONAL
Auto-disable provider thresholds | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Retries must be bounded and must respect suppression/opt-out.
Fallback channels must honor consent/opt-out for that channel.
Operator actions must be permissioned and auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Failure Taxonomy
classes: {{fail.classes}}
channel_notes: {{fail.channel_notes}} | OPTIONAL
2. Retry Eligibility
retryable: {{retry.retryable}}
non_retryable: {{retry.non_retryable}} | OPTIONAL
3. Backoff
policy: {{backoff.policy}} (exponential/jitter/UNKNOWN)
max_attempts: {{backoff.max_attempts}}
max_age_ms: {{backoff.max_age_ms}} | OPTIONAL
4. DLQ / Quarantine
dlq_supported: {{dlq.supported}}
dlq_trigger_rule: {{dlq.trigger_rule}}
redaction_rule: {{dlq.redaction_rule}} | OPTIONAL
drain_policy: {{dlq.drain_policy}} | OPTIONAL
5. Fallback Channels
fallback_supported: {{fallback.supported}}
fallback_rules: {{fallback.rules}}
consent_check_rule: {{fallback.consent_check_rule}} | OPTIONAL
6. Suppression Interaction
no_retry_when_suppressed: {{suppress.no_retry_when_suppressed}}
suppression_ref: {{suppress.ref}} (expected: {{xref:NOTIF-05}}) | OPTIONAL
7. Operator Actions
actions: {{ops.actions}}
permissions_ref: {{ops.permissions_ref}} (expected: {{xref:API-04}}/{{xref:ADMIN-01}}) |
OPTIONAL
8. User Impact
surface_failures: {{impact.surface_failures}}
user_copy_policy: {{impact.user_copy_policy}} | OPTIONAL
9. Telemetry
retry_count_metric: {{telemetry.retry_count_metric}}

dlq_depth_metric: {{telemetry.dlq_depth_metric}} | OPTIONAL
fallback_used_metric: {{telemetry.fallback_used_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
10.References
Send policy: {{xref:NOTIF-04}} | OPTIONAL
Deliverability/suppression: {{xref:NOTIF-05}} | OPTIONAL
Preference center: {{xref:NOTIF-06}} | OPTIONAL
Observability/runbooks: {{xref:NOTIF-10}} | OPTIONAL
Cross-References
Upstream: {{xref:NOTIF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define retry and max attempts and fallback rules.
intermediate: Required. Define DLQ triggers, suppression interaction, and telemetry.
advanced: Required. Add auto-disable thresholds and per-type overrides and operator
permissions rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, channel notes, non-retryable list, max
age, dlq redaction/drain, consent check rule, suppression ref, permissions ref, user copy policy,
optional metrics/fields, overrides/thresholds, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If backoff.max_attempts is UNKNOWN → block Completeness Gate.
If dlq.supported is UNKNOWN → block Completeness Gate.
If fallback.rules is UNKNOWN → block Completeness Gate (when fallback.supported == true).
If suppress.no_retry_when_suppressed is UNKNOWN → block Completeness Gate.
If telemetry.retry_count_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
bounded_retry_defined == true
fallback_and_suppression_defined == true
dlq_policy_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

NOTIF-10

NOTIF-10 — Observability & Support Runbooks (delivery metrics, alerts)
Header Block

## 5. Optional Fields

Per-notif-type overrides | OPTIONAL
Auto-disable provider thresholds | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Retries must be bounded and must respect suppression/opt-out.**
- **Fallback channels must honor consent/opt-out for that channel.**
- **Operator actions must be permissioned and auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Failure Taxonomy`
2. `## Retry Eligibility`
3. `## Backoff`
4. `## DLQ / Quarantine`
5. `## Fallback Channels`
6. `## Suppression Interaction`
7. `## Operator Actions`
8. `## OPTIONAL`
9. `## User Impact`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:NOTIF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:NOTIF-10}} | OPTIONAL**
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
