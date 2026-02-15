# Navigation & UI Pattern Best Practices

## Navigation Patterns

### Sidebar Navigation
- **When to use**: Dashboards, admin panels, apps with 5+ top-level sections
- **Behavior**: Collapsible on desktop, overlay drawer on mobile
- **Requirements**: Active state indicator, section grouping, keyboard accessible
- **Standard width**: 240-280px expanded, 48-64px collapsed (icon-only)
- **Implementation**: Sticky position, full viewport height, z-index above content

### Top Navigation Bar
- **When to use**: Marketing sites, simple apps with 3-7 top-level pages
- **Behavior**: Sticky at top, transforms to hamburger menu on mobile (< 768px)
- **Requirements**: Logo left-aligned, primary actions right-aligned, responsive breakpoint

### Tab Navigation
- **When to use**: Related content sections within a single page context
- **Behavior**: Horizontal tabs on desktop, scrollable or stacked on mobile
- **Requirements**: Active tab indicator, ARIA tablist/tab/tabpanel roles

### Bottom Tab Bar (Mobile)
- **When to use**: Mobile apps with 3-5 primary destinations
- **Requirements**: Icon + label, active state, safe area padding on iOS
- **Standard height**: 48-56px plus safe area inset

### Breadcrumb Navigation
- **When to use**: Deep hierarchical content (e-commerce categories, file systems, docs)
- **Requirements**: Current page is not a link, separator between items, truncation for deep paths

## Layout Patterns

### Holy Grail Layout
- **Structure**: Header → (Sidebar + Main Content + Optional Right Panel) → Footer
- **CSS**: CSS Grid or Flexbox, `min-height: 100vh` on body
- **Responsive**: Sidebar collapses at tablet breakpoint, stacks at mobile

### Dashboard Layout
- **Structure**: Fixed sidebar + scrollable main content area
- **Header**: Contains search, notifications, user menu
- **Content**: Card grid or data tables with pagination
- **Responsive**: Sidebar becomes overlay drawer below 1024px

### Form Layout
- **Single column**: Default for all forms (easier to scan, works on all screens)
- **Multi-column**: Only for closely related short fields (city/state/zip)
- **Label position**: Above field (not inline or beside — better for scanning and mobile)
- **Field spacing**: Consistent vertical rhythm (16-24px between fields)
- **Actions**: Primary button right-aligned or full-width on mobile, secondary left of primary

