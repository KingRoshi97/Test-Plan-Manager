# LTS-05 — Log Routing & Storage (sinks, retention classes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-05                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring log routing & storage (sinks, retention classes)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Log Routing & Storage (sinks, retention classes) Document                         |

## 2. Purpose

Define the canonical routing and storage model for logs: which sinks exist, what routes to
where, retention classes/durations, and access controls. This template must align with audit
retention controls and sampling/cost budgets.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Logging standard: {{xref:LTS-01}} | OPTIONAL
- Redaction standard: {{xref:LTS-04}} | OPTIONAL
- Audit retention/access controls: {{xref:AUDIT-05}} | OPTIONAL
- Sampling/cardinality policy: {{xref:OBS-09}} | OPTIONAL
- Cost drivers: {{xref:COST-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Log sinks inventory (sink_id list)
sink_id (stable identifier)
Sink type (stdout/agent/siem/object_store)
Routing rules (which logs go to which sink)
Retention classes (short/standard/long)
Retention days per class
Partitioning/indexing rule (by env/service)
Access control rule (who can query)
Export policy (who can export)
Encryption rule (at rest/in transit)
Telemetry requirements (ingest failures, lag)

Optional Fields
Cost controls (caps/quotas) | OPTIONAL
Archive policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Audit logs must follow AUDIT retention/access rules; do not co-mingle with app logs without
clear boundaries.
Redaction must happen before routing to sinks.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Sinks
sinks: {{sinks.list}}
2. Routing
routes: {{routes.rules}}
3. Retention
classes: {{retention.classes}}
short_days: {{retention.short_days}}
standard_days: {{retention.standard_days}}
long_days: {{retention.long_days}}
4. Partitioning / Indexing
partition_rule: {{storage.partition_rule}}
index_rule: {{storage.index_rule}} | OPTIONAL
5. Access / Export
query_access_rule: {{access.query_rule}}
export_rule: {{access.export_rule}} | OPTIONAL
6. Encryption
encryption_rule: {{crypto.encryption_rule}}
7. Telemetry
ingest_fail_metric: {{telemetry.ingest_fail_metric}}
ingest_lag_metric: {{telemetry.ingest_lag_metric}} | OPTIONAL
8. References
Redaction standard: {{xref:LTS-04}} | OPTIONAL
Audit retention: {{xref:AUDIT-05}} | OPTIONAL
Sampling policy: {{xref:OBS-09}} | OPTIONAL
Cross-References
Upstream: {{xref:LTS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LTS-08}}, {{xref:ALRT-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define sinks, routing, retention days, and access rule.
intermediate: Required. Define export policy, encryption rule, and telemetry metrics.
advanced: Required. Add cost caps/archive policy and strict partitioning/indexing guidance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, routes rules, index rule, export rule,
optional metrics, cost/archive, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If sinks.list is UNKNOWN → block Completeness Gate.
If retention.standard_days is UNKNOWN → block Completeness Gate.
If access.query_rule is UNKNOWN → block Completeness Gate.
If crypto.encryption_rule is UNKNOWN → block Completeness Gate.
If telemetry.ingest_fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
sinks_and_retention_defined == true
routing_defined == true
access_and_encryption_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-06

LTS-06 — Client Logging Standard (mobile/web constraints)
Header Block

## 5. Optional Fields

Cost controls (caps/quotas) | OPTIONAL
Archive policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Audit logs must follow AUDIT retention/access rules; do not co-mingle with app logs without**
- **clear boundaries.**
- **Redaction must happen before routing to sinks.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Sinks`
2. `## Routing`
3. `## Retention`
4. `## Partitioning / Indexing`
5. `## Access / Export`
6. `## Encryption`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:LTS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LTS-08}}, {{xref:ALRT-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define sinks, routing, retention days, and access rule.**
- **intermediate: Required. Define export policy, encryption rule, and telemetry metrics.**
- **advanced: Required. Add cost caps/archive policy and strict partitioning/indexing guidance.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, routes rules, index rule, export rule,**
- optional metrics, cost/archive, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If sinks.list is UNKNOWN → block

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
