# MOB-03 — Native Integration Map (bridges, permissions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-03                                             |
| Template Type     | Build / Mobile                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring native integration map (bridges, permissions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Native Integration Map (bridges, permissions) Document                         |

## 2. Purpose

Define the canonical map of mobile native integrations: which device capabilities are used, what
bridges/modules are required, what permissions are needed, and which screens/features
depend on them. This template must be consistent with capability and permission rules and
must not invent capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDC-01 Capabilities Inventory: {{mdc.capabilities}}
- MDC-02 Permissions UX Rules: {{mdc.permissions_ux}} | OPTIONAL
- MDC-03 Capability Security Rules: {{mdc.cap_security}} | OPTIONAL
- MOB-02 Screen Implementation Specs: {{mob.screens}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Integration registry (... | spec         | Yes             |
| Capability binding (ca... | spec         | Yes             |
| Native module/bridge name | spec         | Yes             |
| Permissions required (... | spec         | Yes             |
| Screens/features using... | spec         | Yes             |
| Permission request tim... | spec         | Yes             |
| Fallback behavior when... | spec         | Yes             |
| Security constraints (... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

OS version constraints | OPTIONAL

Background mode dependencies | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new capability_ids; use only those in {{xref:MDC-01}}.
- **Permission UX MUST align with {{xref:MDC-02}}.**
- **Least privilege MUST align with {{xref:MDC-03}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Integration Registry (by integration_id)`
2. `## Integration`
3. `## permissions:`
4. `## open_questions:`
5. `## (Repeat per integration_id.)`
6. `## Global Permission Timing Rules`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:MDC-01}}, {{xref:MOB-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDC-04}}, {{xref:MDC-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Skill Level Requiredness Rules
- **beginner: Required. List integrations and basic permission timing; use UNKNOWN for OS**
- constraints.
- **intermediate: Required. Define fallbacks and least privilege notes.**
- **advanced: Required. Add background mode constraints and telemetry rigor.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, ios/android permission lists, security**
- notes, telemetry, never request upfront list, OS/background constraints, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If integrations list is UNKNOWN → block

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
