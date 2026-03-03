# WHCP-03 — Delivery & Retry Policy (timeout, backoff, DLQ)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-03                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring delivery & retry policy ( |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-01, WHCP-05, API-02, IXS-04                 |
| Produces          | Filled Delivery & Retry Policy (timeout, backoff,|

## 2. Purpose

Define the canonical inbound webhook consumer behavior: endpoint contract, signature verification, allowlists, idempotency/deduplication, parsing/validation, acknowledgement rules, and failure handling (DLQ/quarantine/replay). This template must be consistent with webhook catalog and security rules and must not invent endpoints or secrets beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Event Catalog: {{whcp.catalog}}
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-05 Security Rules: {{whcp.security_rules}}
- WHCP-06 Registration/Management: {{whcp.registration}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- IXS-06 Error Handling & Recovery: {{ixs.error_recovery}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Inbound endpoint registry | spec         | No              |
| Which webhook_ids accepte | spec         | No              |
| Verification required (ye | spec         | No              |
| Verification scheme (HMAC | spec         | No              |
| Secret/cert reference (IX | spec         | No              |
| Allowlist rules (IP allow | spec         | No              |
| Payload parsing rules (sc | spec         | No              |
| Idempotency key rules (ev | spec         | No              |
| Ack rules (2xx on accept  | spec         | No              |
| Backpressure rules (queue | spec         | No              |
| Failure handling (DLQ/qua | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Async processing model (j | spec         | Enrichment only, no new truth  |
| Replay endpoint support   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never process unverified webhooks when verification is required.
- Idempotency MUST be enforced; inbound duplicates must not cause repeated side effects.
- Ack behavior must be explicit and consistent with delivery semantics.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Delivery & Retry Policy (timeout, backoff, DLQ)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:WHCP-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:WHCP-07}}, {{xref:WHCP-08}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, endpoint id/path, notes, secret ref,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If verify.required is UNKNOWN → block Completeness Gate.
- If verify.scheme is UNKNOWN → block Completeness Gate (when verify.required == true).
- If idem.key_rule is UNKNOWN → block Completeness Gate.
- If ack.model is UNKNOWN → block Completeness Gate.
- If telemetry.accepted_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] endpoints_defined == true
- [ ] verification_and_idempotency_defined == true
- [ ] ack_and_failure_handling_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-04
