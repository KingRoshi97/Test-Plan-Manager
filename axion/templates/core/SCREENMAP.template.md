# Screen Map — {{DOMAIN_NAME}}

<!-- AXION:CORE_DOC:SCREENMAP -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Prefix:** {{DOMAIN_PREFIX}}
**Type:** {{DOMAIN_TYPE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: SCREENMAP is the complete inventory of every screen/page/view in the product.
It maps screens to routes, components, data requirements, and user journeys.
This is what the agent uses to generate the frontend routing, page components, and layouts.

SOURCES TO DERIVE FROM:
1. RPBS §6 Navigation — route structure and nav items
2. RPBS §5 User Journeys — journey steps map to specific screens
3. RPBS §2 Feature Taxonomy — features live on screens
4. UX_Foundations — responsive strategy determines screen variants
5. DDES — entity details determine data displayed on each screen

RULES:
- Every screen MUST have a unique Screen ID using format: {{DOMAIN_PREFIX}}_SCR_NNN
- Every screen MUST have a route/path (even if it's a modal or nested view)
- Every RPBS §5 journey step should map to a screen
- Every RPBS §2 feature should appear on at least one screen
- Parent Screen column enables the agent to build the component tree
-->

> Map all screens, views, and navigation flows for this domain.
> Replace `[TBD]` with concrete content. Use `UNKNOWN` only when upstream truth is missing.

---

## Screen Inventory

<!-- AGENT: List every distinct screen/page/view in the product.
Include both full pages and significant sub-views (like modals, drawers, tabs).

EXAMPLE:
| Screen ID | Name | Route/Path | Purpose | Parent Screen | Auth Required? | RPBS Feature Ref |
| fe_SCR_001 | Recipe List | /recipes | Browse and search all recipes | — (top-level) | No | FEAT_001 |
| fe_SCR_002 | Recipe Detail | /recipes/:id | View a single recipe | — (top-level) | No | FEAT_002 |
| fe_SCR_003 | Create Recipe | /recipes/new | Create a new recipe | — (top-level) | Yes | FEAT_003 |
| fe_SCR_004 | Edit Recipe | /recipes/:id/edit | Edit an existing recipe | — (top-level) | Yes | FEAT_003 |
| fe_SCR_005 | User Profile | /profile/:id | View user's public profile | — (top-level) | No | FEAT_005 |
| fe_SCR_006 | Settings | /settings | User account settings | — (top-level) | Yes | FEAT_006 |
| fe_SCR_007 | Delete Confirm | — (modal) | Confirm recipe deletion | fe_SCR_002 | Yes | FEAT_003 |
-->

| Screen ID | Name | Route/Path | Purpose | Parent Screen | Auth Required? | RPBS Feature Ref |
|----------|------|-----------|---------|--------------|---------------|-----------------|
| {{DOMAIN_PREFIX}}_SCR_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Yes/No | UNKNOWN |

---

## Navigation Flows

<!-- AGENT: Map the navigation paths between screens. How does the user move from screen to screen?
This drives both the routing configuration and navigation component implementation.

EXAMPLE:
| Flow ID | Description | Steps | Entry Point | Exit Point | Trigger |
| fe_NAV_001 | Create recipe flow | List → Create → Detail | Recipe List | Recipe Detail | Click "New Recipe" button |
| fe_NAV_002 | Search and view | List → (filter) → Detail | Recipe List | Recipe Detail | Click recipe card |
-->

| Flow ID | Description | Steps | Entry Point | Exit Point | Trigger |
|---------|-------------|-------|------------|-----------|---------|
| {{DOMAIN_PREFIX}}_NAV_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Screen-to-Component Mapping

<!-- AGENT: For each screen, list the UI components it uses.
This helps the agent generate the right component imports and layout structure.

EXAMPLE:
| Screen ID | Layout Type | Components Used | Key Interactive Elements |
| fe_SCR_001 | List + Sidebar | SearchBar, RecipeCard, FilterPanel, Pagination | Search input, filter toggles, card clicks |
| fe_SCR_002 | Detail + Actions | RecipeHeader, IngredientList, StepList, ActionBar, CommentSection | Save button, share button, comment form |
| fe_SCR_003 | Form | RecipeForm, IngredientEditor, ImageUploader, StepEditor | All form inputs, submit button |
-->

| Screen ID | Layout Type | Components Used | Key Interactive Elements |
|----------|------------|----------------|------------------------|
| {{DOMAIN_PREFIX}}_SCR_001 | UNKNOWN | UNKNOWN | UNKNOWN |

---

## State Requirements Per Screen

<!-- AGENT: For each screen, what data does it need and where does it come from?
This drives TanStack Query configuration, API calls, and loading states.

EXAMPLE:
| Screen ID | Required Data | Data Source | Loading Strategy | Cache Strategy |
| fe_SCR_001 | Recipe list, filter options | GET /api/recipes | Skeleton grid | Cache 5min, invalidate on create |
| fe_SCR_002 | Single recipe, comments | GET /api/recipes/:id, GET /api/recipes/:id/comments | Skeleton detail | Cache 5min |
| fe_SCR_003 | Categories, tags | GET /api/categories, GET /api/tags | Spinner | Cache 30min |
-->

| Screen ID | Required Data | Data Source | Loading Strategy | Cache Strategy |
|----------|---------------|-----------|-----------------|---------------|
| {{DOMAIN_PREFIX}}_SCR_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Screen Wireframe Notes

<!-- AGENT: For key screens, describe the layout structure in enough detail
that the agent can generate the component layout without a visual mockup.

EXAMPLE for Recipe List screen:
- Top: Search bar (full width) with filter toggle button
- Left sidebar (desktop only): Filter panel with checkboxes for categories, tags, difficulty
- Main area: Grid of RecipeCards (3 columns desktop, 2 tablet, 1 mobile)
- Each card: Image (top), Title, Author, Rating, Cook Time
- Bottom: Pagination controls
- Empty state: Illustration + "No recipes found" + "Create your first recipe" CTA
-->

### {{SCREEN_NAME}} Layout
- UNKNOWN

---

## Open Questions
- UNKNOWN
