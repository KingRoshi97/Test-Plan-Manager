# CPR-04 — Profiling Plan (what to measure, tools)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CPR-04                                           |
| Template Type     | Build / Performance                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring profiling plan (what to m |
| Filled By         | Internal Agent                                   |
| Consumes          | CPR-01                                           |
| Produces          | Filled Profiling Plan (what to measure, tools)   |

## 2. Purpose

Define the canonical profiling plan for client performance: what to measure, which tools to use, test scenarios, and how results map to performance budgets and regression gates. This template must be consistent with the performance budget and must not invent measurement tooling not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CPR-01 Performance Budget: {{cpr.budget}}
- CPR-02 Rendering Strategy: {{cpr.rendering_strategy}} | OPTIONAL
- CPR-03 Asset Loading Strategy: {{cpr.asset_loading}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Profiling scope (web/mobi | spec         | No              |
| Scenarios to measure (sta | spec         | No              |
| Metrics collected (p50/p9 | spec         | No              |
| Tooling list (profilers,  | spec         | No              |
| Test device/network profi | spec         | No              |
| Baseline capture rules (w | spec         | No              |
| Reporting format (where r | spec         | No              |
| Frequency/cadence (when t | spec         | No              |
| Ownership (who runs and r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Automation in CI          | spec         | Enrichment only, no new truth  |
| Sampling strategy         | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Collected metrics MUST align with CPR-01 targets.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Profiling Plan (what to measure, tools)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CPR-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CPR-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, optional metrics, tool lists, network
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If scenarios list is UNKNOWN → block Completeness Gate.
- If report.location is UNKNOWN → block Completeness Gate.
- If ops.owner is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CPR
- Pass conditions:
- [ ] required_fields_present == true
- [ ] scenarios_defined == true
- [ ] metrics_defined == true
- [ ] reporting_defined == true
- [ ] cadence_and_owner_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CPR-05
