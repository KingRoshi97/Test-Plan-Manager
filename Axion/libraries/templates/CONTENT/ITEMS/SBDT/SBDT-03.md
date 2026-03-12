# SBDT-03 — Environment Topology

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SBDT-03                                             |
| Template Type     | Architecture / Deployment                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring environment topology    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Environment Topology Document                         |

## 2. Purpose

Define how environments are structured and isolated (dev/stage/prod), what parity guarantees
exist, how data is handled in each environment, and what isolation/network rules apply. This
ensures safe testing without contaminating production data or credentials.

## 3. Inputs Required

- ● ARC-08: {{xref:ARC-08}} | OPTIONAL
- ● ENV-01: {{xref:ENV-01}} | OPTIONAL
- ● OPS-01: {{xref:OPS-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each environment:     | spec         | Yes             |
| ○ env_id                  | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ access policy (who c... | spec         | Yes             |
| ○ data policy (synthet... | spec         | Yes             |
| ○ secrets policy (sepa... | spec         | Yes             |
| ○ service parity expec... | spec         | Yes             |
| ○ isolation rules (net... | spec         | Yes             |
| ○ integrations policy ... | spec         | Yes             |
| ○ observability policy... | spec         | Yes             |
| Promotion rules (dev →... | spec         | Yes             |

## 5. Optional Fields

● Preview environments (per PR) | OPTIONAL
● Notes | OPTIONAL

Rules
● Environments must use different secrets; no shared production credentials.
● Production data must not be copied to lower environments unless sanitized and
approved.
● Sandbox integrations must be used in non-prod by default.
● Parity must cover critical configs and schema versions.

Output Format
1) Environment Matrix (canonical)
e
n
v
_
i
d

purpos
e

access
_policy

data_
policy

secrets
_policy

parity_
expect
ations

isolatio
n_rules

integrati
ons_poli
cy

obs_p
olicy

notes

d
e
v

{{envs.d {{envs.
ev.purpo dev.acc
se}}
ess}}

{{envs.
dev.da
ta}}

{{envs.d {{envs.
ev.secr dev.par
ets}}
ity}}

{{envs.d
ev.isolati
on}}

{{envs.de
v.integrati
ons}}

{{envs
.dev.o
bs}}

{{envs.
dev.not
es}}

s
t
a
g
e

{{envs.s
tage.pur
pose}}

{{envs.
stage.a
ccess}}

{{envs.
stage.
data}}

{{envs.s
tage.se
crets}}

{{envs.st
age.isol
ation}}

{{envs.sta
ge.integra
tions}}

{{envs {{envs.
.stage. stage.n
obs}}
otes}}

p
r
o
d

{{envs.p
rod.purp
ose}}

{{envs.
prod.ac
cess}}

{{envs.
prod.d
ata}}

{{envs.p {{envs. {{envs.pr {{envs.pr
rod.secr prod.pa od.isolati od.integra
ets}}
rity}}
on}}
tions}}

{{envs.
stage.p
arity}}

2) Promotion Rules (required)
● Dev → Stage rule: {{promotion.dev_to_stage}}
● Stage → Prod rule: {{promotion.stage_to_prod}}

{{envs
.prod.
obs}}

{{envs.
prod.n
otes}}

● Approval gates: {{promotion.approvals}} | OPTIONAL

3) Data Handling Rules (required)
● No prod data in non-prod: {{data.no_prod_in_nonprod}}
● Sanitization requirement (if any copy): {{data.sanitization}} | OPTIONAL
● Exception policy: {{data.exception_policy}} | OPTIONAL

Cross-References
● Upstream: {{xref:ENV-01}} | OPTIONAL, {{xref:ARC-08}} | OPTIONAL
● Downstream: {{xref:OPS-04}} | OPTIONAL, {{xref:CICD-}} | OPTIONAL, {{xref:BDR-}} |
OPTIONAL
● Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-PRIVACY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Matrix with data + secrets separation rules.
● intermediate: Required. Add parity and integration sandbox rules.
● advanced: Required. Add promotion gates and explicit exception policies.

Unknown Handling
● UNKNOWN_ALLOWED: preview_envs, notes, obs_policy_details,
promotion.approvals
● If secrets_policy is UNKNOWN for any environment → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.TOPOLOGY
● Pass conditions:
○ required_fields_present == true
○ environment_matrix_present == true
○ secrets_separation_defined == true
○ data_policy_defined == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

SBDT-04

SBDT-04 — Scaling Model
(horizontal/vertical, bottlenecks, capacity
assumptions)
Header Block
● template_id: SBDT-04
● title: Scaling Model (horizontal/vertical, bottlenecks, capacity assumptions)
● type: service_boundaries_deployment_topology
● template_version: 1.0.0
● output_path: 10_app/topology/SBDT-04_Scaling_Model.md
● compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY
● upstream_dependencies: ["SBDT-02", "PERF-02", "COST-01"]
● inputs_required: ["SBDT-02", "PERF-02", "LOAD-01", "COST-01",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": fal

## 6. Rules

- Environments must use different secrets; no shared production credentials.
- Production data must not be copied to lower environments unless sanitized and
- **approved.**
- Sandbox integrations must be used in non-prod by default.
- Parity must cover critical configs and schema versions.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Environment Matrix (canonical)`
2. `## purpos`
3. `## access`
4. `## _policy`
5. `## data_`
6. `## policy`
7. `## secrets`
8. `## _policy`
9. `## parity_`
10. `## expect`

## 8. Cross-References

- Upstream: {{xref:ENV-01}} | OPTIONAL, {{xref:ARC-08}} | OPTIONAL
- Downstream: {{xref:OPS-04}} | OPTIONAL, {{xref:CICD-}} | OPTIONAL, {{xref:BDR-}} |
- OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
