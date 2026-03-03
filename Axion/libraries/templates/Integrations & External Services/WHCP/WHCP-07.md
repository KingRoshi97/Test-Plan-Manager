# WHCP-07 — Webhook Versioning & Deprecation Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-07                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring webhook versioning & depr |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-04, IXS-06, JBS-04                          |
| Produces          | Filled Webhook Versioning & Deprecation Policy   |

## 2. Purpose

Define the canonical error handling lifecycle for webhooks (inbound and outbound): how failures are classified, when items go to DLQ/quarantine, how manual replay works, and what operator actions exist. This template must be consistent with delivery semantics and global integration error handling.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}}
- IXS-06 Integration Error Handling: {{ixs.error_recovery}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jobs.retry_dlq}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Failure taxonomy (network | spec         | No              |
| Retry exhaustion rule (wh | spec         | No              |
| DLQ/quarantine supported  | spec         | No              |
| DLQ trigger rule          | spec         | No              |
| Quarantine contents (what | spec         | No              |
| Replay supported (yes/no/ | spec         | No              |
| Replay authorization rule | spec         | No              |
| Replay scope rules (by we | spec         | No              |
| Backfill/retry safety che | spec         | No              |
| Operator actions (pause s | spec         | No              |
| Telemetry requirements (d | spec         | No              |
| Audit logging requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Auto-replay policy        | spec         | Enrichment only, no new truth  |
| Customer notification pol | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not DLQ raw secrets or unredacted PII.
- Replay must not violate ordering/duplication rules; idempotency must be enforced.
- Operator actions must be permissioned and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Webhook Versioning & Deprecation Policy`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:WHCP-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:WHCP-08}}, {{xref:ADMIN-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, mapping notes, max attempts ref,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If dlq.supported is UNKNOWN → block Completeness Gate.
- If dlq.trigger_rule is UNKNOWN → block Completeness Gate (when dlq.supported == true).
- If dlq.redaction_rule is UNKNOWN → block Completeness Gate (when dlq.supported == true).
- If replay.supported is UNKNOWN → block Completeness Gate.
- If telemetry.dlq_depth_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] dlq_and_redaction_defined == true
- [ ] replay_policy_defined == true
- [ ] operator_actions_defined == true
- [ ] telemetry_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-08
