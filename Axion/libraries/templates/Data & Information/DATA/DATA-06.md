# DATA-06 — Validation Schemas

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-06                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring validation schemas    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Validation Schemas Document                         |

## 2. Purpose

Define the validation schema layer mapping from canonical entity fields to enforceable schemas
(Zod/JSON Schema/other): what is validated where, which schemas exist, and how schema
versions track entity evolution.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DQV-01: {{xref:DQV-01}} | OPTIONAL
- ● API-02: {{xref:API-02}} | OPTIONAL
- ● FORM-01: {{xref:FORM-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| For each schema:          | spec         | Yes             |
| ○ schema_id               | spec         | Yes             |
| ○ target entity_id or ... | spec         | Yes             |
| ○ schema language (zod... | spec         | Yes             |
| ○ version                 | spec         | Yes             |
| ○ required fields         | spec         | Yes             |
| ○ optional fields         | spec         | Yes             |
| ○ validation rules (fi... | spec         | Yes             |
| ○ error mapping policy... | spec         | Yes             |
| ○ reuse policy (shared... | spec         | Yes             |
| ○ enforcement point (c... | spec         | Yes             |

## 5. Optional Fields

● Codegen notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Schema enforcement must be explicit; “validated somewhere” is not allowed.
- Cross-field semantic validation must be captured (DQV).
- Validation errors must map to error model (ERR) and accessible error messaging
- **(A11Y/CDX pointers).**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Schema Registry (canonical)`
3. `## sch`
4. `## ema`
5. `## _id`
6. `## kind`
7. `## sch`
8. `## _01`
9. `## sch`
10. `## _02`

## 8. Cross-References

- Upstream: {{xref:DQV-01}} | OPTIONAL, {{xref:API-02}} | OPTIONAL
- Downstream: {{xref:DQV-03}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL
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
