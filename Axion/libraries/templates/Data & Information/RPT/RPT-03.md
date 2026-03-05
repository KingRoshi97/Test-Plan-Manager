# RPT-03 — Aggregation & Rollup Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RPT-03                                             |
| Template Type     | Data / Reporting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring aggregation & rollup rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Aggregation & Rollup Rules Document                         |

## 2. Purpose

Define how metrics are aggregated and rolled up: time windows, grouping dimensions,
late-arriving data handling, deduplication rules, and recomputation policies. This ensures report
numbers are stable, explainable, and consistent across surfaces.

## 3. Inputs Required

- ● RPT-02: {{xref:RPT-02}} | OPTIONAL
- ● DATA-07: {{xref:DATA-07}} | OPTIONAL
- ● BI-02: {{xref:BI-02}} | OPTIONAL
- ● DQV-02: {{xref:DQV-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Applicability (true/false). If false, mark N/A.
● Rollup rules catalog (minimum 15 rules)
● For each rule:
○ rollup_id
○ metric_id(s)
○ window type (hour/day/week/month/rolling)
○ window boundaries (timezone)
○ group-by dimensions allowed
○ dedupe rule (event_id/entity_id)
○ late-arriving data policy (backfill window)
○ recompute policy (full/partial)
○ correctness checks (reconciliation rule)
○ owner
● Global rules:
○ timezone standard for windows
○ rounding rules
○ null/empty handling
● Verification checklist

Optional Fields
● Cross-metric consistency rules | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● Every rollup must specify timezone and dedupe keys.
● Late-arriving data must have explicit backfill windows.
● Recompute policies must be deterministic and observable.

Output Format
1) Applicability
● applies: {{rollups.applies}} (true/false)
● 00_NA (if not applies): {{rollups.na_block}} | OPTIONAL

2) Rollup Rules Catalog (canonical)
ro
llu
p_
id

metric
s

windo
w

time
zon
e

group_
by

dedup
e_key

late_
data_
polic
y

recomp
ute

check
s

owner

notes

rol
l_
01

{{rules[
0].metr
ics}}

{{rules[
0].wind
ow}}

{{rul {{rules[
es[0] 0].grou
.tz}} p_by}}

{{rules[
0].ded
upe}}

{{rule
s[0].l
ate}}

{{rules[0
].recom
pute}}

{{rules
[0].che
cks}}

{{rules
[0].ow
ner}}

{{rule
s[0].n
otes}}

rol
l_
02

{{rules[
1].metr
ics}}

{{rules[
1].wind
ow}}

{{rul {{rules[
es[1] 1].grou
.tz}} p_by}}

{{rules[
1].ded
upe}}

{{rule
s[1].l
ate}}

{{rules[1
].recom
pute}}

{{rules
[1].che
cks}}

{{rules
[1].ow
ner}}

{{rule
s[1].n
otes}}

3) Global Rules (required if applies)

● Timezone standard: {{global.timezone}}
● Rounding rules: {{global.rounding}}
● Null/empty handling: {{global.null_handling}}

4) Verification Checklist (required if applies)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References
● Upstream: {{xref:RPT-02}} | OPTIONAL, {{xref:DQV-02}} | OPTIONAL
● Downstream: {{xref:RPT-04}}, {{xref:RPT-06}} | OPTIONAL, {{xref:BI-03}} | OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

RPT-04

