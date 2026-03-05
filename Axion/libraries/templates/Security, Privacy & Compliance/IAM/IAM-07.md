# IAM-07 — Account Lifecycle (provision, deprovision, recovery)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-07                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring account lifecycle (provision, deprovision, recovery)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Account Lifecycle (provision, deprovision, recovery) Document                         |

## 2. Purpose

Define the canonical lifecycle for user accounts: creation/provisioning (self-serve or SCIM),
activation, suspension, deprovisioning, recovery, and deletion/retention interactions. This
template must align with SSO/SCIM specs, auth methods, and privacy deletion rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Role/perm model: {{xref:IAM-01}} | OPTIONAL
- Auth methods: {{xref:IAM-02}} | OPTIONAL
- SCIM provisioning: {{xref:SSO-05}} | OPTIONAL
- Admin data repair procedures: {{xref:ADMIN-04}} | OPTIONAL
- Privacy retention/deletion: {{xref:PRIV-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Account states (pendin... | spec         | Yes             |
| Provisioning methods s... | spec         | Yes             |
| Activation rules (emai... | spec         | Yes             |
| Default role assignmen... | spec         | Yes             |
| Suspension rules (why/... | spec         | Yes             |
| Recovery methods (rese... | spec         | Yes             |
| Deletion/retention int... | spec         | Yes             |
| Audit requirements (ac... | spec         | Yes             |

## 5. Optional Fields

Dormant account policy | OPTIONAL

Reactivation policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Deprovisioning must revoke sessions and access promptly.**
- **Account deletion must respect legal holds/retention policies.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## States`
2. `## Provisioning`
3. `## Deprovisioning`
4. `## Suspension`
5. `## Recovery`
6. `## Deletion / Retention`
7. `## Audit`
8. `## Telemetry`
9. `## References`
10. `## Cross-References`

## 8. Cross-References

- **Upstream: {{xref:IAM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IAM-10}}, {{xref:AUDIT-01}} | OPTIONAL**
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
