# SIGN-04 — Versioning Rules (build numbers, semver mapping)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-04                                             |
| Template Type     | Build / Release & Signing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring versioning rules (build numbers, semver mapping)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Versioning Rules (build numbers, semver mapping) Document                         |

## 2. Purpose

Define the canonical versioning rules across platforms: semantic versioning policy, build number
generation, mapping rules per platform, and how version changes relate to releases and
rollbacks. This template must be consistent with build artifact types and store submission
requirements and must not invent versioning schemes not present in upstream inputs.

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
| SemVer policy (MAJOR.M... | spec         | Yes             |
| What triggers major/mi... | spec         | Yes             |
| Build number rule (mon... | spec         | Yes             |
| Pre-release channel ve... | spec         | Yes             |
| Hotfix versioning rules   | spec         | Yes             |
| Rollback versioning rules | spec         | Yes             |
| Version source of trut... | spec         | Yes             |
| Telemetry version fiel... | spec         | Yes             |

## 5. Optional Fields

Date-based versioning notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Build numbers MUST be monotonically increasing per store rules.
Versioning MUST be deterministic and derived from a single source of truth.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. SemVer Policy
semver_enabled: {{semver.enabled}}
bump_rules:
major: {{semver.major_rule}}
minor: {{semver.minor_rule}}
patch: {{semver.patch_rule}}
2. Build Number Rule
build_number_source: {{build.source}}
monotonic_rule: {{build.monotonic_rule}}
format: {{build.format}} | OPTIONAL
3. Platform Mapping
ios_short_version: {{platform.ios.short_version}}
ios_build_version: {{platform.ios.build_version}}
android_version_name: {{platform.android.version_name}}
android_version_code: {{platform.android.version_code}}
4. Pre-Release Labeling
beta_label_rule: {{pre.beta_label_rule}} | OPTIONAL
rc_label_rule: {{pre.rc_label_rule}} | OPTIONAL
5. Hotfix Rules
hotfix_version_rule: {{hotfix.version_rule}}
hotfix_branch_rule: {{hotfix.branch_rule}} | OPTIONAL
6. Rollback Rules
rollback_version_rule: {{rollback.version_rule}}
rollback_constraints: {{rollback.constraints}} | OPTIONAL
7. Source of Truth
version_file_or_config: {{sot.location}}
update_process: {{sot.update_process}} | OPTIONAL
8. Telemetry Fields
app_version_field: {{telemetry.app_version_field}}
build_number_field: {{telemetry.build_number_field}} | OPTIONAL
9. References
Build artifacts: {{xref:SIGN-01}} | OPTIONAL
Submission checklist: {{xref:SIGN-03}} | OPTIONAL
Cross-References
Upstream: {{xref:SIGN-01}} | OPTIONAL, {{xref:SIGN-03}} | OPTIONAL, {{xref:SPEC_INDEX}} |

OPTIONAL
Downstream: {{xref:SIGN-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define semver + build number + platform mapping.
advanced: Required. Add pre-release/hotfix/rollback rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, build format, pre-release labels, hotfix
branch rules, rollback constraints, update process, build number field, date-based notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If semver.enabled is UNKNOWN → block Completeness Gate.
If build.monotonic_rule is UNKNOWN → block Completeness Gate.
If platform mapping fields are UNKNOWN → block Completeness Gate.
If sot.location is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SIGN
Pass conditions:
required_fields_present == true
semver_and_build_rules_defined == true
platform_mapping_defined == true
source_of_truth_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SIGN-05

SIGN-05 — Release Channel Policy (internal/beta/GA)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Build numbers MUST be monotonically increasing per store rules.**
- **Versioning MUST be deterministic and derived from a single source of truth.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## SemVer Policy`
2. `## bump_rules:`
3. `## Build Number Rule`
4. `## Platform Mapping`
5. `## Pre-Release Labeling`
6. `## Hotfix Rules`
7. `## Rollback Rules`
8. `## Source of Truth`
9. `## Telemetry Fields`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SIGN-01}} | OPTIONAL, {{xref:SIGN-03}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:SIGN-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
