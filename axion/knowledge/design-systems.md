# Design System Implementation Best Practices

## Token System

### Color Tokens
- **Semantic tokens**: `--color-primary`, `--color-destructive`, `--color-success` (intent-based)
- **Brand tokens**: `--color-brand-500`, `--color-brand-600` (brand-specific shades)
- **Surface tokens**: `--color-background`, `--color-surface`, `--color-card` (layered backgrounds)
- **Text tokens**: `--color-foreground`, `--color-muted-foreground`, `--color-accent-foreground`
- **State tokens**: `--color-hover`, `--color-active`, `--color-focus-ring`
- Map semantic tokens to brand tokens (swap brand without changing components)
- Provide light/dark theme variants for all tokens

### Typography Tokens
- Font families: `--font-sans`, `--font-mono`, `--font-serif` (with full fallback stacks)
- Font sizes: use a modular scale (1.25 ratio): 12, 14, 16, 20, 24, 30, 36, 48px
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Line heights: 1.2 for headings, 1.5 for body, 1.75 for relaxed/reading
- Letter spacing: slight negative for large headings, normal for body

### Spacing Tokens
- Use a 4px base grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- Semantic spacing: `--space-xs` (4), `--space-sm` (8), `--space-md` (16), `--space-lg` (24), `--space-xl` (32)
- Component padding: consistent within and across components
- Section spacing: larger gaps between major content sections
- Maintain consistent spacing hierarchy throughout the app

