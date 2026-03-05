# DATA-02 — Relationship Map (ERD text

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-02                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring relationship map (erd text    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Relationship Map (ERD text Document                         |

## 2. Purpose

Define the canonical entity relationships (ERD in text form): cardinality, foreign keys, ownership,
cascade behaviors, and relationship invariants. This is the authoritative relationship reference
for DB schema and API expansions.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DMG-02: {{xref:DMG-02}} | OPTIONAL
- ● DMG-03: {{xref:DMG-03}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Relationship list (minimum 12 for non-trivial products; justify if smaller)
● For each relationship:
○ rel_id
○ from_entity_id
○ to_entity_id
○ relationship_type (1:1, 1:N, N:M)
○ fk_field (from → to)
○ requiredness (required/optional)
○ ownership (which entity owns lifecycle)
○ cascade policy (delete/update)
○ referential integrity rule (db enforced vs app enforced)
○ invariants (must hold)
○ notes on query patterns (common joins) | OPTIONAL
● N:M join table specs (if any): join_entity_id + keys

## 5. Optional Fields

● Diagram pointer | OPTIONAL
● Notes | OPTIONAL

Rules
● All entity_ids must exist in DATA-01.
● Relationship cardinality must be explicit.
● Cascade policies must align with lifecycle rules (DLR) and privacy deletion constraints
(DGP).
● N:M must define join table explicitly (no implicit many-to-many).

Output Format
1) Relationship Registry (canonical)
r
e
l
_
i
d

from_
entity

to_e
ntity

type

fk_fi
eld

require
d

owner

cascad
e

enforce
ment

invaria
nts

notes

r
e
l
_
0
1

{{rels[
0].fro
m}}

{{rel
s[0].t
o}}

{{rels[
0].typ
e}}

{{rels {{rels[0]
[0].fk .require
}}
d}}

{{rels[
0].own
er}}

{{rels[0] {{rels[0].e
.casca nforceme
de}}
nt}}

{{rels[0]. {{rels[
invariant 0].not
s}}
es}}

r
e
l
_
0
2

{{rels[
1].fro
m}}

{{rel
s[1].t
o}}

{{rels[
1].typ
e}}

{{rels {{rels[1]
[1].fk .require
}}
d}}

{{rels[
1].own
er}}

{{rels[1] {{rels[1].e
.casca nforceme
de}}
nt}}

{{rels[1]. {{rels[
invariant 1].not
s}}
es}}

2) N:M Join Tables (required if any)
join_e
ntity_i
d

left_ent
ity

right_en
tity

left_fk

right_fk

unique_r
ule

cascade

notes

{{joins[
0].id}}

{{joins[0
].left}}

{{joins[0].
right}}

{{joins[0].l
eft_fk}}

{{joins[0].ri
ght_fk}}

{{joins[0].u {{joins[0].c
nique}}
ascade}}

{{joins[0].
notes}}

3) Integrity Constraints Summary (required)
● Must-enforce-in-DB list: {{integrity.db_enforced}}
● App-enforced exceptions (if any): {{integrity.app_enforced}} | OPTIONAL

Cross-References
● Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL
● Downstream: {{xref:DATA-03}}, {{xref:DATA-04}} | OPTIONAL, {{xref:API-02}} |
OPTIONAL
● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Relationship registry with type and fk fields.
● intermediate: Required. Add cascade and enforcement rules.
● advanced: Required. Add invariants and join table specs.

Unknown Handling
● UNKNOWN_ALLOWED: diagram_pointer, notes, query_patterns
● If any relationship references an unknown entity_id → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.DATA

● Pass conditions:
○ required_fields_present == true
○ relationships_count >= 12 (or justified)
○ all_entity_refs_exist == true
○ cardinality_defined == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

DATA-03

DATA-03 — Persistence Rules (indexes,
constraints)
Header Block
● template_id: DATA-03
● title: Persistence Rules (indexes, constraints)
● type: data_model_schema
● template_version: 1.0.0
● output_path: 10_app/data/DATA-03_Persistence_Rules.md
● compliance_gate_id: TMP-05.PRIMARY.DATA
● upstream_dependencies: ["DATA-01", "DATA-02", "DQV-01"]
● inputs_required: ["DATA-01", "DATA-02", "DQV-01", "SRCH-03", "CACHE-03",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the persistence-layer rules: indexes, uniqueness constraints, foreign key enforcement,
nullability rules, and other DB constraints required to enforce correctness and performance. This
makes persistence deterministic and aligned to query/search/caching needs.

Inputs Required
● DATA-01: {{xref:DATA-01}} | OPTIONAL
● DATA-02: {{xref:DATA-02}} | OPTIONAL
● DQV-01: {{xref:DQV-01}} | OPTIONAL

● SRCH-03: {{xref:SRCH-03}} | OPTIONAL
● CACHE-03: {{xref:CACHE-03}} | OPTIONAL
● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Constraint catalog (minimum 20 for no

## 6. Rules

- All entity_ids must exist in DATA-01.
- Relationship cardinality must be explicit.
- Cascade policies must align with lifecycle rules (DLR) and privacy deletion constraints
- **(DGP).**
- N:M must define join table explicitly (no implicit many-to-many).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Relationship Registry (canonical)`
2. `## from_`
3. `## entity`
4. `## to_e`
5. `## ntity`
6. `## type`
7. `## fk_fi`
8. `## eld`
9. `## require`
10. `## owner`

## 8. Cross-References

- Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL
- Downstream: {{xref:DATA-03}}, {{xref:DATA-04}} | OPTIONAL, {{xref:API-02}} |
- OPTIONAL
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
