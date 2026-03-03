# CRMERP-03 — Sync Direction Rules (push/pull/bidirectional)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-03 |
| title | Sync Direction Rules (push/pull/bidirectional) |
| type | crmerp_sync_direction_rules |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-03_Sync_Direction_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["CRMERP-01", "CRMERP-02", "OFS-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "CRMERP-01", "CRMERP-02", "IXS-06", "OFS-02", "EVT-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical rules that govern sync direction (push, pull, bidirectional) for CRM/ERP
integrations, including source-of-truth designation per object/field, write permissions, conflict
triggers, and safe handling for bidirectional sync. This template must be consistent with
object/entity mapping and conflict/reconciliation policies.

## Inputs Required

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

## Required Fields

- system_id binding
- Supported sync modes (push/pull/bidirectional)
- Per-object sync mode assignment (external_object → mode)
- Source of truth rules (system vs app)
- Per-field write authority rules (field-level exceptions)
- Outbound write constraints (what is allowed to be pushed)
- Inbound pull constraints (filters/criteria)
- Conflict trigger definitions (what counts as conflict)
- Idempotency constraints for writes
- Audit/telemetry requirements (sync decisions)

## Optional Fields

- User-initiated sync rules | OPTIONAL
- Rate-limit aware behavior | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Bidirectional sync MUST have explicit source-of-truth rules; no “both own it” ambiguity.
- Field-level exceptions must be documented and minimal.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

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

## Cross-References

Upstream: {{xref:CRMERP-01}}, {{xref:CRMERP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CRMERP-04}}, {{xref:CRMERP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define per-object mode and source-of-truth; use UNKNOWN for field-level
overrides.
intermediate: Required. Define outbound/inbound constraints and conflict triggers.
advanced: Required. Add field-level authority map, idempotency key rules, and telemetry field
rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, object notes, field rules, blocked writes,
incremental sync, version field rule, idempotency key, conflict metric ref, telemetry fields,
user-initiated/rate-limit behavior, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If meta.system_id is UNKNOWN → block Completeness Gate.
If modes.supported is UNKNOWN → block Completeness Gate.
If objects[*].source_of_truth is UNKNOWN → block Completeness Gate (for bidirectional).
If telemetry.sync_decision_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

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
