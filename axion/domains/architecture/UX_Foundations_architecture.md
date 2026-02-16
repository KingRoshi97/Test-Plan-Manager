# UX Foundations — architecture

## Overview
**Domain Slug:** architecture
**Project:** Application

---

## User Types

| User Type | RPBS Actor | Description | Primary Goals | Usage Frequency | Tech Savviness |
|-----------|-----------|-------------|---------------|----------------|---------------|
| Application Operator | ACTOR_001 | User interacting with architecture application features | Manage application within architecture | Regular | Medium |
| User Operator | ACTOR_002 | User interacting with architecture user features | Manage user within architecture | Regular | Medium |

---

## Primary User Mental Model

- **The user believes the system is:** A tool for managing applications, users, platform targetss
- **The user expects actions to result in:** Immediate, visible changes to their application data
- **The user expects feedback to be:** Clear and immediate — success or failure explained in plain language
- **Real-world metaphor:** Like a well-organized workspace for application management

**Rule:** The system must never behave in ways that violate this mental model.

---

## Primary User Intent Loop

1. **User enters with intent:** Manage or view applications
2. **User performs action:** Creates, reads, updates, or deletes a application
3. **System responds:** Confirms action with visible feedback
4. **User understands outcome:** Sees updated state reflecting their action

**Rule:** This loop must remain intact across all features and changes.

---

## Cognitive Load Strategy

- One primary decision at a time — forms and flows focus the user on one task
- Progressive disclosure only — advanced options hidden until needed
- No simultaneous critical choices — destructive actions isolated from creation flows
- No hidden system state — user always knows what is happening and what they can do next

**Rule:** Complexity must be earned, not assumed.

---

## Feedback & Visibility Laws

- Every meaningful action produces visible feedback (toast, inline update, or redirect)
- State changes are observable immediately — no silent background updates
- Errors are explicit, not silent — every failure has a user-facing message
- Success is acknowledged clearly — user never wonders if their action worked

**Rule:** Users must never guess whether something worked.

---

## Error & Failure Experience

- Errors are recoverable where possible — user can retry or correct input
- Blame is never placed on the user — messages explain what went wrong, not what the user did wrong
- System explains what happened in plain language — no technical jargon in error messages
- Failure does not destroy progress — partial input is preserved when possible

**Rule:** Failure should not punish exploration.

---

## Trust & Safety Signals

- Predictable behavior — same actions produce same results every time
- No surprise actions — system never does something the user didn't ask for
- Clear consequences before irreversible actions — destructive actions show what will happen
- Explicit confirmation for destructive actions — delete, remove, and discard require confirmation

**Rule:** The system must never feel deceptive.

---

## Flow Stability Rules

- Core flows do not change meaning between visits — application CRUD always works the same way
- Similar actions behave similarly across architecture — consistency across all entity types
- Navigation does not break mental continuity — back button and breadcrumbs preserve context

**Rule:** Users should feel oriented at all times.

---

## UX Non-Goals

- Not gamified — no points, badges, or achievements
- Not exploratory — the product has a clear purpose, not a discovery experience
- Not dense — information is presented at a comfortable reading density

**Rule:** Avoiding non-goals is as important as hitting goals.

---

## User Journeys

### Journey: architecture Application Workflow
- **User Type:** Application Operator
- **Trigger:** User initiates application operation in architecture
- **Entry Point:** /architecture
- **Steps:**
  1. **Navigate** — User sees: architecture dashboard → User does: Selects application section → System responds: Displays application interface
  2. **Operate** — User sees: Application management view → User does: Performs application operations → System responds: Confirms action completion
- **Success State:** Application operation completed successfully
- **Emotional Arc:** intent → focused → satisfied


---

## Information Architecture

### Content Hierarchy
- **Primary content:** Application management, User management
- **Secondary content:** Settings, preferences, metadata
- **Tertiary content:** Admin tools, system info

### Grouping Strategy
| Group | Contains | Rationale |
|-------|---------|-----------|
| Application Management | Application CRUD, Application search, Application details | Groups all application-related features |
| User Management | User CRUD, User search, User details | Groups all user-related features |
| Platform targets Management | Platform targets CRUD, Platform targets search, Platform targets details | Groups all platform targets-related features |

---

## Interaction Patterns

### Form Patterns
- Validation timing: On blur
- Error display: Inline
- Auto-save: No

### List/Collection Patterns
- Pagination: Page numbers
- Empty state behavior: Illustration + descriptive message + CTA
- Loading state behavior: Skeleton placeholders

### Navigation Patterns
- Primary navigation: Sidebar
- Breadcrumbs: Yes for nested views
- Back button behavior: Return to parent list

### Feedback Patterns
- Success feedback: Toast
- Error feedback: Inline
- Loading feedback: Skeleton / spinner
- Destructive action confirmation: Modal dialog

---

## Responsive Strategy

| Breakpoint | Target Devices | Layout Changes |
|-----------|---------------|----------------|
| Mobile (<640px) | Phones | Single column, bottom nav, stacked cards |
| Tablet (640-1024px) | Tablets | Two columns, collapsible sidebar |
| Desktop (>1024px) | Desktop | Full sidebar, multi-column grid |

---

## Open Questions
- Specific architecture user journey steps need further detail from RPBS
- Accessibility requirements need review against RPBS §18
- Mental model metaphor needs validation against RPBS product identity
