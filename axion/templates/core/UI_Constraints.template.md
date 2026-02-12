# UI Constraints — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:UI_CONSTRAINTS -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: UI Constraints defines the visual and technical rules that ALL UI components
must follow. This is the design system specification that ensures consistency across
the entire product. It constrains what the agent CAN and CANNOT do when generating UI code.

SOURCES TO DERIVE FROM:
1. RPBS §30 Branding & Visual Identity — brand colors, typography, style direction
2. RPBS §18 Accessibility — color contrast, motion, font size requirements
3. Architecture module — tech stack (React, Vue, etc.) determines component patterns
4. UX_Foundations — responsive strategy and interaction patterns

RULES:
- Constraints are HARD rules — the agent must NOT violate them during code generation
- If a constraint seems too restrictive, add an Open Question rather than ignoring it
- All color values should support dark mode (define both light and dark variants)
- Reference the selected UI library/framework from the architecture module

CASCADE POSITION (fill priority 6 of 13):
- Upstream (read from): RPBS (§18 accessibility, §30 branding), UX_Foundations (responsive strategy, interaction patterns), architecture module (tech stack)
- Downstream (feeds into): SCREENMAP (layout constraints per screen), COMPONENT_LIBRARY (component styling rules, allowed patterns), COPY_GUIDE (typography constraints for copy), frontend code generation (CSS variables, theme config)
- UI_Constraints sets the visual design system that ALL UI code must respect — violations here cause inconsistent output
-->

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
