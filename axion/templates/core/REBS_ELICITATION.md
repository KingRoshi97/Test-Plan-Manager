<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:ELICITATION:REBS -->
# REBS Elicitation Pack — Question Set for Technical Decisions

## Purpose
When filling REBS_Product.md, these questions help resolve technical ambiguities when RPBS input is insufficient. Use sparingly—most REBS decisions should derive from RPBS constraints + defaults.

---

## 1) Stack Selection (REBS §1)

**Only ask if RPBS constraints conflict or are insufficient:**
- "You mentioned both mobile and web—which is the primary platform?"
- "Your scale requirements suggest we need [X]. Is that acceptable?"
- "The compliance requirements typically require [X stack]. Any concerns?"

**Default behavior (don't ask):**
- Use WEB_SAAS_STANDARD unless mobile is explicitly required
- Use MOBILE_FIRST_STANDARD if mobile is primary

---

## 2) Decision Escalation (REBS §2)

**These are blocking questions—must ask if unknown:**
- "The following items are unclear and block implementation: [list]. Can you clarify?"
- "There's a conflict between [X] and [Y]. Which takes priority?"

**Present options, don't ask open-ended:**
- "For [decision], we can either: (A) [option] or (B) [option]. I recommend [X] because [reason]."

---

## 3) Repository Layout (REBS §3)

**Rarely needs asking—use defaults unless:**
- "Your team uses [X]. Should we follow that convention or use standard?"
- "You mentioned existing code. Where should new code live?"

---

## 4) API Standards (REBS §4)

**Only ask if user has strong opinions:**
- "Do you have existing API conventions we should follow?"
- "Any preference for REST vs GraphQL? (We default to REST)"
- "How should API versioning work?"

---

## 5) Data Modeling (REBS §5)

**Only ask for complex domains:**
- "How should we handle deleted records? Keep history or hard delete?"
- "Do you need audit trails for data changes?"
- "Any existing database schemas we need to match?"

---

## 6) Security (REBS §6)

**Ask if compliance is regulated:**
- "Your compliance tier requires [X]. How should we implement authentication?"
- "Do users need SSO/enterprise login options?"
- "Any specific password requirements (beyond 8 characters)?"

**Default (don't ask):**
- Session-based auth
- Standard password policy
- Rate limiting enabled

---

## 7) Observability (REBS §7)

**Rarely needs asking—use defaults unless:**
- "Do you have existing logging/monitoring infrastructure?"
- "Any specific metrics you need to track?"

---

## 8) Testing (REBS §8)

**Only ask for specific requirements:**
- "Any specific test coverage requirements?"
- "Which user journeys are most critical to test thoroughly?"

**Default (don't ask):**
- Unit tests for logic
- E2E for top 3 journeys
- Smoke tests for release

---

## 9) Copywriting Policy (REBS §9)

**Derived from RPBS §10. Only ask if:**
- "Copywriting is enabled but tone is unclear. What 3 words describe the voice?"
- "Are there any words/phrases we should avoid?"

---

## Usage Protocol

1. **REBS should mostly derive from RPBS** — minimize questions
2. **Use defaults aggressively** — only ask when defaults would fail
3. **Present options, not open questions** — "A or B?" not "What do you want?"
4. **Batch technical questions** — ask all at once, not piece by piece

---

## Decision Matrix (When to Ask vs Use Default)

| Situation | Action |
|-----------|--------|
| RPBS has clear constraint | Use constraint |
| RPBS silent, default exists | Use default |
| RPBS silent, no clear default | Ask with options |
| RPBS constraints conflict | Ask with recommendation |
| Technical detail user unlikely to know | Use default |
| Technical detail affects user experience | Ask briefly |

---

## Common Escalation Scenarios

### Scenario: Scale Mismatch
```
RPBS says: "millions of users"
Default stack: WEB_SAAS_STANDARD (not designed for millions)

Action: Escalate with options
"Your user scale suggests we need enterprise infrastructure. 
Options:
A) Start with standard, plan migration later
B) Use enterprise stack from start (more complex setup)
Recommendation: A, unless you expect millions in year 1"
```

### Scenario: Compliance Requirement
```
RPBS says: compliance=regulated (HIPAA)

Action: Escalate for confirmation
"HIPAA compliance affects hosting, logging, and data handling.
This requires:
- Specific cloud regions
- Audit logging
- BAA agreements
Confirm you need full HIPAA compliance?"
```

### Scenario: Integration Criticality Unknown
```
RPBS lists: Stripe integration, criticality=UNKNOWN

Action: Ask for clarification
"Is Stripe required for the app to work (critical) or a nice-to-have feature?
This affects whether we block launch on Stripe integration."
```
