# Requirements & Product Boundaries Specification (RPBS)

> **Level 0 — Product Truth.** This is the single authoritative source for *what* the product does, who it serves, and what is in/out of scope. Every downstream document (REBS, SCHEMA_SPEC, COMPONENT_SPEC, domain templates) derives from this file.

## How to Use This Template

1. **Fill placeholders.** Replace every `{{PLACEHOLDER}}` with real product data. If the answer is unknown, write `UNKNOWN` and add an entry to §34 OPEN_QUESTIONS.
2. **Pick one per choice field.** Where you see `Yes | No | UNKNOWN` or `low | medium | high`, delete the options you don't need and keep the one that applies.
3. **Delete unused rows.** Tables show minimum example rows. Add more rows as needed; delete rows that don't apply.
4. **Respect the rules.** Each section ends with a `> **Rule:**` block. These are enforced by the verify step — violations will block the lock gate.
5. **Cross-reference REBS.** Sections here map 1:1 to REBS engineering policies (§1–§34). After filling RPBS, the seed step propagates your choices into REBS.
6. **Cascade order.** RPBS is filled first. Content-fill uses it to populate all downstream module templates.

### Placeholder Format

- `{{PLACEHOLDER_NAME}}` — must be replaced with real content or `UNKNOWN`
- `Y/N/UNKNOWN` — pick exactly one
- `low | medium | high | UNKNOWN` — pick exactly one
- Table rows with `{{...}}` — fill or delete; do not leave raw placeholders

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

## 11) Notifications & Messaging Matrix

### Notification Channels Supported
| Channel | Enabled? | Notes |
|---------|----------|-------|
| Email | Yes \| No \| UNKNOWN | |
| In-app | Yes \| No \| UNKNOWN | |
| Push | Yes \| No \| UNKNOWN | |
| SMS | Yes \| No \| UNKNOWN | |

### Notification Events
| Event ID | Trigger Condition | Audience (Actor) | Channel(s) | User Opt-Out? | Urgency (L/M/H) | Required Copy? | Notes |
|----------|-------------------|------------------|------------|---------------|-----------------|----------------|-------|
| N-01 | {{TRIGGER_N1}} | {{AUDIENCE_N1}} | {{CHANNEL_N1}} | Y/N/UNKNOWN | L/M/H | Y/N | |
| N-02 | {{TRIGGER_N2}} | {{AUDIENCE_N2}} | {{CHANNEL_N2}} | Y/N/UNKNOWN | L/M/H | Y/N | |

### Delivery Expectations
- **Send timing:** immediate \| batched \| UNKNOWN
- **Quiet hours:** Yes \| No \| UNKNOWN
- **Retry behavior:** Yes \| No \| UNKNOWN

> **Rule:** If any channel is enabled but events are unknown, add OPEN_QUESTIONS.

---

## 12) Search, Sort, Filter, and Discovery

### Search Scope
| Entity/Object | Searchable? | Search Fields (max 10) | Fuzzy Match? | Notes |
|---------------|-------------|------------------------|--------------|-------|
| {{ENTITY_S1}} | Y/N/UNKNOWN | {{FIELDS_S1}} | Y/N/UNKNOWN | |
| {{ENTITY_S2}} | Y/N/UNKNOWN | {{FIELDS_S2}} | Y/N/UNKNOWN | |

### Filters
| Entity/Object | Filter Fields (max 10) | Default Filters | Notes |
|---------------|------------------------|-----------------|-------|
| {{ENTITY_F1}} | {{FILTER_F1}} | {{DEFAULT_F1}} | |

### Sorting
| Entity/Object | Sort Options | Default Sort | Notes |
|---------------|--------------|--------------|-------|
| {{ENTITY_SO1}} | {{SORT_SO1}} | {{DEFAULT_SO1}} | |

