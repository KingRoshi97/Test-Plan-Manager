<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:frontend -->
<!-- AXION:PREFIX:fe -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Frontend — AXION Module Template (Blank State)

**Module slug:** `frontend`  
**Prefix:** `fe`  
**Description:** UI components, pages, and user interactions

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: UNKNOWN (source: RPBS §21 Tenancy / Organization Model)
- Actors & Permission Intents: UNKNOWN (source: RPBS §3 Actors & Permission Intents)
- Core Objects impacted here: UNKNOWN (source: RPBS §4 Core Objects Glossary)
- Non-Functional Profile implications: UNKNOWN (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Privacy Controls (Deletion/Export): UNKNOWN (source: RPBS §29)
- Stack Selection Policy alignment: UNKNOWN (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:FE_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the frontend module.
"Owns" = UI components, pages, client-side routing, user interactions, form handling, client-side state.
"Does NOT own" = API contracts (contracts module), business logic (backend module), database schema (database module), auth flows (auth module).
Common mistake: claiming ownership of API response shapes or server-side validation — those belong to contracts and backend respectively. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:FE_INFORMATION_ARCH -->
## Information Architecture
<!-- AGENT: Derive from RPBS §6 Navigation and SCREENMAP for this domain.
List every route as: path → page component → purpose (e.g., /dashboard → DashboardPage → primary landing after login).
Navigation rules = which nav items appear for which roles, breadcrumb logic, deep-link support.
Common mistake: inventing routes not in SCREENMAP, or omitting auth-gated vs public distinction. -->
- Route map (path → page → purpose): [TBD]
- Navigation rules: [TBD]


<!-- AXION:SECTION:FE_COMPONENTS -->
## Component System
<!-- AGENT: Reference COMPONENT_LIBRARY core doc for the canonical component list.
Split into: shared/reusable components (buttons, modals, form fields) vs feature-specific components (e.g., InvoiceTable, UserProfileCard).
Styling/theming = design tokens, CSS approach (Tailwind, CSS modules, etc.), dark mode strategy.
Common mistake: listing every HTML element as a component — focus on meaningful, reusable abstractions. -->
- Component inventory (shared vs feature): [TBD]
- Styling/theming approach: [TBD]


<!-- AXION:SECTION:FE_UI_FLOWS -->
## Critical User Flows
<!-- AGENT: Expand RPBS §5 User Journeys into step-by-step UI flows.
Each flow = numbered steps the user takes, what they see at each step, loading/skeleton states, error states (validation, network, auth), and success confirmation.
Must include: happy path, edge cases (empty states, partial data), and error recovery.
Common mistake: only documenting the happy path — every flow needs error UX and empty states. -->
- Flow 1: [TBD] (steps, edge cases, errors)
- Flow 2: [TBD]


<!-- AXION:SECTION:FE_FORMS -->
## Forms & Validation
<!-- AGENT: List every form in the frontend (login, signup, profile edit, create entity, etc.).
For each form: reference the matching BELS validation rules — field constraints, required/optional, format patterns, min/max lengths.
Error UX = inline vs summary errors, when to validate (on blur, on submit, real-time), disabled submit until valid.
Common mistake: defining validation rules that conflict with BELS — frontend validation must mirror (not replace) backend rules. -->
- Form list: [TBD]
- Validation rules + error UX: [TBD]


<!-- AXION:SECTION:FE_A11Y -->
## Accessibility Requirements
<!-- AGENT: Derive from RPBS §18 Accessibility and UX_Foundations accessibility section.
Keyboard rules = tab order, focus traps in modals, skip links, keyboard shortcuts.
Screen reader rules = ARIA labels, live regions for dynamic content, semantic HTML requirements.
Focus management = where focus goes after modal close, route change, form submission, error.
Common mistake: listing WCAG levels without actionable rules — be specific about what each component must do. -->
- Keyboard rules: [TBD]
- Screen reader rules: [TBD]
- Focus management: [TBD]


<!-- AXION:SECTION:FE_PERF -->
## Performance Requirements
<!-- AGENT: Derive from RPBS §7 Non-Functional Profile performance targets.
Loading strategy = code splitting boundaries, lazy-loaded routes, asset optimization (images, fonts), prefetching.
Runtime performance = target LCP/FID/CLS values, bundle size budgets, re-render constraints for heavy lists.
Common mistake: stating "fast" without numbers — always include measurable targets from RPBS §7. -->
- Loading strategy (splits, assets): [TBD]
- Runtime performance constraints: [TBD]


<!-- AXION:SECTION:FE_SECURITY -->
## Frontend Security
<!-- AGENT: XSS prevention = output encoding strategy, CSP headers expected, dangerouslySetInnerHTML ban or whitelist.
CSRF = token strategy (double-submit cookie, sync token), how tokens are attached to requests.
Client storage rules = what goes in localStorage vs sessionStorage vs cookies, what must NEVER be stored client-side (tokens, PII), httpOnly/secure cookie flags.
Common mistake: assuming the framework handles all XSS — document explicit rules for user-generated content rendering. -->
- XSS/CSRF mitigation patterns: [TBD]
- Client storage rules: [TBD]


<!-- AXION:SECTION:FE_OBSERVABILITY -->
## Client Observability
<!-- AGENT: Reference RPBS §23 Analytics for event taxonomy.
Events/analytics = page views, feature usage events, conversion funnels — use structured event names (e.g., "user.signup.started").
RUM/perf = which Web Vitals to track, custom timing marks for critical flows.
Error reporting = client-side error capture (uncaught exceptions, promise rejections), source maps, breadcrumb context.
Common mistake: tracking everything — focus on events that inform product decisions or detect regressions. -->
- Events/analytics taxonomy: [TBD]
- RUM/perf metrics: [TBD]
- Error reporting: [TBD]


<!-- AXION:SECTION:FE_TESTING -->
## Frontend Testing
<!-- AGENT: Reference TESTPLAN for this domain to align test strategy.
Unit tests = which components/hooks get unit tests, mocking strategy for API calls, minimum coverage targets.
E2E critical paths = the flows from FE_UI_FLOWS that must have automated E2E coverage (login, core CRUD, payment if applicable).
Visual regression = which pages/components get snapshot tests, breakpoints to cover, acceptable diff thresholds.
Common mistake: testing implementation details instead of user behavior — prefer testing what the user sees and does. -->
- Unit tests scope: [TBD]
- E2E critical paths: [TBD]
- Visual regression scope: [TBD]


<!-- AXION:SECTION:FE_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Route map exists
- [ ] Critical flows documented with error UX
- [ ] A11y and perf requirements stated


<!-- AXION:SECTION:FE_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
