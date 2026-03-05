# SIC-04 — Data Mapping Contract (field

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIC-04                                             |
| Template Type     | Architecture / Interfaces                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data mapping contract (field    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Mapping Contract (field Document                         |

## 2. Purpose

Define deterministic field-level mappings between external interface schemas and internal
canonical models: transforms, defaults, validation, and rejection rules. This prevents “silent
mapping drift” and makes integration behavior auditable.

## 3. Inputs Required

- ● SIC-02: {{xref:SIC-02}} | OPTIONAL
- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DMG-01: {{xref:DMG-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| One mapping block per ... | spec         | Yes             |
| For each mapping:         | spec         | Yes             |
| ○ mapping_id              | spec         | Yes             |
| ○ interface_id            | spec         | Yes             |
| ○ external_object         | spec         | Yes             |
| ○ internal_entity_or_dto  | spec         | Yes             |
| ○ direction (inbound/o... | spec         | Yes             |
| ○ field mapping table:    | spec         | Yes             |
| ■ external_field          | spec         | Yes             |
| ■ internal_field          | spec         | Yes             |
| ■ type conversion         | spec         | Yes             |
| ■ transform rule          | spec         | Yes             |

## 5. Optional Fields

● Example input/output pairs | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Required fields must not be silently defaulted unless explicitly allowed.
- Any transformation must be reversible or documented if lossy.
- If validation fails, behavior must be deterministic and mapped to reason codes.
- PII classification must be explicit; no hidden sensitive fields.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Field Map (canonical)`
2. `## extern`
3. `## al_fiel`
4. `## intern`
5. `## al_fiel`
6. `## type_c`
7. `## onv`
8. `## transfo`
9. `## defaul`
10. `## requir`

## 8. Cross-References

- Upstream: {{xref:SIC-02}} | OPTIONAL, {{xref:DATA-01}} | OPTIONAL, {{xref:DMG-01}} |
- OPTIONAL
- Downstream: {{xref:SIC-05}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