### Pagination Expectations
- **Default page size:** {{PAGE_SIZE}} \| UNKNOWN
- **Pagination type:** cursor \| offset \| UNKNOWN

> **Rule:** If search is enabled, define at least one searchable entity or mark UNKNOWN + OPEN_QUESTION.

---

## 13) File / Media Handling

### Upload Support
- **Uploads allowed:** Yes \| No \| UNKNOWN
- **Download access:** public \| private \| mixed \| UNKNOWN

### File Types & Limits
| File Type Category | Allowed? | Examples | Max Size | Notes |
|--------------------|----------|----------|----------|-------|
| Images | Y/N/UNKNOWN | {{IMG_EXAMPLES}} | {{IMG_SIZE}} | |
| Documents | Y/N/UNKNOWN | {{DOC_EXAMPLES}} | {{DOC_SIZE}} | |
| Video | Y/N/UNKNOWN | {{VID_EXAMPLES}} | {{VID_SIZE}} | |

### Storage & Security Expectations
- **Virus scanning required:** Yes \| No \| UNKNOWN
- **Signed URLs required:** Yes \| No \| UNKNOWN
- **Expiring links:** Yes \| No \| UNKNOWN
- **PII in files allowed:** Yes \| No \| UNKNOWN

### Moderation (if user-generated content)
- **Content moderation required:** Yes \| No \| UNKNOWN
- **If Yes:** manual \| automatic \| both \| UNKNOWN

> **Rule:** If uploads are enabled, max size and allowed types cannot be UNKNOWN (must ask).

---

## 14) Billing, Plans, and Entitlements

### Billing Included?
- **Billing required:** Yes \| No \| UNKNOWN
- **If Yes:** subscription \| one-time \| usage-based \| mixed \| UNKNOWN

### Plans / Tiers
| Plan ID | Name | Price (optional) | Billing Period | Intended User | Notes |
|---------|------|------------------|----------------|---------------|-------|
| P-01 | {{PLAN_1}} | {{PRICE_1}} | {{PERIOD_1}} | {{USER_1}} | |
| P-02 | {{PLAN_2}} | {{PRICE_2}} | {{PERIOD_2}} | {{USER_2}} | |

### Entitlements (Feature Gates)
| Feature | Available In Plans | Limits (if any) | Notes |
|---------|-------------------|-----------------|-------|
| {{FEAT_E1}} | {{PLANS_E1}} | {{LIMIT_E1}} | |

### Trials, Upgrades, and Cancellations
- **Trial included:** Yes \| No \| UNKNOWN
- **Trial length:** {{TRIAL_LENGTH}} \| UNKNOWN
- **Upgrade/downgrade allowed:** Yes \| No \| UNKNOWN
- **Cancellation behavior:** immediate \| end-of-period \| UNKNOWN
- **Refunds:** Yes \| No \| UNKNOWN

### Billing Edge Cases
- **Payment failure handling:** UNKNOWN \| Defined: {{PAYMENT_FAIL}}
- **Grace period:** Yes \| No \| UNKNOWN
- **Proration:** Yes \| No \| UNKNOWN

> **Rule:** If billing is Yes, "billing type" cannot remain UNKNOWN—add OPEN_QUESTIONS.

---

## 15) Admin / Backoffice Requirements

### Admin Interface Included?
- **Admin UI required:** Yes \| No \| UNKNOWN

### Admin Capabilities
| Capability | Required? | Notes |
|------------|-----------|-------|
| Manage users (create/invite/disable) | Y/N/UNKNOWN | |
| Manage roles/permissions | Y/N/UNKNOWN | |
| View audit logs | Y/N/UNKNOWN | |
| View billing/subscriptions | Y/N/UNKNOWN | |
| Content moderation | Y/N/UNKNOWN | |
| Data export | Y/N/UNKNOWN | |
| Support tooling (impersonation?) | Y/N/UNKNOWN | |

