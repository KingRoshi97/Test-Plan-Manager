# COST-08 — Cost Attribution Tags Standard (required tags)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-08                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cost attribution tags standard (required tags)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Cost Attribution Tags Standard (required tags) Document                         |

## 2. Purpose

Define the canonical tagging/labeling standard required for cost attribution across infrastructure
and services: required tags, naming conventions, enforcement, and validation. This template
enables showback, budgeting, and driver analysis.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IaC module/stack standards: {{xref:IAC-03}} | OPTIONAL
- Cost model overview: {{xref:COST-01}} | OPTIONAL
- Control matrix (governance): {{xref:COMP-02}} | OPTIONAL
- Cost reporting: {{xref:COST-09}} | OPTIONAL
- Pipeline overview: {{xref:CICD-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Required tags list (ke... | spec         | Yes             |
| Tag value conventions ... | spec         | Yes             |
| Minimum tag set per re... | spec         | Yes             |
| Ownership tags (team_i... | spec         | Yes             |
| Environment tag rule (... | spec         | Yes             |
| Tenant/customer tag ru... | spec         | Yes             |
| Enforcement rule (IaC ... | spec         | Yes             |
| Exception process (tem... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Provider-specific notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Resources without required tags should fail CI or be flagged for remediation.
Tag keys must be stable; do not rename without migration plan.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Required Tags
tags: {{tags.required}}
2. Value Conventions
patterns: {{tags.patterns}}
examples: {{tags.examples}} | OPTIONAL
3. Per-Resource Minimums
resource_minimums: {{tags.resource_minimums}}
4. Ownership
ownership_tags: {{tags.ownership_tags}}
5. Environment
env_tag_rule: {{env.rule}}
6. Tenant/Customer
tenant_tag_rule: {{tenant.rule}}
7. Enforcement
enforcement_rule: {{enforce.rule}}
ci_gate_ref: {{enforce.ci_gate_ref}} | OPTIONAL
8. Exceptions
exception_rule: {{exceptions.rule}}
exceptions_ref: {{xref:COMP-08}} | OPTIONAL
9. Telemetry
untagged_cost_metric: {{telemetry.untagged_cost_metric}}
Cross-References
Upstream: {{xref:IAC-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-09}}, {{xref:COST-04}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define required tags, env tag rule, enforcement rule, telemetry metric.
intermediate: Required. Define resource minimums, conventions, exceptions.
advanced: Required. Add provider notes and strict migration guidance for tag schema changes.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, examples, ci gate ref, provider notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If tags.required is UNKNOWN → block Completeness Gate.
If tags.resource_minimums is UNKNOWN → block Completeness Gate.
If enforce.rule is UNKNOWN → block Completeness Gate.
If telemetry.untagged_cost_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
required_tags_defined == true
resource_minimums_defined == true
enforcement_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-09

COST-09 — Cost Reporting (dashboards, cadence)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Resources without required tags should fail CI or be flagged for remediation.**
- **Tag keys must be stable; do not rename without migration plan.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Required Tags`
2. `## Value Conventions`
3. `## Per-Resource Minimums`
4. `## Ownership`
5. `## Environment`
6. `## Tenant/Customer`
7. `## Enforcement`
8. `## Exceptions`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:IAC-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-09}}, {{xref:COST-04}} | OPTIONAL**
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
