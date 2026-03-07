---
library: intake
id: INT-5-GOV
schema_version: 1.0.0
status: draft
---

# INT-5-GOV — Intake Health

## Purpose

Defines the health metrics, scoring criteria, and validation checklist for the intake subsystem. Provides observability into field coverage, normalization success, validation pass rates, and ambiguity rates.

## Health Metrics

### Field Coverage

| Metric | Description | Target |
|---|---|---|
| `field_coverage_rate` | Percentage of form fields with non-null submissions | >= 80% |
| `required_field_fill_rate` | Percentage of required fields filled across submissions | 100% |
| `optional_field_fill_rate` | Percentage of optional fields filled across submissions | >= 50% |
| `unmapped_field_count` | Number of fields without canonical mappings | 0 |

### Normalization Success Rate

| Metric | Description | Target |
|---|---|---|
| `normalization_success_rate` | Percentage of fields successfully normalized | >= 95% |
| `alias_resolution_rate` | Percentage of alias inputs resolved to canonical values | >= 99% |
| `normalization_failure_rate` | Percentage of fields that failed normalization | <= 5% |
| `passthrough_rate` | Percentage of fields that required no normalization | Informational |

### Validation Pass Rate

| Metric | Description | Target |
|---|---|---|
| `field_validation_pass_rate` | Percentage of field-level validations that passed | >= 90% |
| `cross_field_validation_pass_rate` | Percentage of cross-field validations that passed | >= 85% |
| `submission_acceptance_rate` | Percentage of submissions with VERDICT-ACCEPT | >= 80% |
| `rejection_rate` | Percentage of submissions with VERDICT-REJECT | <= 10% |

### Ambiguity Rate

| Metric | Description | Target |
|---|---|---|
| `ambiguity_rate` | Percentage of fields classified AMB-2 or higher | <= 10% |
| `auto_resolution_rate` | Percentage of ambiguous fields resolved automatically | >= 90% |
| `operator_escalation_rate` | Percentage of submissions requiring operator review | <= 5% |
| `high_ambiguity_field_count` | Number of fields classified AMB-3 | 0 |

## Validation Checklist

- [ ] All form spec fields have corresponding intake unit entries
- [ ] All intake units have canonical mapping defined
- [ ] All intake units have ambiguity class assigned
- [ ] All enum fields reference valid enum registry entries
- [ ] All required fields have validation rules
- [ ] All cross-field constraints are documented
- [ ] Normalization rules cover all field types
- [ ] Alias resolution is deterministic for all enum values
- [ ] Decision report schema validates against sample data
- [ ] Migration records exist for all breaking changes
- [ ] Deprecated fields are marked and documented
- [ ] Health metric targets are met or exceptions documented

## Health Report Format

```json
{
  "report_id": "HEALTH-INTAKE-001",
  "timestamp": "2025-01-01T00:00:00Z",
  "form_version": "1.0.0",
  "metrics": {
    "field_coverage_rate": 0.85,
    "normalization_success_rate": 0.97,
    "field_validation_pass_rate": 0.92,
    "ambiguity_rate": 0.08,
    "submission_acceptance_rate": 0.88
  },
  "checklist_pass_count": 10,
  "checklist_total": 12,
  "status": "healthy"
}
```

## Status Thresholds

| Status | Criteria |
|---|---|
| `healthy` | All targets met, checklist >= 90% complete |
| `degraded` | One or more targets missed by < 10% |
| `unhealthy` | Any target missed by >= 10% or checklist < 75% |
