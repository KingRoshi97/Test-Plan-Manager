# IXS-01 — Integration Inventory (by integration_id)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-01 |
| title | Integration Inventory (by integration_id) |
| type | integration_inventory |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-01_Integration_Inventory.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["SPEC_INDEX", "DOMAIN_MAP"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Create the single, canonical inventory of all external integrations used by the application,
indexed by integration_id. This inventory defines what systems exist, why they exist, what data
moves, and which other integration templates apply. This document must not invent integrations
not present in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Integration registry (integration_id list)
- integration_id (stable identifier)
- name (human-readable)
- vendor/system name
- integration category (SSO/CRMERP/WHCP/PAY/NOTIF/FMS/other)
- direction (inbound/outbound/bidirectional)
- purpose (why it exists)
- data domains touched (domain ids or entity ids)
- auth method summary (api key/oauth/saml/oidc/signed webhook/etc.)
- criticality (low/med/high)
- environments enabled (dev/stage/prod)
- owner (team/role)
- primary risks (PII, financial, availability)
- references to detailed specs (template refs)

## Optional Fields

- Status (planned/active/deprecated) | OPTIONAL
- Cost center / billing owner | OPTIONAL
- Vendor contract/SLA notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new integration_ids; use only {{spec.integrations_by_id}} if present, else mark
- UNKNOWN and flag.
- Each integration MUST have at least one “references to detailed specs” entry (or approved
- UNKNOWN).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Inventory Summary
total_integrations: {{inv.total}}
categories_present: {{inv.categories_present}} | OPTIONAL
notes: {{inv.notes}} | OPTIONAL
2. Integration Entries (by integration_id)
Integration
integration_id: {{items[0].integration_id}}
name: {{items[0].name}}
vendor: {{items[0].vendor}}
category: {{items[0].category}}
direction: {{items[0].direction}}
purpose: {{items[0].purpose}}
data_domains: {{items[0].data_domains}}
auth_method: {{items[0].auth_method}}
criticality: {{items[0].criticality}}
env_enabled: {{items[0].env_enabled}}
owner: {{items[0].owner}}
primary_risks: {{items[0].primary_risks}}
spec_refs:
● {{items[0].spec_refs[0]}} (e.g., {{xref:IXS-02}} / {{xref:SSO-02}} / {{xref:WHCP-02}})
● {{items[0].spec_refs[1]}} | OPTIONAL
status: {{items[0].status}} | OPTIONAL
cost_center: {{items[0].cost_center}} | OPTIONAL
sla_notes: {{items[0].sla_notes}} | OPTIONAL
open_questions:
{{items[0].open_questions[0]}} | OPTIONAL

(Repeat per integration_id.)
3. References
Integration specs: {{xref:IXS-02}} | OPTIONAL
Connectivity policy: {{xref:IXS-03}} | OPTIONAL
Secrets policy: {{xref:IXS-04}} | OPTIONAL
Data mapping: {{xref:IXS-05}} | OPTIONAL
Error handling: {{xref:IXS-06}} | OPTIONAL
Observability: {{xref:IXS-07}} | OPTIONAL
Security/compliance: {{xref:IXS-08}} | OPTIONAL
Sandbox/testing: {{xref:IXS-09}} | OPTIONAL
Change management: {{xref:IXS-10}} | OPTIONAL

## Cross-References

Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:DOMAIN_MAP}} | OPTIONAL
Downstream: {{xref:SSO-01}}, {{xref:CRMERP-01}}, {{xref:WHCP-01}}, {{xref:PAY-01}},
{{xref:NOTIF-01}}, {{xref:FMS-01}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Populate registry and core fields; use UNKNOWN where inputs are
missing; do not invent.
intermediate: Required. Add correct category/direction/auth summaries and spec_refs.
advanced: Required. Add risk notes, ownership clarity, and traceability pointers to domain/entity
IDs.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, status, cost_center,
sla_notes, secondary spec refs, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If items[].integration_id is UNKNOWN → block Completeness Gate.
If items[].spec_refs is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
integration_ids_unique == true
no new integration_ids introduced
each integration has spec_refs (or approved UNKNOWN)
placeholder_resolution == true
no_unapproved_unknowns == true
