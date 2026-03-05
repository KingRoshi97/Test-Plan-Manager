# RTM-06 — Abuse/Rate Control for

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RTM-06                                             |
| Template Type     | Architecture / Realtime                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring abuse/rate control for    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Abuse/Rate Control for Document                         |

## 2. Purpose

Define the realtime-specific abuse controls and rate limits: per-connection and per-channel
limits, spam/flood detection, moderation hooks, enforcement actions, and how realtime abuse
integrates with trust & safety workflows.

## 3. Inputs Required

- ● RTM-01: {{xref:RTM-01}} | OPTIONAL
- ● RTM-03: {{xref:RTM-03}} | OPTIONAL
- ● RLIM-01: {{xref:RLIM-01}} | OPTIONAL
- ● TNS-01: {{xref:TNS-01}} | OPTIONAL
- ● PMAD-05: {{xref:PMAD-05}} | OPTIONAL
- ● OBS-04: {{xref:OBS-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Rate limit catalog (mi... | spec         | Yes             |
| For each limit:           | spec         | Yes             |
| ○ limit_id                | spec         | Yes             |
| ○ applies_to (connecti... | spec         | Yes             |
| ○ scope key (channel_i... | spec         | Yes             |
| ○ limit value (msgs/se... | spec         | Yes             |
| ○ enforcement point (g... | spec         | Yes             |
| ○ action on breach (th... | spec         | Yes             |
| ○ escalation rule (tem... | spec         | Yes             |
| ○ observability signal... | spec         | Yes             |
| Abuse detection heuris... | spec         | Yes             |
| ○ flood/spam patterns     | spec         | Yes             |

## 5. Optional Fields

● ML-based spam scoring pointer | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Limits must be enforceable server-side with deterministic behavior.
- Enforcement actions must be consistent and auditable.
- Moderation actions must map to privileged operations policy (PMAD-05) if admin-driven.
- Controls must minimize false positives; include escalation and recovery.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Rate Limits (canonical)`
2. `## limi`
3. `## t_id`
4. `## applies_t`
5. `## scope_`
6. `## key`
7. `## rtm`
8. `## _lim`
9. `## _01`
10. `## applies_to 0].scop`

## 8. Cross-References

- Upstream: {{xref:RLIM-01}} | OPTIONAL, {{xref:TNS-01}} | OPTIONAL, {{xref:PMAD-05}}
- | OPTIONAL
- Downstream: {{xref:OBS-04}} | OPTIONAL, {{xref:ALRT-*}} | OPTIONAL, {{xref:QA-04}} |
- OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- beginner: Required. Rate limits + breach actions + moderation hook list.
- intermediate: Required. Add heuristics and observability signals.
- advanced: Required. Add test requirements and appeals pointers.
- Unknown Handling
- UNKNOWN_ALLOWED: ml_spam_scoring, notes, churn_patterns,
- malformed_payload_patterns
- If any limit lacks enforcement_point or breach_action → block

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
