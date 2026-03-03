# PAY-08 — Payment Error Handling & Recovery (retry, fallback)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-08                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payment error handling &  |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-02, RLIM-03, RLIM-04, ADMIN-02               |
| Produces          | Filled Payment Error Handling & Recovery (retry, |

## 2. Purpose

Define the canonical fraud and abuse controls for payments: risk checks before/after charges, velocity limits, blocklists/allowlists, manual review workflows, and enforcement actions. This template must be consistent with general abuse detection/enforcement matrices and must not invent enforcement capabilities not present upstream.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- PAY-04 Webhook Handling: {{pay.webhooks}} | OPTIONAL
- RLIM-03 Abuse Signals & Detection: {{rlim.signals}} | OPTIONAL
- RLIM-04 Enforcement Actions Matrix: {{rlim.actions}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Risk checks list (pre-cha | spec         | No              |
| Velocity limits (per user | spec         | No              |
| Provider risk signals use | spec         | No              |
| Decision outcomes (allow/ | spec         | No              |
| Manual review workflow (q | spec         | No              |
| Enforcement actions (thro | spec         | No              |
| Kill switch rules (global | spec         | No              |
| False positive handling ( | spec         | No              |
| Telemetry requirements (f | spec         | No              |
| Audit logging requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| 3DS policy                | spec         | Enrichment only, no new truth  |
| Machine risk scoring note | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Fraud decisions must be explainable via reason codes (where possible).
- Overrides must be permissioned and auditable.
- Kill switch must exist for incident response.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Payment Error Handling & Recovery (retry, fallback)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, post-charge checks, window rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If velocity.limits is UNKNOWN → block Completeness Gate.
- If decision.outcomes is UNKNOWN → block Completeness Gate.
- If enforce.payment_disable_rule is UNKNOWN → block Completeness Gate.
- If kill.behavior is UNKNOWN → block Completeness Gate.
- If telemetry.fraud_block_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] risk_and_velocity_defined == true
- [ ] enforcement_and_kill_switch_defined == true
- [ ] telemetry_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-09
