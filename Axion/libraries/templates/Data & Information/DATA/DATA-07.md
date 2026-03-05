# DATA-07 — Derived/Read Models Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-07                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring derived/read models spec    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Derived/Read Models Spec Document                         |

## 2. Purpose

Define the derived/read models used to optimize reads and UX: DB views, materialized views,
projections, denormalized tables, and read-optimized DTOs. This makes derived data explicit,
controlled, and consistent with canonical entities.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DATA-02: {{xref:DATA-02}} | OPTIONAL
- ● SRCH-03: {{xref:SRCH-03}} | OPTIONAL
- ● CACHE-03: {{xref:CACHE-03}} | OPTIONAL
- ● WFO-01: {{xref:WFO-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| For each read model:      | spec         | Yes             |
| ○ read_model_id           | spec         | Yes             |
| ○ type (view/materiali... | spec         | Yes             |
| ○ purpose / query patt... | spec         | Yes             |
| ○ source entities (can... | spec         | Yes             |
| ○ fields included (list)  | spec         | Yes             |
| ○ refresh/update strat... | spec         | Yes             |
| ■ sync on write           | spec         | Yes             |
| ■ async projection job    | spec         | Yes             |
| ■ scheduled recompute     | spec         | Yes             |
| ○ freshness expectatio... | spec         | Yes             |

## 5. Optional Fields

● Storage/cost notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Derived data must never become a hidden truth source; canonical entities remain
- **authoritative.**
- Update strategy must be explicit; “kept in sync” is not acceptable without mechanism.
- Access control must match PMAD/DGP policies; do not broaden access via denorm.
- Freshness and consistency must be declared and aligned with UX expectations.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Read Model Registry (canonical)`
3. `## rea`
4. `## type`
5. `## purp`
6. `## ose`
7. `## sourc`
8. `## e_ent`
9. `## ities`
10. `## upda`

## 8. Cross-References

- Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:SRCH-03}} | OPTIONAL,
- **{{xref:CACHE-03}} | OPTIONAL**
- Downstream: {{xref:CACHE-01}} | OPTIONAL, {{xref:RPT-03}} | OPTIONAL,
- **{{xref:QA-04}} | OPTIONAL**
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
