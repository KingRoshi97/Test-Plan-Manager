# MBAT-03 — Battery Budget & Constraints (targets)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-03                                             |
| Template Type     | Build / Mobile Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring battery budget & constraints (targets)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Battery Budget & Constraints (targets) Document                         |

## 2. Purpose

Define the canonical battery budget and constraints for the mobile app: target usage,
background limits, network/CPU constraints, and how to detect and prevent battery regressions.
This template must be consistent with background work and network policies and must not
invent battery targets not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MBAT-01 Background Work Rules: {{mbat.bg_work_rules}}
- MBAT-02 Network Usage Policy: {{mbat.net_policy}}
- CPR-01 Performance Budget: {{cpr.budget}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Battery targets (basel... | spec         | Yes             |
| High-cost operations l... | spec         | Yes             |
| Background battery con... | spec         | Yes             |
| CPU usage constraints ... | spec         | Yes             |
| Network usage constrai... | spec         | Yes             |
| Low power mode behavior   | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Regression detection p... | spec         | Yes             |

## 5. Optional Fields

Device tier differences | OPTIONAL
User-facing battery saver setting | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Battery rules MUST be enforceable via limits or gating.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Battery Targets
target_definition: {{battery.target_definition}}
max_background_drain: {{battery.max_background_drain}} | OPTIONAL
2. High-Cost Operations
operations: {{costly.operations}}
mitigations: {{costly.mitigations}} | OPTIONAL
3. Background Constraints
background_limits: {{bg.limits}}
schedule_constraints_ref: {{bg.schedule_constraints_ref}} (expected: {{xref:MBAT-01}}) |
OPTIONAL
4. CPU Constraints
cpu_budget_rule: {{cpu.budget_rule}} | OPTIONAL
thermal_throttle_behavior: {{cpu.thermal_behavior}} | OPTIONAL
5. Network Constraints
network_policy_ref: {{net.policy_ref}} (expected: {{xref:MBAT-02}}) | OPTIONAL
6. Low Power Mode
low_power_behavior: {{lpm.behavior}}
disable_features_in_lpm: {{lpm.disable_features}} | OPTIONAL
7. Telemetry
battery_proxy_metrics: {{telemetry.proxy_metrics}}
alerts: {{telemetry.alerts}} | OPTIONAL
8. Regression Detection
profiling_ref: {{regress.profiling_ref}} (expected: {{xref:CPR-04}}) | OPTIONAL
gate_ref: {{regress.gate_ref}} (expected: {{xref:CPR-05}}) | OPTIONAL
fail_criteria: {{regress.fail_criteria}} | OPTIONAL
9. References
Background work: {{xref:MBAT-01}}
Network policy: {{xref:MBAT-02}}
Profiling plan: {{xref:CPR-04}} | OPTIONAL
Perf gates: {{xref:CPR-05}} | OPTIONAL
Cross-References
Upstream: {{xref:MBAT-01}}, {{xref:MBAT-02}} , {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MBAT-04}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define battery targets and low power mode behavior and telemetry.
advanced: Required. Add regression gates and device tier differences.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, max background drain, mitigations,
schedule ref, cpu rules, network policy ref, disable features, alerts, profiling/gate refs, fail
criteria, device tiers, user setting, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If battery.target_definition is UNKNOWN → block Completeness Gate.
If bg.limits is UNKNOWN → block Completeness Gate.
If lpm.behavior is UNKNOWN → block Completeness Gate.
If telemetry.proxy_metrics is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MBAT
Pass conditions:
required_fields_present == true
battery_targets_defined == true
constraints_defined == true
low_power_behavior_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MBAT-04

MBAT-04 — Perf Profiling Plan (mobile tooling)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Battery rules MUST be enforceable via limits or gating.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Battery Targets`
2. `## High-Cost Operations`
3. `## Background Constraints`
4. `## OPTIONAL`
5. `## CPU Constraints`
6. `## Network Constraints`
7. `## Low Power Mode`
8. `## Telemetry`
9. `## Regression Detection`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MBAT-01}}, {{xref:MBAT-02}} , {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MBAT-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Not required.**
- **intermediate: Required. Define battery targets and low power mode behavior and telemetry.**
- **advanced: Required. Add regression gates and device tier differences.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, max background drain, mitigations,**
- schedule ref, cpu rules, network policy ref, disable features, alerts, profiling/gate refs, fail
- criteria, device tiers, user setting, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If battery.target_definition is UNKNOWN → block

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
