# PRD-01 — Product Overview

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-01                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring product overview    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Product Overview Document                         |

## 2. Purpose

Create the single, canonical overview of the product: what it is, who it serves, the problems it
solves, and the boundaries of the build. This document must be consistent with the Canonical
Spec and must not invent requirements not present in upstream inputs.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Product name              | spec         | Yes             |
| One-sentence product s... | spec         | Yes             |
| Primary user types        | spec         | Yes             |
| Problem statement         | spec         | Yes             |
| Value proposition         | spec         | Yes             |
| Primary use cases (top... | spec         | Yes             |
| Scope boundaries (in-s... | spec         | Yes             |
| Success definition (hi... | spec         | Yes             |
| Constraints (top 3–10)    | spec         | Yes             |
| Assumptions (top 3–10)    | spec         | Yes             |

## 5. Optional Fields

●
●
●
●
●

Competitive/alternative solutions | OPTIONAL
Business model overview | OPTIONAL
Phasing notes (MVP vs later) | OPTIONAL
Key risks | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not restate full details that belong in other PRD docs; reference them.
- **Every claim must be traceable to an input or explicitly marked UNKNOWN.**
- Do not introduce new feature IDs; use: {{spec.features_by_id}} and reference IDs
- **(feat_*) as given.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## 1) Product Identity`
2. `## 2) Users & Audience`
3. `## Primary user types:`
4. `## 3) Problem Statement`
5. `## 4) Value Proposition`
6. `## 5) Core Use Cases (Top)`
7. `## List the top use cases in priority order. Each should map to one or more feature IDs.`
8. `## 6) Scope Boundaries`
9. `## In-scope (MVP):`
10. `## Out-of-scope (explicit):`

## 8. Cross-References

- Upstream: {{xref:Canonical_Spec}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- Downstream: {{xref:PRD-04}}, {{xref:PRD-06}}, {{xref:IMP-01}} | OPTIONAL
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
