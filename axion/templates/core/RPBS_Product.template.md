<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:RPBS -->
# Requirements & Product Boundaries Specification (RPBS) — {{PROJECT_NAME}}

## Document Info
**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Status:** Draft | Review | Approved

---

## 1) Product Vision & Goals

### Vision Statement
{{VISION_STATEMENT}}

### Primary Goals (max 5)
1. {{GOAL_1}}
2. {{GOAL_2}}
3. {{GOAL_3}}

### Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| {{METRIC_1}} | {{TARGET_1}} | {{METHOD_1}} |

---

## 2) Feature Taxonomy

### Core Features (must ship, max 10)
| Feature | Description | Priority |
|---------|-------------|----------|
| {{FEATURE_1}} | {{DESCRIPTION_1}} | P0 |

### Supporting Features (nice-to-have, max 10)
| Feature | Description | Priority |
|---------|-------------|----------|
| {{FEATURE_S1}} | {{DESCRIPTION_S1}} | P1 |

### Deferred Features (explicitly later, max 10)
| Feature | Description | Rationale |
|---------|-------------|-----------|
| {{FEATURE_D1}} | {{DESCRIPTION_D1}} | {{REASON_D1}} |

### Out of Scope / Non-Goals (max 10)
| Non-Goal | Why Excluded |
|----------|--------------|
| {{NONGOAL_1}} | {{REASON_NG1}} |

> **Rule:** If user input is vague, write `UNKNOWN` and add an OPEN_QUESTION.

---

## 3) Actors & Permission Intents

### Actor Types (max 7)
| Actor | Description | Auth Level |
|-------|-------------|------------|
| Guest | Unauthenticated visitor | None |
| Member | Authenticated standard user | Basic |
| Admin | Full system access | Full |

### Permission Intents (Lightweight)
| Actor | Can Do (verbs) | Cannot Do (verbs) | Notes |
|-------|---------------|-------------------|-------|
| Guest | view public content, register | create/edit/delete | Limited access |
| Member | {{MEMBER_CAN}} | {{MEMBER_CANNOT}} | Standard user |
| Admin | {{ADMIN_CAN}} | N/A | Full access |

> **Rule:** Don't invent fine-grained RBAC. Capture intent only.

---

## 4) Core Objects Glossary (Nouns)

| Object | Definition | Owned By | Key Relationships | Notes |
|--------|------------|----------|-------------------|-------|
| {{OBJECT_1}} | {{DEF_1}} | {{OWNER_1}} | {{REL_1}} | |
| {{OBJECT_2}} | {{DEF_2}} | {{OWNER_2}} | {{REL_2}} | |

> **Rule:** Use user language. If naming is unclear, mark `UNKNOWN_NAME` and add an OPEN_QUESTION.

---

## 5) User Journey List (with Outcomes)

Provide 5–12 journeys. Each journey must include success + at least one failure.

### Journey: J-01 — {{JOURNEY_NAME_1}}
- **Primary Actor:** {{ACTOR_1}}
- **Start Trigger:** {{TRIGGER_1}}
- **Success Outcome:** {{SUCCESS_1}}
- **Failure Outcomes:**
  - F1: {{FAILURE_1A}}
  - F2: {{FAILURE_1B}}
- **Acceptance Outcomes ("Done means"):**
  - [ ] {{ACCEPT_1A}}
  - [ ] {{ACCEPT_1B}}

### Journey: J-02 — {{JOURNEY_NAME_2}}
- **Primary Actor:** {{ACTOR_2}}
- **Start Trigger:** {{TRIGGER_2}}
- **Success Outcome:** {{SUCCESS_2}}
- **Failure Outcomes:**
  - F1: {{FAILURE_2A}}
- **Acceptance Outcomes ("Done means"):**
  - [ ] {{ACCEPT_2A}}

---

## 6) Navigation Expectations

### Top-Level Destinations
| Destination Name | Purpose | Primary Journeys | Notes |
|-----------------|---------|------------------|-------|
| {{DEST_1}} | {{PURPOSE_1}} | {{JOURNEYS_1}} | |
| {{DEST_2}} | {{PURPOSE_2}} | {{JOURNEYS_2}} | |

### Entry / Landing Rules
- **Default landing (logged out):** {{LANDING_GUEST}}
- **Default landing (logged in):** {{LANDING_AUTH}}
- **Deep links supported:** Yes | No | UNKNOWN
- **Allowed entry points (if deep links, max 10):** {{DEEPLINKS}}

### Naming Rules
- **Canonical destination names:** {{CANONICAL_NAMES}}
- **Forbidden/avoid synonyms:** {{FORBIDDEN_NAMES}}

---

## 7) Non-Functional Profile (Defaults + Overrides)

