# PERF-06 — Database Performance Policy (indexes, query limits)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-06                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring database performance policy (indexes, query limits)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Database Performance Policy (indexes, query limits) Document                         |

## 2. Purpose

Define the canonical database performance policy: query complexity limits, indexing
expectations, pagination constraints, and observability requirements for DB performance. This
template keeps DB performance predictable as the system scales.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Canonical data schemas: {{xref:DATA-06}} | OPTIONAL
- Performance constraints (API): {{xref:PFS-05}} | OPTIONAL
- Performance overview: {{xref:PERF-01}} | OPTIONAL
- Perf regression gates: {{xref:PERF-09}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Query performance principles (avoid N+1)
Indexing policy (what must be indexed)
Query timeout rule (max ms)
Pagination requirements (cursor/limits)
Join/aggregation limits (max joins)
Read/write separation rules (if any)
Migration performance rules (backfills)
Observability requirements (slow query logs, metrics)
Change control rule (review for new queries)
Telemetry requirements (p95 query time metric)

Optional Fields
DB tiering rules (hot/cold data) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Any endpoint that can return many rows must use pagination and bounded queries.
Slow queries must be observable and attributable to endpoints.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Principles
principles: {{principles.list}}
2. Indexing
index_rule: {{index.rule}}
required_indexes: {{index.required}} | OPTIONAL
3. Timeouts
query_timeout_ms: {{timeouts.query_timeout_ms}}
statement_timeout_rule: {{timeouts.statement_timeout_rule}} | OPTIONAL
4. Pagination
pagination_ref: {{xref:PFS-02}} | OPTIONAL
pagination_rule: {{paging.rule}}
5. Limits
max_joins: {{limits.max_joins}}
aggregation_rule: {{limits.aggregation_rule}} | OPTIONAL
6. Migrations / Backfills
backfill_rule: {{migrations.backfill_rule}}
safe_migration_ref: {{xref:ADMIN-04}} | OPTIONAL
7. Observability
slow_query_log_rule: {{obs.slow_query_log_rule}}
metrics: {{obs.metrics}} | OPTIONAL
8. Change Control
review_rule: {{change.review_rule}}
9. Telemetry
p95_query_time_metric: {{telemetry.p95_query_time_metric}}
slow_query_count_metric: {{telemetry.slow_query_count_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:DATA-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-03}}, {{xref:PERF-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define timeouts, pagination rule, max joins, and review rule.

intermediate: Required. Define indexing policy and backfill rule and telemetry metrics.
advanced: Required. Add DB tiering and strict observability metrics and query review
enforcement.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, required indexes, statement timeout rule,
pagination ref, aggregation rule, safe migration ref, obs metrics, optional metrics, DB tiering,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If timeouts.query_timeout_ms is UNKNOWN → block Completeness Gate.
If paging.rule is UNKNOWN → block Completeness Gate.
If migrations.backfill_rule is UNKNOWN → block Completeness Gate.
If change.review_rule is UNKNOWN → block Completeness Gate.
If telemetry.p95_query_time_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
timeouts_and_pagination_defined == true
indexing_and_limits_defined == true
observability_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PERF-07

PERF-07 — Cache Strategy (tiers, invalidation)
Header Block

## 5. Optional Fields

DB tiering rules (hot/cold data) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Any endpoint that can return many rows must use pagination and bounded queries.**
- **Slow queries must be observable and attributable to endpoints.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Principles`
2. `## Indexing`
3. `## Timeouts`
4. `## Pagination`
5. `## Limits`
6. `## Migrations / Backfills`
7. `## Observability`
8. `## Change Control`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:DATA-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-03}}, {{xref:PERF-09}} | OPTIONAL**
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
