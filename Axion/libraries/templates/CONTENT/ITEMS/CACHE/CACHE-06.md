# CACHE-06 — Cache Failure Behavior

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CACHE-06                                             |
| Template Type     | Data / Caching                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cache failure behavior    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Cache Failure Behavior Document                         |

## 2. Purpose

Define what happens when caches fail or misbehave: cache outages, high miss rates, stale
data, stampedes, and partial invalidation failures. This specifies deterministic fallback paths and
UX degradation behavior.

## 3. Inputs Required

- ● CACHE-01: {{xref:CACHE-01}} | OPTIONAL
- ● CACHE-02: {{xref:CACHE-02}} | OPTIONAL
- ● CACHE-03: {{xref:CACHE-03}} | OPTIONAL
- ● RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● DES-07: {{xref:DES-07}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Failure mode catalog (... | spec         | Yes             |
| For each failure mode:    | spec         | Yes             |
| ○ fail_id                 | spec         | Yes             |
| ○ cache layer affected... | spec         | Yes             |
| ○ detection signal (ti... | spec         | Yes             |
| ○ expected behavior:      | spec         | Yes             |
| ■ fail open vs fail cl... | spec         | Yes             |
| ■ fallback source (DB/... | spec         | Yes             |
| ■ max staleness allowed   | spec         | Yes             |
| ○ user-visible behavio... | spec         | Yes             |
| ○ retry/backoff rules ... | spec         | Yes             |
| ○ circuit breaker rule... | spec         | Yes             |

## 5. Optional Fields

● Emergency disable switch policy | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Failure behaviors must align with CACHE-03 consistency requirements.
- Avoid cascading failures: do not hammer DB when cache is down without throttling.
- User-visible behavior must be defined for any user-facing impact.
- “Fail open” must not leak data; enforce auth in fallback path.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Failure Modes (canonical)`
2. `## fail_`
3. `## layer`
4. `## detect`
5. `## ion`
6. `## behavi`
7. `## fallbac`
8. `## k_sour`
9. `## max_st`
10. `## alenes`

## 8. Cross-References

- Upstream: {{xref:CACHE-03}} | OPTIONAL, {{xref:RELIA-01}} | OPTIONAL,
- **{{xref:DES-07}} | OPTIONAL**
- Downstream: {{xref:ALRT-}} | OPTIONAL, {{xref:IRP-}} | OPTIONAL, {{xref:PERF-03}} |
- OPTIONAL
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
