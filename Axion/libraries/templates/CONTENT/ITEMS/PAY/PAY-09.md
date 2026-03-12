# PAY-09 — Security & PCI Boundaries (tokenization, SAQ scope)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-09                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security & pci boundaries (tokenization, saq scope)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security & PCI Boundaries (tokenization, SAQ scope) Document                         |

## 2. Purpose

Define the canonical security boundaries for payments, especially PCI scope: what systems
touch payment data, tokenization rules, what is prohibited (raw PAN/CVV), required controls,
and how SAQ scope is determined/maintained. This template must be consistent with
integration security/compliance and client data protection policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- CSec-01 Token Storage Policy: {{csec.token_storage}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

PCI in scope (true/false/UNKNOWN)
PCI scope boundary statement (what is in/out)
Tokenization rule (provider-hosted fields, tokens only)
Prohibited data rule (no PAN/CVV storage/logging)
Allowed payment identifiers (last4, brand, token ids)
Network and transport requirements (TLS)
Secrets handling reference (IXS-04)
Access control requirements (least privilege)
Logging/redaction requirements (CER-05/CSec-02)
Vulnerability/patch expectations (if in scope)
Telemetry requirements (security events)

Optional Fields
SAQ type notes | OPTIONAL
Pen test / ASV scan notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never store raw PAN or CVV.
If PCI is in scope, scope boundaries and controls MUST be explicit and enforceable.
Payment identifiers logged must be non-sensitive (token/last4 only).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. PCI Scope
pci_in_scope: {{pci.in_scope}}
scope_boundary: {{pci.boundary}}
saq_type: {{pci.saq_type}} | OPTIONAL
2. Tokenization
tokenization_rule: {{token.rule}}
provider_hosted_fields: {{token.provider_hosted_fields}} | OPTIONAL
3. Prohibited Data
no_pan_rule: {{ban.no_pan_rule}}
no_cvv_rule: {{ban.no_cvv_rule}}
no_sensitive_auth_data_logs: {{ban.no_sensitive_auth_data_logs}} | OPTIONAL
4. Allowed Identifiers
allowed_fields: {{allow.allowed_fields}}
redaction_rule: {{allow.redaction_rule}} | OPTIONAL
5. Transport / Network
tls_required: {{net.tls_required}}
network_allowlist_ref: {{net.allowlist_ref}} (expected: {{xref:IXS-03}}) | OPTIONAL
6. Secrets & Access
secrets_ref: {{sec.secrets_ref}} (expected: {{xref:IXS-04}}) | OPTIONAL
least_privilege_rule: {{sec.least_privilege_rule}}
7. Logging / Redaction
no_payment_data_in_logs: {{logs.no_payment_data_in_logs}}
client_data_protection_ref: {{logs.client_data_protection_ref}} (expected:
{{xref:CSec-02}}) | OPTIONAL
8. Vulnerability Expectations
patch_policy: {{vuln.patch_policy}} | OPTIONAL
scan_policy: {{vuln.scan_policy}} | OPTIONAL
9. Telemetry
security_event_metric: {{telemetry.security_event_metric}}
fields: {{telemetry.fields}} | OPTIONAL

10.References
Provider inventory: {{xref:PAY-01}}
Payment flows: {{xref:PAY-02}} | OPTIONAL
Integration security baseline: {{xref:IXS-08}} | OPTIONAL
Token storage: {{xref:CSec-01}} | OPTIONAL
Client data protection: {{xref:CSec-02}} | OPTIONAL
Cross-References
Upstream: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define prohibited data rules + tokenization + pci_in_scope flag.
intermediate: Required. Define scope boundary + logging/redaction + least privilege.
advanced: Required. Add SAQ/pentest/scan notes and strict telemetry fields.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, saq type, hosted fields, optional ban/log
rules, redaction rule, allowlist ref, secrets ref, vuln policies, telemetry fields, pen test notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If pci.in_scope is UNKNOWN → allowed, but MUST be flagged in open_questions.
If pci.in_scope == true and pci.boundary is UNKNOWN → block Completeness Gate.
If ban.no_pan_rule is UNKNOWN → block Completeness Gate.
If token.rule is UNKNOWN → block Completeness Gate.
If telemetry.security_event_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
tokenization_and_prohibited_data_defined == true
pci_scope_defined_or_not_in_scope == true
least_privilege_and_logging_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PAY-10

PAY-10 — Billing Observability & Support Runbooks (alerts, workflows)
Header Block

## 5. Optional Fields

SAQ type notes | OPTIONAL
Pen test / ASV scan notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never store raw PAN or CVV.**
- If PCI is in scope, scope boundaries and controls MUST be explicit and enforceable.
- **Payment identifiers logged must be non-sensitive (token/last4 only).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## PCI Scope`
2. `## Tokenization`
3. `## Prohibited Data`
4. `## Allowed Identifiers`
5. `## Transport / Network`
6. `## Secrets & Access`
7. `## Logging / Redaction`
8. `## Vulnerability Expectations`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
