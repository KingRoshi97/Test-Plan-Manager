# DES-01 — UX Flows (happy paths + edge

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-01                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring ux flows (happy paths + edge    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled UX Flows (happy paths + edge Document                         |

## 2. Purpose

Define the user-facing workflows as step-by-step flows that can be implemented and tested.
Each flow must map to feature IDs and acceptance criteria, include edge cases, and remain
UI-framework agnostic while being behavior-specific.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-04: {{xref:PRD-04}}
- PRD-05: {{xref:PRD-05}} | OPTIONAL
- PRD-09: {{xref:PRD-09}} | OPTIONAL
- DMG-01: {{xref:DMG-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Flow list (minimum 5 f... | spec         | Yes             |
| For each flow:            | spec         | Yes             |
| ○ flow_id                 | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ primary persona(s)      | spec         | Yes             |
| ○ linked_feature_ids      | spec         | Yes             |
| ○ preconditions           | spec         | Yes             |
| ○ happy-path steps (or... | spec         | Yes             |
| ○ edge cases (minimum 2)  | spec         | Yes             |
| ○ entry points (where ... | spec         | Yes             |
| ○ exit outcomes (succe... | spec         | Yes             |
| ○ system feedback (loa... | spec         | Yes             |

## 5. Optional Fields

● Variants (mobile vs web differences) | OPTIONAL
● Timing/latency expectations (qualitative) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- **Flows must use existing IDs: feature IDs from PRD-04; acceptance IDs from PRD-09.**
- **Steps must be written as user actions + system response (both sides).**
- Do not define UI layout; reference screen IDs when known (DES-02/03).
- **Edge cases must include at least:**
- **○ validation failure or missing input**
- **○ permission/entitlement failure OR system failure (network/server)**
- If a flow touches sensitive data, reference relevant privacy/security constraints
- **(DGP/SEC) via pointers only.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Flow Index (summary)`
2. `## flo`
3. `## w_i`
4. `## name`
5. `## persona_ids`
6. `## feature_ids`
7. `## entry_poi`
8. `## exit_outc`
9. `## omes`
10. `## flow`

## 8. Cross-References

- Upstream: {{xref:PRD-04}}, {{xref:PRD-05}} | OPTIONAL, {{xref:PRD-09}} | OPTIONAL
- Downstream: {{xref:DES-02}}, {{xref:DES-03}}, {{xref:MAP-01}} | OPTIONAL,
- **{{xref:QA-02}} | OPTIONAL**
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