### Classification (Pick One Each)
| Dimension | Value | Notes |
|-----------|-------|-------|
| Scale Tier | small \| medium \| large \| UNKNOWN | {{SCALE_NOTES}} |
| Latency Target | relaxed \| standard \| strict \| UNKNOWN | {{LATENCY_NOTES}} |
| Availability Expectation | best-effort \| high \| mission-critical \| UNKNOWN | {{AVAIL_NOTES}} |
| Data Sensitivity | low \| medium \| high \| UNKNOWN | {{SENSITIVE_NOTES}} |
| Compliance Tier | none \| basic \| regulated \| UNKNOWN | {{COMPLIANCE_NOTES}} |

### Performance Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load (p95) | {{PAGE_LOAD}} | RUM |
| API Response (p95) | {{API_RESPONSE}} | APM |
| Concurrent Users | {{CONCURRENT}} | Load Test |

> **Rule:** If not provided, set defaults and record them as assumptions in OPEN_QUESTIONS/ASSUMPTIONS.

---

## 8) Data Classification & Retention

| Data Category | Present? (Y/N/UNKNOWN) | Examples | Retention Expectation |
|---------------|------------------------|----------|----------------------|
| PII | {{PII_PRESENT}} | {{PII_EXAMPLES}} | {{PII_RETENTION}} |
| Financial | {{FIN_PRESENT}} | {{FIN_EXAMPLES}} | {{FIN_RETENTION}} |
| Health | {{HEALTH_PRESENT}} | {{HEALTH_EXAMPLES}} | {{HEALTH_RETENTION}} |
| Internal | {{INT_PRESENT}} | {{INT_EXAMPLES}} | {{INT_RETENTION}} |
| Public | {{PUB_PRESENT}} | {{PUB_EXAMPLES}} | {{PUB_RETENTION}} |

---

## 9) Integrations Inventory

| Integration | Purpose | Direction (In/Out/Both) | Auth Method | Criticality (L/M/H) | Notes |
|-------------|---------|------------------------|-------------|---------------------|-------|
| {{INTEG_1}} | {{PURPOSE_I1}} | {{DIR_1}} | {{AUTH_1}} | {{CRIT_1}} | |
| {{INTEG_2}} | {{PURPOSE_I2}} | {{DIR_2}} | {{AUTH_2}} | {{CRIT_2}} | |

---

## 10) Content & Copywriting Scope

### Copywriting Included?
| Surface | Included? | Notes |
|---------|-----------|-------|
| Microcopy (forms/errors/empty states) | Yes \| No \| UNKNOWN | |
| Onboarding | Yes \| No \| UNKNOWN | |
| Transactional email | Yes \| No \| UNKNOWN | |
| Marketing/landing | Yes \| No \| UNKNOWN | |
| Push/in-app notifications | Yes \| No \| UNKNOWN | |

### Voice/Tone Constraints (if included)
- **Tone adjectives (3):** {{TONE_1}} / {{TONE_2}} / {{TONE_3}}
- **Avoid:** {{AVOID_WORDS}}
- **Reading level target (optional):** {{READING_LEVEL}}

---

## 11) Tech Constraints vs Preferences

### Constraints (must, binding)
| Constraint | Reason |
|------------|--------|
| {{CONSTRAINT_1}} | {{REASON_C1}} |
| {{CONSTRAINT_2}} | {{REASON_C2}} |

### Preferences (nice-to-have, tie-breakers)
| Preference | Reason |
|------------|--------|
| {{PREF_1}} | {{REASON_P1}} |
| {{PREF_2}} | {{REASON_P2}} |

> **Rule:** AXION treats constraints as binding and preferences as tie-breakers.

---

## 12) OPEN_QUESTIONS (Mandatory)

| ID | Question | Why Needed | Impact if Wrong | Owner | Status |
|----|----------|------------|-----------------|-------|--------|
| Q-01 | {{QUESTION_1}} | {{WHY_1}} | {{IMPACT_1}} | User/Agent | Open |
| Q-02 | {{QUESTION_2}} | {{WHY_2}} | {{IMPACT_2}} | User/Agent | Open |

---

## 13) ASSUMPTIONS (Mandatory)

| ID | Assumption | Basis | Risk | How to Validate |
|----|------------|-------|------|-----------------|
| A-01 | {{ASSUMPTION_1}} | {{BASIS_1}} | {{RISK_1}} | {{VALIDATE_1}} |
| A-02 | {{ASSUMPTION_2}} | {{BASIS_2}} | {{RISK_2}} | {{VALIDATE_2}} |

> **Rule:** Any UNKNOWN in RPBS must be represented in OPEN_QUESTIONS or ASSUMPTIONS.

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Stakeholder | | | |
