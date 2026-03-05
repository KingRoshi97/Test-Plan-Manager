# SEC-02 — Security Architecture (trust boundaries, data flows)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-02                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security architecture (trust boundaries, data flows)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Architecture (trust boundaries, data flows) Document                         |

## 2. Purpose

Define the canonical security architecture: system components, trust boundaries, data flows,
and where security controls are enforced. This document is the anchor for threat modeling and
must be consistent with the system architecture and integration inventories.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- System architecture: {{xref:ARCH-01}} | OPTIONAL
- API surface: {{xref:API-01}} | OPTIONAL
- Eventing: {{xref:EVT-01}} | OPTIONAL
- Storage targets: {{xref:FMS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Component list (major ... | spec         | Yes             |
| Trust boundary list (b... | spec         | Yes             |
| Data flow list (flow_id)  | spec         | Yes             |
| Entry points (web/mobi... | spec         | Yes             |
| Authentication points ... | spec         | Yes             |
| Authorization points (... | spec         | Yes             |
| Sensitive data zones (... | spec         | Yes             |
| Network controls (allo... | spec         | Yes             |
| Logging/audit zones (w... | spec         | Yes             |
| References to downstre... | spec         | Yes             |

## 5. Optional Fields

Deployment model summary | OPTIONAL

Third-party dependencies list | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Trust boundaries and flows must be explicit and consistent with upstream architecture.**
- Do not invent components; if not in inputs, mark UNKNOWN and flag.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Components`
2. `## Trust Boundaries`
3. `## Boundary`
4. `## (Repeat per boundary.)`
5. `## Data Flows`
6. `## Flow`
7. `## (Repeat per flow.)`
8. `## Entry Points`
9. `## AuthN / AuthZ Enforcement Points`
10. `## Sensitive Data Zones`

## 8. Cross-References

- **Upstream: {{xref:ARCH-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-01}}, {{xref:SEC-03}}, {{xref:IAM-04}} | OPTIONAL**
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
