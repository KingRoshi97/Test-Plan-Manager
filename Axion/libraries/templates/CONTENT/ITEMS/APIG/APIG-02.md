# APIG-02 — Versioning Policy (v1/v2 rules,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | APIG-02                                             |
| Template Type     | Architecture / API Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring versioning policy (v1/v2 rules,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Versioning Policy (v1/v2 rules, Document                         |

## 2. Purpose

Define the API versioning and compatibility guarantees: what constitutes a breaking change,
how versions are expressed, how clients migrate, and what rules govern forward/backward
compatibility.

## 3. Inputs Required

- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● ARC-02: {{xref:ARC-02}} | OPTIONAL
- ● STK-04: {{xref:STK-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Versioning scheme:        | spec         | Yes             |
| ○ path-based (/v1)        | spec         | Yes             |
| ○ header-based            | spec         | Yes             |
| ○ query-based (discour... | spec         | Yes             |
| Compatibility guarante... | spec         | Yes             |
| Breaking change defini... | spec         | Yes             |
| Allowed non-breaking c... | spec         | Yes             |
| Client migration policy:  | spec         | Yes             |
| ○ how clients discover... | spec         | Yes             |
| ○ how long old version... | spec         | Yes             |
| Version ownership + ap... | spec         | Yes             |
| Version sunset/depreca... | spec         | Yes             |

## 5. Optional Fields

● Mobile app compatibility notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- No breaking changes in-place on a stable version.
- Version bump requires compatibility tests (APIG-05) and review gate (APIG-04).
- Old versions must have explicit sunset timelines.
- Any version scheme must be deterministic and documented.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Versioning Scheme (required)`
2. `## 2) Breaking Changes (required)`
3. `## 3) Non-Breaking Changes (required)`
4. `## 4) Compatibility Guarantees (required)`
5. `## 5) Client Migration Policy (required)`
6. `## 6) Ownership + Approval (required)`

## 8. Cross-References

- Upstream: {{xref:APIG-01}} | OPTIONAL
- Downstream: {{xref:APIG-03}}, {{xref:APIG-04}}, {{xref:APIG-05}}, {{xref:APIG-06}} |
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
