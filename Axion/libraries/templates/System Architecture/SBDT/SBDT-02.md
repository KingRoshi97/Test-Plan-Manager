# SBDT-02 — Runtime Topology (services,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SBDT-02                                             |
| Template Type     | Architecture / Deployment                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring runtime topology (services,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Runtime Topology (services, Document                         |

## 2. Purpose

Define the runtime topology: the concrete runtime components and how they connect (services,
workers, queues, caches, databases, storage, gateways) including network zones and data flow
direction.

## 3. Inputs Required

- ● SBDT-01: {{xref:SBDT-01}} | OPTIONAL
- ● ARC-08: {{xref:ARC-08}} | OPTIONAL
- ● OPS-02: {{xref:OPS-02}} | OPTIONAL
- ● ENV-01: {{xref:ENV-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each component:       | spec         | Yes             |
| ○ component_id            | spec         | Yes             |
| ○ type                    | spec         | Yes             |
| ○ owner_service_id        | spec         | Yes             |
| ○ network_zone (public... | spec         | Yes             |
| ○ communicates_with (l... | spec         | Yes             |
| ○ protocols (http/ws/g... | spec         | Yes             |
| ○ data stores accessed... | spec         | Yes             |
| ○ secrets dependency p... | spec         | Yes             |
| ○ scaling model (basic)   | spec         | Yes             |
| Network segmentation r... | spec         | Yes             |
| Data flow table (major... | spec         | Yes             |

## 5. Optional Fields

● Diagram pointer | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- All communications must be declared; undeclared connections are disallowed.
- Public ingress must be through explicit gateways/edges.
- Secrets are never embedded; reference secrets management.
- Any SPOF must have a mitigation plan or documented acceptance.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Component Inventory (canonical)`
2. `## type`
3. `## owner`
4. `## _servi`
5. `## ce_id`
6. `## zone`
7. `## comm`
8. `## unicat`
9. `## es_wit`
10. `## protoc`

## 8. Cross-References

- Upstream: {{xref:SBDT-01}} | OPTIONAL, {{xref:ARC-08}} | OPTIONAL
- Downstream: {{xref:SBDT-05}} | OPTIONAL, {{xref:RELIA-02}} | OPTIONAL,
- **{{xref:OPS-05}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
