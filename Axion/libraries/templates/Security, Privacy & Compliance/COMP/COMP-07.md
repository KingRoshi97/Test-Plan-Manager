# COMP-07 — Compliance Monitoring Rules (continuous, periodic checks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-07                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring compliance monitoring rul |
| Filled By         | Internal Agent                                   |
| Consumes          | TMA-04, COMP-01, SEC-03                          |
| Produces          | Filled Compliance Monitoring Rules (continuous, p|

## 2. Purpose

Define the canonical risk assessment process: how risks are identified, assessed, tracked, reviewed, and re-assessed—covering security/privacy/compliance risks and vendor risks. This template must align with threat risk register and exception management.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- Threat risk register: {{xref:TMA-04}} | OPTIONAL
- Security baseline controls: {{xref:SEC-03}} | OPTIONAL
- Exception management: {{xref:COMP-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Risk categories list (sec | spec         | No              |
| Assessment cadence (quart | spec         | No              |
| Trigger events (new vendo | spec         | No              |
| Assessment workflow steps | spec         | No              |
| Rating model (likelihood/ | spec         | No              |
| Ownership roles (who asse | spec         | No              |
| Documentation/evidence re | spec         | No              |
| Escalation rules (high ri | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Tooling/location for risk | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Assessments must be recorded and reviewable; not informal.
- High risks must have action plans or acceptance records.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Compliance Monitoring Rules (continuous, periodic checks)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-10}}, {{xref:COMP-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, approver roles, storage
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If risk.categories is UNKNOWN → block Completeness Gate.
- If cadence.value is UNKNOWN → block Completeness Gate.
- If workflow.steps[0] is UNKNOWN → block Completeness Gate.
- If esc.high_risk_rule is UNKNOWN → block Completeness Gate.
- If telemetry.completed_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] cadence_and_triggers_defined == true
- [ ] workflow_and_rating_defined == true
- [ ] ownership_and_evidence_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-08
