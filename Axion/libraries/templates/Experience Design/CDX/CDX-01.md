# CDX-01 — Content Style Guide (tone,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CDX-01                                             |
| Template Type     | Design / Content                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring content style guide (tone,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Content Style Guide (tone, Document                         |

## 2. Purpose

Define the canonical content rules the product uses everywhere (UI copy, onboarding,
notifications, errors): voice, tone, terminology, readability, and accessibility-safe writing. This
prevents copy drift and makes content production deterministic.

## 3. Inputs Required

- ● DMG-01: {{xref:DMG-01}} | OPTIONAL
- ● PRD-01: {{xref:PRD-01}} | OPTIONAL
- ● PRD-03: {{xref:PRD-03}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Brand voice definition... | spec         | Yes             |
| Terminology rules:        | spec         | Yes             |
| ○ canonical terms (fro... | spec         | Yes             |
| ○ forbidden / deprecat... | spec         | Yes             |
| ○ naming rules for rol... | spec         | Yes             |
| Readability rules (gra... | spec         | Yes             |
| Inclusive language rules  | spec         | Yes             |
| Localization readiness... | spec         | Yes             |
| Examples: “do/don’t” p... | spec         | Yes             |

## 5. Optional Fields

● Legal/compliance wording constraints | OPTIONAL
● Brand punctuation/casing preferences | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Canonical terms must match DMG-01; if conflict, update glossary or log decision.
- Error copy must be actionable and non-blaming.
- Avoid idioms and culture-specific slang if localization is expected.
- Do not encode meaning in emoji alone; if emojis are used, they are decorative and
- **optional.**
- Messages should be scannable: front-load key info; keep sentences short.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Voice (required)`
2. `## 2) Tone by Context (required)`
3. `## context`
4. `## tone`
5. `## goal`
6. `## example`
7. `## success`
8. `## neutral`
9. `## warning`
10. `## error`

## 8. Cross-References

- Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:PRD-01}} | OPTIONAL, {{xref:PRD-03}} |
- OPTIONAL
- Downstream: {{xref:CDX-02}}, {{xref:CDX-03}}, {{xref:CDX-04}}, {{xref:CDX-05}}
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
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
