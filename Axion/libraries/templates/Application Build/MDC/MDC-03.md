# MDC-03 — Capability Detection & Fallback

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-03                                           |
| Template Type     | Build / Device Capabilities                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring capability detection & fa |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Capability Detection & Fallback           |

## 2. Purpose

Define the canonical security rules for using mobile device capabilities, enforcing least privilege, safe data handling, and controlled access. Includes capability-specific constraints, data minimization, and secure-by-default patterns. This template must be consistent with client data protection policies and must not invent capability usage not present in upstream inputs.

## 3. Inputs Required

- MDC-01: `{{mdc.capabilities}}`
- CSec-02: `{{csec.data_protection}}` | OPTIONAL
- MOB-03: `{{mob.native_integrations}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Least privilege statement (general) | spec | No |
| Per-capability security constraints | MDC-01 | No |
| Data minimization rules | spec | No |
| Sensitive data handling rules | CSec-02 | No |
| Permission scope rules (foreground only vs background) | spec | No |
| Access logging rules | spec | Yes |
| Third-party SDK constraints | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Threat considerations per capability | spec | Risk analysis notes |
| App attestation bindings | spec | If attestation used |
| Open questions | agent | Enrichment only |

## 6. Rules

- Capability use MUST follow CSec-02 protections for sensitive data.
- Do not request broader permissions than necessary.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## General Least Privilege` — policy_statement, data_minimization_rule
2. `## Per-Capability Security Constraints` — Per capability: capability_id, allowed_context, data_collected, storage_rules, transmission_rules, redaction_rules, third_party_constraints, logging_rules, notes, open_questions
3. `## Sensitive Data Handling` — encryption_required, pii_redaction_required
4. `## Third-Party SDK Constraints` — sdk_allowlist_policy, data_sharing_rules

## 8. Cross-References

- **Upstream**: MDC-01, CSec-02, SPEC_INDEX
- **Downstream**: MDC-04, MDC-05
- **Standards**: STD-SECURITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Least privilege + allowed context | Required | Required | Required |
| Storage/transmission/redaction | Optional | Required | Required |
| Threat notes + SDK governance | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, data collected/storage/transmission/redaction, third party constraints, logging rules, notes, data minimization rule, pii redaction, sdk rules, attestation/threat notes, open_questions
- If policy.statement is UNKNOWN → block Completeness Gate.
- If rules[].capability_id is UNKNOWN → block Completeness Gate.
- If rules[].allowed_context is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] least_privilege_defined == true
- [ ] per_capability_rules_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
