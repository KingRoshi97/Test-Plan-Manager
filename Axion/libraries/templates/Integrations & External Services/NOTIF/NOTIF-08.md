# NOTIF-08 — Event-to-Notification Mapping (events → messages)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-08                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event-to-notification mapping (events → messages)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event-to-Notification Mapping (events → messages) Document                         |

## 2. Purpose

Define the canonical mapping from internal events (event_id) to notification messages
(template_id/channel), including eligibility rules, preference enforcement, deduping, and
scheduling behavior. This template must be consistent with the event catalog and notification
template registry and must not invent event IDs or template IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- EVT-02 Event Schemas: {{evt.schemas}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-03 Template & Localization Mapping: {{notif.templates}}
- FFCFG-01 Feature Flags: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Mapping registry (map_id list)
map_id (stable identifier)
event_id binding (must exist)
notification type binding (notif_id/name)
channel(s) used
template_id(s) used
eligibility rules (who receives)
preference enforcement rule (NOTIF-06)
dedupe rule (avoid duplicates per event)
timing rule (immediate/delayed/batched)
failure handling ref (NOTIF-09)
telemetry requirements (enqueued/sent per mapping)

Optional Fields
Feature flag gating | OPTIONAL
Localization override rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
event_id MUST exist in {{xref:EVT-01}}; template_id MUST exist in {{xref:NOTIF-03}}.
Preference enforcement MUST occur before send.
Dedupe must be deterministic and keyed by event_id + subject.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Mapping Summary
total_mappings: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Mapping Entries (by map_id)
Mapping
map_id: {{maps[0].map_id}}
event_id: {{maps[0].event_id}}
notif_binding: {{maps[0].notif_binding}}
channels: {{maps[0].channels}}
template_ids: {{maps[0].template_ids}}
eligibility_rule: {{maps[0].eligibility_rule}}
preference_rule_ref: {{maps[0].preference_rule_ref}} (expected: {{xref:NOTIF-06}}) |
OPTIONAL
dedupe_rule: {{maps[0].dedupe_rule}}
timing_rule: {{maps[0].timing_rule}} (immediate/delayed/batched/UNKNOWN)
failure_ref: {{maps[0].failure_ref}} (expected: {{xref:NOTIF-09}}) | OPTIONAL
flag_gate: {{maps[0].flag_gate}} | OPTIONAL
locale_override: {{maps[0].locale_override}} | OPTIONAL
open_questions:
{{maps[0].open_questions[0]}} | OPTIONAL
(Repeat per mapping.)
3. Telemetry
enqueued_metric: {{telemetry.enqueued_metric}}
sent_metric: {{telemetry.sent_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
4. References
Event catalog: {{xref:EVT-01}}
Template mapping: {{xref:NOTIF-03}}
Send policy: {{xref:NOTIF-04}} | OPTIONAL

Preference center: {{xref:NOTIF-06}} | OPTIONAL
Failure handling: {{xref:NOTIF-09}} | OPTIONAL
Cross-References
Upstream: {{xref:EVT-01}}, {{xref:NOTIF-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-09}}, {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define event_id → template/channel mappings and dedupe rule.
intermediate: Required. Add eligibility and preference enforcement and timing rules.
advanced: Required. Add feature flag gates, localization overrides, and telemetry field rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, preference ref, failure ref,
flag gate, locale override, sent metric/fields, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If maps[].event_id is UNKNOWN → block Completeness Gate.
If maps[].template_ids is UNKNOWN → block Completeness Gate.
If maps[*].dedupe_rule is UNKNOWN → block Completeness Gate.
If telemetry.enqueued_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
event_ids_valid == true
template_ids_valid == true
dedupe_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

NOTIF-09

NOTIF-09 — Failure Handling (retries, fallback channels, DLQ)
Header Block

## 5. Optional Fields

Feature flag gating | OPTIONAL
Localization override rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **event_id MUST exist in {{xref:EVT-01}}; template_id MUST exist in {{xref:NOTIF-03}}.**
- **Preference enforcement MUST occur before send.**
- **Dedupe must be deterministic and keyed by event_id + subject.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Mapping Summary`
2. `## Mapping Entries (by map_id)`
3. `## Mapping`
4. `## OPTIONAL`
5. `## open_questions:`
6. `## (Repeat per mapping.)`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}}, {{xref:NOTIF-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:NOTIF-09}}, {{xref:NOTIF-10}} | OPTIONAL**
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
