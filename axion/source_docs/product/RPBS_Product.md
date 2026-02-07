# Requirements and Product Behavior Specification (RPBS)

**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Status:** DRAFT | REVIEW | APPROVED
**Last Updated:** {{DATE}}

<!-- AXION:AGENT_GUIDANCE
This is the ROOT document of the AXION pipeline. Everything downstream depends on it.
Fill this document FIRST, using the user's project idea/description as your primary input.

RULES:
- Every section MUST be filled. Use UNKNOWN only when the user's input genuinely doesn't cover that area.
- When you write UNKNOWN, you MUST also add a corresponding Open Question in §34.
- Prefer concrete specifics over vague generalities. "Users can create, edit, and delete recipes" is better than "CRUD operations on data."
- Cross-reference: Domain templates and REBS reference specific sections by number (e.g., "source: RPBS §3"). Do NOT renumber or remove sections.
- If a capability is not needed (e.g., no billing), mark it "N/A — <reason>" rather than UNKNOWN.
-->

---

## §1 — Product Overview

<!-- AGENT: Derive from the user's project description. State what the product IS, what problem it solves, and its primary value proposition. Be specific — "A recipe sharing platform where home cooks can publish, discover, and save recipes" not "An app for recipes." -->

**Product Name:** {{PRODUCT_NAME}}
**One-Line Description:** UNKNOWN
**Problem Statement:** UNKNOWN
**Primary Value Proposition:** UNKNOWN
**Target Platform(s):** web | mobile | desktop | all

---

## §2 — Feature Taxonomy

<!-- AGENT: List every user-facing feature the product offers. Group by category. Each feature gets a unique ID for downstream tracing. Every feature listed here MUST appear in at least one User Journey (§5) and one Screen (SCREENMAP). -->

| Feature ID | Category | Feature Name | Description | MVP? | Priority |
|-----------|----------|-------------|-------------|------|----------|
| FEAT_001 | UNKNOWN | UNKNOWN | UNKNOWN | Yes/No | P0/P1/P2 |

### Feature Dependency Map
<!-- AGENT: Which features depend on other features? e.g., "Commenting depends on Auth + Content Viewing" -->
| Feature | Depends On |
|---------|-----------|
| UNKNOWN | UNKNOWN |

---

## §3 — Actors & Permission Intents

<!-- AGENT: Identify every distinct user type/role and what they are allowed to do. This section is referenced by EVERY domain template's RPBS_DERIVATIONS. Be thorough — missing an actor here means downstream modules can't properly scope their work. -->

### Actor Definitions
| Actor ID | Actor Name | Description | Auth Required? |
|----------|-----------|-------------|---------------|
| ACTOR_001 | UNKNOWN | UNKNOWN | Yes/No |

### Permission Matrix
<!-- AGENT: For each actor, define what they can do. Use CRUD+ notation: Create, Read, Update, Delete, Execute, Admin -->
| Actor | Resource/Feature | Permissions | Conditions/Constraints |
|-------|-----------------|-------------|----------------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Actor Relationships
<!-- AGENT: Can actors have relationships? e.g., "An Org Admin manages multiple Team Members" -->
- UNKNOWN

---

## §4 — Core Objects Glossary

<!-- AGENT: Define every data entity/object the system manages. This is the single source of truth for entity naming — ALL downstream modules (database, backend, frontend, contracts) MUST use these exact names. Include relationships between objects. -->

| Object ID | Object Name | Description | Owner Domain | Relationships |
|----------|-------------|-------------|-------------|---------------|
| OBJ_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Object Lifecycle Rules
<!-- AGENT: For each core object, describe its lifecycle: how is it created, what states does it go through, when/how is it deleted? -->
| Object | Created By | States | Deletion Policy |
|--------|-----------|--------|----------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## §5 — User Journeys & Workflows

<!-- AGENT: Document the primary user journeys — the step-by-step flows users follow to accomplish their goals. Each journey should reference Actors (§3), Features (§2), and Objects (§4). These journeys drive SCREENMAP, TESTPLAN, and frontend/backend module content. -->

