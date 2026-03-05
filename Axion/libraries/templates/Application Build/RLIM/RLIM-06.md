# RLIM-06 — Rate Limit Observability (alerts, dashboards)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-06                                             |
| Template Type     | Build / Rate Limiting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring rate limit observability (alerts, dashboards)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Rate Limit Observability (alerts, dashboards) Document                         |

## 2. Purpose

Define the canonical observability requirements for rate limiting and abuse enforcement,
including required metrics, logs, dashboards, and alerts for throttles/rejects/bans/exemptions
and detection rule hits. This template must be consistent with RLIM policy, catalogs, and
enforcement actions and must not invent instrumentation requirements that contradict upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- RLIM-02 Rate Limit Catalog: {{rlim.catalog}} | OPTIONAL
- RLIM-03 Abuse Signals & Detection: {{abuse.signals_rules}} | OPTIONAL
- RLIM-04 Enforcement Actions Matrix: {{abuse.actions}} | OPTIONAL
- RLIM-05 Exemptions Policy: {{rlim.exemptions}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Core metrics (limited_count, throttled_count, banned_count, exempted_count)
Per-surface breakdown requirements
Top keys reporting requirements (controlled cardinality)
Rule hit metrics (RLIM-03)
Action apply metrics (RLIM-04)
Exemption usage metrics (RLIM-05)
Log field requirements (correlation, redaction)
Dashboard requirements (minimum panels)
Alert requirements (rate limit spikes, ban spikes, rule hit spikes)
Runbook references (where to look, what to do)
Cardinality and cost controls

Optional Fields
Per-limit-id dashboards | OPTIONAL
Anomaly detection alerts | OPTIONAL
Sampling rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Metrics MUST use stable identifiers as labels (surface, scope_type, action_id) and avoid
unbounded labels.
PII MUST be redacted in logs per: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Alerts MUST be actionable and mapped to procedures (runbooks) when available.
Output Format
1. Observability Scope
surfaces: {{obs.surfaces}}
envs: {{obs.envs}} | OPTIONAL
notes: {{obs.notes}} | OPTIONAL
2. Metrics — Core
limited_count: {{metrics.limited_count}}
throttled_count: {{metrics.throttled_count}} | OPTIONAL
rejected_count: {{metrics.rejected_count}} | OPTIONAL
banned_count: {{metrics.banned_count}} | OPTIONAL
exempted_count: {{metrics.exempted_count}} | OPTIONAL
Dimensions (labels):
surface: {{metrics.labels.surface}}
scope_type: {{metrics.labels.scope_type}} | OPTIONAL
enforcement_action: {{metrics.labels.enforcement_action}} | OPTIONAL
limit_id: {{metrics.labels.limit_id}} | OPTIONAL
rule_id: {{metrics.labels.rule_id}} | OPTIONAL
env: {{metrics.labels.env}} | OPTIONAL
3. Metrics — Rule Hits & Actions
rule_hits: {{metrics.rule_hits}} | OPTIONAL
action_applied: {{metrics.action_applied}} | OPTIONAL
severity_breakdown: {{metrics.severity_breakdown}} | OPTIONAL
4. Metrics — Exemptions
active_exemptions: {{metrics.active_exemptions}} | OPTIONAL
exempted_requests: {{metrics.exempted_requests}} | OPTIONAL
5. Logs — Required Fields
timestamp: {{logs.fields.timestamp}}
surface: {{logs.fields.surface}}
scope_type: {{logs.fields.scope_type}} | OPTIONAL

scope_value_hash: {{logs.fields.scope_value_hash}} | OPTIONAL
limit_id: {{logs.fields.limit_id}} | OPTIONAL
rule_id: {{logs.fields.rule_id}} | OPTIONAL
action_id: {{logs.fields.action_id}} | OPTIONAL
decision: {{logs.fields.decision}} (throttle/reject/ban/exempt/allow)
reason_code: {{logs.fields.reason_code}} | OPTIONAL
request_id: {{logs.fields.request_id}} | OPTIONAL
trace_id: {{logs.fields.trace_id}} | OPTIONAL
redaction_applied: {{logs.fields.redaction_applied}} | OPTIONAL
6. Dashboards (Minimum)
overview_dashboard: {{dashboards.overview}}
abuse_dashboard: {{dashboards.abuse}} | OPTIONAL
exemptions_dashboard: {{dashboards.exemptions}} | OPTIONAL
top_keys_dashboard: {{dashboards.top_keys}} | OPTIONAL
minimum_panels: {{dashboards.minimum_panels}}
7. Alerts
rate_limit_spike: {{alerts.rate_limit_spike}}
ban_spike: {{alerts.ban_spike}} | OPTIONAL
rule_hit_spike: {{alerts.rule_hit_spike}} | OPTIONAL
exemption_change_alert: {{alerts.exemption_change_alert}} | OPTIONAL
threshold_model: {{alerts.threshold_model}} (static/baseline/UNKNOWN)
routing_policy: {{alerts.routing_policy}} | OPTIONAL
runbook_ref: {{alerts.runbook_ref}} | OPTIONAL
8. Cardinality & Cost Controls
disallowed_labels: {{cost.disallowed_labels}} | OPTIONAL
label_allowlist: {{cost.label_allowlist}} | OPTIONAL
top_k_limits: {{cost.top_k_limits}} | OPTIONAL
sampling_policy: {{cost.sampling_policy}} | OPTIONAL
9. References
Global policy: {{xref:RLIM-01}}
Limits catalog: {{xref:RLIM-02}} | OPTIONAL
Signals/rules: {{xref:RLIM-03}} | OPTIONAL
Actions matrix: {{xref:RLIM-04}} | OPTIONAL
Exemptions: {{xref:RLIM-05}} | OPTIONAL
Cross-References
Upstream: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define core metric/log fields and minimum dashboards; use UNKNOWN for

tooling specifics.
intermediate: Required. Add alerts and rule/action/exemption instrumentation.
advanced: Required. Add cardinality controls and cost/sampling policy.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, envs, throttled_count, rejected_count,
banned_count, exempted_count, labels., rule_hits/action_applied/severity_breakdown,
scope_value_hash, reason_code, request_id, trace_id, dashboards., alerts., cost. ,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If logs required fields are UNKNOWN → block Completeness Gate.
If alerts.threshold_model is UNKNOWN → flag in Open Questions.
Completeness Gate
Gate ID: TMP-05.PRIMARY.RLIM
Pass conditions:
required_fields_present == true
metric_set_defined == true
log_fields_defined == true
dashboard_minimum_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true


Feature Flags & Config (FFCFG)

Feature Flags & Config (FFCFG)
FFCFG-01 Feature Flag Registry (by flag_id)
FFCFG-02 Flag Behavior Spec (default, targeting, kill-switch)
FFCFG-03 Rollout Plan (phased, canary, % ramp)
FFCFG-04 Config Matrix (env vars/settings by env)
FFCFG-05 Safe Degradation Rules (flag off behavior)
FFCFG-06 Audit & Change Control (who can flip, logging)

FFCFG-01

FFCFG-01 — Feature Flag Registry (by flag_id)
Header Block

## 5. Optional Fields

Per-limit-id dashboards | OPTIONAL
Anomaly detection alerts | OPTIONAL
Sampling rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Metrics MUST use stable identifiers as labels (surface, scope_type, action_id) and avoid**
- **unbounded labels.**
- **PII MUST be redacted in logs per: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Alerts MUST be actionable and mapped to procedures (runbooks) when available.**

## 7. Output Format

### Required Headings (in order)

1. `## Observability Scope`
2. `## Metrics — Core`
3. `## Dimensions (labels):`
4. `## Metrics — Rule Hits & Actions`
5. `## Metrics — Exemptions`
6. `## Logs — Required Fields`
7. `## Dashboards (Minimum)`
8. `## Alerts`
9. `## Cardinality & Cost Controls`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

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
