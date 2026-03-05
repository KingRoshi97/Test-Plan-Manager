# DMG-03 — Invariants & Definitions

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DMG-03                                             |
| Template Type     | Product / Domain Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring invariants & definitions    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Invariants & Definitions Document                         |

## 2. Purpose

Define the non-negotiable domain truths (invariants) and formal definitions that must hold
across all implementations. These rules anchor validation, database constraints, authorization,
and test assertions.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- DMG-02: {{xref:DMG-02}}
- BRP-01: {{xref:BRP-01}} | OPTIONAL
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Invariants list (minim... | spec         | Yes             |
| For each invariant:       | spec         | Yes             |
| ○ inv_id                  | spec         | Yes             |
| ○ statement (must/never)  | spec         | Yes             |
| ○ scope (entity/relati... | spec         | Yes             |
| ○ related_entity_ids      | spec         | Yes             |
| ○ related_business_rul... | spec         | Yes             |
| ○ enforcement points (... | spec         | Yes             |
| ○ test strategy (how t... | spec         | Yes             |
| ○ severity (hard/soft)    | spec         | Yes             |

## 5. Optional Fields

● Exception cases | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Invariants must be testable (can be asserted).
- If an invariant conflicts with BRP rules, escalate to STK-02 decision.
- “Hard” invariants must declare at least one enforcement point and a test strategy.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Invariants (canonical)`
2. `## stateme`
3. `## scope`
4. `## entity_id`
5. `## br_rule`
6. `## _ids`
7. `## test_strat`
8. `## egy`
9. `## severity`
10. `## exceptio`

## 8. Cross-References

- Upstream: {{xref:DMG-02}}, {{xref:BRP-01}} | OPTIONAL
- Downstream: {{xref:DATA-03}}, {{xref:API-02}}, {{xref:QA-02}} | OPTIONAL
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