### Journey 1: {{JOURNEY_NAME}}
- **Actor:** UNKNOWN (ref: §3)
- **Goal:** UNKNOWN
- **Trigger:** UNKNOWN
- **Preconditions:** UNKNOWN
- **Steps:**
  1. UNKNOWN
  2. UNKNOWN
  3. UNKNOWN
- **Success Outcome:** UNKNOWN
- **Failure Outcomes:**
  - UNKNOWN → Error message: UNKNOWN → Recovery: UNKNOWN
- **Features Used:** UNKNOWN (ref: §2)
- **Objects Touched:** UNKNOWN (ref: §4)

### Journey 2: {{JOURNEY_NAME}}
- **Actor:** UNKNOWN
- **Goal:** UNKNOWN
- **Trigger:** UNKNOWN
- **Preconditions:** UNKNOWN
- **Steps:**
  1. UNKNOWN
  2. UNKNOWN
- **Success Outcome:** UNKNOWN
- **Failure Outcomes:**
  - UNKNOWN → Error message: UNKNOWN → Recovery: UNKNOWN
- **Features Used:** UNKNOWN
- **Objects Touched:** UNKNOWN

### Journey 3: {{JOURNEY_NAME}}
- **Actor:** UNKNOWN
- **Goal:** UNKNOWN
- **Trigger:** UNKNOWN
- **Preconditions:** UNKNOWN
- **Steps:**
  1. UNKNOWN
  2. UNKNOWN
- **Success Outcome:** UNKNOWN
- **Failure Outcomes:**
  - UNKNOWN → Error message: UNKNOWN → Recovery: UNKNOWN
- **Features Used:** UNKNOWN
- **Objects Touched:** UNKNOWN

<!-- AGENT: Add more journeys as needed. Every feature in §2 should appear in at least one journey. If a feature has no journey, question whether it's actually needed. -->

---

## §6 — Navigation & Information Architecture

<!-- AGENT: Define the top-level navigation structure. What are the main sections/pages? How does the user move between them? This feeds directly into SCREENMAP and frontend module. -->

### Primary Navigation
| Nav Item | Destination | Visible To | Badge/Indicator |
|----------|-----------|-----------|----------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Navigation Rules
<!-- AGENT: Define any conditional navigation: hidden items, role-based visibility, redirect rules -->
- UNKNOWN

### URL/Route Structure
<!-- AGENT: Define the route patterns. e.g., /dashboard, /recipes/:id, /settings/profile -->
| Route Pattern | Page/View | Auth Required? | Notes |
|--------------|----------|---------------|-------|
| UNKNOWN | UNKNOWN | Yes/No | UNKNOWN |

---

## §7 — Non-Functional Profile

<!-- AGENT: Define performance, reliability, and quality requirements. These drive architecture decisions in REBS and testing targets in TESTPLAN. If the user hasn't specified, use sensible defaults and note them as assumptions. -->

### Performance Targets
| Metric | Target | Measurement |
|--------|--------|------------|
| Page load time | UNKNOWN | UNKNOWN |
| API response time (p95) | UNKNOWN | UNKNOWN |
| Time to interactive | UNKNOWN | UNKNOWN |

### Scale Expectations
| Metric | Expected Range | Notes |
|--------|---------------|-------|
| Concurrent users | UNKNOWN | UNKNOWN |
| Data volume (year 1) | UNKNOWN | UNKNOWN |
| Storage requirements | UNKNOWN | UNKNOWN |

### Reliability Requirements
| Aspect | Requirement |
|--------|------------|
| Uptime target | UNKNOWN |
| Data backup frequency | UNKNOWN |
| Disaster recovery | UNKNOWN |

### Compliance Requirements
| Requirement | Applicable? | Details |
|------------|------------|---------|
| GDPR | Yes/No/N/A | UNKNOWN |
| SOC 2 | Yes/No/N/A | UNKNOWN |
| HIPAA | Yes/No/N/A | UNKNOWN |
| Other | UNKNOWN | UNKNOWN |

---

## §8 — Data Classification & Sensitivity

<!-- AGENT: Classify what data the system handles and its sensitivity level. This drives database security, logging redaction rules (REBS §6), and privacy controls (§29). -->

