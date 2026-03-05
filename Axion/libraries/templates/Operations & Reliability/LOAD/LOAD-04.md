# LOAD-04 — Data & Environment Setup (fixtures, isolation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-04                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data & environment setup (fixtures, isolation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data & Environment Setup (fixtures, isolation) Document                         |

## 2. Purpose

Define the canonical setup rules for load tests: environment selection, isolation constraints,
fixture/seed data requirements, and how to reset between runs. This template prevents load
tests from polluting shared environments and ensures repeatability.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Environment overview: {{xref:TDE-01}} | OPTIONAL
- Data reset/isolation rules: {{xref:TDE-04}} | OPTIONAL
- Environment matrix: {{xref:ENV-01}} | OPTIONAL
- Load tooling/harness: {{xref:LOAD-05}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Environment selection ... | spec         | Yes             |
| Isolation rule (dedica... | spec         | Yes             |
| Seed data requirements... | spec         | Yes             |
| Account provisioning r... | spec         | Yes             |
| Reset rule (how to cle... | spec         | Yes             |
| External dependency ru... | spec         | Yes             |
| Rate limit/abuse contr... | spec         | Yes             |
| Safety guardrails (no ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Cost controls (limit duration) | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never use real customer PII in load fixtures unless explicitly allowed.
Load tests must not disable security controls in a way that invalidates results without being
documented.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Environment
selection_rule: {{env.selection_rule}}
envs: {{env.envs}} | OPTIONAL
2. Isolation
isolation_rule: {{isolation.rule}}
tenant_strategy: {{isolation.tenant_strategy}} | OPTIONAL
3. Seed Data
datasets: {{data.datasets}}
versioning_rule: {{data.versioning_rule}} | OPTIONAL
4. Accounts
provision_rule: {{acct.provision_rule}}
account_pool_rule: {{acct.pool_rule}} | OPTIONAL
5. Reset / Cleanup
reset_rule: {{reset.rule}}
6. External Dependencies
dependency_rule: {{deps.rule}}
7. Overrides
rate_limit_override_rule: {{overrides.rate_limit_rule}}
8. Guardrails
safety_rule: {{guard.safety_rule}}
9. Telemetry
setup_fail_metric: {{telemetry.setup_fail_metric}}
data_drift_metric: {{telemetry.data_drift_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:TDE-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-07}}, {{xref:LOAD-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define env selection, isolation, seed data, reset rule, guardrails.
intermediate: Required. Define dependency rule, overrides, telemetry metrics.
advanced: Required. Add cost controls and strict dataset versioning and drift detection
processes.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, env list, tenant strategy, versioning rule,
account pool, optional metrics, cost controls, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If env.selection_rule is UNKNOWN → block Completeness Gate.
If isolation.rule is UNKNOWN → block Completeness Gate.
If data.datasets is UNKNOWN → block Completeness Gate.
If reset.rule is UNKNOWN → block Completeness Gate.
If guard.safety_rule is UNKNOWN → block Completeness Gate.
If telemetry.setup_fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
env_and_isolation_defined == true
data_and_reset_defined == true
guardrails_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-05

LOAD-05 — Tooling & Harness (runner, metrics capture)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never use real customer PII in load fixtures unless explicitly allowed.**
- **Load tests must not disable security controls in a way that invalidates results without being**
- **documented.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Environment`
2. `## Isolation`
3. `## Seed Data`
4. `## Accounts`
5. `## Reset / Cleanup`
6. `## External Dependencies`
7. `## Overrides`
8. `## Guardrails`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:TDE-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-07}}, {{xref:LOAD-08}} | OPTIONAL**
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
