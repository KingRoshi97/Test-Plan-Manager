# WHCP-05 — Security Rules (signatures, secrets rotation, allowlists)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-05                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security rules (signatures, secrets rotation, allowlists)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Rules (signatures, secrets rotation, allowlists) Document                         |

## 2. Purpose

Define the canonical security controls for webhooks: signature verification/signing, secret
storage/rotation, endpoint allowlists, replay defense, request validation, and safe logging. This
template must be consistent with integration secrets/network policies and must not introduce
security gaps between inbound and outbound flows.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}}
- IXS-03 Connectivity/Allowlists: {{ixs.network_policy}} | OPTIONAL
- CSec-05 Secure Link Handling (patterns): {{csec.deep_link_security}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Security baseline stat... | spec         | Yes             |
| Signature required rul... | spec         | Yes             |
| Signature scheme(s) su... | spec         | Yes             |
| Canonical string/signa... | spec         | Yes             |
| Timestamp/replay prote... | spec         | Yes             |
| Secret storage/rotatio... | spec         | Yes             |
| IP allowlist policy (i... | spec         | Yes             |
| Request size limits an... | spec         | Yes             |
| Schema validation rule... | spec         | Yes             |
| Failure response polic... | spec         | Yes             |
| Logging/redaction rule... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Key rotation overlap window | OPTIONAL
mTLS config notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Inbound verification MUST happen before processing.**
- **Secrets must never be exposed in logs or responses.**
- **Reject requests that fail signature/allowlist/validation with safe responses.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Baseline`
2. `## Signature Requirements`
3. `## Canonical String / Construction`
4. `## Replay Protection`
5. `## Secrets & Rotation`
6. `## Allowlists`
7. `## OPTIONAL`
8. `## Request Constraints`
9. `## Schema Validation`
10. `## Failure Responses`

## 8. Cross-References

- **Upstream: {{xref:IXS-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:WHCP-06}}, {{xref:WHCP-07}} | OPTIONAL**
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