| Data Category | Examples | Sensitivity | Storage Rules | Logging Rules |
|--------------|---------|------------|--------------|---------------|
| PII | UNKNOWN | High/Medium/Low | UNKNOWN | Never log / Redact |
| Credentials | UNKNOWN | Critical | UNKNOWN | Never log |
| User Content | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| System Data | UNKNOWN | Low | UNKNOWN | Safe to log |

### Data Retention Policy
| Data Type | Retention Period | Deletion Trigger | Archive Strategy |
|----------|----------------|-----------------|-----------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## §9 — Integrations & External Services

<!-- AGENT: List every external service the product connects to. This feeds the integrations module and REBS integration complexity assessment. Include both required and optional integrations. -->

| Integration ID | Service | Purpose | Required for MVP? | Data Exchanged | Direction |
|---------------|---------|---------|------------------|---------------|-----------|
| INT_001 | UNKNOWN | UNKNOWN | Yes/No | UNKNOWN | Inbound/Outbound/Both |

### Integration Criticality
<!-- AGENT: If this integration goes down, what happens? -->
| Integration | Fallback Strategy | User Impact |
|------------|------------------|------------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## §10 — Copywriting & Content Strategy

<!-- AGENT: Define the voice, tone, and content rules for the product. This drives the COPY_GUIDE template. -->

### Voice & Tone
- **Brand Voice:** UNKNOWN (e.g., professional, friendly, playful, authoritative)
- **Formality Level:** UNKNOWN (e.g., casual, semi-formal, formal)
- **Target Reading Level:** UNKNOWN

### Copywriting Toggles
<!-- AGENT: Should AXION generate user-facing copy, or leave placeholders? -->
| Surface | Generate Copy? | Tone Override |
|---------|---------------|--------------|
| Button labels | Yes/No | UNKNOWN |
| Error messages | Yes/No | UNKNOWN |
| Empty states | Yes/No | UNKNOWN |
| Onboarding text | Yes/No | UNKNOWN |
| Marketing/landing | Yes/No | UNKNOWN |

### Forbidden Patterns
<!-- AGENT: Words, phrases, or patterns that must NEVER appear in generated copy -->
- UNKNOWN

---

## §11 — Notifications & Messaging

<!-- AGENT: Define what notifications the system sends, through what channels, and under what conditions. N/A if the product has no notifications. -->

| Notification ID | Trigger | Channel | Recipient | Content Summary | Configurable? |
|----------------|---------|---------|-----------|----------------|--------------|
| NOTIF_001 | UNKNOWN | Email/Push/In-App/SMS | UNKNOWN | UNKNOWN | Yes/No |

### Notification Preferences
<!-- AGENT: Can users control their notification settings? -->
- User opt-out supported: Yes/No
- Frequency controls: UNKNOWN
- Channel preferences: UNKNOWN

---

## §12 — Search & Discovery

<!-- AGENT: Define how users find content within the product. N/A if the product has no search functionality. -->

### Searchable Content
| Content Type | Searchable Fields | Filters Available | Sort Options |
|-------------|------------------|------------------|-------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Search Behavior
- Search type: Full-text / Fuzzy / Exact
- Auto-suggest: Yes/No
- Search results display: UNKNOWN

---

## §13 — Uploads & Media

<!-- AGENT: Define what users can upload, size limits, processing rules. N/A if no uploads. This section is referenced by domain templates to determine if media handling is in scope. -->

| Upload Type | Accepted Formats | Max Size | Processing | Storage |
|------------|-----------------|---------|-----------|---------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Media Display Rules
- Image optimization: UNKNOWN
- Video handling: UNKNOWN
- CDN strategy: UNKNOWN

---

## §14 — Billing & Entitlements

<!-- AGENT: Define pricing tiers, feature gating, and payment flows. N/A if the product is free. This section is referenced by domain templates to determine if billing is in scope. -->

### Pricing Model
- Model type: Free / Freemium / Subscription / One-time / Usage-based
- Currency: UNKNOWN

### Tiers
| Tier | Price | Features Included | Limits |
|------|-------|------------------|--------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Payment Flows
- Payment provider: UNKNOWN
- Trial period: UNKNOWN
- Upgrade/downgrade rules: UNKNOWN
- Cancellation policy: UNKNOWN

