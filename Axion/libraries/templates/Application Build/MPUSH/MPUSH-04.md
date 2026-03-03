# MPUSH-04 — Delivery & Retry Policy (FCM/APNs, fallback)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-04                                         |
| Template Type     | Build / Push Notifications                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring delivery & retry policy ( |
| Filled By         | Internal Agent                                   |
| Consumes          | MPUSH-01, MPUSH-02, CER-02                       |
| Produces          | Filled Delivery & Retry Policy (FCM/APNs, fallbac|

## 2. Purpose

Define the canonical delivery and retry rules for push notifications, including quiet hours behavior, collapse/grouping behavior, retry semantics, failure handling, and safeguards to prevent notification storms. This template must be consistent with notification types and retry patterns and must not invent delivery behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MPUSH-02 Payload Contract: {{mpush.payload_contract}}
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Quiet hours policy (enabl | spec         | No              |
| Collapse/grouping policy  | spec         | No              |
| Delivery priority rules ( | spec         | No              |
| Retry policy (server/prov | spec         | No              |
| Failure handling (invalid | spec         | No              |
| Deduplication policy (avo | spec         | No              |
| Storm prevention rules (r | spec         | No              |
| Telemetry requirements (d | spec         | No              |
| Feature-flag kill switch  | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-type overrides        | spec         | Enrichment only, no new truth  |
| Regional delivery constra | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Delivery rules MUST be consistent with MPUSH-02 payload contract.
- Storm prevention MUST exist for high-volume systems.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Delivery & Retry Policy (FCM/APNs, fallback)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:MPUSH-01}}, {{xref:MPUSH-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MPUSH-05}}, {{xref:MPUSH-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, quiet window, grouping rule, provider
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If collapse.key_rule is UNKNOWN → block Completeness Gate.
- If storm.rate_caps is UNKNOWN → block Completeness Gate.
- If telemetry.success_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MPUSH
- Pass conditions:
- [ ] required_fields_present == true
- [ ] delivery_rules_defined == true
- [ ] storm_prevention_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MPUSH-05
