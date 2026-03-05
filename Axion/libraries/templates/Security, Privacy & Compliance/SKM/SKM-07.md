# SKM-07 — Secret Distribution (runtime fetch, sidecars, CI rules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-07                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring secret distribution (runtime fetch, sidecars, ci rules)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Secret Distribution (runtime fetch, sidecars, CI rules) Document                         |

## 2. Purpose

Define the canonical mechanisms for distributing secrets to runtime workloads and CI/CD: how
services fetch secrets, how identities are used, how secrets are refreshed, and what is
prohibited. This template must align with storage/access policy and Secure SDLC rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Service-to-service identity: {{xref:IAM-05}} | OPTIONAL
- Secure SDLC: {{xref:SEC-07}} | OPTIONAL
- Scheduling rules (jobs/workers): {{xref:JBS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Identity binding rule ... | spec         | Yes             |
| Refresh/renewal rule (... | spec         | Yes             |
| Caching rules (in-memo... | spec         | Yes             |
| Least privilege distri... | spec         | Yes             |
| Prohibited patterns (w... | spec         | Yes             |
| Failure behavior (fail... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Audit requirements (se... | spec         | Yes             |

## 5. Optional Fields

Local dev workflow | OPTIONAL

Multi-region considerations | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Secrets should be fetched dynamically where possible; avoid long-lived env vars in prod.**
- Do not store secrets on disk unless explicitly approved and encrypted.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Runtime`
2. `## CI/CD`
3. `## Identity Binding`
4. `## Refresh`
5. `## Caching`
6. `## Least Privilege`
7. `## Failure Behavior`
8. `## Prohibited Patterns`
9. `## Telemetry`
10. `## Audit`

## 8. Cross-References

- **Upstream: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL**
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