---

## §15 — Error Handling Philosophy

<!-- AGENT: Define the product's approach to errors. This feeds COPY_GUIDE error messages, backend error envelopes, and frontend error UX. -->

### Error Categories
| Category | User Message Style | Recovery Action | Example |
|----------|-------------------|----------------|---------|
| Validation | UNKNOWN | UNKNOWN | UNKNOWN |
| Permission | UNKNOWN | UNKNOWN | UNKNOWN |
| Not Found | UNKNOWN | UNKNOWN | UNKNOWN |
| Server Error | UNKNOWN | UNKNOWN | UNKNOWN |
| Network Error | UNKNOWN | UNKNOWN | UNKNOWN |

### Error UX Principles
- Show errors inline vs toast vs page: UNKNOWN
- Auto-retry on network errors: Yes/No
- Error reporting to user: UNKNOWN

---

## §16 — Onboarding & First-Run Experience

<!-- AGENT: How does a new user get started? What do they see first? This feeds UX_Foundations and frontend. -->

- First-run experience: UNKNOWN
- Required setup steps: UNKNOWN
- Sample/demo data: UNKNOWN
- Tutorial/guidance: UNKNOWN
- Time-to-value target: UNKNOWN

---

## §17 — Settings & Preferences

<!-- AGENT: What can users configure about their experience? -->

| Setting | Default | User Configurable? | Scope |
|---------|---------|-------------------|-------|
| UNKNOWN | UNKNOWN | Yes/No | User/Org/Global |

---

## §18 — Accessibility Requirements

<!-- AGENT: Define accessibility standards. This feeds UX_Foundations and UI_Constraints. -->

- Target standard: WCAG 2.1 AA / AAA / None specified
- Keyboard navigation: Required / Nice-to-have
- Screen reader support: Required / Nice-to-have
- Color contrast requirements: UNKNOWN
- Motion/animation policy: UNKNOWN

---

## §19 — Internationalization & Localization

<!-- AGENT: Is the product multi-language? N/A if single-language only. -->

- Supported languages: UNKNOWN
- RTL support needed: Yes/No
- Date/time format handling: UNKNOWN
- Currency localization: UNKNOWN

---

## §20 — Offline & Connectivity

<!-- AGENT: Does the product work offline? What happens with poor connectivity? -->

- Offline support: Yes/No/Partial
- Offline capabilities: UNKNOWN
- Sync strategy: UNKNOWN
- Connectivity degradation handling: UNKNOWN

---

## §21 — Tenancy / Organization Model

<!-- AGENT: Is this single-tenant or multi-tenant? Does it have organizations/teams/workspaces? This section is referenced by EVERY domain template's RPBS_DERIVATIONS. Be precise — this drives data isolation, permissions, and database design. -->

### Tenancy Type
- Model: Single-user / Multi-user shared / Multi-tenant isolated / Org-based
- Isolation level: UNKNOWN

### Organization Structure
| Level | Name | Description | Contains |
|-------|------|-------------|---------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Data Isolation Rules
- Can users see each other's data: Yes/No/Conditional
- Org-level data boundaries: UNKNOWN
- Admin vs member visibility: UNKNOWN

---

## §22 — Public API

<!-- AGENT: Does the product expose a public API for external consumers? N/A if internal-only. This section is referenced by domain templates. -->

- Public API: Yes/No
- API style: REST / GraphQL / gRPC
- Authentication: API Key / OAuth / JWT
- Rate limiting: UNKNOWN
- Documentation: Auto-generated / Manual / N/A
- Versioning strategy: UNKNOWN

---

## §23 — Analytics & Tracking

<!-- AGENT: What usage data does the product collect for product analytics? -->

| Event | Trigger | Data Captured | Purpose |
|-------|---------|--------------|---------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Analytics Tools
- Provider: UNKNOWN
- Privacy considerations: UNKNOWN

---

## §24 — Admin & Operations

<!-- AGENT: Are there admin-specific features? Moderation tools? Operational dashboards? -->

### Admin Capabilities
| Capability | Description | Access Level |
|-----------|-------------|-------------|
| UNKNOWN | UNKNOWN | UNKNOWN |

