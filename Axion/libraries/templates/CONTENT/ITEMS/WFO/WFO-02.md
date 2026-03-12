# WFO-02 — Orchestration Patterns (state

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WFO-02                                             |
| Template Type     | Architecture / Workflow                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring orchestration patterns (state    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Orchestration Patterns (state Document                         |

## 2. Purpose

Define the canonical orchestration patterns used across workflows: how state machines are
modeled, how retries and backoff are applied, how compensation works, and how workflows
transition between states under failure.

## 3. Inputs Required

- ● WFO-01: {{xref:WFO-01}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● RELIA-02: {{xref:RELIA-02}} | OPTIONAL
- ● OBS-03: {{xref:OBS-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Pattern catalog (minim... | spec         | Yes             |
| For each pattern:         | spec         | Yes             |
| ○ pattern_id              | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ when to use             | spec         | Yes             |
| ○ when not to use         | spec         | Yes             |
| ○ state model (states ... | spec         | Yes             |
| ○ retry rules (which s... | spec         | Yes             |
| ○ compensation rules (... | spec         | Yes             |
| ○ timeout rules           | spec         | Yes             |
| ○ observability hooks ... | spec         | Yes             |
| Standard retry/backoff... | spec         | Yes             |

## 5. Optional Fields

● Diagrams/pointers | OPTIONAL
● Notes | OPTIONAL

Rules
● Retries must be bounded and follow ERR-05 profiles.
● Compensation must be explicit for multi-step workflows with side effects.
● State transitions must be deterministic; no ambiguous “maybe” states.
● Stuck detection must be measurable and alertable.

Output Format
1) Global Workflow States (required)
state

meaning

entry_conditions

exit_conditions

queued

{{states.queued.meaning}}

{{states.queued.entry}}

{{states.queued.exit}}

running

{{states.running.meaning}}

{{states.running.entry}}

{{states.running.exit}}

waiting

{{states.waiting.meaning}}

{{states.waiting.entry}}

{{states.waiting.exit}}

succeede {{states.succeeded.meaning
d
}}

{{states.succeeded.entry
}}

{{states.succeeded.exit}
}

failed

{{states.failed.meaning}}

{{states.failed.entry}}

{{states.failed.exit}}

cancelled

{{states.cancelled.meaning}} {{states.cancelled.entry}}

{{states.cancelled.exit}}

2) Patterns Catalog (canonical)
pat
ter
n_i
d

name

use_whe
n

avoid_whe
n

retry_r
ule

compe
nsation
_rule

timeout_
rule

obs_h
ooks

notes

pat
_sa
ga

{{patter
ns[0].na
me}}

{{patterns[
0].use_wh
en}}

{{patterns[0 {{patter {{pattern {{pattern
].avoid_wh ns[0].ret s[0].com s[0].time
en}}
ry}}
p}}
out}}

{{patter
ns[0].o
bs}}

{{patter
ns[0].no
tes}}

pat
_jo
b

{{patter
ns[1].na
me}}

{{patterns[
1].use_wh
en}}

{{patterns[1 {{patter {{pattern {{pattern
].avoid_wh ns[1].ret s[1].com s[1].time
en}}
ry}}
p}}
out}}

{{patter
ns[1].o
bs}}

{{patter
ns[1].no
tes}}

3) Stuck Workflow Detection (required)
● Watchdog rules: {{stuck.watchdog_rules}}
● Timeout thresholds: {{stuck.timeouts}}
● Escalation actions: {{stuck.escalation}} | OPTIONAL

Cross-References
● Upstream: {{xref:ERR-05}} | OPTIONAL, {{xref:RELIA-02}} | OPTIONAL
● Downstream: {{xref:WFO-05}} | OPTIONAL, {{xref:OPS-06}} | OPTIONAL, {{xref:IRP-*}} |
OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Global state definitions + 6 patterns (names + when to use).
● intermediate: Required. Add retry/timeout rules and stuck detection.
● advanced: Required. Add compensation and observability hooks per pattern.

Unknown Handling
● UNKNOWN_ALLOWED: diagrams, notes, escalation_actions
● If retry rules are UNKNOWN for any pattern → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.WORKFLOWS

● Pass conditions:
○ required_fields_present == true
○ patterns_count >= 6
○ global_states_present == true
○ stuck_detection_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

WFO-03

WFO-03 — Idempotency & Concurrency
Model (keys, locking, ordering)
Header Block
● template_id: WFO-03
● title: Idempotency & Concurrency Model (keys, locking, ordering)
● type: workflow_orchestration_design
● template_version: 1.0.0
● output_path: 10_app/workflows/WFO-03_Idempotency_Concurrency_Model.md
● compliance_gate_id: TMP-05.PRIMARY.WORKFLOWS
● upstream_dependencies: ["WFO-01", "ERR-05", "DATA-03", "APIG-01"]
● inputs_required: ["WFO-01", "ERR-05", "DATA-03", "APIG-01", "RTM-04",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the system’s idempotency and concurrency rules so retries, parallelism, and multi-device
interactions do not create duplicate side eff

## 6. Rules

- Retries must be bounded and follow ERR-05 profiles.
- Compensation must be explicit for multi-step workflows with side effects.
- State transitions must be deterministic; no ambiguous “maybe” states.
- Stuck detection must be measurable and alertable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Global Workflow States (required)`
2. `## state`
3. `## meaning`
4. `## entry_conditions`
5. `## exit_conditions`
6. `## queued`
7. `## running`
8. `## waiting`
9. `## failed`
10. `## cancelled`

## 8. Cross-References

- Upstream: {{xref:ERR-05}} | OPTIONAL, {{xref:RELIA-02}} | OPTIONAL
- Downstream: {{xref:WFO-05}} | OPTIONAL, {{xref:OPS-06}} | OPTIONAL, {{xref:IRP-*}} |
- OPTIONAL
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
