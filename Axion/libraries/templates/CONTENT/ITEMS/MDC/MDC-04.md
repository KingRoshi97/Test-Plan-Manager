# MDC-04 — Capability Failure Handling (fallbacks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-04                                             |
| Template Type     | Build / Mobile Capabilities                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring capability failure handling (fallbacks)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Capability Failure Handling (fallbacks) Document                         |

## 2. Purpose

Define the canonical failure handling and fallback behaviors for mobile device capabilities,
including permission denial, hardware unavailability, OS restrictions, and transient errors. This
template must be consistent with permissions UX rules and offline/degraded mode UX and must
not invent fallback behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDC-01 Capabilities Inventory: {{mdc.capabilities}}
- MDC-02 Permissions UX Rules: {{mdc.permissions_ux}} | OPTIONAL
- CER-03 Offline/Error Mode UX: {{cer.offline_mode}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Failure types taxonomy... | spec         | Yes             |
| Permission denied beha... | spec         | Yes             |
| Hardware unavailable b... | spec         | Yes             |
| Offline behavior (if c... | spec         | Yes             |
| User messaging/copy po... | spec         | Yes             |
| Retry rules (when to r... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Per-screen fallback variants | OPTIONAL
Support contact policy | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Fallbacks MUST be safe and should preserve core app usability when possible.
Permission denial handling MUST align to {{xref:MDC-02}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Failure Types
types:
denied: {{fail.denied}}
unavailable: {{fail.unavailable}}
offline: {{fail.offline}} | OPTIONAL
error: {{fail.error}}
2. Per-Capability Fallbacks
Fallback
capability_id: {{fallbacks[0].capability_id}}
on_temp_denied: {{fallbacks[0].on_temp_denied}}
on_perm_denied: {{fallbacks[0].on_perm_denied}} | OPTIONAL
on_unavailable: {{fallbacks[0].on_unavailable}}
on_offline: {{fallbacks[0].on_offline}} | OPTIONAL
retry_rule: {{fallbacks[0].retry_rule}} | OPTIONAL
copy_policy: {{fallbacks[0].copy_policy}} | OPTIONAL
notes: {{fallbacks[0].notes}} | OPTIONAL
open_questions:
{{fallbacks[0].open_questions[0]}} | OPTIONAL
(Repeat per capability_id.)
3. User Messaging
tone: {{copy.tone}}
safe_message_rules: {{copy.safe_message_rules}} | OPTIONAL
4. Retry Rules
retry_allowed: {{retry.allowed}}
retry_trigger: {{retry.trigger}} | OPTIONAL
cooldown_ms: {{retry.cooldown_ms}} | OPTIONAL
5. Telemetry
denial_metric: {{telemetry.denial_metric}}
unavailable_metric: {{telemetry.unavailable_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
6. References
Capabilities inventory: {{xref:MDC-01}}
Permissions UX rules: {{xref:MDC-02}} | OPTIONAL

Offline UX: {{xref:CER-03}} | OPTIONAL
Telemetry: {{xref:MDC-05}} | OPTIONAL
Cross-References
Upstream: {{xref:MDC-01}}, {{xref:MDC-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MDC-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define denied/unavailable fallback basics; use UNKNOWN for per-screen
nuance.
intermediate: Required. Define retry rules and telemetry mapping.
advanced: Required. Add support escalation and per-screen variants.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, offline type, perm denied behavior,
on_offline, retry rules, copy policy, notes, safe message rules, retry trigger/cooldown, telemetry
optional metrics/fields, per-screen variants, support policy, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If fail.error is UNKNOWN → block Completeness Gate.
If fallbacks list is UNKNOWN → block Completeness Gate.
If telemetry.denial_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MDC
Pass conditions:
required_fields_present == true
failure_types_defined == true
per_capability_fallbacks_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MDC-05

MDC-05 — Telemetry for Capabilities (errors, latency)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Fallbacks MUST be safe and should preserve core app usability when possible.**
- **Permission denial handling MUST align to {{xref:MDC-02}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Failure Types`
2. `## types:`
3. `## Per-Capability Fallbacks`
4. `## Fallback`
5. `## open_questions:`
6. `## (Repeat per capability_id.)`
7. `## User Messaging`
8. `## Retry Rules`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MDC-01}}, {{xref:MDC-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MDC-05}} | OPTIONAL**
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
