# NOTIF-09 — Notification Observability (delivery rate, open rate, alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-09                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring notification observabilit |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-04, IXS-06, JBS-04                         |
| Produces          | Filled Notification Observability (delivery rate,|

## 2. Purpose

Define the canonical failure handling for notification delivery across channels/providers: retry eligibility, backoff, DLQ/quarantine, fallback channel rules, and operator recovery actions. This template must be consistent with send policy, integration error handling, and job DLQ policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- NOTIF-04 Send Policy: {{notif.send_policy}} | OPTIONAL
- IXS-06 Integration Error Handling: {{ixs.error_recovery}} | OPTIONAL
- JBS-04 Retry/DLQ Policy: {{jobs.retry_dlq}} | OPTIONAL
- RLIM-04 Enforcement Actions Matrix: {{rlim.actions}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Failure taxonomy (provide | spec         | No              |
| Retry eligibility rules ( | spec         | No              |
| Backoff policy + max atte | spec         | No              |
| DLQ/quarantine supported  | spec         | No              |
| DLQ trigger rules         | spec         | No              |
| Fallback channel rules (i | spec         | No              |
| Suppression interaction r | spec         | No              |
| Operator actions (resend, | spec         | No              |
| User impact rules (silent | spec         | No              |
| Telemetry requirements (r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-notif-type overrides  | spec         | Enrichment only, no new truth  |
| Auto-disable provider thr | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Retries must be bounded and must respect suppression/opt-out.
- Fallback channels must honor consent/opt-out for that channel.
- Operator actions must be permissioned and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Notification Observability (delivery rate, open rate, alerts)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, channel notes, non-retryable list, max
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If backoff.max_attempts is UNKNOWN → block Completeness Gate.
- If dlq.supported is UNKNOWN → block Completeness Gate.
- If fallback.rules is UNKNOWN → block Completeness Gate (when fallback.supported == true).
- If suppress.no_retry_when_suppressed is UNKNOWN → block Completeness Gate.
- If telemetry.retry_count_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] bounded_retry_defined == true
- [ ] fallback_and_suppression_defined == true
- [ ] dlq_policy_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-10
