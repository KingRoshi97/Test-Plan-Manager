# MBAT-03 — Background Processing Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-03                                          |
| Template Type     | Build / Mobile Performance                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring background processing pol |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Background Processing Policy              |

## 2. Purpose

Define the canonical battery budget and constraints for the mobile app: target usage, background limits, network/CPU constraints, and how to detect and prevent battery regressions. This template must be consistent with background work and network policies and must not invent battery targets not present in upstream inputs.

## 3. Inputs Required

- MBAT-01: `{{mbat.bg_work_rules}}`
- MBAT-02: `{{mbat.net_policy}}`
- CPR-01: `{{cpr.budget}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Battery targets (baseline target definition) | spec | No |
| High-cost operations list (camera, GPS, video) | spec | No |
| Background battery constraints (limits) | MBAT-01 | No |
| CPU usage constraints (if defined) | spec | Yes |
| Network usage constraints pointer (MBAT-02) | MBAT-02 | Yes |
| Low power mode behavior | spec | No |
| Telemetry requirements (battery impact proxies) | spec | No |
| Regression detection plan (profiling/gates) | CPR | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Device tier differences | spec | Low-end vs high-end |
| User-facing battery saver setting | spec | If user-configurable |
| Open questions | agent | Enrichment only |

## 6. Rules

- Battery rules MUST be enforceable via limits or gating.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Battery Targets` — target_definition, max_background_drain
2. `## High-Cost Operations` — operations, mitigations
3. `## Background Constraints` — background_limits, schedule_constraints_ref
4. `## CPU Constraints` — cpu_budget_rule, thermal_throttle_behavior
5. `## Network Constraints` — network_policy_ref
6. `## Low Power Mode` — low_power_behavior, disable_features_in_lpm
7. `## Telemetry` — battery_proxy_metrics, alerts
8. `## Regression Detection` — profiling_ref, gate_ref, fail_criteria

## 8. Cross-References

- **Upstream**: MBAT-01, MBAT-02, SPEC_INDEX
- **Downstream**: MBAT-04
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Battery targets + low power mode + telemetry | Not required | Required | Required |
| Regression gates + device tier differences | Not required | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, max background drain, mitigations, schedule ref, cpu rules, network policy ref, disable features, alerts, profiling/gate refs, fail criteria, device tiers, user setting, open_questions
- If battery.target_definition is UNKNOWN → block Completeness Gate.
- If bg.limits is UNKNOWN → block Completeness Gate.
- If lpm.behavior is UNKNOWN → block Completeness Gate.
- If telemetry.proxy_metrics is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] battery_targets_defined == true
- [ ] constraints_defined == true
- [ ] low_power_behavior_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
