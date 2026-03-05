# RTM-05 — Presence & State Sync Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RTM-05                                             |
| Template Type     | Architecture / Realtime                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring presence & state sync model    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Presence & State Sync Model Document                         |

## 2. Purpose

Define how presence and realtime state are represented, synchronized, expired, and reconciled
across clients and the server: source of truth, TTLs, heartbeats, conflict resolution, and resync
triggers.

## 3. Inputs Required

- ● RTM-01: {{xref:RTM-01}} | OPTIONAL
- ● RTM-02: {{xref:RTM-02}} | OPTIONAL
- ● RTM-03: {{xref:RTM-03}} | OPTIONAL
- ● ARC-05: {{xref:ARC-05}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Presence entity defini... | spec         | Yes             |
| Presence states:          | spec         | Yes             |
| ○ online                  | spec         | Yes             |
| ○ offline                 | spec         | Yes             |
| ○ away (optional)         | spec         | Yes             |
| ○ busy (optional)         | spec         | Yes             |
| Source of truth (serve... | spec         | Yes             |
| Heartbeat model:          | spec         | Yes             |
| ○ heartbeat interval      | spec         | Yes             |
| ○ TTL expiry window       | spec         | Yes             |
| ○ reconnect behavior      | spec         | Yes             |
| State sync model:         | spec         | Yes             |

## 5. Optional Fields

● Cross-device priority rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Presence must expire automatically if no heartbeats; no “stuck online.”
- State sync must tolerate disconnects and reordering.
- Privacy is mandatory: presence visibility must be controlled by policy.
- If hybrid source-of-truth, define deterministic tie-breaker rules.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Presence Entity (required)`
2. `## field`
3. `## type`
4. `## meaning`
5. `## notes`
6. `## user_id`
7. `## .type}}`
8. `## eaning}}`
9. `## notes}}`
10. `## status`

## 8. Cross-References

- Upstream: {{xref:RTM-02}} | OPTIONAL, {{xref:RTM-03}} | OPTIONAL, {{xref:ARC-05}} |
- OPTIONAL
- Downstream: {{xref:RTS-}} | OPTIONAL, {{xref:OBS-}} | OPTIONAL, {{xref:QA-04}} |
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
