# ARC-10 — Architecture Constraints &

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-10                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring architecture constraints &    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Architecture Constraints & Document                         |

## 2. Purpose

Define the architecture-level constraints and invariants that must always hold, regardless of
feature changes: boundary rules, data ownership rules, consistency expectations, security
constraints, and operational constraints. These act as hard guardrails for implementation and
review gates.

## 3. Inputs Required

- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● DMG-03: {{xref:DMG-03}} | OPTIONAL
- ● RISK-02: {{xref:RISK-02}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● APIG-02: {{xref:APIG-02}} | OPTIONAL
- ● WFO-03: {{xref:WFO-03}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Constraint list (minim... | spec         | Yes             |
| For each constraint:      | spec         | Yes             |
| ○ con_id                  | spec         | Yes             |
| ○ statement (must/never)  | spec         | Yes             |
| ○ category (boundary/d... | spec         | Yes             |
| ○ scope (system/bounda... | spec         | Yes             |
| ○ detection method (ho... | spec         | Yes             |
| ○ owner (role/team)       | spec         | Yes             |
| ○ severity (hard/soft)    | spec         | Yes             |
| ○ related docs (refs t... | spec         | Yes             |
| Exception policy (how ... | spec         | Yes             |

## 5. Optional Fields

● Examples (good/bad) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- “Hard” constraints must have detection method + enforcement point.
- Constraints must be non-redundant with DMG invariants; DMG are domain truths; ARC
- **are architecture truths. If overlap exists, cross-reference and keep one authoritative.**
- Any exception must be time-bound and recorded (STK decision pointer).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Constraints Registry (canonical)`
2. `## c stateme`
3. `## categor`
4. `## scope`
5. `## enforce`
6. `## ment_po`
7. `## ints`
8. `## detecti`
9. `## on_met`
10. `## hod`

## 8. Cross-References

- Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL, {{xref:RISK-02}} |
- OPTIONAL
- Downstream: {{xref:APIG-04}} | OPTIONAL, {{xref:QA-05}} | OPTIONAL, {{xref:RELIA-*}}
- | OPTIONAL
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
