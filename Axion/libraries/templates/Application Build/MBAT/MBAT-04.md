# MBAT-04 — Network Usage Optimization

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-04                                          |
| Template Type     | Build / Mobile Performance                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring network usage optimizatio |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Network Usage Optimization                |

## 2. Purpose

Define the canonical mobile performance profiling plan: what to profile, tools to use, profiling cadence, thresholds, and how profiling results feed into gating and regression detection. This template must be consistent with battery/network constraints and must not invent profiling targets not present in upstream inputs.

## 3. Inputs Required

- MBAT-01: `{{mbat.bg_work_rules}}` | OPTIONAL
- MBAT-02: `{{mbat.net_policy}}` | OPTIONAL
- MBAT-03: `{{mbat.battery_budget}}` | OPTIONAL
- CPR-04: `{{cpr.profiling}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Profiling targets (startup, scrolling, navigation, network) | spec | No |
| Profiling tools (per platform) | spec | No |
| Profiling cadence (per release, per sprint, ad hoc) | spec | No |
| Threshold definitions (acceptable vs regression) | CPR-04 | No |
| Device matrix for profiling | spec | No |
| Result storage/tracking | spec | Yes |
| Telemetry hooks for profiling | spec | Yes |
| CI integration rules | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Flamegraph/trace capture rules | spec | Advanced tooling |
| User-perceived perf correlation | spec | ANR, jank metrics |
| Open questions | agent | Enrichment only |

## 6. Rules

- Profiling MUST target real device matrix, not emulators alone.
- Thresholds MUST be quantitative and gatable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Profiling Targets` — targets, per_target_metrics
2. `## Profiling Tools` — ios_tools, android_tools, cross_platform_tools
3. `## Cadence` — profiling_cadence, trigger_rules
4. `## Thresholds` — per_target_thresholds, regression_definition
5. `## Device Matrix` — devices, os_versions, tiers
6. `## Result Storage` — storage_location, retention_policy
7. `## CI Integration` — ci_profiling_enabled, ci_gate_rule, failure_action
8. `## Telemetry` — profiling_run_metric, regression_detected_metric

## 8. Cross-References

- **Upstream**: MBAT-01, MBAT-03, SPEC_INDEX
- **Downstream**: MBAT-05
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Profiling targets + tools | Not required | Required | Required |
| Thresholds + device matrix + CI | Not required | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, per target metrics, cross platform tools, trigger rules, regression definition, os versions, retention policy, ci gate rule, failure action, telemetry optional fields, flamegraph rules, user perf correlation, open_questions
- If targets list is UNKNOWN → block Completeness Gate.
- If tools list is UNKNOWN → block Completeness Gate.
- If thresholds list is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] profiling_targets_defined == true
- [ ] tools_and_cadence_defined == true
- [ ] thresholds_defined == true
- [ ] device_matrix_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
