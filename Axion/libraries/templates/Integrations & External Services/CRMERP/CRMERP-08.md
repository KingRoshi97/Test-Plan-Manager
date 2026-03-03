# CRMERP-08 — Testing & Sandbox Spec (test accounts, mock modes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-08                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring testing & sandbox spec (t |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-06, CRMERP-07, IXS-06                     |
| Produces          | Filled Testing & Sandbox Spec (test accounts, moc|

## 2. Purpose

Define the canonical reconciliation and recovery procedures for CRM/ERP sync: how failed sync attempts are retried, how DLQ/quarantine is handled, how replay works, and how backfills are executed safely with auditability. This template must be consistent with integration error handling and job/event failure policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-04 Scheduling/Triggers: {{crmerp.scheduling}} | OPTIONAL
- CRMERP-06 Rate Limits/Quotas: {{crmerp.limits}} | OPTIONAL
- CRMERP-07 Data Quality/Validation: {{crmerp.data_quality}} | OPTIONAL
- IXS-06 Integration Error Handling: {{ixs.error_recovery}}
- JBS-04 Retry/DLQ Policy: {{jobs.retry_dlq}} | OPTIONAL
- EVT-07 Event Failure Handling: {{evt.failure_handling}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Failure sources list (ven | spec         | No              |
| Retry policy binding (max | spec         | No              |
| Quarantine/DLQ handling r | spec         | No              |
| Replay policy (who can re | spec         | No              |
| Backfill policy (who can  | spec         | No              |
| Reconciliation strategy ( | spec         | No              |
| Operator runbook steps (t | spec         | No              |
| Audit logging requirement | spec         | No              |
| Telemetry requirements (r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Automated backfill trigge | spec         | Enrichment only, no new truth  |
| Data repair workflow refs | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Replays/backfills MUST be idempotent or guarded with idempotency keys.
- Backfills MUST have safety limits (time range, max records) and must be auditable.
- DLQ/quarantine MUST have a drain policy; no permanent limbo.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Testing & Sandbox Spec (test accounts, mock modes)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-06}}, {{xref:IXS-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CRMERP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, retry refs/details, dlq location, replay
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If dlq.trigger_rule is UNKNOWN → block Completeness Gate (when dlq.supported == true).
- If dlq.drain_policy is UNKNOWN → block Completeness Gate (when dlq.supported == true).
- If backfill.max_range_rule is UNKNOWN → block Completeness Gate (when backfill.supported
- If recon.success_criteria is UNKNOWN → block Completeness Gate.
- If telemetry.backlog_depth_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] dlq_and_drain_defined == true
- [ ] replay_and_backfill_policies_defined == true
- [ ] reconciliation_defined == true
- [ ] audit_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-09
