# SIGN-02 — Signing Keys & Rotation Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-02                                             |
| Template Type     | Build / Release & Signing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring signing keys & rotation policy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Signing Keys & Rotation Policy Document                         |

## 2. Purpose

Define the canonical policy for signing keys: what keys exist (per platform), where they are
stored, who can access them, how they are rotated, how compromises are handled, and
audit/logging requirements. This template must be consistent with build artifact types and must
not invent key material or processes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SIGN-01 Build Artifact Types: {{sign.artifacts}}
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Key inventory (key_id ... | spec         | Yes             |
| Key purpose (ios signi... | spec         | Yes             |
| Storage location polic... | spec         | Yes             |
| Access control policy ... | spec         | Yes             |
| Rotation schedule (tim... | spec         | Yes             |
| Revocation/compromise ... | spec         | Yes             |
| Backup/recovery policy    | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |
| No-commit rule (never ... | spec         | Yes             |

## 5. Optional Fields

Per-environment keys (dev/stage/prod) | OPTIONAL
Key ceremony notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never expose key material in docs/logs.
Rotation MUST be documented and testable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Key Inventory
Key
key_id: {{keys[0].key_id}}
platform: {{keys[0].platform}} (ios/android/UNKNOWN)
purpose: {{keys[0].purpose}}
env_scope: {{keys[0].env_scope}} | OPTIONAL
storage_location: {{keys[0].storage_location}}
access_policy: {{keys[0].access_policy}}
rotation_schedule: {{keys[0].rotation_schedule}}
revocation_plan: {{keys[0].revocation_plan}} | OPTIONAL
backup_policy: {{keys[0].backup_policy}} | OPTIONAL
audit_refs: {{keys[0].audit_refs}} | OPTIONAL
open_questions:
{{keys[0].open_questions[0]}} | OPTIONAL
(Repeat per key_id.)
2. Storage & Access Controls (Global)
no_commit_rule: {{controls.no_commit_rule}}
secret_store_policy: {{controls.secret_store_policy}}
approval_required: {{controls.approval_required}} | OPTIONAL
3. Rotation Policy
rotation_trigger: {{rotation.trigger}} (time/event/UNKNOWN)
rotation_frequency: {{rotation.frequency}} | OPTIONAL
rotation_steps: {{rotation.steps}} | OPTIONAL
4. Compromise Response
detection_signals: {{compromise.detection_signals}} | OPTIONAL
response_steps: {{compromise.response_steps}}
communication_policy: {{compromise.communication_policy}} | OPTIONAL
5. Backup / Recovery
backup_location_policy: {{backup.location_policy}}
recovery_test_policy: {{backup.recovery_test_policy}} | OPTIONAL
6. Audit Logging
audit_required_fields: {{audit.required_fields}}
audit_retention_policy: {{audit.retention_policy}} | OPTIONAL

7. References
Build artifacts: {{xref:SIGN-01}}
Audit trail spec: {{xref:ADMIN-03}} | OPTIONAL
Cross-References
Upstream: {{xref:SIGN-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SIGN-03}}, {{xref:SIGN-05}} | OPTIONAL
Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define key inventory + storage/access + compromise response.
advanced: Required. Add rotation ceremony and recovery testing rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, env scope, revocation/backup/audit refs,
approval required, detection signals, comms policy, retention policy, ceremony notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If keys[*].storage_location is UNKNOWN → block Completeness Gate.
If controls.no_commit_rule is UNKNOWN → block Completeness Gate.
If compromise.response_steps is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SIGN
Pass conditions:
required_fields_present == true
key_inventory_defined == true
storage_and_access_defined == true
rotation_defined == true
compromise_response_defined == true
audit_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SIGN-03

SIGN-03 — Store Submission Checklist (iOS/Android)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never expose key material in docs/logs.**
- **Rotation MUST be documented and testable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Key Inventory`
2. `## Key`
3. `## open_questions:`
4. `## (Repeat per key_id.)`
5. `## Storage & Access Controls (Global)`
6. `## Rotation Policy`
7. `## Compromise Response`
8. `## Backup / Recovery`
9. `## Audit Logging`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SIGN-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SIGN-03}}, {{xref:SIGN-05}} | OPTIONAL**
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
