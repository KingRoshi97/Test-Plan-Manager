# PAY-07 — Ledger & Reconciliation Rules (source of truth, audits)

## Header Block

| Field | Value |
|---|---|
| template_id | PAY-07 |
| title | Ledger & Reconciliation Rules (source of truth, audits) |
| type | payments_ledger_reconciliation_rules |
| template_version | 1.0.0 |
| output_path | 10_app/payments/PAY-07_Ledger_Reconciliation_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.PAY |
| upstream_dependencies | ["PAY-02", "PAY-04", "DATA-06", "ADMIN-03"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "PAY-01", "PAY-02", "PAY-04", "DATA-06", "DQV-03", "ADMIN-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical internal ledger model and reconciliation rules for payments: what the
source of truth is for financial state, how provider events map to ledger entries, how
reconciliation is performed, what counts as mismatch, and what audits/controls exist. This
template must be consistent with payment flows and webhook handling and must not invent
financial fields beyond upstream schemas.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- PAY-04 Webhook Handling: {{pay.webhooks}} | OPTIONAL
- DATA-06 Canonical Data Schemas (ledger): {{data.schemas}} | OPTIONAL
- DQV-03 Data Validation Rules: {{dqv.rules}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Ledger source of truth statement (provider vs internal)
- Ledger entities/records (entry types)
- Event → ledger mapping rules (provider events)
- Idempotency rules for ledger writes
- Reconciliation cadence (daily/hourly/UNKNOWN)
- Reconciliation inputs (provider reports, API fetches)
- Mismatch detection rules (amount, currency, status)
- Mismatch handling (hold, alert, manual review)
- Audit controls (append-only, approvals)
- Retention policy for ledger records
- Telemetry requirements (mismatch rate, reconciliation success)

## Optional Fields

- Multi-currency handling | OPTIONAL
- Accounting export rules | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Ledger writes MUST be idempotent and append-only where possible.
- Reconciliation must be repeatable and produce artifacts (reports).
- Mismatches must not silently self-resolve; must be surfaced.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Source of Truth
source_of_truth: {{sot.source_of_truth}} (provider/internal/UNKNOWN)
rationale: {{sot.rationale}} | OPTIONAL
2. Ledger Model
entry_types: {{ledger.entry_types}}
schema_ref: {{ledger.schema_ref}} (expected: {{xref:DATA-06}}) | OPTIONAL
3. Event → Ledger Mapping
Mapping
provider_event_type: {{map[0].provider_event_type}}
ledger_entry_type: {{map[0].ledger_entry_type}}
idempotency_key: {{map[0].idempotency_key}}
notes: {{map[0].notes}} | OPTIONAL
(Repeat per mapping.)
4. Idempotency
idempotency_required: {{idem.required}}
key_rule: {{idem.key_rule}}
5. Reconciliation Cadence
cadence: {{recon.cadence}}
inputs: {{recon.inputs}}
report_artifact_rule: {{recon.report_artifact_rule}} | OPTIONAL
6. Mismatch Detection
checks: {{mismatch.checks}}
tolerance_rules: {{mismatch.tolerance_rules}} | OPTIONAL
7. Mismatch Handling
on_mismatch_behavior: {{mismatch.on_mismatch_behavior}}
manual_review_required: {{mismatch.manual_review_required}} | OPTIONAL

8. Audit Controls
append_only_rule: {{audit.append_only_rule}}
approval_required_for_adjustments: {{audit.approval_required_for_adjustments}} |
OPTIONAL
audit_ref: {{audit.audit_ref}} (expected: {{xref:ADMIN-03}}) | OPTIONAL
9. Retention
retention_policy: {{retention.policy}}
10.Telemetry
recon_success_metric: {{telemetry.recon_success_metric}}
mismatch_rate_metric: {{telemetry.mismatch_rate_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
11.References
Payment flows: {{xref:PAY-02}} | OPTIONAL
Webhook handling: {{xref:PAY-04}} | OPTIONAL
Refunds/disputes: {{xref:PAY-06}} | OPTIONAL
Audit trail: {{xref:ADMIN-03}} | OPTIONAL

## Cross-References

Upstream: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define source of truth, entry types, and cadence and mismatch behavior.
intermediate: Required. Define event mapping, idempotency, and audit controls.
advanced: Required. Add exports/multi-currency and strict artifact/report definitions.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, rationale, schema ref, notes, report
artifact rule, tolerance rules, manual review, approvals, audit ref, mismatch rate metric/fields,
currency/export rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If sot.source_of_truth is UNKNOWN → block Completeness Gate.
If ledger.entry_types is UNKNOWN → block Completeness Gate.
If idem.key_rule is UNKNOWN → block Completeness Gate.
If recon.cadence is UNKNOWN → block Completeness Gate.
If telemetry.recon_success_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
source_of_truth_defined == true
ledger_model_defined == true

idempotency_defined == true
reconciliation_defined == true
audit_controls_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
