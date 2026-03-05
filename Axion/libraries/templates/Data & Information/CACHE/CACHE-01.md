# CACHE-01 — Caching Strategy (what to

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CACHE-01                                             |
| Template Type     | Data / Caching                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring caching strategy (what to    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Caching Strategy (what to Document                         |

## 2. Purpose

Define the caching strategy: what is cached (data and responses), where caches live
(client/server/CDN/edge/redis), why caching is needed, and what the allowed cache patterns
are.

## 3. Inputs Required

- ● DATA-07: {{xref:DATA-07}} | OPTIONAL
- ● SRCH-01: {{xref:SRCH-01}} | OPTIONAL
- ● PERF-01: {{xref:PERF-01}} | OPTIONAL
- ● COST-01: {{xref:COST-01}} | OPTIONAL
- ● CACHE-03: {{xref:CACHE-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Cache layers inventory... | spec         | Yes             |
| Cache candidates catal... | spec         | Yes             |
| For each candidate:       | spec         | Yes             |
| ○ cache_id                | spec         | Yes             |
| ○ data/resource cached... | spec         | Yes             |
| ○ cache layer(s)          | spec         | Yes             |
| ○ key pattern (determi... | spec         | Yes             |
| ○ TTL (or SWR policy)     | spec         | Yes             |
| ○ invalidation trigger... | spec         | Yes             |
| ○ sensitivity/PII cons... | spec         | Yes             |
| ○ consistency requirem... | spec         | Yes             |
| ○ expected benefit (la... | spec         | Yes             |

## 5. Optional Fields

● Cache warming strategy | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Cache keys must be deterministic and scoped (tenant/user where needed).
- Do not cache sensitive data without explicit policy and encryption/segmentation.
- Every cache entry must have TTL or invalidation; never “forever cache.”
- Cache candidates must map to data access patterns (DATA-08) and consistency model
- **(CACHE-03).**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Cache Layers (required)`
2. `## layer`
3. `## location`
4. `## typical_use`
5. `## notes`
6. `## client`
7. `## serve`
8. `## edge`
9. `## 2) Cache Candidates (canonical)`
10. `## cache`

## 8. Cross-References

- Upstream: {{xref:CACHE-03}} | OPTIONAL, {{xref:DATA-07}} | OPTIONAL
- Downstream: {{xref:CACHE-02}}, {{xref:CACHE-06}} | OPTIONAL, {{xref:OBS-02}} |
- OPTIONAL
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
