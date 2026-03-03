# CRMERP-05 — Error Handling & Retry Policy (per integration)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-05                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring error handling & retry po |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-03, OFS-04, IXS-05                        |
| Produces          | Filled Error Handling & Retry Policy (per integra|

## 2. Purpose

Define the canonical conflict detection and resolution rules for CRM/ERP sync, including source-of-truth per object/field, LWW/merge/prompt policies, and what happens when conflicts cannot be resolved automatically. This template must be consistent with sync direction rules and offline reconciliation patterns.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-03 Sync Direction Rules: {{crmerp.sync_direction}}
- CRMERP-02 Object/Entity Mapping: {{crmerp.mapping}} | OPTIONAL
- OFS-04 Reconciliation Rules: {{ofs.recon_rules}} | OPTIONAL
- IXS-05 Data Mapping Rules: {{ixs.data_mapping}} | OPTIONAL
- FE-07 Error/Recovery UX: {{fe.error_ux}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Conflict detection signal | spec         | No              |
| Conflict taxonomy (types) | spec         | No              |
| Default resolution policy | spec         | No              |
| Per-object resolution rul | spec         | No              |
| Per-field overrides (fiel | spec         | No              |
| User prompt rules (if pro | spec         | No              |
| Automatic merge rules (if | spec         | No              |
| Unresolvable conflict han | spec         | No              |
| Telemetry requirements (c | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Admin resolution workflow | spec         | Enrichment only, no new truth  |
| Batch conflict handling   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Bidirectional objects MUST define resolution policy; no UNKNOWN allowed for those.
- Resolution must be deterministic unless explicitly prompt-based.
- Prompts must not grant write authority beyond source-of-truth rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Error Handling & Retry Policy (per integration)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, version field rule, examples, rationale,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If policy.default is UNKNOWN → block Completeness Gate.
- If unresolvable.behavior is UNKNOWN → block Completeness Gate.
- If telemetry.conflict_metric is UNKNOWN → block Completeness Gate.
- If detect.signals is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] conflict_detection_defined == true
- [ ] resolution_policies_defined == true
- [ ] unresolvable_handling_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-06
