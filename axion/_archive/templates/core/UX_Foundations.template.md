# UX Foundations — {{DOMAIN_NAME}}

<!-- AXION:CORE_DOC:UX_FOUNDATIONS -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: UX Foundations defines WHO uses the product and HOW they experience it.
This is the human-centered design layer — it translates RPBS requirements into
user-centric patterns that drive SCREENMAP, UI_Constraints, and frontend implementation.

SOURCES TO DERIVE FROM:
1. RPBS §3 Actors & Permission Intents — map actors to user types
2. RPBS §5 User Journeys — expand journeys into detailed UX flows
3. RPBS §16 Onboarding — first-run experience design
4. RPBS §18 Accessibility — a11y requirements
5. RPBS §6 Navigation & Information Architecture — IA structure

RULES:
- Every user type here MUST map to an Actor in RPBS §3
- Every user journey MUST trace to a Journey in RPBS §5
- Accessibility requirements are not optional — state them explicitly or mark N/A with reason
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

### Mental Model
<!-- AGENT: What real-world metaphor does the product follow? e.g., "Like a recipe book with chapters" or "Like a project management board" -->
- UNKNOWN

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
