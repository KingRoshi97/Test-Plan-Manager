# CACHE-02 — Invalidation Rules (events,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CACHE-02                                             |
| Template Type     | Data / Caching                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring invalidation rules (events,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Invalidation Rules (events, Document                         |

## 2. Purpose

Define deterministic cache invalidation: what events or conditions invalidate what keys, TTL
policies, busting strategies, and safe fallback behavior. This prevents stale data bugs and
inconsistent cache behavior across layers.

## 3. Inputs Required

- ● CACHE-01: {{xref:CACHE-01}} | OPTIONAL
- ● EVT-01: {{xref:EVT-01}} | OPTIONAL
- ● WFO-01: {{xref:WFO-01}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Invalidation policy (g... | spec         | Yes             |
| Invalidation rule cata... | spec         | Yes             |
| For each rule:            | spec         | Yes             |
| ○ inv_id                  | spec         | Yes             |
| ○ cache_id (from CACHE... | spec         | Yes             |
| ○ trigger (event/entit... | spec         | Yes             |
| ○ keys affected (pattern) | spec         | Yes             |
| ○ propagation scope (c... | spec         | Yes             |
| ○ execution mode (sync... | spec         | Yes             |
| ○ delay tolerance (max... | spec         | Yes             |
| ○ failure handling (re... | spec         | Yes             |
| ○ observability signal... | spec         | Yes             |

## 5. Optional Fields

● Cache stampede mitigation rules | OPTIONAL
● Notes | OPTIONAL

Rules
● Every cache candidate must have at least one invalidation rule OR explicit TTL-only
policy.
● Invalidation triggers must map to real mutations/events (EVT) or workflow steps (WFO).
● Propagation must be defined across layers; no “invalidate somewhere.”
● Failure handling must avoid stale-for-ever.

Output Format
1) Global Policy (required)
● Default invalidation stance: {{policy.default}}
● TTL-only allowed when: {{policy.ttl_only_allowed}}
● Max staleness default: {{policy.max_staleness_default}} | OPTIONAL

2) Invalidation Rules (canonical)
in
v
_i
d

cache_i
d

trigger

keys_
affect
ed

scope

mode

max_sta
leness

failure_
handlin
g

obs

in
v
_
0
1

{{rules[0]
.cache_i
d}}

{{rules[0 {{rules[ {{rules[
].trigger 0].keys 0].scop
}}
}}
e}}

{{rules[
0].mod
e}}

{{rules[0]
.stalenes
s}}

{{rules[
0].failur
e}}

{{rules {{rules[
[0].obs 0].note
}}
s}}

in
v
_
0
2

{{rules[1]
.cache_i
d}}

{{rules[1 {{rules[ {{rules[
].trigger 1].keys 1].scop
}}
}}
e}}

{{rules[
1].mod
e}}

{{rules[1]
.stalenes
s}}

{{rules[
1].failur
e}}

{{rules {{rules[
[1].obs 1].note
}}
s}}

3) Hard Bust Policy (required)

notes

● When allowed: {{hard_bust.when}}
● Who can do it: {{hard_bust.who}}
● Required audit event: {{hard_bust.audit_event}} | OPTIONAL
● Safety checks: {{hard_bust.safety_checks}} | OPTIONAL

4) Verification Checklist (required)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References
● Upstream: {{xref:CACHE-01}} | OPTIONAL, {{xref:EVT-01}} | OPTIONAL,
{{xref:WFO-01}} | OPTIONAL
● Downstream: {{xref:CACHE-06}} | OPTIONAL, {{xref:OBS-04}} | OPTIONAL,
{{xref:QA-04}} | OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Global policy + rule catalog structure.
● intermediate: Required. Add propagation scope and max staleness.
● advanced: Required. Add failure handling and hard-bust governance.

Unknown Handling

● UNKNOWN_ALLOWED: stampede_mitigation, notes, audit_event (if not wired
yet but must be planned)
● If any cache_id has no invalidation rule and no TTL-only justification → block
Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.CACHE
● Pass conditions:
○ required_fields_present == true
○ rules_count >= 15
○ every_cache_has_invalidation_or_ttl_only == true
○ hard_bust_policy_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

CACHE-03

CACHE-03 — Consistency Model
(strong/eventual/stale-while-revalidate)
Header Block
● template_id: CACHE-03
● title: Consistency Model (strong/eventual/stale-while-revalidate)
● type: caching_data_access_patterns
● template_version: 1.0.0
● output_path: 10_app/caching/CACHE-03_Consistency_Model.md
● compliance_gate_id: TMP-05.PRIMARY.CACHE
● upstream_dependencies: ["DATA-07", "DATA-08", "ERR-05", "DES-05"]
● inputs_required: ["DATA-07", "DATA-08", "ERR-05", "DES-05", "STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define the canonical consistency guarantees for cached and read-model data: which parts of
the system must be strongly consistent, which can be eventually consistent, and where
stale-while-revalidate (SWR) is allowed. This aligns backend behavior with UX expectations and
prevents “mystery stalenes

## 6. Rules

- Every cache candidate must have at least one invalidation rule OR explicit TTL-only
- **policy.**
- Invalidation triggers must map to real mutations/events (EVT) or workflow steps (WFO).
- Propagation must be defined across layers; no “invalidate somewhere.”
- Failure handling must avoid stale-for-ever.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Global Policy (required)`
2. `## 2) Invalidation Rules (canonical)`
3. `## cache_i`
4. `## trigger`
5. `## keys_`
6. `## affect`
7. `## scope`
8. `## mode`
9. `## max_sta`
10. `## leness`

## 8. Cross-References

- Upstream: {{xref:CACHE-01}} | OPTIONAL, {{xref:EVT-01}} | OPTIONAL,
- **{{xref:WFO-01}} | OPTIONAL**
- Downstream: {{xref:CACHE-06}} | OPTIONAL, {{xref:OBS-04}} | OPTIONAL,
- **{{xref:QA-04}} | OPTIONAL**
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
