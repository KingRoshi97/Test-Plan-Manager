# URD-02 — Findings Summary (themes +

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | URD-02                                             |
| Template Type     | Product / User Research                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring findings summary (themes +    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Findings Summary (themes + Document                         |

## 2. Purpose

Capture research outcomes as clear themes supported by evidence. This document turns raw
notes into actionable insights and creates traceable inputs for needs/pain points, journey
mapping, PRD refinements, and risk reduction.

## 3. Inputs Required

- ● URD-01: {{xref:URD-01}}
- ● PRD-01: {{xref:PRD-01}} | OPTIONAL
- ● PRD-02: {{xref:PRD-02}} | OPTIONAL
- ● PRD-03: {{xref:PRD-03}} | OPTIONAL
- ● Raw notes/transcripts: {{inputs.raw_notes}} | OPTIONAL
- ● Recordings: {{inputs.recordings}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Study metadata (dates,... | spec         | Yes             |
| Participants summary (... | spec         | Yes             |
| Themes list (minimum 3)   | spec         | Yes             |
| For each theme:           | spec         | Yes             |
| ○ theme_id                | spec         | Yes             |
| ○ statement (1–2 sente... | spec         | Yes             |
| ○ supporting evidence ... | spec         | Yes             |
| ○ frequency/strength s... | spec         | Yes             |
| ○ impacted personas       | spec         | Yes             |
| ○ mapped research ques... | spec         | Yes             |
| ○ implications (what i... | spec         | Yes             |
| Top insights (top 3–7)    | spec         | Yes             |

## 5. Optional Fields

● Contradictions / outliers | OPTIONAL
● Artifact links (notes repository) | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PRIVACY]}} | OPTIONAL
- Evidence must be anonymized unless explicitly allowed.
- Themes must map back to URD-01 research questions where possible.
- Do not convert recommendations into requirements here; PRD updates happen
- **downstream and must be tracked as decisions if changed.**
- If evidence is missing for a theme, the theme cannot be included (fails gate).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Study Metadata`
2. `## 2) Participants Summary`
3. `## 3) Themes (required)`
4. `## them`
5. `## e_id`
6. `## theme_statem`
7. `## ent`
8. `## strength_sig`
9. `## nal`
10. `## impacted_pers`

## 8. Cross-References

- Upstream: {{xref:URD-01}}, {{xref:PRD-01}} | OPTIONAL, {{xref:PRD-02}} | OPTIONAL,
- **{{xref:PRD-03}} | OPTIONAL**
- Downstream: {{xref:URD-03}}, {{xref:URD-04}} | OPTIONAL, {{xref:URD-05}} |
- **OPTIONAL, {{xref:PRD-04}} | OPTIONAL, {{xref:RISK-02}} | OPTIONAL, {{xref:STK-02}}**
- | OPTIONAL
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
