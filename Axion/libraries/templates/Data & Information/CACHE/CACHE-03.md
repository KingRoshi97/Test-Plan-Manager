# CACHE-03 — Consistency Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CACHE-03                                             |
| Template Type     | Data / Caching                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring consistency model    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Consistency Model Document                         |

## 2. Purpose

Define the canonical consistency guarantees for cached and read-model data: which parts of
the system must be strongly consistent, which can be eventually consistent, and where
stale-while-revalidate (SWR) is allowed. This aligns backend behavior with UX expectations and
prevents “mystery staleness.”

## 3. Inputs Required

- ● DATA-07: {{xref:DATA-07}} | OPTIONAL
- ● DATA-08: {{xref:DATA-08}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● DES-05: {{xref:DES-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Consistency modes definitions:
○ strong
○ eventual
○ stale-while-revalidate (SWR)
● Consistency requirements by domain surface (minimum 12 entries):
○ surface/operation (screen_id/endpoint_id/read_model_id/cache_id)
○ consistency mode
○ maximum staleness (if not strong)
○ user-visible behavior (loading/stale badge/retry)
○ reconciliation behavior (when fresh data arrives)
○ reason_code/UX mapping pointer (ERR/DES/CDX) | OPTIONAL
● Default consistency stance (system-wide)
● Exceptions policy (when strong is mandatory)

## 5. Optional Fields

● Multi-region notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Any operation that changes money, permissions, or critical state should default to strong
- **consistency unless explicitly justified.**
- SWR must specify UI behavior and max staleness.
- Eventual consistency must specify convergence path (what triggers revalidation).
- Consistency definitions must be used by CACHE-01 candidates and DATA-07 read
- **models.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Mode Definitions (required)`
2. `## 2) Consistency Requirements Matrix (canonical)`
3. `## target`
4. `## kind`
5. `## (screen/endpoint`
6. `## /read_model/cac`
7. `## he)`
8. `## mode`
9. `## max_stale`
10. `## ness`

## 8. Cross-References

- Upstream: {{xref:DATA-07}} | OPTIONAL, {{xref:DES-05}} | OPTIONAL, {{xref:ERR-05}} |
- OPTIONAL
- Downstream: {{xref:CACHE-01}}, {{xref:CACHE-02}} | OPTIONAL, {{xref:CACHE-06}} |
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
