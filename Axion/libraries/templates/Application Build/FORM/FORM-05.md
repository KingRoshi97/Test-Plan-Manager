# FORM-05 — Submission & Error Recovery Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-05                                             |
| Template Type     | Build / Forms                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring submission & error recovery patterns    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Submission & Error Recovery Patterns Document                         |

## 2. Purpose

Define the canonical patterns for form submission, including request lifecycle, pending states,
idempotency, server validation mapping, conflict handling, retries, and user recovery flows. This
template must be consistent with mutation patterns and API error policy and must not invent
submission flows not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FORM-01 Forms Inventory: {{forms.inventory}}
- FORM-03 Validation UX Rules: {{forms.validation_ux}}
- SMD-03 Mutation Patterns: {{smd.mutation_patterns}} | OPTIONAL
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- API-03 Error Policy: {{api.error_policy}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Submission lifecycle (idle → submitting → success/fail)
Pending UI rules (disable submit, spinner, prevent double submit)
Request construction rules (payload mapping ref to FORM-04)
Idempotency policy (client keys, dedupe)
Server validation error mapping (bind to FORM-03/FORM-04)
Conflict handling (409) rules
Retry policy (when allowed)
Timeout policy (client-side)
Recovery actions (edit & resubmit, retry, cancel)
Post-success behavior (navigate, toast, reset form)

Optional Fields
Multi-step submit rules | OPTIONAL
Autosave/draft submit rules | OPTIONAL
Offline queued submit binding | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Form submission MUST follow mutation patterns from {{xref:SMD-03}} when present.
Server field errors MUST map to field-level UI per {{xref:FORM-03}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Submission Lifecycle
states: {{lifecycle.states}} (idle/submitting/success/error/UNKNOWN)
transitions: {{lifecycle.transitions}} | OPTIONAL
2. Pending UI Rules
disable_submit_while_pending: {{pending.disable_submit}}
show_spinner: {{pending.show_spinner}} | OPTIONAL
prevent_double_submit: {{pending.prevent_double_submit}}
submit_lock_timeout_ms: {{pending.lock_timeout_ms}} | OPTIONAL
3. Request Construction
payload_mapping_ref: {{request.payload_mapping_ref}} (expected: {{xref:FORM-04}})
endpoint_binding_rule: {{request.endpoint_binding_rule}} (bind to API-02/FORM-01)
headers_required: {{request.headers_required}} | OPTIONAL
idempotency_key_rule: {{request.idempotency_key_rule}} | OPTIONAL
4. Server Validation Error Recovery
field_mapping_ref: {{errors.field_mapping_ref}} (expected:
{{xref:FORM-03}}/{{xref:FORM-04}})
inline_errors_required: {{errors.inline_required}}
summary_errors_when_unmapped: {{errors.summary_when_unmapped}}
error_copy_policy: {{errors.copy_policy}} | OPTIONAL
5. Conflict Handling (409)
on_conflict: {{conflict.on_conflict}}
merge_or_prompt_policy: {{conflict.merge_or_prompt_policy}} | OPTIONAL
6. Retry Policy
retry_allowed: {{retry.allowed}}
retryable_error_classes: {{retry.retryable_error_classes}} | OPTIONAL
backoff_policy: {{retry.backoff_policy}} | OPTIONAL
max_attempts: {{retry.max_attempts}} | OPTIONAL
7. Timeout Policy
client_timeout_ms: {{timeout.client_timeout_ms}}
timeout_ui_behavior: {{timeout.ui_behavior}} | OPTIONAL

8. Recovery Actions
edit_and_resubmit: {{recovery.edit_and_resubmit}}
retry_action: {{recovery.retry_action}} | OPTIONAL
cancel_action: {{recovery.cancel_action}} | OPTIONAL
9. Post-Success Behavior
success_toast_policy: {{success.toast_policy}} | OPTIONAL
navigate_after_success: {{success.navigate_after_success}} | OPTIONAL
reset_form_after_success: {{success.reset_form_after_success}}
10.References
Forms inventory: {{xref:FORM-01}}
Validation UX: {{xref:FORM-03}}
Schema mapping: {{xref:FORM-04}} | OPTIONAL
Mutation patterns: {{xref:SMD-03}} | OPTIONAL
Error UX: {{xref:FE-07}} | OPTIONAL
API error policy: {{xref:API-03}} | OPTIONAL
Cross-References
Upstream: {{xref:FORM-01}}, {{xref:FORM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FORM-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define lifecycle + pending UI; use UNKNOWN for idempotency if not
specified.
intermediate: Required. Define server error mapping + conflict/retry behavior.
advanced: Required. Add offline/draft/multi-step rules if applicable and robust timeout handling.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, lifecycle transitions, spinner, lock
timeout, headers required, idempotency key rule, field mapping ref, error copy policy,
merge/prompt policy, retryable errors/backoff/max attempts, timeout UI behavior, retry/cancel
actions, toast/nav policies, multi-step/draft/offline bindings, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If lifecycle.states is UNKNOWN → block Completeness Gate.
If pending.prevent_double_submit is UNKNOWN → block Completeness Gate.
If request.endpoint_binding_rule is UNKNOWN → block Completeness Gate.
If timeout.client_timeout_ms is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FORM
Pass conditions:
required_fields_present == true
submission_lifecycle_defined == true
pending_ui_rules_defined == true

error_recovery_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

FORM-06

FORM-06 — Anti-Abuse for Forms (spam, throttles, bot defense)
Header Block

## 5. Optional Fields

Multi-step submit rules | OPTIONAL
Autosave/draft submit rules | OPTIONAL
Offline queued submit binding | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Form submission MUST follow mutation patterns from {{xref:SMD-03}} when present.**
- **Server field errors MUST map to field-level UI per {{xref:FORM-03}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Submission Lifecycle`
2. `## Pending UI Rules`
3. `## Request Construction`
4. `## Server Validation Error Recovery`
5. `## Conflict Handling (409)`
6. `## Retry Policy`
7. `## Timeout Policy`
8. `## Recovery Actions`
9. `## Post-Success Behavior`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FORM-01}}, {{xref:FORM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FORM-06}} | OPTIONAL**
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
