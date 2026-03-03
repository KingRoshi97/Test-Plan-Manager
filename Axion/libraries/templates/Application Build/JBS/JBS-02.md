# JBS-02 — Job Spec (per job: trigger, inputs, outputs, retries)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-02                                             |
| Template Type     | Build / Jobs                                       |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with background jobs                  |
| Filled By         | Internal Agent                                     |
| Consumes          | JBS-01, WFO-01, WFO-04, ERR-05, DATA-01, Standards Index |
| Produces          | Filled Per-Job Spec                                |

## 2. Purpose

Provide the authoritative per-job contract: trigger conditions, input/output schemas, processing steps, retry behavior, idempotency guarantees, concurrency controls, timeout policy, and observability requirements. This is what the build and tests implement for each background job.

## 3. Inputs Required

- JBS-01: `{{xref:JBS-01}}` | OPTIONAL
- WFO-01: `{{xref:WFO-01}}` | OPTIONAL
- WFO-04: `{{xref:WFO-04}}` | OPTIONAL
- ERR-05: `{{xref:ERR-05}}` | OPTIONAL
- DATA-01: `{{xref:DATA-01}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| job_id (must exist in JBS-01)       | JBS-01       | No              |
| job name                            | JBS-01       | No              |
| purpose                             | spec         | No              |
| trigger type + conditions           | spec         | No              |
| input schema (fields/types)         | spec         | No              |
| output schema (fields/types)        | spec         | No              |
| processing steps (ordered)          | spec         | No              |
| retry policy (profile ref)          | ERR-05       | No              |
| max attempts                        | spec         | No              |
| backoff strategy                    | spec         | No              |
| idempotency key definition          | spec         | No              |
| concurrency controls                | spec         | No              |
| timeout policy                      | spec         | No              |
| error handling (failure classes)     | ERR-05       | No              |
| side effects (events/writes)        | spec         | No              |
| observability (log fields/metrics)  | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Priority class              | spec   | Only if applicable               |
| DLQ override rules          | spec   | Per-job DLQ overrides            |
| Feature flag gating         | FFCFG  | Per-env enablement               |
| Resource hints              | spec   | CPU/mem/queue sizing             |
| Examples                    | spec   | Sample inputs/outputs            |
| Notes                       | agent  | Enrichment only, no new truth    |

## 6. Rules

- job_id must exist in JBS-01; do not invent new job IDs.
- Every job MUST define trigger, input schema, output schema, retry policy.
- Retry behavior must reference ERR-05 profiles.
- Idempotency key must be deterministic and stable.
- Side effects must be declared explicitly (events emitted, entities written).

## 7. Output Format

### Required Headings (in order)

1. `## Job Identity` — job_id, name, purpose, owner
2. `## Trigger` — trigger type, conditions, source
3. `## Inputs` — input schema fields, types, sources
4. `## Processing Steps` — ordered steps with descriptions
5. `## Outputs` — output schema fields, types, evidence refs
6. `## Retry Policy` — profile ref, max attempts, backoff, retryable errors
7. `## Idempotency` — key definition, dedup window, conflict behavior
8. `## Concurrency` — scope, max in-flight, locking
9. `## Timeout & SLO` — hard timeout, SLO target
10. `## Error Handling` — failure classes, actions per class
11. `## Side Effects` — events emitted, entities written
12. `## Observability` — correlation IDs, log fields, metrics

## 8. Cross-References

- **Upstream**: JBS-01, WFO-01, ERR-05
- **Downstream**: JBS-04, JBS-05, JBS-06, QA-03
- **Standards**: STD-RELIABILITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Trigger + inputs/outputs             | Required  | Required     | Required |
| Retry + idempotency + concurrency    | Optional  | Required     | Required |
| Observability + SLO + error classes  | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: priority_class, dlq_overrides, feature_flag, resource_hints, examples, notes
- If job_id not found in JBS-01 → block Completeness Gate.
- If retry policy is UNKNOWN → block Completeness Gate.
- If idempotency key is UNKNOWN for write jobs → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] job_id_exists_in_JBS_01 == true
- [ ] trigger_defined == true
- [ ] input_output_schemas_present == true
- [ ] retry_policy_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
