# CPR-01 — Performance Budget (web + mobile targets)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CPR-01                                           |
| Template Type     | Build / Performance                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring performance budget (web + |
| Filled By         | Internal Agent                                   |
| Consumes          | PRD-06, FE-01                                    |
| Produces          | Filled Performance Budget (web + mobile targets) |

## 2. Purpose

Define the canonical performance budget targets for web and mobile clients, including latency targets, frame/render targets, bundle size targets, and network usage targets. This template must be consistent with product NFRs and must not invent performance targets not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PRD-06 NFRs: {{prd.nfrs}} | OPTIONAL
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Platforms covered (web/mo | spec         | No              |
| Core user journeys covere | spec         | No              |
| Latency targets (p50/p95) | spec         | No              |
| Render/frame targets (fps | spec         | No              |
| Bundle/asset size targets | spec         | No              |
| Network targets (requests | spec         | No              |
| Memory/battery targets (m | spec         | No              |
| Regression thresholds (wh | spec         | No              |
| Measurement plan (tools,  | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Device tiers (low/med/hig | spec         | Enrichment only, no new truth  |
| Regional network assumpti | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Targets MUST be measurable and expressed as numbers with units.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Performance Budget (web + mobile targets)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRD-06}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:CPR-04}}, {{xref:CPR-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, device tiers, p95 targets, submit targets,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If perf.platforms is UNKNOWN → block Completeness Gate.
- If latency.startup.p50 is UNKNOWN → block Completeness Gate.
- If bundle.initial_kb is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CPR
- Pass conditions:
- [ ] required_fields_present == true
- [ ] platforms_defined == true
- [ ] latency_targets_defined == true
- [ ] bundle_and_network_budgets_defined == true
- [ ] measurement_plan_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CPR-02
