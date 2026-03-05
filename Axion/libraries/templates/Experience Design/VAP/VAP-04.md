# VAP-04 — Asset Delivery Checklist

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | VAP-04                                             |
| Template Type     | Design / Visual Assets                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring asset delivery checklist    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Asset Delivery Checklist Document                         |

## 2. Purpose

Define the deterministic handoff checklist for delivering assets to engineering: what must be
provided, where it goes, how it is verified, and what “done” means. This prevents incomplete or
inconsistent asset deliveries.

## 3. Inputs Required

- ● VAP-01: {{xref:VAP-01}} | OPTIONAL
- ● VAP-02: {{xref:VAP-02}} | OPTIONAL
- ● RLB-05: {{xref:RLB-05}} | OPTIONAL
- ● A11YD-03: {{xref:A11YD-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Delivery package defin... | spec         | Yes             |
| Checklist items (minim... | spec         | Yes             |
| Verification steps (mi... | spec         | Yes             |
| For each delivered ass... | spec         | Yes             |
| ○ asset_ids included      | spec         | Yes             |
| ○ naming compliance check | spec         | Yes             |
| ○ density coverage check  | spec         | Yes             |
| ○ theme coverage check... | spec         | Yes             |
| ○ accessibility covera... | spec         | Yes             |
| ○ optimization check (... | spec         | Yes             |
| ○ version tagging rule... | spec         | Yes             |
| Acceptance criteria fo... | spec         | Yes             |

## 5. Optional Fields

● Release milestone mapping | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Handoff is not complete unless naming and export specs are met (VAP-02).
- Accessibility metadata must be included for informative assets (alt/labels).
- Engineering must have deterministic paths and keys for consumption.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Delivery Package (required)`
2. `## 2) Checklist (required, min 20)`
3. `## 3) Verification Steps (required, min 8)`
4. `## 4) Asset Set Validation Table (required)`
5. `## ass`
6. `## et_s`
7. `## et_i`
8. `## asset_i`
9. `## naming_`
10. `## densities`

## 8. Cross-References

- Upstream: {{xref:VAP-01}} | OPTIONAL, {{xref:VAP-02}} | OPTIONAL, {{xref:RLB-05}} |
- OPTIONAL
- Downstream: {{xref:FE-}} | OPTIONAL, {{xref:FPMP-}} | OPTIONAL, {{xref:QA-02}} |
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
