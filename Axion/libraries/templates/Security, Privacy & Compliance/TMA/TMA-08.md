# TMA-08 — Threat Model Review Cadence (triggers, process)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-08                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring threat model review caden |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-08, TMA-02, RLIM-03                          |
| Produces          | Filled Threat Model Review Cadence (triggers, pro|

## 2. Purpose

Define the threat-model perspective on payment/fraud abuse: catalog the key fraud vectors, required controls, monitoring signals, and escalation paths—anchored to the implementation-level PAY-08 document. This template must not diverge from the actual payments fraud controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Payments fraud controls: {{xref:PAY-08}} | OPTIONAL
- Payment flows: {{xref:PAY-02}} | OPTIONAL
- Abuse catalog: {{xref:TMA-02}} | OPTIONAL
- Abuse signals: {{xref:RLIM-03}} | OPTIONAL
- Enforcement actions: {{xref:RLIM-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Fraud vectors list (vecto | spec         | No              |
| vector_id (stable identif | spec         | No              |
| Linked abuse_id/risk_id ( | spec         | No              |
| Attack description        | spec         | No              |
| Impacted payment flows (P | spec         | No              |
| Controls required (PAY-08 | spec         | No              |
| Detection signals (metric | spec         | No              |
| Enforcement actions (bloc | spec         | No              |
| Escalation path (support/ | spec         | No              |
| Telemetry requirements (f | spec         | No              |
| Residual risk rating (hig | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Provider-specific fraud n | spec         | Enrichment only, no new truth  |
| Chargeback strategy point | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Every vector must map to at least one PAY-08 control and one detection signal.
- Do not introduce new controls here; reference PAY-08 for implementation detail.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Threat Model Review Cadence (triggers, process)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-08}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:TMA-04}}, {{xref:SEC-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, linked abuse/risk ids, provider
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If vectors[].vector_id is UNKNOWN → block Completeness Gate.
- If vectors[].controls_ref is UNKNOWN → block Completeness Gate.
- If vectors[].detection_signals is UNKNOWN → block Completeness Gate.
- If vectors[].enforcement_actions is UNKNOWN → block Completeness Gate.
- If vectors[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] vectors_defined == true
- [ ] each_vector_has_controls_and_detection == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-09
