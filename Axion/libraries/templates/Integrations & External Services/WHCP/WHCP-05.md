# WHCP-05 — Consumer Registration & Management (subscribe/unsubscribe)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-05                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring consumer registration & m |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-02, WHCP-03, IXS-04, IXS-03                 |
| Produces          | Filled Consumer Registration & Management (subscr|

## 2. Purpose

Define the canonical security controls for webhooks: signature verification/signing, secret storage/rotation, endpoint allowlists, replay defense, request validation, and safe logging. This template must be consistent with integration secrets/network policies and must not introduce security gaps between inbound and outbound flows.

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
| Security baseline stateme | spec         | No              |
| Signature required rule ( | spec         | No              |
| Signature scheme(s) suppo | spec         | No              |
| Canonical string/signatur | spec         | No              |
| Timestamp/replay protecti | spec         | No              |
| Secret storage/rotation b | spec         | No              |
| IP allowlist policy (if s | spec         | No              |
| Request size limits and c | spec         | No              |
| Schema validation rule (p | spec         | No              |
| Failure response policy ( | spec         | No              |
| Logging/redaction rules ( | spec         | No              |
| Telemetry requirements (i | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Key rotation overlap wind | spec         | Enrichment only, no new truth  |
| mTLS config notes         | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Inbound verification MUST happen before processing.
- Secrets must never be exposed in logs or responses.
- Reject requests that fail signature/allowlist/validation with safe responses.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Consumer Registration & Management (subscribe/unsubscribe)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IXS-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:WHCP-06}}, {{xref:WHCP-07}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, header rules, max skew/nonce, overlap
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If baseline.statement is UNKNOWN → block Completeness Gate.
- If sig.inbound_required is UNKNOWN → block Completeness Gate.
- If secrets.ref is UNKNOWN → block Completeness Gate.
- If req.max_body_bytes is UNKNOWN → block Completeness Gate.
- If telemetry.invalid_signature_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] signature_and_secret_policies_defined == true
- [ ] request_constraints_defined == true
- [ ] failure_responses_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-06
