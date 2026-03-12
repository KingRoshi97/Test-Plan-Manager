# RPT-06 — Reporting Data Quality Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RPT-06                                             |
| Template Type     | Data / Reporting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring reporting data quality rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Reporting Data Quality Rules Document                         |

## 2. Purpose

Define how reporting correctness is verified: reconciliation rules between raw sources and
aggregates/snapshots, acceptable deltas, auditability of metric computations, and actions when
discrepancies are detected.

## 3. Inputs Required

- ● RPT-02: {{xref:RPT-02}} | OPTIONAL
- ● RPT-03: {{xref:RPT-03}} | OPTIONAL
- ● DQV-02: {{xref:DQV-02}} | OPTIONAL
- ● DQV-06: {{xref:DQV-06}} | OPTIONAL
- ● BI-05: {{xref:BI-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Applicability (true/false). If false, mark N/A.
● Reconciliation rules catalog (minimum 15 rules)
● For each rule:
○ recon_id
○ metric_id
○ source of truth dataset(s)
○ reporting dataset (rollup/snapshot)
○ reconciliation method (exact match, bounded delta)
○ acceptable delta (percent/absolute)
○ schedule (daily/weekly)
○ owner
○ failure action (alert, block release, recompute)
○ evidence artifact (report)
● Global rules:
○ how to handle late data affecting reports
○ recompute policy linkage (RPT-04)
● Verification checklist

Optional Fields
● Audit-ready evidence pack outline | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● Every metric used in reporting must have at least one reconciliation rule.
● Acceptable deltas must be explicit and justified.
● Failures must have deterministic actions and owners.

Output Format
1) Applicability
● applies: {{recon.applies}} (true/false)
● 00_NA (if not applies): {{recon.na_block}} | OPTIONAL

2) Reconciliation Rules (canonical)
re
c
o
n
_i
d

metric
_id

sourc
e_trut
h

report
ing_t
arget

metho
d

acce
ptabl
e_del
ta

sched
ule

owner

action

eviden
ce

notes

re
c_
01

{{rules {{rules
[0].met [0].sou
ric}}
rce}}

{{rules
[0].tar
get}}

{{rules[
0].met
hod}}

{{rule
s[0].d
elta}}

{{rules[
0].sche
dule}}

{{rules
[0].ow
ner}}

{{rules
[0].acti
on}}

{{rules[
0].evid
ence}}

{{rules
[0].not
es}}

re
c_
02

{{rules {{rules
[1].met [1].sou
ric}}
rce}}

{{rules
[1].tar
get}}

{{rules[
1].met
hod}}

{{rule
s[1].d
elta}}

{{rules[
1].sche
dule}}

{{rules
[1].ow
ner}}

{{rules
[1].acti
on}}

{{rules[
1].evid
ence}}

{{rules
[1].not
es}}

3) Global Rules (required if applies)
● Late data handling: {{global.late_data}}
● Recompute linkage pointer: {{xref:RPT-04}} | OPTIONAL
● Escalation path: {{global.escalation}} | OPTIONAL

4) Verification Checklist (required if applies)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References
● Upstream: {{xref:DQV-02}} | OPTIONAL, {{xref:RPT-04}} | OPTIONAL
● Downstream: {{xref:ALRT-*}} | OPTIONAL, {{xref:RELOPS-05}} | OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 5. Optional Fields

● Audit-ready evidence pack outline | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(reconciliation, correctness)**
- **Header Block**
- template_id: RPT-06
- title: Reporting Data Quality Rules (reconciliation, correctness)
- type: reporting_aggregations
- template_version: 1.0.0
- output_path: 10_app/reporting/RPT-06_Reporting_Data_Quality_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.RPT
- upstream_dependencies: ["RPT-02", "RPT-03", "DQV-02"]
- inputs_required: ["RPT-02", "RPT-03", "DQV-02", "DQV-06", "BI-05",
- **"STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}
- **Purpose**
- **Define how reporting correctness is verified: reconciliation rules between raw sources and**
- **aggregates/snapshots, acceptable deltas, auditability of metric computations, and actions when**
- **discrepancies are detected.**
- **Inputs Required**
- RPT-02: {{xref:RPT-02}} | OPTIONAL
- RPT-03: {{xref:RPT-03}} | OPTIONAL
- DQV-02: {{xref:DQV-02}} | OPTIONAL
- DQV-06: {{xref:DQV-06}} | OPTIONAL
- BI-05: {{xref:BI-05}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Applicability (true/false). If false, mark N/A.
- Reconciliation rules catalog (minimum 15 rules)
- For each rule:
- **○ recon_id**
- **○ metric_id**
- **○ source of truth dataset(s)**
- **○ reporting dataset (rollup/snapshot)**
- **○ reconciliation method (exact match, bounded delta)**
- **○ acceptable delta (percent/absolute)**
- **○ schedule (daily/weekly)**
- **○ owner**
- **○ failure action (alert, block release, recompute)**
- **○ evidence artifact (report)**
- Global rules:
- **○ how to handle late data affecting reports**
- **○ recompute policy linkage (RPT-04)**
- Verification checklist
- **Optional Fields**
- Audit-ready evidence pack outline | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- If applies == false, include 00_NA block only.
- Every metric used in reporting must have at least one reconciliation rule.
- Acceptable deltas must be explicit and justified.
- Failures must have deterministic actions and owners.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Reconciliation Rules (canonical)`
3. `## metric`
4. `## _id`
5. `## sourc`
6. `## e_trut`
7. `## report`
8. `## ing_t`
9. `## arget`
10. `## metho`

## 8. Cross-References

- Upstream: {{xref:DQV-02}} | OPTIONAL, {{xref:RPT-04}} | OPTIONAL
- Downstream: {{xref:ALRT-*}} | OPTIONAL, {{xref:RELOPS-05}} | OPTIONAL
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
