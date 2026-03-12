# DATA-03 — Persistence Rules (indexes,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-03                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring persistence rules (indexes,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Persistence Rules (indexes, Document                         |

## 2. Purpose

Define the persistence-layer rules: indexes, uniqueness constraints, foreign key enforcement,
nullability rules, and other DB constraints required to enforce correctness and performance. This
makes persistence deterministic and aligned to query/search/caching needs.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DATA-02: {{xref:DATA-02}} | OPTIONAL
- ● DQV-01: {{xref:DQV-01}} | OPTIONAL
- ● SRCH-03: {{xref:SRCH-03}} | OPTIONAL
- ● CACHE-03: {{xref:CACHE-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Constraint catalog (minimum 20 for non-trivial products; justify if smaller)
● Index catalog (minimum 15; justify if smaller)
● For each constraint:
○ con_id
○ entity_id/table
○ type (pk/unique/fk/check/not_null)
○ definition (fields + predicate)
○ enforcement (db/app)
○ rationale (correctness/perf/security)
○ related invariants (DMG-03 pointer) | OPTIONAL
● For each index:
○ idx_id
○ entity_id/table
○ fields
○ type (btree/hash/gin/etc)
○ uniqueness (true/false)
○ query pattern supported

○ write impact note (high/med/low)
○ maintenance notes | OPTIONAL

## 5. Optional Fields

● Partitioning policy | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Constraints enforce truth; app-only enforcement must be justified.
- Indexes must be tied to real query/search patterns (SRCH/CACHE/API usage).
- Avoid redundant indexes; include write impact note.
- Foreign keys should be DB-enforced unless explicitly incompatible with scale/topology.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Constraints Catalog (canonical)`
2. `## entity`
3. `## type`
4. `## definition`
5. `## enforceme`
6. `## rationale`
7. `## invariant_re`
8. `## notes`
9. `## nts[0].ent`
10. `## ity}}`

## 8. Cross-References

- Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:DATA-02}} | OPTIONAL
- Downstream: {{xref:DATA-04}} | OPTIONAL, {{xref:SRCH-03}} | OPTIONAL,
- **{{xref:CACHE-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
