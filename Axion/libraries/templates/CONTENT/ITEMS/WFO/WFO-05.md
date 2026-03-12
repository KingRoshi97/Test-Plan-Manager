# WFO-05 — Failure Handling (DLQ, backoff,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WFO-05                                             |
| Template Type     | Architecture / Workflow                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring failure handling (dlq, backoff,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Failure Handling (DLQ, backoff, Document                         |

## 2. Purpose

Define deterministic failure handling for workflows: retry/backoff profiles, DLQ/quarantine rules,
poison message detection, alerting/escalation, and safe re-drive procedures. This prevents
infinite retries, hidden failures, and unsafe manual fixes.

## 3. Inputs Required

- ● WFO-01: {{xref:WFO-01}} | OPTIONAL
- ● WFO-02: {{xref:WFO-02}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- ● OBS-04: {{xref:OBS-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Failure mode catalog f... | spec         | Yes             |
| For each failure mode:    | spec         | Yes             |
| ○ fail_id                 | spec         | Yes             |
| ○ wf_id or workflow_type  | spec         | Yes             |
| ○ classification (tran... | spec         | Yes             |
| ○ retry behavior (prof... | spec         | Yes             |
| ○ DLQ/quarantine rule     | spec         | Yes             |
| ○ poison detection rul... | spec         | Yes             |
| ○ alerting severity + ... | spec         | Yes             |
| ○ manual intervention ... | spec         | Yes             |
| ○ reason_code mapping ... | spec         | Yes             |
| Default backoff profil... | spec         | Yes             |

## 5. Optional Fields

● Auto-remediation rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Transient failures retry with bounded backoff.
- Permanent failures never retry; they quarantine/DLQ.
- Poison messages must be detected and quarantined early.
- Re-drive must be safe: require idempotency keys and validation checks.
- Alerting must be deterministic and tied to thresholds.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Failure Modes (canonical)`
2. `## fai`
3. `## l_i`
4. `## wf_i`
5. `## failu`
6. `## re_t`
7. `## ype`
8. `## clas`
9. `## retry`
10. `## _pro`

## 8. Cross-References

- {{fai {{fails
- ls[1] [1].n
- .rc}} otes}
- }
- Upstream: {{xref:ERR-05}} | OPTIONAL, {{xref:RELIA-01}} | OPTIONAL
- Downstream: {{xref:OPS-06}} | OPTIONAL, {{xref:IRP-01}} | OPTIONAL,
- **{{xref:RELIA-05}} | OPTIONAL**
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
