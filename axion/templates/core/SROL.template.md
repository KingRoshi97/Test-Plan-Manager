# System Refinement & Optimization Loop (SROL) — {{PROJECT_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:SROL -->

## Overview
**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Loop Iteration:** {{ITERATION}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: SROL defines the post-deployment improvement cycle. After TIES Phase 12
completes and the application is live, the system enters SROL for continuous refinement.
This is a PROJECT-LEVEL document (one per kit, not per domain).

SOURCES TO DERIVE FROM:
1. TIES — completion of all 12 phases is the entry condition for SROL
2. RPBS §33 Success Metrics — KPIs define what to observe and measure
3. RPBS §7 Non-Functional Profile — performance targets define acceptable thresholds
4. TESTPLAN — test coverage baseline informs regression detection
5. Live system telemetry — analytics, error logs, user feedback

RULES:
- SROL operates as a repeating 5-step loop: OBSERVE → ANALYZE → PLAN → EXECUTE → VERIFY
- Each iteration MUST have a defined focus area and measurable success criteria
- Changes MUST NOT break existing test suites (no regressions)
- Escalation criteria define when to exit SROL and return to TIES for major work
- Each iteration produces a before/after metrics comparison

CASCADE POSITION (project-level — post-deployment continuous improvement):
- Upstream (read from): TIES (completed build), RPBS (success metrics), TESTPLAN (baseline coverage), live system data
- Downstream (feeds into): Future TIES iterations (major feature requests), documentation updates (if behavior changes)
- SROL is the terminal phase of the AXION lifecycle — it loops indefinitely until the product is retired or a major re-architecture triggers a return to TIES
-->

## Purpose
This document defines the post-build improvement cycle. After initial deployment (TIES Phase 12), the system enters SROL for continuous refinement. Each loop iteration addresses feedback, optimizes performance, and evolves the product.

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

## 1) OBSERVE — Gather Signals

### Data Sources
| Source | Metrics | Frequency |
|--------|---------|-----------|
| Analytics | {{ANALYTICS_METRICS}} | Daily |
| Error logs | {{ERROR_METRICS}} | Real-time |
| User feedback | {{FEEDBACK_CHANNELS}} | Weekly |
| Performance | {{PERF_METRICS}} | Hourly |
| Support tickets | {{SUPPORT_METRICS}} | Daily |

### Current Observations
{{OBSERVATIONS}}

### Signal Priority
| Signal | Impact | Urgency | Score |
|--------|--------|---------|-------|
| | | | |

---

## 2) ANALYZE — Understand Root Causes

### Issue Categories
- [ ] **Bugs** — Functionality not working as specified
- [ ] **Performance** — Slow, resource-intensive operations
- [ ] **UX** — Confusing or friction-heavy flows
- [ ] **Scale** — System struggling under load
- [ ] **Security** — Vulnerabilities or risks
- [ ] **Technical Debt** — Code/architecture improvements

### Root Cause Analysis

#### Issue: {{ISSUE_1}}
- **Symptom:** {{SYMPTOM}}
- **Impact:** {{IMPACT}}
- **Root Cause:** {{ROOT_CAUSE}}
- **Evidence:** {{EVIDENCE}}

#### Issue: {{ISSUE_2}}
- **Symptom:** {{SYMPTOM}}
- **Impact:** {{IMPACT}}
- **Root Cause:** {{ROOT_CAUSE}}
- **Evidence:** {{EVIDENCE}}

---

## 3) PLAN — Define Improvements

### Improvement Backlog

| ID | Type | Description | Effort | Impact | Priority |
|----|------|-------------|--------|--------|----------|
| R-001 | | | | | |
| R-002 | | | | | |
| R-003 | | | | | |

### This Iteration Scope
**Focus Area:** {{FOCUS_AREA}}

**Selected Items:**
1. {{ITEM_1}}
2. {{ITEM_2}}
3. {{ITEM_3}}

### Success Criteria
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| | | | |

---

## 4) EXECUTE — Implement Changes

### Execution Checklist

#### Pre-Execution
- [ ] Changes scoped to iteration focus
- [ ] Rollback plan documented
- [ ] Stakeholders notified
- [ ] Testing plan ready

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
| Change | Files Modified | Commit | Status |
|--------|----------------|--------|--------|
| | | | |

---

## 5) VERIFY — Confirm Improvements

### Verification Checklist

#### Functional
- [ ] All existing tests pass
- [ ] New tests pass
- [ ] Manual QA complete
- [ ] No regressions detected

#### Performance
- [ ] Metrics improved or stable
- [ ] No new bottlenecks
- [ ] Load test passed

#### User Impact
- [ ] Feedback addressed
- [ ] UX improvements verified
- [ ] No new friction introduced

### Results

| Metric | Before | After | Delta | Pass? |
|--------|--------|-------|-------|-------|
| | | | | |

### Iteration Outcome
- [ ] **SUCCESS** — All targets met, proceed to next loop
- [ ] **PARTIAL** — Some targets met, carry over remaining
- [ ] **FAILED** — Rollback required, re-analyze

---

## 6) Loop State

### Current Status
```json
{
  "iteration": {{ITERATION}},
  "phase": "{{CURRENT_PHASE}}",
  "status": "{{STATUS}}",
  "started": "{{START_DATE}}",
  "target_completion": "{{TARGET_DATE}}"
}
```

### Iteration History
| # | Focus | Started | Completed | Outcome |
|---|-------|---------|-----------|---------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 7) Escalation Criteria

### When to Exit SROL
- [ ] Critical security vulnerability (immediate hotfix)
- [ ] System-wide outage (incident response)
- [ ] Major feature request (back to TIES)
- [ ] Architecture change needed (back to planning)

### Escalation Path
1. **Minor issues** → Continue SROL
2. **Medium issues** → Expand iteration scope
3. **Major issues** → Pause SROL, escalate to product
4. **Critical issues** → Emergency response protocol

---

## Open Questions
<!-- AGENT: Refinement questions that need clarification for the current iteration. -->
- UNKNOWN

---

## Approval

| Role | Name | Date | Sign-off |
|------|------|------|----------|
| Product Owner | | | |
| Tech Lead | | | |
| Operations | | | |
