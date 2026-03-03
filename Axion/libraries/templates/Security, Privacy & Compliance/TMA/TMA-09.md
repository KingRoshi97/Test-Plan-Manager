# TMA-09 — Threat Intelligence Integration (feeds, IOCs, alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-09                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring threat intelligence integ |
| Filled By         | Internal Agent                                   |
| Consumes          | SEC-09, TMA-04, SEC-05                           |
| Produces          | Filled Threat Intelligence Integration (feeds, IO|

## 2. Purpose

Define the validation program that proves threats/risks are mitigated: security tests mapped to risks, tabletop drills, red-team-lite exercises, and closure evidence. This template connects the threat model to the security testing plan and incident response preparedness.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security testing plan: {{xref:SEC-09}} | OPTIONAL
- Risk register: {{xref:TMA-04}} | OPTIONAL
- Incident response: {{xref:SEC-05}} | OPTIONAL
- Security runbooks: {{xref:SEC-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Validation activities lis | spec         | No              |
| Risk coverage mapping rul | spec         | No              |
| Tabletop drill cadence    | spec         | No              |
| Red team-lite cadence (or | spec         | No              |
| Drill scope selection rul | spec         | No              |
| Success criteria (pass/fa | spec         | No              |
| Evidence artifacts produc | spec         | No              |
| Remediation workflow for  | spec         | No              |
| Telemetry requirements (c | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| External pen test integra | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Every high-risk item should have a validation activity mapped to it.
- Validations must produce evidence artifacts.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Threat Intelligence Integration (feeds, IOCs, alerts)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:TMA-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:TMA-10}}, {{xref:SEC-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, coverage target, scope rules, storage
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If acts.list is UNKNOWN → block Completeness Gate.
- If tabletop.cadence is UNKNOWN → block Completeness Gate.
- If success.criteria is UNKNOWN → block Completeness Gate.
- If evidence.artifacts is UNKNOWN → block Completeness Gate.
- If telemetry.coverage_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] activities_defined == true
- [ ] risk_coverage_defined == true
- [ ] evidence_defined == true
- [ ] remediation_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-10
