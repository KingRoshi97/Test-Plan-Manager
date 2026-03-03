# IXS-10 — Versioning & Change Management (breaking changes, deprecation)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-10 |
| title | Versioning & Change Management (breaking changes, deprecation) |
| type | integration_versioning_change_management |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-10_Versioning_Change_Management.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["IXS-01", "IXS-02", "IXS-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "IXS-02", "IXS-05", "EVT-02", "WHCP-09"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical change management policy for integrations: how external API/schema
versions are tracked, how breaking changes are detected, how deprecations are handled, and
how compatibility is maintained across environments. This template must be consistent with
schema/versioning rules for events/webhooks and must not invent versioning strategies not
supported by upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}}
- IXS-05 Data Mapping Rules: {{ixs.data_mapping}} | OPTIONAL
- EVT-02 Event Schema Spec (versioning): {{evt.schema_spec}} | OPTIONAL
- WHCP-09 Payload Versioning (webhooks): {{whcp.webhook_versioning}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Version surfaces list (API version, webhook payload version, file schema version)
- Per-integration current version tracking (integration_id → versions)
- Compatibility policy (backwards compatible window)
- Breaking change definition (what counts)
- Deprecation policy (notice period, removal steps)
- Migration strategy (dual-write/dual-read, adapters)
- Change detection strategy (tests, monitoring, vendor notices)
- Rollout strategy for changes (staged, flags)
- Rollback strategy (version pin, revert)
- Audit/communication requirements (who is notified)

## Optional Fields

- Contract testing requirement | OPTIONAL
- Vendor roadmap tracking | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Version surfaces MUST be explicit and referenced by integration_id.
- Breaking changes MUST have a migration and rollback plan before rollout.
- Deprecations MUST be tracked; “surprise removals” are not allowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Version Surfaces
surfaces: {{surfaces.list}}
examples: {{surfaces.examples}} | OPTIONAL
2. Per-Integration Version Tracking
Version Entry
integration_id: {{versions[0].integration_id}}
api_version: {{versions[0].api_version}} | OPTIONAL
webhook_payload_version: {{versions[0].webhook_payload_version}} | OPTIONAL
file_schema_version: {{versions[0].file_schema_version}} | OPTIONAL
notes: {{versions[0].notes}} | OPTIONAL
(Repeat per integration_id.)
3. Compatibility Policy
compat_window: {{compat.window}}
compat_rules: {{compat.rules}} | OPTIONAL
4. Breaking Change Definition
breaking_change_rules: {{breaking.rules}}
examples: {{breaking.examples}} | OPTIONAL
5. Deprecation Policy
notice_period_days: {{deprec.notice_period_days}}
deprec_process: {{deprec.process}}
sunset_steps: {{deprec.sunset_steps}} | OPTIONAL
6. Migration Strategy
migration_models: {{migrate.models}} (dual_read/dual_write/adapter/UNKNOWN)
preferred_model: {{migrate.preferred_model}} | OPTIONAL
data_mapping_ref: {{migrate.data_mapping_ref}} (expected: {{xref:IXS-05}}) |
OPTIONAL
7. Change Detection
vendor_notice_rule: {{detect.vendor_notice_rule}}

contract_tests_required: {{detect.contract_tests_required}} | OPTIONAL
monitoring_signals: {{detect.monitoring_signals}} | OPTIONAL
8. Rollout & Rollback
rollout_model: {{rollout.model}} (staged/flags/UNKNOWN)
rollout_steps: {{rollout.steps}} | OPTIONAL
rollback_model: {{rollback.model}} (version_pin/revert/UNKNOWN)
rollback_steps: {{rollback.steps}} | OPTIONAL
9. Communication / Audit
notify_who: {{comms.notify_who}}
audit_required: {{comms.audit_required}}
where_logged: {{comms.where_logged}} | OPTIONAL
10.References
Integration inventory: {{xref:IXS-01}}
Integration specs: {{xref:IXS-02}}
Data mapping: {{xref:IXS-05}} | OPTIONAL
Event schema versioning: {{xref:EVT-02}} | OPTIONAL
Webhook payload versioning: {{xref:WHCP-09}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}}, {{xref:IXS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:RELEASE-GATE}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Track current versions and define deprecation notice period; use
UNKNOWN for contract tests if missing.
intermediate: Required. Define compatibility window, breaking change definition, and
migration/rollback models.
advanced: Required. Add staged rollout steps, monitoring signals, and audit/communications
rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, examples, optional version fields, notes,
compat rules, breaking examples, sunset steps, preferred model, mapping ref, contract tests,
monitoring signals, rollout/rollback steps, where logged, vendor roadmap, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If surfaces.list is UNKNOWN → block Completeness Gate.
If deprec.notice_period_days is UNKNOWN → block Completeness Gate.
If breaking.rules is UNKNOWN → block Completeness Gate.
If rollout.model is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:

required_fields_present == true
version_surfaces_defined == true
per_integration_versions_defined == true
breaking_and_deprecation_defined == true
migration_and_rollback_defined == true
communication_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
