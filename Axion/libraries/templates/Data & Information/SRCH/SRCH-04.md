# SRCH-04 — Search Result Quality Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SRCH-04                                             |
| Template Type     | Data / Search                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring search result quality rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Search Result Quality Rules Document                         |

## 2. Purpose

Define the quality rules and guardrails for search results: relevance expectations, freshness
constraints, deduplication, pagination stability, and minimum quality thresholds. This makes
search quality measurable and prevents regressions.

## 3. Inputs Required

- ● SRCH-02: {{xref:SRCH-02}} | OPTIONAL
- ● SRCH-03: {{xref:SRCH-03}} | OPTIONAL
- ● DISC-04: {{xref:DISC-04}} | OPTIONAL
- ● PERF-01: {{xref:PERF-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Applicability (true/false). If false, mark N/A.
● Quality dimensions:
○ relevance
○ freshness
○ dedupe
○ stability (no flicker)
● Rules catalog (minimum 15 rules)
● For each rule:
○ qrule_id
○ dimension
○ statement
○ metric/measurement method
○ threshold/target
○ failure action (alert/block release)
○ owner
● Dedupe policy (what counts as duplicate)
● Freshness policy per surface (time windows)
● Verification checklist

Optional Fields
● Human evaluation rubric | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● Every rule must be measurable with a metric or eval method.
● Freshness rules must align with index update targets (SRCH-03).
● Dedupe must be deterministic; define tie-breaker order.

Output Format
1) Applicability
● applies: {{quality.applies}} (true/false)
● 00_NA (if not applies): {{quality.na_block}} | OPTIONAL

2) Quality Rules Catalog (canonical)
qrul
e_id

dimensi
on

stateme
nt

measurem
ent

threshold

failure_ac
tion

owner

notes

q_0
1

{{rules[0]
.dim}}

{{rules[0]. {{rules[0].m
stmt}}
easure}}

{{rules[0].thr
eshold}}

{{rules[0].
action}}

{{rules[0].
owner}}

{{rules[0].
notes}}

q_0
2

{{rules[1]
.dim}}

{{rules[1]. {{rules[1].m
stmt}}
easure}}

{{rules[1].thr
eshold}}

{{rules[1].
action}}

{{rules[1].
owner}}

{{rules[1].
notes}}

3) Dedupe Policy (required if applies)
● Duplicate definition: {{dedupe.definition}}

● Tie-breaker order: {{dedupe.tiebreaker}}
● Scope (within page/within query): {{dedupe.scope}} | OPTIONAL

4) Freshness Policy (required if applies)
surface_id

max_staleness

notes

{{freshness[0].surface}}

{{freshness[0].max_staleness}}

{{freshness[0].notes}}

5) Verification Checklist (required if applies)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References
● Upstream: {{xref:SRCH-03}} | OPTIONAL, {{xref:DISC-04}} | OPTIONAL
● Downstream: {{xref:SRCH-06}} | OPTIONAL, {{xref:QA-04}} | OPTIONAL, {{xref:ALRT-*}}
| OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Not required.
● intermediate: Required if applies. Rules + dedupe + freshness per surface.
● advanced: Required if applies. Add measurement methods and failure actions rigor.

Unknown Handling

● UNKNOWN_ALLOWED: human_eval_rubric, notes, freshness_notes
● If applies == true and thresholds are UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.SRCH
● Pass conditions:
○ required_fields_present == true
○ if_applies_then_rules_count >= 15
○ measurement_defined == true
○ thresholds_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

SRCH-05

SRCH-05 — Search Abuse Controls
(gaming, spam, limits)
Header Block
● template_id: SRCH-05
● title: Search Abuse Controls (gaming, spam, limits)
● type: search_indexing
● template_version: 1.0.0
● output_path: 10_app/search/SRCH-05_Search_Abuse_Controls.md
● compliance_gate_id: TMP-05.PRIMARY.SRCH
● upstream_dependencies: ["SRCH-02", "TNS-01", "RLIM-01"]
● inputs_required: ["SRCH-02", "TNS-01", "RLIM-01", "DISC-05", "OBS-04",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define how search is protected against abuse: query spam, scraping, ranking manipulation,
keyword stuffing, and other gaming. This covers rate limits, detection heuristics, enforcement
actions, and moderation hooks.

Inputs Required
● SRCH-02: {{xref:SRCH-02}} | OPTIONAL
● TNS-01: {{xref:TNS-01}} | OPTIONAL
● RLIM-01: {{xref:RLIM-01}} | OPTIONAL

● DISC-05: {{xref:DISC-05}} | OPTIONAL
● OBS-04: {{xref:OBS-04}} | OPTIONAL
● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Abuse threat list (minimum 10 threats)
● Controls catalog (minimum 12 controls)
● For each control:
○ ctrl

## 5. Optional Fields

● Human evaluation rubric | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(relevance, freshness, dedupe)**
- **Header Block**
- template_id: SRCH-04
- title: Search Result Quality Rules (relevance, freshness, dedupe)
- type: search_indexing
- template_version: 1.0.0
- output_path: 10_app/search/SRCH-04_Search_Result_Quality_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.SRCH
- upstream_dependencies: ["SRCH-02", "SRCH-03", "DISC-04"]
- inputs_required: ["SRCH-02", "SRCH-03", "DISC-04", "PERF-01",
- **"STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the quality rules and guardrails for search results: relevance expectations, freshness**
- **constraints, deduplication, pagination stability, and minimum quality thresholds. This makes**
- **search quality measurable and prevents regressions.**
- **Inputs Required**
- SRCH-02: {{xref:SRCH-02}} | OPTIONAL
- SRCH-03: {{xref:SRCH-03}} | OPTIONAL
- DISC-04: {{xref:DISC-04}} | OPTIONAL
- PERF-01: {{xref:PERF-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Applicability (true/false). If false, mark N/A.
- Quality dimensions:
- **○ relevance**
- **○ freshness**
- **○ dedupe**
- **○ stability (no flicker)**
- Rules catalog (minimum 15 rules)
- For each rule:
- **○ qrule_id**
- **○ dimension**
- **○ statement**
- **○ metric/measurement method**
- **○ threshold/target**
- **○ failure action (alert/block release)**
- **○ owner**
- Dedupe policy (what counts as duplicate)
- Freshness policy per surface (time windows)
- Verification checklist
- **Optional Fields**
- Human evaluation rubric | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- If applies == false, include 00_NA block only.
- Every rule must be measurable with a metric or eval method.
- Freshness rules must align with index update targets (SRCH-03).
- Dedupe must be deterministic; define tie-breaker order.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Quality Rules Catalog (canonical)`
3. `## qrul`
4. `## e_id`
5. `## dimensi`
6. `## stateme`
7. `## measurem`
8. `## ent`
9. `## threshold`
10. `## failure_ac`

## 8. Cross-References

- Upstream: {{xref:SRCH-03}} | OPTIONAL, {{xref:DISC-04}} | OPTIONAL
- Downstream: {{xref:SRCH-06}} | OPTIONAL, {{xref:QA-04}} | OPTIONAL, {{xref:ALRT-*}}
- | OPTIONAL
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
