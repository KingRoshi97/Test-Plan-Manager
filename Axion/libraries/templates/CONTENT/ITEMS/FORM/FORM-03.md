# FORM-03 — Validation UX Rules (inline, focus, announce)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-03                                             |
| Template Type     | Build / Forms                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring validation ux rules (inline, focus, announce)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Validation UX Rules (inline, focus, announce) Document                         |

## 2. Purpose

Define the canonical UX rules for client-side and server-side form validation: when validation
runs, how errors display (inline vs summary), focus management, screen reader
announcements, and how server validation errors map to fields. This template must be
consistent with accessibility and error UX rules and must not invent validation modes not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FORM-01 Forms Inventory: {{forms.inventory}}
- FORM-02 Field Specs: {{forms.field_specs}}
- FE-05 Accessibility Notes: {{fe.a11y_notes}} | OPTIONAL
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Validation timing rules (on blur/on submit/on change)
Client vs server validation precedence rules
Inline error display rules
Summary error display rules (top-of-form)
Focus first error rules
Announcement rules (aria-live)
Field-to-error mapping rules (server errors to field_id)
Error copy policy (tone, specificity)
Disable submit rules (when invalid/pending)
Success feedback rules (post-submit)

Optional Fields
Per-form overrides | OPTIONAL
Async field validation (unique checks) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Validation UX MUST meet accessibility rules from {{xref:FE-05}}.
Server-side validation errors MUST be mapped to fields when possible; otherwise show
summary.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Validation Timing
on_change: {{timing.on_change}}
on_blur: {{timing.on_blur}}
on_submit: {{timing.on_submit}}
debounce_ms: {{timing.debounce_ms}} | OPTIONAL
2. Client vs Server Precedence
client_first_rule: {{precedence.client_first_rule}}
server_override_rule: {{precedence.server_override_rule}} | OPTIONAL
3. Inline Errors
inline_display_rule: {{inline.display_rule}}
inline_copy_policy: {{inline.copy_policy}}
inline_spacing_rules: {{inline.spacing_rules}} | OPTIONAL
4. Summary Errors
summary_display_rule: {{summary.display_rule}}
summary_contents: {{summary.contents}} | OPTIONAL
summary_link_to_fields: {{summary.link_to_fields}} | OPTIONAL
5. Focus Management
focus_first_error: {{focus.first_error}}
focus_on_submit_fail: {{focus.on_submit_fail}} | OPTIONAL
6. Screen Reader Announcements
aria_live_policy: {{sr.aria_live_policy}}
announce_on_submit_fail: {{sr.on_submit_fail}} | OPTIONAL
announce_inline_changes: {{sr.inline_changes}} | OPTIONAL
7. Server Error → Field Mapping
mapping_rule: {{server_map.mapping_rule}}
unmapped_error_behavior: {{server_map.unmapped_behavior}}
error_key_format: {{server_map.error_key_format}} | OPTIONAL
8. Submit Button Rules
disable_when_invalid: {{submit.disable_when_invalid}}

disable_when_pending: {{submit.disable_when_pending}}
show_spinner_when_pending: {{submit.show_spinner}} | OPTIONAL
9. Success Feedback
success_message_policy: {{success.message_policy}}
post_submit_navigation: {{success.post_submit_navigation}} | OPTIONAL
10.References
Field specs: {{xref:FORM-02}}
Accessibility: {{xref:FE-05}} | OPTIONAL
Error UX: {{xref:FE-07}} | OPTIONAL
Cross-References
Upstream: {{xref:FORM-01}}, {{xref:FORM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FORM-05}}, {{xref:FORM-06}} | OPTIONAL
Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define on_submit + inline error rules; use UNKNOWN for debounce/async
validation.
intermediate: Required. Define server-to-field mapping and focus/announcement policies.
advanced: Required. Add per-form override mechanisms and async validation guidance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, debounce_ms, server override rule,
inline spacing, summary contents/links, focus submit fail, sr announce options, error key format,
spinner, post submit nav, per-form overrides, async validation, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If timing.on_submit is UNKNOWN → block Completeness Gate.
If inline.display_rule is UNKNOWN → block Completeness Gate.
If server_map.mapping_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FORM
Pass conditions:
required_fields_present == true
validation_timing_defined == true
server_mapping_defined == true
a11y_rules_applied == true
placeholder_resolution == true
no_unapproved_unknowns == true

FORM-04

FORM-04 — Schema Mapping (forms ↔ DATA-06/DQV-03)
Header Block

## 5. Optional Fields

Per-form overrides | OPTIONAL
Async field validation (unique checks) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Validation UX MUST meet accessibility rules from {{xref:FE-05}}.**
- **Server-side validation errors MUST be mapped to fields when possible; otherwise show**
- **summary.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Validation Timing`
2. `## Client vs Server Precedence`
3. `## Inline Errors`
4. `## Summary Errors`
5. `## Focus Management`
6. `## Screen Reader Announcements`
7. `## Server Error → Field Mapping`
8. `## Submit Button Rules`
9. `## Success Feedback`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FORM-01}}, {{xref:FORM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FORM-05}}, {{xref:FORM-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,**
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
