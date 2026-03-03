# NOTIF-05 — Preference Management Spec (opt-in/out, frequency caps)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-05                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring preference management spe |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-02, WHCP-01, NOTIF-04                      |
| Produces          | Filled Preference Management Spec (opt-in/out, fr|

## 2. Purpose

Define the canonical deliverability controls for notifications (primarily email/SMS): bounce handling, spam complaints, suppression lists, sender reputation safeguards, and re-enable policies. This template must be consistent with provider setup and send policy, and must not invent deliverability capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- NOTIF-04 Send Policy: {{notif.send_policy}} | OPTIONAL
- WHCP-01 Webhook Catalog (bounce/complaint events): {{whcp.catalog}} | OPTIONAL
- WHCP-03 Webhook Consumer Spec: {{whcp.inbound}} | OPTIONAL
- RLIM-03 Abuse Signals & Detection: {{rlim.signals}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Supported deliverability  | spec         | No              |
| Signal ingestion method ( | spec         | No              |
| Suppression list model (g | spec         | No              |
| Suppression triggers (wha | spec         | No              |
| Suppression duration poli | spec         | No              |
| Re-enable policy (how use | spec         | No              |
| Sender identity policy (f | spec         | No              |
| Content policy pointers ( | spec         | No              |
| Telemetry requirements (b | spec         | No              |
| Alert thresholds (bounce  | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Warm-up/ramp policy       | spec         | Enrichment only, no new truth  |
| Dedicated IP policy       | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Hard bounces/complaints must result in suppression per policy.
- Deliverability events must not leak PII beyond what is needed.
- Alert thresholds must be actionable and tied to runbooks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Preference Management Spec (opt-in/out, frequency caps)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-06}}, {{xref:NOTIF-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, webhook ref, list location, soft bounce, ttl
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If signals.supported is UNKNOWN → block Completeness Gate.
- If suppression.on_hard_bounce is UNKNOWN → block Completeness Gate.
- If suppression.on_complaint is UNKNOWN → block Completeness Gate.
- If reenable.process is UNKNOWN → block Completeness Gate.
- If telemetry.bounce_rate_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] signals_and_ingestion_defined == true
- [ ] suppression_rules_defined == true
- [ ] reenable_defined == true
- [ ] telemetry_and_alerts_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-06
