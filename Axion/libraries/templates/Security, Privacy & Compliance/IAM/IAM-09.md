# IAM-09 — IAM Observability (auth metrics, anomaly detection)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-09                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring iam observability (auth m |
| Filled By         | Internal Agent                                   |
| Consumes          | IAM-01, IAM-06, COMP-07                          |
| Produces          | Filled IAM Observability (auth metrics, anomaly d|

## 2. Purpose

Define the canonical access review process: who is reviewed (privileged roles, API keys, service identities), how often, what evidence is captured, and how removals are executed and audited. This template must align with privileged access policy and compliance risk assessment expectations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Role/perm model: {{xref:IAM-01}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Risk assessment process: {{xref:COMP-07}} | OPTIONAL
- Privileged actions audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Review scope (what access | spec         | No              |
| Review cadence (monthly/q | spec         | No              |
| Reviewer roles (who attes | spec         | No              |
| Evidence required (export | spec         | No              |
| Review workflow steps (ge | spec         | No              |
| Remediation rules (remove | spec         | No              |
| Escalation rules (non-res | spec         | No              |
| Audit logging requirement | spec         | No              |
| Telemetry requirements (r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Automated review support  | spec         | Enrichment only, no new truth  |
| Sampling rules            | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Reviews must include privileged roles and machine credentials at minimum.
- Remediations must be tracked to closure.
- Evidence must be stored in an audit-safe location.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## IAM Observability (auth metrics, anomaly detection)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IAM-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-06}}, {{xref:COMP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, minimum included, storage location,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If scope.access_types is UNKNOWN → block Completeness Gate.
- If cadence.value is UNKNOWN → block Completeness Gate.
- If reviewers.roles is UNKNOWN → block Completeness Gate.
- If workflow.steps[0] is UNKNOWN → block Completeness Gate.
- If telemetry.completion_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.IAM
- Pass conditions:
- [ ] required_fields_present == true
- [ ] scope_and_cadence_defined == true
- [ ] workflow_defined == true
- [ ] audit_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] IAM-10