### Access & Security
- **Admin access restricted to:** {{ADMIN_ACTORS}}
- **Strong auth required (MFA/SSO):** Yes \| No \| UNKNOWN
- **Admin actions must be auditable:** Yes \| No \| UNKNOWN

### Operational Expectations
- **Support requests workflow:** Yes \| No \| UNKNOWN
- **SLA expectations (if any):** {{SLA_NOTES}}

> **Rule:** If admin is Yes, auditing requirement must be specified or set to default Yes + log as assumption.

---

## 16) Audit Logging, Activity History, and Data Export

### Audit Logging Required?
- **Audit log required:** Yes \| No \| UNKNOWN
- **If Yes, who can view it?:** {{AUDIT_VIEWERS}}

### Auditable Events (minimum set)
| Event Category | Required? | Notes |
|----------------|-----------|-------|
| Auth events (login/logout/failed attempts) | Y/N/UNKNOWN | |
| Permission/role changes | Y/N/UNKNOWN | |
| Data changes (create/update/delete of core objects) | Y/N/UNKNOWN | |
| Billing events (if billing enabled) | Y/N/UNKNOWN | |
| Admin actions | Y/N/UNKNOWN | |

### Data Export
- **User export required:** Yes \| No \| UNKNOWN
- **Admin export required:** Yes \| No \| UNKNOWN
- **Export formats:** CSV \| JSON \| UNKNOWN
- **Scope:** full account \| per object \| UNKNOWN
- **Data portability requirement:** Yes \| No \| UNKNOWN

> **Rule:** If auditing is Yes, define at least 3 auditable categories or add OPEN_QUESTIONS.

---

## 17) Abuse Prevention, Rate Limits, and Safety

### Abuse Prevention Needed?
- **Abuse prevention required:** Yes \| No \| UNKNOWN
- **Rate limiting required:** Yes \| No \| UNKNOWN
- **Anti-spam controls required:** Yes \| No \| UNKNOWN

### Threat/Abuse Scenarios
| Scenario | Likelihood (L/M/H) | Impact (L/M/H) | Notes |
|----------|-------------------|----------------|-------|
| Credential stuffing | L/M/H | L/M/H | |
| Spam content submissions | L/M/H | L/M/H | |
| Excessive API calls | L/M/H | L/M/H | |
| Scraping | L/M/H | L/M/H | |

### User Controls
- **Report content/user:** Yes \| No \| UNKNOWN
- **Blocking/muting:** Yes \| No \| UNKNOWN
- **CAPTCHA:** Yes \| No \| UNKNOWN

> **Rule:** If public signup exists, rate limiting defaults to Yes unless explicitly disabled.

---

## 18) Data Import, Migration, and Onboarding

### Data Import Required?
- **Import required:** Yes \| No \| UNKNOWN
- **If Yes, source types:** CSV \| API \| manual \| UNKNOWN

### Import Scope
| Object | Import Required? | Source Format | Notes |
|--------|------------------|---------------|-------|
| {{OBJ_IMP1}} | Y/N/UNKNOWN | {{FORMAT_IMP1}} | |

### Migration Expectations
- **Existing system migration:** Yes \| No \| UNKNOWN
- **If Yes, migration timeline constraint:** {{MIGRATION_TIMELINE}}

> **Rule:** If import is Yes, at least one object must be listed.

---

## 19) Offline, Sync, and Caching Expectations

### Offline Support
- **Offline required:** Yes \| No \| UNKNOWN
- **If Yes, offline modes:** read-only \| queued writes \| full offline \| UNKNOWN

### Sync & Conflict Rules
- **Conflict resolution:** last-write-wins \| user-merge \| UNKNOWN
- **Background sync:** Yes \| No \| UNKNOWN
- **Cache TTL expectations:** {{CACHE_TTL}}

> **Rule:** If mobile is a target platform, offline should be explicitly Yes/No (not UNKNOWN).

---