RPT-03 — Aggregation & Rollup Rules
(windows, group-bys)
Header Block
● template_id: RPT-03
● title: Aggregation & Rollup Rules (windows, group-bys)
● type: reporting_aggregations
● template_version: 1.0.0
● output_path: 10_app/reporting/RPT-03_Aggregation_Rollup_Rules.md
● compliance_gate_id: TMP-05.PRIMARY.RPT
● upstream_dependencies: ["RPT-02", "DATA-07", "BI-02"]
● inputs_required: ["RPT-02", "DATA-07", "BI-02", "DQV-02", "STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}

Purpose
Define how metrics are aggregated and rolled up: time windows, grouping dimensions,
late-arriving data handling, deduplication rules, and recomputation policies. This ensures report
numbers are stable, explainable, and consistent across surfaces.

Inputs Required
● RPT-02: {{xref:RPT-02}} | OPTIONAL
● DATA-07: {{xref:DATA-07}} | OPTIONAL
● BI-02: {{xref:BI-02}} | OPTIONAL

● DQV-02: {{xref:DQV-02}} | OPTIONAL
● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Applicability (true/false). If false, mark N/A.
● Rollup rules catalog (minimum 15 rules)
● For each rule:
○ rollup_id
○ metric_id(s)
○ window type (hour/day/week/month/rolling)
○ window boundaries (timezone)
○ group-by dimensions allowed
○ dedupe rule (event_id/entity_id)
○ late-arriving data policy (backfill window)
○ recompute policy (full/partial)
○ correctness checks (reconciliation rule)
○ owner
● Global rules:
○ timezone standard for windows
○ rounding rules
○ null/empty handling
● Verification checklist

Optional Fields
● Cross-metric consistency rules | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● Every rollup must specify

## 5. Optional Fields

● Cross-metric consistency rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(windows, group-bys)**
- **Header Block**
- template_id: RPT-03
- title: Aggregation & Rollup Rules (windows, group-bys)
- type: reporting_aggregations
- template_version: 1.0.0
- output_path: 10_app/reporting/RPT-03_Aggregation_Rollup_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.RPT
- upstream_dependencies: ["RPT-02", "DATA-07", "BI-02"]
- inputs_required: ["RPT-02", "DATA-07", "BI-02", "DQV-02", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}
- **Purpose**
- **Define how metrics are aggregated and rolled up: time windows, grouping dimensions,**
- **late-arriving data handling, deduplication rules, and recomputation policies. This ensures report**
- **numbers are stable, explainable, and consistent across surfaces.**
- **Inputs Required**
- RPT-02: {{xref:RPT-02}} | OPTIONAL
- DATA-07: {{xref:DATA-07}} | OPTIONAL
- BI-02: {{xref:BI-02}} | OPTIONAL
- DQV-02: {{xref:DQV-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Applicability (true/false). If false, mark N/A.
- Rollup rules catalog (minimum 15 rules)
- For each rule:
- **○ rollup_id**
- **○ metric_id(s)**
- **○ window type (hour/day/week/month/rolling)**
- **○ window boundaries (timezone)**
- **○ group-by dimensions allowed**
- **○ dedupe rule (event_id/entity_id)**
- **○ late-arriving data policy (backfill window)**
- **○ recompute policy (full/partial)**
- **○ correctness checks (reconciliation rule)**
- **○ owner**
- Global rules:
- **○ timezone standard for windows**
- **○ rounding rules**
- **○ null/empty handling**
- Verification checklist
- **Optional Fields**
- Cross-metric consistency rules | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- If applies == false, include 00_NA block only.
- Every rollup must specify timezone and dedupe keys.
- Late-arriving data must have explicit backfill windows.
- Recompute policies must be deterministic and observable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Rollup Rules Catalog (canonical)`
3. `## llu`
4. `## metric`
5. `## windo`
6. `## time`
7. `## zon`
8. `## group_`
9. `## dedup`
10. `## e_key`

## 8. Cross-References

- Upstream: {{xref:RPT-02}} | OPTIONAL, {{xref:DQV-02}} | OPTIONAL
- Downstream: {{xref:RPT-04}}, {{xref:RPT-06}} | OPTIONAL, {{xref:BI-03}} | OPTIONAL
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- RPT-04
- RPT-03 — Aggregation & Rollup Rules
- (windows, group-bys)
- Header Block
- template_id: RPT-03
- title: Aggregation & Rollup Rules (windows, group-bys)
- type: reporting_aggregations
- template_version: 1.0.0
- output_path: 10_app/reporting/RPT-03_Aggregation_Rollup_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.RPT
- upstream_dependencies: ["RPT-02", "DATA-07", "BI-02"]
- inputs_required: ["RPT-02", "DATA-07", "BI-02", "DQV-02", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}
- Purpose
- **Define how metrics are aggregated and rolled up: time windows, grouping dimensions,**
- late-arriving data handling, deduplication rules, and recomputation policies. This ensures report
- numbers are stable, explainable, and consistent across surfaces.
- Inputs Required
- RPT-02: {{xref:RPT-02}} | OPTIONAL
- DATA-07: {{xref:DATA-07}} | OPTIONAL
- BI-02: {{xref:BI-02}} | OPTIONAL
- DQV-02: {{xref:DQV-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Required Fields
- Applicability (true/false). If false, mark N/A.
- Rollup rules catalog (minimum 15 rules)
- For each rule:
- ○ rollup_id
- ○ metric_id(s)
- ○ window type (hour/day/week/month/rolling)
- ○ window boundaries (timezone)
- ○ group-by dimensions allowed
- ○ dedupe rule (event_id/entity_id)
- ○ late-arriving data policy (backfill window)
- ○ recompute policy (full/partial)
- ○ correctness checks (reconciliation rule)
- ○ owner
- Global rules:
- ○ timezone standard for windows
- ○ rounding rules
- ○ null/empty handling
- Verification checklist
- Optional Fields
- Cross-metric consistency rules | OPTIONAL
- Notes | OPTIONAL
- Rules
- If applies == false, include 00_NA block only.
- Every rollup must specify

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
