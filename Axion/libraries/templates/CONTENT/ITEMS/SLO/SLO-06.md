# SLO-06 — Measurement Rules (windows, aggregation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-06                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring measurement rules (windows, aggregation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Measurement Rules (windows, aggregation) Document                         |

## 2. Purpose

Define the canonical rules for calculating SLIs/SLOs: measurement windows, aggregation
methods, latency percentile rules, availability definitions, and how missing data is handled. This
standard ensures SLOs are consistent and comparable across services.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SLO overview: {{xref:SLO-01}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Telemetry schema: {{xref:OBS-02}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Endpoint SLO catalog: {{xref:SLO-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Supported windows (7d/30d/rolling)
Aggregation rules (sum/avg/ratio)
Availability calculation rule (good/total)
Latency percentile rules (p50/p95/p99)
Error rate rules (5xx, timeouts)
SLO evaluation frequency (how often computed)
Handling missing/partial telemetry (UNKNOWN vs assume bad)
Exclusion rules (maintenance windows)
Metric label selection rules (env/service)
Telemetry requirements (calc job failures)

Optional Fields
Multi-region aggregation rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
SLO calculations must be reproducible and based on defined metric sources.
Exclude planned maintenance only when explicitly defined.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Windows
supported: {{win.supported}}
default_window: {{win.default}} | OPTIONAL
2. Aggregation
aggregation_rules: {{agg.rules}}
3. Availability
good_total_rule: {{avail.good_total_rule}}
status_code_rule: {{avail.status_code_rule}} | OPTIONAL
4. Latency
percentiles: {{lat.percentiles}}
histogram_rule: {{lat.histogram_rule}} | OPTIONAL
5. Error Rate
error_classes: {{err.classes}}
timeout_inclusion_rule: {{err.timeout_rule}} | OPTIONAL
6. Frequency
eval_frequency_minutes: {{freq.minutes}}
7. Missing Data
missing_data_rule: {{missing.rule}}
8. Exclusions
maintenance_exclusion_rule: {{exclude.maintenance_rule}}
maintenance_ref: {{xref:REL-07}} | OPTIONAL
9. Label Selection
label_rule: {{labels.rule}}
10.Telemetry
slo_calc_job_fail_metric: {{telemetry.calc_fail_metric}}
Cross-References
Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SLO-07}}, {{xref:SLO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define windows, availability rule, latency percentiles, missing data rule.

intermediate: Required. Define aggregation, exclusions, label selection, telemetry.
advanced: Required. Add multi-region rules and stricter reproducibility and auditability of
calculations.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, default window, status code rule,
histogram rule, timeout rule, maintenance ref, multi-region rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If win.supported is UNKNOWN → block Completeness Gate.
If avail.good_total_rule is UNKNOWN → block Completeness Gate.
If lat.percentiles is UNKNOWN → block Completeness Gate.
If missing.rule is UNKNOWN → block Completeness Gate.
If telemetry.calc_fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
windows_and_rules_defined == true
missing_data_defined == true
exclusions_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-07

SLO-07 — Alerting on Burn (ties to ALRT)
Header Block

## 5. Optional Fields

Multi-region aggregation rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **SLO calculations must be reproducible and based on defined metric sources.**
- **Exclude planned maintenance only when explicitly defined.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Windows`
2. `## Aggregation`
3. `## Availability`
4. `## Latency`
5. `## Error Rate`
6. `## Frequency`
7. `## Missing Data`
8. `## Exclusions`
9. `## Label Selection`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-07}}, {{xref:SLO-10}} | OPTIONAL**
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
