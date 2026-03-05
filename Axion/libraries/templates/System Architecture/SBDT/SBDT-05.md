# SBDT-05 — Resilience Topology

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SBDT-05                                             |
| Template Type     | Architecture / Deployment                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring resilience topology    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Resilience Topology Document                         |

## 2. Purpose

Define how resilience is achieved at the topology level: redundancy, failover posture, circuit
boundaries, graceful degradation, and recovery objectives. This is the architecture-to-operations
bridge for reliability.

## 3. Inputs Required

- ● SBDT-02: {{xref:SBDT-02}} | OPTIONAL
- ● RELIA-02: {{xref:RELIA-02}} | OPTIONAL
- ● SLO-01: {{xref:SLO-01}} | OPTIONAL
- ● BDR-01: {{xref:BDR-01}} | OPTIONAL
- ● OBS-04: {{xref:OBS-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Critical dependency in... | spec         | Yes             |
| For each critical depe... | spec         | Yes             |
| ○ dependency_id           | spec         | Yes             |
| ○ component_id            | spec         | Yes             |
| ○ redundancy posture (... | spec         | Yes             |
| ○ failover method (aut... | spec         | Yes             |
| ○ circuit breaker boun... | spec         | Yes             |
| ○ RTO/RPO targets (if ... | spec         | Yes             |
| ○ monitoring/alerting ... | spec         | Yes             |
| Graceful degradation r... | spec         | Yes             |
| Recovery playbook poin... | spec         | Yes             |

## 5. Optional Fields

● Chaos testing plan pointer | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● Every P0 critical dependency must have a degradation behavior defined.
● Failover method must be explicit; “we’ll handle it” is not allowed.
● Circuit breakers must have clear thresholds and reset policy (pointer ok).

Output Format
1) Applicability
● applies: {{resilience.applies}} (true/false)
● 00_NA (if not applies): {{resilience.na_block}} | OPTIONAL

2) Critical Dependencies (canonical)
depe
nden
cy_id

compone
nt_id

redunda
ncy

failove
r

circuit
_boun
dary

degradat
ion_beh
avior

rto_rp
o

monitori
ng

notes

dep_
01

{{deps[0].c
omponent
_id}}

{{deps[0].
redundan
cy}}

{{deps[
0].failov
er}}

{{deps[
0].circu
it}}

{{deps[0].
degradati
on}}

{{deps[
0].rto_r
po}}

{{deps[0]. {{deps
monitorin [0].not
g}}
es}}

3) Degradation Rules (required if applies)
user_area_or_f
eature

dependency

degraded_mod user_message_p
e
ointer

recovery_conditi
on

{{degrade[0].are
a}}

{{degrade[0].d
ep}}

{{degrade[0].mo
de}}

{{degrade[0].recov
ery}}

{{degrade[0].msg
_ptr}}

4) Recovery Playbooks (required if applies)
● DB recovery pointer: {{playbooks.db}} | OPTIONAL

● Queue recovery pointer: {{playbooks.queue}} | OPTIONAL
● Vendor outage pointer: {{playbooks.vendor}} | OPTIONAL
● Incident process pointer: {{playbooks.incident}} | OPTIONAL

5) Monitoring/Alerting Requirements (required if applies)
● Required alerts: {{alerts.required}}
● Paging vs ticketing rules: {{alerts.paging_rules}} | OPTIONAL

Cross-References
● Upstream: {{xref:RELIA-02}} | OPTIONAL, {{xref:SLO-01}} | OPTIONAL, {{xref:BDR-01}}
| OPTIONAL
● Downstream: {{xref:IRP-01}} | OPTIONAL, {{xref:RELIA-05}} | OPTIONAL,
{{xref:LOAD-*}} | OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Not required.
● intermediate: Required if applies. Define dependencies + degradation behavior.
● advanced: Required if applies. Add circuit boundaries and recovery pointers.

Unknown Handling
● UNKNOWN_ALLOWED: chaos_testing_pointer, notes, rto_rpo (if not set yet
but must be planned)

● If applies == true and any P0 dependency lacks degradation_behavior → block
Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.TOPOLOGY
● Pass conditions:
○ required_fields_present == true
○ if_applies_then_deps_present == true
○ if_applies_then_degradation_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

SBDT-06

SBDT-06 — Deployment Constraints
(rollouts, canary, migration safety)
Header Block
● template_id: SBDT-06
● title: Deployment Constraints (rollouts, canary, migration safety)
● type: service_boundaries_deployment_topology
● template_version: 1.0.0
● output_path: 10_app/topology/SBDT-06_Deployment_Constraints.md
● compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY
● upstream_dependencies: ["ARC-08", "REL-01", "REL-04", "DATA-04"]
● inputs_required: ["ARC-08", "REL-01", "REL-04", "DATA-04", "CICD-03",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the hard constraints and required practices for safe deployment: rollout strategy,
canary/phased deploy rules, migra

## 6. Rules

- If applies == false, include 00_NA block only.
- Every P0 critical dependency must have a degradation behavior defined.
- Failover method must be explicit; “we’ll handle it” is not allowed.
- Circuit breakers must have clear thresholds and reset policy (pointer ok).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Critical Dependencies (canonical)`
3. `## depe`
4. `## nden`
5. `## cy_id`
6. `## compone`
7. `## nt_id`
8. `## redunda`
9. `## ncy`
10. `## failove`

## 8. Cross-References

- Upstream: {{xref:RELIA-02}} | OPTIONAL, {{xref:SLO-01}} | OPTIONAL, {{xref:BDR-01}}
- | OPTIONAL
- Downstream: {{xref:IRP-01}} | OPTIONAL, {{xref:RELIA-05}} | OPTIONAL,
- **{{xref:LOAD-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
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
