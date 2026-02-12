# Domain Design & Entity Specification (DDES) — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:DDES -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Domain Prefix:** {{DOMAIN_PREFIX}}
**Domain Type:** {{DOMAIN_TYPE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: DDES defines WHAT a domain is responsible for and WHAT entities it manages.
It is the per-domain complement to RPBS — where RPBS describes the whole product,
DDES zooms into a single domain's scope, entities, and responsibilities.

SOURCES TO DERIVE FROM:
1. RPBS §4 Core Objects Glossary — which objects does THIS domain own?
2. RPBS §3 Actors — which actors interact with this domain?
3. RPBS §2 Feature Taxonomy — which features belong to this domain?
4. domains.json — what are this domain's dependencies and type?

RULES:
- Every entity listed here MUST appear in RPBS §4 Core Objects (or be flagged as an Open Question)
- The "Owner" column identifies which domain is the single source of truth for that entity
- Only ONE domain can own an entity — if this domain consumes it, mark Owner as the source domain
- Dependencies MUST match what's declared in domains.json

CASCADE POSITION (fill priority 4 of 13):
- Upstream (read from): RPBS (§2 features, §3 actors, §4 core objects), REBS (technical baseline), domains.json
- Downstream (feeds into): UX_Foundations (entity context), UI_Constraints (data display rules), DIM (entity ownership drives interfaces), BELS (entity lifecycle → state machines), SCREENMAP (entities displayed per screen), COMPONENT_LIBRARY (entity display components), TESTPLAN (entity CRUD tests), ERC (locked at lock time)
- DDES is filled early because nearly every downstream doc depends on knowing what entities exist and who owns them
-->

---

## Purpose
<!-- AGENT: One to three sentences explaining why this domain exists and what value it provides
to the overall product. Derive from the domain's description in domains.json and how it maps
to user-facing features in RPBS §2. -->
UNKNOWN

---

## Entities

<!-- AGENT: List every data entity this domain manages. For entities this domain OWNS,
provide full detail. For entities it CONSUMES from other domains, note the source.
Cross-reference with RPBS §4 Core Objects — every entity here must trace back to an object there.

EXAMPLE:
| Entity | Description | Owner | Fields (key) | Relationships |
| Recipe | A cooking recipe with ingredients and steps | This domain | id, title, author_id, status | belongs_to User, has_many Ingredients |
| User | The person who created the recipe | auth domain | id, email | has_many Recipes |
-->

| Entity | Description | Owner | Fields (key) | Relationships |
|--------|-------------|-------|-------------|---------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Entity Details

<!-- AGENT: For each entity THIS domain owns, expand with full field details.
Include field name, type, required/optional, default value, and any constraints.
This feeds directly into the database module's schema design and the contracts module's type definitions. -->

#### {{ENTITY_NAME}}
| Field | Type | Required | Default | Constraints | Notes |
|-------|------|----------|---------|------------|-------|
| id | UUID | Yes | auto-generated | Primary key | — |
| UNKNOWN | UNKNOWN | Yes/No | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Key Responsibilities

<!-- AGENT: What is this domain responsible for doing? List concrete actions, not vague capabilities.
Good: "Validate recipe ingredients against allergen database"
Bad: "Handle recipe stuff"

Derive from RPBS §2 features that map to this domain and §5 journey steps that touch this domain. -->

- UNKNOWN
- UNKNOWN
- UNKNOWN

---

## Domain Boundaries

<!-- AGENT: Explicitly define what IS and IS NOT this domain's job. This prevents scope creep
and helps the agent know where to put logic.
Example — for a "backend" domain:
- In Scope: API route handlers, request validation, business logic orchestration
- Out of Scope: Database schema definition (owned by database domain), UI rendering (owned by frontend) -->

- **In Scope:**
  - UNKNOWN
  - UNKNOWN
- **Out of Scope:**
  - UNKNOWN
  - UNKNOWN

---

## Dependencies

<!-- AGENT: What other domains does this domain depend on? Must match domains.json dependencies.
For each dependency, explain WHAT is consumed and WHY.
Example: "Depends on contracts domain for API type definitions and Zod validation schemas" -->

| Dependency | What Is Consumed | Why |
|-----------|-----------------|-----|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Domain Events

<!-- AGENT: What events does this domain emit or consume? Events are used for cross-domain
communication and feed into the DIM (Domain Interface Map).
Example: "Emits RECIPE_PUBLISHED when a recipe transitions to published state" -->

### Emitted Events
| Event Name | Trigger | Payload Summary | Consumers |
|-----------|---------|----------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Consumed Events
| Event Name | Source Domain | Action Taken |
|-----------|-------------|-------------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Open Questions
<!-- AGENT: Every UNKNOWN in this document should generate an Open Question.
Format questions as: "What [specific thing] is needed for [specific reason]?" -->
- UNKNOWN
