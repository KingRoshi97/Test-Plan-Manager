# NOTIF-04 — Send Policy (throttles, quiet hours, batching)

## Header Block

| Field | Value |
|---|---|
| template_id | NOTIF-04 |
| title | Send Policy (throttles, quiet hours, batching) |
| type | notifications_send_policy |
| template_version | 1.0.0 |
| output_path | 10_app/notifications/NOTIF-04_Send_Policy.md |
| compliance_gate_id | TMP-05.PRIMARY.NOTIF |
| upstream_dependencies | ["NOTIF-01", "RLIM-01", "MPUSH-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "NOTIF-01", "NOTIF-02", "RLIM-01", "RLIM-02", "MPUSH-04", "FFCFG-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical send policy for notifications across channels: throttling rules, batching,
quiet hours behavior, priority classes, and safeguards against notification storms. This template
must be consistent with rate limit governance and push delivery rules.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- RLIM-02 Rate Limit Catalog: {{rlim.catalog}} | OPTIONAL
- MPUSH-04 Push Delivery/Retry Rules: {{mpush.delivery_rules}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Priority classes (low/normal/high)
- Per-channel throttle rules (limits by time window)
- Per-user caps (avoid spam)
- Quiet hours supported (yes/no/UNKNOWN)
- Quiet hours behavior (delay/drop)
- Batching supported (yes/no/UNKNOWN)
- Batching rules (grouping window)
- Storm prevention rules (global caps, kill switch)
- Rate limit enforcement reference (RLIM)
- Telemetry requirements (throttled, delayed, dropped)

## Optional Fields

- Per-notif-type overrides | OPTIONAL
- Regional quiet hours | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Storm prevention must exist and be quickly actionable.
- Quiet hours behavior must be deterministic and user-respecting.
- If batching is enabled, batching must not merge semantically different notifications unless
- explicitly allowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Priority Classes
priorities: {{priority.classes}}
2. Per-Channel Throttles
Channel Throttle
channel_id: {{throttle[0].channel_id}}
limits: {{throttle[0].limits}}
per_user_caps: {{throttle[0].per_user_caps}} | OPTIONAL
notes: {{throttle[0].notes}} | OPTIONAL
(Repeat per channel.)
3. Quiet Hours
supported: {{quiet.supported}}
behavior: {{quiet.behavior}} (delay/drop/UNKNOWN)
window_rule: {{quiet.window_rule}} | OPTIONAL
regional_support: {{quiet.regional_support}} | OPTIONAL
4. Batching
supported: {{batch.supported}}
grouping_window_seconds: {{batch.grouping_window_seconds}} | OPTIONAL
grouping_key_rule: {{batch.grouping_key_rule}} | OPTIONAL
5. Storm Prevention
global_caps: {{storm.global_caps}}
kill_switch_flag_ref: {{storm.kill_switch_flag_ref}} (expected: {{xref:FFCFG-01}}) |
OPTIONAL
incident_mode_behavior: {{storm.incident_mode_behavior}} | OPTIONAL
6. Enforcement
rate_limit_ref: {{enforce.rate_limit_ref}} (expected: {{xref:RLIM-01}}/{{xref:RLIM-02}}) |
OPTIONAL
enforcement_point: {{enforce.enforcement_point}} (queue/worker/api/UNKNOWN)

7. Telemetry
throttled_metric: {{telemetry.throttled_metric}}
delayed_metric: {{telemetry.delayed_metric}} | OPTIONAL
dropped_metric: {{telemetry.dropped_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
8. References
Channel inventory: {{xref:NOTIF-01}}
Provider inventory: {{xref:NOTIF-02}} | OPTIONAL
Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
Push delivery rules: {{xref:MPUSH-04}} | OPTIONAL
Abuse controls: {{xref:MPUSH-06}} | OPTIONAL

## Cross-References

Upstream: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-05}}, {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define per-channel throttles and storm caps and throttled metric.
intermediate: Required. Define quiet hours and batching and enforcement point.
advanced: Required. Add overrides/regional quiet hours and kill switch rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, per-user caps, quiet
window/regional support, batching details, kill switch ref, incident behavior, rate limit ref,
delayed/dropped metrics, telemetry fields, overrides, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If priority.classes is UNKNOWN → block Completeness Gate.
If storm.global_caps is UNKNOWN → block Completeness Gate.
If enforce.enforcement_point is UNKNOWN → block Completeness Gate.
If telemetry.throttled_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
throttles_defined == true
storm_prevention_defined == true
enforcement_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
