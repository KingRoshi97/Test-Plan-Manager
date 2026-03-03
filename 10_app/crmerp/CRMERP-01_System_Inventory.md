# CRMERP-01 — System Inventory (by system_id)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-01 |
| title | System Inventory (by system_id) |
| type | crmerp_system_inventory |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-01_System_Inventory.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["IXS-01", "IXS-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "IXS-02", "API-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Create the single, canonical inventory of all CRM/ERP systems integrated with the application,
indexed by system_id, including which objects/entities are synced, directionality, environments,
and ownership. This document must not invent system_ids not present in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- IXS-02 Integration Specs: {{ixs.integration_specs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- System registry (system_id list)
- system_id (stable identifier)
- system name/vendor (e.g., Salesforce, NetSuite)
- system type (CRM/ERP/UNKNOWN)
- integration_id binding (from IXS-01)
- sync direction (push/pull/bidirectional)
- objects/entities covered (external object names + internal entity_id/schema_ref)
- primary keys (external id fields)
- environments enabled (dev/stage/prod)
- criticality (low/med/high)
- owner (team/role)
- data classes involved (PII/financial/etc.)
- references to detailed specs (CRMERP-02..10)

## Optional Fields

- Status (planned/active/deprecated) | OPTIONAL
- SLA/uptime notes | OPTIONAL
- Cost/billing owner | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new system_ids; use only {{spec.crmerp_systems_by_id}} if present, else
- mark UNKNOWN and flag.
- system_id MUST bind to an integration_id in {{xref:IXS-01}} (or be flagged UNKNOWN with
- reason).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Inventory Summary
total_systems: {{inv.total}}
types_present: {{inv.types_present}} | OPTIONAL
notes: {{inv.notes}} | OPTIONAL
2. System Entries (by system_id)
System
system_id: {{systems[0].system_id}}
name: {{systems[0].name}}
vendor: {{systems[0].vendor}} | OPTIONAL
type: {{systems[0].type}}
integration_id: {{systems[0].integration_id}}
sync_direction: {{systems[0].sync_direction}}
objects_covered: {{systems[0].objects_covered}}
primary_key_fields: {{systems[0].primary_key_fields}}
env_enabled: {{systems[0].env_enabled}}
criticality: {{systems[0].criticality}}
owner: {{systems[0].owner}}
data_classes: {{systems[0].data_classes}}
spec_refs:
● {{systems[0].spec_refs[0]}} (e.g., {{xref:CRMERP-02}} / {{xref:CRMERP-03}})
● {{systems[0].spec_refs[1]}} | OPTIONAL
status: {{systems[0].status}} | OPTIONAL
sla_notes: {{systems[0].sla_notes}} | OPTIONAL
cost_owner: {{systems[0].cost_owner}} | OPTIONAL
open_questions:
{{systems[0].open_questions[0]}} | OPTIONAL
(Repeat per system_id.)

3. References
Entity/object mapping: {{xref:CRMERP-02}} | OPTIONAL
Sync direction rules: {{xref:CRMERP-03}} | OPTIONAL
Scheduling/triggers: {{xref:CRMERP-04}} | OPTIONAL
Conflict resolution: {{xref:CRMERP-05}} | OPTIONAL
Quotas/rate limits: {{xref:CRMERP-06}} | OPTIONAL
Data quality: {{xref:CRMERP-07}} | OPTIONAL
Reconciliation/backfills: {{xref:CRMERP-08}} | OPTIONAL
Security/compliance: {{xref:CRMERP-09}} | OPTIONAL
Observability/runbooks: {{xref:CRMERP-10}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:IXS-02}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:CRMERP-02}}, {{xref:CRMERP-03}}, {{xref:CRMERP-04}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Populate system registry and core fields; do not invent IDs.
intermediate: Required. Add object/entity coverage and primary key fields and spec_refs.
advanced: Required. Add criticality/ownership and data class flags with traceability.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, vendor, inv notes, status, sla_notes,
cost_owner, secondary spec refs, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If systems[].system_id is UNKNOWN → block Completeness Gate.
If systems[].integration_id is UNKNOWN → block Completeness Gate.
If systems[].sync_direction is UNKNOWN → block Completeness Gate.
If systems[].spec_refs is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
system_ids_unique == true
integration_ids_exist_in_IXS_01 == true
objects_covered_defined == true
spec_refs_present == true
placeholder_resolution == true
no_unapproved_unknowns == true
