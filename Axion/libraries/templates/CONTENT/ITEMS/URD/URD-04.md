# URD-04 — Journey Map (current vs target)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | URD-04                                             |
| Template Type     | Product / User Research                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring journey map (current vs target)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Journey Map (current vs target) Document                         |

## 2. Purpose

Document the user journey in two states—current and target—to clarify steps, emotions/friction,
and opportunities for intervention. This provides a bridge between research findings and design
flows without specifying UI layout or implementation.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- URD-02: {{xref:URD-02}}
- URD-03: {{xref:URD-03}}
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Persona(s) covered (at... | spec         | Yes             |
| Journey scope (which u... | spec         | Yes             |
| Journey phases (3–10)     | spec         | Yes             |
| For each phase (curren... | spec         | Yes             |
| ○ user goal               | spec         | Yes             |
| ○ user actions            | spec         | Yes             |
| ○ touchpoints/channels    | spec         | Yes             |
| ○ pain points/friction    | spec         | Yes             |
| ○ evidence pointer(s)     | spec         | Yes             |
| ○ opportunity notes       | spec         | Yes             |
| Summary of top frictio... | spec         | Yes             |
| Summary of target impr... | spec         | Yes             |

## 5. Optional Fields

●
●
●
●

Emotional curve (qualitative) | OPTIONAL
Ownership/actor mapping (who does what) | OPTIONAL
Mapped feature IDs | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Every major friction should map to URD-02 themes and URD-03 items when possible.**
- Do not define screens/routes; that belongs in DES templates.
- If mapping to features, only use existing IDs from PRD-04.
- **Evidence pointers must exist for any claimed pain point.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Journey Setup`
2. `## 2) Journey Map — Current State (required)`
3. `## phase_na`
4. `## user_`
5. `## goal`
6. `## user_a`
7. `## ctions`
8. `## touchpoi`
9. `## nts`
10. `## friction/`

## 8. Cross-References

- Upstream: {{xref:URD-02}}, {{xref:URD-03}}, {{xref:PRD-03}} | OPTIONAL
- Downstream: {{xref:DES-01}}, {{xref:PRD-04}} | OPTIONAL, {{xref:RSC-03}} |
- OPTIONAL
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
