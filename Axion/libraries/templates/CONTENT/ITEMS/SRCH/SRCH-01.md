# SRCH-01 — Search Scope & Surfaces

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SRCH-01                                             |
| Template Type     | Data / Search                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring search scope & surfaces    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Search Scope & Surfaces Document                         |

## 2. Purpose

Define what content/entities are searchable and where search appears in the product
(surfaces): global search, per-page search, admin search, filters, and discovery surfaces. This
prevents inconsistent search scope and makes indexing requirements deterministic.

## 3. Inputs Required

- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● DISC-03: {{xref:DISC-03}} | OPTIONAL
- ● IAN-01: {{xref:IAN-01}} | OPTIONAL
- ● DGL-04: {{xref:DGL-04}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each surface:         | spec         | Yes             |
| ○ surface_id              | spec         | Yes             |
| ○ platform (web/mobile... | spec         | Yes             |
| ○ location (nav, page,... | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ searchable entity types | spec         | Yes             |
| ○ permissions requirem... | spec         | Yes             |
| ○ UX constraints point... | spec         | Yes             |
| Searchable entity inve... | spec         | Yes             |
| ○ entity_id               | spec         | Yes             |
| ○ fields searchable       | spec         | Yes             |
| ○ sensitivity constrai... | spec         | Yes             |

## 5. Optional Fields

● SEO/public discovery notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Search results must respect authorization; never leak existence of private entities.
- Sensitive fields must be excluded or transformed (hash/redact).
- Surfaces must specify empty/error states pointers.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Search Surfaces (canonical)`
3. `## surf`
4. `## ace`
5. `## _id`
6. `## platform`
7. `## location`
8. `## purpose`
9. `## entity_typ`
10. `## perms_ru`

## 8. Cross-References

- Upstream: {{xref:DISC-03}} | OPTIONAL, {{xref:DGL-04}} | OPTIONAL, {{xref:IAN-01}} |
- OPTIONAL
- Downstream: {{xref:SRCH-02}}, {{xref:SRCH-03}} | OPTIONAL, {{xref:SRCH-05}} |
- **OPTIONAL, {{xref:SRCH-06}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-A11Y]}} | OPTIONAL,
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
