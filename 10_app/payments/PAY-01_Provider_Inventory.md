# PAY-01 — Provider Inventory (by provider_id)

## Header Block

| Field | Value |
|---|---|
| template_id | PAY-01 |
| title | Provider Inventory (by provider_id) |
| type | payments_provider_inventory |
| template_version | 1.0.0 |
| output_path | 10_app/payments/PAY-01_Provider_Inventory.md |
| compliance_gate_id | TMP-05.PRIMARY.PAY |
| upstream_dependencies | ["IXS-01", "PRD-06"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "PRD-06", "API-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Create the single, canonical inventory of payment providers used by the application, indexed by
provider_id, including enabled environments, supported payment modes, and compliance scope
notes. This document must not invent provider_ids not present in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- PRD-06 NFRs/Compliance: {{prd.nfrs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Provider registry (provider_id list)
- provider_id (stable identifier)
- provider name/vendor
- integration_id binding (IXS-01)
- supported modes (one-time/recurring/invoices)
- supported payment methods (card/ACH/etc.)
- environments enabled (dev/stage/prod)
- webhook support (yes/no)
- criticality (low/med/high)
- owner (team/role)
- compliance scope notes (PCI boundary)
- references to detailed specs (PAY-02..10)

## Optional Fields

- Status (planned/active/deprecated) | OPTIONAL
- SLA/uptime notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent provider_ids; use only {{spec.pay_providers_by_id}} if present, else mark
- UNKNOWN and flag.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Inventory Summary
total_providers: {{inv.total}}
modes_present: {{inv.modes_present}} | OPTIONAL
notes: {{inv.notes}} | OPTIONAL
2. Provider Entries (by provider_id)
Provider
provider_id: {{providers[0].provider_id}}
name: {{providers[0].name}}
integration_id: {{providers[0].integration_id}}
modes: {{providers[0].modes}}
payment_methods: {{providers[0].payment_methods}}
env_enabled: {{providers[0].env_enabled}}
webhooks_supported: {{providers[0].webhooks_supported}}
criticality: {{providers[0].criticality}}
owner: {{providers[0].owner}}
pci_scope_notes: {{providers[0].pci_scope_notes}}
spec_refs:
● {{providers[0].spec_refs[0]}} (e.g., {{xref:PAY-02}} / {{xref:PAY-04}})
● {{providers[0].spec_refs[1]}} | OPTIONAL
status: {{providers[0].status}} | OPTIONAL
sla_notes: {{providers[0].sla_notes}} | OPTIONAL
open_questions:
{{providers[0].open_questions[0]}} | OPTIONAL
(Repeat per provider_id.)
3. References
Payment flows: {{xref:PAY-02}} | OPTIONAL
Pricing/plan mapping: {{xref:PAY-03}} | OPTIONAL
Payment webhooks: {{xref:PAY-04}} | OPTIONAL
Taxes/compliance: {{xref:PAY-05}} | OPTIONAL
Refunds/disputes: {{xref:PAY-06}} | OPTIONAL
Ledger/reconciliation: {{xref:PAY-07}} | OPTIONAL

Fraud controls: {{xref:PAY-08}} | OPTIONAL
Security/PCI boundaries: {{xref:PAY-09}} | OPTIONAL
Observability/runbooks: {{xref:PAY-10}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-02}}, {{xref:PAY-04}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Populate provider registry and core fields; do not invent IDs.
intermediate: Required. Add modes/methods and webhook support and spec refs.
advanced: Required. Add PCI boundary notes, ownership/criticality, and traceability.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, secondary spec refs, status,
sla notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If providers[].provider_id is UNKNOWN → block Completeness Gate.
If providers[].integration_id is UNKNOWN → block Completeness Gate.
If providers[].modes is UNKNOWN → block Completeness Gate.
If providers[].pci_scope_notes is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
provider_ids_unique == true
integration_ids_exist_in_IXS_01 == true
pci_scope_noted == true
spec_refs_present == true
placeholder_resolution == true
no_unapproved_unknowns == true
