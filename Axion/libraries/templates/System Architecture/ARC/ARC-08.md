# ARC-08 — Deployment Topology

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-08                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring deployment topology    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Deployment Topology Document                         |

## 2. Purpose

Define the system’s deployment topology: what runs where, what environments exist, how
network boundaries are segmented, and what isolation constraints apply. This is the
architecture-level deployment map; CI/CD details live in OPS/CICD.

## 3. Inputs Required

- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● SBDT-01: {{xref:SBDT-01}} | OPTIONAL
- ● SBDT-02: {{xref:SBDT-02}} | OPTIONAL
- ● SBDT-03: {{xref:SBDT-03}} | OPTIONAL
- ● OPS-01: {{xref:OPS-01}} | OPTIONAL
- ● ENV-01: {{xref:ENV-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each runtime compo... | spec         | Yes             |
| ○ component_id            | spec         | Yes             |
| ○ type (api/service/wo... | spec         | Yes             |
| ○ owner boundary/service  | spec         | Yes             |
| ○ environments deploye... | spec         | Yes             |
| ○ network zone (public... | spec         | Yes             |
| ○ ingress/egress rules... | spec         | Yes             |
| ○ secrets dependency (... | spec         | Yes             |
| ○ scaling notes (basic)   | spec         | Yes             |
| ○ health checks/readin... | spec         | Yes             |
| Network boundary rules:   | spec         | Yes             |
| ○ what is public          | spec         | Yes             |

## 5. Optional Fields

● Multi-region notes | OPTIONAL
● Blue/green or canary posture | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Public exposure must be explicit; default is private/internal.
- Any component handling PII must be in approved zones and follow privacy constraints.
- Environment names must match ENV-01 config matrix.
- Deployment safety must reference migration/rollback policies (REL/BDR where
- **applicable).**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Environments (required)`
2. `## env`
3. `## purpose`
4. `## access`
5. `## data_policy`
6. `## notes`
7. `## dev`
8. `## e}}`
9. `## ss}}`
10. `## y}}`

## 8. Cross-References

- Upstream: {{xref:SBDT-02}} | OPTIONAL, {{xref:SBDT-03}} | OPTIONAL, {{xref:ENV-01}}
- **| OPTIONAL, {{xref:OPS-01}} | OPTIONAL**
- Downstream: {{xref:OPS-02}} | OPTIONAL, {{xref:CICD-}} | OPTIONAL, {{xref:REL-04}} |
- **OPTIONAL, {{xref:BDR-}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
