# CPR-03 — Asset Loading Strategy (code split, lazy load)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CPR-03                                           |
| Template Type     | Build / Performance                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring asset loading strategy (c |
| Filled By         | Internal Agent                                   |
| Consumes          | CPR-01, CPR-02, FE-01                            |
| Produces          | Filled Asset Loading Strategy (code split, lazy l|

## 2. Purpose

Define the canonical asset loading strategy for clients, including code splitting, route-level lazy loading, image/font loading policies, and caching/preload rules. This template must be consistent with the performance budget and rendering strategy and must not invent bundling/caching mechanisms not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CPR-01 Performance Budget: {{cpr.budget}}
- CPR-02 Rendering Strategy: {{cpr.rendering_strategy}}
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Code splitting model (rou | spec         | No              |
| Lazy loading rules (what  | spec         | No              |
| Critical path assets (wha | spec         | No              |
| Prefetch/preload policy   | spec         | No              |
| Image loading policy (res | spec         | No              |
| Font loading policy (prel | spec         | No              |
| Caching policy (service w | spec         | No              |
| Third-party scripts polic | spec         | No              |
| Error handling for failed | spec         | No              |
| Measurement hooks (bundle | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| CDN strategy notes        | spec         | Enrichment only, no new truth  |
| Offline asset caching not | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Asset loading MUST meet budgets in {{xref:CPR-01}}.
- Lazy loading MUST not break navigation UX.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Asset Loading Strategy (code split, lazy load)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CPR-01}}, {{xref:CPR-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CPR-04}}, {{xref:CPR-05}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, route/shared chunk rules, defer
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If split.model is UNKNOWN → block Completeness Gate.
- If critical.js is UNKNOWN → block Completeness Gate.
- If errors.on_chunk_fail is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CPR
- Pass conditions:
- [ ] required_fields_present == true
- [ ] splitting_and_lazy_rules_defined == true
- [ ] critical_path_defined == true
- [ ] error_handling_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CPR-04
