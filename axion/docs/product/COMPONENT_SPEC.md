# Component Specification

> **Level 0 — UI Truth.** This document defines every page, component, and interaction in the application. It is the authoritative source for frontend architecture and must align with RPBS §5 (User Journeys), §6 (Navigation), and §3 (Actors & Permissions).

## How to Use This Template

1. **Derive from RPBS.** Every page must map to at least one user journey in RPBS §5. Every top-level destination must match RPBS §6 (Navigation Expectations). Orphan pages (no journey) must be flagged.
2. **Fill placeholders.** Replace `{{PLACEHOLDER}}` with real component data. If unknown, write `UNKNOWN` and add to OPEN_QUESTIONS.
3. **Add or remove pages/components.** The template shows the minimum structure. Add sections per page; delete ones that don't apply.
4. **Cross-reference REBS.** Frontend technology and conventions are defined in REBS §1 (Stack Selection) and §3 (Repository Layout).
5. **Cascade order.** This document is filled after RPBS, REBS, and SCHEMA_SPEC. Entity names here must match SCHEMA_SPEC exactly.

---

## Document Info

**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Status:** Draft | Review | Approved

---

## 1) Page Inventory

List every page/route in the application. Each row maps to a navigation destination (RPBS §6).

| Page ID | Route | Page Name | Primary Journey | Auth Required | Actor(s) | Notes |
|---------|-------|-----------|----------------|---------------|----------|-------|
| PG-01 | {{ROUTE_1}} | {{PAGE_NAME_1}} | {{JOURNEY_ID_1}} | Yes/No | {{ACTORS_1}} | |
| PG-02 | {{ROUTE_2}} | {{PAGE_NAME_2}} | {{JOURNEY_ID_2}} | Yes/No | {{ACTORS_2}} | |
| PG-03 | {{ROUTE_3}} | {{PAGE_NAME_3}} | {{JOURNEY_ID_3}} | Yes/No | {{ACTORS_3}} | |

### Route Guards

| Guard | Condition | Redirect To | Notes |
|-------|-----------|-------------|-------|
| Auth required | User not authenticated | {{LOGIN_ROUTE}} | |
| Admin only | User role != admin | {{FORBIDDEN_ROUTE}} | |
| {{GUARD_1}} | {{CONDITION_1}} | {{REDIRECT_1}} | |

> **Rule:** Every journey in RPBS §5 must map to at least one page. Unmapped journeys → OPEN_QUESTION.

---

## 2) Layout Structure

### Application Shell

Define the global layout structure wrapping all pages.

| Element | Position | Visible When | Contains | Notes |
|---------|----------|-------------|----------|-------|
| Navigation bar | top / sidebar | Always / Auth only | {{NAV_CONTENTS}} | |
| Footer | bottom | Always / Some pages | {{FOOTER_CONTENTS}} | |
| {{LAYOUT_ELEMENT}} | {{POSITION}} | {{VISIBILITY}} | {{CONTENTS}} | |

### Responsive Breakpoints

| Breakpoint | Width | Layout Changes | Notes |
|-----------|-------|----------------|-------|
| Mobile | < 768px | {{MOBILE_CHANGES}} | |
| Tablet | 768px–1024px | {{TABLET_CHANGES}} | |
| Desktop | > 1024px | Default layout | |

> **Rule:** If RPBS specifies mobile as a platform target, mobile breakpoint must be fully defined (not UNKNOWN).

---

## 3) Page Specifications

One subsection per page. Define the component tree, data requirements, and interactions.

### Page: {{PAGE_NAME_1}} (PG-01)

**Route:** `{{ROUTE_1}}`
**Journey:** {{JOURNEY_ID_1}} (RPBS §5)
**Auth:** Yes/No
**Actor(s):** {{ACTORS_1}}

#### Component Tree

```
{{PAGE_NAME_1}}
├── {{COMPONENT_A}}
│   ├── {{CHILD_A1}}
│   └── {{CHILD_A2}}
├── {{COMPONENT_B}}
└── {{COMPONENT_C}}
```

#### Data Requirements

