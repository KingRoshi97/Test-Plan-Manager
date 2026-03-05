# SLO-07 — Alerting on Burn (ties to ALRT)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-07                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alerting on burn (ties to alrt)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alerting on Burn (ties to ALRT) Document                         |

## 2. Purpose

Define the canonical rules for alerting on error budget burn: burn-rate alert tiers, window pairs,
severity mapping, routing, and runbook linkage. This template standardizes SLO burn alerting
so it is consistent and low-noise.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Error budget policy: {{xref:SLO-04}} | OPTIONAL
- Measurement rules: {{xref:SLO-06}} | OPTIONAL
- Alert rule spec: {{xref:ALRT-03}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Burn alert tiers (tier... | spec         | Yes             |
| Window pairs (short/lo... | spec         | Yes             |
| Burn rate threshold ru... | spec         | Yes             |
| Severity mapping (tier... | spec         | Yes             |
| Routing rule (team/onc... | spec         | Yes             |
| Dedupe/suppression rul... | spec         | Yes             |
| Runbook linkage rule (... | spec         | Yes             |
| SLO coverage rule (whi... | spec         | Yes             |

## 5. Optional Fields

Per-tier actions (freeze triggers) | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Burn alerts must be actionable and map to clear actions in SLO-04.
Burn alert rules must reference actual SLO metrics; do not invent sources.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Tiers
tiers: {{tiers.list}}
2. Windows
window_pairs: {{windows.pairs}}
3. Thresholds
threshold_rule: {{thresh.rule}}
example_thresholds: {{thresh.examples}} | OPTIONAL
4. Severity
mapping: {{sev.mapping}}
5. Routing & Noise Controls
routing_rule: {{route.rule}}
noise_ref: {{xref:ALRT-05}} | OPTIONAL
6. Runbooks
runbook_rule: {{runbooks.rule}}
error_budget_ref: {{xref:SLO-04}} | OPTIONAL
7. Coverage
coverage_rule: {{cover.rule}}
8. Telemetry
burn_alert_metric: {{telemetry.burn_alert_metric}}
budget_remaining_metric: {{telemetry.budget_remaining_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-02}}, {{xref:IRP-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define tiers, windows, threshold rule, severity mapping, coverage rule.
intermediate: Required. Define routing/noise controls and telemetry metrics.
advanced: Required. Add per-tier actions and tighter examples and strict alignment to freeze
triggers.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, examples, noise ref, optional metric,
per-tier actions, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If tiers.list is UNKNOWN → block Completeness Gate.
If windows.pairs is UNKNOWN → block Completeness Gate.
If thresh.rule is UNKNOWN → block Completeness Gate.
If cover.rule is UNKNOWN → block Completeness Gate.
If telemetry.burn_alert_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
tiers_and_windows_defined == true
thresholds_and_severity_defined == true
coverage_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-08

SLO-08 — Review Cadence & Ownership (monthly reviews)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Burn alerts must be actionable and map to clear actions in SLO-04.**
- **Burn alert rules must reference actual SLO metrics; do not invent sources.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Tiers`
2. `## Windows`
3. `## Thresholds`
4. `## Severity`
5. `## Routing & Noise Controls`
6. `## Runbooks`
7. `## Coverage`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:SLO-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:IRP-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
