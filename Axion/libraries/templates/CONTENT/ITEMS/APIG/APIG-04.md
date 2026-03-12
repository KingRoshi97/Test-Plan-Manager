# APIG-04 — Review Gate Checklist (what

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | APIG-04                                             |
| Template Type     | Architecture / API Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring review gate checklist (what    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Review Gate Checklist (what Document                         |

## 2. Purpose

Define the mandatory checklist that must pass before an API (endpoint group or version) can
ship. This is the quality/gov gate that enforces consistency, security, compatibility, and test
coverage.

## 3. Inputs Required

- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● PMAD-03: {{xref:PMAD-03}} | OPTIONAL
- ● QA-05: {{xref:QA-05}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● RLIM-01: {{xref:RLIM-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Checklist categories:     | spec         | Yes             |
| ○ spec completeness       | spec         | Yes             |
| ○ security/authz          | spec         | Yes             |
| ○ error contract          | spec         | Yes             |
| ○ pagination/filtering    | spec         | Yes             |
| ○ rate limits             | spec         | Yes             |
| ○ observability           | spec         | Yes             |
| ○ testing                 | spec         | Yes             |
| ○ compatibility/versio... | spec         | Yes             |
| Checklist items (minim... | spec         | Yes             |
| For each item:            | spec         | Yes             |
| ○ check_id                | spec         | Yes             |

## 5. Optional Fields

● Review roles (who reviews) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Checklist items must be testable/verifiable.
- Exceptions (if allowed) must be time-bound and recorded.
- No shipping if authz enforcement is missing.
- Compatibility checks required for stable APIs.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Checklist (required, min 35)`
2. `## 2) Failure Handling (required)`
3. `## 3) Waiver Policy (required)`

## 8. Cross-References

- Upstream: {{xref:APIG-01}} | OPTIONAL, {{xref:PMAD-03}} | OPTIONAL,
- **{{xref:ERR-03}} | OPTIONAL**
- Downstream: {{xref:APIG-05}}, {{xref:REL-01}} | OPTIONAL, {{xref:RELOPS-05}} |
- OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
