# CACHE-04 — Read/Write Split Rules (read

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CACHE-04                                             |
| Template Type     | Data / Caching                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring read/write split rules (read    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Read/Write Split Rules (read Document                         |

## 2. Purpose

Define when and how the system splits reads and writes: use of read replicas, CQRS patterns,
read models, and consistency constraints. This ensures predictable behavior under replication
lag and prevents incorrect reads after writes.

## 3. Inputs Required

- ● DATA-07: {{xref:DATA-07}} | OPTIONAL
- ● DATA-08: {{xref:DATA-08}} | OPTIONAL
- ● SBDT-02: {{xref:SBDT-02}} | OPTIONAL
- ● PERF-02: {{xref:PERF-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Read/write split stanc... | spec         | Yes             |
| Rules for routing:        | spec         | Yes             |
| ○ what must go to primary | spec         | Yes             |
| ○ what may go to replicas | spec         | Yes             |
| ○ “read-your-writes” g... | spec         | Yes             |
| Lag handling:             | spec         | Yes             |
| ○ maximum tolerated re... | spec         | Yes             |
| ○ stale read behaviors    | spec         | Yes             |
| ○ fallback to primary ... | spec         | Yes             |
| CQRS rules (if used):     | spec         | Yes             |
| ○ command model vs que... | spec         | Yes             |

## 5. Optional Fields

● Multi-region replication notes | OPTIONAL
● Notes | OPTIONAL

Rules
● If applies == false, include 00_NA block only.
● After write operations, critical reads must not use stale replicas unless explicitly allowed.
● Lag must be monitored; define alert thresholds.
● CQRS must specify projection freshness and failure posture.

Output Format
1) Applicability
● applies: {{rw.applies}} (true/false)
● 00_NA (if not applies): {{rw.na_block}} | OPTIONAL

2) Stance (required if applies)
● Stance: {{rw.stance}} (none/replicas/cqrs/hybrid)
● Why: {{rw.why}}

3) Routing Rules (required if applies)
● Must use primary for: {{routing.primary_required}}
● May use replicas for: {{routing.replica_allowed}}
● Read-your-writes guarantee: {{routing.read_your_writes}} | OPTIONAL

4) Lag Handling (required if applies)
● Max tolerated lag: {{lag.max}}
● Behavior when lag exceeded: {{lag.behavior}}

● Fallback rule: {{lag.fallback}} | OPTIONAL

5) CQRS Rules (required if used)
● Boundaries: {{cqrs.boundaries}} | OPTIONAL
● Projection mechanism pointer: {{cqrs.projection_pointer}} | OPTIONAL
● Freshness target: {{cqrs.freshness}} | OPTIONAL
● Failure posture: {{cqrs.failure}} | OPTIONAL

6) Verification Checklist (required if applies)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References
● Upstream: {{xref:DATA-07}} | OPTIONAL, {{xref:SBDT-02}} | OPTIONAL
● Downstream: {{xref:CACHE-03}} | OPTIONAL, {{xref:PERF-03}} | OPTIONAL,
{{xref:OBS-04}} | OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Not required.
● intermediate: Required if applies. Stance + routing + lag policy.
● advanced: Required if applies. Add CQRS boundaries and monitoring thresholds.

Unknown Handling
● UNKNOWN_ALLOWED: multi_region_notes, notes, read_your_writes,
cqrs_rules
● If applies == true and max tolerated lag is UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.CACHE
● Pass conditions:
○ required_fields_present == true
○ if_applies_then_stance_present == true
○ if_applies_then_routing_rules_present == true
○ if_applies_then_lag_policy_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

CACHE-05

CACHE-05 — Rate/Cost Controls for
Reads (hot keys, batching)
Header Block
● template_id: CACHE-05
● title: Rate/Cost Controls for Reads (hot keys, batching)
● type: caching_data_access_patterns
● template_version: 1.0.0
● output_path: 10_app/caching/CACHE-05_Rate_Cost_Controls_for_Reads.md
● compliance_gate_id: TMP-05.PRIMARY.CACHE
● upstream_dependencies: ["CACHE-01", "PERF-02", "COST-01"]
● inputs_required: ["CACHE-01", "PERF-02", "COST-01", "RLIM-01", "OBS-02",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define controls that keep read load and cost bounded: batching, request coalescing, hot-key
mitigation, per-tenant/user limits, cache tiering, and fail-open/close behaviors under high load.

Inputs Required
● CACHE-01: {{xref:CACHE-01}} | OPTIONAL
● PERF-02: {{xref:PERF-02}} | OPTIONAL
● COST-01: {{xref:COST-01}} | OPTIONAL

● RLIM-01: {{xref:RLIM-01}} | OPTIONAL
● OBS-02: {{xref:OBS-02}} | OPTIONAL
● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Control catalog (minimum 12 controls)

## 6. Rules

- If applies == false, include 00_NA block only.
- After write operations, critical reads must not use stale replicas unless explicitly allowed.
- Lag must be monitored; define alert thresholds.
- CQRS must specify projection freshness and failure posture.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Stance (required if applies)`
3. `## 3) Routing Rules (required if applies)`
4. `## 4) Lag Handling (required if applies)`
5. `## 5) CQRS Rules (required if used)`
6. `## 6) Verification Checklist (required if applies)`

## 8. Cross-References

- Upstream: {{xref:DATA-07}} | OPTIONAL, {{xref:SBDT-02}} | OPTIONAL
- Downstream: {{xref:CACHE-03}} | OPTIONAL, {{xref:PERF-03}} | OPTIONAL,
- **{{xref:OBS-04}} | OPTIONAL**
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
