# TMA-03 — Attack Surface Inventory (endpoints, clients, integrations)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-03                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring attack surface inventory (endpoints, clients, integrations)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Attack Surface Inventory (endpoints, clients, integrations) Document                         |

## 2. Purpose

Create the canonical inventory of externally reachable and high-risk internal surfaces that can
be attacked: API endpoints, web/mobile clients, webhooks, file upload surfaces, and third-party
integration entry points. This template is used to drive threat modeling coverage and monitoring.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API endpoint catalog: {{xref:API-01}} | OPTIONAL
- Webhook catalog: {{xref:WHCP-01}} | OPTIONAL
- Upload/download spec: {{xref:FMS-02}} | OPTIONAL
- Route contract: {{xref:ROUTE-01}} | OPTIONAL
- Mobile navigation map: {{xref:MOB-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Surface registry (surf... | spec         | Yes             |
| surface_id (stable ide... | spec         | Yes             |
| surface type (api/web/... | spec         | Yes             |
| Identifier (endpoint_i... | spec         | Yes             |
| Auth requirement (publ... | spec         | Yes             |
| Primary risk class (lo... | spec         | Yes             |
| Data classes exposed (... | spec         | Yes             |
| Rate limit applicabili... | spec         | Yes             |
| Logging/monitoring exp... | spec         | Yes             |
| Owner (team/service)      | spec         | Yes             |

## 5. Optional Fields

Deprecation status | OPTIONAL

Known mitigations summary | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every surface must declare auth requirement and risk class.**
- Do not invent endpoint IDs/routes/webhook IDs; reference upstream inventories when available.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Surfaces (repeat per surface_id)`
3. `## Surface`
4. `## open_questions:`
5. `## (Repeat per surface.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:API-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-04}}, {{xref:SEC-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