| Data | Source | Query/Endpoint | Loading State | Empty State | Error State |
|------|--------|---------------|--------------|-------------|-------------|
| {{DATA_1}} | API / Local | {{ENDPOINT_1}} | Skeleton / Spinner | {{EMPTY_MSG_1}} | {{ERROR_MSG_1}} |
| {{DATA_2}} | API / Local | {{ENDPOINT_2}} | Skeleton / Spinner | {{EMPTY_MSG_2}} | {{ERROR_MSG_2}} |

#### User Actions

| Action | Trigger | Result | Failure | Notes |
|--------|---------|--------|---------|-------|
| {{ACTION_1}} | {{TRIGGER_1}} | {{RESULT_1}} | {{FAILURE_1}} | |
| {{ACTION_2}} | {{TRIGGER_2}} | {{RESULT_2}} | {{FAILURE_2}} | |

### Page: {{PAGE_NAME_2}} (PG-02)

**Route:** `{{ROUTE_2}}`
**Journey:** {{JOURNEY_ID_2}} (RPBS §5)
**Auth:** Yes/No
**Actor(s):** {{ACTORS_2}}

#### Component Tree

```
{{PAGE_NAME_2}}
├── {{COMPONENT_A}}
└── {{COMPONENT_B}}
```

#### Data Requirements

| Data | Source | Query/Endpoint | Loading State | Empty State | Error State |
|------|--------|---------------|--------------|-------------|-------------|
| {{DATA_1}} | API / Local | {{ENDPOINT_1}} | Skeleton / Spinner | {{EMPTY_MSG_1}} | {{ERROR_MSG_1}} |

#### User Actions

| Action | Trigger | Result | Failure | Notes |
|--------|---------|--------|---------|-------|
| {{ACTION_1}} | {{TRIGGER_1}} | {{RESULT_1}} | {{FAILURE_1}} | |

> **Rule:** Repeat this subsection for every page in the Page Inventory. Every page must define at least one data requirement and one user action.

---

## 4) Shared Components

Components reused across multiple pages.

| Component | Used By Pages | Props | Variants | Notes |
|-----------|--------------|-------|----------|-------|
| {{SHARED_COMP_1}} | PG-01, PG-02 | {{PROPS_1}} | {{VARIANTS_1}} | |
| {{SHARED_COMP_2}} | PG-02, PG-03 | {{PROPS_2}} | {{VARIANTS_2}} | |

### Component: {{SHARED_COMP_1}}

**Purpose:** {{PURPOSE_1}}

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| {{PROP_1}} | {{TYPE_1}} | Yes/No | {{DEFAULT_1}} | |
| {{PROP_2}} | {{TYPE_2}} | Yes/No | {{DEFAULT_2}} | |

**States:**
- Default: {{DEFAULT_STATE}}
- Loading: {{LOADING_STATE}}
- Error: {{ERROR_STATE}}
- Empty: {{EMPTY_STATE}}

> **Rule:** Every shared component must list all pages that use it. Components used by only one page belong in that page's specification, not here.

---

## 5) Forms

List every form in the application.

| Form ID | Page | Purpose | Submit Endpoint | Validation Schema | Notes |
|---------|------|---------|----------------|------------------|-------|
| FM-01 | PG-{{X}} | {{FORM_PURPOSE_1}} | {{ENDPOINT_1}} | {{SCHEMA_REF_1}} | |
| FM-02 | PG-{{X}} | {{FORM_PURPOSE_2}} | {{ENDPOINT_2}} | {{SCHEMA_REF_2}} | |

### Form: FM-01 — {{FORM_PURPOSE_1}}

| Field | Label | Type | Required | Validation | Notes |
|-------|-------|------|----------|------------|-------|
| {{FIELD_1}} | {{LABEL_1}} | text / email / select / checkbox / textarea | Yes/No | {{VALIDATION_1}} | |
| {{FIELD_2}} | {{LABEL_2}} | text / email / select / checkbox / textarea | Yes/No | {{VALIDATION_2}} | |

**Submit Behavior:**
- Success: {{SUCCESS_BEHAVIOR}}
- Validation Error: {{VALIDATION_ERROR_BEHAVIOR}}
- Server Error: {{SERVER_ERROR_BEHAVIOR}}

> **Rule:** Every form must reference a validation schema that aligns with SCHEMA_SPEC entity definitions. Field names should match entity field names where applicable.

