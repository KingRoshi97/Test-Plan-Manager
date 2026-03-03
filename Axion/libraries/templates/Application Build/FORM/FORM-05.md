# FORM-05 — Submission & Error Recovery Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-05                                          |
| Template Type     | Build / Forms                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring submission & error recove |
| Filled By         | Internal Agent                                   |
| Consumes          | FORM-01, FORM-03, SMD-03, FE-07, API-03          |
| Produces          | Filled Submission & Error Recovery Patterns      |

## 2. Purpose

Define the canonical patterns for form submission, including request lifecycle, pending states, idempotency, server validation mapping, conflict handling, retries, and user recovery flows. This template must be consistent with mutation patterns and API error policy and must not invent submission flows not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FORM-01 Forms Inventory: `{{forms.inventory}}`
- FORM-03 Validation UX Rules: `{{forms.validation_ux}}`
- SMD-03 Mutation Patterns: `{{smd.mutation_patterns}}` | OPTIONAL
- FE-07 Error Handling UX: `{{fe.error_ux}}` | OPTIONAL
- API-03 Error Policy: `{{api.error_policy}}` | OPTIONAL
- API-02 Endpoint Specs: `{{api.endpoint_specs}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Submission lifecycle | idle → submitting → success/fail |
| Pending UI rules | Disable submit, spinner, prevent double submit |
| Request construction rules | Payload mapping ref to FORM-04 |
| Idempotency policy | Client keys, dedupe |
| Server validation error mapping | Bind to FORM-03/FORM-04 |
| Conflict handling (409) rules | Merge or prompt |
| Retry policy | When allowed |
| Timeout policy | Client-side |
| Recovery actions | Edit & resubmit, retry, cancel |
| Post-success behavior | Navigate, toast, reset form |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Multi-step submit rules | OPTIONAL |
| Autosave/draft submit rules | OPTIONAL |
| Offline queued submit binding | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Form submission MUST follow mutation patterns from `{{xref:SMD-03}}` when present.
- Server field errors MUST map to field-level UI per `{{xref:FORM-03}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FORM-01}}`, `{{xref:FORM-03}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:FORM-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define lifecycle + pending UI; use UNKNOWN for idempotency if not specified. |
| intermediate | Required. Define server error mapping + conflict/retry behavior. |
| advanced | Required. Add offline/draft/multi-step rules if applicable and robust timeout handling. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, lifecycle transitions, spinner, lock timeout, headers required, idempotency key rule, field mapping ref, error copy policy, merge/prompt policy, retryable errors/backoff/max attempts, timeout UI behavior, retry/cancel actions, toast/nav policies, multi-step/draft/offline bindings, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If lifecycle.states is UNKNOWN → block Completeness Gate.
- If pending.prevent_double_submit is UNKNOWN → block Completeness Gate.
- If request.endpoint_binding_rule is UNKNOWN → block Completeness Gate.
- If timeout.client_timeout_ms is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FORM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] submission_lifecycle_defined == true
- [ ] pending_ui_rules_defined == true
- [ ] error_recovery_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

