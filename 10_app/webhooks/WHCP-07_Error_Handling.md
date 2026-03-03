# WHCP-07 — Error Handling (DLQ, quarantine, manual replay)

## Header Block

| Field | Value |
|---|---|
| template_id | WHCP-07 |
| title | Error Handling (DLQ, quarantine, manual replay) |
| type | webhook_error_handling |
| template_version | 1.0.0 |
| output_path | 10_app/webhooks/WHCP-07_Error_Handling.md |
| compliance_gate_id | TMP-05.PRIMARY.WHCP |
| upstream_dependencies | ["WHCP-04", "IXS-06", "JBS-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "WHCP-01", "WHCP-02", "WHCP-03", "WHCP-04", "IXS-06", "JBS-04", "ADMIN-02", "ADMIN-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical error handling lifecycle for webhooks (inbound and outbound): how failures
are classified, when items go to DLQ/quarantine, how manual replay works, and what operator
actions exist. This template must be consistent with delivery semantics and global integration
error handling.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}}
- IXS-06 Integration Error Handling: {{ixs.error_recovery}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jobs.retry_dlq}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Failure taxonomy (network, 4xx, 5xx, invalid signature, invalid schema)
- Retry exhaustion rule (when to stop)
- DLQ/quarantine supported (yes/no/UNKNOWN)
- DLQ trigger rule
- Quarantine contents (what stored, redacted)
- Replay supported (yes/no/UNKNOWN)
- Replay authorization rules (who can replay)
- Replay scope rules (by webhook_id/subscription_id/time)
- Backfill/retry safety checks (idempotency)
- Operator actions (pause sub, rotate secret, resend test)
- Telemetry requirements (dlq depth, replay success)
- Audit logging requirements (replay actions, overrides)

## Optional Fields

- Auto-replay policy | OPTIONAL
- Customer notification policy | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not DLQ raw secrets or unredacted PII.
- Replay must not violate ordering/duplication rules; idempotency must be enforced.
- Operator actions must be permissioned and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Failure Taxonomy
classes: {{fail.classes}}
mapping_notes: {{fail.mapping_notes}} | OPTIONAL
2. Retry Exhaustion
stop_conditions: {{retry.stop_conditions}}
max_attempts_ref: {{retry.max_attempts_ref}} (expected: {{xref:WHCP-04}}) |
OPTIONAL
3. DLQ / Quarantine
dlq_supported: {{dlq.supported}}
dlq_trigger_rule: {{dlq.trigger_rule}}
redaction_rule: {{dlq.redaction_rule}}
retention_ms: {{dlq.retention_ms}} | OPTIONAL
4. Replay
replay_supported: {{replay.supported}}
who_can_replay: {{replay.who_can_replay}}
scope_rules: {{replay.scope_rules}}
safety_checks: {{replay.safety_checks}} | OPTIONAL
5. Operator Actions
Action
action_id: {{ops.actions[0].action_id}}
name: {{ops.actions[0].name}}
when_allowed: {{ops.actions[0].when_allowed}}
required_role: {{ops.actions[0].required_role}} | OPTIONAL
audit_required: {{ops.actions[0].audit_required}}

(Repeat per action.)
6. Auto-Replay (Optional)
auto_replay_supported: {{auto.supported}} | OPTIONAL
auto_replay_rules: {{auto.rules}} | OPTIONAL
7. Telemetry
dlq_depth_metric: {{telemetry.dlq_depth_metric}}
replay_success_metric: {{telemetry.replay_success_metric}} | OPTIONAL
quarantine_rate_metric: {{telemetry.quarantine_rate_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
8. Audit Logging
audit_required: {{audit.required}}
audit_events: {{audit.events}}
audit_fields: {{audit.fields}} | OPTIONAL
9. References
Delivery semantics: {{xref:WHCP-04}}
Security rules: {{xref:WHCP-05}} | OPTIONAL
Endpoint management: {{xref:WHCP-06}} | OPTIONAL
Support tools: {{xref:ADMIN-02}} | OPTIONAL
Audit trail: {{xref:ADMIN-03}} | OPTIONAL

## Cross-References

Upstream: {{xref:WHCP-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-08}}, {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define taxonomy + dlq trigger + replay supported and who can replay.
intermediate: Required. Define redaction/retention, scope rules, operator actions, telemetry.
advanced: Required. Add auto-replay, customer comms policy, and safety checks rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, mapping notes, max attempts ref,
retention ms, safety checks, required roles, auto replay, telemetry fields, audit fields, customer
notifications, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dlq.supported is UNKNOWN → block Completeness Gate.
If dlq.trigger_rule is UNKNOWN → block Completeness Gate (when dlq.supported == true).
If dlq.redaction_rule is UNKNOWN → block Completeness Gate (when dlq.supported == true).
If replay.supported is UNKNOWN → block Completeness Gate.
If telemetry.dlq_depth_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
dlq_and_redaction_defined == true
replay_policy_defined == true
operator_actions_defined == true
telemetry_defined == true
audit_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
