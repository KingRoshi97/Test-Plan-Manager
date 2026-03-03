# CPR-02 — Rendering Strategy (SSR/CSR, list virtualization)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CPR-02                                           |
| Template Type     | Build / Performance                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring rendering strategy (ssr/c |
| Filled By         | Internal Agent                                   |
| Consumes          | CPR-01, FE-01, UICP-01                           |
| Produces          | Filled Rendering Strategy (SSR/CSR, list virtuali|

## 2. Purpose

Define the canonical rendering strategy for clients, including SSR vs CSR decisions (web), navigation/render pipelines (mobile), list virtualization rules, and rendering performance safeguards. This template must be consistent with the performance budget and must not invent platform capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CPR-01 Performance Budget: {{cpr.budget}}
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- UICP-01 Page Composition Patterns: {{ui.page_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Web rendering model (SSR/ | spec         | No              |
| Mobile rendering model (n | spec         | No              |
| Hydration strategy (if SS | spec         | No              |
| Route-level rendering rul | spec         | No              |
| List virtualization rules | spec         | No              |
| Image rendering strategy  | spec         | No              |
| Skeleton/loading renderin | spec         | No              |
| Animation/motion performa | spec         | No              |
| Accessibility implication | spec         | No              |
| Measurement hooks (profil | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Streaming rendering notes | spec         | Enrichment only, no new truth  |
| Edge caching notes        | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Rendering choices MUST fit within budgets from {{xref:CPR-01}}.
- Long lists MUST be virtualized if above threshold (or UNKNOWN).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Rendering Strategy (SSR/CSR, list virtualization)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CPR-01}} , {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CPR-03}}, {{xref:CPR-04}}, {{xref:CPR-05}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, hydration, route rules, list
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If web.model is UNKNOWN → block Completeness Gate (for web clients).
- If lists.required_when is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CPR
- Pass conditions:
- [ ] required_fields_present == true
- [ ] rendering_model_defined == true
- [ ] virtualization_rules_defined == true
- [ ] loading_asset_policies_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CPR-03
