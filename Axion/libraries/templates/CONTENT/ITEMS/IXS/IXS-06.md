# IXS-06 — Error Handling & Recovery (retries, fallbacks, operator actions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-06                                             |
| Template Type     | Integration / External Systems                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error handling & recovery (retries, fallbacks, operator actions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Handling & Recovery (retries, fallbacks, operator actions) Document                         |

## 2. Purpose

Define the canonical error handling and recovery model for integrations: error taxonomy,
retry/backoff behavior, idempotency expectations, fallbacks, DLQ/quarantine behavior, and
operator actions (replay/backfill/disable). This template must be consistent with API error policy
and job/event failure handling rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-02 Integration Specs: {{ixs.integration_specs}}
- API-03 Error & Status Code Policy: {{api.error_policy}} | OPTIONAL
- CER-02 Retry & Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jobs.retry_dlq}} | OPTIONAL
- EVT-07 Event Failure Handling: {{evt.failure_handling}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Error taxonomy (classes)
Retry eligibility rules (by class)
Backoff policy (and max attempts)
Idempotency requirements (per operation)
Timeout handling policy
Fallback behaviors (degraded mode / skip / queue)
Quarantine/DLQ rules (when used, how to drain)
Operator actions matrix (disable integration, replay, backfill, rotate creds)
User impact policy (silent vs surfaced)
Telemetry requirements (error rates, retry counts, DLQ depth)

Optional Fields
Per-integration overrides | OPTIONAL
Vendor-specific error mappings | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not “retry forever”; retries must be bounded and observable.
Idempotency MUST be explicit for any operation that can be replayed.
DLQ/quarantine MUST have a drain/replay policy.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Error Taxonomy
classes:
network: {{errors.classes.network}}
timeout: {{errors.classes.timeout}}
auth: {{errors.classes.auth}}
rate_limit: {{errors.classes.rate_limit}}
vendor_4xx: {{errors.classes.vendor_4xx}}
vendor_5xx: {{errors.classes.vendor_5xx}}
schema_validation: {{errors.classes.schema_validation}}
duplicate: {{errors.classes.duplicate}} | OPTIONAL
2. Retry Eligibility
retryable_classes: {{retry.retryable_classes}}
non_retryable_classes: {{retry.non_retryable_classes}} | OPTIONAL
retry_conditions: {{retry.conditions}} | OPTIONAL
3. Backoff Policy
policy: {{backoff.policy}} (exponential/jitter/UNKNOWN)
base_delay_ms: {{backoff.base_delay_ms}} | OPTIONAL
max_delay_ms: {{backoff.max_delay_ms}} | OPTIONAL
max_attempts: {{backoff.max_attempts}}
4. Idempotency
idempotency_required: {{idem.required}}
idempotency_key_rule: {{idem.key_rule}} | OPTIONAL
dedupe_window: {{idem.dedupe_window}} | OPTIONAL
5. Timeout Handling
timeout_budget_ms: {{timeout.budget_ms}}
on_timeout_behavior: {{timeout.on_timeout_behavior}} | OPTIONAL
6. Fallback Behaviors
on_rate_limit: {{fallback.on_rate_limit}}
on_auth_failure: {{fallback.on_auth_failure}}
on_schema_validation_fail: {{fallback.on_schema_validation_fail}} | OPTIONAL

7. Quarantine / DLQ
dlq_supported: {{dlq.supported}}
dlq_trigger_rule: {{dlq.trigger_rule}}
replay_policy: {{dlq.replay_policy}}
max_age_ms: {{dlq.max_age_ms}} | OPTIONAL
8. Operator Actions Matrix
Action
action_id: {{ops.actions[0].action_id}}
name: {{ops.actions[0].name}}
when_allowed: {{ops.actions[0].when_allowed}}
required_role: {{ops.actions[0].required_role}} | OPTIONAL
audit_required: {{ops.actions[0].audit_required}}
notes: {{ops.actions[0].notes}} | OPTIONAL
(Repeat per action.)
9. User Impact Policy
surface_errors_to_users: {{impact.surface_to_users}}
user_copy_policy_ref: {{impact.copy_policy_ref}} | OPTIONAL
10.Telemetry
error_rate_metric: {{telemetry.error_rate_metric}}
retry_count_metric: {{telemetry.retry_count_metric}} | OPTIONAL
dlq_depth_metric: {{telemetry.dlq_depth_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
11.References
Integration specs: {{xref:IXS-02}}
Connectivity policy: {{xref:IXS-03}} | OPTIONAL
Jobs DLQ policy: {{xref:JBS-04}} | OPTIONAL
Event failure handling: {{xref:EVT-07}} | OPTIONAL
Observability: {{xref:IXS-07}} | OPTIONAL
Cross-References
Upstream: {{xref:IXS-02}}, {{xref:API-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-07}}, {{xref:ADMIN-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define taxonomy + bounded retries + timeout budget; use UNKNOWN for
vendor mappings.
intermediate: Required. Define idempotency and DLQ rules and operator actions.
advanced: Required. Add per-integration overrides and rigorous telemetry fields/runbook
linkages.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, retry conditions, base/max delays,

idempotency key/dedupe window, timeout on-timeout behavior, schema validation fallback, max
age, op required role, notes, user copy policy ref, telemetry fields, overrides, vendor mappings,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If backoff.max_attempts is UNKNOWN → block Completeness Gate.
If timeout.budget_ms is UNKNOWN → block Completeness Gate.
If dlq.trigger_rule is UNKNOWN → block Completeness Gate (when dlq.supported == true).
If telemetry.error_rate_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
bounded_retry_defined == true
idempotency_defined == true
dlq_and_replay_defined == true
operator_actions_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

IXS-07

IXS-07 — Observability (logs/metrics/traces, dashboards, alerts)
Header Block

## 5. Optional Fields

Per-integration overrides | OPTIONAL
Vendor-specific error mappings | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not “retry forever”; retries must be bounded and observable.
- **Idempotency MUST be explicit for any operation that can be replayed.**
- **DLQ/quarantine MUST have a drain/replay policy.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Error Taxonomy`
2. `## classes:`
3. `## Retry Eligibility`
4. `## Backoff Policy`
5. `## Idempotency`
6. `## Timeout Handling`
7. `## Fallback Behaviors`
8. `## Quarantine / DLQ`
9. `## Operator Actions Matrix`
10. `## Action`

## 8. Cross-References

- **Upstream: {{xref:IXS-02}}, {{xref:API-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IXS-07}}, {{xref:ADMIN-02}} | OPTIONAL**
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
