# MDC-03 — Capability Security Rules (least privilege)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-03                                             |
| Template Type     | Build / Mobile Capabilities                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring capability security rules (least privilege)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Capability Security Rules (least privilege) Document                         |

## 2. Purpose

Define the canonical security rules for using mobile device capabilities, enforcing least privilege,
safe data handling, and controlled access. Includes capability-specific constraints, data
minimization, and secure-by-default patterns. This template must be consistent with client data
protection policies and must not invent capability usage not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDC-01 Capabilities Inventory: {{mdc.capabilities}}
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- MOB-03 Native Integration Map: {{mob.native_integrations}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Least privilege statem... | spec         | Yes             |
| Per-capability securit... | spec         | Yes             |
| Data minimization rule... | spec         | Yes             |
| Sensitive data handlin... | spec         | Yes             |
| Permission scope rules... | spec         | Yes             |
| Access logging rules (... | spec         | Yes             |
| Third-party SDK constr... | spec         | Yes             |

## 5. Optional Fields

Threat considerations per capability | OPTIONAL
App attestation bindings | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Capability use MUST follow CSec-02 protections for sensitive data.
Do not request broader permissions than necessary.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. General Least Privilege
policy_statement: {{policy.statement}}
data_minimization_rule: {{policy.data_minimization_rule}} | OPTIONAL
2. Per-Capability Security Constraints
Capability Rule
capability_id: {{rules[0].capability_id}}
allowed_context: {{rules[0].allowed_context}} (foreground/background/UNKNOWN)
data_collected: {{rules[0].data_collected}} | OPTIONAL
storage_rules: {{rules[0].storage_rules}} | OPTIONAL
transmission_rules: {{rules[0].transmission_rules}} | OPTIONAL
redaction_rules: {{rules[0].redaction_rules}} | OPTIONAL
third_party_constraints: {{rules[0].third_party_constraints}} | OPTIONAL
logging_rules: {{rules[0].logging_rules}} | OPTIONAL
notes: {{rules[0].notes}} | OPTIONAL
open_questions:
{{rules[0].open_questions[0]}} | OPTIONAL
(Repeat per capability_id.)
3. Sensitive Data Handling
encryption_required: {{sensitive.encryption_required}}
pii_redaction_required: {{sensitive.pii_redaction_required}} | OPTIONAL
4. Third-Party SDK Constraints
sdk_allowlist_policy: {{sdk.allowlist_policy}} | OPTIONAL
data_sharing_rules: {{sdk.data_sharing_rules}} | OPTIONAL
5. References
Capabilities inventory: {{xref:MDC-01}}
Client data protection: {{xref:CSec-02}} | OPTIONAL
Native integrations: {{xref:MOB-03}} | OPTIONAL
Cross-References
Upstream: {{xref:MDC-01}}, {{xref:CSec-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MDC-04}}, {{xref:MDC-05}} | OPTIONAL
Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define least privilege + per-capability allowed context.
intermediate: Required. Add storage/transmission/redaction constraints.
advanced: Required. Add threat notes and third-party SDK governance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, data
collected/storage/transmission/redaction, third party constraints, logging rules, notes, data
minimization rule, pii redaction, sdk rules, attestation/threat notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If policy.statement is UNKNOWN → block Completeness Gate.
If rules[].capability_id is UNKNOWN → block Completeness Gate.
If rules[].allowed_context is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MDC
Pass conditions:
required_fields_present == true
least_privilege_defined == true
per_capability_rules_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MDC-04

MDC-04 — Capability Failure Handling (fallbacks)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Capability use MUST follow CSec-02 protections for sensitive data.**
- Do not request broader permissions than necessary.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## General Least Privilege`
2. `## Per-Capability Security Constraints`
3. `## Capability Rule`
4. `## open_questions:`
5. `## (Repeat per capability_id.)`
6. `## Sensitive Data Handling`
7. `## Third-Party SDK Constraints`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:MDC-01}}, {{xref:CSec-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDC-04}}, {{xref:MDC-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- **beginner: Required. Define least privilege + per-capability allowed context.**
- **intermediate: Required. Add storage/transmission/redaction constraints.**
- **advanced: Required. Add threat notes and third-party SDK governance.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, data**
- collected/storage/transmission/redaction, third party constraints, logging rules, notes, data
- minimization rule, pii redaction, sdk rules, attestation/threat notes, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If policy.statement is UNKNOWN → block

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
