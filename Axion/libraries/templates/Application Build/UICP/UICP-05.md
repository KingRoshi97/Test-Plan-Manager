# UICP-05 — Interaction Patterns (modals, drawers, toasts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-05                                             |
| Template Type     | Build / UI Composition                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring interaction patterns (modals, drawers, toasts)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Interaction Patterns (modals, drawers, toasts) Document                         |

## 2. Purpose

Define the canonical interaction patterns used across the UI: modals, drawers, toasts, tooltips,
confirmations, and other transient UI. Includes behavior rules, accessibility rules, back/escape
handling, and when to use each pattern. This template must be consistent with state/error
models and routing back/history rules and must not invent interaction primitives not present in
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- UICP-01 Page Composition Patterns: {{ui.page_patterns}} | OPTIONAL
- FE-03 UI State Model: {{fe.state_model}} | OPTIONAL
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- ROUTE-05 Back/History Rules: {{route.back_rules}} | OPTIONAL
- FE-05 Accessibility Notes: {{fe.a11y_notes}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Pattern registry (pattern types used)
When to use each (modal vs drawer vs page)
Open/close rules (escape/back, click outside)
Focus management rules (trap, return focus)
Stacking rules (multiple modals)
Toast rules (duration, max stack, placement)
Confirmation patterns (destructive actions)
Error surface integration (bind to FE-07)
Accessibility rules for each pattern
Telemetry requirements (optional)

Optional Fields
Animation/motion rules | OPTIONAL
Mobile-specific gesture rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Interaction patterns MUST follow back/history rules ({{xref:ROUTE-05}}).
Focus trapping/return MUST follow a11y rules ({{xref:FE-05}}).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Pattern Registry
patterns_used: {{patterns.used}} (modal/drawer/toast/tooltip/confirm/UNKNOWN)
2. Usage Rules
modal_when: {{usage.modal_when}}
drawer_when: {{usage.drawer_when}}
toast_when: {{usage.toast_when}}
page_when: {{usage.page_when}} | OPTIONAL
3. Open/Close Rules
escape_closes: {{openclose.escape_closes}}
back_closes: {{openclose.back_closes}} | OPTIONAL
click_outside_closes: {{openclose.click_outside_closes}} | OPTIONAL
close_button_required: {{openclose.close_button_required}} | OPTIONAL
4. Focus Management
focus_trap_required: {{focus.trap_required}}
initial_focus_rule: {{focus.initial_focus_rule}} | OPTIONAL
return_focus_rule: {{focus.return_focus_rule}}
5. Stacking Rules
multiple_modals_allowed: {{stacking.multiple_modals_allowed}}
stacking_limit: {{stacking.limit}} | OPTIONAL
z_index_rules: {{stacking.z_index_rules}} | OPTIONAL
6. Toast Rules
max_toasts: {{toast.max}}
duration_ms: {{toast.duration_ms}}
placement: {{toast.placement}} | OPTIONAL
dedupe_rule: {{toast.dedupe_rule}} | OPTIONAL
7. Confirmation Patterns
confirm_required_for: {{confirm.required_for}}
confirm_copy_policy: {{confirm.copy_policy}} | OPTIONAL
danger_style_rule: {{confirm.danger_style_rule}} | OPTIONAL
8. Error Surface Integration
error_surface_ref: {{errors.surface_ref}} (expected: {{xref:FE-07}}) | OPTIONAL

9. Accessibility Rules
aria_roles: {{a11y.aria_roles}}
announce_toasts: {{a11y.announce_toasts}} | OPTIONAL
reduced_motion_support: {{a11y.reduced_motion_support}} | OPTIONAL
10.Telemetry (Optional)
interaction_event_metric: {{telemetry.event_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
11.References
Page patterns: {{xref:UICP-01}} | OPTIONAL
UI state model: {{xref:FE-03}} | OPTIONAL
Error UX: {{xref:FE-07}} | OPTIONAL
Back/history rules: {{xref:ROUTE-05}} | OPTIONAL
Accessibility notes: {{xref:FE-05}} | OPTIONAL
Cross-References
Upstream: {{xref:UICP-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FE-02}}, {{xref:ROUTE-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-A11Y]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define when-to-use and close rules; use UNKNOWN for
telemetry/animations.
intermediate: Required. Define focus/stacking/toast limits and error integration.
advanced: Required. Add reduced-motion and mobile gesture rules with measurable
constraints.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, page_when, back/click-outside/close
button rules, focus initial rule, stacking limits/z-index, toast placement/dedupe, confirm
copy/danger style, error surface ref, a11y announce/reduced motion, telemetry fields,
animation/gesture notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If patterns.used is UNKNOWN → block Completeness Gate.
If focus.trap_required is UNKNOWN → block Completeness Gate.
If toast.max or toast.duration_ms is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.UICP
Pass conditions:
required_fields_present == true
patterns_and_usage_defined == true
open_close_rules_defined == true
a11y_rules_defined == true

placeholder_resolution == true
no_unapproved_unknowns == true

Client Error Handling & Recovery (CER)

Client Error Handling & Recovery (CER)
CER-01 Error Boundary Strategy (global vs local)
CER-02 Retry & Recovery Patterns (per error class)
CER-03 Offline/Error Mode UX (degraded experiences)
CER-04 Session Expiry Handling (re-auth prompts, restore state)
CER-05 Client Logging & Crash Reporting (fields, redaction)

CER-01

CER-01 — Error Boundary Strategy (global vs local)
Header Block

## 5. Optional Fields

Animation/motion rules | OPTIONAL
Mobile-specific gesture rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Interaction patterns MUST follow back/history rules ({{xref:ROUTE-05}}).**
- **Focus trapping/return MUST follow a11y rules ({{xref:FE-05}}).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Pattern Registry`
2. `## Usage Rules`
3. `## Open/Close Rules`
4. `## Focus Management`
5. `## Stacking Rules`
6. `## Toast Rules`
7. `## Confirmation Patterns`
8. `## Error Surface Integration`
9. `## Accessibility Rules`
10. `## Telemetry (Optional)`

## 8. Cross-References

- **Upstream: {{xref:UICP-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FE-02}}, {{xref:ROUTE-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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
