# MBAT-05 — Mobile Perf Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-05                                          |
| Template Type     | Build / Mobile Performance                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mobile perf observability |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Mobile Perf Observability                 |

## 2. Purpose

Define the canonical mobile performance regression gates: automated checks that block or warn on performance regressions in CI/CD. Covers startup time, frame rate, memory, network, and battery proxy regressions. This template must be consistent with profiling plan and battery constraints and must not invent gate thresholds not present in upstream inputs. Modeled after CPR-05 (web perf regression gates) adapted for mobile-specific concerns.

## 3. Inputs Required

- MBAT-03: `{{mbat.battery_budget}}`
- MBAT-04: `{{mbat.profiling_plan}}`
- CPR-05: `{{cpr.perf_gates}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Gate registry (gate_id list) | MBAT-04 | No |
| Per-gate metric (startup_ms, fps, memory_mb, etc.) | MBAT-04 | No |
| Threshold per gate (pass/warn/fail) | MBAT-04 | No |
| Gate enforcement level (block/warn/info) | spec | No |
| CI pipeline integration point | spec | No |
| Device matrix for gate execution | MBAT-04 | No |
| Baseline management (how baselines are set/updated) | spec | No |
| Failure action (block merge, notify, log) | spec | No |
| Telemetry requirements | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Statistical significance rules | spec | Variance handling |
| Flaky gate suppression rules | spec | Noise reduction |
| Open questions | agent | Enrichment only |

## 6. Rules

- Gates MUST use quantitative thresholds; subjective gates are not allowed.
- Gate results MUST be logged and auditable.
- Baseline drift MUST be managed (re-baseline cadence).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Gate Registry` — Per gate: gate_id, metric, threshold_pass, threshold_warn, threshold_fail, enforcement_level, device_matrix_ref
2. `## CI Integration` — pipeline_stage, trigger_rule, execution_environment
3. `## Baseline Management` — baseline_source, re_baseline_cadence, approval_required
4. `## Failure Actions` — on_fail_action, on_warn_action, notification_channel
5. `## Telemetry` — gate_run_metric, gate_pass_metric, gate_fail_metric, regression_detected_metric
6. `## Statistical Rules` — min_samples, variance_threshold, flaky_suppression_rule

## 8. Cross-References

- **Upstream**: MBAT-03, MBAT-04, SPEC_INDEX
- **Downstream**: SIGN-01, SIGN-05
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Gate registry + thresholds | Not required | Required | Required |
| Baseline management + CI integration | Not required | Optional | Required |
| Statistical rules + flaky suppression | Not required | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, device matrix ref, execution environment, re-baseline cadence, approval required, on warn action, notification channel, gate optional telemetry, min samples, variance threshold, flaky suppression, open_questions
- If gate registry is UNKNOWN → block Completeness Gate.
- If threshold per gate is UNKNOWN → block Completeness Gate.
- If baseline.source is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] gate_registry_defined == true
- [ ] thresholds_quantitative == true
- [ ] ci_integration_defined == true
- [ ] baseline_management_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
