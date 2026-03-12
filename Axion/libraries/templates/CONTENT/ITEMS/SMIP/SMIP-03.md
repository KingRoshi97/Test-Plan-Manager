# SMIP-03 — Funnel/Conversion Definitions

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMIP-03                                             |
| Template Type     | Product / Metrics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring funnel/conversion definitions    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Funnel/Conversion Definitions Document                         |

## 2. Purpose

Define the canonical funnels and conversion events used to measure product success. Funnels
must be linked to analytics events and have clear step definitions to prevent metric drift.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- SMIP-01: {{xref:SMIP-01}}
- SMIP-02: {{xref:SMIP-02}}
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Funnel list (minimum 2)   | spec         | Yes             |
| For each funnel:          | spec         | Yes             |
| ○ funnel_id               | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ audience/persona (op... | spec         | Yes             |
| ○ steps (ordered), eac... | spec         | Yes             |
| ○ conversion definitio... | spec         | Yes             |
| ○ window (time window)    | spec         | Yes             |
| ○ segmentation rules (... | spec         | Yes             |
| ○ linked metric_ids       | spec         | Yes             |
| ○ guardrails (optional)   | spec         | Yes             |

## 5. Optional Fields

● Drop-off analysis notes | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Every funnel step must reference events defined in SMIP-02.
- Conversion must be measurable and unambiguous.
- Time window must be explicit.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Funnel Catalog (canonical)`
2. `## name`
3. `## purpos`
4. `## steps`
5. `## convers`
6. `## ion_defi`
7. `## nition`
8. `## windo`
9. `## segme`
10. `## nts`

## 8. Cross-References

- Upstream: {{xref:SMIP-01}}, {{xref:SMIP-02}}
- Downstream: {{xref:BI-}} | OPTIONAL, {{xref:EXPER-}} | OPTIONAL
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
