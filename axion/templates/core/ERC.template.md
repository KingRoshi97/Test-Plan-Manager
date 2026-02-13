# Execution Readiness Contract (ERC) — {{DOMAIN_NAME}} v{{VERSION}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:ERC -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Version:** {{VERSION}}
**Lock Date:** {{LOCK_DATE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: The ERC freezes meaning, intent, and structure before execution begins.
Once locked, execution may proceed, but reinterpretation may not.
ERC is both a data snapshot (from BELS, DDES, DIM, TESTPLAN) AND a meaning contract
that defines what outcomes, boundaries, and flows are immutable during execution.

THIS DOCUMENT IS AUTO-GENERATED AT LOCK TIME. Do not manually edit it.
The lock step performs these checks before creating the ERC:
1. No critical UNKNOWNs remain in BELS (policy rules, state machines, validation rules)
2. All reason codes have messages
3. All state machines have deny codes for invalid transitions
4. Minimum acceptance scenarios exist in TESTPLAN
5. All RPBS cross-references resolve to existing sections

IF LOCK FAILS:
- The orchestrator reports which files contain UNKNOWNs via the UNKNOWN scan
- The agent must fill those UNKNOWNs before re-attempting lock
- Open Questions in BELS and DDES must be resolved

CORE ERC RULE: ERC freezes meaning, not mechanics.
Execution may move forward — intent may not.

CASCADE POSITION (terminal — auto-generated at lock time):
- Upstream (copied from): BELS (policy rules, state machines, validation, reason codes, auth rules, computed values), DDES (entity specs), DIM (interfaces), TESTPLAN (P0 acceptance scenarios), COPY_GUIDE (user-facing messages), UX_Foundations (experience laws), UI_Constraints (structural rules)
- Downstream (feeds into): scaffold-app (application code generation), build-exec (file operations), verify step (compliance checking)
- ERC is NOT manually edited — it is the locked snapshot of all upstream docs, assembled by the lock step after verification passes
-->

---

## ERC State

<!-- AGENT: ERC State controls execution. Execution must NOT begin unless ERC State is LOCKED. -->

- **ERC State:** Draft / Locked / Broken
- **Prepared by:** UNKNOWN
- **Date Created:** UNKNOWN
- **Date Locked:** {{LOCK_DATE}}

**Rule:** Execution must NOT begin unless ERC State is LOCKED.
Any modification to bound input documents invalidates this ERC and requires a new one.

---

## Verification Status

<!-- AGENT: These checks are performed automatically by the lock step.
Manual checking is only needed if debugging a lock failure. -->

- [ ] No critical UNKNOWNs in BELS
- [ ] All policy rules have reason codes + messages
- [ ] All state machines have deny codes for invalid transitions
- [ ] All validation rules have error codes + user messages
- [ ] Minimum acceptance scenarios defined in TESTPLAN
- [ ] All RPBS cross-references resolve
- [ ] All Open Questions resolved or marked non-blocking

---

## Bound Input Documents

<!-- AGENT: These documents are authoritative for this execution and are frozen for the
duration of this ERC. Any modification to these documents invalidates this ERC. -->

| Document | Version | Hash | Status |
|----------|---------|------|--------|
| RPBS | UNKNOWN | UNKNOWN | Frozen |
| REBS | UNKNOWN | UNKNOWN | Frozen |
| DDES | UNKNOWN | UNKNOWN | Frozen |
| UX_Foundations | UNKNOWN | UNKNOWN | Frozen |
| UI_Constraints | UNKNOWN | UNKNOWN | Frozen |
| BELS | UNKNOWN | UNKNOWN | Frozen |
| DIM | UNKNOWN | UNKNOWN | Frozen |
| TESTPLAN | UNKNOWN | UNKNOWN | Frozen |
| COPY_GUIDE | UNKNOWN | UNKNOWN | Frozen |

**Rule:** Any modification to these documents invalidates this ERC and requires a new one.

---

## Locked Primary Outcomes

<!-- AGENT: List the outcomes that must be preserved during execution.
Outcomes define success. Features may evolve; outcomes may not.
If outcome meaning becomes ambiguous, execution must halt. -->

1. UNKNOWN
2. UNKNOWN
3. UNKNOWN

**Rules:**
- Outcomes define success
- Features may evolve; outcomes may not
- If outcome meaning becomes ambiguous, execution must halt

---

## Locked Non-Goals and Exclusions

<!-- AGENT: Explicitly define what this execution will NOT attempt.
If execution drifts toward a non-goal, stop immediately and escalate. -->

1. UNKNOWN
2. UNKNOWN
3. UNKNOWN

**Rule:** If execution drifts toward a non-goal, stop immediately and escalate.

---

## Locked Domain Boundaries

<!-- AGENT: Define responsibility ownership. No boundary violations are permitted.
No shared ownership. No temporary boundary violations.
Repeat for each domain or subsystem covered by this ERC. -->

### {{DOMAIN_NAME}}

**Owns:**
- UNKNOWN
- UNKNOWN

**Does NOT Own:**
- UNKNOWN
- UNKNOWN

**Rules:**
- No shared ownership
- No temporary boundary violations
- Any boundary breach constitutes ERC failure

---

## Locked Core Flows

<!-- AGENT: Define the flows whose meaning must remain intact.
Flow implementation may be optimized later. Flow intent and meaning may not change.
New core flows require a new or revised ERC. -->

### Flow: {{FLOW_NAME}}
- **Goal:** UNKNOWN
- **Start State:** UNKNOWN
- **End State:** UNKNOWN

**Rules:**
- Flow implementation may be optimized later
- Flow intent and meaning may not change
- New core flows require a new or revised ERC

---

## Locked UX and UI Laws

<!-- AGENT: Summarize non-negotiable experience and interface constraints.
Copied from UX_Foundations and UI_Constraints at lock time. -->

- **UX Law 1:** UNKNOWN
- **UX Law 2:** UNKNOWN
- **UI Constraint 1:** UNKNOWN
- **UI Constraint 2:** UNKNOWN

**Rule:** Implementation convenience may never override UX or UI law.

---

## Permitted Implementation Freedoms

<!-- AGENT: Explicitly list what execution is allowed to decide freely.
This section exists to prevent over-freezing. -->

- UNKNOWN (e.g., internal file or folder structure within TIES rules)
- UNKNOWN (e.g., naming conventions for internal variables/functions)
- UNKNOWN (e.g., helper abstractions and utility functions)
- UNKNOWN (e.g., minor refactors that don't change behavior)
- UNKNOWN (e.g., non user-facing optimizations)

---

## Forbidden Changes During Execution

<!-- AGENT: Hard prohibitions during execution. If a forbidden change is requested,
execution must halt immediately. -->

- Redefining outcomes
- Merging or splitting domains or subsystems
- Introducing new core concepts
- Adding features not defined in DDES
- Violating UX or UI constraints

**Rule:** If a forbidden change is requested, execution must halt immediately.

---

## Escalation and Rollback Triggers

<!-- AGENT: Execution must stop if any of the following occur. -->

- Outcome ambiguity
- Conflicting responsibilities
- UX or UI rule conflict
- Missing or unclear definitions
- Architectural deadlock

**Required Action:** Pause execution and escalate for human review and ERC decision.

---

## Locked Data Sections

### Entity Specification (from DDES)
<!-- Copied from DDES at lock time — entities this domain owns -->
| Entity | Fields (key) | Relationships | Lifecycle States |
|--------|-------------|---------------|-----------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Policy Rules (from BELS)
<!-- Copied from BELS at lock time — business rules for this domain -->
| Rule ID | Description | Condition | Action | Deny Code | SourceRef |
|---------|-------------|-----------|--------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### State Machines (from BELS)
<!-- Copied from BELS at lock time — entity state transitions -->
| Entity | Current State | Event | Next State | Guard Condition | Deny Code |
|--------|---------------|-------|------------|----------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Validation Rules (from BELS)
<!-- Copied from BELS at lock time — field-level validation -->
| Field | Entity | Rule | Error Code | User Message |
|-------|--------|------|------------|-------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Reason Codes (from BELS)
<!-- Copied from BELS at lock time — all error/deny codes -->
| Code | Message | Severity | HTTP Status |
|------|---------|----------|------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Authorization Rules (from BELS)
<!-- Copied from BELS at lock time — who can do what -->
| Action | Actor(s) Allowed | Condition | Deny Code |
|--------|-----------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Interfaces (from DIM)
<!-- Copied from DIM at lock time — exposed and consumed interfaces -->
| Interface ID | Type | Path/Name | Description | Contract Shape |
|-------------|------|-----------|-------------|---------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Acceptance Criteria (from TESTPLAN)
<!-- Copied from TESTPLAN at lock time — P0 test scenarios -->
| Test ID | Description | Given | When | Then |
|---------|-------------|-------|------|------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## ERC Success Conditions

<!-- AGENT: This ERC is considered honored when all conditions below are met.
Failure to meet any condition constitutes an ERC breach. -->

- [ ] All locked flows exist in implementation
- [ ] All locked outcomes are supported by implementation
- [ ] No boundary violations occurred
- [ ] TIES rules were followed
- [ ] No forbidden changes were made

---

## Implementation Notes
<!-- AGENT: These notes are added during the lock process to capture any context
that helps the implementing agent. They might include:
- Recommended implementation patterns
- Known edge cases to watch for
- Performance considerations
- Integration-specific setup notes -->
- UNKNOWN

---

## Computed Values (from BELS)
<!-- Copied from BELS at lock time — derived/calculated values -->
| Value | Formula/Logic | Computed Where | Dependencies |
|-------|-------------|---------------|-------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Cross-Domain Dependencies
<!-- From DIM — what this domain needs from other domains -->
| Dependency | Interface | What Is Consumed |
|-----------|-----------|-----------------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Lock Metadata

- **Locked by:** UNKNOWN
- **Lock date:** {{LOCK_DATE}}
- **Lock hash:** UNKNOWN
- **Source documents:**
  - BELS version: UNKNOWN
  - DDES version: UNKNOWN
  - DIM version: UNKNOWN
  - TESTPLAN version: UNKNOWN
  - COPY_GUIDE version: UNKNOWN
- **Pre-lock scan results:**
  - UNKNOWNs found: UNKNOWN
  - UNKNOWNs resolved: UNKNOWN
  - Open Questions remaining: UNKNOWN

---

## Agent Ingestion Instructions

<!-- AGENT: These instructions define how the agent must operate under this ERC.
The agent must treat the ERC as a binding execution contract, not reference material. -->

### Agent Role Under ERC
- You are an executor, not a designer
- You are not allowed to reinterpret intent, outcomes, or structure once ERC is locked
- You execute implementation tasks, respect all locked constraints, halt when violations or ambiguity occur

### ERC Validation (Mandatory First Action)
1. Locate this ERC document
2. Verify ERC State = LOCKED
3. If ERC State is Draft or Broken — do NOT proceed, request human action

### Document Ingestion Order
When ERC is locked, ingest documents in this exact order:
1. RPBS (product intent and outcomes)
2. REBS (engineering thinking constraints)
3. DDES (domains, subsystems, flows)
4. UX_Foundations (experience laws)
5. UI_Constraints (UI structural rules)
6. TIES (implementation rules)
7. ALRP (agent reasoning rules)
8. ERC (execution lock and prohibitions)

Higher-order documents override lower-order ones.
ERC overrides execution behavior but does NOT override intent documents.

### Execution Mode Behavior
- Prefer smallest valid step
- Avoid speculative work
- Avoid future-proofing beyond scope
- Avoid creative alternatives
- Implement exactly what is defined

### ERC Breach Handling
If a violation has already occurred:
1. Mark ERC State as BROKEN
2. Stop all further execution
3. Report breach and location
4. Await instruction (rollback, revise ERC, or abandon)

---

## Open Questions
<!-- AGENT: Lock-blocking issues discovered during the lock process. Auto-populated by the lock step. -->
- UNKNOWN
