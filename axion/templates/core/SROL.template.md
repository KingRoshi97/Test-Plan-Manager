# System Refinement & Optimization Loop (SROL) — {{PROJECT_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:SROL -->

## Overview
**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Loop Iteration:** {{ITERATION}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: SROL defines the structured diagnostic and refinement framework for post-build optimization.
It is diagnostic-first — the agent must OBSERVE and ANALYZE before proposing any change.
SROL operates within strict invariants (Non-Negotiables) and uses 4 mandatory diagnostic lenses
to evaluate the system before producing a structured refinement plan.
This is a PROJECT-LEVEL document (one per kit, not per domain).

SOURCES TO DERIVE FROM:
1. TIES — completion of engineering discipline is the entry condition for SROL
2. RPBS §33 Success Metrics — KPIs define what to observe and measure
3. RPBS §7 Non-Functional Profile — performance targets define acceptable thresholds
4. TESTPLAN — test coverage baseline informs regression detection
5. ERC — locked outcomes define Non-Negotiables
6. Live system telemetry — analytics, error logs, user feedback

RULES:
- Diagnostic-first — NEVER propose changes without completing all 4 diagnostic lenses
- Non-Negotiables are immutable — changes that violate them are rejected immediately
- Every change must have a defined rollback and validation method
- No new features — SROL optimizes existing scope only
- No outcome changes — ERC outcomes remain locked
- Each iteration produces a before/after metrics comparison

CASCADE POSITION (project-level — post-deployment continuous improvement):
- Upstream (read from): TIES (completed build), RPBS (success metrics), TESTPLAN (baseline coverage), ERC (locked outcomes), live system data
- Downstream (feeds into): Future TIES iterations (major feature requests), documentation updates (if behavior changes)
- SROL is the terminal phase of the AXION lifecycle — it loops indefinitely until the product is retired or a major re-architecture triggers a return to TIES
-->

## Purpose
This document defines the structured diagnostic and refinement framework for post-build optimization. SROL is diagnostic-first: observe, analyze through 4 mandatory lenses, then propose structured changes with rollback plans.

---

## SROL State

- **SROL State:** Draft / Active / Complete
- **Related ERC(s):** UNKNOWN
- **Iteration:** {{ITERATION}}

---

## Inputs and Source of Truth

<!-- AGENT: These documents are frozen for the duration of this SROL iteration.
Any updates to them require a new SROL cycle. -->

| Document | Version | Status |
|----------|---------|--------|
| RPBS | UNKNOWN | Frozen |
| ERC | UNKNOWN | Frozen |
| TESTPLAN | UNKNOWN | Frozen |
| TIES | UNKNOWN | Reference |
| Live Telemetry | Current | Active |

---

## Current Snapshot

<!-- AGENT: Observation only. No solutions. No recommendations.
Record the current state of the system as-is before any analysis. -->

### System State
- UNKNOWN

### Key Metrics
| Metric | Current Value | Target (from RPBS) | Status |
|--------|---------------|--------------------|---------| 
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Known Issues
- UNKNOWN

---

## Optimization Mode

<!-- AGENT: Select ONE optimization mode for this SROL iteration.
The mode constrains which diagnostic lenses are weighted most heavily
and what types of changes are preferred. -->

| Mode | Focus | When to Use |
|------|-------|-------------|
| **A: Stability** | Reduce failures, improve reliability | System has intermittent failures or crashes |
| **B: Maintainability** | Reduce complexity, improve readability | Code is hard to change or understand |
| **C: UX** | Reduce friction, improve user experience | Users report confusion or drop-off |
| **D: Performance** | Reduce latency, improve throughput | System is slow or resource-intensive |
| **E: Security** | Reduce attack surface, improve hardening | Vulnerabilities or compliance gaps |

**Selected Mode:** UNKNOWN

---

## Non-Negotiables

<!-- AGENT: Invariants that CANNOT be violated during this SROL iteration.
These are derived from ERC locked outcomes, RPBS requirements, and TESTPLAN baselines.
Any proposed change that would violate a Non-Negotiable is rejected immediately. -->

1. UNKNOWN (e.g., all existing tests must continue to pass)
2. UNKNOWN (e.g., all ERC locked outcomes must remain honored)
3. UNKNOWN (e.g., no user-facing behavior changes without RPBS authorization)
4. UNKNOWN (e.g., no new features — optimization only)
5. UNKNOWN (e.g., no domain boundary changes)

**Rule:** Changes that violate Non-Negotiables are rejected immediately, regardless of benefit.

---

## Diagnostic Lenses

<!-- AGENT: ALL 4 lenses are mandatory before proposing any changes.
Complete each lens analysis before moving to the Refinement Plan.
Do not skip lenses even if you believe they are not relevant. -->

### Lens 1: Feature Fitness Review

<!-- AGENT: For each feature, assess whether it is pulling its weight.
Is it doing what it should? Is it too large? Is it redundant? -->

| Feature | Status | Recommendation | Rationale |
|---------|--------|----------------|-----------|
| UNKNOWN | Keep / Split / Merge / Remove / Defer | UNKNOWN | UNKNOWN |

### Lens 2: Subsystem Weight Analysis

<!-- AGENT: For each subsystem, assess whether it is the right size.
Underweight subsystems lack capability. Overweight subsystems are doing too much. -->

| Subsystem | Weight | Assessment | Rationale |
|-----------|--------|------------|-----------|
| UNKNOWN | Underweight / Healthy / Overweight | UNKNOWN | UNKNOWN |

### Lens 3: Domain Purity Scan

<!-- AGENT: Check for domain boundary leakage.
Are domains reaching into each other? Is logic in the wrong place? -->

| Source Domain | Leaks Into | What Leaked | Severity |
|--------------|-----------|-------------|----------|
| UNKNOWN | UNKNOWN | UNKNOWN | Low / Medium / High |

### Lens 4: Change-Cost Simulation

<!-- AGENT: For each proposed change area, estimate the cost of making the change.
This lens prevents changes that are expensive relative to their benefit. -->

| Change Area | Estimated Cost | Risk | Benefit | Ratio |
|-------------|---------------|------|---------|-------|
| UNKNOWN | Low / Medium / High | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Refinement Plan

<!-- AGENT: Only produce a refinement plan AFTER completing all 4 diagnostic lenses.
Each change must have a category, target, reason, risk, rollback, and validation. -->

| Change ID | Category | Target | Reason | Risk | Rollback Plan | Validation Method |
|-----------|----------|--------|--------|------|---------------|-------------------|
| SROL-001 | Bug / Perf / UX / Debt / Security | UNKNOWN | UNKNOWN | Low / Med / High | UNKNOWN | UNKNOWN |
| SROL-002 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Execution Rules

<!-- AGENT: Hard rules during SROL execution. -->

- No new features — optimization of existing scope only
- No outcome changes — ERC outcomes remain locked
- No domain boundary changes
- All changes must have rollback plans
- All changes must preserve Non-Negotiables
- Test suite must pass before and after every change

---

## Loop Structure

```
┌─────────────────────────────────────────────────────┐
│                    SROL CYCLE                       │
│                                                     │
│   OBSERVE → ANALYZE → PLAN → EXECUTE → VERIFY      │
│       ↑                                    │        │
│       └────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

---

## Execute — Implement Changes

### Execution Checklist

#### Pre-Execution
- [ ] All 4 diagnostic lenses completed
- [ ] Refinement plan approved
- [ ] Non-Negotiables verified
- [ ] Rollback plans documented
- [ ] Test baseline recorded

#### Implementation
- [ ] Code changes complete
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Review completed

#### Deployment
- [ ] Staged rollout configured
- [ ] Monitoring alerts set
- [ ] Rollback tested
- [ ] Deployment executed

### Change Log
| Change ID | Files Modified | Commit | Status |
|-----------|----------------|--------|--------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Verify — Confirm Improvements

### Results

| Metric | Before | After | Delta | Pass? |
|--------|--------|-------|-------|-------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Non-Negotiable Verification
- [ ] All Non-Negotiables preserved
- [ ] No regressions detected
- [ ] All existing tests pass
- [ ] No new failures introduced

### Iteration Outcome
- [ ] **SUCCESS** — All targets met, proceed to next loop
- [ ] **PARTIAL** — Some targets met, carry over remaining
- [ ] **FAILED** — Rollback required, re-analyze

---

## Stop Conditions

<!-- AGENT: Stop SROL and escalate if any of these occur. -->

- All optimization targets met (SROL Complete)
- Major feature request received (return to TIES)
- Architecture change needed (return to planning)
- Non-Negotiable violation detected (halt and escalate)
- Diminishing returns — further changes provide negligible improvement

---

## Loop State

### Current Status
```json
{
  "iteration": {{ITERATION}},
  "phase": "{{CURRENT_PHASE}}",
  "status": "{{STATUS}}",
  "optimization_mode": "{{MODE}}",
  "started": "{{START_DATE}}",
  "target_completion": "{{TARGET_DATE}}"
}
```

### Iteration History
| # | Mode | Focus | Started | Completed | Outcome |
|---|------|-------|---------|-----------|---------|
| 1 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Agent Ingestion Instructions

<!-- AGENT: These are instructions for the agent consuming this SROL. -->

### Diagnostic-First Enforcement
- You MUST complete all 4 diagnostic lenses before proposing any change
- You MUST NOT skip a lens even if you believe it is not relevant
- Lenses must be completed in order: Feature Fitness → Subsystem Weight → Domain Purity → Change-Cost

### Non-Negotiable Enforcement
- Before proposing any change, verify it does not violate any Non-Negotiable
- If a beneficial change would violate a Non-Negotiable, report the conflict — do not make the change
- Non-Negotiables cannot be overridden by the agent; only human review can modify them

### Change Proposal Discipline
- Every change must appear in the Refinement Plan with all required fields
- Changes without rollback plans are rejected
- Changes without validation methods are rejected

### Assumption Prohibition
- Never assume current system state — always verify through observation
- Never assume a change will work — always validate through testing
- Never assume impact — always measure before and after

### Stop Condition Awareness
- Check stop conditions before each iteration
- If a stop condition is met, report it and halt — do not continue optimizing

---

## Open Questions
<!-- AGENT: Refinement questions that need clarification for the current iteration. -->
- UNKNOWN
