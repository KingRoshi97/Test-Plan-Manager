# TMA-02 — Attack Surface Map (entry points, trust boundaries)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-02                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring attack surface map (entry |
| Filled By         | Internal Agent                                   |
| Consumes          | TMA-01, TMA-03, RLIM-03                          |
| Produces          | Filled Attack Surface Map (entry points, trust bo|

## 2. Purpose

Create the canonical catalog of abuse cases (misuse scenarios) the system must defend against, indexed by abuse_id, including impacted assets, attack steps, detection signals, and mitigations pointers. This template must align with attack surface inventory and existing abuse/rate-limit controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Threat model scope/method: {{xref:TMA-01}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Abuse signals/detection: {{xref:RLIM-03}} | OPTIONAL
- Payments fraud controls: {{xref:PAY-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Abuse registry (abuse_id  | spec         | No              |
| abuse_id (stable identifi | spec         | No              |
| Title                     | spec         | No              |
| Impacted surfaces (api/we | spec         | No              |
| Impacted assets (asset_id | spec         | No              |
| Attacker type (actor_id r | spec         | No              |
| Attack steps (ordered)    | spec         | No              |
| Primary impact (fraud, sp | spec         | No              |
| Detection signals (metric | spec         | No              |
| Mitigation/control refere | spec         | No              |
| Residual risk rating (hig | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Customer harm notes       | spec         | Enrichment only, no new truth  |
| Manual moderation workflo | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Each abuse case must link to at least one detection signal and one mitigation/control.
- Do not invent actor/asset IDs; use those defined in TMA-01 where possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Attack Surface Map (entry points, trust boundaries)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:TMA-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:TMA-04}}, {{xref:TMA-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, optional step, customer harm,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If cases[].abuse_id is UNKNOWN → block Completeness Gate.
- If cases[].steps[0] is UNKNOWN → block Completeness Gate.
- If cases[].detection_signals is UNKNOWN → block Completeness Gate.
- If cases[].mitigation_refs is UNKNOWN → block Completeness Gate.
- If cases[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] abuse_registry_defined == true
- [ ] each_case_has_detection_and_mitigation == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-03
