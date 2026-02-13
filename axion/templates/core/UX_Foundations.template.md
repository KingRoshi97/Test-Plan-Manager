# UX Foundations — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:UX_FOUNDATIONS -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: UX Foundations defines the psychological, behavioral, and experiential LAWS of the system.
It describes how interaction must feel and behave regardless of UI implementation.
UX Foundations defines truth — these are not optional and are not stylistic.
This is the human-centered design layer that constrains all visual/interactive decisions downstream.

SOURCES TO DERIVE FROM:
1. RPBS §3 Actors & Permission Intents — map actors to user types
2. RPBS §5 User Journeys — expand journeys into detailed UX flows
3. RPBS §16 Onboarding — first-run experience design
4. RPBS §18 Accessibility — a11y requirements
5. RPBS §6 Navigation & Information Architecture — IA structure
6. RPBS §2 Feature Taxonomy — product identity informs non-goals

RULES:
- Every user type here MUST map to an Actor in RPBS §3
- Every user journey MUST trace to a Journey in RPBS §5
- Experience laws are IMMUTABLE — UI and code must obey them
- If UX Foundations are Active, no UI or implementation may contradict them
- Accessibility requirements are not optional — state them explicitly or mark N/A with reason

CASCADE POSITION (fill priority 5 of 13):
- Upstream (read from): RPBS (§3 actors, §5 journeys, §6 navigation, §16 onboarding, §18 accessibility), DDES (entity context)
- Downstream (feeds into): UI_Constraints (responsive strategy, interaction patterns), SCREENMAP (journey steps → screens), COMPONENT_LIBRARY (interaction patterns → component behavior), COPY_GUIDE (UX patterns → feedback messaging)
- UX_Foundations defines the human-centered design layer that constrains all visual/interactive decisions downstream
-->

---

## User Types

<!-- AGENT: Map each RPBS §3 Actor to a user type with their goals, pain points, and
frequency of use. This helps the agent make UX decisions — a power user who visits daily
needs different UX than a casual visitor.

EXAMPLE:
| User Type | RPBS Actor | Description | Primary Goals | Usage Frequency | Tech Savviness |
| Home Cook | ACTOR_001 | Casual home cook looking for recipes | Find recipes, save favorites | Weekly | Low-Medium |
| Chef/Creator | ACTOR_002 | Professional or hobby chef sharing recipes | Publish recipes, grow audience | Daily | Medium |
-->

| User Type | RPBS Actor | Description | Primary Goals | Usage Frequency | Tech Savviness |
|-----------|-----------|-------------|---------------|----------------|---------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Primary User Mental Model

<!-- AGENT: Describe how the user conceptually understands the system.
This is not about UI — it's about how the user THINKS the system works.
The system must never behave in ways that violate this mental model.

Derive from RPBS §3 (who the user is) and §5 (how they expect to interact).
Think: what real-world analogy does the user carry when using this product? -->

- **The user believes the system is:** UNKNOWN
- **The user expects actions to result in:** UNKNOWN
- **The user expects feedback to be:** UNKNOWN
- **Real-world metaphor:** UNKNOWN (e.g., "like a recipe book with chapters", "like a project management board")

**Rule:** The system must never behave in ways that violate this mental model.

---

## Primary User Intent Loop

<!-- AGENT: Define the core repeating loop that the user performs.
This is the fundamental interaction cycle — if this loop breaks, the product fails.
Every feature and change must preserve this loop.

Derive from RPBS §5 User Journeys — identify the most common, repeated action pattern. -->

1. **User enters with intent:** UNKNOWN
2. **User performs action:** UNKNOWN
3. **System responds:** UNKNOWN
4. **User understands outcome:** UNKNOWN

**Rule:** This loop must remain intact across all features and changes.

---

## Cognitive Load Strategy

<!-- AGENT: Define how much thinking the system demands from the user.
These are rules that govern complexity — the system must earn the right to be complex.

Derive from RPBS §5 journey complexity and §6 navigation depth. -->

