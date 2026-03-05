# OFS-01 — Offline Scope (what works offline)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-01                                             |
| Template Type     | Build / Offline Support                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring offline scope (what works offline)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Offline Scope (what works offline) Document                         |

## 2. Purpose

Define the canonical offline scope: exactly what features/screens/actions work offline, what is
read-only, what is blocked, and what is queued for later sync. This template must be consistent
with offline handling model and offline UX rules and must not invent offline support not present
in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-05 Offline State Handling: {{smd.offline_handling}}
- CER-03 Offline/Error Mode UX: {{cer.offline_ux}} | OPTIONAL
- PRD-06 NFRs: {{prd.nfrs}} | OPTIONAL
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Offline scope statemen... | spec         | Yes             |
| Modes supported (full/... | spec         | Yes             |
| Read behavior rules (c... | spec         | Yes             |
| Write behavior rules (... | spec         | Yes             |
| User messaging rules (... | spec         | Yes             |
| Security constraints (... | spec         | Yes             |
| Open gaps list (what i... | spec         | Yes             |

## 5. Optional Fields

Per-role offline differences | OPTIONAL
Data size constraints | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Offline scope MUST match what is implementable per {{xref:SMD-05}}.
Do not claim offline support for any screen/action not explicitly mapped.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Offline Scope Statement
statement: {{scope.statement}}
modes_supported: {{scope.modes_supported}}
(full/read_only/blocked/queued/UNKNOWN)
2. Per-Feature / Screen Map
Entry
feature_id: {{map[0].feature_id}} | OPTIONAL
screen_id: {{map[0].screen_id}} | OPTIONAL
route_id: {{map[0].route_id}} | OPTIONAL
offline_mode: {{map[0].offline_mode}}
reads: {{map[0].reads}} | OPTIONAL
writes: {{map[0].writes}} | OPTIONAL
notes: {{map[0].notes}} | OPTIONAL
(Repeat per mapped item.)
3. Read Rules
read_source: {{reads.source}}
stale_limits: {{reads.stale_limits}} | OPTIONAL
4. Write Rules
queue_supported: {{writes.queue_supported}}
blocked_operations: {{writes.blocked_operations}} | OPTIONAL
5. Messaging / Indicators
banner_policy_ref: {{ux.banner_policy_ref}} (expected: {{xref:CER-03}}) | OPTIONAL
queued_indicator_policy: {{ux.queued_indicator_policy}} | OPTIONAL
6. Security Constraints
do_not_cache: {{security.do_not_cache}}
sensitive_data_rules_ref: {{security.sensitive_data_rules_ref}} (expected:
{{xref:CSec-02}}) | OPTIONAL
7. Open Gaps
not_supported_offline: {{gaps.not_supported_offline}}
future_candidates: {{gaps.future_candidates}} | OPTIONAL
8. References
Offline handling: {{xref:SMD-05}}
Offline UX: {{xref:CER-03}} | OPTIONAL

Client data protection: {{xref:CSec-02}} | OPTIONAL
Sync model: {{xref:OFS-02}} | OPTIONAL
Cross-References
Upstream: {{xref:SMD-05}}, {{xref:CER-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OFS-02}}, {{xref:OFS-03}}, {{xref:OFS-04}}, {{xref:OFS-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define scope statement and map entries with UNKNOWN where needed.
intermediate: Required. Define read/write rules and security constraints.
advanced: Required. Add per-role differences and data size constraints.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, feature_id, screen/route ids, reads/writes
notes, stale limits, blocked ops, banner/queued indicator policies, sensitive data ref, future
candidates, role differences, data size constraints, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scope.statement is UNKNOWN → block Completeness Gate.
If map entries are UNKNOWN → block Completeness Gate.
If security.do_not_cache is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OFS
Pass conditions:
required_fields_present == true
offline_scope_mapped == true
read_write_rules_defined == true
security_constraints_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OFS-02

OFS-02 — Sync Model (queues, conflict resolution)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Offline scope MUST match what is implementable per {{xref:SMD-05}}.**
- Do not claim offline support for any screen/action not explicitly mapped.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Offline Scope Statement`
2. `## (full/read_only/blocked/queued/UNKNOWN)`
3. `## Per-Feature / Screen Map`
4. `## Entry`
5. `## (Repeat per mapped item.)`
6. `## Read Rules`
7. `## Write Rules`
8. `## Messaging / Indicators`
9. `## Security Constraints`
10. `## Open Gaps`

## 8. Cross-References

- **Upstream: {{xref:SMD-05}}, {{xref:CER-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OFS-02}}, {{xref:OFS-03}}, {{xref:OFS-04}}, {{xref:OFS-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