### Border and Radius Tokens
- Border widths: 1px (default), 2px (emphasis), 0 (borderless)
- Border colors: `--border-default`, `--border-muted`, `--border-focus`
- Border radius: `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px), `--radius-full` (9999px)
- Keep radius small by default — avoid overly rounded elements (except pills and circles)

### Elevation/Shadow Tokens
- `--shadow-sm`: subtle surface elevation (cards, dropdowns)
- `--shadow-md`: moderate elevation (popovers, floating elements)
- `--shadow-lg`: high elevation (modals, notifications)
- Shadow color should adapt to theme (darker in light mode, lighter in dark mode)
- Use sparingly — prefer border or background differentiation

### Motion Tokens
- Duration: `--duration-fast` (100ms), `--duration-normal` (200ms), `--duration-slow` (400ms)
- Easing: `--ease-default` (ease-out for entrances), `--ease-in` (for exits), `--ease-spring` (for interactive)
- Reduce all durations to near-zero when `prefers-reduced-motion` is active
- Consistent timing creates a cohesive feel across the app

### Z-Index Tokens
- Define explicit layers: `--z-base` (0), `--z-dropdown` (50), `--z-sticky` (100), `--z-overlay` (200), `--z-modal` (300), `--z-toast` (400), `--z-tooltip` (500)
- Never use arbitrary z-index values (1000, 9999) — use tokens
- Document z-index layers so team avoids conflicts

### Light/Dark Theme Token Mapping
- Define all color tokens in both `:root` (light) and `.dark` (dark) variants
- Don't just invert colors — adjust contrast, saturation, and surface hierarchy
- Dark mode surfaces: layer from darkest (background) to lightest (card → popover → modal)
- Reduce contrast slightly in dark mode to avoid eye strain
- Test both themes with all components and color combinations

## Component Library

### Core Primitives
- **Button**: sizes (sm, md, lg, icon), variants (default, secondary, outline, ghost, destructive, link)
- **Input**: text, email, password, number, search — consistent height with buttons
- **Textarea**: resizable, with character count option
- **Select**: native or custom dropdown with search for long lists
- **Checkbox / Radio / Switch**: consistent sizing, label association, keyboard support
- **Label**: always paired with input, required indicator
- **Badge**: variants (default, secondary, destructive, outline), sizes (sm, md)

### Composite Components
- **Card**: header, content, footer — consistent padding, border, shadow
- **Dialog/Modal**: focus trap, backdrop, ESC to close, size variants
- **Sheet/Drawer**: slide-in panel for secondary content, full-screen on mobile
- **Tabs**: accessible tab list/panel pattern, keyboard navigation
- **Accordion**: single/multi expand, accessible headings and panels
- **Table**: sortable columns, pagination, row selection, responsive patterns
- **Form**: field layout, validation display, submit state management
- **Avatar**: image with fallback (initials or icon), size variants
- **Tooltip**: accessible, keyboard-triggered, delay on show
- **Popover**: click-triggered, focus management, positioning
- **Command/Combobox**: searchable command palette for actions and navigation
- **Navigation Menu**: accessible nav with submenus, mobile responsive
- **Toast/Notification**: auto-dismiss, action button, stack management

### Accessibility Built Into Components
- All components keyboard navigable by default
- ARIA roles, labels, and relationships baked in
- Focus management for interactive components (modals, menus, comboboxes)
- Screen reader announcements for dynamic content (toasts, live regions)
- Color contrast meets WCAG AA minimum in all variants and themes

### Performance in Components
- Memoize expensive renders (React.memo for pure components)
- Virtualize long lists and large tables
- Lazy-load heavy components (rich text editor, charts, maps)
- Minimize DOM depth in component trees

## Variant Management

### Variant Types
- **Size**: sm, md (default), lg — affect height, padding, font size
- **Intent/Variant**: primary, secondary, destructive, outline, ghost
- **State**: default, hover, focus, active, disabled, loading
- **Theme**: light, dark (determined by token values, not per-component logic)

### State Handling
- Hover: subtle background elevation (use token or utility class)
- Focus: visible focus ring (2px outline, offset, contrast color)
- Active (pressed): slightly more pronounced elevation
- Disabled: reduced opacity (0.5), no pointer events, aria-disabled
- Loading: spinner replaces icon or text, disabled interaction, aria-busy

### Compound Variants
- Define valid variant combinations (e.g., size=sm + variant=destructive)
- Reject invalid combinations at type level if possible
- Use CVA (class-variance-authority) or similar for clean variant composition
- Document which combinations are valid and intended

### Token-Driven Styling
- Variants reference tokens, never raw values: `bg-primary` not `bg-blue-500`
- This ensures theme changes propagate correctly
- Override only via variant props, not className overrides
- Style constants come from the token system, behavior comes from component logic

## Documentation and Usage Guidelines

### Component Documentation Format
- **Overview**: what the component is and when to use it
- **Props/API**: typed props with descriptions and defaults
- **Do/Don't**: visual examples of correct and incorrect usage
- **Accessibility notes**: keyboard behavior, ARIA requirements, screen reader behavior
- **Code examples**: common patterns with copy-pasteable snippets

### Content Guidelines
- Capitalization rules (sentence case vs. title case for labels, headings)
- Tone and voice for UI copy (action-oriented, concise, helpful)
- Empty state messaging patterns (encouraging, with call-to-action)
- Error message formatting (specific, helpful, non-blaming)

### Layout and Spacing Guidance
- Standard page layouts (dashboard, form, detail, list)
- Spacing between elements (card grid gaps, form field spacing, section margins)
- Alignment rules (left-align labels, right-align numbers, center-align actions)
- Responsive breakpoint behavior for common patterns

### Interaction Patterns
- Form submission patterns (validation timing, error display, loading states)
- Dialog/modal usage guidelines (when to use dialog vs. drawer vs. new page)
- Navigation patterns (sidebar vs. top nav, breadcrumbs, tab navigation)
- Data loading patterns (skeleton, spinner, progressive loading)

## Governance and Contribution

### Ownership Model
- Designate design system team or maintainers (code owners)
- Require approval from maintainers for all component changes
- Regular design system review meetings (monthly or quarterly)
- Shared responsibility between design and engineering

### Contribution Workflow
- RFC/proposal for new components or breaking changes
- PR template with checklist: a11y, responsive, dark mode, docs, tests
- Code review by design system maintainers
- Visual review (screenshot or Storybook link) for all visual changes

### Change Management
- Semantic versioning for component library releases
- Deprecation warnings with migration guide (minimum 2 releases lead time)
- Changelog with categorized entries (added, changed, deprecated, removed, fixed)
- Migration scripts or codemods for breaking changes where possible

### Breaking Changes Policy
- Avoid breaking changes in minor releases
- When unavoidable: provide migration guide, codemod, and deprecation period
- Support previous major version for at least 3-6 months after new release
- Communicate breaking changes clearly in release notes and team channels

## Tooling and Distribution

### Component Catalog (Storybook or Equivalent)
- Story for every component and variant combination
- Interactive controls for props exploration
- Accessibility checks integrated (a11y addon)
- Visual regression snapshots per story
- Published and accessible to all team members

### Design Tokens Syncing
- Sync tokens between design tool (Figma) and code
- Use Style Dictionary or custom pipeline for token transformation
- Generate CSS custom properties, Tailwind config, and native platform values from single source
- Automate sync on design file changes (webhook or CI)

### Package Distribution
- Publish as npm package (scoped: `@company/design-system`)
- Tree-shakeable exports (per-component imports)
- Include TypeScript types in the package
- Version and publish via CI pipeline
- Support major framework targets (React first, others as needed)

### Visual Regression Testing
- Capture screenshots for all component variants and states
- Compare against baseline on PR (flag visual changes for review)
- Include light mode, dark mode, and responsive breakpoints
- Use Chromatic, Percy, or open-source alternatives

## Consistency and Adoption

### Enforcement
- Lint rules for banned patterns (no raw color values, use tokens)
- ESLint plugin for component usage (prefer `<Button>` over `<button>`)
- CSS lint: no hardcoded pixel values for spacing (use token variables)
- PR review checklist item: "Uses design system components and tokens"

### Migration Strategy
- Audit existing codebase for custom styles that should use tokens/components
- Prioritize migration by page usage (most-viewed pages first)
- Replace incrementally (page by page or component by component)
- Track migration progress (percentage of pages using design system)

### Team Enablement
- Onboarding documentation for new developers
- Component usage examples in project docs
- Office hours for design system questions
- Slack channel or forum for design system discussion
- Regular updates on new components and changes

## Design-to-Development Handoff

### Naming Conventions
- Component names match between design tool and code
- Token names match between design tool and code
- Variant names match between design tool and code
- Eliminate ambiguity in the handoff process

### Specification Format
- Spacing: use tokens, not pixel values in specs
- Colors: reference token names, not hex values
- Typography: reference type scale tokens
- Breakpoints: reference standard breakpoint tokens
- States: explicitly specify hover, focus, disabled, loading

### Review Process
- Design review: verify designs use system components and tokens
- Engineering review: verify implementation matches design specs
- Accessibility review: verify a11y requirements are met
- Cross-browser review: verify rendering in target browsers
