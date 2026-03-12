# SKM-04 — Key Types & Usage (signing, encryption, API keys, TLS)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-04                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring key types & usage (signing, encryption, api keys, tls)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Key Types & Usage (signing, encryption, API keys, TLS) Document                         |

## 2. Purpose

Define the canonical taxonomy of keys and how they are used across the system: signing keys,
encryption keys, API keys, TLS certs, and token secrets. This template establishes consistent
rules for key purpose separation, algorithm choices, and where keys are stored/used.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- KMS/HSM strategy: {{xref:SKM-05}} | OPTIONAL
- File security: {{xref:FMS-06}} | OPTIONAL
- Payments security/PCI: {{xref:PAY-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Key type registry (key... | spec         | Yes             |
| Purpose separation rul... | spec         | Yes             |
| Allowed algorithms lis... | spec         | Yes             |
| Key storage backend ru... | spec         | Yes             |
| Key usage contexts (JW... | spec         | Yes             |
| Key access model (serv... | spec         | Yes             |
| Key rotation linkage (... | spec         | Yes             |
| Key lifecycle states (... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Key derivation rules | OPTIONAL

Key identifiers naming conventions | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not reuse the same key for multiple purposes.
- **Key types must have explicit allowed usage contexts.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Key Types`
2. `## Purpose Separation`
3. `## Algorithms`
4. `## Storage`
5. `## Usage Contexts`
6. `## Access Model`
7. `## Rotation`
8. `## Lifecycle States`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SKM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-06}}, {{xref:SKM-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define key types, purpose separation, and storage rule.**
- **intermediate: Required. Define allowed algorithms and usage contexts and lifecycle states.**
- **advanced: Required. Add derivation/naming conventions and tight rotation/lifecycle transition**
- rigor.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, kms ref, rotation rules, transition rule,**
- optional telemetry, derivation/naming, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If types.list is UNKNOWN → block

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
