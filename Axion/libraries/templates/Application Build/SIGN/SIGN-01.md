# SIGN-01 — Build Artifact Types (debug/beta/prod)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-01                                          |
| Template Type     | Build / Signing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring build artifact types (deb |
| Filled By         | Internal Agent                                   |
| Consumes          | CPR-05, MBAT-05                                  |
| Produces          | Filled Build Artifact Types (debug/beta/prod)    |

## 2. Purpose

Define the canonical build artifact types produced for the application across environments and release channels (debug/beta/prod), including naming conventions, contents, signing expectations, distribution targets, and validation checks. This template must be consistent with performance/release gates and must not invent artifact types not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CPR-05 Perf Regression Gates: {{cpr.perf_gates}} | OPTIONAL
- MBAT-05 Mobile Perf Regression Gates: {{mbat.perf_gates}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Artifact type registry (a | spec         | No              |
| artifact_type (debug/beta | spec         | No              |
| platform targets (web/ios | spec         | No              |
| file formats (apk/aab/ipa | spec         | No              |
| build configuration (env  | spec         | No              |
| signing requirement (sign | spec         | No              |
| distribution channel (int | spec         | No              |
| naming/versioning rules b | spec         | No              |
| required validation check | spec         | No              |
| retention policy (how lon | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Source map / symbol uploa | spec         | Enrichment only, no new truth  |
| Feature flag defaults per | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new artifact types beyond the registry.
- Artifact naming/versioning MUST align with {{xref:SIGN-04}} when present.
- Artifacts MUST reference required gates/checks (e.g., perf, security) and not bypass them.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Build Artifact Types (debug/beta/prod)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CPR-05}} | OPTIONAL, {{xref:MBAT-05}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:SIGN-02}}, {{xref:SIGN-04}}, {{xref:SIGN-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, platform targets, debug symbols,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If registry.types is UNKNOWN → block Completeness Gate.
- If artifacts[*].signing.required is UNKNOWN → block Completeness Gate.
- If storage.location is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SIGN
- Pass conditions:
- [ ] required_fields_present == true
- [ ] artifact_registry_defined == true
- [ ] platforms_and_formats_defined == true
- [ ] signing_and_distribution_defined == true
- [ ] validation_checks_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SIGN-02
