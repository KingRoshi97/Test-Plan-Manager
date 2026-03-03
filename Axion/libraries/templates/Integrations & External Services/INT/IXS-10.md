# IXS-10 — Integration Lifecycle Management

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-10                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring integration lifecycle man |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, IXS-02, IXS-05                           |
| Produces          | Filled Integration Lifecycle Management          |

## 2. Purpose

Define the canonical change management policy for integrations: how external API/schema versions are tracked, how breaking changes are detected, how deprecations are handled, and how compatibility is maintained across environments. This template must be consistent with schema/versioning rules for events/webhooks and must not invent versioning strategies not supported by upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}`
- IXS-02 Integration Specs: `{{ixs.integration_specs}}`
- IXS-05 Data Mapping Rules: `{{ixs.data_mapping}}` | OPTIONAL
- EVT-02 Event Schema Spec (versioning): `{{evt.schema_spec}}` | OPTIONAL
- WHCP-09 Payload Versioning (webhooks): `{{whcp.webhook_versioning}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Version surfaces list | API version, webhook payload version, file schema version |
| Per-integration current version tracking | integration_id → versions |
| Compatibility policy | Backwards compatible window |
| Breaking change definition | What counts |
| Deprecation policy | Notice period, removal steps |
| Migration strategy | Dual-write/dual-read, adapters |
| Change detection strategy | Tests, monitoring, vendor notices |
| Rollout strategy for changes | Staged, flags |
| Rollback strategy | Version pin, revert |
| Audit/communication requirements | Who is notified |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Contract testing requirement | OPTIONAL |
| Vendor roadmap tracking | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Version surfaces MUST be explicit and referenced by integration_id.
- Breaking changes MUST have a migration and rollback plan before rollout.
- Deprecations MUST be tracked; "surprise removals" are not allowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}`, `{{xref:IXS-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:RELEASE-GATE}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Track current versions and define deprecation notice period; use UNKNOWN for contract tests if missing.
- **intermediate**: Required. Define compatibility window, breaking change definition, and migration/rollback models.
- **advanced**: Required. Add staged rollout steps, monitoring signals, and audit/communications rigor.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, examples, optional version fields, notes, compat rules, breaking examples, sunset steps, preferred model, mapping ref, contract tests, monitoring signals, rollout/rollback steps, where logged, vendor roadmap, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `surfaces.list` is UNKNOWN → block Completeness Gate.
- If `deprec.notice_period_days` is UNKNOWN → block Completeness Gate.
- If `breaking.rules` is UNKNOWN → block Completeness Gate.
- If `rollout.model` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] version_surfaces_defined == true
- [ ] per_integration_versions_defined == true
- [ ] breaking_and_deprecation_defined == true
- [ ] migration_and_rollback_defined == true
- [ ] communication_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

