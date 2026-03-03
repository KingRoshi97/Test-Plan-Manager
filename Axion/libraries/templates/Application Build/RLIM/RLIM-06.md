# RLIM-06 — Rate Limit Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-06                                          |
| Template Type     | Build / Rate Limits                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring rate limit observability  |
| Filled By         | Internal Agent                                   |
| Consumes          | RLIM-01, RLIM-02, RLIM-03, RLIM-04, RLIM-05      |
| Produces          | Filled Rate Limit Observability                  |

## 2. Purpose

Define the canonical observability requirements for rate limiting and abuse enforcement, including required metrics, logs, dashboards, and alerts for throttles/rejects/bans/exemptions and detection rule hits. This template must be consistent with RLIM policy, catalogs, and enforcement actions and must not invent instrumentation requirements that contradict upstream inputs.

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

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Core metrics (limited_count, throttled_count, banned_count, exempted_count) | spec | No |
| Per-surface breakdown requirements | spec | No |
| Top keys reporting requirements (controlled cardinality) | spec | No |
| Rule hit metrics (RLIM-03) | spec | No |
| Action apply metrics (RLIM-04) | spec | No |
| Exemption usage metrics (RLIM-05) | spec | No |
| Log field requirements (correlation, redaction) | spec | No |
| Dashboard requirements (minimum panels) | spec | No |
| Alert requirements (rate limit spikes, ban spikes, rule hit spikes) | spec | No |
| Runbook references (where to look, what to do) | spec | No |
| Cardinality and cost controls | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-limit-id dashboards | spec | OPTIONAL |
| Anomaly detection alerts | spec | OPTIONAL |
| Sampling rules | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Metrics MUST use stable identifiers as labels (surface, scope_type, action_id) and avoid unbounded labels.
- PII MUST be redacted in logs per: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Alerts MUST be actionable and mapped to procedures (runbooks) when available.

## 7. Cross-References

- **Upstream**: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL, {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Define core metric/log fields and minimum dashboards; use UNKNOWN for tooling specifics. | Required. Add alerts and rule/action/exemption instrumentation. | Required. Add cardinality controls and cost/sampling policy. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, envs, throttled_count, rejected_count, banned_count, exempted_count, labels.*, rule_hits/action_applied/severity_breakdown, scope_value_hash, reason_code, request_id, trace_id, dashboards.*, alerts.*, cost.*, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If logs required fields are UNKNOWN → block Completeness Gate.
- If alerts.threshold_model is UNKNOWN → flag in Open Questions.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.RLIM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] metric_set_defined == true
  - [ ] log_fields_defined == true
  - [ ] dashboard_minimum_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

