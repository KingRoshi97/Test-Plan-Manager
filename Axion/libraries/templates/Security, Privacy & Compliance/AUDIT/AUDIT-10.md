# AUDIT-10 — Audit Compliance Mapping (SOC2/ISO/HIPAA requirements)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-10                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit compliance mapping  |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-06, SEC-05, AUDIT-09                       |
| Produces          | Filled Audit Compliance Mapping (SOC2/ISO/HIPAA r|

## 2. Purpose

Define the canonical forensics runbooks used during security/privacy incidents: evidence collection, query recipes, export/chain-of-custody steps, and handoffs. This template must align with investigation workflow and incident response plans.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
- Incident response plan: {{xref:SEC-05}} | OPTIONAL
- Audit anomaly rules: {{xref:AUDIT-09}} | OPTIONAL
- Security runbooks: {{xref:SEC-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Runbook registry (runbook | spec         | No              |
| runbook_id (stable identi | spec         | No              |
| Incident type binding (SE | spec         | No              |
| Trigger (alert_id/rule_id | spec         | No              |
| Evidence capture checklis | spec         | No              |
| Standard query recipes (w | spec         | No              |
| Export steps (format, has | spec         | No              |
| Chain-of-custody steps    | spec         | No              |
| Escalation/handoff rules  | spec         | No              |
| Telemetry requirements (r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| External counsel handoff  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Exports must be integrity-protected; chain-of-custody must be maintained.
- Runbooks must be executable and step-by-step.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Compliance Mapping (SOC2/ISO/HIPAA requirements)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-05}}, {{xref:COMP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, optional query recipe,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If books[].runbook_id is UNKNOWN → block Completeness Gate.
- If books[].evidence_checklist is UNKNOWN → block Completeness Gate.
- If books[].export_steps is UNKNOWN → block Completeness Gate.
- If books[].chain_of_custody is UNKNOWN → block Completeness Gate.
- If books[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] runbooks_defined == true
- [ ] evidence_and_export_defined == true
- [ ] chain_of_custody_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Compliance & Risk (COMP)
- [ ] COMP-01
