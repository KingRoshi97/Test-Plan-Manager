# WHCP-02 — Payload Schema Spec (per webhook: structure, versioning)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-02                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payload schema spec (per  |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-01, EVT-02, IXS-03, IXS-04                  |
| Produces          | Filled Payload Schema Spec (per webhook: structur|

## 2. Purpose

Define the canonical outbound webhook producer behavior: how events are selected and serialized, signature/signing rules, endpoint targeting/subscriptions, retries/backoff, deduplication/idempotency, and failure handling. This template must be consistent with webhook catalog, delivery semantics, and security rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Event Catalog: {{whcp.catalog}}
- EVT-02 Event Schema Spec: {{evt.schema_spec}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-05 Security Rules: {{whcp.security_rules}} | OPTIONAL
- WHCP-06 Registration/Management: {{whcp.registration}} | OPTIONAL
- IXS-03 Connectivity Policy: {{ixs.network_policy}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Producer identity (servic | spec         | No              |
| Outbound webhook selectio | spec         | No              |
| Payload schema versioning | spec         | No              |
| Target resolution (subscr | spec         | No              |
| HTTP method/headers polic | spec         | No              |
| Signing supported (yes/no | spec         | No              |
| Signing scheme (HMAC/JWS/ | spec         | No              |
| Signature header fields   | spec         | No              |
| Retries supported + backo | spec         | No              |
| Max attempts and dead-let | spec         | No              |
| Deduplication/idempotency | spec         | No              |
| Rate caps (per subscriber | spec         | No              |
| Telemetry requirements (d | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Batching support          | spec         | Enrichment only, no new truth  |
| Compression support       | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not send PII unless explicitly allowed by schema/security policies.
- Retries must be bounded; dedupe must prevent duplicate side effects.
- Signing secrets must be handled per {{xref:IXS-04}}; never log them.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Payload Schema Spec (per webhook: structure, versioning)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:WHCP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, owner, selection rules, schema
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If emit.webhook_ids is UNKNOWN → block Completeness Gate.
- If retry.max_attempts is UNKNOWN → block Completeness Gate.
- If dedupe.key_rule is UNKNOWN → block Completeness Gate.
- If sign.supported is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] emitted_webhooks_defined == true
- [ ] bounded_retry_defined == true
- [ ] dedupe_defined == true
- [ ] dlq_policy_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-03
