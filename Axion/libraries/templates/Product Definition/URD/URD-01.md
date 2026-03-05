# URD-01 — Research Plan (questions,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | URD-01                                             |
| Template Type     | Product / User Research                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring research plan (questions,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Research Plan (questions, Document                         |

## 2. Purpose

Define a lightweight, execution-ready research plan that validates core product assumptions,
clarifies user needs, and de-risks the highest-impact decisions. This plan is a guide for
discovery work; it must remain aligned with product goals and avoid redefining requirements.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing research notes: {{inputs.research_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Research objectives (2–8) | spec         | Yes             |
| Key research questions... | spec         | Yes             |
| Hypotheses / assumptio... | spec         | Yes             |
| Participant criteria (... | spec         | Yes             |
| Sample size target (pe... | spec         | Yes             |
| Recruitment plan (how ... | spec         | Yes             |
| Script/guide outline (... | spec         | Yes             |
| Study logistics (tools... | spec         | Yes             |
| Data capture plan (not... | spec         | Yes             |
| Analysis plan (how fin... | spec         | Yes             |
| Output artifacts (what... | spec         | Yes             |

## 5. Optional Fields

●
●
●
●

Incentives | OPTIONAL
Risks / limitations | OPTIONAL
Accessibility accommodations | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Research questions must map back to:
- **○ product goals: {{xref:PRD-02}}**
- **○ personas/roles: {{xref:PRD-03}} | OPTIONAL**
- **○ major assumptions: {{xref:RISK-01}} | OPTIONAL**
- Do not claim results; this is a plan only.
- If sample size or recruitment approach is uncertain, mark UNKNOWN and include
- **mitigation.**
- Consent/recording must be explicitly addressed if any data is captured.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Study Overview`
2. `## 2) Objectives`
3. `## 3) Key Questions`
4. `## question`
5. `## mapped_goal_ids`
6. `## mapped_persona_i`
7. `## mapped_assumption_`
8. `## ids`
9. `## ons[0].text}}`
10. `## s[0].goal_ids}}`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-02}} | OPTIONAL, {{xref:PRD-03}} | OPTIONAL,
- **{{xref:RISK-01}} | OPTIONAL**
- Downstream: {{xref:URD-02}}, {{xref:URD-03}}, {{xref:URD-04}} | OPTIONAL,
- **{{xref:URD-05}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PRIVACY]}} | OPTIONAL

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