## 20) Reliability, Recovery, and Support Expectations

### Reliability Tier
- **Reliability:** basic \| standard \| high \| UNKNOWN

### Recovery Expectations
- **Backups required:** Yes \| No \| UNKNOWN
- **RPO/RTO targets:** UNKNOWN \| Defined: {{RPO_RTO}}
- **Disaster recovery required:** Yes \| No \| UNKNOWN

### Support Expectations
- **Support channel:** email \| chat \| UNKNOWN
- **SLA expectation:** none \| basic \| strict \| UNKNOWN

> **Rule:** If data sensitivity is high, backups default to Yes.

---

## 21) Tenancy / Organization Model

### Tenancy Type
- **Tenancy:** single-user \| team/org \| multi-tenant enterprise \| UNKNOWN

### Organization Concepts (if not single-user)
| Concept | Required? | Notes |
|---------|-----------|-------|
| Organizations / Workspaces | Y/N/UNKNOWN | |
| Members & roles | Y/N/UNKNOWN | |
| Invitations | Y/N/UNKNOWN | |
| Multiple orgs per user | Y/N/UNKNOWN | |
| Switching org context | Y/N/UNKNOWN | |

### Data Isolation Expectations
- **Strict isolation between orgs:** Yes \| No \| UNKNOWN
- **Shared/public resources across orgs:** Yes \| No \| UNKNOWN

> **Rule:** If tenancy is not single-user, invitations must be Yes/No (not UNKNOWN).

---

## 22) Public API / Developer Platform

### External API Required?
- **Public API:** Yes \| No \| UNKNOWN
- **If Yes, audience:** partners \| customers \| internal \| UNKNOWN

### API Access Model
- **API keys:** Yes \| No \| UNKNOWN
- **OAuth for API:** Yes \| No \| UNKNOWN
- **Scopes/permissions:** simple \| advanced \| UNKNOWN

### API Requirements
| Requirement | Value |
|-------------|-------|
| Rate limits expected | {{API_RATE_LIMITS}} |
| Webhooks required | Yes \| No \| UNKNOWN |
| API versioning expectations | {{API_VERSIONING}} |
| Sandbox/testing environment | Yes \| No \| UNKNOWN |

### Developer Experience
- **Docs required:** Yes \| No \| UNKNOWN
- **SDK required:** Yes \| No \| UNKNOWN
- **If SDK, languages desired (max 5):** {{SDK_LANGUAGES}}

> **Rule:** If public API is Yes, versioning cannot be UNKNOWN.

---

## 23) Workflow Automation, Rules, and Background Jobs

### Automation Required?
- **Automation/rules engine:** Yes \| No \| UNKNOWN
- **Scheduled jobs:** Yes \| No \| UNKNOWN
- **Event-driven triggers:** Yes \| No \| UNKNOWN

### Automation Use Cases (max 10)
| Use Case | Trigger | Action | Notes |
|----------|---------|--------|-------|
| {{AUTO_UC1}} | {{AUTO_TRIGGER1}} | {{AUTO_ACTION1}} | |

### Background Processing Expectations
- **Must be near-real-time:** Yes \| No \| UNKNOWN
- **Long-running jobs exist:** Yes \| No \| UNKNOWN
- **Progress reporting required:** Yes \| No \| UNKNOWN

> **Rule:** If automation is Yes, list at least 2 use cases or add OPEN_QUESTIONS.

---

## 24) Analytics, Reporting, and Dashboards

### Analytics Required?
- **Product analytics:** Yes \| No \| UNKNOWN
- **Operational analytics (admin):** Yes \| No \| UNKNOWN
- **Customer-facing reports:** Yes \| No \| UNKNOWN

### Reports Needed (max 15)
| Report/Dashboard | Audience | Key Metrics/Fields | Frequency |
|------------------|----------|-------------------|-----------|
| {{REPORT_1}} | {{AUDIENCE_R1}} | {{METRICS_R1}} | {{FREQ_R1}} |

