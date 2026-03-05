# RTM-01 — Realtime Use Cases Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RTM-01                                             |
| Template Type     | Architecture / Realtime                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring realtime use cases catalog    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Realtime Use Cases Catalog Document                         |

## 2. Purpose

Define the canonical list of realtime use cases and their required semantics so the system
doesn’t implement “realtime” inconsistently. This sets expectations for presence,
chat/messaging, livestream signaling, live updates, and realtime moderation hooks.

## 3. Inputs Required

- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● DES-01: {{xref:DES-01}} | OPTIONAL
- ● ARC-05: {{xref:ARC-05}} | OPTIONAL
- ● PMAD-01: {{xref:PMAD-01}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● RISK-02: {{xref:RISK-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Use case list (minimum 5 if realtime exists; otherwise mark N/A)
● For each use case:
○ rt_usecase_id
○ name
○ purpose
○ linked_feature_ids
○ realtime primitive (presence/message/stream_signal/live_state)
○ criticality (P0/P1/P2)
○ delivery semantics required (ordering/ack/retry/dedupe)
○ authorization requirement (who can join/send)
○ data sensitivity (PII/none)
○ abuse/moderation hooks needed (yes/no + type)
○ scaling assumptions (qualitative)
○ fallback behavior (when realtime unavailable)
○ observability requirements (key fields/metrics)
● Coverage check: every realtime feature has at least one use case defined

Optional Fields
● Multi-region notes | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● Every use case must specify fallback behavior.
● Every use case must specify authorization requirements (join/send).
● Delivery semantics must be explicit; “best effort” must state what can be dropped.

Output Format
1) Applicability
● applies: {{rtm.applies}} (true/false)
● 00_NA (if not applies): {{rtm.na_block}} | OPTIONAL

2) Realtime Use Cases (canonical)
rt_
us
ec
as
e_
id

nam
e

primit
ive

featur
e_ids

critic
ality

sema
ntics

auth
_req

sensit
ivity

moder
ation_
hooks

fallba
ck

obs
_req
uire
men
ts

note
s

rtu
_0
1

{{use
case
s[0].
nam
e}}

{{usec
ases[
0].pri
mitive
}}

{{usec
ases[0
].featur
e_ids}}

{{usec
ases[
0].criti
cality}
}

{{usec
ases[0
].sema
ntics}}

{{us
ecas
es[0]
.aut
h}}

{{usec
ases[0
].sensi
tivity}}

{{usec
ases[0
].mode
ration}
}

{{use
cases
[0].fall
back}
}

{{us
ecas
es[0
].ob
s}}

{{use
case
s[0].
note
s}}

rtu
_0
2

{{use
case
s[1].
nam
e}}

{{usec
ases[
1].pri
mitive
}}

{{usec
ases[1
].featur
e_ids}}

{{usec
ases[
1].criti
cality}
}

{{usec
ases[1
].sema
ntics}}

{{us
ecas
es[1]
.aut
h}}

{{usec
ases[1
].sensi
tivity}}

{{usec
ases[1
].mode
ration}
}

{{use
cases
[1].fall
back}
}

{{us
ecas
es[1
].ob
s}}

{{use
case
s[1].
note
s}}

3) Coverage Checks (required if applies)
● All realtime features covered: {{coverage.features_covered}}
● All use cases have fallback: {{coverage.fallback_complete}}
● All use cases have auth requirements: {{coverage.auth_complete}}

Cross-References
● Upstream: {{xref:ARC-05}} | OPTIONAL, {{xref:PMAD-01}} | OPTIONAL, {{xref:ERR-01}}
| OPTIONAL
● Downstream: {{xref:RTM-02}}, {{xref:RTM-03}}, {{xref:RTM-04}}, {{xref:RTM-05}},
{{xref:RTM-06}} | OPTIONAL
● Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required if applies. Define use cases + fallback + auth.
● intermediate: Required if applies. Add delivery semantics and observability needs.
● advanced: Required if applies. Add moderation hooks and scaling assumptions.

Unknown Handling
● UNKNOWN_ALLOWED: multi_region_notes, notes, scaling_assumptions
(but must be planned)

● If applies == true and any use case lacks fallback → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.REALTIME
● Pass conditions:
○ required_fields_present == true
○ if_applies_then_usecases_present == true
○ fallback_complete == true
○ auth_complete == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

RTM-02

RTM-02 — Protocol & Transport Map
(WS/WebRTC/pubsub, fallback rules)
Header Block
● template_id: RTM-02
● title: Protocol & Transport Map (WS/WebRTC/pubsub, fallback rules)
● type: realtime_messaging_architecture
● template_version: 1.0.0
● output_path: 10_app/realtime/RTM-02_Protocol_Transport_Map.md
● compliance_gate_id: TMP-05.PRIMARY.REALTIME
● upstream_dependencies: ["RTM-01", "ARC-05", "SBDT-02"]
● inputs_required: ["RTM-01", "ARC-05", "SBDT-02", "PMAD-01", "ERR-05",
"STANDARDS_INDEX"]
● require

## 5. Optional Fields

● Multi-region notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Every use case must specify fallback behavior.
- Every use case must specify authorization requirements (join/send).
- Delivery semantics must be explicit; “best effort” must state what can be dropped.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Realtime Use Cases (canonical)`
3. `## rt_`
4. `## nam`
5. `## primit`
6. `## ive`
7. `## featur`
8. `## e_ids`
9. `## critic`
10. `## ality`

## 8. Cross-References

- Upstream: {{xref:ARC-05}} | OPTIONAL, {{xref:PMAD-01}} | OPTIONAL, {{xref:ERR-01}}
- | OPTIONAL
- Downstream: {{xref:RTM-02}}, {{xref:RTM-03}}, {{xref:RTM-04}}, {{xref:RTM-05}},
- **{{xref:RTM-06}} | OPTIONAL**
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
