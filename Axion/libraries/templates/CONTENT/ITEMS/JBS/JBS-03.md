# JBS-03 — Scheduling Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-03                                             |
| Template Type     | Build / Background Jobs                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring scheduling rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Scheduling Rules Document                         |

## 2. Purpose

Define deterministic scheduling rules for all jobs: cron policies, event-driven dispatch rules,
environment enablement, timezone handling, and safety constraints to prevent runaway
schedules.

## 3. Inputs Required

- ● JBS-01: {{xref:JBS-01}} | OPTIONAL
- ● WFO-04: {{xref:WFO-04}} | OPTIONAL
- ● ENV-01: {{xref:ENV-01}} | OPTIONAL
- ● RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Scheduling posture:       | spec         | Yes             |
| ○ timezone standard (U... | spec         | Yes             |
| Environment enablement... | spec         | Yes             |
| ○ dev/stage/prod policy   | spec         | Yes             |
| ○ default-on vs defaul... | spec         | Yes             |
| Cron safety rules:        | spec         | Yes             |
| ○ minimum interval all... | spec         | Yes             |
| ○ approval requirement... | spec         | Yes             |
| ○ blackout windows (if... | spec         | Yes             |
| Dispatch rules:           | spec         | Yes             |
| ○ dedupe on dispatch p... | spec         | Yes             |
| ○ concurrency caps per... | spec         | Yes             |

## 5. Optional Fields

● Maintenance window policy | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(cron/event-driven, env enablement)**
- **Header Block**
- template_id: JBS-03
- title: Scheduling Rules (cron/event-driven, env enablement)
- type: background_jobs_scheduling
- template_version: 1.0.0
- output_path: 10_app/jobs/JBS-03_Scheduling_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.JBS
- upstream_dependencies: ["JBS-01", "WFO-04", "ENV-01"]
- inputs_required: ["JBS-01", "WFO-04", "ENV-01", "RELIA-01", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define deterministic scheduling rules for all jobs: cron policies, event-driven dispatch rules,**
- **environment enablement, timezone handling, and safety constraints to prevent runaway**
- **schedules.**
- **Inputs Required**
- JBS-01: {{xref:JBS-01}} | OPTIONAL
- WFO-04: {{xref:WFO-04}} | OPTIONAL
- ENV-01: {{xref:ENV-01}} | OPTIONAL
- RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Scheduling posture:
- **○ supported schedule types (cron, fixed-delay, event-driven)**
- **○ timezone standard (UTC default or explicit)**
- Environment enablement rules:
- **○ dev/stage/prod policy**
- **○ default-on vs default-off policy**
- Cron safety rules:
- **○ minimum interval allowed**
- **○ approval requirements for high frequency**
- **○ blackout windows (if any)**
- Dispatch rules:
- **○ dedupe on dispatch policy**
- **○ concurrency caps per job**
- Per-job schedule bindings (minimum 10):
- **○ job_id**
- **○ schedule type**
- **○ schedule expression (cron or trigger)**
- **○ timezone**
- **○ env enablement**
- **○ safety notes**
- Verification checklist
- **Optional Fields**
- Maintenance window policy | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Schedules must be explicit and valid; no ambiguous natural language.
- All scheduled jobs must define timezone.
- High-frequency schedules require explicit approval and observability.
- Event-driven jobs must define dedupe keys for dispatch.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Global Scheduling Rules (required)`
2. `## 2) Cron Safety Rules (required)`
3. `## 3) Dispatch Rules (required)`
4. `## 4) Job Schedule Bindings (canonical)`
5. `## job_id`
6. `## schedule_`
7. `## type`
8. `## expressio`
9. `## n/trigger`
10. `## timezone`

## 8. Cross-References

- Upstream: {{xref:ENV-01}} | OPTIONAL, {{xref:WFO-04}} | OPTIONAL
- Downstream: {{xref:JBS-04}}, {{xref:JBS-06}} | OPTIONAL, {{xref:ALRT-*}} | OPTIONAL
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
