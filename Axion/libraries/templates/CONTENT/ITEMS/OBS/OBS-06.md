# OBS-06 — Redaction & Privacy Rules for Telemetry (PII/secret handling)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-06                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring redaction & privacy rules for telemetry (pii/secret handling)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Redaction & Privacy Rules for Telemetry (PII/secret handling) Document                         |

## 2. Purpose

Define the canonical privacy and redaction rules for all telemetry (logs, traces, metrics
dimensions, analytics events): what must be denied, what may be hashed, what may be stored,
and how enforcement/verification works. This template must align with PII tiering and secrets
redaction rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PII classification model: {{xref:PRIV-02}} | OPTIONAL
- Data minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Secrets/log redaction rules: {{xref:SKM-09}} | OPTIONAL
- PII/secret redaction standard (logging): {{xref:LTS-04}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Telemetry types covered (logs/traces/metrics/analytics)
Global denylist fields (tokens, secrets, auth headers)
PII handling rules (hash/mask/drop by tier)
Allowed identifiers policy (user_id hashed, tenant_id allowed?)
Trace attribute rules (what can be in spans)
Metric label rules (no unbounded identifiers)
Analytics event privacy constraints (consent tie-in)
Retention constraints for telemetry (short/standard)
Export/privacy controls (who can query/export)
Verification/enforcement rule (tests/scanners)
Telemetry requirements (redaction violations, dropped fields)

Optional Fields
Per-surface overrides (admin vs public) | OPTIONAL
Incident handling for telemetry leaks | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Default is minimize: if not needed for operations, do not emit.
Never emit secret material; redaction must occur before data leaves the process.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Covered Telemetry
types: {{cover.types}}
2. Denylist
denylist_fields: {{deny.fields}}
3. PII Handling
tier_rules: {{pii.tier_rules}}
hashing_rule: {{pii.hashing_rule}} | OPTIONAL
4. Allowed Identifiers
allowed_ids: {{ids.allowed}}
prohibited_ids: {{ids.prohibited}} | OPTIONAL
5. Traces
span_attribute_allowlist: {{traces.allowlist}}
span_attribute_denylist: {{traces.denylist}} | OPTIONAL
6. Metrics Labels
allowed_labels: {{metrics.allowed_labels}}
label_cardinality_rule: {{metrics.cardinality_rule}} | OPTIONAL
7. Analytics Privacy
consent_ref: {{xref:PRIV-04}} | OPTIONAL
analytics_minimization_rule: {{analytics.min_rule}}
8. Retention
retention_class_rule: {{retention.class_rule}}
default_retention_days: {{retention.default_days}}
9. Access / Exports
query_access_rule: {{access.query_rule}}
export_access_rule: {{access.export_rule}} | OPTIONAL
10.Enforcement
enforcement_rule: {{enforce.rule}}
tooling_ref: {{enforce.tooling_ref}} | OPTIONAL
11.Telemetry
redaction_violation_metric: {{telemetry.violation_metric}}
dropped_field_metric: {{telemetry.dropped_field_metric}} | OPTIONAL

12.References
Secrets redaction: {{xref:SKM-09}} | OPTIONAL
PII classification: {{xref:PRIV-02}} | OPTIONAL
Logging redaction: {{xref:LTS-04}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OBS-09}}, {{xref:ALRT-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define denylist, allowed identifiers, retention rule, and enforcement rule.
intermediate: Required. Define tier-based PII handling and trace/metric rules and telemetry
metrics.
advanced: Required. Add per-surface overrides and incident handling and strict access/export
controls.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, hashing rule, prohibited ids, trace
denylist, cardinality rule, consent ref, export rule, tooling ref, optional metrics,
overrides/incidents, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If deny.fields is UNKNOWN → block Completeness Gate.
If pii.tier_rules is UNKNOWN → block Completeness Gate.
If analytics.min_rule is UNKNOWN → block Completeness Gate.
If retention.default_days is UNKNOWN → block Completeness Gate.
If telemetry.violation_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OBS
Pass conditions:
required_fields_present == true
denylist_and_pii_rules_defined == true
retention_defined == true
enforcement_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OBS-07

OBS-07 — Dashboards Inventory (by dashboard_id)
Header Block

## 5. Optional Fields

Per-surface overrides (admin vs public) | OPTIONAL
Incident handling for telemetry leaks | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Default is minimize: if not needed for operations, do not emit.**
- **Never emit secret material; redaction must occur before data leaves the process.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Covered Telemetry`
2. `## Denylist`
3. `## PII Handling`
4. `## Allowed Identifiers`
5. `## Traces`
6. `## Metrics Labels`
7. `## Analytics Privacy`
8. `## Retention`
9. `## Access / Exports`
10. `## Enforcement`

## 8. Cross-References

- **Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OBS-09}}, {{xref:ALRT-05}} | OPTIONAL**
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
