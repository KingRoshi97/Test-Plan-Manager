# SBDT-01 — Service Boundary Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SBDT-01                                             |
| Template Type     | Architecture / Deployment                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring service boundary map    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Service Boundary Map Document                         |

## 2. Purpose

Define the service boundary decomposition: which runtime services/workers exist, what each
owns, how they depend on each other, and who is accountable. This is the enforceable
boundary map used to prevent “service sprawl” and unclear ownership.

## 3. Inputs Required

- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● ARC-08: {{xref:ARC-08}} | OPTIONAL
- ● RISK-03: {{xref:RISK-03}} | OPTIONAL
- ● STK-01: {{xref:STK-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Service list (minimum ... | spec         | Yes             |
| For each service:         | spec         | Yes             |
| ○ service_id              | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ service_type (api/se... | spec         | Yes             |
| ○ owner_boundary_id (A... | spec         | Yes             |
| ○ responsibilities (bu... | spec         | Yes             |
| ○ owns (data/entities/... | spec         | Yes             |
| ○ exposes (APIs/topics... | spec         | Yes             |
| ○ depends_on (other se... | spec         | Yes             |
| ○ trust zone (public/p... | spec         | Yes             |
| ○ SLA criticality (P0/... | spec         | Yes             |

## 5. Optional Fields

● Diagram pointer | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Each owned entity/event must map back to a single boundary owner.
- Each dependency must state purpose; “depends on X” without why is not allowed.
- Any dependency cycle must be explicitly documented with mitigation.
- Public exposure must be explicit (default private).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Services Registry (canonical)`
2. `## rvi`
3. `## name`
4. `## type`
5. `## owner`
6. `## _boun`
7. `## dary_i`
8. `## owns`
9. `## expose`
10. `## depen`

## 8. Cross-References

- Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:ARC-08}} | OPTIONAL
- Downstream: {{xref:SBDT-02}}, {{xref:SBDT-05}} | OPTIONAL, {{xref:RELIA-01}} |
- OPTIONAL
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