### Card Grid Layout
- **CSS**: `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- **Gap**: 16-24px between cards
- **Card height**: Let content determine height (avoid fixed heights that cause overflow)

## Layout Systems

### Flexbox Patterns
- Use for one-dimensional layouts (rows or columns)
- Common patterns: centering, space-between, equal-height columns
- Avoid deeply nested flex containers — use grid instead

### Grid Patterns
- Use for two-dimensional layouts (rows and columns simultaneously)
- `auto-fill` + `minmax()` for responsive card grids without media queries
- Named grid areas for complex page layouts
- `subgrid` for aligned nested grids (growing browser support)

### Constraint-Based Layout
- Set `max-width` on content containers for readability (65-75ch for prose)
- Use `min-width: 0` on flex children to prevent overflow
- Use `aspect-ratio` for media containers to maintain proportions

## Responsive Breakpoints

### Standard Breakpoints
| Name | Min Width | Target |
|------|-----------|--------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops / large tablets |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### Mobile-First Approach
- Write base styles for mobile, then add complexity with `min-width` media queries
- Touch targets: minimum 44x44px (WCAG), recommended 48x48px
- Font size: minimum 16px for body text on mobile (prevents iOS zoom on focus)

## Component Patterns

### Data Tables
- **Features**: Sortable columns, pagination, row selection, search/filter
- **Responsive**: Horizontal scroll with sticky first column, or card view on mobile
- **Empty state**: Illustration + message + action button
- **Loading state**: Skeleton rows matching expected data shape

### Modal / Dialog
- **Trigger**: Button or link with clear action text (not just icons)
- **Focus**: Trap focus inside modal, return focus to trigger on close
- **Close**: X button, Escape key, and clicking backdrop
- **Size**: Small (400px) for confirmations, Medium (600px) for forms, Large (800px) for complex content
- **Mobile**: Full-screen sheet sliding up from bottom

### Toast / Notification
- **Position**: Top-right for desktop, bottom-center for mobile
- **Duration**: 3-5 seconds for success, persistent for errors requiring action
- **Types**: Success (green), Error (red), Warning (yellow), Info (blue)
- **Stacking**: Newest on top, max 3 visible, queue the rest

### Empty States
- **Required elements**: Illustration/icon, descriptive headline, helpful message, primary action
- **Tone**: Encouraging, not blaming ("No projects yet" not "You haven't created any projects")

### Loading States
- **Skeleton screens**: Preferred over spinners for content areas (matches layout, reduces perceived load time)
- **Spinners**: Only for actions (button loading, form submission)
- **Progress bars**: For operations with known duration (file uploads, multi-step processes)

## Rendering and View Architecture

### Component Architecture Patterns
- **Composition over inheritance**: Build complex UI from small, focused components
- **Props-based configuration**: Pass data and callbacks down, emit events up
- **Slots/children pattern**: Allow parent to inject content into component layout regions
- **Render props**: For components that need to share rendering logic with flexible output
- **Compound components**: Related components that work together (Tabs → Tab → TabPanel)

### Design System Consumption
- Use a shared component library for consistent UI across the application
- Override design tokens (colors, spacing, typography) not component internals
- Extend components via composition (wrapper components) not modification
- Keep custom components API-compatible with design system conventions

### Conditional Rendering Patterns
- Use ternary for two-state toggles: `{isLoading ? <Skeleton /> : <Content />}`
- Use early return for guard clauses: `if (!data) return <EmptyState />`
- Use lookup objects/maps for multi-state rendering (avoid nested ternaries)
- Extract complex conditional logic into custom hooks or helper functions

### List Rendering and Virtualization
- Use stable, unique keys for list items (database IDs, not array indices)
- Virtualize lists with > 100 items (TanStack Virtual, react-window)
- Implement pagination or "load more" for very large datasets
- Show loading indicator at the bottom when fetching more items

### Dynamic Component Loading
- Use `React.lazy` + `Suspense` for route-level code splitting
- Load heavy components on demand (rich text editor, chart library)
- Show meaningful fallback UI during component loading
- Preload components on hover/focus for perceived performance

## Business Rules in UI Layer

### Feature Visibility Rules
- Control "who sees what" via feature flags and user role/permissions
- Hide features the user cannot access (don't show disabled buttons for unauthorized actions)
- Use a central permission check utility: `canAccess(user, feature) → boolean`
- Render placeholder or upgrade CTA for features behind a paywall

### Pricing and Plan Gating
- Show feature availability based on user's plan/tier
- Provide clear upgrade path when users encounter gated features
- Use plan comparison tables to communicate value
- Never hide the existence of premium features — tease them to drive upgrades

### Permission-Aware UI States
- **Full access**: Show all controls, allow all actions
- **Read-only**: Show data but disable editing controls (with visual indication)
- **Hidden**: Don't render the feature at all (user doesn't know it exists)
- **Teaser**: Show feature preview with upgrade CTA overlay
- Check permissions at render time, not just at API call time

### Workflow Logic in UI
- **Wizards**: Multi-step flows with progress indicator, back/next navigation, step validation
- **Onboarding flows**: Progressive user setup with ability to skip/resume later
- **Approval workflows**: Show current status, pending actions, approval history
- **State machines**: Model complex UI flows (draft → review → published) explicitly

## UI Composition Patterns

### Slot and Portal Patterns
- Use React portals for rendering modals, tooltips, and dropdowns outside the DOM hierarchy
- Use children/slot patterns for flexible layout composition
- Named slots (via props): `header`, `footer`, `sidebar` for complex layout components
- Avoid deep prop drilling — use context or composition instead

### Layout Shells
- Define distinct layout shells: auth layout, public layout, dashboard layout, minimal layout
- Each shell provides consistent chrome (header, sidebar, footer) for its context
- Route-level layout selection: match routes to their appropriate shell
- Shared layout state (sidebar open/closed, theme) managed at shell level

### Content Projection
- Allow parent components to project content into child layout slots
- Use render props or children for maximum flexibility
- Maintain consistent spacing and styling regardless of projected content
- Document slot APIs clearly for component consumers

## Cross-Cutting UI Concerns

### Global Notification State
- Centralize notification/toast state in a global store or context
- Provide a single API for showing notifications: `notify({ type, message, duration })`
- Handle notification queue and stacking automatically
- Ensure notifications are accessible (aria-live regions)

### Global Modal Management
- Use a modal manager/stack to coordinate multiple modals
- Prevent background scroll when modal is open
- Only one modal visible at a time (or clearly stacked)
- Centralize modal state to avoid scattered isOpen booleans

### Global Loading Coordination
- Track loading state globally for route transitions and data fetching
- Show a top-level progress bar or loading indicator for page-level loads
- Avoid multiple independent loading spinners competing for attention
- Coordinate loading states when multiple data sources load in parallel

### Breadcrumb and Nav State
- Derive breadcrumbs from route structure automatically
- Highlight active navigation items based on current route
- Persist navigation collapse state across page navigations
- Update page title dynamically based on current route and content

### Unsaved Changes Guards
- Detect unsaved form changes and warn before navigation
- Use `beforeunload` event for browser tab close/refresh
- Use router navigation guards for in-app navigation
- Provide "Save and continue" and "Discard changes" options
- Track dirty state at the form level, not globally

## Onboarding, Help, and Learnability

### Tooltips and Coach Marks
- Use tooltips for brief explanations of UI elements (triggered on hover/focus)
- Use coach marks/spotlights for first-time feature introduction
- Show coach marks sequentially, not all at once (overwhelm)
- Allow users to dismiss and not see again (persist preference)

### Progressive Disclosure
- Show essential information first, reveal details on demand
- Use expandable sections, "Show more" links, and detail panels
- Don't hide critical actions behind progressive disclosure
- Balance information density with cognitive load

### Inline Help
- Provide contextual help text near complex form fields
- Use info icons with tooltip/popover for supplementary explanations
- Link to documentation for in-depth topics
- Keep inline help concise — one sentence maximum

### Error Education
- Turn errors into learning opportunities: explain why and how to fix
- Provide links to relevant help articles from error messages
- Track common user errors to improve UI design and reduce error frequency

### First-Time User Experience (FTUE)
- Guide new users through key features with an onboarding flow
- Allow users to skip onboarding and access it later
- Show empty states with clear calls to action for new accounts
- Track onboarding completion to identify drop-off points

### Guided Tutorials
- Implement interactive tutorials for complex features
- Use step-by-step walkthroughs with highlighted UI elements
- Allow users to exit tutorials at any point
- Provide a way to restart tutorials from settings/help menu

## Theming

### Color System
- Use semantic color tokens, not literal values (e.g., `--color-primary` not `#3b82f6`)
- Minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- Dark mode: Invert surfaces (not just colors), reduce contrast slightly to avoid eye strain
- Accent color: Use sparingly — primary actions, active states, key highlights only

### Typography Scale
- Use a modular scale (1.25 ratio recommended): 12, 14, 16, 20, 24, 30, 36, 48px
- Body text: 16px / 1.5 line-height
- Headings: Tighter line-height (1.2-1.3)
- Maximum line length: 65-75 characters for readability

### Spacing Scale
- Use a consistent 4px base grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- Component padding: 12-16px
- Section spacing: 24-48px
- Page margins: 16px mobile, 24-32px tablet, 48-64px desktop

### Icons
- Use a single icon library consistently (Lucide, Heroicons, or Phosphor)
- Size: 16px inline, 20px in buttons, 24px standalone
- Color: Inherit from text color by default
- Stroke width: 1.5-2px for consistency
