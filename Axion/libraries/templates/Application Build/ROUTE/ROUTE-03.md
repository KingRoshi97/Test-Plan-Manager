# ROUTE-03 — Deep Link Map (URLs → screens/actions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-03                                             |
| Template Type     | Build / Routing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring deep link map (urls → screens/actions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Deep Link Map (URLs → screens/actions) Document                         |

## 2. Purpose

Define the canonical deep link mapping from external URLs/schemes into in-app
routes/screens/actions, including parameter extraction, auth gating, safety validation, and
fallback behavior. This template must be consistent with route contracts and mobile deep link
rules (if applicable) and must not invent route IDs or URL patterns not present in upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-01 Route Contract: {{route.contract}}
- ROUTE-02 Navigation Map: {{route.nav_map}}
- MDL-01 Link Scheme & Domains: {{mobile.links}} | OPTIONAL
- MDL-02 Routing Rules: {{mobile.routing_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Deep link entry regist... | spec         | Yes             |
| URL pattern / scheme (... | spec         | Yes             |
| Match rules (path para... | spec         | Yes             |
| Target route_id/screen... | spec         | Yes             |
| Param mapping (url → r... | spec         | Yes             |
| Auth gating behavior (... | spec         | Yes             |
| Safety validation (all... | spec         | Yes             |
| Fallback behavior (unk... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

UTM/campaign param handling | OPTIONAL

Link expiry rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new route_ids; targets MUST exist in {{xref:ROUTE-01}}.
- **Deep link safety MUST follow MDL rules when present.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Deep Link Registry (by link_id)`
2. `## Link`
3. `## open_questions:`
4. `## (Repeat per link_id.)`
5. `## Global Safety Rules`
6. `## Fallback Rules`
7. `## Telemetry Requirements`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:ROUTE-01}}, {{xref:ROUTE-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ROUTE-04}}, {{xref:ROUTE-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
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
