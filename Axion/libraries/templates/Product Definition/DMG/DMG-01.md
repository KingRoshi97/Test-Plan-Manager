# DMG-01 — Domain Glossary (canonical

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DMG-01                                             |
| Template Type     | Product / Domain Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring domain glossary (canonical    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Domain Glossary (canonical Document                         |

## 2. Purpose

Create the canonical vocabulary for the product domain so all docs, APIs, schemas, UI copy,
and tests use consistent meanings. This is the authority for naming and definitions (not
implementation).

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing terminology notes: {{inputs.term_notes}} | OPTIONAL

## 4. Required Fields

● Term list (minimum 20 for non-trivial products; justify if smaller)
● For each term:
○ term_id
○ term
○ definition (1–3 sentences)
○ synonyms (if any)
○ anti-definition (what it is NOT) | OPTIONAL

○ related terms
○ canonical usage examples (1–3)
○ owner (who can change definition)
● Naming rules (basic, product-specific)
● Deprecated terms list (if any)

## 5. Optional Fields

● Acronyms list | OPTIONAL
● External references | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Definitions must not conflict with PRD and DMG-02; if conflict exists, log in PRD-08
- **and/or STK-02.**
- Prefer one canonical term per concept; synonyms must point to canonical term_id.
- Deprecations must include replacement term_id.
- Terms used in IDs (feature/entity/endpoint) should match canonical term spellings where
- **possible.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Glossary (canonical)`
2. `## ter`
3. `## term`
4. `## definitio`
5. `## synonym`
6. `## not_this`
7. `## related_t`
8. `## erm_ids`
9. `## usage_e`
10. `## xamples`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-03}} | OPTIONAL, {{xref:PRD-04}} | OPTIONAL
- Downstream: {{xref:DMG-02}}, {{xref:DATA-01}} | OPTIONAL, {{xref:API-01}} |
- **OPTIONAL, {{xref:FE-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
