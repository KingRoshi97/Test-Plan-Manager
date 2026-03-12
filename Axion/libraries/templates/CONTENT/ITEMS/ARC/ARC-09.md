# ARC-09 — Cross-Cutting Concerns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-09                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cross-cutting concerns    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Cross-Cutting Concerns Document                         |

## 2. Purpose

Define how cross-cutting concerns are applied consistently across all boundaries: observability
(logs/metrics/traces), rate limiting/abuse controls touchpoints, caching strategy touchpoints, and
global policies that must not vary by service without explicit exception.

## 3. Inputs Required

- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● ARC-02: {{xref:ARC-02}} | OPTIONAL
- ● OBS-01: {{xref:OBS-01}} | OPTIONAL
- ● OBS-03: {{xref:OBS-03}} | OPTIONAL
- ● ERR-06: {{xref:ERR-06}} | OPTIONAL
- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● RLIM-01: {{xref:RLIM-01}} | OPTIONAL
- ● CACHE-01: {{xref:CACHE-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each category:        | spec         | Yes             |
| ○ canonical policy sta... | spec         | Yes             |
| ○ required fields or b... | spec         | Yes             |
| ○ enforcement points (... | spec         | Yes             |
| ○ exceptions policy (h... | spec         | Yes             |
| Boundary touchpoints m... | spec         | Yes             |
| PII redaction rule for... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Cost controls (sampling, retention) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Observability fields must be consistent across services (define minimum set).
- Correlation/trace IDs must propagate across all hops including async boundaries.
- Rate limiting must be enforceable at a deterministic point (edge/gateway preferred).
- Caching must not violate correctness or authorization; never cache privileged data
- **without scope keys.**
- Any exception must be documented with rationale and owner.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Canonical Policies (required)`
2. `## conc`
3. `## ern`
4. `## policy`
5. `## enforcement_p`
6. `## oints`
7. `## required_field`
8. `## s_or_rules`
9. `## exceptions_all`
10. `## owed`

## 8. Cross-References

- Upstream: {{xref:OBS-01}} | OPTIONAL, {{xref:OBS-03}} | OPTIONAL, {{xref:ERR-06}} |
- **OPTIONAL, {{xref:APIG-01}} | OPTIONAL**
- Downstream: {{xref:OPS-05}} | OPTIONAL, {{xref:OBS-04}} | OPTIONAL,
- **{{xref:PERF-*}} | OPTIONAL, {{xref:QA-04}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
