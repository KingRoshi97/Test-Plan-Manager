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
