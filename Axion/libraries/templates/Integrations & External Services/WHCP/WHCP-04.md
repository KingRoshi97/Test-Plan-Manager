# WHCP-04 — Security Spec (signature verification, IP allowlist)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-04                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security spec (signature  |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-02, WHCP-03, EVT-04                         |
| Produces          | Filled Security Spec (signature verification, IP |

## 2. Purpose

Define the canonical delivery semantics for webhooks: ordering guarantees, retry/backoff strategy, deduplication expectations, replay behavior, and acknowledgement semantics across producers and consumers. This template must be consistent with event delivery semantics and must not invent guarantees beyond what the system can enforce.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- EVT-04 Delivery Semantics (events): {{evt.delivery_semantics}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Delivery model (at-least- | spec         | No              |
| Ordering guarantees (none | spec         | No              |
| Deduplication expectation | spec         | No              |
| Retry schedule (attempts, | spec         | No              |
| Retry stop conditions (ma | spec         | No              |
| Handling of 429/503 (retr | spec         | No              |
| Replay support (yes/no)   | spec         | No              |
| Replay scope rules (by ti | spec         | No              |
| Poison message rules (qua | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-webhook overrides     | spec         | Enrichment only, no new truth  |
| Batch delivery semantics  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- If delivery is at-least-once, consumer idempotency MUST be required.
- Ordering guarantees must be explicitly scoped; do not imply global ordering.
- Retry must be bounded and must not cause storms.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Security Spec (signature verification, IP allowlist)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:WHCP-02}}, {{xref:WHCP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, ordering key rule, dedupe key rule, max
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If delivery.model is UNKNOWN → block Completeness Gate.
- If retry.max_attempts is UNKNOWN → block Completeness Gate.
- If replay.supported is UNKNOWN → block Completeness Gate.
- If telemetry.attempt_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] delivery_and_ordering_defined == true
- [ ] bounded_retry_defined == true
- [ ] replay_scope_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-05
