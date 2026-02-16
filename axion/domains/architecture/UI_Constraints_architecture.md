# UI Constraints — architecture

## Overview
**Domain Slug:** architecture
**Project:** Application

---

## Structural Grouping Rules

- Actions related to the same application must be co-located on the same view
- Configuration and settings must not interrupt application management flows
- Review and execution contexts must be visually separable
- Primary actions are always visible, secondary actions are progressive

**Rule:** UI structure must reinforce user intent.

---

## Navigation Constraints

- Maximum navigation depth: 3 levels deep
- Modal vs full-context rules: Modals for confirmations and quick edits only, full pages for creation and detail views
- Always accessible elements: Main nav, user menu, back button
- Core flow interruption: Notifications must never interrupt a application creation or edit flow

**Rule:** Navigation must not fracture mental continuity.

---

## Interaction Pattern Limits

- One primary action per view — create, edit, or review, not all at once
- Secondary actions must not steal focus from primary
- Destructive actions require friction — confirmation step before delete/remove
- Drag-and-drop only as enhancement, never sole interaction method

**Rule:** Patterns must be consistent and limited.

---

## State Visibility Rules

- Current state of the active application is always visible
- Progress indicators shown for multi-step processes
- Pending actions are surfaced, not hidden
- Errors and warnings are always visible until explicitly dismissed

**Rule:** Critical state must never be hidden.

---

## Timing & Feedback Constraints

- Immediate visual acknowledgement of user input — < 100ms
- Loading states shown for any async action > 200ms
- Clear completion signals for all operations
- Optimistic updates where safe, with rollback on failure

**Rule:** Silence is not feedback.

---

## Visual Design Constraints

### Color System
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | hsl(222, 47%, 51%) | hsl(217, 91%, 60%) | CTAs, links, active states |
| Background | hsl(0, 0%, 100%) | hsl(222, 47%, 11%) | Page backgrounds |
| Surface | hsl(210, 40%, 96%) | hsl(217, 33%, 17%) | Card/panel backgrounds |
| Foreground | hsl(222, 47%, 11%) | hsl(210, 40%, 98%) | Primary text |
| Destructive | hsl(0, 84%, 60%) | hsl(0, 63%, 31%) | Error states, delete actions |

### Typography
| Element | Font Family | Size | Weight | Line Height |
|---------|-----------|------|--------|-------------|
| Heading 1 | System sans-serif | 2rem | 700 | 1.2 |
| Heading 2 | System sans-serif | 1.5rem | 600 | 1.3 |
| Heading 3 | System sans-serif | 1.25rem | 600 | 1.4 |
| Body | System sans-serif | 1rem | 400 | 1.5 |
| Small/Caption | System sans-serif | 0.875rem | 400 | 1.4 |
| Code/Mono | System monospace | 0.875rem | 400 | 1.5 |

### Iconography
- Icon library: Lucide React
- Icon size standard: 16px (sm), 20px (default), 24px (lg)
- Icon color rules: Inherit text color by default

---

## Layout Constraints

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| xs | 0.25rem (4px) | Tight spacing (icon padding, badge padding) |
| sm | 0.5rem (8px) | Compact spacing (between related items) |
| md | 1rem (16px) | Standard spacing (card padding, section gaps) |
| lg | 1.5rem (24px) | Generous spacing (section separation) |
| xl | 2rem (32px) | Maximum spacing (page-level margins) |

### Container Rules
- Container styling approach: B: Background color elevation
- Nesting depth limit: Max 2 levels
- Card inside card: Never allowed

---

## Component Constraints

### Allowed Component Library
- Primary library: Shadcn UI
- Icon library: Lucide React
- Custom components allowed: Only when library insufficient

### Component Usage Rules
| Component | Allowed | Constraints | Notes |
|-----------|---------|------------|-------|
| Button | Yes | Use library variants only | Never custom hover states |
| Card | Yes | Never nest cards inside cards | Use for content grouping |
| Badge | Yes | Always single-line | Sufficient width required |
| Modal/Dialog | Yes | Confirmation for destructive actions | Max 1 visible at a time |
| Toast | Yes | Auto-dismiss, max 3 visible | Success/error feedback |

---

## UI Structural Non-Goals

- Deep nested navigation beyond 3 levels
- Overloaded views with multiple competing primary actions
- Hidden critical actions that require discovery
- Gesture-only critical actions with no visible alternative

**Rule:** Forbidden structures must not be introduced.

---

## Platform-Agnostic Rule

- Web, mobile, and desktop must share mental structure for application management
- Platform-specific optimizations allowed for: Touch targets on mobile, keyboard shortcuts on desktop
- Platform must NOT redefine: Flow meaning, core interactions, state visibility

**Rule:** Platform must not redefine experience.

---

## Responsive Behavior

| Breakpoint | Sidebar | Navigation | Cards/Grid | Tables | Modals |
|-----------|---------|-----------|------------|--------|--------|
| Mobile | Hidden | Bottom nav / hamburger | 1 column | Horizontal scroll | Full screen |
| Tablet | Collapsible | Top bar | 2 columns | Responsive | Centered overlay |
| Desktop | Visible | Sidebar | 3+ columns | Full width | Centered overlay |

---

## Animation & Motion Constraints

- Transitions allowed: Minimal
- Duration standard: 150ms for micro-interactions, 300ms for page transitions
- Easing standard: ease-out
- prefers-reduced-motion handling: Required
- Layout-shifting animations: Never allowed on hover

---

## Dark Mode Requirements

- Dark mode support: Required
- Implementation: CSS variables + Tailwind dark: prefix
- Default theme: System preference
- User toggle: Yes

---

## Performance Constraints

- Max bundle size target: < 200KB initial JS
- Lazy loading required for: Route-level code splitting, images below fold
- Image optimization: WebP with fallback, responsive srcset
- Font loading strategy: swap
- Initial render target: < 1.5s FCP

---

## Open Questions
- Exact brand color palette pending RPBS §30 definition
- architecture-specific component constraints need further specification