### Moderation
- Content moderation needed: Yes/No
- Moderation approach: UNKNOWN
- Reporting/flagging: UNKNOWN

---

## §25 — Real-Time Features

<!-- AGENT: Does the product need real-time updates? WebSockets? Live collaboration? -->

- Real-time needed: Yes/No
- Real-time features: UNKNOWN
- Technology: WebSocket / SSE / Polling
- Presence indicators: Yes/No

---

## §26 — Export & Data Portability

<!-- AGENT: Can users export their data? What formats? -->

| Export Type | Format | Scope | Trigger |
|-----------|--------|-------|---------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## §27 — Versioning & History

<!-- AGENT: Does the product track history/versions of user content? -->

- Version history: Yes/No
- Undo/redo: Yes/No
- Audit trail: Yes/No
- History retention: UNKNOWN

---

## §28 — Scheduled & Background Tasks

<!-- AGENT: Are there recurring jobs, scheduled tasks, or background processing needs? -->

| Task | Schedule | Purpose | Failure Handling |
|------|---------|---------|-----------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## §29 — Privacy Controls

<!-- AGENT: How does the product handle user privacy? This is referenced by domain templates' RPBS_DERIVATIONS. -->

### User Privacy Rights
| Right | Supported? | Implementation |
|-------|-----------|---------------|
| View my data | Yes/No | UNKNOWN |
| Export my data | Yes/No | UNKNOWN |
| Delete my data | Yes/No | UNKNOWN |
| Opt out of tracking | Yes/No | UNKNOWN |

### Consent Management
- Cookie consent: UNKNOWN
- Terms acceptance: UNKNOWN
- Privacy policy: UNKNOWN

---

## §30 — Branding & Visual Identity

<!-- AGENT: Brand-level visual requirements that constrain UI_Constraints. -->

- Primary brand color: UNKNOWN
- Logo requirements: UNKNOWN
- Typography preferences: UNKNOWN
- Visual style: UNKNOWN (e.g., minimal, bold, corporate, playful)

---

## §31 — Deployment & Environment Requirements

<!-- AGENT: Where does this product run? What environment constraints exist? -->

- Target environment: UNKNOWN
- Hosting preferences: UNKNOWN
- Domain/URL requirements: UNKNOWN
- Environment-specific rules: UNKNOWN

---

## §32 — Third-Party Content & Licensing

<!-- AGENT: Does the product use third-party content (fonts, icons, images, libraries) with licensing implications? -->

- Icon library: UNKNOWN
- Font licensing: UNKNOWN
- Image sources: UNKNOWN
- Library licensing concerns: UNKNOWN

---

## §33 — Success Metrics & KPIs

<!-- AGENT: How will the product's success be measured? These drive TESTPLAN acceptance criteria and SROL observation metrics. -->

| Metric | Target | Measurement Method | Timeframe |
|--------|--------|-------------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### MVP Success Criteria
<!-- AGENT: What must be true for the MVP to be considered successful? -->
- [ ] UNKNOWN
- [ ] UNKNOWN
- [ ] UNKNOWN

---

## §34 — Open Questions

<!-- AGENT: Every UNKNOWN in this document should have a corresponding question here. These questions block downstream modules from completing their RPBS_DERIVATIONS sections. Resolve these before attempting to lock documentation. -->

| Q-ID | Section | Question | Impact | Status |
|------|---------|---------|--------|--------|
| Q-01 | §1 | What is the core purpose of this product? | Blocks all modules | OPEN |
| Q-02 | §3 | Who are the primary users and their roles? | Blocks auth, permissions | OPEN |
| Q-03 | §2 | What are the essential features for MVP? | Blocks feature scoping | OPEN |
| Q-04 | §5 | What are the key user journeys? | Blocks UX, testing | OPEN |
| Q-05 | §4 | What are the core data objects? | Blocks database, contracts | OPEN |

<!-- AGENT: Add more questions as you encounter UNKNOWNs while filling sections above. -->

---

*Generated by AXION — Document template v2.0*
*This document is the root of the AXION dependency chain. All downstream documents derive from it.*
