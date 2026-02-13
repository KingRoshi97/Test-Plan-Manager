# Component Library — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:COMPONENT_LIBRARY -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Prefix:** {{DOMAIN_PREFIX}}
**Type:** {{DOMAIN_TYPE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: The Component Library catalogs all reusable UI components for this domain.
It defines what components exist, their variants, props, and accessibility requirements.
This feeds directly into frontend code generation — the agent uses this to know
what components to create and how they should behave.

SOURCES TO DERIVE FROM:
1. SCREENMAP — Screen-to-Component Mapping defines which components are needed
2. UI_Constraints — visual design rules constrain component styling
3. UX_Foundations — interaction patterns define component behavior
4. RPBS §4 Core Objects — entity display patterns drive component structure

RULES:
- Component IDs use format: {{DOMAIN_PREFIX}}_CMP_NNN
- Every component listed in SCREENMAP must exist here
- Shared/reusable components vs page-specific components should be distinguished
- Props should be typed (string, number, boolean, enum, callback)
- Accessibility requirements are NOT optional for interactive components

CASCADE POSITION (fill priority 10 of 13):
- Upstream (read from): SCREENMAP (Screen-to-Component Mapping defines which components exist), UI_Constraints (visual design rules constrain styling), UX_Foundations (interaction patterns define behavior), RPBS (§4 core objects → entity display patterns)
- Downstream (feeds into): TESTPLAN (component-level tests), ERC (locked component spec at lock time), frontend code generation (component files, props, imports)
- COMPONENT_LIBRARY catalogs every reusable UI component — the agent uses it to know what to build and how components compose together
-->

> Catalog all reusable UI components owned by this domain.
> Replace `[TBD]` with concrete content. Use `UNKNOWN` only when upstream truth is missing.

---

## Component Inventory

<!-- AGENT: List all components, organized by category.
Categories: Layout, Navigation, Data Display, Input/Form, Feedback, Overlay

EXAMPLE:
| Component ID | Name | Category | Description | Reusable? | Props/Inputs |
| fe_CMP_001 | RecipeCard | Data Display | Displays a recipe summary in list/grid views | Yes | recipe: Recipe, onSave: () => void, saved: boolean |
| fe_CMP_002 | RecipeForm | Input/Form | Form for creating/editing recipes | Yes | recipe?: Recipe, onSubmit: (data) => void, isLoading: boolean |
| fe_CMP_003 | FilterPanel | Input/Form | Sidebar filter controls for recipe search | Yes | filters: FilterState, onChange: (filters) => void |
| fe_CMP_004 | IngredientEditor | Input/Form | Dynamic list editor for recipe ingredients | Yes | ingredients: Ingredient[], onChange: (items) => void |
| fe_CMP_005 | StepList | Data Display | Ordered list of recipe steps | Yes | steps: Step[], editable: boolean |
-->

| Component ID | Name | Category | Description | Reusable? | Props/Inputs |
|-------------|------|----------|-------------|----------|-------------|
| {{DOMAIN_PREFIX}}_CMP_001 | UNKNOWN | UNKNOWN | UNKNOWN | Yes/No | UNKNOWN |

---

## Component Variants

<!-- AGENT: Define visual/behavioral variants for components that have multiple modes.

EXAMPLE:
| Component ID | Variant | When to Use | Visual Difference |
| fe_CMP_001 | default | Recipe list grid view | Standard card with image, title, meta |
| fe_CMP_001 | compact | Search results, sidebar | No image, title + meta inline |
| fe_CMP_001 | featured | Homepage hero section | Larger card, prominent image, extra details |
-->

| Component ID | Variant | When to Use | Visual Difference |
|-------------|---------|-------------|-------------------|
| {{DOMAIN_PREFIX}}_CMP_001 | default | UNKNOWN | UNKNOWN |

---

## Component Composition

<!-- AGENT: How do components compose together? Define parent-child relationships.

EXAMPLE:
| Parent Component | Child Components | Composition Pattern |
| RecipeForm | IngredientEditor, StepEditor, ImageUploader, TagSelector | Vertical form sections |
| RecipeCard | Avatar, Badge, Rating | Horizontal header + vertical body |
-->

| Parent Component | Child Components | Composition Pattern |
|-----------------|-----------------|-------------------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Component Dependencies

<!-- AGENT: What external libraries or shared components does each component depend on? -->

| Component ID | Depends On | External Libraries |
|-------------|-----------|-------------------|
| {{DOMAIN_PREFIX}}_CMP_001 | UNKNOWN | UNKNOWN |

---

## Component State

<!-- AGENT: For stateful components, define what internal state they manage.

EXAMPLE:
| Component ID | Internal State | Controlled/Uncontrolled | Default |
| fe_CMP_003 | expanded: boolean | Uncontrolled | false |
| fe_CMP_002 | formValues: RecipeFormData | Controlled (via react-hook-form) | empty |
-->

| Component ID | Internal State | Controlled/Uncontrolled | Default |
|-------------|---------------|------------------------|---------|
| {{DOMAIN_PREFIX}}_CMP_001 | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Accessibility Requirements

<!-- AGENT: For every interactive component, define accessibility requirements.
These are NOT optional for components with user interaction.

EXAMPLE:
| Component ID | ARIA Role | Keyboard Nav | Screen Reader | Focus Management |
| fe_CMP_001 | article | Enter to view detail | alt text on image, title as heading | Focus outline on hover/focus |
| fe_CMP_002 | form | Tab between fields, Enter to submit | Label for every input, error announcements | Auto-focus first field on mount |
| fe_CMP_003 | complementary | Tab to expand/collapse sections | Announce filter changes | Return focus after filter change |
-->

| Component ID | ARIA Role | Keyboard Nav | Screen Reader | Focus Management |
|-------------|-----------|-------------|---------------|-----------------|
| {{DOMAIN_PREFIX}}_CMP_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Component Theming

<!-- AGENT: Define how components adapt to light/dark mode and theme variations.
This ensures the agent generates proper theme-aware styling for every component.

RULES:
- Every component that has background color, text color, or border color MUST define both light and dark variants
- Use semantic color tokens (e.g., --card, --card-foreground) not literal colors
- Components that appear on non-standard backgrounds (hero images, colored panels) need explicit contrast rules

EXAMPLE:
| Component ID | Light Mode | Dark Mode | Theme Tokens Used | Special Cases |
| fe_CMP_001 | White card, dark text | Dark card, light text | bg-card, text-card-foreground | On hero: use semi-transparent bg |
| fe_CMP_005 | Gray borders between steps | Lighter gray borders | border-border | Active step: border-primary |
-->

| Component ID | Light Mode | Dark Mode | Theme Tokens Used | Special Cases |
|-------------|-----------|----------|------------------|---------------|
| {{DOMAIN_PREFIX}}_CMP_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Animation & Transition Specs

<!-- AGENT: Define component-level animations and transitions. This tells the agent
exactly what motion to implement and prevents over-animation.

RULES:
- Transitions should be subtle — prefer 150-300ms ease durations
- Respect prefers-reduced-motion media query for all animations
- Only animate properties that don't cause layout reflow (transform, opacity)
- Entrance/exit animations for dynamically added/removed components

EXAMPLE:
| Component ID | Trigger | Property | Duration | Easing | Reduced Motion |
| fe_CMP_001 | hover | transform: scale(1.02) | 150ms | ease-out | No transform |
| fe_CMP_007 | mount | opacity: 0 → 1 | 200ms | ease-in | Instant appear |
| fe_CMP_003 | expand | max-height: 0 → auto | 250ms | ease-in-out | Instant expand |
-->

| Component ID | Trigger | Property | Duration | Easing | Reduced Motion |
|-------------|---------|----------|----------|--------|----------------|
| {{DOMAIN_PREFIX}}_CMP_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Component Sizing

<!-- AGENT: Define size constraints for components to maintain visual consistency. -->

| Component | Min Width | Max Width | Height | Responsive Behavior |
|-----------|----------|----------|--------|-------------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Open Questions
- UNKNOWN
