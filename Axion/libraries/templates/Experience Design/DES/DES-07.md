# DES-07 — Error Handling UX (toasts,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-07                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error handling ux (toasts,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Handling UX (toasts, Document                         |

## 2. Purpose

Define consistent UX rules for error presentation and recovery across the app: where errors
appear, what they say, whether actions are available, and how retries/backoff behave.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- DES-05: {{xref:DES-05}}
- ARC-06: {{xref:ARC-06}} | OPTIONAL
- API-03: {{xref:API-03}} | OPTIONAL
- CDX-04: {{xref:CDX-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

●
●
●
●
●
●

Error surface rules (inline vs banner vs toast vs modal)
Error categories (validation/network/server/permission/unknown)
Retry rules (when allowed, backoff, max attempts)
Fallback rules (when to show generic message)
Logging/telemetry pointer rules (what gets recorded)
Accessibility rules (announcements, focus)

Optional Fields
● Support escalation UI (contact support) | OPTIONAL
● Offline-specific errors | OPTIONAL
● Notes | OPTIONAL

Rules
●
●
●
●

Error messages must be actionable and consistent; do not leak sensitive details.
Permission errors must align to IAM/BRP entitlements.
Server errors should map reason codes when available (ARC-06).
Retry must not create destructive repeats unless idempotent.

Output Format
1) Error Surface Rules (required)
error_
type

preferred_surface

when_used

user_action

notes

validat
ion

{{surfaces.validation
.surface}}

{{surfaces.validatio
n.when}}

{{surfaces.validatio
n.action}}

{{surfaces.validatio
n.notes}}

networ {{surfaces.network.s
k
urface}}

{{surfaces.network. {{surfaces.network.
when}}
action}}

{{surfaces.network
.notes}}

server

{{surfaces.server.su
rface}}

{{surfaces.server.w
hen}}

{{surfaces.server.a
ction}}

{{surfaces.server.n
otes}}

permis {{surfaces.permissio
sion
n.surface}}

{{surfaces.permissi
on.when}}

{{surfaces.permissi
on.action}}

{{surfaces.permissi
on.notes}}

unkno
wn

{{surfaces.unknow
n.when}}

{{surfaces.unknown {{surfaces.unknow
.action}}
n.notes}}

{{surfaces.unknown.
surface}}

2) Retry Rules (required)
●
●
●
●

When retry is shown: {{retry.when}}
Backoff: {{retry.backoff}}
Max attempts: {{retry.max_attempts}}
Idempotency note: {{retry.idempotency_note}} | OPTIONAL

3) Fallback Rules (required)

● Generic message conditions: {{fallback.when_generic}}
● Sensitive detail redaction: {{fallback.redaction}}
● Unknown error path: {{fallback.unknown_path}}

4) Accessibility (required)
● Announce errors: {{a11y.announce}}
● Focus management: {{a11y.focus}}
● Toast timing considerations: {{a11y.toast_timing}} | OPTIONAL

5) Logging/Telemetry (required)
● What to log: {{telemetry.what}}
● Correlation ID display policy: {{telemetry.correlation_id_policy}} | OPTIONAL

6) Support Escalation (optional)
● {{support.ui}} | OPTIONAL

Cross-References
● Upstream: {{xref:DES-05}}, {{xref:ARC-06}} | OPTIONAL, {{xref:API-03}} | OPTIONAL
● Downstream: {{xref:CER-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL, {{xref:OBS-01}} |
OPTIONAL
● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Define surfaces and retry basics.
● intermediate: Required. Add fallback and telemetry rules.
● advanced: Required. Add idempotency constraints and support escalation patterns.

Unknown Handling
● UNKNOWN_ALLOWED: support_escalation_ui, offline_specific, notes
● If retry rules are UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.DESIGN
● Pass conditions:
○ required_fields_present == true

○
○
○
○
○

surfaces_defined == true
retry_rules_present == true
fallback_rules_present == true
placeholder_resolution == true
no_unapproved_unknowns == true

DES-08

DES-08 — Acceptance Hooks (screen/flow
→ PRD-09 criteria mapping)
Header Block
●
●
●
●
●
●
●
●
●

## 5. Optional Fields

● Support escalation UI (contact support) | OPTIONAL
● Offline-specific errors | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- **Error messages must be actionable and consistent; do not leak sensitive details.**
- **Permission errors must align to IAM/BRP entitlements.**
- **Server errors should map reason codes when available (ARC-06).**
- **Retry must not create destructive repeats unless idempotent.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Error Surface Rules (required)`
2. `## error_`
3. `## type`
4. `## preferred_surface`
5. `## when_used`
6. `## user_action`
7. `## notes`
8. `## validat`
9. `## ion`
10. `## .surface}}`

## 8. Cross-References

- Upstream: {{xref:DES-05}}, {{xref:ARC-06}} | OPTIONAL, {{xref:API-03}} | OPTIONAL
- Downstream: {{xref:CER-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL, {{xref:OBS-01}} |
- OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