### Data Export for Analytics
- **Export for reports required:** Yes \| No \| UNKNOWN
- **If Yes:** CSV \| JSON \| UNKNOWN

> **Rule:** If customer-facing reports are Yes, list at least 3 reports or add OPEN_QUESTIONS.

---

## 25) Collaboration Features

### Collaboration Included?
- **Collaboration required:** Yes \| No \| UNKNOWN

### Collaboration Capabilities
| Capability | Required? | Notes |
|------------|-----------|-------|
| Comments on objects | Y/N/UNKNOWN | |
| @mentions | Y/N/UNKNOWN | |
| Sharing links | Y/N/UNKNOWN | |
| Permissions per object | Y/N/UNKNOWN | |
| Activity feed | Y/N/UNKNOWN | |
| Notifications for collaboration events | Y/N/UNKNOWN | |

### Sharing Model
- **Sharing scope:** internal only \| external share links \| both \| UNKNOWN
- **Link access:** public \| invited users \| authenticated \| UNKNOWN
- **Expiring links:** Yes \| No \| UNKNOWN

> **Rule:** If collaboration is Yes, sharing model cannot be UNKNOWN.

---

## 26) Real-Time Features

### Real-time Required?
- **Real-time updates:** Yes \| No \| UNKNOWN
- **Presence/typing indicators:** Yes \| No \| UNKNOWN
- **Live collaboration editing:** Yes \| No \| UNKNOWN

### Real-time Use Cases (max 10)
| Use Case | Objects | Expected Latency | Notes |
|----------|---------|------------------|-------|
| {{RT_UC1}} | {{RT_OBJ1}} | {{RT_LATENCY1}} | |

### Delivery Mode Preference
- **Delivery mode:** WebSockets \| SSE \| polling \| UNKNOWN

> **Rule:** If real-time is Yes, list at least 1 use case.

---

## 27) User-Generated Content (UGC) & Moderation

### UGC Included?
- **Users can create public/shared content:** Yes \| No \| UNKNOWN
- **Content types:** text \| images \| files \| links \| UNKNOWN

### Moderation Requirements
- **Moderation required:** Yes \| No \| UNKNOWN
- **If Yes:** manual \| automated \| both \| UNKNOWN
- **Reporting flow required:** Yes \| No \| UNKNOWN
- **Blocking/muting required:** Yes \| No \| UNKNOWN

### Safety Constraints
- **Prohibited content categories:** {{PROHIBITED_CONTENT}}
- **Data exposure rules:** {{EXPOSURE_RULES}}

> **Rule:** If UGC is Yes, reporting flow must be Yes/No (not UNKNOWN).

---

## 28) Billing Expansion: Taxes, Invoicing, and Payments Ops

> *Only applicable if Billing in §14 is Yes.*

### Tax Requirements
- **Taxes required:** Yes \| No \| UNKNOWN
- **If Yes, regions:** {{TAX_REGIONS}} \| UNKNOWN
- **Tax receipts required:** Yes \| No \| UNKNOWN

### Invoicing
- **Invoices required:** Yes \| No \| UNKNOWN
- **Invoice audience:** business \| admin \| user \| UNKNOWN
- **Custom invoice fields:** Yes \| No \| UNKNOWN

### Payment Operations
- **Payment method management:** Yes \| No \| UNKNOWN
- **Failed payment dunning emails:** Yes \| No \| UNKNOWN
- **Manual comp/refund tools:** Yes \| No \| UNKNOWN

> **Rule:** If invoicing is Yes, invoice audience cannot be UNKNOWN.

---

## 29) User Privacy Controls, Consent, and Account Lifecycle

### Privacy Controls Required?
- **Account deletion:** Yes \| No \| UNKNOWN
- **Data export (self-serve):** Yes \| No \| UNKNOWN
- **Consent collection (cookies/marketing/terms):** Yes \| No \| UNKNOWN
- **Parental consent needed:** Yes \| No \| UNKNOWN

