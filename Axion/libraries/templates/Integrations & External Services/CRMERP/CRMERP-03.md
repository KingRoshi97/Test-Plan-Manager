# CRMERP-03 — Sync Strategy (real-time, batch, direction, conflict rules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-03                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring sync strategy (real-time, |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-01, CRMERP-02, OFS-02                     |
| Produces          | Filled Sync Strategy (real-time, batch, direction|

## 2. Purpose

Define the canonical rules that govern sync direction (push, pull, bidirectional) for CRM/ERP integrations, including source-of-truth designation per object/field, write permissions, conflict triggers, and safe handling for bidirectional sync. This template must be consistent with object/entity mapping and conflict/reconciliation policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-02 Object/Entity Mapping: {{crmerp.mapping}}
- IXS-06 Error Handling & Recovery: {{ixs.error_recovery}} | OPTIONAL
- OFS-02 Sync Model (queues/conflicts): {{ofs.sync_model}} | OPTIONAL
- EVT-03 Producer/Consumer Map: {{evt.producer_consumer}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Supported sync modes (pus | spec         | No              |
| Per-object sync mode assi | spec         | No              |
| Source of truth rules (sy | spec         | No              |
| Per-field write authority | spec         | No              |
| Outbound write constraint | spec         | No              |
| Inbound pull constraints  | spec         | No              |
| Conflict trigger definiti | spec         | No              |
| Idempotency constraints f | spec         | No              |
| Audit/telemetry requireme | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| User-initiated sync rules | spec         | Enrichment only, no new truth  |
| Rate-limit aware behavior | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Bidirectional sync MUST have explicit source-of-truth rules; no “both own it” ambiguity.
- Field-level exceptions must be documented and minimal.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Sync Strategy (real-time, batch, direction, conflict rules)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-01}}, {{xref:CRMERP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CRMERP-04}}, {{xref:CRMERP-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, object notes, field rules, blocked writes,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If meta.system_id is UNKNOWN → block Completeness Gate.
- If modes.supported is UNKNOWN → block Completeness Gate.
- If objects[*].source_of_truth is UNKNOWN → block Completeness Gate (for bidirectional).
- If telemetry.sync_decision_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] system_id_exists_in_CRMERP_01 == true
- [ ] per_object_modes_defined == true
- [ ] source_of_truth_defined == true
- [ ] conflict_triggers_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-04
