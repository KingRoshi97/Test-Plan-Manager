# FFCFG-05 — Safe Degradation Rules (flag off behavior)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-05                                             |
| Template Type     | Build / Feature Flags                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring safe degradation rules (flag off behavior)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Safe Degradation Rules (flag off behavior) Document                         |

## 2. Purpose

Define the canonical safe degradation requirements when a feature flag is OFF (or
kill-switched), including UI/API fallbacks, data write behavior, compatibility guarantees, and user
experience rules. This template must be consistent with flag behavior specs and must not invent
flag_ids or fallback behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}}
- FFCFG-02 Flag Behavior Specs: {{ffcfg.behavior_specs}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Degradation policy sta... | spec         | Yes             |
| Per-flag degradation e... | spec         | Yes             |
| When-off behavior (wha... | spec         | Yes             |
| Fallback path (UI rout... | spec         | Yes             |
| API behavior when off ... | spec         | Yes             |
| Backward compatibility... | spec         | Yes             |
| User messaging policy ... | spec         | Yes             |
| Security implications ... | spec         | Yes             |
| Observability hooks (m... | spec         | Yes             |

## 5. Optional Fields

Per-environment degradation differences | OPTIONAL
Manual override behaviors | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new flag_ids; use only those in {{xref:FFCFG-01}}.
Safe degradation MUST prevent data corruption and avoid breaking core flows.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Security rule: if feature is off, protected operations MUST remain denied (no “hidden but
callable” endpoints).
Do not restate full targeting/rollout details; those belong in FFCFG-02/03.
Output Format
1. Global Safe Degradation Policy
principles:
{{policy.principles[0]}}
{{policy.principles[1]}}
{{policy.principles[2]}}
default_api_off_behavior: {{policy.default_api_off_behavior}}
default_ui_off_behavior: {{policy.default_ui_off_behavior}}
default_data_off_behavior: {{policy.default_data_off_behavior}}
2. Per-Flag Degradation Entries
Entry
flag_id: {{entries[0].flag_id}}
disabled_features: {{entries[0].disabled_features}}
ui_fallback: {{entries[0].ui_fallback}}
api_off_behavior: {{entries[0].api_off_behavior}}
data_write_behavior: {{entries[0].data_write_behavior}}
compatibility_notes: {{entries[0].compatibility_notes}} | OPTIONAL
user_message_policy: {{entries[0].user_message_policy}} | OPTIONAL
security_notes: {{entries[0].security_notes}} | OPTIONAL
observability:
metric_off_path_hits: {{entries[0].observability.metric_off_path_hits}}
logs_required_fields: {{entries[0].observability.logs_required_fields}} | OPTIONAL
open_questions:
{{entries[0].open_questions[0]}} | OPTIONAL
(Repeat the “Entry” block for each flag_id.)
3. Compatibility Rules
client_server_matrix: {{compat.matrix}} | OPTIONAL
old_client_behavior: {{compat.old_client_behavior}}
new_server_behavior: {{compat.new_server_behavior}}
version_gating_policy: {{compat.version_gating_policy}} | OPTIONAL
4. Observability Requirements (Global)
metrics:

off_path_hits_total: {{obs.metrics.off_path_hits_total}}
off_path_hits_by_flag: {{obs.metrics.off_path_hits_by_flag}} | OPTIONAL
error_rate_when_off: {{obs.metrics.error_rate_when_off}} | OPTIONAL
dashboards: {{obs.dashboards}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
5. References
Flag registry: {{xref:FFCFG-01}}
Behavior spec: {{xref:FFCFG-02}}
Rollout plan: {{xref:FFCFG-03}} | OPTIONAL
Config matrix: {{xref:FFCFG-04}} | OPTIONAL
Cross-References
Upstream: {{xref:FFCFG-01}}, {{xref:FFCFG-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FFCFG-06}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where fallback behavior is not defined; do not invent
per-flag entries.
intermediate: Required. Define UI/API/data behaviors and ensure security-deny when off.
advanced: Required. Add compatibility matrix and robust observability requirements.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, compatibility_notes,
user_message_policy, security_notes, logs_required_fields, compat.matrix,
version_gating_policy, dashboards, alerts, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If entries list is UNKNOWN → block Completeness Gate.
If api_off_behavior is UNKNOWN for any entry → flag in Open Questions.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FFCFG
Pass conditions:
required_fields_present == true
all flag_ids exist in FFCFG-01 (no new IDs introduced)
off_behavior_defined_per_flag == true
placeholder_resolution == true
no_unapproved_unknowns == true

FFCFG-06

FFCFG-06 — Audit & Change Control (who can flip, logging)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids; use only those in {{xref:FFCFG-01}}.
- **Safe degradation MUST prevent data corruption and avoid breaking core flows.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Security rule: if feature is off, protected operations MUST remain denied (no “hidden but**
- **callable” endpoints).**
- Do not restate full targeting/rollout details; those belong in FFCFG-02/03.

## 7. Output Format

### Required Headings (in order)

1. `## Global Safe Degradation Policy`
2. `## principles:`
3. `## Per-Flag Degradation Entries`
4. `## Entry`
5. `## observability:`
6. `## open_questions:`
7. `## (Repeat the “Entry” block for each flag_id.)`
8. `## Compatibility Rules`
9. `## Observability Requirements (Global)`
10. `## metrics:`

## 8. Cross-References

- **Upstream: {{xref:FFCFG-01}}, {{xref:FFCFG-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FFCFG-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