---

## 6) Modals and Dialogs

| Modal ID | Trigger | Purpose | Contains | Actions | Notes |
|----------|---------|---------|----------|---------|-------|
| MD-01 | {{TRIGGER_1}} | {{PURPOSE_1}} | {{CONTENT_1}} | {{ACTIONS_1}} | |
| MD-02 | {{TRIGGER_2}} | {{PURPOSE_2}} | {{CONTENT_2}} | {{ACTIONS_2}} | |

### Confirmation Dialogs

| Trigger Action | Message | Confirm Label | Cancel Label | Destructive? |
|---------------|---------|---------------|-------------|-------------|
| {{ACTION_1}} | {{MSG_1}} | {{CONFIRM_1}} | {{CANCEL_1}} | Yes/No |

> **Rule:** Destructive actions (delete, remove, cancel subscription) must always show a confirmation dialog.

---

## 7) Notifications and Feedback

### Toast/Snackbar Messages

| Event | Type | Message | Duration | Dismissable | Notes |
|-------|------|---------|----------|-------------|-------|
| {{EVENT_1}} | success / error / warning / info | {{MSG_1}} | {{DURATION_1}} | Yes/No | |
| {{EVENT_2}} | success / error / warning / info | {{MSG_2}} | {{DURATION_2}} | Yes/No | |

### Inline Feedback

| Location | Feedback Type | Trigger | Notes |
|----------|--------------|---------|-------|
| {{LOCATION_1}} | validation error / helper text / status badge | {{TRIGGER_1}} | |

> **Rule:** Error messages must be user-safe, actionable, and follow REBS §9 copywriting policy. No technical jargon.

---

## 8) State Management

### Global State

| State | Type | Initial Value | Managed By | Persisted | Notes |
|-------|------|---------------|------------|-----------|-------|
| {{STATE_1}} | {{TYPE_1}} | {{INITIAL_1}} | Context / Store / Query | Yes/No | |
| {{STATE_2}} | {{TYPE_2}} | {{INITIAL_2}} | Context / Store / Query | Yes/No | |

### Server State (API Cache)

| Query Key | Endpoint | Stale Time | Invalidated By | Notes |
|-----------|----------|-----------|----------------|-------|
| {{KEY_1}} | {{ENDPOINT_1}} | {{STALE_1}} | {{INVALIDATION_1}} | |
| {{KEY_2}} | {{ENDPOINT_2}} | {{STALE_2}} | {{INVALIDATION_2}} | |

> **Rule:** Prefer server state (query cache) over client state. Client-only state should be limited to UI concerns (modals open, sidebar collapsed, theme).

---

## 9) Accessibility Requirements

| Requirement | Standard | Implementation | Notes |
|-------------|----------|---------------|-------|
| Keyboard navigation | WCAG 2.1 AA | All interactive elements focusable | |
| Screen reader labels | WCAG 2.1 AA | aria-label on icons, semantic HTML | |
| Color contrast | WCAG 2.1 AA | 4.5:1 minimum for text | |
| Focus indicators | WCAG 2.1 AA | Visible focus rings | |
| {{A11Y_REQ_1}} | {{STANDARD_1}} | {{IMPL_1}} | |

> **Rule:** All interactive elements must be keyboard-accessible. Color must not be the only indicator of state.

---

## Journey-to-Page Mapping

Cross-reference table verifying every RPBS journey maps to pages.

| Journey ID | Journey Name | Pages | Complete? | Notes |
|-----------|-------------|-------|-----------|-------|
| J-01 | {{JOURNEY_1}} | PG-{{X}}, PG-{{Y}} | Yes/No | |
| J-02 | {{JOURNEY_2}} | PG-{{X}} | Yes/No | |

> **Rule:** Every journey in RPBS §5 must appear here with at least one page. Missing mappings → OPEN_QUESTION.

---

## OPEN_QUESTIONS

| ID | Question | Why Needed | Impact | Owner | Status |
|----|----------|------------|--------|-------|--------|
| CQ-01 | {{QUESTION_1}} | {{WHY_1}} | {{IMPACT_1}} | User/Agent | Open |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| Designer | | | |
| Product Owner | | | |
