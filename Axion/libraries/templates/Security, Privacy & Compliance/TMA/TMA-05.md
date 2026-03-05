# TMA-05 — Mitigation Mapping (threat → control → owner)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-05                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring mitigation mapping (threat → control → owner)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Mitigation Mapping (threat → control → owner) Document                         |

## 2. Purpose

Create the canonical mapping from threats/abuse/risk items to implemented controls, owners,
and evidence. This is the bridge between threat modeling, security requirements, and
compliance control matrices.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Abuse catalog: {{xref:TMA-02}} | OPTIONAL
- Risk register: {{xref:TMA-04}} | OPTIONAL
- Security controls baseline: {{xref:SEC-03}} | OPTIONAL
- Compliance control matrix: {{xref:COMP-02}} | OPTIONAL
- Enforcement actions matrix: {{xref:RLIM-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Mapping registry (map_... | spec         | Yes             |
| map_id (stable identif... | spec         | Yes             |
| risk_id or abuse_id bi... | spec         | Yes             |
| control_id binding (SE... | spec         | Yes             |
| owner (team/role)         | spec         | Yes             |
| Implementation referen... | spec         | Yes             |
| Verification proof ref... | spec         | Yes             |
| Status (planned/in_pro... | spec         | Yes             |
| Residual risk note (af... | spec         | Yes             |
| Telemetry reference (m... | spec         | Yes             |

## 5. Optional Fields

Compensating controls (if partial) | OPTIONAL

Compliance control linkage (COMP-02 control_id) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every mapping must include implementation and verification proof references (or approved**
- **UNKNOWN).**
- **Controls must be real and traceable to SEC-03.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Mappings (repeat per map_id)`
3. `## Mapping`
4. `## open_questions:`
5. `## (Repeat per mapping.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:TMA-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-06}}, {{xref:COMP-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define mapping registry and include control_id + owner + status.**
- **intermediate: Required. Add implementation refs and verification proof refs and telemetry refs.**
- **advanced: Required. Add compliance linkage and residual risk notes and compensating**
- controls rigor.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, done count, risk/abuse id (one must be**
- present), comp controls/link, open questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If maps[].map_id is UNKNOWN → block

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
