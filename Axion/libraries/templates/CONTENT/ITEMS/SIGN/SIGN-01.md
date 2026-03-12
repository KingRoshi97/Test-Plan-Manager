# SIGN-01 — Build Artifact Types (debug/beta/prod)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-01                                             |
| Template Type     | Build / Release & Signing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring build artifact types (debug/beta/prod)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Build Artifact Types (debug/beta/prod) Document                         |

## 2. Purpose

Define the canonical build artifact types produced for the application across environments and
release channels (debug/beta/prod), including naming conventions, contents, signing
expectations, distribution targets, and validation checks. This template must be consistent with
performance/release gates and must not invent artifact types not present in upstream inputs.

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
| Artifact type registry... | spec         | Yes             |
| artifact_type (debug/b... | spec         | Yes             |
| platform targets (web/... | spec         | Yes             |
| file formats (apk/aab/... | spec         | Yes             |
| build configuration (e... | spec         | Yes             |
| signing requirement (s... | spec         | Yes             |
| distribution channel (... | spec         | Yes             |
| naming/versioning rule... | spec         | Yes             |
| required validation ch... | spec         | Yes             |
| retention policy (how ... | spec         | Yes             |

## 5. Optional Fields

Source map / symbol upload rules | OPTIONAL
Feature flag defaults per artifact | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new artifact types beyond the registry.
Artifact naming/versioning MUST align with {{xref:SIGN-04}} when present.
Artifacts MUST reference required gates/checks (e.g., perf, security) and not bypass them.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Artifact Registry
artifact_types:
{{registry.types[0]}}
{{registry.types[1]}}
{{registry.types[2]}}
2. Artifact Type Definitions
Artifact
artifact_type: {{artifacts[0].artifact_type}}
platforms: {{artifacts[0].platforms}}
formats: {{artifacts[0].formats}}
build_config:
env: {{artifacts[0].build_config.env}}
debug_symbols: {{artifacts[0].build_config.debug_symbols}} | OPTIONAL
minify_obfuscate: {{artifacts[0].build_config.minify_obfuscate}} | OPTIONAL
feature_flags_default: {{artifacts[0].build_config.feature_flags_default}} | OPTIONAL
signing:
required: {{artifacts[0].signing.required}}
key_profile: {{artifacts[0].signing.key_profile}} | OPTIONAL
distribution:
channel: {{artifacts[0].distribution.channel}}
targets: {{artifacts[0].distribution.targets}} | OPTIONAL
versioning_ref: {{artifacts[0].versioning_ref}} (expected: {{xref:SIGN-04}}) | OPTIONAL
validation_checks:
{{artifacts[0].validation_checks[0]}}
{{artifacts[0].validation_checks[1]}} | OPTIONAL
retention_policy: {{artifacts[0].retention_policy}}
open_questions:
{{artifacts[0].open_questions[0]}} | OPTIONAL
(Repeat per artifact_type.)

3. Common Naming Rules
artifact_name_pattern: {{naming.pattern}}
file_naming_conventions: {{naming.file_conventions}} | OPTIONAL
4. Storage / Retention
storage_location: {{storage.location}}
retention_default: {{storage.retention_default}} | OPTIONAL
5. References
Versioning rules: {{xref:SIGN-04}} | OPTIONAL
Signing keys: {{xref:SIGN-02}} | OPTIONAL
Submission checklist: {{xref:SIGN-03}} | OPTIONAL
Release channels: {{xref:SIGN-05}} | OPTIONAL
Perf gates (web): {{xref:CPR-05}} | OPTIONAL
Perf gates (mobile): {{xref:MBAT-05}} | OPTIONAL
Cross-References
Upstream: {{xref:CPR-05}} | OPTIONAL, {{xref:MBAT-05}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:SIGN-02}}, {{xref:SIGN-04}}, {{xref:SIGN-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define artifact types, formats, signing, and distribution channels.
advanced: Required. Add symbol/sourcemap rules, retention, and validation gate linkage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, platform targets, debug symbols,
minify/obfuscate, feature flags default, key profile, distribution targets, versioning ref, extra
validation checks, retention default, naming file conventions, symbol upload rules,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If registry.types is UNKNOWN → block Completeness Gate.
If artifacts[*].signing.required is UNKNOWN → block Completeness Gate.
If storage.location is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SIGN
Pass conditions:
required_fields_present == true
artifact_registry_defined == true
platforms_and_formats_defined == true
signing_and_distribution_defined == true
validation_checks_defined == true

placeholder_resolution == true
no_unapproved_unknowns == true

SIGN-02

SIGN-02 — Signing Keys & Rotation Policy
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new artifact types beyond the registry.
- **Artifact naming/versioning MUST align with {{xref:SIGN-04}} when present.**
- **Artifacts MUST reference required gates/checks (e.g., perf, security) and not bypass them.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Artifact Registry`
2. `## artifact_types:`
3. `## Artifact Type Definitions`
4. `## Artifact`
5. `## build_config:`
6. `## signing:`
7. `## distribution:`
8. `## validation_checks:`
9. `## open_questions:`
10. `## (Repeat per artifact_type.)`

## 8. Cross-References

- **Upstream: {{xref:CPR-05}} | OPTIONAL, {{xref:MBAT-05}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:SIGN-02}}, {{xref:SIGN-04}}, {{xref:SIGN-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
