# COST-07 — Showback/Chargeback Policy (by team/tenant)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-07                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring showback/chargeback policy (by team/tenant)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Showback/Chargeback Policy (by team/tenant) Document                         |

## 2. Purpose

Define the canonical policy for showback/chargeback: how costs are attributed to
teams/tenants, how costs are reported, and how disputes and adjustments are handled. This
template is optional for early-stage systems but required if chargeback is used.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost model overview: {{xref:COST-01}} | OPTIONAL
- Attribution tags standard: {{xref:COST-08}} | OPTIONAL
- Cost reporting: {{xref:COST-09}} | OPTIONAL
- Unit economics: {{xref:COST-05}} | OPTIONAL
- Compliance scope/contracts: {{xref:COMP-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Policy mode (showback ... | spec         | Yes             |
| Attribution keys (team... | spec         | Yes             |
| Allocation rules (shar... | spec         | Yes             |
| Reporting cadence (mon... | spec         | Yes             |
| Dispute/adjustment wor... | spec         | Yes             |
| Approval roles (finops... | spec         | Yes             |
| Data sources (billing ... | spec         | Yes             |

## 5. Optional Fields

Minimum bill thresholds | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Chargeback must be explainable and auditable; allocations must be documented.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Mode
mode: {{mode.value}}
2. Keys
keys: {{keys.list}}
3. Allocation
shared_allocation_rule: {{alloc.shared_rule}}
allocation_examples: {{alloc.examples}} | OPTIONAL
4. Reporting
cadence: {{report.cadence}}
audience: {{report.audience}} | OPTIONAL
5. Disputes
workflow: {{disputes.workflow}}
sla_days: {{disputes.sla_days}} | OPTIONAL
6. Approvals
approver_roles: {{approve.roles}}
7. Sources
sources: {{sources.list}}
8. Telemetry
unattributed_cost_metric: {{telemetry.unattributed_cost_metric}}
disputes_count_metric: {{telemetry.disputes_count_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:COST-08}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-09}}, {{xref:COST-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Optional.
intermediate: Required if showback/chargeback is used. Define keys, allocation, disputes,
telemetry.
advanced: Required if showback/chargeback is used. Add examples and strict auditability and
approval SLAs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, allocation examples, audience, sla_days,
optional metric, thresholds, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If mode.value is UNKNOWN → block Completeness Gate (when used).
If keys.list is UNKNOWN → block Completeness Gate (when used).
If alloc.shared_rule is UNKNOWN → block Completeness Gate (when used).
If telemetry.unattributed_cost_metric is UNKNOWN → block Completeness Gate (when used).
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions (when used):
required_fields_present == true
mode_and_keys_defined == true
allocation_defined == true
reporting_and_disputes_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-08

COST-08 — Cost Attribution Tags Standard (required tags)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Chargeback must be explainable and auditable; allocations must be documented.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Mode`
2. `## Keys`
3. `## Allocation`
4. `## Reporting`
5. `## Disputes`
6. `## Approvals`
7. `## Sources`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:COST-08}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-09}}, {{xref:COST-10}} | OPTIONAL**
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