- UNKNOWN (e.g., one primary decision at a time)
- UNKNOWN (e.g., progressive disclosure only — never show everything at once)
- UNKNOWN (e.g., no simultaneous critical choices)
- UNKNOWN (e.g., no hidden system state — user always knows what's happening)

**Rule:** Complexity must be earned, not assumed.

---

## Feedback & Visibility Laws

<!-- AGENT: Define how the system communicates state to the user.
These are non-negotiable laws — users must NEVER have to guess whether something worked.

Derive from RPBS §15 Error Handling and §5 journey feedback expectations. -->

- UNKNOWN (e.g., every meaningful action produces visible feedback)
- UNKNOWN (e.g., state changes are observable immediately)
- UNKNOWN (e.g., errors are explicit, not silent)
- UNKNOWN (e.g., success is acknowledged clearly)

**Rule:** Users must never guess whether something worked.

---

## Error & Failure Experience

<!-- AGENT: Define how failure should FEEL to the user.
This is about the emotional experience of errors, not the technical implementation.
Errors should not punish exploration.

Derive from RPBS §15 Error Handling. -->

- UNKNOWN (e.g., errors are recoverable where possible)
- UNKNOWN (e.g., blame is never placed on the user)
- UNKNOWN (e.g., system explains what happened in plain language)
- UNKNOWN (e.g., failure does not destroy progress)

**Rule:** Failure should not punish exploration.

---

## Trust & Safety Signals

<!-- AGENT: Define how the system earns and maintains user trust.
These signals prevent the system from feeling deceptive or unpredictable.

Derive from RPBS §5 journey confidence points and §15 error recovery. -->

- UNKNOWN (e.g., predictable behavior — same actions produce same results)
- UNKNOWN (e.g., no surprise actions — system never does something the user didn't ask for)
- UNKNOWN (e.g., clear consequences before irreversible actions)
- UNKNOWN (e.g., explicit confirmation for destructive actions)

**Rule:** The system must never feel deceptive.

---

## Flow Stability Rules

<!-- AGENT: Define what must remain consistent across the product.
These rules ensure users feel oriented at all times and prevent disorientation.

Derive from RPBS §5 journey flows and §6 navigation structure. -->

- UNKNOWN (e.g., core flows do not change meaning between visits)
- UNKNOWN (e.g., similar actions behave similarly across domains)
- UNKNOWN (e.g., navigation does not break mental continuity)

**Rule:** Users should feel oriented at all times.

---

## UX Non-Goals

<!-- AGENT: Explicitly define what this experience is NOT trying to be.
Avoiding non-goals is as important as hitting goals.
This prevents feature creep and identity drift in the UX layer.

Derive from RPBS §2 product identity and boundaries. -->

- Not UNKNOWN (e.g., not playful, not gamified, not dense, not flashy, not exploratory)
- Not UNKNOWN
- Not UNKNOWN

**Rule:** Avoiding non-goals is as important as hitting goals.

---

## User Journeys

<!-- AGENT: Expand RPBS §5 journeys into detailed UX-level flows. Focus on the EXPERIENCE:
what does the user see, feel, and do at each step? Include emotional state and friction points.

For each journey, think through:
- What is the user thinking at each step?
- Where might they get confused or frustrated?
- What feedback do they need to feel confident?
- What are the happy path and the error paths? -->

### Journey: {{JOURNEY_NAME}}
- **User Type:** UNKNOWN (ref: RPBS §3)
- **Trigger:** UNKNOWN (what prompts the user to start this journey?)
- **Entry Point:** UNKNOWN (what screen/page do they start on?)
- **Steps:**
  1. **UNKNOWN** — User sees: UNKNOWN → User does: UNKNOWN → System responds: UNKNOWN
  2. **UNKNOWN** — User sees: UNKNOWN → User does: UNKNOWN → System responds: UNKNOWN
  3. **UNKNOWN** — User sees: UNKNOWN → User does: UNKNOWN → System responds: UNKNOWN
- **Success State:** UNKNOWN (what does the user see when the journey completes?)
- **Error States:**
  - UNKNOWN — User sees: UNKNOWN → Recovery: UNKNOWN
- **Emotional Arc:** UNKNOWN (e.g., "curious → engaged → satisfied")
- **Friction Points:** UNKNOWN (where might the user struggle?)
- **Outcome:** UNKNOWN

### Journey: {{JOURNEY_NAME_2}}
- **User Type:** UNKNOWN
- **Trigger:** UNKNOWN
- **Entry Point:** UNKNOWN
- **Steps:**
  1. **UNKNOWN** — User sees: UNKNOWN → User does: UNKNOWN → System responds: UNKNOWN
  2. **UNKNOWN** — User sees: UNKNOWN → User does: UNKNOWN → System responds: UNKNOWN
- **Success State:** UNKNOWN
- **Error States:**
  - UNKNOWN — User sees: UNKNOWN → Recovery: UNKNOWN
- **Emotional Arc:** UNKNOWN
- **Friction Points:** UNKNOWN
- **Outcome:** UNKNOWN

<!-- AGENT: Add more journeys as needed. Every RPBS §5 journey should have a corresponding UX journey here. -->

---

## Information Architecture

<!-- AGENT: Define how information is organized and prioritized in the product.
Derive from RPBS §6 Navigation and §2 Feature Taxonomy.

Consider:
- What information is most important to the user?
- How should content be grouped and hierarchied?
- What mental models do users bring? -->

### Content Hierarchy
- **Primary content:** UNKNOWN (what users come to see/do)
- **Secondary content:** UNKNOWN (supporting information)
- **Tertiary content:** UNKNOWN (settings, admin, metadata)

### Grouping Strategy
<!-- AGENT: How are features/content organized into logical groups? -->
| Group | Contains | Rationale |
|-------|---------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Interaction Patterns

<!-- AGENT: Define the standard interaction patterns used throughout the product.
These create consistency and reduce cognitive load. -->

### Form Patterns
- Validation timing: On submit / On blur / Real-time
- Error display: Inline / Toast / Summary
- Auto-save: Yes / No
- Progressive disclosure: UNKNOWN

### List/Collection Patterns
- Pagination: Infinite scroll / Page numbers / Load more
- Empty state behavior: UNKNOWN
- Loading state behavior: UNKNOWN (skeleton / spinner / progressive)

### Navigation Patterns
- Primary navigation: UNKNOWN (sidebar / top bar / tabs / bottom nav)
- Breadcrumbs: Yes / No
- Back button behavior: UNKNOWN

### Feedback Patterns
- Success feedback: UNKNOWN (toast / inline / redirect)
- Error feedback: UNKNOWN
- Loading feedback: UNKNOWN
- Destructive action confirmation: UNKNOWN (modal / inline confirm / undo)

---

## Accessibility Requirements

<!-- AGENT: Define accessibility standards. Derive from RPBS §18.
These are NOT optional — every product must state its a11y position. -->

### Standards
- Target compliance: UNKNOWN (WCAG 2.1 AA / AAA / custom)
- Testing approach: UNKNOWN (manual / automated / both)

### Keyboard Navigation
- All interactive elements reachable: Yes / UNKNOWN
- Focus order: UNKNOWN (logical tab order follows visual layout)
- Focus indicators: UNKNOWN (visible focus rings on all interactive elements)
- Keyboard shortcuts: UNKNOWN

### Screen Reader Support
- ARIA labels on interactive elements: Yes / UNKNOWN
- Live regions for dynamic content: UNKNOWN
- Image alt text policy: UNKNOWN
- Heading hierarchy: UNKNOWN (proper h1-h6 nesting)

### Visual Accessibility
- Color contrast ratio: UNKNOWN (minimum 4.5:1 for normal text)
- Color-only information: UNKNOWN (never rely solely on color)
- Text sizing: UNKNOWN (minimum base font size, responsive scaling)
- Motion/animation: UNKNOWN (respect prefers-reduced-motion)

---

## Responsive Strategy

<!-- AGENT: How does the product adapt to different screen sizes? -->

| Breakpoint | Target Devices | Layout Changes |
|-----------|---------------|----------------|
| Mobile (<640px) | UNKNOWN | UNKNOWN |
| Tablet (640-1024px) | UNKNOWN | UNKNOWN |
| Desktop (>1024px) | UNKNOWN | UNKNOWN |

### Mobile-Specific Considerations
- Touch targets: UNKNOWN (minimum 44x44px)
- Gesture support: UNKNOWN
- Orientation: UNKNOWN (portrait / landscape / both)

---

## Open Questions
<!-- AGENT: Every UNKNOWN that represents a genuine gap in understanding. -->
- UNKNOWN
