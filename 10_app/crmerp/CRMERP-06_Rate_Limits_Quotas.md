# CRMERP-06 — Rate Limits & Quotas (per vendor, backoff)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-06 |
| title | Rate Limits & Quotas (per vendor, backoff) |
| type | crmerp_rate_limits_quotas |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-06_Rate_Limits_Quotas.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["CRMERP-01", "IXS-03", "RLIM-01"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "CRMERP-01", "IXS-03", "RLIM-01", "RLIM-02", "CER-02"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical vendor rate limit and quota rules for CRM/ERP integrations, including
documented vendor limits, internal concurrency caps, backoff behavior, and how sync
scheduling adapts under throttling. This template must be consistent with integration
connectivity policy and internal rate limit governance.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- IXS-03 Connectivity & Network Policy: {{ixs.network_policy}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- RLIM-02 Rate Limit Catalog: {{rlim.catalog}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- system_id binding
- Vendor limit registry (limit_id list)
- Vendor documented limits (requests/minute, daily caps)
- Quota reset behavior (window type)
- Retry-after handling (429 behavior)
- Backoff policy (exponential/jitter)
- Internal concurrency caps (per system/object)
- Scheduling adaptation rules (slowdown, pause)
- Exemptions/allowlist policy (if any)
- Telemetry requirements (throttles, quota usage)

## Optional Fields

- Cost/usage budgeting notes | OPTIONAL
- Burst allowance rules | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not exceed vendor limits; must degrade safely under throttling.
- Backoff must be bounded; do not spin.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Vendor Limits
system_id: {{meta.system_id}}
limits:
Limit
limit_id: {{limits[0].limit_id}}
scope: {{limits[0].scope}} (global/per_object/UNKNOWN)
value: {{limits[0].value}}
unit: {{limits[0].unit}}
window: {{limits[0].window}} (per_minute/per_day/UNKNOWN)
reset_rule: {{limits[0].reset_rule}} | OPTIONAL
notes: {{limits[0].notes}} | OPTIONAL
(Repeat per limit.)
2. 429 / Retry-After Handling
retry_after_respected: {{r429.respected}}
header_name: {{r429.header_name}} | OPTIONAL
fallback_delay_ms: {{r429.fallback_delay_ms}} | OPTIONAL
3. Backoff Policy
policy: {{backoff.policy}} (exponential/jitter/UNKNOWN)
base_delay_ms: {{backoff.base_delay_ms}} | OPTIONAL
max_delay_ms: {{backoff.max_delay_ms}}
max_attempts: {{backoff.max_attempts}} | OPTIONAL
4. Internal Caps
max_concurrent_requests: {{caps.max_concurrent_requests}}
per_object_caps: {{caps.per_object_caps}} | OPTIONAL
5. Scheduling Adaptation
on_throttle_behavior: {{adapt.on_throttle_behavior}} (slowdown/pause/UNKNOWN)
cooldown_rule: {{adapt.cooldown_rule}} | OPTIONAL
resume_rule: {{adapt.resume_rule}} | OPTIONAL

6. Exemptions
exemptions_supported: {{exempt.supported}} | OPTIONAL
allowlist_policy: {{exempt.allowlist_policy}} | OPTIONAL
7. Telemetry
throttle_metric: {{telemetry.throttle_metric}}
quota_usage_metric: {{telemetry.quota_usage_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
8. References
System inventory: {{xref:CRMERP-01}}
Connectivity policy: {{xref:IXS-03}} | OPTIONAL
Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
Rate limit catalog: {{xref:RLIM-02}} | OPTIONAL
Retry patterns: {{xref:CER-02}} | OPTIONAL

## Cross-References

Upstream: {{xref:CRMERP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CRMERP-04}}, {{xref:CRMERP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. List vendor limits and basic 429 handling; use UNKNOWN for caps if
missing.
intermediate: Required. Define backoff and internal caps and adaptation behavior.
advanced: Required. Add exemptions policy and budgeting/burst rules with telemetry rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, reset rules/notes, 429 header/fallback,
base delay/max attempts, per-object caps, cooldown/resume, exemptions, quota usage
metric/fields, budgeting/burst, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If limits list is UNKNOWN → block Completeness Gate.
If backoff.max_delay_ms is UNKNOWN → block Completeness Gate.
If adapt.on_throttle_behavior is UNKNOWN → block Completeness Gate.
If telemetry.throttle_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
vendor_limits_defined == true
429_and_backoff_defined == true
internal_caps_defined == true
adaptation_defined == true
telemetry_defined == true

placeholder_resolution == true
no_unapproved_unknowns == true
