# TMA-10 — TMA Compliance Mapping (framework → threat coverage)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-10                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring tma compliance mapping (f |
| Filled By         | Internal Agent                                   |
| Consumes          | TMA-02, TMA-04, SEC-10                           |
| Produces          | Filled TMA Compliance Mapping (framework → threat|

## 2. Purpose

Define the canonical runbooks for abuse/threat scenarios (non-incident and incident-adjacent): triage, containment actions, evidence capture, and escalation. This template should connect abuse cases and risks to concrete operator steps and must align with security runbooks and enforcement matrices.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Abuse catalog: {{xref:TMA-02}} | OPTIONAL
- Risk register: {{xref:TMA-04}} | OPTIONAL
- Security runbooks: {{xref:SEC-10}} | OPTIONAL
- Enforcement matrix: {{xref:RLIM-04}} | OPTIONAL
- Support tools: {{xref:ADMIN-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Runbook registry (runbook | spec         | No              |
| runbook_id (stable identi | spec         | No              |
| Linked abuse_id/risk_id   | spec         | No              |
| Trigger signals (what sta | spec         | No              |
| Triage steps (ordered)    | spec         | No              |
| Containment/enforcement a | spec         | No              |
| Evidence capture checklis | spec         | No              |
| Escalation rules (when to | spec         | No              |
| Permissions required      | spec         | No              |
| Audit requirements        | spec         | No              |
| Telemetry requirements (i | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Customer comms pointers   | spec         | Enrichment only, no new truth  |
| Automation hooks          | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Every runbook must map to at least one abuse_id or risk_id.
- Containment actions must be permissioned and auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## TMA Compliance Mapping (framework → threat coverage)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:TMA-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-05}}, {{xref:AUDIT-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, optional risk/abuse id (one
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If books[].runbook_id is UNKNOWN → block Completeness Gate.
- If books[].triage_steps[0] is UNKNOWN → block Completeness Gate.
- If books[].actions[0] is UNKNOWN → block Completeness Gate.
- If books[].audit_required is UNKNOWN → block Completeness Gate.
- If books[*].telemetry.invoked_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] runbooks_defined == true
- [ ] each_runbook_mapped_to_abuse_or_risk == true
- [ ] permissions_and_audit_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Secrets & Key Management (SKM)
- [ ] SKM-01
