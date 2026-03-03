# SIGN-04 — Versioning Rules (build numbers, semver mapping)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-04                                          |
| Template Type     | Build / Signing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring versioning rules (build n |
| Filled By         | Internal Agent                                   |
| Consumes          | SIGN-01, SIGN-03                                 |
| Produces          | Filled Versioning Rules (build numbers, semver ma|

## 2. Purpose

Define the canonical versioning rules across platforms: semantic versioning policy, build number generation, mapping rules per platform, and how version changes relate to releases and rollbacks. This template must be consistent with build artifact types and store submission requirements and must not invent versioning schemes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SIGN-01 Build Artifact Types: {{sign.artifacts}} | OPTIONAL
- SIGN-03 Store Submission Checklist: {{sign.submission}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| SemVer policy (MAJOR.MINO | spec         | No              |
| What triggers major/minor | spec         | No              |
| Build number rule (monoto | spec         | No              |
| Platform mapping (iOS CFB | spec         | No              |
| Pre-release channel versi | spec         | No              |
| Hotfix versioning rules   | spec         | No              |
| Rollback versioning rules | spec         | No              |
| Version source of truth ( | spec         | No              |
| Telemetry version fields  | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Date-based versioning not | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Build numbers MUST be monotonically increasing per store rules.
- Versioning MUST be deterministic and derived from a single source of truth.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Versioning Rules (build numbers, semver mapping)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SIGN-01}} | OPTIONAL, {{xref:SIGN-03}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:SIGN-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, build format, pre-release labels, hotfix
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If semver.enabled is UNKNOWN → block Completeness Gate.
- If build.monotonic_rule is UNKNOWN → block Completeness Gate.
- If platform mapping fields are UNKNOWN → block Completeness Gate.
- If sot.location is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SIGN
- Pass conditions:
- [ ] required_fields_present == true
- [ ] semver_and_build_rules_defined == true
- [ ] platform_mapping_defined == true
- [ ] source_of_truth_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SIGN-05
