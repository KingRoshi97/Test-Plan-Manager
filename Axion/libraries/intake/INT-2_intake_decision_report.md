---
library: intake
id: INT-2-GOV
schema_version: 1.0.0
status: draft
---

# INT-2-GOV — Intake Decision Report

## Purpose

The Intake Decision Report is the governance artifact produced after intake processing. It captures normalization results, validation outcomes, ambiguity resolution decisions, and the final verdict for each submission.

## Report Structure

Each decision report contains:

| Section | Description |
|---|---|
| `report_id` | Unique identifier for this report |
| `submission_id` | Reference to the submission record |
| `form_version` | Version of the form spec used |
| `timestamp` | ISO-8601 timestamp of report generation |
| `normalization_results` | Per-field normalization outcomes |
| `validation_outcomes` | Per-field and cross-field validation results |
| `ambiguity_resolutions` | Decisions made for ambiguous fields |
| `verdict` | Final intake verdict |

## Normalization Results

Per-field normalization entry:

```json
{
  "field_id": "F-RUN_PROFILE",
  "raw_value": "Backend",
  "normalized_value": "api",
  "normalization_rule": "alias_resolve",
  "status": "resolved"
}
```

Status values: `resolved`, `passthrough`, `failed`, `skipped`

## Validation Outcomes

Per-field validation entry:

```json
{
  "field_id": "F-RUN_PROFILE",
  "rule_id": "VAL-REQUIRED",
  "passed": true,
  "message": null
}
```

Cross-field validation entry:

```json
{
  "rule_id": "VAL-CROSS_RISK_PROFILE",
  "fields": ["F-RISK_CLASS", "F-RUN_PROFILE"],
  "passed": true,
  "message": null
}
```

## Ambiguity Resolution

Per-field ambiguity entry:

```json
{
  "field_id": "F-INDUSTRY",
  "ambiguity_class": "AMB-2",
  "raw_value": "fintech",
  "resolution_strategy": "nearest_canonical",
  "resolved_value": "financial_services",
  "confidence": 0.85,
  "requires_operator_review": false
}
```

## Verdict

| Verdict | Code | Description |
|---|---|---|
| Accepted | `VERDICT-ACCEPT` | All validations passed, all ambiguities resolved |
| Accepted with warnings | `VERDICT-ACCEPT-WARN` | Validations passed, some low-confidence resolutions |
| Rejected | `VERDICT-REJECT` | One or more validations failed |
| Pending review | `VERDICT-PENDING` | High-ambiguity fields require operator intervention |

## Governance Rules

1. Every submission MUST produce exactly one decision report.
2. Decision reports are immutable once generated.
3. Verdict MUST be deterministic given the same inputs and form version.
4. Reports with `VERDICT-PENDING` MUST include at least one `AMB-3` ambiguity entry.

## Schema Reference

Validated by: `axion://schemas/intake/intake_decision_report.v1`
