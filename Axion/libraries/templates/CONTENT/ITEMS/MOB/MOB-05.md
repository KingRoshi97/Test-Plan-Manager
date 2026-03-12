# MOB-05 — Release & Signing (stores, builds)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-05                                             |
| Template Type     | Build / Mobile                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring release & signing (stores, builds)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Release & Signing (stores, builds) Document                         |

## 2. Purpose

Define the canonical mobile release and signing process: build types, signing keys, CI/release
channels, store submission steps, and versioning rules. This template must be consistent with
signing standards and must not invent store policies not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SIGN-01 Build Artifact Types: {{sign.artifacts}}
- SIGN-02 Signing Keys & Rotation: {{sign.keys}} | OPTIONAL
- SIGN-03 Store Submission Checklist: {{sign.submission}} | OPTIONAL
- SIGN-04 Versioning Rules: {{sign.versioning}} | OPTIONAL
- SIGN-05 Release Channel Policy: {{sign.channels}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Build artifact types (... | spec         | Yes             |
| Signing key storage po... | spec         | Yes             |
| Key rotation policy       | spec         | Yes             |
| Store submission proce... | spec         | Yes             |
| Versioning mapping (bu... | spec         | Yes             |
| Release channel flow (... | spec         | Yes             |
| Rollback/hotfix policy    | spec         | Yes             |
| Telemetry/release chec... | spec         | Yes             |

## 5. Optional Fields

Automated store upload notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Signing keys MUST be protected and never committed.
Versioning MUST follow SIGN-04.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Build Artifact Types
artifacts: {{build.artifacts}}
mapping_rules: {{build.mapping_rules}} | OPTIONAL
2. Signing Key Policy
key_storage: {{keys.storage}}
key_access_rules: {{keys.access_rules}} | OPTIONAL
rotation_policy_ref: {{keys.rotation_policy_ref}} (expected: {{xref:SIGN-02}}) | OPTIONAL
3. Store Submission
ios_steps: {{store.ios_steps}}
android_steps: {{store.android_steps}}
checklist_ref: {{store.checklist_ref}} (expected: {{xref:SIGN-03}}) | OPTIONAL
4. Versioning
versioning_ref: {{version.ref}} (expected: {{xref:SIGN-04}})
build_number_rule: {{version.build_number_rule}}
semver_rule: {{version.semver_rule}} | OPTIONAL
5. Release Channels
channel_policy_ref: {{channels.ref}} (expected: {{xref:SIGN-05}}) | OPTIONAL
flow: {{channels.flow}}
promotion_rules: {{channels.promotion_rules}} | OPTIONAL
6. Rollback / Hotfix
hotfix_policy: {{rollback.hotfix_policy}}
rollback_triggers: {{rollback.triggers}} | OPTIONAL
7. Release Health Checks
crash_rate_gate: {{health.crash_rate_gate}}
anr_rate_gate: {{health.anr_rate_gate}} | OPTIONAL
monitoring_window: {{health.monitoring_window}} | OPTIONAL
8. References
Build artifacts: {{xref:SIGN-01}}
Signing keys: {{xref:SIGN-02}} | OPTIONAL
Submission checklist: {{xref:SIGN-03}} | OPTIONAL
Versioning rules: {{xref:SIGN-04}} | OPTIONAL
Release channels: {{xref:SIGN-05}} | OPTIONAL
Cross-References
Upstream: {{xref:SIGN-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:RELEASE-GATE}} | OPTIONAL

Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define signing + submission + versioning.
advanced: Required. Add rotation/hotfix policies and release health gates.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, mapping rules, key access rules, rotation
ref, checklist ref, semver rule, channel policy ref, promotion rules, rollback triggers, anr gate,
monitoring window, automation notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If keys.storage is UNKNOWN → block Completeness Gate.
If version.build_number_rule is UNKNOWN → block Completeness Gate.
If health.crash_rate_gate is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MOB
Pass conditions:
required_fields_present == true
signing_and_submission_defined == true
versioning_defined == true
release_health_gates_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Mobile Device Capabilities (MDC)

Mobile Device Capabilities (MDC)
MDC-01 Capabilities Inventory (camera/gps/files/push)
MDC-02 Permissions UX Rules (prompts, denial handling)
MDC-03 Capability Security Rules (least privilege)
MDC-04 Capability Failure Handling (fallbacks)
MDC-05 Telemetry for Capabilities (errors, latency)

MDC-01

MDC-01 — Capabilities Inventory (camera/gps/files/push)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Signing keys MUST be protected and never committed.**
- **Versioning MUST follow SIGN-04.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Build Artifact Types`
2. `## Signing Key Policy`
3. `## Store Submission`
4. `## Versioning`
5. `## Release Channels`
6. `## Rollback / Hotfix`
7. `## Release Health Checks`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SIGN-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:RELEASE-GATE}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
