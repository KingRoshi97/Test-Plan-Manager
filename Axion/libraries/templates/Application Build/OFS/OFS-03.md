# OFS-03 — Local Storage Schema (entities cached locally)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-03                                             |
| Template Type     | Build / Offline Support                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring local storage schema (entities cached locally)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Local Storage Schema (entities cached locally) Document                         |

## 2. Purpose

Define the canonical local storage schema for offline use: which entities are cached on-device,
table/collection structure, keys/indexes, retention/eviction rules, and encryption constraints. This
template must be consistent with offline scope and data protection policies and must not invent
local data storage beyond what is allowed.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- OFS-01 Offline Scope: {{ofs.scope}}
- SMD-02 Cache Strategy: {{smd.cache_strategy}}
- CSec-02 Data Protection: {{csec.data_protection}} | OPTIONAL
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Storage engine (sqlite... | spec         | Yes             |
| Cached entity list (en... | spec         | Yes             |
| Per-entity storage sha... | spec         | Yes             |
| Primary keys and indexes  | spec         | Yes             |
| Versioning/migrations ... | spec         | Yes             |
| Retention/eviction rul... | spec         | Yes             |
| Encryption requirement... | spec         | Yes             |
| PII constraints (do-no... | spec         | Yes             |
| Queue storage schema p... | spec         | Yes             |

## 5. Optional Fields

Delta sync fields (last_synced_at) | OPTIONAL

Compression policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not store prohibited data classes per {{xref:CSec-02}}.
- **Schema MUST support migrations without data loss where possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Storage Engine`
2. `## Cached Entities`
3. `## Entity Cache`
4. `## open_questions:`
5. `## (Repeat per cached entity.)`
6. `## Migrations / Versioning`
7. `## Retention / Eviction`
8. `## Encryption & PII Constraints`
9. `## Queue Storage Pointer`
10. `## OPTIONAL`

## 8. Cross-References

- **Upstream: {{xref:OFS-01}}, {{xref:SMD-02}}, {{xref:CSec-02}} | OPTIONAL,**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OFS-04}}, {{xref:OFS-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
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
