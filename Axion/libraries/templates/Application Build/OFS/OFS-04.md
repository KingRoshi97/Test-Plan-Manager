# OFS-04 — Conflict Resolution Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-04                                           |
| Template Type     | Build / Offline                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring conflict resolution rules |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Conflict Resolution Rules                 |

## 2. Purpose

Define the canonical UX patterns for offline mode: how users know they are offline, how queued actions are indicated, what happens when actions fail offline, and how sync status is communicated. This template must be consistent with offline scope and error/degraded mode UX and must not invent offline UX not present in upstream inputs.

## 3. Inputs Required

- OFS-01: `{{ofs.scope}}`
- CER-03: `{{cer.offline_mode}}` | OPTIONAL
- FORM-01: `{{forms.inventory}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Offline indicator (banner/badge/icon) | CER-03 | No |
| Indicator placement rules | CER-03 | No |
| Queued action indicator | spec | No |
| Queued action user feedback (pending/success/failed) | spec | No |
| Blocked action handling (what user sees) | OFS-01 | No |
| Sync progress indicator | spec | Yes |
| Form behavior when offline | FORM-01 | Yes |
| Accessibility for indicators | FE-05 | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Animation/transition for offline toggle | spec | Motion design |
| Sync failure UX (retry prompt) | spec | Explicit retry option |
| Open questions | agent | Enrichment only |

## 6. Rules

- Offline indicators MUST be obvious and accessible (screen reader support, color-blind safe).
- Queued actions MUST show pending state clearly until synced.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Offline Indicator` — indicator_type, placement, copy, a11y_label
2. `## Queued Action Indicator` — indicator_type, pending_state, success_state, failed_state
3. `## Blocked Action Handling` — blocked_message, cta (retry/dismiss), blocked_copy
4. `## Sync Progress` — progress_indicator, progress_placement
5. `## Form Behavior` — save_locally, submit_queued, validation_still_runs
6. `## Accessibility` — announce_on_toggle, focus_management, color_contrast_rules

## 8. Cross-References

- **Upstream**: OFS-01, CER-03, SPEC_INDEX
- **Downstream**: OFS-05
- **Standards**: STD-A11Y, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Indicator + blocked action basics | Required | Required | Required |
| Queued state + sync progress | Optional | Required | Required |
| Form behavior + a11y nuances | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, indicator copy, a11y label, success/failed state, cta details, blocked copy, progress placement, form details, color contrast, animations, sync failure UX, open_questions
- If indicator.type is UNKNOWN → block Completeness Gate.
- If queued.pending_state is UNKNOWN → block Completeness Gate.
- If blocked.message is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] offline_indicator_defined == true
- [ ] queued_action_ux_defined == true
- [ ] blocked_action_handling_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
