# PERF-02 — Critical Path Inventory (user journeys)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-02                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring critical path inventory (user journeys)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Critical Path Inventory (user journeys) Document                         |

## 2. Purpose

Create the canonical inventory of performance-critical user journeys (“critical paths”), including
the screens/endpoints involved and why they matter. This inventory is used to prioritize profiling,
regression gates, and load testing.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Route map/layout: {{xref:FE-01}} | OPTIONAL
- Journey inventory: {{xref:RJT-01}} | OPTIONAL
- Performance overview: {{xref:PERF-01}} | OPTIONAL
- Latency budgets: {{xref:PERF-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Critical path registry... | spec         | Yes             |
| path_id (stable identi... | spec         | Yes             |
| Journey name/summary      | spec         | Yes             |
| User segment (who uses... | spec         | Yes             |
| Screens/routes involve... | spec         | Yes             |
| Endpoints involved (en... | spec         | Yes             |
| Success timing target ... | spec         | Yes             |
| Priority (P0/P1/P2/UNK... | spec         | Yes             |
| Owner (team)              | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Dependencies (third-party) | OPTIONAL

Notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Critical paths should map to real routes/screens and endpoint IDs.**
- **Timing targets should reference budgets where defined; otherwise use UNKNOWN.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Paths (repeat)`
3. `## Critical Path`
4. `## open_questions:`
5. `## (Repeat per path.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:PERF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PBP-05}}, {{xref:LOAD-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
