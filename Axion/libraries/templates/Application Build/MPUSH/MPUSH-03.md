# MPUSH-03 — Permission & Opt-In Rules (platform specific)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-03                                             |
| Template Type     | Build / Push Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring permission & opt-in rules (platform specific)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Permission & Opt-In Rules (platform specific) Document                         |

## 2. Purpose

Define the canonical rules for push notification permission prompts and opt-in flows on
iOS/Android, including when to ask, pre-prompt rationale, user preference settings, and
handling of denied permissions. This template must be consistent with notification catalog and
mobile permission UX rules and must not invent opt-in behaviors not present in upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MDC-02 Permissions UX Rules: {{mdc.permissions_ux}} | OPTIONAL
- MPUSH-06 Abuse/Spam Controls: {{mpush.abuse_controls}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| iOS permission prompt ... | spec         | Yes             |
| Android permission rul... | spec         | Yes             |
| Pre-prompt rationale r... | spec         | Yes             |
| Opt-in preference mode... | spec         | Yes             |
| Default opt-in states ... | spec         | Yes             |
| Denied handling rules ... | spec         | Yes             |
| Settings screen rules ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Quiet hours support (i... | spec         | Yes             |

## 5. Optional Fields

Provisional authorization (iOS) | OPTIONAL

Topic subscriptions | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Permission prompts SHOULD be triggered by user intent and not shown immediately on first**
- **launch unless explicitly required.**
- **Opt-in behavior MUST respect user choices and platform rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## iOS Prompt Timing`
2. `## Android Rules`
3. `## Pre-Prompt Rationale`
4. `## Preference Model`
5. `## Denied Handling`
6. `## Settings Screen`
7. `## Telemetry`
8. `## Quiet Hours`
9. `## References`
10. `## Cross-References`

## 8. Cross-References

- **Upstream: {{xref:MPUSH-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MPUSH-04}}, {{xref:MPUSH-06}} | OPTIONAL**
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
