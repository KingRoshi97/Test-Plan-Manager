# UI Constraints — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:UI_CONSTRAINTS -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: UI Constraints translates UX Foundations into structural and visual rules
without designing UI. It defines HOW experience law may be expressed structurally,
plus the visual design system that ALL UI components must follow.
UI structure must obey UX Foundations at all times.

SOURCES TO DERIVE FROM:
1. RPBS §30 Branding & Visual Identity — brand colors, typography, style direction
2. RPBS §18 Accessibility — color contrast, motion, font size requirements
3. Architecture module — tech stack (React, Vue, etc.) determines component patterns
4. UX_Foundations — experience laws, responsive strategy, interaction patterns

RULES:
- Constraints are HARD rules — the agent must NOT violate them during code generation
- UI structure must reinforce user intent (from UX_Foundations)
- If a constraint seems too restrictive, add an Open Question rather than ignoring it
- All color values should support dark mode (define both light and dark variants)
- Reference the selected UI library/framework from the architecture module

CASCADE POSITION (fill priority 6 of 13):
- Upstream (read from): RPBS (§18 accessibility, §30 branding), UX_Foundations (experience laws, responsive strategy, interaction patterns), architecture module (tech stack)
- Downstream (feeds into): SCREENMAP (layout constraints per screen), COMPONENT_LIBRARY (component styling rules, allowed patterns), COPY_GUIDE (typography constraints for copy), frontend code generation (CSS variables, theme config)
- UI_Constraints sets the visual design system that ALL UI code must respect — violations here cause inconsistent output
-->

---

## Structural Grouping Rules

<!-- AGENT: Define what belongs together in the UI.
These rules ensure that UI structure reinforces user intent from UX_Foundations.
Derive from UX_Foundations Information Architecture and RPBS §6 Navigation. -->

- UNKNOWN (e.g., actions related to the same intent must be co-located)
- UNKNOWN (e.g., configuration must not interrupt execution flows)
- UNKNOWN (e.g., review and execution must be visually separable)
- UNKNOWN (e.g., primary actions are always visible, secondary actions are progressive)

**Rule:** UI structure must reinforce user intent.

---

## Navigation Constraints

<!-- AGENT: Define allowed navigation behavior.
Navigation must not fracture mental continuity (from UX_Foundations Flow Stability Rules).
Derive from UX_Foundations navigation patterns and RPBS §6. -->

- Maximum navigation depth: UNKNOWN (e.g., max 3 levels deep)
- Modal vs full-context rules: UNKNOWN (e.g., modals for confirmations only, full pages for creation)
- Always accessible elements: UNKNOWN (e.g., main nav, user menu, back button)
- Core flow interruption: UNKNOWN (e.g., notifications must never interrupt a core flow)

**Rule:** Navigation must not fracture mental continuity.

---

## Interaction Pattern Limits

<!-- AGENT: Define allowed interaction patterns and limits.
Patterns must be consistent and limited — one primary action per view.
Derive from UX_Foundations Cognitive Load Strategy and Interaction Patterns. -->

- UNKNOWN (e.g., one primary action per view)
- UNKNOWN (e.g., secondary actions must not steal focus from primary)
- UNKNOWN (e.g., destructive actions require friction — confirmation step)
- UNKNOWN (e.g., drag-and-drop only as enhancement, never sole interaction method)

**Rule:** Patterns must be consistent and limited.

---

## State Visibility Rules

<!-- AGENT: Define what the user must ALWAYS be able to see.
Critical state must never be hidden — derive from UX_Foundations Feedback & Visibility Laws. -->

- UNKNOWN (e.g., current state of the active entity is always visible)
- UNKNOWN (e.g., progress indicators shown for multi-step processes)
- UNKNOWN (e.g., pending actions are surfaced, not hidden)
- UNKNOWN (e.g., errors and warnings are always visible until dismissed)

**Rule:** Critical state must never be hidden.

---

## Timing & Feedback Constraints

<!-- AGENT: Define response expectations and feedback timing.
Silence is not feedback — derive from UX_Foundations Feedback & Visibility Laws. -->

- UNKNOWN (e.g., immediate visual acknowledgement of user input — < 100ms)
- UNKNOWN (e.g., loading states shown for any async action > 200ms)
- UNKNOWN (e.g., clear completion signals for all operations)
- UNKNOWN (e.g., optimistic updates where safe, with rollback on failure)

**Rule:** Silence is not feedback.

---

## Visual Design Constraints

<!-- AGENT: Define the visual design system. Derive brand colors from RPBS §30.
If RPBS doesn't specify, choose a professional, accessible palette and note it as an assumption. -->

### Color System
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | UNKNOWN | UNKNOWN | CTAs, links, active states |
| Secondary | UNKNOWN | UNKNOWN | Supporting actions |
| Background | UNKNOWN | UNKNOWN | Page backgrounds |
| Surface | UNKNOWN | UNKNOWN | Card/panel backgrounds |
| Foreground | UNKNOWN | UNKNOWN | Primary text |
| Muted | UNKNOWN | UNKNOWN | Secondary text, borders |
| Destructive | UNKNOWN | UNKNOWN | Error states, delete actions |
| Success | UNKNOWN | UNKNOWN | Success states, confirmations |
| Warning | UNKNOWN | UNKNOWN | Warning states, caution |

### Typography
| Element | Font Family | Size | Weight | Line Height |
|---------|-----------|------|--------|-------------|
| Heading 1 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Heading 2 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Heading 3 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Body | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Small/Caption | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Code/Mono | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Iconography
- Icon library: UNKNOWN (e.g., Lucide, Heroicons, Material Icons)
- Icon size standard: UNKNOWN
- Icon color rules: UNKNOWN (inherit text color / fixed / contextual)

