# WHCP-08 — Error Handling & Failure Notifications

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-08                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring error handling & failure  |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-04, WHCP-07, IXS-07                         |
| Produces          | Filled Error Handling & Failure Notifications    |

## 2. Purpose

Define the canonical observability requirements for webhooks: delivery rate, latency, failures, signature/validation rejects, DLQ depth, dashboards, and alerts. This template must be consistent with integration observability and must not introduce telemetry that violates privacy/redaction rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-07 Error Handling: {{whcp.error_handling}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Core metrics set (attempt | spec         | No              |
| Latency metrics (p50/p95  | spec         | No              |
| Reject metrics (invalid s | spec         | No              |
| Per-webhook/per-subscript | spec         | No              |
| DLQ/quarantine metrics (d | spec         | No              |
| Dashboards minimum panels | spec         | No              |
| Alerts (failure spike, la | spec         | No              |
| Log field requirements (w | spec         | No              |
| Redaction/no-PII rule     | spec         | No              |
| Runbook references (triag | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Tracing spans for deliver | spec         | Enrichment only, no new truth  |
| Sampling policy           | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not log raw payloads unless explicitly allowed and redacted.
- Avoid high-cardinality dimensions; hash subscription identifiers where needed.
- Alerts must be actionable and tied to runbooks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Error Handling & Failure Notifications`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:WHCP-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, percentiles, optional reject metrics, dlq
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If metrics.attempt_metric is UNKNOWN → block Completeness Gate.
- If reject.invalid_signature_metric is UNKNOWN → block Completeness Gate.
- If dash.minimum_panels is UNKNOWN → block Completeness Gate.
- If logs.webhook_id is UNKNOWN → block Completeness Gate.
- If breakdown.subscription_id_handling is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] core_metrics_defined == true
- [ ] logging_and_redaction_defined == true
- [ ] dashboards_and_alerts_defined == true
- [ ] breakdown_policy_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-09
