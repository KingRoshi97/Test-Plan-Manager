# ARC-05 — Realtime Architecture

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-05                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring realtime architecture    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Realtime Architecture Document                         |

## 2. Purpose

Define the system’s realtime architecture at the system level: which realtime use cases exist,
what transports/protocols are used, how channels/topics are modeled, how presence/state sync
works, and what delivery guarantees and scaling assumptions apply.

## 3. Inputs Required

- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● DES-01: {{xref:DES-01}} | OPTIONAL
- ● RTM-01: {{xref:RTM-01}} | OPTIONAL
- ● RTM-02: {{xref:RTM-02}} | OPTIONAL
- ● RTM-03: {{xref:RTM-03}} | OPTIONAL
- ● RTM-04: {{xref:RTM-04}} | OPTIONAL
- ● RTM-05: {{xref:RTM-05}} | OPTIONAL
- ● PMAD-01: {{xref:PMAD-01}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Realtime scope summary... | spec         | Yes             |
| Use cases covered (min... | spec         | Yes             |
| Channel/topic model su... | spec         | Yes             |
| Presence model summary:   | spec         | Yes             |
| ○ online/offline/away ... | spec         | Yes             |
| ○ TTL/heartbeat policy    | spec         | Yes             |
| ○ conflict resolution ... | spec         | Yes             |
| Delivery semantics sum... | spec         | Yes             |
| ○ ordering guarantees     | spec         | Yes             |
| ○ dedupe strategy         | spec         | Yes             |
| ○ ack strategy            | spec         | Yes             |
| ○ replay policy (if any)  | spec         | Yes             |

## 5. Optional Fields

● Multi-region realtime notes | OPTIONAL
● Moderation/abuse hooks pointer | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Realtime must degrade gracefully: define fallback when realtime is unavailable.
- Presence must define source of truth (server vs client vs hybrid).
- Delivery semantics must be explicit; “best effort” must define what can be dropped.
- Authorization must be enforced server-side for all channel joins and message sends.
- Any scaling assumptions must be traceable to PERF/COST docs later (pointer only).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Scope Summary (required)`
2. `## 2) Use Cases (required)`
3. `## use_c`
4. `## ase_id`
5. `## name`
6. `## purpose`
7. `## criticality`
8. `## linked_features`
9. `## notes`
10. `## rt_uc_`

## 8. Cross-References

- Upstream: {{xref:RTM-01}} | OPTIONAL, {{xref:RTM-02}} | OPTIONAL, {{xref:RTM-03}} |
- **OPTIONAL, {{xref:RTM-04}} | OPTIONAL, {{xref:RTM-05}} | OPTIONAL**
- Downstream: {{xref:RTM-06}} | OPTIONAL, {{xref:OBS-}} | OPTIONAL, {{xref:PERF-}} |
- **OPTIONAL, {{xref:WFO-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