### Account Lifecycle Rules
- **Deletion mode:** soft \| hard \| UNKNOWN
- **Deletion grace period:** Yes \| No \| UNKNOWN
- **Data retained after deletion (for billing/audit):** Yes \| No \| UNKNOWN

### Privacy Requests
- **GDPR/CCPA style requests:** Yes \| No \| UNKNOWN
- **Response time expectation:** {{PRIVACY_RESPONSE_TIME}}

> **Rule:** If compliance is regulated, account deletion and export must be explicitly Yes/No.

---

## 30) Feature Flags, Experiments, and Rollouts

### Feature Flags Needed?
- **Feature flags:** Yes \| No \| UNKNOWN
- **A/B experiments:** Yes \| No \| UNKNOWN
- **Gradual rollouts:** Yes \| No \| UNKNOWN

### Flag Scope
- **Scope:** user-scoped \| org-scoped \| global \| UNKNOWN
- **Admin-controlled toggles:** Yes \| No \| UNKNOWN

### Experiment Requirements (if A/B is Yes)
- **Metrics to track:** {{EXPERIMENT_METRICS}}
- **Duration constraints:** {{EXPERIMENT_DURATION}}
- **Ethical constraints (if any):** {{EXPERIMENT_ETHICS}}

> **Rule:** If gradual rollouts are required, feature flags cannot be UNKNOWN.

---

## 31) Support Workflow Requirements

### Support Included?
- **Support workflow required:** Yes \| No \| UNKNOWN

### Support Capabilities
| Capability | Required? | Notes |
|------------|-----------|-------|
| Contact support form | Y/N/UNKNOWN | |
| Ticket tracking | Y/N/UNKNOWN | |
| Internal support notes | Y/N/UNKNOWN | |
| Attachments in tickets | Y/N/UNKNOWN | |
| User identity verification | Y/N/UNKNOWN | |
| SLA tracking | Y/N/UNKNOWN | |

### Support Access
- **Support staff roles:** {{SUPPORT_ROLES}}
- **Impersonation allowed:** Yes \| No \| UNKNOWN (default No)
- **Audit support actions:** Yes \| No \| UNKNOWN

> **Rule:** If impersonation is Yes, auditing must be Yes.

---

## 32) Enterprise Expectations: SLA/SLO and Contractual Needs

### Enterprise Requirements?
- **Enterprise customers:** Yes \| No \| UNKNOWN

### SLA/SLO Targets (if enterprise Yes)
- **Availability target:** {{AVAILABILITY_TARGET}} (e.g., 99.9%) \| UNKNOWN
- **Support response target:** {{SUPPORT_RESPONSE}} (e.g., 24h) \| UNKNOWN
- **Data retention commitments:** {{RETENTION_COMMITMENT}}
- **Audit/compliance reporting required:** Yes \| No \| UNKNOWN

### Contractual/Procurement Needs
- **SSO/SAML required:** Yes \| No \| UNKNOWN
- **Security questionnaire support:** Yes \| No \| UNKNOWN
- **DPA required:** Yes \| No \| UNKNOWN

> **Rule:** If enterprise is Yes, SSO requirement must be Yes/No (not UNKNOWN).

---

## 33) Tech Constraints vs Preferences

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

## 34) OPEN_QUESTIONS (Mandatory)

| ID | Question | Why Needed | Impact if Wrong | Owner | Status |
|----|----------|------------|-----------------|-------|--------|
| Q-01 | {{QUESTION_1}} | {{WHY_1}} | {{IMPACT_1}} | User/Agent | Open |
| Q-02 | {{QUESTION_2}} | {{WHY_2}} | {{IMPACT_2}} | User/Agent | Open |

---

## 35) ASSUMPTIONS (Mandatory)

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
