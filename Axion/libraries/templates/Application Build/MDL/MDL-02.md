# MDL-02 — Deep Link Routing Map (URL → screen/action)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDL-02                                           |
| Template Type     | Build / Deep Links                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring deep link routing map (ur |
| Filled By         | Internal Agent                                   |
| Consumes          | MDL-01, ROUTE-03, MOB-01                         |
| Produces          | Filled Deep Link Routing Map (URL → screen/action|

## 2. Purpose

Define the canonical routing rules for mobile deep links: how matched URLs/schemes map to screens/actions, how navigation state is constructed, and how to handle cold start vs warm start. This template must be consistent with route/deep link maps and mobile navigation structure and must not invent link targets not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDL-01 Scheme & Domains: {{mobile.links}}
- ROUTE-03 Deep Link Map: {{route.deep_link_map}}
- MOB-01 Mobile Navigation Map: {{mob.nav_map}}
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Routing evaluation order  | spec         | No              |
| Match result format (link | spec         | No              |
| Cold start routing rules  | spec         | No              |
| Warm start routing rules  | spec         | No              |
| Param mapping rules (url  | spec         | No              |
| Guard application (auth/r | spec         | No              |
| Fallback handling (invali | spec         | No              |
| Telemetry requirements (l | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Deferred deep links (inst | spec         | Enrichment only, no new truth  |
| Campaign param handling   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Routing MUST only navigate to allowlisted targets defined in ROUTE-03.
- Guarding MUST follow ROUTE-04; do not bypass auth/role checks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Deep Link Routing Map (URL → screen/action)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:MDL-01}}, {{xref:ROUTE-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MDL-03}}, {{xref:MDL-04}} | OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, eval order extras, resolution rule, initial
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If cold.rule is UNKNOWN → block Completeness Gate.
- If params.mapping_rule is UNKNOWN → block Completeness Gate.
- If telemetry.success_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MDL
- Pass conditions:
- [ ] required_fields_present == true
- [ ] routing_rules_defined == true
- [ ] guards_applied == true
- [ ] fallback_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MDL-03
