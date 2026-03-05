# ROUTE-01 — Route Contract (paths, params, types)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-01                                             |
| Template Type     | Build / Routing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring route contract (paths, params, types)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Route Contract (paths, params, types) Document                         |

## 2. Purpose

Define the canonical route contract for the application: how routes are named, how paths are
structured, how params and query params are typed/validated, and how route changes interact
with guards. This template must be consistent with the Canonical Spec and must not invent
route IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Route identifier forma... | spec         | Yes             |
| Path format rules (lea... | spec         | Yes             |
| Param naming rules (pa... | spec         | Yes             |
| Param typing rules (st... | spec         | Yes             |
| Query param rules (all... | spec         | Yes             |
| Optional vs required p... | spec         | Yes             |
| Route versioning/alias... | spec         | Yes             |
| Validation rules (reje... | spec         | Yes             |
| Reserved routes (home,... | spec         | Yes             |
| Unknown route handling... | spec         | Yes             |

## 5. Optional Fields

Locale prefixes | OPTIONAL
Multi-tenant prefixes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Routes MUST be deterministic and parseable.**
- **Unknown routes MUST follow ROUTE-06 policy.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Route ID Rules`
2. `## examples:`
3. `## Path Rules`
4. `## Param Rules`
5. `## Query Param Rules`
6. `## Optional vs Required`
7. `## Aliases / Versioning`
8. `## Validation`
9. `## Reserved Routes`
10. `## Unknown Route Handling`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ROUTE-02}}, {{xref:ROUTE-03}}, {{xref:ROUTE-04}}, {{xref:ROUTE-06}} |**
- OPTIONAL
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
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
