# NOTIF-04 — Delivery & Retry Policy (per channel: timeout, backoff)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-04                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring delivery & retry policy ( |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-01, RLIM-01, MPUSH-04                      |
| Produces          | Filled Delivery & Retry Policy (per channel: time|

## 2. Purpose

Define the canonical send policy for notifications across channels: throttling rules, batching, quiet hours behavior, priority classes, and safeguards against notification storms. This template must be consistent with rate limit governance and push delivery rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- RLIM-02 Rate Limit Catalog: {{rlim.catalog}} | OPTIONAL
- MPUSH-04 Push Delivery/Retry Rules: {{mpush.delivery_rules}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Priority classes (low/nor | spec         | No              |
| Per-channel throttle rule | spec         | No              |
| Per-user caps (avoid spam | spec         | No              |
| Quiet hours supported (ye | spec         | No              |
| Quiet hours behavior (del | spec         | No              |
| Batching supported (yes/n | spec         | No              |
| Batching rules (grouping  | spec         | No              |
| Storm prevention rules (g | spec         | No              |
| Rate limit enforcement re | spec         | No              |
| Telemetry requirements (t | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-notif-type overrides  | spec         | Enrichment only, no new truth  |
| Regional quiet hours      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Storm prevention must exist and be quickly actionable.
- Quiet hours behavior must be deterministic and user-respecting.
- If batching is enabled, batching must not merge semantically different notifications unless
- explicitly allowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Delivery & Retry Policy (per channel: timeout, backoff)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-05}}, {{xref:NOTIF-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, per-user caps, quiet
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If priority.classes is UNKNOWN → block Completeness Gate.
- If storm.global_caps is UNKNOWN → block Completeness Gate.
- If enforce.enforcement_point is UNKNOWN → block Completeness Gate.
- If telemetry.throttled_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] throttles_defined == true
- [ ] storm_prevention_defined == true
- [ ] enforcement_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-05