---

## Layout Constraints

<!-- AGENT: Define spacing, grid, and layout rules that create visual consistency. -->

### Spacing Scale
<!-- AGENT: Define a consistent spacing scale used throughout the product.
All padding, margins, and gaps should use values from this scale. -->
| Token | Value | Usage |
|-------|-------|-------|
| xs | UNKNOWN | Tight spacing (icon padding, badge padding) |
| sm | UNKNOWN | Compact spacing (between related items) |
| md | UNKNOWN | Standard spacing (card padding, section gaps) |
| lg | UNKNOWN | Generous spacing (section separation) |
| xl | UNKNOWN | Maximum spacing (page-level margins) |

### Grid System
- Max content width: UNKNOWN
- Column count: UNKNOWN
- Gutter width: UNKNOWN
- Page margins: UNKNOWN

### Container Rules
<!-- AGENT: How should nested containers relate to each other? -->
- Container styling approach: UNKNOWN (A: Whitespace only / B: Background color / C: Borders / D: Background + border)
- Nesting depth limit: UNKNOWN (recommend max 2-3 levels)
- Card inside card: Never allowed

---

## Component Constraints

<!-- AGENT: Define which components can be used and how. This constrains the agent's
choices during code generation to maintain consistency. -->

### Allowed Component Library
- Primary library: UNKNOWN (e.g., Shadcn UI, Material UI, custom)
- Icon library: UNKNOWN
- Custom components allowed: Yes / Only when library insufficient

### Component Usage Rules
| Component | Allowed | Constraints | Notes |
|-----------|---------|------------|-------|
| Button | Yes | UNKNOWN | Use library variants, never custom hover states |
| Card | Yes | UNKNOWN | Never nest cards inside cards |
| Badge | Yes | UNKNOWN | Always single-line, sufficient width |
| Modal/Dialog | Yes | UNKNOWN | Confirmation for destructive actions |
| Toast | Yes | UNKNOWN | Auto-dismiss, max 3 visible |
| Table | UNKNOWN | UNKNOWN | UNKNOWN |
| Tabs | UNKNOWN | UNKNOWN | UNKNOWN |
| Dropdown | UNKNOWN | UNKNOWN | UNKNOWN |
| Avatar | UNKNOWN | UNKNOWN | Use library Avatar with fallback |

### Forbidden Patterns
<!-- AGENT: Patterns the agent must NEVER use in this product. -->
- UNKNOWN

---

## UI Structural Non-Goals

<!-- AGENT: Explicitly forbid structural behaviors that violate UX Foundations.
These are hard boundaries on what UI structures are never acceptable.
Derive from UX_Foundations UX Non-Goals — translate experience non-goals into structural prohibitions. -->

- UNKNOWN (e.g., deep nested navigation beyond stated max depth)
- UNKNOWN (e.g., overloaded views with multiple competing primary actions)
- UNKNOWN (e.g., hidden critical actions that require discovery)
- UNKNOWN (e.g., gesture-only critical actions with no visible alternative)

**Rule:** Forbidden structures must not be introduced.

---

## Platform-Agnostic Rule

<!-- AGENT: Define how UI rules hold across platforms.
Platform differences may optimize ergonomics but must not redefine experience meaning.
Derive from UX_Foundations and RPBS deployment targets. -->

- Web, mobile, and desktop must share mental structure: UNKNOWN
- Platform-specific optimizations allowed for: UNKNOWN (e.g., touch targets on mobile, keyboard shortcuts on desktop)
- Platform must NOT redefine: UNKNOWN (e.g., flow meaning, core interactions, state visibility)

**Rule:** Platform must not redefine experience.

---

## Responsive Behavior

<!-- AGENT: How should UI respond to different screen sizes?
Define breakpoint-specific behavior for key patterns. Derive from UX_Foundations responsive strategy. -->

| Breakpoint | Sidebar | Navigation | Cards/Grid | Tables | Modals |
|-----------|---------|-----------|------------|--------|--------|
| Mobile | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Tablet | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Desktop | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Animation & Motion Constraints

<!-- AGENT: Define rules for animations and transitions. -->

- Transitions allowed: Yes / Minimal / No
- Duration standard: UNKNOWN (e.g., 150ms for micro-interactions, 300ms for page transitions)
- Easing standard: UNKNOWN
- prefers-reduced-motion handling: UNKNOWN (required / nice-to-have)
- Layout-shifting animations: Never allowed on hover
- Transform scale on hover: UNKNOWN (extremely subtle if used)

---

## Image & Media Constraints

<!-- AGENT: Rules for images, avatars, and media display. -->

- Image border radius: UNKNOWN
- Avatar shapes: UNKNOWN (circle / rounded square)
- Image aspect ratios: UNKNOWN
- Placeholder/loading strategy: UNKNOWN (blur / skeleton / spinner)
- Max image dimensions: UNKNOWN

---

## Dark Mode Requirements

<!-- AGENT: Is dark mode required? If yes, define the approach. -->

- Dark mode support: Required / Optional / Not needed
- Implementation: CSS variables / Tailwind dark: prefix / Both
- Default theme: Light / Dark / System preference
- User toggle: Yes / No

---

## Performance Constraints

<!-- AGENT: UI performance requirements that constrain implementation choices. -->

- Max bundle size target: UNKNOWN
- Lazy loading required for: UNKNOWN
- Image optimization: UNKNOWN
- Font loading strategy: UNKNOWN (preload / swap / optional)
- Initial render target: UNKNOWN

---

## Open Questions
<!-- AGENT: UI-related decisions that need clarification. -->
- UNKNOWN
