# ARC-02 — Core Contracts Overview (APIs,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-02                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring core contracts overview (apis,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Core Contracts Overview (APIs, Document                         |

## 2. Purpose

Provide a single place to list the system’s core contracts and shared models: primary APIs, key
events/messages, canonical entities, and shared schemas. This is a map and index—not the
full per-contract detail (those live in API/DATA/RTM/SIC templates).

## 3. Inputs Required

- ● ARC-01: {{xref:ARC-01}}
- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● DMG-02: {{xref:DMG-02}} | OPTIONAL
- ● DMG-04: {{xref:DMG-04}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Canonical entity list ... | spec         | Yes             |
| Shared schema/model li... | spec         | Yes             |
| Ownership mapping:        | spec         | Yes             |
| ○ contract → boundary ... | spec         | Yes             |
| ○ contract → downstrea... | spec         | Yes             |

## 5. Optional Fields

● Deprecations in progress | OPTIONAL
● Links/pointers to detailed specs (API-01/API-02, DATA-01, RTM-03, SIC-02) |
OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Every contract must have exactly one primary owner boundary.
- Shared models must have versioning or evolution rules (pointer to APIG-06 / DATA-04).
- If a contract is “stable,” it must have a compatibility expectation stated (APIG).
- Do not duplicate detailed schemas here; reference the authoritative doc.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Contract Registry (canonical)`
2. `## con ca`
3. `## trac te`
4. `## t_id go`
5. `## name`
6. `## owner_`
7. `## bounda`
8. `## ry_id`
9. `## consumer`
10. `## stability`

## 8. Cross-References

- Upstream: {{xref:ARC-01}}, {{xref:DMG-02}} | OPTIONAL, {{xref:DMG-04}} | OPTIONAL
- Downstream: {{xref:API-01}} | OPTIONAL, {{xref:API-02}} | OPTIONAL, {{xref:DATA-01}}
- **| OPTIONAL, {{xref:RTM-03}} | OPTIONAL, {{xref:SIC-02}} | OPTIONAL,**
- **{{xref:APIG-02}} | OPTIONAL, {{xref:APIG-06}} | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- beginner: Required. Contract registry with owners and categories.
- intermediate: Required. Add stability classification and detail spec refs.
- advanced: Required. Add compatibility summary and deprecations trackin

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
