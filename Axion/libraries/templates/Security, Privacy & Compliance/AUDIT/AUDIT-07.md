# AUDIT-07 — Audit Alerting Rules (suspicious patterns, thresholds)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-07                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit alerting rules (sus |
| Filled By         | Internal Agent                                   |
| Consumes          | IAM-06, ADMIN-01, AUDIT-01                       |
| Produces          | Filled Audit Alerting Rules (suspicious patterns,|

## 2. Purpose

Define the special audit requirements for admin and privileged actions: stricter capture rules, extra context fields, required approvals/step-up, and alerting on unusual activity. This template must align with privileged access policies and admin capabilities.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Admin capabilities matrix: {{xref:ADMIN-01}} | OPTIONAL
- Privileged API catalog: {{xref:ADMIN-05}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Privileged action types l | spec         | No              |
| Mapping to admin capabili | spec         | No              |
| Extra required audit fiel | spec         | No              |
| Step-up requirement rule  | spec         | No              |
| Approval requirement rule | spec         | No              |
| Real-time alerting rule ( | spec         | No              |
| Retention class for privi | spec         | No              |
| Redaction rules (no PII b | spec         | No              |
| Telemetry requirements (p | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| 2-person rule policy      | spec         | Enrichment only, no new truth  |
| Just-in-time access coupl | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Privileged actions must always be audited (no sampling).
- Ticket/reason fields should be required for destructive actions.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Alerting Rules (suspicious patterns, thresholds)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IAM-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-09}}, {{xref:SEC-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, reason rule, approvals, alert ids,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If actions.ids is UNKNOWN → block Completeness Gate.
- If fields.extra is UNKNOWN → block Completeness Gate.
- If step.rule is UNKNOWN → block Completeness Gate.
- If retention.class is UNKNOWN → block Completeness Gate.
- If telemetry.action_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] privileged_actions_defined == true
- [ ] extra_fields_defined == true
- [ ] alerts_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-08
