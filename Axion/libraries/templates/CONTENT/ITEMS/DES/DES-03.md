# DES-03 — Screen Spec (per screen:

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-03                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring screen spec (per screen:    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Screen Spec (per screen: Document                         |

## 2. Purpose

Define implementable behavior for each screen: purpose, data needs, UI states, actions,
validations, and error handling. This is the authoritative behavioral spec for frontend/mobile
implementation.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- DES-02: {{xref:DES-02}}
- DES-05: {{xref:DES-05}} | OPTIONAL
- PRD-09: {{xref:PRD-09}} | OPTIONAL
- DMG-01: {{xref:DMG-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| One spec block per scr... | spec         | Yes             |
| For each screen:          | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ entry conditions        | spec         | Yes             |
| ○ data required (entit... | spec         | Yes             |
| ○ primary UI states (l... | spec         | Yes             |
| ○ actions (user action... | spec         | Yes             |
| ○ validation rules (if... | spec         | Yes             |
| ○ error cases + user f... | spec         | Yes             |
| ○ navigation outcomes ... | spec         | Yes             |
| ○ mapped acceptance cr... | spec         | Yes             |
| ○ access requirements     | spec         | Yes             |

## 5. Optional Fields

● Analytics events (screen_view, action events) | OPTIONAL
● Performance expectations (qualitative) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- No layout pixel specs; describe structure as regions (header/body/footer, list/detail, etc.).
- Actions must be deterministic: action → system response → next state.
- Acceptance criteria must reference PRD-09 IDs when available.

## 7. Output Format

### Required Headings (in order)

1. `## States`
2. `## Actions`
3. `## Validation (if applicable)`
4. `## Error Cases`
5. `## Acceptance Criteria`
6. `## Analytics (optional)`
7. `## Notes`

## 8. Cross-References

- Upstream: {{xref:DES-02}}, {{xref:DES-05}} | OPTIONAL, {{xref:PRD-09}} | OPTIONAL
- Downstream: {{xref:FE-02}}, {{xref:FORM-}} | OPTIONAL, {{xref:CER-}} | OPTIONAL,
- **{{xref:MAP-01}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL**
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
