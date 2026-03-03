# MOB-05 — Mobile Accessibility

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-05                                           |
| Template Type     | Build / Mobile                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mobile accessibility      |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Mobile Accessibility                      |

## 2. Purpose

Define the canonical mobile release and signing process: build types, signing keys, CI/release channels, store submission steps, and versioning rules. This template must be consistent with signing standards and must not invent store policies not present in upstream inputs.

## 3. Inputs Required

- SIGN-01: `{{sign.artifacts}}`
- SIGN-02: `{{sign.keys}}` | OPTIONAL
- SIGN-03: `{{sign.submission}}` | OPTIONAL
- SIGN-04: `{{sign.versioning}}` | OPTIONAL
- SIGN-05: `{{sign.channels}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Build artifact types (debug/beta/prod) | SIGN-01 | No |
| Signing key storage policy | SIGN-02 | No |
| Key rotation policy | SIGN-02 | Yes |
| Store submission process (iOS/Android) | SIGN-03 | No |
| Versioning mapping (build numbers, semver) | SIGN-04 | No |
| Release channel flow (internal → beta → GA) | SIGN-05 | Yes |
| Rollback/hotfix policy | SIGN-05 | Yes |
| Telemetry/release checks (crash rate gates) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Automated store upload notes | spec | CI integration details |
| Open questions | agent | Enrichment only |

## 6. Rules

- Signing keys MUST be protected and never committed.
- Versioning MUST follow SIGN-04.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Build Artifact Types` — artifacts, mapping_rules
2. `## Signing Key Policy` — key_storage, key_access_rules, rotation_policy_ref
3. `## Store Submission` — ios_steps, android_steps, checklist_ref
4. `## Versioning` — versioning_ref, build_number_rule, semver_rule
5. `## Release Channels` — channel_policy_ref, flow, promotion_rules
6. `## Rollback / Hotfix` — hotfix_policy, rollback_triggers
7. `## Release Health Checks` — crash_rate_gate, anr_rate_gate, monitoring_window

## 8. Cross-References

- **Upstream**: SIGN-01, SPEC_INDEX
- **Downstream**: RELEASE-GATE
- **Standards**: STD-SECURITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Signing + submission + versioning | Not required | Required | Required |
| Rotation/hotfix + release health | Not required | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, mapping rules, key access rules, rotation ref, checklist ref, semver rule, channel policy ref, promotion rules, rollback triggers, anr gate, monitoring window, automation notes, open_questions
- If keys.storage is UNKNOWN → block Completeness Gate.
- If version.build_number_rule is UNKNOWN → block Completeness Gate.
- If health.crash_rate_gate is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] signing_and_submission_defined == true
- [ ] versioning_defined == true
- [ ] release_health_gates_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
