# MBAT-04 — Perf Profiling Plan (mobile tooling)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-04                                             |
| Template Type     | Build / Mobile Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring perf profiling plan (mobile tooling)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Perf Profiling Plan (mobile tooling) Document                         |

## 2. Purpose

Define the canonical mobile performance profiling plan, focused on mobile tooling and
scenarios: frame drops, startup time, memory, battery proxies, background work, and network
usage under real device constraints. This template must be consistent with overall profiling plan
and battery/network constraints and must not invent profiling tooling not present in upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CPR-04 Profiling Plan: {{cpr.profiling_plan}}
- MBAT-03 Battery Budget & Constraints: {{mbat.battery_budget}} | OPTIONAL
- MOB-04 App Lifecycle + State: {{mob.lifecycle}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Metrics collected (fps... | spec         | Yes             |
| Tooling list (RN perf ... | spec         | Yes             |
| Device list (test devi... | spec         | Yes             |
| Network profiles (wifi... | spec         | Yes             |
| Background profiling r... | spec         | Yes             |
| Reporting format/location | spec         | Yes             |
| Cadence/ownership         | spec         | Yes             |

## 5. Optional Fields

Automation in CI | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Metrics MUST align to MBAT/CPR budgets.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Scenarios
scenarios:
{{scenarios[0]}}
{{scenarios[1]}}
{{scenarios[2]}}
2. Metrics
fps_metrics: {{metrics.fps}}
frame_time_metrics: {{metrics.frame_time}} | OPTIONAL
memory_metrics: {{metrics.memory}} | OPTIONAL
cpu_metrics: {{metrics.cpu}} | OPTIONAL
network_metrics: {{metrics.network}} | OPTIONAL
battery_proxy_metrics: {{metrics.battery_proxy}} | OPTIONAL
3. Tools
tools: {{tools.list}}
4. Devices & Networks
devices: {{tests.devices}}
network_profiles: {{tests.network_profiles}} | OPTIONAL
5. Background Profiling
low_power_mode_tests: {{bg.low_power_mode_tests}}
doze_mode_tests: {{bg.doze_mode_tests}} | OPTIONAL
6. Reporting
report_location: {{report.location}}
report_format: {{report.format}} (md/json/dashboard/UNKNOWN)
7. Cadence & Ownership
cadence: {{ops.cadence}}
owner: {{ops.owner}}
review_process: {{ops.review_process}} | OPTIONAL
8. References
Overall profiling plan: {{xref:CPR-04}}
Battery constraints: {{xref:MBAT-03}} | OPTIONAL
Lifecycle rules: {{xref:MOB-04}} | OPTIONAL
Cross-References
Upstream: {{xref:CPR-04}} , {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MBAT-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define scenarios, tools, devices, reporting.
advanced: Required. Add CI automation and background constraint profiling rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional metrics, network profiles, doze
tests, review process, CI automation, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If tools.list is UNKNOWN → block Completeness Gate.
If report.location is UNKNOWN → block Completeness Gate.
If ops.owner is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MBAT
Pass conditions:
required_fields_present == true
scenarios_defined == true
tools_defined == true
reporting_defined == true
cadence_and_owner_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Mobile Deep Links & Universal Links
(MDL)

Mobile Deep Links & Universal Links (MDL)
MDL-01 Link Scheme & Domains (app links, universal links)
MDL-02 Routing Rules (link → screen/action mapping)
MDL-03 Auth Gating & Safety (signed links, validation)
MDL-04 Fallback Behavior (not installed, unknown routes)

MDL-01

MDL-01 — Link Scheme & Domains (app links, universal links)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Metrics MUST align to MBAT/CPR budgets.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Scenarios`
2. `## scenarios:`
3. `## Metrics`
4. `## Tools`
5. `## Devices & Networks`
6. `## Background Profiling`
7. `## Reporting`
8. `## Cadence & Ownership`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:CPR-04}} , {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MBAT-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Not required.**
- **intermediate: Required. Define scenarios, tools, devices, reporting.**
- **advanced: Required. Add CI automation and background constraint profiling rigor.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, optional metrics, network profiles, doze**
- tests, review process, CI automation, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If tools.list is UNKNOWN → block

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
