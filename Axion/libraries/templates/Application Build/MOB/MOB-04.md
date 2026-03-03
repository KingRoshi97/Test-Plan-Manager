# MOB-04 — Mobile Build & CI Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-04                                           |
| Template Type     | Build / Mobile                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mobile build & ci spec    |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Mobile Build & CI Spec                    |

## 2. Purpose

Define the canonical mobile app lifecycle behavior: what happens on foreground/background transitions, app resume, cold start, memory pressure, and how state is saved/restored. Includes security/privacy behavior when backgrounded and offline queue behavior. This template must be consistent with data protection and offline handling and must not invent lifecycle behaviors not present in upstream inputs.

## 3. Inputs Required

- MOB-01: `{{mob.nav_map}}` | OPTIONAL
- CSec-02: `{{csec.data_protection}}` | OPTIONAL
- SMD-05: `{{smd.offline_handling}}` | OPTIONAL
- MBAT-01: `{{mbat.bg_work_rules}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Lifecycle events handled (cold start, resume, background, terminate) | spec | No |
| State persistence model (what is saved) | SMD | No |
| Resume refresh rules (what refetches on resume) | spec | Yes |
| Offline queue behavior on resume | SMD-05 | Yes |
| Security/privacy rules on background | CSec-02 | No |
| Session expiry checks on resume | CER-04 | Yes |
| Push/deeplink behavior on cold start vs resume | MDL/MPUSH | Yes |
| Telemetry requirements (resume counts, crashes) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Memory pressure handling | spec | OS kill scenarios |
| App update migration rules | spec | Schema/state migrations |
| Open questions | agent | Enrichment only |

## 6. Rules

- Background behavior MUST protect sensitive data per `{{xref:CSec-02}}`.
- Offline queue handling MUST align with `{{xref:SMD-05}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Lifecycle Events` — events_handled, notes
2. `## State Persistence` — persisted_state, persistence_location, hydration_order
3. `## Resume Refresh` — refetch_on_resume, refresh_targets, throttle_rules
4. `## Offline Queue on Resume` — drain_queue_on_resume, drain_policy_ref
5. `## Security/Privacy on Background` — lock_on_background, blur_in_app_switcher, disable_screenshots
6. `## Session Checks` — check_session_on_resume, session_expiry_ref
7. `## Deep Links / Push Interaction` — cold_start_deeplink_rule, resume_deeplink_rule
8. `## Telemetry` — resume_metric, cold_start_metric, crash_metric

## 8. Cross-References

- **Upstream**: MOB-01, SPEC_INDEX
- **Downstream**: MOB-05, MBAT-01
- **Standards**: STD-UNKNOWN-HANDLING, STD-SECURITY

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Lifecycle events + basic persistence | Required | Required | Required |
| Resume refresh + offline drain + bg privacy | Optional | Required | Required |
| Memory pressure + migration rules | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, notes, persistence location/hydration order, refresh targets/throttle rules, drain policy ref, blur/screenshot rules, session expiry ref, deeplink rules, telemetry metrics, memory/migration rules, open_questions
- If lifecycle.events_handled is UNKNOWN → block Completeness Gate.
- If state.persisted_state is UNKNOWN → block Completeness Gate.
- If security.lock_on_background is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] lifecycle_events_defined == true
- [ ] state_persistence_defined == true
- [ ] security_background_rules_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
