# SIC-05 — Integration Failure Modes &

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIC-05                                             |
| Template Type     | Architecture / Interfaces                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring integration failure modes &    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Integration Failure Modes & Document                         |

## 2. Purpose

Define the deterministic failure handling model for integrations: what can fail, how we detect it,
how we retry, when we stop, what goes to DLQ/quarantine, and what user/system fallbacks
apply. This ensures integrations fail safely and recover predictably.

## 3. Inputs Required

- ● SIC-01: {{xref:SIC-01}} | OPTIONAL
- ● SIC-02: {{xref:SIC-02}} | OPTIONAL
- ● SIC-03: {{xref:SIC-03}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- ● OBS-04: {{xref:OBS-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Failure mode catalog (... | spec         | Yes             |
| For each failure mode:    | spec         | Yes             |
| ○ fail_id                 | spec         | Yes             |
| ○ interface_id            | spec         | Yes             |
| ○ operation (endpoint/... | spec         | Yes             |
| ○ detection method (st... | spec         | Yes             |
| ○ classification (tran... | spec         | Yes             |
| ○ retry policy (none/i... | spec         | Yes             |
| ○ max attempts            | spec         | Yes             |
| ○ idempotency requirem... | spec         | Yes             |
| ○ DLQ/quarantine rule     | spec         | Yes             |
| ○ fallback behavior (s... | spec         | Yes             |

## 5. Optional Fields

● Vendor escalation runbook pointer | OPTIONAL
● Manual backfill/reconciliation steps | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Transient failures must use bounded backoff; never infinite retry.
- Permanent failures must not retry; must quarantine or reject deterministically.
- Any retryable operation must be idempotent (define key).
- DLQ entries must be re-drivable with safety checks.
- User-facing fallbacks must align with DES-07/CDX-04 when applicable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Failure Modes Catalog (canonical)`
2. `## f interf oper fail`
3. `## a ace_i atio ure`
4. `## _ty`
5. `## dete`
6. `## ctio`
7. `## cla`
8. `## att`
9. `## pts`
10. `## idem`

## 8. Cross-References

- Upstream: {{xref:SIC-02}} | OPTIONAL, {{xref:SIC-03}} | OPTIONAL, {{xref:ERR-05}} |
- OPTIONAL
- Downstream: {{xref:OPS-06}} | OPTIONAL, {{xref:IRP-*}} | OPTIONAL, {{xref:QA-04}} |
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
