# SMIP-01 — KPI/OKR Definitions (targets +

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMIP-01                                             |
| Template Type     | Product / Metrics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring kpi/okr definitions (targets +    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled KPI/OKR Definitions (targets + Document                         |

## 2. Purpose

Define the canonical set of KPIs/OKRs with targets, owners, and measurement cadence. This is
the authoritative metrics layer that downstream analytics, dashboards, experimentation, and
release criteria reference.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- URD-05: {{xref:URD-05}} | OPTIONAL
- STK-01: {{xref:STK-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Metrics list (minimum 5)  | spec         | Yes             |
| For each metric:          | spec         | Yes             |
| ○ metric_id               | spec         | Yes             |
| ○ metric_name             | spec         | Yes             |
| ○ type (KPI/OKR/guardr... | spec         | Yes             |
| ○ definition (plain la... | spec         | Yes             |
| ○ formula/logic           | spec         | Yes             |
| target (number or thre... | spec         | Yes             |
| time_horizon (MVP/30/6... | spec         | Yes             |
| cadence (daily/weekly/... | spec         | Yes             |
| owner (stakeholder_id ... | spec         | Yes             |
| data_source (or UNKNOWN)  | spec         | Yes             |

## 5. Optional Fields

● Baseline values | OPTIONAL
● Notes | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Every PRD-02 goal must map to at least one metric (enforced in PRD-02).
- Metrics must be measurable; if target is UNKNOWN, include the plan for setting it (in
- **notes).**
- If data_source is UNKNOWN, it must create a SMIP-02 instrumentation question.
- Guardrails must specify stop conditions or thresholds.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Metrics Catalog (canonical)`
2. `## m na`
3. `## e me`
4. `## typ`
5. `## defi`
6. `## nitio`
7. `## for`
8. `## mul`
9. `## a/lo`
10. `## gic`

## 8. Cross-References

- Upstream: {{xref:PRD-02}} | OPTIONAL, {{xref:URD-05}} | OPTIONAL
- Downstream: {{xref:SMIP-02}}, {{xref:SMIP-03}} | OPTIONAL, {{xref:SMIP-04}} |
- **OPTIONAL, {{xref:OBS-05}} | OPTIONAL, {{xref:EXPER-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
