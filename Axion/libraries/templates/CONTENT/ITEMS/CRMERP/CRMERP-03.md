# CRMERP-03 — Sync Direction Rules (push/pull/bidirectional)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-03                                             |
| Template Type     | Integration / CRM & ERP                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring sync direction rules (push/pull/bidirectional)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Sync Direction Rules (push/pull/bidirectional) Document                         |

## 2. Purpose

Define the canonical rules that govern sync direction (push, pull, bidirectional) for CRM/ERP
integrations, including source-of-truth designation per object/field, write permissions, conflict
triggers, and safe handling for bidirectional sync. This template must be consistent with
object/entity mapping and conflict/reconciliation policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-02 Object/Entity Mapping: {{crmerp.mapping}}
- IXS-06 Error Handling & Recovery: {{ixs.error_recovery}} | OPTIONAL
- OFS-02 Sync Model (queues/conflicts): {{ofs.sync_model}} | OPTIONAL
- EVT-03 Producer/Consumer Map: {{evt.producer_consumer}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

system_id binding
Supported sync modes (push/pull/bidirectional)
Per-object sync mode assignment (external_object → mode)
Source of truth rules (system vs app)
Per-field write authority rules (field-level exceptions)
Outbound write constraints (what is allowed to be pushed)
Inbound pull constraints (filters/criteria)
Conflict trigger definitions (what counts as conflict)
Idempotency constraints for writes
Audit/telemetry requirements (sync decisions)

Optional Fields
User-initiated sync rules | OPTIONAL
Rate-limit aware behavior | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Bidirectional sync MUST have explicit source-of-truth rules; no “both own it” ambiguity.
Field-level exceptions must be documented and minimal.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Supported Modes
system_id: {{meta.system_id}}
modes_supported: {{modes.supported}} (push/pull/bidirectional/UNKNOWN)
2. Per-Object Mode Assignment
Assignment
external_object: {{objects[0].external_object}}
mode: {{objects[0].mode}}
source_of_truth: {{objects[0].source_of_truth}} (external/internal/UNKNOWN)
notes: {{objects[0].notes}} | OPTIONAL
(Repeat per object.)
3. Field-Level Write Authority (Optional but recommended)
Rule
external_object: {{fields[0].external_object}}
field: {{fields[0].field}}
write_authority: {{fields[0].write_authority}} (external/internal/UNKNOWN)
notes: {{fields[0].notes}} | OPTIONAL
(Repeat per rule.)
4. Outbound Write Constraints
allowed_writes: {{outbound.allowed_writes}}
blocked_writes: {{outbound.blocked_writes}} | OPTIONAL
5. Inbound Pull Constraints
pull_filters: {{inbound.pull_filters}}
incremental_sync_rule: {{inbound.incremental_sync_rule}} | OPTIONAL
6. Conflict Triggers
conflict_triggers: {{conflicts.triggers}}
version_field_rule: {{conflicts.version_field_rule}} | OPTIONAL

7. Idempotency
idempotency_required: {{idem.required}}
idempotency_key_rule: {{idem.key_rule}} | OPTIONAL
8. Audit / Telemetry
sync_decision_metric: {{telemetry.sync_decision_metric}}
conflict_metric_ref: {{telemetry.conflict_metric_ref}} (expected:
{{xref:CRMERP-05}}/{{xref:OFS-02}}) | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
9. References
System inventory: {{xref:CRMERP-01}}
Object/entity mapping: {{xref:CRMERP-02}}
Conflict resolution: {{xref:CRMERP-05}} | OPTIONAL
Error handling: {{xref:IXS-06}} | OPTIONAL
Offline sync model: {{xref:OFS-02}} | OPTIONAL
Cross-References
Upstream: {{xref:CRMERP-01}}, {{xref:CRMERP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CRMERP-04}}, {{xref:CRMERP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define per-object mode and source-of-truth; use UNKNOWN for field-level
overrides.
intermediate: Required. Define outbound/inbound constraints and conflict triggers.
advanced: Required. Add field-level authority map, idempotency key rules, and telemetry field
rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, object notes, field rules, blocked writes,
incremental sync, version field rule, idempotency key, conflict metric ref, telemetry fields,
user-initiated/rate-limit behavior, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If meta.system_id is UNKNOWN → block Completeness Gate.
If modes.supported is UNKNOWN → block Completeness Gate.
If objects[*].source_of_truth is UNKNOWN → block Completeness Gate (for bidirectional).
If telemetry.sync_decision_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
system_id_exists_in_CRMERP_01 == true
per_object_modes_defined == true
source_of_truth_defined == true

conflict_triggers_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

CRMERP-04

CRMERP-04 — Sync Scheduling & Triggers (cron/event-driven, env enablement)
Header Block

## 5. Optional Fields

User-initiated sync rules | OPTIONAL
Rate-limit aware behavior | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Bidirectional sync MUST have explicit source-of-truth rules; no “both own it” ambiguity.**
- **Field-level exceptions must be documented and minimal.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Supported Modes`
2. `## Per-Object Mode Assignment`
3. `## Assignment`
4. `## (Repeat per object.)`
5. `## Field-Level Write Authority (Optional but recommended)`
6. `## Rule`
7. `## (Repeat per rule.)`
8. `## Outbound Write Constraints`
9. `## Inbound Pull Constraints`
10. `## Conflict Triggers`

## 8. Cross-References

- **Upstream: {{xref:CRMERP-01}}, {{xref:CRMERP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:CRMERP-04}}, {{xref:CRMERP-05}} | OPTIONAL**
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
